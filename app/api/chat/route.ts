import { generateReply } from "@/lib/groq";

export const maxDuration = 30;

type Message = { role: "user" | "assistant"; content: string };
const MAX_BODY_BYTES = 32_768;
// A bounded, per-process budget; use a shared gateway limit for multi-instance hosting.
let budget = { startsAt: 0, requests: 0 };

function reply(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  // Next may normalize request.url to localhost; Host retains the browser's host.
  const expectedOrigin = new URL(request.url);
  expectedOrigin.host = request.headers.get("host") || expectedOrigin.host;
  if (request.headers.get("x-forwarded-proto") === "https") {
    expectedOrigin.protocol = "https:";
  }
  if (origin && origin !== expectedOrigin.origin) {
    return reply({ error: "Please send messages from this website." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply({ error: "Expected a JSON message." }, 415);
  }

  let messages: Message[];
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Please enter a message." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return reply(
          { error: "This conversation is too long. Start a new chat." },
          413,
        );
      }
      chunks.push(value);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (
      !body ||
      !Array.isArray(body.messages) ||
      body.messages.length < 1 ||
      body.messages.length > 20 ||
      !body.messages.every(
        (message: Message, index: number) =>
          message &&
          message.role === (index % 2 === 0 ? "user" : "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0 &&
          message.content.length <= 4000,
      ) ||
      body.messages.at(-1).role !== "user"
    ) {
      return reply(
        {
          error:
            "Please send a valid conversation with a message of 4,000 characters or less.",
        },
        400,
      );
    }
    messages = body.messages.map(({ role, content }: Message) => ({
      role,
      content: content.trim(),
    }));
  } catch {
    return reply(
      { error: "Could not read your message. Please try again." },
      400,
    );
  }

  const key = process.env.GROQ_API_KEY;
  if (!key)
    return reply(
      {
        error: "Chat is not configured yet. Please visit the contact section.",
      },
      503,
    );
  const now = Date.now();
  if (now - budget.startsAt >= 60_000) budget = { startsAt: now, requests: 0 };
  if (budget.requests >= 30) {
    return reply(
      { error: "Chat is busy. Please wait a minute and try again." },
      429,
    );
  }
  budget.requests++;

  try {
    return reply({ message: await generateReply(messages) });
  } catch {
    return reply(
      { error: "The assistant could not connect. Please try again shortly." },
      502,
    );
  }
}
