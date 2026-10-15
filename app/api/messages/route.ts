import { NextRequest, NextResponse } from "next/server";
import {
  ChatError,
  processChatMessage,
  getConversation,
  newSession,
  telegramConfigured,
  validSession,
} from "@/lib/telegram";
import { generateReply } from "@/lib/groq";

export const maxDuration = 60;
const cookieName = "portfolio-chat";
function response(data: object, status = 200, token?: string, secure = false) {
  const result = NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
  if (token)
    result.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "strict",
      secure,
      path: "/",
      maxAge: 7 * 86400,
    });
  return result;
}
export async function GET(request: NextRequest) {
  try {
    const current = request.cookies.get(cookieName)?.value;
    const existing = validSession(current);
    const token = existing ? current : newSession();
    const conversation = existing ? await getConversation(token) : null;
    return response(
      {
        connected: telegramConfigured(),
        aiAvailable: !!process.env.GROQ_API_KEY,
        humanMode: !!conversation?.humanMode,
        messages: conversation?.messages || [],
      },
      200,
      existing ? undefined : token,
      request.nextUrl.protocol === "https:" ||
        request.headers.get("x-forwarded-proto") === "https",
    );
  } catch {
    return response(
      { error: "Unable to check for replies. Reconnecting shortly." },
      503,
    );
  }
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin &&
      (!URL.canParse(origin) ||
        new URL(origin).host !== request.headers.get("host")))
  ) {
    return response({ error: "Please send messages from this website." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return response({ error: "Expected a JSON message." }, 415);
  let token: string | undefined;
  const secure =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";
  try {
    const reader = request.body?.getReader();
    if (!reader) return response({ error: "Please enter a message." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        return response({ error: "Your message is too long." }, 413);
      }
      chunks.push(value);
    }
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return response({ error: "Invalid message." }, 400);
    }
    if (
      !body ||
      typeof body.content !== "string" ||
      !body.content.trim() ||
      body.content.length > 3000 ||
      typeof body.id !== "string" ||
      !/^[a-f0-9-]{36}$/.test(body.id)
    ) {
      return response(
        { error: "Enter a message of 3,000 characters or less." },
        400,
      );
    }
    const current = request.cookies.get(cookieName)?.value;
    token = validSession(current) ? current : newSession();
    const conversation = await processChatMessage(
      token,
      body.id,
      body.content.trim(),
      generateReply,
    );
    return response(
      {
        connected: telegramConfigured(),
        aiAvailable: !!process.env.GROQ_API_KEY,
        humanMode: !!conversation.humanMode,
        messages: conversation.messages,
        warning: conversation.warning,
        retryable: conversation.retryable,
        ...(conversation.failed
          ? {
              error:
                conversation.warning ||
                "Chat is temporarily unavailable. Please retry.",
            }
          : {}),
      },
      conversation.failed ? 502 : 200,
      token,
      secure,
    );
  } catch (error) {
    return response(
      {
        error:
          error instanceof ChatError
            ? error.message
            : "Message delivery is temporarily unavailable. Please try again.",
      },
      error instanceof ChatError ? error.status : 503,
      token,
      secure,
    );
  }
}

export async function DELETE(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin &&
      (!URL.canParse(origin) ||
        new URL(origin).host !== request.headers.get("host")))
  ) {
    return response(
      { error: "Please use this website to start a new chat." },
      403,
    );
  }
  return response(
    {
      messages: [],
      humanMode: false,
      connected: telegramConfigured(),
      aiAvailable: !!process.env.GROQ_API_KEY,
    },
    200,
    newSession(),
    request.nextUrl.protocol === "https:" ||
      request.headers.get("x-forwarded-proto") === "https",
  );
}
