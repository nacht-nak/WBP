import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("visits persist on the server and refreshes do not count twice", async ({
  page,
  request,
  browser,
}) => {
  const before = (await (await request.get("/api/visits")).json()).count;
  await page.goto("/#contact");
  const badge = page.locator(".footer-visits");
  await expect(badge).toHaveText(
    `Visited ${(before + 1).toLocaleString("en-US")} ${before === 0 ? "time" : "times"}`,
  );
  const cookies = await page.context().cookies();
  expect(
    cookies.find((cookie) => cookie.name === "portfolio-visit")?.httpOnly,
  ).toBe(true);
  await page.reload();
  await expect(badge).toContainText((before + 1).toLocaleString("en-US"));
  expect((await (await request.get("/api/visits")).json()).count).toBe(
    before + 1,
  );

  const visitor = await browser.newContext();
  try {
    const anotherPage = await visitor.newPage();
    await anotherPage.goto("/");
    await expect(anotherPage.locator(".footer-visits")).toContainText(
      (before + 2).toLocaleString("en-US"),
    );
    const persisted = JSON.parse(
      await readFile(".data/e2e/visits.json", "utf8"),
    );
    expect(persisted.count).toBe(before + 2);
  } finally {
    await visitor.close();
  }
});

test("simultaneous new visits do not lose increments and cross-site posts are rejected", async ({
  playwright,
  request,
}) => {
  const before = (await (await request.get("/api/visits")).json()).count;
  const visitors = await Promise.all(
    Array.from({ length: 6 }, () =>
      playwright.request.newContext({ baseURL: "http://127.0.0.1:3001" }),
    ),
  );
  try {
    const responses = await Promise.all(
      visitors.map((visitor) => visitor.post("/api/visits")),
    );
    expect(responses.every((response) => response.ok())).toBe(true);
    expect((await (await request.get("/api/visits")).json()).count).toBe(
      before + 6,
    );
    const blocked = await request.post("/api/visits", {
      headers: { origin: "https://another-site.example" },
    });
    expect(blocked.status()).toBe(403);
    expect((await (await request.get("/api/visits")).json()).count).toBe(
      before + 6,
    );
  } finally {
    await Promise.all(visitors.map((visitor) => visitor.dispose()));
  }
});

test("unavailable storage displays an honest badge without breaking the footer", async ({
  page,
}) => {
  await page.route("**/api/visits", (route) =>
    route.fulfill({ status: 503, json: { error: "Visit count unavailable" } }),
  );
  await page.goto("/#contact");
  await expect(page.locator(".footer-visits")).toHaveText("Visits unavailable");
  await expect(page.locator("footer")).toContainText("Welquim Panogaling");
  await expect(
    page.locator("#contact").getByRole("link", { name: /Schedule a call/ }),
  ).toBeVisible();
});
