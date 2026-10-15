import { test, expect } from "@playwright/test";

test("home has working anchors, real project links, loaded assets, and no runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Welquim Panogaling/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Welquim",
  );
  const anchors = await page
    .locator('a[href^="/#"], a[href^="#"]')
    .evaluateAll((elements) =>
      elements.map((el) => el.getAttribute("href")!.split("#")[1]),
    );
  for (const id of anchors)
    expect(await page.locator(`[id="${id}"]`).count()).toBeGreaterThan(0);
  await expect(
    page.locator('a[href="https://ptsmpc.vercel.app/"]'),
  ).toBeVisible();
  await expect(
    page.locator(
      'a[href="https://ai-text-detector-frontend-black.vercel.app/"]',
    ),
  ).toBeVisible();
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty("complete", true);
    expect(
      await image.evaluate((el: HTMLImageElement) => el.naturalWidth),
    ).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

test("project filters and detail pages work", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator(".project-card")).toHaveCount(3);
  await page.getByRole("button", { name: "AI & tools", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "AI Text Detection System" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Project details", exact: true })
    .click();
  await expect(page).toHaveURL(/projects\/ai-text-detection/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "AI Text Detection System.",
  );
  await expect(
    page.getByRole("link", { name: "Visit live project" }),
  ).toHaveAttribute(
    "href",
    "https://ai-text-detector-frontend-black.vercel.app/",
  );
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "In development", exact: true })
    .click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await expect(page.locator(".project-card")).toContainText("Barangay");
});

test("highlights filter updates content and pressed state", async ({
  page,
}) => {
  await page.goto("/#highlights");
  const section = page.locator("#highlights");
  await section.getByRole("button", { name: "Education", exact: true }).click();
  await expect(section.locator(".highlight-card")).toHaveCount(1);
  await expect(
    section.getByRole("heading", { name: "Always a student of the craft" }),
  ).toBeVisible();
  await expect(
    section.getByRole("button", { name: "Education", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await section.getByRole("button", { name: "All", exact: true }).click();
  await expect(section.locator(".highlight-card")).toHaveCount(3);
});

test("theme persists across reloads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive layout stays within ${width}px viewport`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/projects", "/meeting", "/resume"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (path === "/meeting")
        await expect(
          page.getByRole("heading", { name: "Select a date & time" }),
        ).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
  });
}

test("mobile menu is keyboard accessible and closes on navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await toggle.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
});

test("meeting request preserves the selected time zone and addresses the owner's email", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-12T02:00:00Z") });
  await page.goto("/meeting");
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await page.locator(".calendar-grid button:not([disabled])").nth(1).click();
  await page.locator(".time-slots button").first().click();
  await expect(page.locator(".selected-time")).toContainText("9:00 AM");
  await page.getByLabel("Display time zone").selectOption("UTC");
  await expect(page.locator(".selected-time")).toContainText("1:00 AM");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Your name", { exact: true }).fill("Test Visitor");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("visitor@example.com");
  await page
    .getByLabel("What would you like to discuss? (optional)")
    .fill("Website project & pricing");
  await page.getByRole("button", { name: "Review request" }).click();
  await expect(
    page.getByText("Your time is confirmed when Welquim replies.", {
      exact: false,
    }),
  ).toBeVisible();
  const gmail = new URL(
    (await page
      .getByRole("link", { name: "Open request in Gmail" })
      .getAttribute("href"))!,
  );
  expect(gmail.origin).toBe("https://mail.google.com");
  expect(gmail.searchParams.get("to")).toBe("welpanogaling12@gmail.com");
  expect(gmail.searchParams.get("body")).toContain("Preferred time: 1:00 AM");
  expect(gmail.searchParams.get("body")).toContain("Time zone: UTC");
  expect(gmail.searchParams.get("body")).toContain("9:00 AM (UTC+8)");
  expect(gmail.searchParams.get("body")).toContain("Website project & pricing");
  expect(gmail.searchParams.get("body")).toContain("visitor@example.com");
  const mailto = new URL(
    (await page
      .getByRole("link", { name: "Use email app" })
      .getAttribute("href"))!,
  );
  expect(mailto.protocol).toBe("mailto:");
  expect(mailto.pathname).toBe("welpanogaling12@gmail.com");
  expect(mailto.searchParams.get("body")).toBe(gmail.searchParams.get("body"));
  await page.getByRole("button", { name: "Change date or time" }).click();
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
});

test("scheduling rejects a selected time that passes while the form is open", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-12T00:00:00Z") });
  await page.goto("/meeting");
  await page.locator(".calendar-grid button:not([disabled])").first().click();
  await page.locator(".time-slots button").first().click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Your name", { exact: true }).fill("Test Visitor");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("visitor@example.com");
  await page.clock.setFixedTime(new Date("2026-10-12T02:00:00Z"));
  await page.getByRole("button", { name: "Review request" }).click();
  await expect(page.locator(".booking-main").getByRole("alert")).toContainText(
    "Please choose a future time",
  );
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Open request in Gmail" }),
  ).toHaveCount(0);
});

test("GitHub has an honest empty state and an API response", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/github");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(typeof data.available).toBe("boolean");
  await page.goto("/");
  if (!data.available) {
    await expect(page.locator(".github-panel")).toContainText(
      /not connected|temporarily unavailable/i,
    );
    await expect(
      page.locator(
        ".contribution-grid .level-1, .contribution-grid .level-2, .contribution-grid .level-3, .contribution-grid .level-4",
      ),
    ).toHaveCount(0);
  }
});

test("resume, missing route, Open Graph image, and reduced motion work", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") hydrationErrors.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Education", exact: true }).click();
  await expect(page.locator(".highlight-card")).toHaveCount(1);
  await page.goto("/projects");
  await page.getByRole("button", { name: "AI & tools", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  expect(hydrationErrors).toEqual([]);
  await page.goto("/resume");
  await expect(
    page.getByRole("button", { name: "Print / save as PDF" }),
  ).toBeVisible();
  await expect(
    page.getByText("Bachelor of Science in Information Technology", {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  const missing = await request.get("/not-a-real-page");
  expect(missing.status()).toBe(404);
  const image = await request.get("/opengraph-image");
  expect(image.ok()).toBeTruthy();
  expect(image.headers()["content-type"]).toContain("image/png");
});
