// Server only. Credentials must never be imported by a client component.
import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { ChatError, locked, readRecord, writeRecord } from "./telegram.ts";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
};
type Receipt = { hash: string; state: "pending" | "sent" | "failed" };
const hash = (text: string) => createHash("sha256").update(text).digest("hex");

export function validateInquiry(value: unknown): Inquiry {
  if (!value || typeof value !== "object")
    throw new ChatError("Please complete the form.", 400);
  const fields = value as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const [key, limit] of Object.entries({
    id: 36,
    name: 100,
    email: 254,
    subject: 140,
    message: 4000,
  })) {
    const text = fields[key];
    if (
      typeof text !== "string" ||
      !text.trim() ||
      text.length > limit ||
      /\x00/.test(text)
    ) {
      throw new ChatError(
        "Please complete all fields within the allowed length.",
        400,
      );
    }
    result[key] = text.trim();
  }
  if (
    !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(result.id) ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(result.email) ||
    /[\r\n]/.test(result.name + result.subject)
  ) {
    throw new ChatError("Please enter a valid name, email and subject.", 400);
  }
  return result as Inquiry;
}

export async function sendInquiry(value: unknown, recipient: string) {
  const inquiry = validateInquiry(value);
  const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const user = process.env.GMAIL_USER?.trim() || recipient;
  if (!password || !user || !recipient) {
    throw new ChatError(
      "Email is not available yet. Please contact Wel through the chat.",
    );
  }
  const { id, ...details } = inquiry;
  const fingerprint = hash(JSON.stringify({ ...details, recipient }));
  const key = `inquiry-${id}`;
  return locked(key, async () => {
    const receipt = await readRecord<Receipt>(key);
    if (receipt && receipt.hash !== fingerprint)
      throw new ChatError("Please submit this as a new inquiry.", 409);
    if (receipt?.state === "sent") return;
    if (receipt?.state === "pending") {
      throw new ChatError(
        "Delivery could not be confirmed. Please contact Wel through the chat before sending again.",
        409,
      );
    }
    // Shared, persistent budgets also apply across server instances. Never trust a visitor-supplied recipient.
    await locked("inquiry-budget", async () => {
      const now = Date.now();
      for (const [budgetKey, limit] of [
        ["inquiry-hour", 30],
        [`inquiry-sender-${hash(inquiry.email.toLowerCase())}`, 3],
      ] as const) {
        const saved = await readRecord<{ count: number; until: number }>(
          budgetKey,
        );
        const budget =
          saved && saved.until > now
            ? saved
            : { count: 0, until: now + 3600000 };
        if (budget.count >= limit)
          throw new ChatError(
            "Too many inquiries. Please try again later.",
            429,
          );
        await writeRecord(
          budgetKey,
          { ...budget, count: budget.count + 1 },
          3600,
        );
      }
    });
    await writeRecord(key, { hash: fingerprint, state: "pending" });
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: password },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
      dnsTimeout: 5000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    // Bound the request even if SMTP keeps the connection alive. A timed-out
    // delivery remains pending because the provider might still accept it.
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      const delivery = transport.sendMail({
        from: { name: "Wel's portfolio", address: user },
        to: recipient,
        replyTo: { name: inquiry.name, address: inquiry.email },
        subject: `[Portfolio inquiry] ${inquiry.subject}`,
        text: `Name: ${inquiry.name}\nEmail: ${inquiry.email}\n\n${inquiry.message}`,
      });
      const result = await Promise.race([
        delivery,
        new Promise<never>((_, reject) => {
          deadline = setTimeout(
            () => reject(new Error("SMTP deadline")),
            25000,
          );
        }),
      ]);
      if (!result.accepted.length) {
        await writeRecord(key, { hash: fingerprint, state: "failed" });
        throw new ChatError(
          "Your inquiry was not sent. Please try again later.",
        );
      }
      await writeRecord(key, { hash: fingerprint, state: "sent" });
    } catch (error) {
      if (error instanceof ChatError) throw error;
      const smtp = error as {
        code?: string;
        command?: string;
        responseCode?: number;
      };
      const rejected =
        smtp.code === "EAUTH" ||
        smtp.code === "EDNS" ||
        smtp.command === "CONN" ||
        (smtp.responseCode || 0) >= 400;
      if (rejected) {
        await writeRecord(key, { hash: fingerprint, state: "failed" });
        throw new ChatError(
          "Your inquiry was not sent. Please try again later or contact Wel through the chat.",
        );
      }
      // SMTP can accept mail before a connection fails. Keep pending to avoid an automatic duplicate.
      throw new ChatError(
        "Delivery could not be confirmed. Please contact Wel through the chat before sending again.",
      );
    } finally {
      clearTimeout(deadline);
      transport.close();
    }
  });
}
