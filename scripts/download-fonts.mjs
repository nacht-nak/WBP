import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/fonts", { recursive: true });
const fonts = [
  ["lato-light", "Lato:wght@300", "lato"],
  ["lato-regular", "Lato:wght@400", "lato"],
  ["lato-bold", "Lato:wght@700", "lato"],
];
for (const [name, family, source] of fonts) {
  const response = await fetch(
    "https://fonts.googleapis.com/css2?family=" + family + "&display=swap",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
    },
  );
  if (!response.ok) throw Error("Font stylesheet unavailable");
  const css = await response.text();
  const matches = [...css.matchAll(/url\((https:[^)]+)\)/g)];
  const url = matches.at(-1)?.[1];
  if (!url) throw Error("Font URL missing");
  const font = await fetch(url);
  if (!font.ok) throw Error("Font download failed");
  await writeFile(
    "public/fonts/" + name + ".woff2",
    Buffer.from(await font.arrayBuffer()),
  );
  const license = await fetch(
    "https://raw.githubusercontent.com/google/fonts/main/ofl/" +
      source +
      "/OFL.txt",
  );
  if (!license.ok) throw Error("Font license unavailable");
  await writeFile("public/fonts/" + name + "-OFL.txt", await license.text());
  console.log("Saved", name, "and license");
}
