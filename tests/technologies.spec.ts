import { test, expect } from "@playwright/test";

test("technology carousel moves, pauses accessibly, and expands to the full toolkit", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#projects .project-card")).toHaveCount(3);
  await expect(
    page
      .locator("#projects")
      .getByRole("heading", { name: "Projects", exact: true }),
  ).toBeVisible();
  const section = page.locator("#technologies");
  await section.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const track = section.locator(".technology-track").first();
  const transform = () =>
    track.evaluate((el) => getComputedStyle(el).transform);
  const initial = await transform();
  await expect.poll(transform).not.toBe(initial);
  await section
    .getByRole("button", { name: "Pause technology carousel" })
    .click();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  const paused = await transform();
  await page.waitForTimeout(150);
  expect(await transform()).toBe(paused);
  await section
    .getByRole("button", { name: "Play technology carousel" })
    .click();
  await section.locator(".technology-lane").first().hover();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await page.mouse.move(0, 0);
  await section.locator(".technology-lane").first().focus();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await section.getByRole("button", { name: "View All" }).click();
  await expect(
    section.locator(".technology-catalog .technology-badge"),
  ).toHaveCount(15);
  await expect(
    section.getByRole("heading", { name: "Database", exact: true }),
  ).toBeVisible();
  await section.getByRole("button", { name: "Show carousel" }).click();
  await expect(section.locator(".technology-lane")).toHaveCount(3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(track).toHaveCSS("animation-name", "none");
  await expect(section.locator(".technology-badge:visible")).toHaveCount(15);
  await expect(
    section.getByRole("button", { name: "Pause technology carousel" }),
  ).toBeHidden();
});
