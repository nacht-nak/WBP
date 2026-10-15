import { profile } from "@/data/profile";
import { sendInquiry } from "@/lib/inquiry";
import { ChatError } from "@/lib/telegram";

export const maxDuration = 60;

function reply(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const expected = new URL(request.url);
  expected.host = request.headers.get("host") || expected.host;
  if (request.headers.get("x-forwarded-proto") === "https")
    expected.protocol = "https:";
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== expected.origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return reply({ error: "Please submit from this website." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply({ error: "Expected a JSON form." }, 415);
  }
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Please complete the form." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24576) {
        await reader.cancel();
        return reply({ error: "Your inquiry is too long." }, 413);
      }
      chunks.push(value);
    }
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return reply({ error: "Please submit a valid form." }, 400);
    }
    await sendInquiry(body, profile.email);
    return reply({ success: true });
  } catch (error) {
    return reply(
      {
        error:
          error instanceof ChatError
            ? error.message
            : "Your inquiry could not be sent. Please try again later.",
      },
      error instanceof ChatError ? error.status : 503,
    );
  }
}
