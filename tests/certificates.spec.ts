import { test, expect } from "@playwright/test";

test("each certificate opens an image and description without leaving the archive", async ({
  page,
  context,
}) => {
  const pdfRequests: string[] = [];
  page.on("request", (request) => {
    if (/\.pdf(?:\?|$)/i.test(request.url())) pdfRequests.push(request.url());
  });
  await page.goto("/certifications");
  const archive = page.locator(".credentials-page");
  const entries = archive.locator(".credential-entry");
  const dialog = archive.getByRole("dialog");
  await expect(entries).toHaveCount(6);

  for (const entry of await entries.all()) {
    const title = await entry.locator("h4").innerText();
    const issuer = await entry.locator(".credential-copy > p").innerText();
    const trigger = entry.getByRole("button", { name: /^View / });
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(title);
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(title);
    await expect(dialog).toContainText(issuer);
    await expect(
      dialog.locator(".certificate-dialog-description p"),
    ).not.toBeEmpty();
    const image = dialog.getByRole("img");
    await expect(image).toHaveAttribute(
      "src",
      /\/certificates\/.+-full\.webp$/,
    );
    await expect
      .poll(() =>
        image.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expect(page).toHaveURL(/\/certifications$/);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  }

  expect(context.pages()).toHaveLength(1);
  expect(pdfRequests).toEqual([]);
});

test("certificate modal supports mobile, keyboard, close button and backdrop dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const section = page.locator("#certifications");
  const dialog = section.getByRole("dialog");
  const trigger = section.getByRole("button", {
    name: "Open Cybersecurity Awareness and Ethical AI in Education certificate",
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(
    dialog.getByRole("button", { name: "Close certificate" }),
  ).toBeFocused();
  await dialog.getByRole("img").click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("8-hour information session");
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  await dialog.getByRole("button", { name: "Close certificate" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

  await section.getByRole("link", { name: "View All" }).click();
  const archive = page.locator(".credentials-page");
  await archive.locator(".credential-thumbnail").first().click();
  await expect(archive.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await archive.getByRole("link", { name: "Back to portfolio" }).click();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
});
