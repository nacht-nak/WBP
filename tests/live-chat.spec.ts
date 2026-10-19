import { test, expect } from "@playwright/test";

test("storage outages preserve drafts, back off, and recover without reopening", async ({
  page,
}) => {
  let available = false;
  let polls = 0;
  await page.route("**/api/messages", (route) => {
    polls++;
    return route.fulfill(
      available
        ? { json: { connected: true, aiAvailable: true, messages: [] } }
        : { status: 503, json: { error: "Storage unavailable" } },
    );
  });
  await page.goto("/");
  await page.clock.install();
  await page.getByRole("button", { name: "Chat with Wel" }).click();
  const input = page.getByRole("textbox", { name: "Your message" });
  const send = page.getByRole("button", { name: "Send message" });
  await input.fill("Please keep this draft");
  await expect(
    page.getByText("Chat is temporarily unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(send).toBeDisabled();
  await expect(page.getByRole("link", { name: "email Wel" })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
  expect(polls).toBe(1);
  await page.clock.runFor(6000);
  await expect.poll(() => polls).toBe(2);
  await page.clock.runFor(3000);
  expect(polls).toBe(2);
  available = true;
  await page.clock.runFor(9000);
  await expect(send).toBeEnabled();
  await expect(input).toHaveValue("Please keep this draft");
  await expect(page.getByRole("link", { name: "email Wel" })).toHaveCount(0);
});

test("one chat shows AI and personal replies and restores after reload", async ({
  page,
}) => {
  const messages: {
    id: string;
    role: string;
    content: string;
    delivered: boolean;
  }[] = [];
  await page.route("**/api/messages", async (route) => {
    if (route.request().method() === "POST") {
      messages.push({
        ...route.request().postDataJSON(),
        role: "user",
        delivered: true,
      });
      messages.push({
        id: "ai-1",
        role: "assistant",
        content: "Welquim builds websites with Laravel and React.",
        delivered: true,
      });
    }
    await route.fulfill({
      json: {
        connected: true,
        aiAvailable: true,
        humanMode: messages.some((m) => m.role === "owner"),
        messages,
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with Wel" }).click();
  await page
    .getByRole("textbox", { name: "Your message" })
    .fill("I need a website");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("log")).toContainText(
    "Welquim builds websites with Laravel and React.",
  );
  messages.push({
    id: "telegram-1",
    role: "owner",
    content: "Hi, let's discuss your project.",
    delivered: true,
  });
  await expect(
    page.getByRole("log", { name: "Direct conversation" }),
  ).toContainText("Hi, let's discuss your project.", { timeout: 10000 });
  await page.reload();
  await page.getByRole("button", { name: "Chat with Wel" }).click();
  await expect(
    page.getByRole("log", { name: "Direct conversation" }),
  ).toContainText("Hi, let's discuss your project.");
});

test("AI answers without Telegram, renders replies safely, and survives reopening", async ({
  page,
}) => {
  const messages: {
    id: string;
    role: string;
    content: string;
    delivered: boolean;
  }[] = [];
  await page.route("**/api/messages", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      messages.push(
        { ...body, role: "user", delivered: false },
        {
          id: "ai-1",
          role: "assistant",
          content: '<img src=x onerror="alert(1)"> AI answer',
          delivered: true,
        },
      );
    }
    await route.fulfill({
      json: { connected: false, aiAvailable: true, messages },
    });
  });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Chat with Wel" });
  await trigger.click();
  const input = page.getByRole("textbox", { name: "Your message" });
  await expect(input).toBeFocused();
  await input.fill("Hello");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("log")).toContainText("AI answer");
  await expect(page.getByRole("log").locator("img[onerror]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole("log")).toContainText("AI answer");
});

test("retry keeps the same message ID after a delivery error", async ({
  page,
}) => {
  const ids: string[] = [];
  await page.route("**/api/messages", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({
        json: { connected: true, aiAvailable: true, messages: [] },
      });
    const data = route.request().postDataJSON();
    ids.push(data.id);
    return route.fulfill(
      ids.length === 1
        ? { status: 502, json: { error: "Telegram unavailable" } }
        : {
            json: {
              connected: true,
              aiAvailable: true,
              messages: [{ ...data, role: "user", delivered: true }],
            },
          },
    );
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with Wel" }).click();
  await page.getByRole("textbox", { name: "Your message" }).fill("Hello");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Telegram unavailable",
  );
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("log")).toContainText("Hello");
  expect(ids).toHaveLength(2);
  expect(ids[1]).toBe(ids[0]);
});

test("direct chat fits mobile and leaves AI available when Telegram is not connected", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.route("**/api/messages", (route) =>
    route.fulfill({
      json: { connected: false, aiAvailable: true, messages: [] },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with Wel" }).click();
  await expect(
    page.getByText("Personal replies are not connected yet.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  const bounds = await page.getByRole("dialog").boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(568);
  await expect(
    page.getByRole("textbox", { name: "Your message" }),
  ).toBeVisible();
});

test("live message and webhook endpoints reject unauthorized input", async ({
  request,
}) => {
  const webhook = await request.post("/api/telegram/webhook", {
    data: { update_id: 1 },
  });
  expect(webhook.status()).toBe(401);
  const invalid = await request.post("/api/messages", {
    data: { id: "bad", content: "hello" },
  });
  expect(invalid.status()).toBe(400);
  const foreign = await request.post("/api/messages", {
    headers: { Origin: "https://example.org" },
    data: { content: "hello" },
  });
  expect(foreign.status()).toBe(403);
  const history = await request.get("/api/messages");
  expect((await history.json()).messages).toEqual([]);
  expect(history.headers()["cache-control"]).toBe("no-store");
});

test("AI and owner replies appear while a Telegram send is still pending", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let messages: {
    id: string;
    role: string;
    content: string;
    delivered: boolean;
  }[] = [];
  let posting = false;
  let humanMode = false;
  await page.route("**/api/messages", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      messages = [
        { ...body, role: "user", delivered: false },
        {
          id: `ai-${body.id}`,
          role: "assistant",
          content: "A quick AI answer",
          delivered: true,
        },
      ];
      posting = true;
      await gate;
      messages[0].delivered = true;
    }
    await route.fulfill({
      json: { connected: true, aiAvailable: true, humanMode, messages },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Chat with Wel" }).click();
  const input = page.getByRole("textbox", { name: "Your message" });
  await input.fill("Hello");
  await page.getByRole("button", { name: "Send message" }).click();
  try {
    await expect.poll(() => posting).toBe(true);
    await expect(input).toHaveValue("");
    await expect(page.getByRole("log")).toContainText("A quick AI answer");
    await expect(
      page.getByRole("status", { name: "Wel's AI is typing" }),
    ).toHaveCount(0);
    humanMode = true;
    messages.push({
      id: "telegram-123",
      role: "owner",
      content: "Personal answer",
      delivered: true,
    });
    await expect(page.getByRole("log")).toContainText("Personal answer");
  } finally {
    release();
  }
  await expect(input).not.toHaveAttribute("readonly", "");
  await expect(page.getByRole("log")).toContainText("Personal answer");
});
