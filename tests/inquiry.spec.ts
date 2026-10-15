import { test, expect } from "@playwright/test";

test("Save sends in-page, retains failed forms, and safely retries", async ({
  page,
}) => {
  const submissions: { id: string }[] = [];
  await page.route("**/api/inquiries", async (route) => {
    submissions.push(route.request().postDataJSON());
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: submissions.length === 1 ? 503 : 200,
      json:
        submissions.length === 1
          ? { error: "Please try again later." }
          : { success: true },
    });
  });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /Email welpanogaling/ });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/^To:/)).toHaveCount(0);
  await expect(
    dialog.getByRole("button", { name: /Open in Gmail|Use email app/ }),
  ).toHaveCount(0);
  await dialog.getByLabel("Your name").fill("Visitor");
  await dialog.getByLabel("Your email").fill("visitor@example.com");
  await dialog.getByLabel("Subject").fill("Project inquiry");
  await dialog
    .getByLabel("Message", { exact: true })
    .fill("I have a project in mind.");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Saving..." }),
  ).toBeDisabled();
  await expect(dialog.getByRole("alert")).toContainText(
    "Please try again later.",
  );
  await expect(dialog.getByLabel("Message", { exact: true })).toHaveValue(
    "I have a project in mind.",
  );
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("sent to Wel");
  expect(submissions[0].id).toBe(submissions[1].id);
  expect(page.context().pages()).toHaveLength(1);
  await expect(dialog.getByLabel("Message", { exact: true })).toHaveValue("");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
