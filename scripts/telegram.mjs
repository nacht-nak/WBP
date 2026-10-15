import nextEnv from "@next/env";
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
nextEnv.loadEnvConfig(process.cwd());
const {
  telegramCall,
  acceptTelegramUpdate,
  readRecord,
  writeRecord,
  telegramConfigured,
  telegramScope,
} = await import("../lib/telegram.ts");

function claimWorker() {
  const lock = path.resolve(".data/telegram-poll.pid");
  mkdirSync(path.dirname(lock), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      writeFileSync(lock, String(process.pid), { flag: "wx" });
      process.once("exit", () => {
        try {
          if (readFileSync(lock, "utf8") === String(process.pid))
            unlinkSync(lock);
        } catch {
          /* A killed worker may leave its PID for recovery on restart. */
        }
      });
      process.once("SIGINT", () => process.exit(0));
      process.once("SIGTERM", () => process.exit(0));
      return true;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const existing = Number(readFileSync(lock, "utf8"));
      if (!Number.isSafeInteger(existing) || existing <= 0)
        throw new Error(
          "The Telegram listener is starting. Try again shortly.",
        );
      try {
        process.kill(existing, 0);
        console.log(
          "A Telegram reply listener is already running for this project.",
        );
        return false;
      } catch (failure) {
        if (failure.code !== "ESRCH") throw failure;
        unlinkSync(lock);
      }
    }
  }
  throw new Error("Could not start the Telegram listener. Please retry.");
}

async function check(method) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await telegramCall(method);
    } catch (error) {
      if (error.status !== 504 || (attempt >= 2 && process.argv[2] !== "poll"))
        throw error;
      console.log(`Telegram connection timed out; retrying ${method}…`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function main() {
  const command = process.argv[2] || "status";
  if (command === "poll" && !claimWorker()) return;
  console.log("Checking your Telegram bot connection…");
  const bot = await check("getMe");
  const webhook = await check("getWebhookInfo");
  console.log(
    `Bot: @${bot.username}. Destination configured: ${telegramConfigured()}. Webhook configured: ${!!webhook.url}.`,
  );
  if (command === "connect") {
    if (webhook.url)
      throw new Error(
        "A webhook is active. Configure the verified TELEGRAM_CHAT_ID without replacing it.",
      );
    const username = (
      process.argv[3] ||
      process.env.TELEGRAM_OWNER_USERNAME ||
      ""
    )
      .replace(/^@/, "")
      .toLowerCase();
    if (!/^[a-z0-9_]{5,32}$/.test(username))
      throw new Error(
        "Provide your own Telegram username: npm run telegram:connect -- your_username",
      );
    const updates = await telegramCall("getUpdates", {
      timeout: 0,
      limit: 100,
    });
    const match = updates.findLast(
      ({ message }) =>
        message?.chat.type === "private" &&
        !message.from?.is_bot &&
        message.from?.id === message.chat.id &&
        message.from?.username?.toLowerCase() === username &&
        /^\/start(?:\s|$)/.test(message.text || ""),
    );
    if (!match)
      throw new Error(
        `Open https://t.me/${bot.username} in the TELEGRAM APP and send /start from @${username}. Do not type /start in PowerShell. Then rerun this command.`,
      );
    const chatId = String(match.message.chat.id);
    let env = "";
    try {
      env = await readFile(".env.local", "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const set = (name, value) => {
      const pattern = new RegExp(`^${name}=.*$`, "m");
      env = pattern.test(env)
        ? env.replace(pattern, `${name}=${value}`)
        : `${env.trimEnd()}\n${name}=${value}\n`;
    };
    set("TELEGRAM_CHAT_ID", chatId);
    set("TELEGRAM_BOT_USERNAME", bot.username);
    set("TELEGRAM_OWNER_USERNAME", username);
    if (!process.env.TELEGRAM_WEBHOOK_SECRET)
      set("TELEGRAM_WEBHOOK_SECRET", randomBytes(32).toString("hex"));
    await writeFile(".env.local", env, { mode: 0o600 });
    console.log(
      `Connected @${username}. Restart the website, then run npm run telegram:poll to receive replies locally.`,
    );
    return;
  }
  if (command === "status") {
    if (webhook.url) return;
    const updates = await telegramCall("getUpdates", {
      timeout: 0,
      limit: 100,
    });
    const chats = new Map();
    for (const update of updates) {
      if (update.message?.chat.type === "private")
        chats.set(
          update.message.chat.id,
          update.message.from?.username || "private chat",
        );
    }
    for (const [id, name] of chats)
      console.log(`Available chat: ${id} (${name})`);
    if (!chats.size)
      console.log(
        `Open https://t.me/${bot.username}, send /start, then run this command again.`,
      );
    return;
  }
  if (!telegramConfigured())
    throw new Error(
      `First open https://t.me/${bot.username} in Telegram and send /start. Then run: npm.cmd run telegram:connect -- ${process.env.TELEGRAM_OWNER_USERNAME || "your_username"}. The AI chat works even before Telegram is connected.`,
    );
  if (command === "webhook") {
    const site = new URL(process.env.SITE_URL || "http://localhost");
    if (site.protocol !== "https:" || !process.env.TELEGRAM_WEBHOOK_SECRET)
      throw new Error(
        "Set a public HTTPS SITE_URL and TELEGRAM_WEBHOOK_SECRET first.",
      );
    const target = new URL("/api/telegram/webhook", site).href;
    if (webhook.url && webhook.url !== target)
      throw new Error(
        "This bot already has a different webhook. Review it before replacing it.",
      );
    await telegramCall("setWebhook", {
      url: target,
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ["message"],
      drop_pending_updates: false,
    });
    console.log(
      "Webhook connected. Stop the polling worker when using a webhook.",
    );
    return;
  }
  if (command !== "poll")
    throw new Error("Use status, connect, poll, or webhook.");
  if (webhook.url)
    throw new Error(
      "A webhook is already active; polling cannot run at the same time.",
    );
  console.log(
    "Listening for Telegram replies. Keep this worker running alongside the website.",
  );
  while (true) {
    try {
      const offsetKey = `telegram-offset-${telegramScope()}`;
      const offset = (await readRecord(offsetKey)) || 0;
      const updates = await telegramCall(
        "getUpdates",
        { offset, timeout: 25, allowed_updates: ["message"] },
        35000,
      );
      for (const update of updates) {
        await acceptTelegramUpdate(update);
        await writeRecord(offsetKey, update.update_id + 1, 30 * 86400);
      }
      if (updates.length)
        console.log(`Processed ${updates.length} Telegram update(s).`);
    } catch {
      console.error(
        "Telegram polling failed; retrying in 5 seconds. Check network access and ensure only one worker is running.",
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
