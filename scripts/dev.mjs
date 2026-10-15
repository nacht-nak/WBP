import { spawn } from "node:child_process";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const website = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", ...process.argv.slice(2)],
  {
    stdio: "inherit",
  },
);
const listener =
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
    ? spawn(
        process.execPath,
        ["--experimental-strip-types", "scripts/telegram.mjs", "poll"],
        { stdio: "inherit" },
      )
    : null;

website.on("error", () => {
  console.error("Could not start the website.");
  listener?.kill();
  process.exitCode = 1;
});
listener?.on("error", () =>
  console.error("Could not start Telegram replies. Run npm run telegram:poll."),
);
website.on("exit", (code) => {
  listener?.kill();
  process.exitCode = code || 0;
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    website.kill(signal);
    listener?.kill(signal);
  });
}
