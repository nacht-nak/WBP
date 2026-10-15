import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import https from "node:https";
import { PassThrough, Writable } from "node:stream";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import {
  newSession,
  deliverMessage,
  getConversation,
  acceptTelegramUpdate,
  validWebhookSecret,
  writeRecord,
  readRecord,
  processChatMessage,
  telegramCall,
} from "../lib/telegram.ts";

let directory;
let requests;
let status;
beforeEach(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-chat-test-"));
  process.env.CHAT_DATA_DIR = directory;
  process.env.TELEGRAM_BOT_TOKEN = "test-only-token";
  process.env.TELEGRAM_CHAT_ID = "12345";
  process.env.TELEGRAM_WEBHOOK_SECRET = "test-only-webhook-secret";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  requests = [];
  status = 200;
  mock.method(https, "request", (_url, _options, callback) => {
    const body = [];
    return new Writable({
      write(chunk, _encoding, done) {
        body.push(chunk);
        done();
      },
      final(done) {
        requests.push(JSON.parse(Buffer.concat(body).toString()));
        const incoming = new PassThrough();
        incoming.statusCode = status;
        callback(incoming);
        incoming.end(
          JSON.stringify({
            ok: status === 200,
            result: { message_id: requests.length },
          }),
        );
        done();
      },
    });
  });
});
afterEach(async () => {
  mock.restoreAll();
  assert.ok(
    path
      .resolve(directory)
      .startsWith(path.join(os.tmpdir(), "portfolio-chat-test-")),
  );
  await rm(directory, { recursive: true, force: true });
});
function update(replyTo, text, id = 100, owner = 12345) {
  return {
    update_id: id,
    message: {
      message_id: id,
      chat: { id: owner, type: "private" },
      from: { id: owner },
      text,
      reply_to_message: { message_id: replyTo },
    },
  };
}

test("Telegram replies reach only their matching visitor and survive duplicate delivery", async () => {
  const alice = newSession(),
    bob = newSession();
  await deliverMessage(alice, randomUUID(), "Alice's project");
  await deliverMessage(bob, randomUUID(), "Bob's project");
  assert.equal(requests[0].chat_id, "12345");
  assert.equal(requests[0].reply_markup.force_reply, true);
  assert.ok(!requests[0].text.includes(alice));
  await acceptTelegramUpdate(update(1, "Hello Alice"));
  await acceptTelegramUpdate(update(1, "Hello Alice"));
  assert.deepEqual(
    (await getConversation(alice)).messages.map((m) => m.content),
    ["Alice's project", "Hello Alice"],
  );
  assert.deepEqual(
    (await getConversation(bob)).messages.map((m) => m.content),
    ["Bob's project"],
  );
  assert.equal(await getConversation(newSession()), null);
});
test("unauthorized senders, groups, and unmapped replies cannot write to conversations", async () => {
  const session = newSession();
  await deliverMessage(session, randomUUID(), "Hello");
  await acceptTelegramUpdate(update(1, "intruder", 1, 999));
  await acceptTelegramUpdate(update(9999, "unmapped", 2));
  const group = update(1, "group", 3);
  group.message.chat.type = "group";
  await acceptTelegramUpdate(group);
  const forged = update(1, "wrong sender", 4);
  forged.message.from.id = 999;
  await acceptTelegramUpdate(forged);
  assert.equal((await getConversation(session)).messages.length, 1);
});
test("retried browser POSTs send once, including concurrent requests", async () => {
  const session = newSession(),
    id = randomUUID();
  await Promise.all([
    deliverMessage(session, id, "Hello"),
    deliverMessage(session, id, "Hello"),
  ]);
  assert.equal(requests.length, 1);
  assert.equal((await getConversation(session)).messages.length, 1);
  await assert.rejects(deliverMessage(session, id, "Different message"), {
    status: 409,
  });
});
test("failed Telegram delivery is never marked delivered and can be retried", async () => {
  const session = newSession(),
    id = randomUUID();
  status = 502;
  await assert.rejects(deliverMessage(session, id, "Hello"), { status: 502 });
  assert.equal((await getConversation(session)).messages[0].delivered, false);
  status = 200;
  await deliverMessage(session, id, "Hello");
  const stored = await getConversation(session);
  assert.equal(stored.messages.length, 1);
  assert.equal(stored.messages[0].delivered, true);
});
test("per-session flood limit stops additional Telegram sends", async () => {
  const session = newSession();
  for (let i = 0; i < 10; i++)
    await deliverMessage(session, randomUUID(), `Message ${i}`);
  await assert.rejects(deliverMessage(session, randomUUID(), "Too many"), {
    status: 429,
  });
  assert.equal(requests.length, 10);
});
test("webhooks require the exact secret and expired records are unavailable", async () => {
  assert.equal(validWebhookSecret(null), false);
  assert.equal(validWebhookSecret("wrong"), false);
  assert.equal(validWebhookSecret("test-only-webhook-secret"), true);
  await writeRecord("expired", { text: "old" }, -1);
  assert.equal(await readRecord("expired"), null);
});

test("one conversation contains the AI answer and Telegram reply, then pauses AI", async () => {
  const session = newSession();
  let calls = 0;
  const generate = async () => {
    calls++;
    return "AI portfolio answer";
  };
  const first = await processChatMessage(
    session,
    randomUUID(),
    "What do you build?",
    generate,
  );
  assert.equal(first.messages[0].delivered, true);
  assert.equal(first.messages[1].role, "assistant");
  await acceptTelegramUpdate(update(1, "Welquim here"));
  const second = await processChatMessage(
    session,
    randomUUID(),
    "Thanks",
    generate,
  );
  assert.equal(calls, 1);
  assert.equal(second.humanMode, true);
  assert.deepEqual(
    second.messages.map((m) => m.role),
    ["user", "assistant", "owner", "user"],
  );
});

test("AI still answers when Telegram is unconfigured or fails", async () => {
  delete process.env.TELEGRAM_CHAT_ID;
  const offline = await processChatMessage(
    newSession(),
    randomUUID(),
    "Hello",
    async () => "AI works",
  );
  assert.equal(offline.failed, false);
  assert.equal(offline.messages[0].delivered, false);
  assert.equal(offline.messages[1].content, "AI works");
  assert.equal(requests.length, 0);
  process.env.TELEGRAM_CHAT_ID = "12345";
  status = 502;
  const failed = await processChatMessage(
    newSession(),
    randomUUID(),
    "Hello",
    async () => "Still works",
  );
  assert.equal(failed.failed, false);
  assert.match(failed.warning, /Telegram/);
  assert.equal(failed.messages[1].content, "Still works");
});

test("AI failure preserves Telegram delivery and retry never resends the delivered message", async () => {
  const session = newSession(),
    id = randomUUID();
  const failed = await processChatMessage(session, id, "Hello", async () => {
    throw Error("AI unavailable");
  });
  assert.equal(failed.failed, false);
  assert.equal(failed.messages[0].delivered, true);
  assert.equal(failed.retryable, true);
  await processChatMessage(session, id, "Hello", async () => "Recovered");
  assert.equal(requests.length, 1);
  assert.deepEqual(
    (await getConversation(session)).messages.map((m) => m.role),
    ["user", "assistant"],
  );
});

test("an owner reply during AI generation prevents a late AI answer", async () => {
  const session = newSession();
  let finishAI;
  const ai = new Promise((resolve) => {
    finishAI = resolve;
  });
  const turn = processChatMessage(session, randomUUID(), "Hello", () => ai);
  for (let i = 0; i < 100; i++) {
    if ((await getConversation(session))?.messages[0]?.delivered) break;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  await acceptTelegramUpdate(update(1, "I can help you"));
  finishAI("Late AI answer");
  const result = await turn;
  assert.equal(result.humanMode, true);
  assert.deepEqual(
    result.messages.map((m) => m.role),
    ["user", "owner"],
  );
});

test("successful combined turn retries reuse both the Telegram delivery and AI answer", async () => {
  const session = newSession(),
    id = randomUUID();
  let calls = 0;
  const generate = async () => {
    calls++;
    return "Answer";
  };
  await processChatMessage(session, id, "Hello", generate);
  await processChatMessage(session, id, "Hello", generate);
  assert.equal(calls, 1);
  assert.equal(requests.length, 1);
});

test("slow Telegram delivery does not delay saving AI or accepting an owner reply", async () => {
  const session = newSession();
  await deliverMessage(session, randomUUID(), "Earlier message");
  const original = https.request;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  mock.method(https, "request", (url, options, callback) =>
    original(url, options, (incoming) => {
      void gate.then(() => callback(incoming));
    }),
  );
  const id = randomUUID();
  let finished = false;
  const turn = processChatMessage(
    session,
    id,
    "Another question",
    async () => "Fast AI answer",
  ).then((result) => {
    finished = true;
    return result;
  });
  try {
    for (let i = 0; i < 100; i++) {
      if (
        (await getConversation(session))?.messages.some(
          (m) => m.id === `ai-${id}`,
        )
      )
        break;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const partial = await getConversation(session);
    assert.equal(finished, false);
    assert.ok(partial.messages.some((m) => m.content === "Fast AI answer"));
    assert.equal(partial.messages.find((m) => m.id === id).delivered, false);
    await acceptTelegramUpdate(update(1, "Personal reply during delivery"));
    assert.equal((await getConversation(session)).humanMode, true);
  } finally {
    release();
    await turn;
  }
  const result = await getConversation(session);
  assert.equal(result.messages.find((m) => m.id === id).delivered, true);
  assert.ok(
    result.messages.some((m) => m.content === "Personal reply during delivery"),
  );
  assert.ok(result.messages.some((m) => m.content === "Fast AI answer"));
});

test("Telegram retries a failed connection before TLS, but never retries an uncertain send", async () => {
  const original = https.request;
  let calls = 0;
  let established = false;
  mock.method(https, "request", (url, options, callback) => {
    calls++;
    if (calls === 2 && !established) return original(url, options, callback);
    const request = new Writable({
      write(_chunk, _encoding, done) {
        done();
      },
    });
    queueMicrotask(() => {
      const socket = new EventEmitter();
      request.emit("socket", socket);
      if (established) socket.emit("secureConnect");
      request.destroy(new Error("Connection reset"));
    });
    return request;
  });
  await telegramCall("sendMessage", { text: "Test" });
  assert.equal(calls, 2);
  calls = 0;
  established = true;
  await assert.rejects(
    telegramCall("sendMessage", { text: "Test" }),
    /Retrying may send a duplicate/,
  );
  assert.equal(calls, 1);
});
