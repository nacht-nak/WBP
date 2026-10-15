import "server-only";
import { mkdir, readFile, rename, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

function validCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    throw new Error("Invalid visitor count");
  return value;
}

// Development/single-server storage. Atomic replacement and an exclusive lock
// prevent concurrent requests from losing increments. Keep this folder on disk.
async function fileCount(increment: boolean) {
  // Runtime data is provisioned on the host, never bundled with the app.
  const directory = path.resolve(
    /* turbopackIgnore: true */ process.env.VISITOR_DATA_DIR || ".data",
  );
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, "visits.json");
  const lock = path.join(directory, "visits.lock");
  const read = async () => {
    try {
      return validCount(JSON.parse(await readFile(file, "utf8")).count);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
      throw error;
    }
  };
  if (!increment) return read();
  for (let attempt = 0; ; attempt++) {
    try {
      await mkdir(lock);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST" || attempt >= 100)
        throw error;
      await delay(25);
    }
  }
  try {
    const count = validCount((await read()) + 1);
    await writeFile(`${file}.tmp`, JSON.stringify({ count }), "utf8");
    await rename(`${file}.tmp`, file);
    return count;
  } finally {
    await rmdir(lock);
  }
}

export async function visitorCount(increment = false): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url || token) {
    if (!url || !token || new URL(url).protocol !== "https:")
      throw new Error("Incomplete visitor storage configuration");
    // https://upstash.com/docs/redis/features/restapi — atomic INCR command.
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        increment ? "INCR" : "GET",
        process.env.VISITOR_REDIS_KEY || "welquim:portfolio:visits",
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Visitor storage unavailable");
    const data = await response.json();
    if (data.error || !("result" in data))
      throw new Error("Visitor storage unavailable");
    return validCount(data.result === null ? 0 : Number(data.result));
  }
  // Ephemeral serverless disks cannot hold a shared, durable count.
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  )
    throw new Error("Connect persistent visitor storage");
  return fileCount(increment);
}
