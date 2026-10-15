// Server/worker only. Never import this module from a client component.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import https from "node:https";
import { setTimeout as delay } from "node:timers/promises";

export type LiveMessage = {
  id: string;
  role: "user" | "owner" | "assistant";
  content: string;
  createdAt: number;
  delivered: boolean;
};
type Conversation = {
  messages: LiveMessage[];
  createdAt: number;
  humanMode?: boolean;
};
export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    from?: { id: number; is_bot?: boolean };
    text?: string;
    reply_to_message?: { message_id: number };
  };
};
const retention = 7 * 24 * 60 * 60;
const idPattern = /^[a-f0-9]{64}$/;

export class ChatError extends Error {
  status: number;
  constructor(message: string, status = 503) {
    super(message);
    this.status = status;
  }
}

export function telegramConfigured() {
  return !!(
    process.env.TELEGRAM_BOT_TOKEN &&
    /^\d+$/.test(process.env.TELEGRAM_CHAT_ID || "")
  );
}
export function telegramScope() {
  const prefix = (process.env.TELEGRAM_BOT_TOKEN || "").split(":")[0];
  return /^\d+$/.test(prefix) ? prefix : "test";
}
export function newSession() {
  return randomBytes(32).toString("hex");
}
export function validSession(value: string | undefined): value is string {
  return !!value && idPattern.test(value);
}
function sessionKey(token: string) {
  if (!validSession(token)) throw new ChatError("Invalid conversation.", 400);
  return `session-${createHash("sha256").update(token).digest("hex")}`;
}
function redisConfigured() {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
function directory() {
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  ) {
    throw new ChatError(
      "Messaging is temporarily unavailable. Please try again later.",
    );
  }
  return path.resolve(
    /* turbopackIgnore: true */ process.env.CHAT_DATA_DIR || ".data/chat",
  );
}
function redisKey(key: string) {
  return `${process.env.CHAT_REDIS_PREFIX || "portfolio:chat"}:${key}`;
}
async function redis(command: (string | number)[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || new URL(url).protocol !== "https:")
    throw new ChatError("Message storage unavailable.");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new ChatError("Message storage unavailable.");
  const data = await response.json();
  if (data.error) throw new ChatError("Message storage unavailable.");
  return data.result;
}
export async function readRecord<T>(key: string): Promise<T | null> {
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) throw new Error("Invalid storage key");
  if (redisConfigured()) {
    const value = await redis(["GET", redisKey(key)]);
    return value ? (JSON.parse(value) as T) : null;
  }
  try {
    const record = JSON.parse(
      await readFile(path.join(directory(), `${key}.json`), "utf8"),
    );
    return record.expiresAt > Date.now() ? (record.value as T) : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export async function writeRecord(
  key: string,
  value: unknown,
  ttl = retention,
) {
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) throw new Error("Invalid storage key");
  if (redisConfigured()) {
    await redis(["SET", redisKey(key), JSON.stringify(value), "EX", ttl]);
    return;
  }
  const folder = directory();
  await mkdir(folder, { recursive: true });
  const file = path.join(folder, `${key}.json`);
  const temp = `${file}.${randomBytes(8).toString("hex")}.tmp`;
  await writeFile(
    temp,
    JSON.stringify({ value, expiresAt: Date.now() + ttl * 1000 }),
    { mode: 0o600 },
  );
  // Windows can briefly deny replacement while a polling reader has the file open.
  // Keep the atomic rename, and give that reader time to release its handle.
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(temp, file);
      break;
    } catch (error) {
      if (
        process.platform !== "win32" ||
        attempt >= 5 ||
        !["EPERM", "EACCES", "EBUSY"].includes(
          (error as NodeJS.ErrnoException).code || "",
        )
      )
        throw error;
      await delay(20 * (attempt + 1));
    }
  }
}
export async function locked<T>(key: string, action: () => Promise<T>): Promise<T> {
  const lockId = randomBytes(16).toString("hex");
  const useRedis = redisConfigured();
  const folder = useRedis ? "" : directory();
  const lockPath = path.join(folder, `${key}.lock`);
  if (!useRedis) await mkdir(folder, { recursive: true });
  for (let attempt = 0; ; attempt++) {
    let acquired = false;
    if (useRedis) {
      acquired =
        (await redis([
          "SET",
          redisKey(`lock-${key}`),
          lockId,
          "NX",
          "PX",
          60000,
        ])) === "OK";
    } else {
      try {
        await mkdir(lockPath);
        acquired = true;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        // A crashed process can leave an empty lock; operations time out well before this lease.
        try {
          if (Date.now() - (await stat(lockPath)).mtimeMs > 60000)
            await rm(lockPath, { recursive: true });
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        }
      }
    }
    if (acquired) break;
    if (attempt >= 40)
      throw new ChatError(
        "A message is still being processed. Please try again shortly.",
        409,
      );
    await delay(100);
  }
  try {
    return await action();
  } finally {
    if (useRedis)
      await redis([
        "EVAL",
        "if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",
        1,
        redisKey(`lock-${key}`),
        lockId,
      ]);
    else await rm(lockPath, { recursive: true });
  }
}

// Never propagate Telegram's URL or raw provider errors: the URL contains the bot token.
export async function telegramCall<T>(
  method: string,
  body: object = {},
  timeout = 15000,
): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new ChatError("Direct messaging is not configured yet.");
  for (let attempt = 0; ; attempt++) {
    let connectionEstablished = false;
    let connectTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      // Explicit IPv4 also works on hosts where fetch's automatic address selection stalls.
      const response = await new Promise<{ status: number; body: string }>(
        (resolve, reject) => {
          const request = https.request(
            `https://api.telegram.org/bot${token}/${method}`,
            {
              method: "POST",
              family: 4,
              headers: { "Content-Type": "application/json" },
              signal: AbortSignal.timeout(timeout),
            },
            (incoming) => {
              connectionEstablished = true;
              clearTimeout(connectTimer);
              const chunks: Buffer[] = [];
              let size = 0;
              incoming.on("data", (chunk: Buffer) => {
                size += chunk.length;
                if (size > 1024 * 1024) {
                  request.destroy(new Error("Response too large"));
                  return;
                }
                chunks.push(chunk);
              });
              incoming.on("error", reject);
              incoming.on("end", () =>
                resolve({
                  status: incoming.statusCode || 502,
                  body: Buffer.concat(chunks).toString("utf8"),
                }),
              );
            },
          );
          request.on("socket", (socket) => {
            if (request.reusedSocket) {
              connectionEstablished = true;
              return;
            }
            connectTimer = setTimeout(
              () => {
                request.destroy(new Error("Telegram connection timed out"));
              },
              Math.min(5000, timeout),
            );
            socket.once("secureConnect", () => {
              connectionEstablished = true;
              clearTimeout(connectTimer);
            });
          });
          request.on("error", reject);
          request.end(JSON.stringify(body));
        },
      );
      const data = JSON.parse(response.body);
      if (response.status < 200 || response.status >= 300 || !data.ok) {
        throw new ChatError(
          response.status === 401
            ? "Telegram rejected the bot token. Check TELEGRAM_BOT_TOKEN."
            : response.status === 409
              ? "Another Telegram listener or webhook is active. Run only one reply worker."
              : response.status === 429
                ? "Messaging is busy. Please try again in a minute."
                : `Telegram ${method} failed. Please try again shortly.`,
          response.status === 429 ? 429 : 502,
        );
      }
      return data.result as T;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      // A failed TLS connection cannot have delivered an HTTP request. Retry only
      // that case; once connected, sendMessage failures can be ambiguous.
      if (!connectionEstablished && attempt === 0) continue;
      throw new ChatError(
        method === "sendMessage"
          ? "Could not confirm Telegram delivery. Retrying may send a duplicate message."
          : `Could not connect to Telegram (${method}). Check your internet connection and try again.`,
        504,
      );
    } finally {
      clearTimeout(connectTimer);
    }
  }
}

export async function getConversation(token: string) {
  return await readRecord<Conversation>(sessionKey(token));
}

export async function deliverMessage(
  token: string,
  id: string,
  content: string,
): Promise<Conversation> {
  if (!telegramConfigured())
    throw new ChatError(
      "Direct messaging is not connected yet. Please use the AI assistant for now.",
    );
  await storeVisitor(token, id, content);
  return forwardVisitor(token, id);
}

async function storeVisitor(token: string, id: string, content: string) {
  const key = sessionKey(token);
  return locked(key, async () => {
    const conversation = (await readRecord<Conversation>(key)) || {
      messages: [],
      createdAt: Date.now(),
    };
    const existing = conversation.messages.find((message) => message.id === id);
    if (existing && existing.content !== content)
      throw new ChatError("Please send this as a new message.", 409);
    const now = Date.now();
    if (
      !existing &&
      conversation.messages.filter(
        (m) => m.role === "user" && now - m.createdAt < 60000,
      ).length >= 10
    ) {
      throw new ChatError(
        "Please wait a minute before sending more messages.",
        429,
      );
    }
    await locked("send-budget", async () => {
      const budget = await readRecord<{ start: number; count: number }>(
        "send-budget",
      );
      const current =
        budget && now - budget.start < 60000
          ? budget
          : { start: now, count: 0 };
      if (current.count >= 60)
        throw new ChatError(
          "Messaging is busy. Please try again in a minute.",
          429,
        );
      await writeRecord(
        "send-budget",
        { ...current, count: current.count + 1 },
        120,
      );
    });
    if (existing) return conversation;
    // Persist first: the browser can recover its conversation after a lost response.
    const message: LiveMessage = {
      id,
      role: "user",
      content,
      createdAt: now,
      delivered: false,
    };
    conversation.messages.push(message);
    conversation.messages = conversation.messages.slice(-100);
    await writeRecord(key, conversation);
    return conversation;
  });
}

async function forwardVisitor(token: string, id: string) {
  const key = sessionKey(token);
  // Serialize deliveries separately: network waits must not block AI or owner replies.
  return locked(`delivery-${key}`, async () => {
    const conversation = await readRecord<Conversation>(key);
    const message = conversation?.messages.find(
      (m) => m.id === id && m.role === "user",
    );
    if (!conversation || !message)
      throw new ChatError(
        "Conversation expired. Please start a new chat.",
        410,
      );
    if (message.delivered) return conversation;
    const sent = await telegramCall<{ message_id: number }>("sendMessage", {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: `Client · ${key.slice(-8)}\n\n${message.content}\n\n`,
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Reply to this website visitor",
      },
      link_preview_options: { is_disabled: true },
    });
    // Only server-side mappings route replies; visitor-provided text cannot choose a conversation.
    await writeRecord(`telegram-${telegramScope()}-${sent.message_id}`, {
      key,
    });
    return locked(key, async () => {
      const latest = await readRecord<Conversation>(key);
      if (!latest) throw new ChatError("Conversation expired.", 410);
      const delivered = latest.messages.find((m) => m.id === id);
      if (delivered) delivered.delivered = true;
      await writeRecord(key, latest);
      return latest;
    });
  });
}

export async function processChatMessage(
  token: string,
  id: string,
  content: string,
  generate: (
    messages: { role: "user" | "assistant"; content: string }[],
  ) => Promise<string>,
) {
  const key = sessionKey(token);
  // Serialize browser sends without holding the conversation lock during AI generation.
  // Telegram replies can therefore switch to human mode while the AI is still working.
  return locked(`turn-${key}`, async () => {
    const conversation = await storeVisitor(token, id, content);
    const hasAI = conversation.messages.some((m) => m.id === `ai-${id}`);
    const shouldGenerate = !conversation.humanMode && !hasAI;
    const telegramTask = telegramConfigured()
      ? forwardVisitor(token, id)
      : Promise.resolve(null);
    const aiTask = shouldGenerate
      ? generate(
          conversation.messages.map((m) => ({
            role:
              m.role === "user" ? ("user" as const) : ("assistant" as const),
            content: m.role === "owner" ? `Welquim: ${m.content}` : m.content,
          })),
        ).then((answer) =>
          locked(key, async () => {
            const latest = await readRecord<Conversation>(key);
            if (!latest) throw new ChatError("Conversation expired.", 410);
            if (
              !latest.humanMode &&
              !latest.messages.some((m) => m.id === `ai-${id}`)
            ) {
              latest.messages.push({
                id: `ai-${id}`,
                role: "assistant",
                content: answer.slice(0, 4000),
                createdAt: Date.now(),
                delivered: true,
              });
              latest.messages = latest.messages.slice(-100);
              await writeRecord(key, latest);
            }
          }),
        )
      : Promise.resolve(null);
    const [telegramResult, aiResult] = await Promise.allSettled([
      telegramTask,
      aiTask,
    ]);
    return locked(key, async () => {
      const latest = await readRecord<Conversation>(key);
      if (!latest)
        throw new ChatError(
          "Conversation expired. Please start a new chat.",
          410,
        );
      const delivered = latest.messages.some((m) => m.id === id && m.delivered);
      const answered =
        latest.messages.some((m) => m.id === `ai-${id}`) || !!latest.humanMode;
      const warnings: string[] = [];
      if (telegramResult.status === "rejected")
        warnings.push("Your message has not been confirmed in Telegram.");
      if (aiResult.status === "rejected" && !latest.humanMode)
        warnings.push("The AI could not reply this time.");
      if (!telegramConfigured() && latest.humanMode)
        warnings.push(
          "Personal messaging is unavailable. Start a new chat to use the AI assistant.",
        );
      return {
        ...latest,
        warning: warnings.join(" "),
        retryable: warnings.length > 0,
        failed: !delivered && !answered,
      };
    });
  });
}

export function validWebhookSecret(value: string | null) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !value) return false;
  const a = Buffer.from(value),
    b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function acceptTelegramUpdate(update: TelegramUpdate) {
  const message = update.message;
  const owner = process.env.TELEGRAM_CHAT_ID;
  if (
    !owner ||
    !Number.isSafeInteger(update.update_id) ||
    !message ||
    message.chat.type !== "private" ||
    String(message.chat.id) !== owner ||
    String(message.from?.id) !== owner ||
    message.from?.is_bot
  )
    return;
  const replyTo = message.reply_to_message?.message_id;
  if (!replyTo || typeof message.text !== "string" || !message.text.trim())
    return;
  const target = await readRecord<{ key: string }>(
    `telegram-${telegramScope()}-${replyTo}`,
  );
  if (!target || !/^session-[a-f0-9]{64}$/.test(target.key)) return;
  await locked(target.key, async () => {
    const conversation = await readRecord<Conversation>(target.key);
    if (!conversation) return;
    const id = `telegram-${update.update_id}`;
    if (conversation.messages.some((m) => m.id === id)) return;
    conversation.humanMode = true;
    conversation.messages.push({
      id,
      role: "owner",
      content: message.text!.trim().slice(0, 4000),
      createdAt: Date.now(),
      delivered: true,
    });
    conversation.messages = conversation.messages.slice(-100);
    await writeRecord(target.key, conversation);
  });
}
