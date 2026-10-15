import { acceptTelegramUpdate, validWebhookSecret } from "@/lib/telegram";

export async function POST(request: Request) {
  if (
    !validWebhookSecret(request.headers.get("x-telegram-bot-api-secret-token"))
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ error: "Invalid update" }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 65536) {
      await reader.cancel();
      return Response.json({ error: "Update too large" }, { status: 413 });
    }
    chunks.push(value);
  }
  let update;
  try {
    update = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return Response.json({ error: "Invalid update" }, { status: 400 });
  }
  if (!update || !Number.isSafeInteger(update.update_id))
    return Response.json({ error: "Invalid update" }, { status: 400 });
  try {
    await acceptTelegramUpdate(update);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Please retry delivery" }, { status: 503 });
  }
}
