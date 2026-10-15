import { test, expect } from "@playwright/test";

test("Outside the IDE cycles travel, gym, and work photos by click and keyboard", async ({
  page,
}) => {
  await page.goto("/#outside-ide");
  const section = page.locator("#outside-ide");
  for (const hobby of ["Travel", "Gym", "Work"])
    await expect(
      section.locator(".interest-tags").getByText(hobby, { exact: true }),
    ).toBeVisible();
  const stack = section.getByRole("button", { name: "Show next photo" });
  const active = stack.locator('.stack-photo[data-position="0"] img');
  await expect(active).toHaveAttribute("alt", /Travel/);
  await stack.click();
  await expect(active).toHaveAttribute("alt", /Gym/);
  await expect(stack).toContainText("Photo 2 of 3");
  await stack.click();
  await expect(active).toHaveAttribute("alt", /Work/);
  await stack.click();
  await expect(active).toHaveAttribute("alt", /Travel/);
  await stack.focus();
  await page.keyboard.press("Space");
  await expect(active).toHaveAttribute("alt", /Gym/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(stack.locator(".stack-photo").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
});

test("credentials archive, original education and contact navigation remain available", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#education")).toContainText(
    "State University of Northern Negros",
  );
  await expect(page.locator("#education")).toContainText(
    "Central Philippines State University",
  );
  await page
    .locator("#certifications")
    .getByRole("link", { name: "View All" })
    .click();
  await expect(page).toHaveURL(/\/certifications$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Certifications & training",
  );
  await page.getByRole("link", { name: "Back to portfolio" }).click();
  await page
    .locator("#contact")
    .getByRole("link", { name: /Schedule a call/ })
    .click();
  await expect(page).toHaveURL(/\/meeting$/);
  await expect(page.getByText("Request a time", { exact: true })).toBeVisible();
});
