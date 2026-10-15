import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { sendInquiry, validateInquiry } from "../lib/inquiry.ts";

const recipient = "owner@example.com";
const form = () => ({
  id: randomUUID(),
  name: "Visitor",
  email: "visitor@example.com",
  subject: "Project",
  message: "Please contact me.",
  to: "attacker@example.com",
});
let directory, messages, failure;
beforeEach(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-inquiry-"));
  process.env.CHAT_DATA_DIR = directory;
  process.env.GMAIL_APP_PASSWORD = "test-password";
  delete process.env.GMAIL_USER;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  messages = [];
  failure = null;
  mock.method(nodemailer, "createTransport", () => ({
    async sendMail(message) {
      messages.push(message);
      if (failure) throw failure;
      return { accepted: [recipient] };
    },
    close() {},
  }));
});
afterEach(async () => {
  mock.restoreAll();
  await rm(directory, { recursive: true, force: true });
});

test("recipient stays fixed; replying reaches the visitor; concurrent retry sends once", async () => {
  const inquiry = form();
  await Promise.all([
    sendInquiry(inquiry, recipient),
    sendInquiry(inquiry, recipient),
  ]);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to, recipient);
  assert.equal(messages[0].from.address, recipient);
  assert.equal(messages[0].replyTo.address, inquiry.email);
  await assert.rejects(
    sendInquiry({ ...inquiry, message: "Changed" }, recipient),
    { status: 409 },
  );
});

test("missing credentials do not claim delivery", async () => {
  delete process.env.GMAIL_APP_PASSWORD;
  await assert.rejects(sendInquiry(form(), recipient), { status: 503 });
  assert.equal(messages.length, 0);
});

test("rejects malformed, empty, oversized and header-injection input", () => {
  for (const value of [
    null,
    {},
    { ...form(), email: "invalid" },
    { ...form(), message: " " },
    { ...form(), message: "x".repeat(4001) },
    { ...form(), subject: "Hello\r\nBcc: anyone@example.com" },
  ]) {
    assert.throws(() => validateInquiry(value), { status: 400 });
  }
});

test("rejected SMTP requests preserve retry and hide provider errors", async () => {
  const inquiry = form();
  failure = Object.assign(new Error("secret provider details"), {
    code: "EAUTH",
  });
  await assert.rejects(
    sendInquiry(inquiry, recipient),
    (error) => error.status === 503 && !error.message.includes("secret"),
  );
  failure = null;
  await sendInquiry(inquiry, recipient);
  assert.equal(messages.length, 2);
});

test("uncertain SMTP deliveries are not automatically resent", async () => {
  const inquiry = form();
  failure = new Error("Connection lost after DATA");
  await assert.rejects(
    sendInquiry(inquiry, recipient),
    /could not be confirmed/,
  );
  failure = null;
  await assert.rejects(sendInquiry(inquiry, recipient), { status: 409 });
  assert.equal(messages.length, 1);
});

test("shared rate limit caps each sender at three inquiries per hour", async () => {
  for (let i = 0; i < 3; i++) await sendInquiry(form(), recipient);
  await assert.rejects(sendInquiry(form(), recipient), { status: 429 });
  assert.equal(messages.length, 3);
});
