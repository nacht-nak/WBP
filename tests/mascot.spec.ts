import { test, expect } from "@playwright/test";

test("profile avatar loads its sheets and follows the pointer in all directions", async ({
  page,
  request,
}) => {
  for (const sheet of ["directions", "reactions"]) {
    const response = await request.get(`/mascots/welquim-${sheet}.webp`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/webp");
  }
  await page.goto("/");
  const avatar = page.getByRole("button", { name: "Boop the Welquim avatar" });
  await expect(avatar).toBeVisible();
  const direction = avatar.locator("span > span").first();
  const box = (await avatar.boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  for (const [dx, dy, position] of [
    [-130, -130, "0% 0%"],
    [0, -130, "50% 0%"],
    [130, -130, "100% 0%"],
    [-130, 0, "0% 50%"],
    [0, 0, "50% 50%"],
    [130, 0, "100% 50%"],
    [-130, 130, "0% 100%"],
    [0, 130, "50% 100%"],
    [130, 130, "100% 100%"],
  ] as const) {
    await page.mouse.move(cx + dx, cy + dy);
    await expect(direction).toHaveCSS("background-position", position);
  }
  await avatar.focus();
  await page.keyboard.press("Enter");
  await expect(avatar.locator("span > span").last()).toHaveCSS("opacity", "1");
  await expect(direction).toHaveCSS("opacity", "1");
});

test("reduced motion keeps the head centered and click reactions do not bounce", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const avatar = page.getByRole("button", { name: "Boop the Welquim avatar" });
  await expect(avatar).toBeVisible();
  await page.mouse.move(1100, 500);
  await expect(avatar.locator("span > span").first()).toHaveCSS(
    "background-position",
    "50% 50%",
  );
  await avatar.click();
  await expect(avatar.locator("span > span").last()).toHaveCSS("opacity", "1");
  expect(
    await avatar.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    ),
  ).toBe(0);
});

test("avatar reacts to taps and fits the mobile profile", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3001/");
    const avatar = page.getByRole("button", {
      name: "Boop the Welquim avatar",
    });
    await expect(avatar).toHaveCSS("width", "108px");
    await avatar.tap();
    await expect(avatar.locator("span > span").last()).toHaveCSS(
      "opacity",
      "1",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  } finally {
    await context.close();
  }
});
