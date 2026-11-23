import { expect, test } from "@playwright/test";

test("top bar holds the nav and the sound + theme toggles; sidebar holds projects", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Home" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(header.getByRole("button", { name: "Interface sound" })).toBeVisible();
  await expect(header.getByRole("button", { name: /Switch to (dark|light) theme/ })).toBeVisible();
  const sidebar = page.getByRole("complementary", { name: "Projects sidebar" });
  await expect(sidebar.getByRole("link", { name: /Mood → UI/ })).toBeVisible();
  await expect(sidebar.getByRole("button", { name: "Interface sound" })).toHaveCount(0);
});

test("floating nav appears after scrolling past the top bar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.goto("/about");
  const quick = page.getByRole("navigation", { name: "Quick" });
  await expect(quick).toBeHidden();
  await page.mouse.move(800, 400);
  await page.mouse.wheel(0, 1500);
  await expect(quick).toBeVisible();
  // The back-to-top ring shows page progress.
  const offset = () =>
    quick.locator("circle").evaluate((c) => Number(getComputedStyle(c).strokeDashoffset.replace("px", "")));
  await expect.poll(offset).toBeLessThan(100);
});

test("sidebar → Mood → UI → full screen, with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  const sidebar = page.getByRole("complementary", { name: "Projects sidebar" });
  const link = sidebar.getByRole("link", { name: /Mood → UI/ });
  await expect(link).toBeVisible();

  await link.click();
  await expect(page).toHaveURL(/\/p\/mood-ui$/);
  await expect(link).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1, name: "Mood → UI" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Sample card" })).toBeVisible();

  await page.getByRole("link", { name: "Open full screen" }).click();
  await expect(page).toHaveURL(/view=full/);
  await expect(sidebar).toBeHidden();
  await expect(page.getByRole("banner")).toBeHidden();
  await expect(page.getByRole("button", { name: "About this demo" })).toBeHidden();
  await expect(page.getByRole("article", { name: "Sample card" })).toBeVisible();

  // A visible way out besides Esc.
  await page.getByRole("link", { name: "Exit full screen" }).click();
  await expect(page).toHaveURL(/\/p\/mood-ui$/);
  await expect(sidebar).toBeVisible();

  // Direct load of the full view (prerendered HTML + pre-paint script) must also hide the chrome.
  await page.goto("/p/mood-ui?view=full");
  await expect(sidebar).toBeHidden();
  await expect(page.getByRole("article", { name: "Sample card" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("at 375px the sidebar is a drawer, with no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const url of ["/", "/p/mood-ui"]) {
    await page.goto(url);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  }
  await page.goto("/");
  const drawer = page.getByRole("dialog", { name: "Projects sidebar" });
  await expect(drawer).toBeHidden();
  await page.getByRole("button", { name: "Open projects" }).click();
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await page.getByRole("button", { name: "Open projects" }).click();
  await drawer.getByRole("link", { name: /Mood → UI/ }).click();
  await expect(page).toHaveURL(/\/p\/mood-ui$/);
  await expect(drawer).toBeHidden();
});

test("project rows support arrow-key navigation", async ({ page }) => {
  await page.goto("/");
  const row = page.getByRole("region", { name: "Projects" }).getByRole("link", { name: /Mood → UI/ });
  await row.focus();
  await page.keyboard.press("ArrowDown");
  await expect(row).toBeFocused(); // one project: wraps to itself
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/p\/mood-ui$/);
});

test("theme toggle switches to dark, persists across reloads, without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(html).toHaveClass(/dark/);
  await page.reload();
  await expect(html).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("OS dark preference is the default", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("sound toggle is off by default and remembers being turned on", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Interface sound" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: "Interface sound" })).toHaveAttribute("aria-pressed", "true");
});

test("tag filter narrows the project list", async ({ page }) => {
  await page.goto("/");
  const filters = page.getByRole("group", { name: "Filter projects by tag" });
  await expect(filters.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
  await filters.getByRole("button", { name: "motion" }).click();
  await expect(filters.getByRole("button", { name: "motion" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "Projects" }).getByRole("link", { name: /Mood → UI/ })).toBeVisible();
});

test("demo opens directly: stage fills the view, details live in the info panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/p/mood-ui");
  await expect(page.getByRole("article", { name: "Sample card" })).toBeVisible();
  // The workspace fits the viewport: no page scroll, no footer.
  const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1);
  expect(scrolls).toBe(false);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);

  const info = page.getByRole("dialog", { name: "Mood → UI" });
  await expect(info).toBeHidden();
  await page.getByRole("button", { name: "About this demo" }).click();
  await expect(info).toBeVisible();
  await expect(info.getByText(/Type a mood/)).toBeVisible();
  await expect(page.getByRole("button", { name: "About this demo" })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(info).toBeHidden();
  await page.keyboard.press("i");
  await expect(info).toBeVisible();

  await page.keyboard.press("Escape");
  await page.keyboard.press("p");
  await expect(page.getByRole("complementary", { name: "Performance" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Performance overlay" })).toHaveAttribute("aria-pressed", "true");
});

test("Home and About follow the portfolio: work, elsewhere, contact; experience, colophon", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Projects", "Selected work", "Elsewhere", "Let's work together"]) {
    await expect(page.getByRole("heading", { name: new RegExp(`^${name}`) })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /AIchor/ })).toHaveAttribute(
    "href",
    /work\.achrafgarai\.com\/work\/aichor/,
  );

  await page.getByRole("banner").getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();
  for (const name of ["Experience", "Capabilities", "Colophon", "Say hello"]) {
    await expect(page.getByRole("heading", { name })).toBeAttached();
  }
  await expect(page.getByRole("img", { name: "Portrait of Achraf Garai" })).toBeVisible();
  await expect(page.getByRole("banner").getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
});

test("Mood → UI: a pan/zoom canvas of stock shadcn components and a floating prompt bar", async ({ page }) => {
  await page.goto("/p/mood-ui");
  const canvas = page.getByRole("region", { name: /Component canvas/ });
  await expect(canvas).toBeVisible();
  const card = page.getByRole("article", { name: "Sample card" });
  await expect(card).toHaveAttribute("data-slot", "card");
  expect(await canvas.locator("[data-slot=card]").count()).toBeGreaterThan(10);
  await expect(canvas.getByRole("switch").first()).toBeVisible();
  await expect(page.getByRole("list", { name: "Suggestions" })).toBeVisible();

  const input = page.getByLabel("Describe a mood");
  const apply = page.getByRole("button", { name: "Apply" });
  await expect(apply).toBeDisabled();
  await input.fill("1920s jazz club, late night rain");
  await expect(page.getByText("6/40")).toBeVisible();
  await expect(apply).toBeEnabled();

  // Dragging the canvas (middle button works anywhere, like Figma) pans the world; zoom-in scales it.
  const world = canvas.locator("> div").first();
  const before = await world.evaluate((el) => el.style.transform);
  const box = await canvas.boundingBox();
  if (!box) throw new Error("no canvas box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 220);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height - 320, { steps: 4 });
  await page.mouse.up({ button: "middle" });
  await expect.poll(() => world.evaluate((el) => el.style.transform)).not.toBe(before);
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByRole("button", { name: /Fit to screen/ })).not.toHaveText("100%");
});

const mockTheme = {
  name: "Ember Keep",
  rationale: "Ember Night base: deep charcoal-brown, molten gold primary.",
  mode: "dark",
  colors: {
    background: "stone-950",
    foreground: "stone-100",
    card: "stone-900",
    cardForeground: "stone-700", // deliberately too faint: the guard must fix it, staying in the palette
    primary: "amber-500",
    primaryForeground: "stone-950",
    secondary: "stone-800",
    secondaryForeground: "stone-100",
    muted: "stone-800",
    mutedForeground: "stone-400",
    accent: "amber-950",
    accentForeground: "amber-200",
    border: "amber-700",
    ring: "amber-500",
  },

  radius: 0.25,
  fontHeading: "cinzel",
  fontBody: "inter",
  shape: "gem",
  border: "double",
  texture: "stone",
  buttonText: "caps",
  source: { id: "workers-ai", label: "Llama 3.3 on Cloudflare" },
};

test("Mood → UI: the AI's shadcn config is swapped in and the guard fixes contrast", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  let sent: unknown = null;
  await page.route("**/api/theme", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockTheme) });
  });
  await page.goto("/p/mood-ui");
  const card = page.getByRole("article", { name: "Sample card" });

  await page.getByLabel("Describe a mood").fill("dragon fire");
  await page.getByRole("button", { name: "Apply" }).click();
  expect(sent).toEqual({ mood: "dragon fire" });

  const pill = page.getByRole("button", { name: "Ember Keep · Llama 3.3 on Cloudflare" });
  await expect(pill).toBeVisible();
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(28, 25, 23)"); // stone-900
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe("16px"); // gem/bevel cards use a fixed 16px bevel
  await expect
    .poll(() => card.locator("[data-slot=card-title]").evaluate((el) => getComputedStyle(el).fontFamily))
    .toMatch(/Cinzel/);
  // Character switches: gem buttons with spaced capitals, double frames, a stone texture on the cards.
  const theme = page.locator(".shadcn-theme");
  await expect(theme).toHaveAttribute("data-shape", "gem");
  const read = card.getByRole("button", { name: "Read" });
  await expect.poll(() => read.evaluate((el) => getComputedStyle(el).textTransform)).toBe("uppercase");
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe("double");
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).backgroundImage)).toMatch(/^url\(/);

  await pill.click();
  await expect(page.getByText(/Title and body text: .*min 7/)).toBeVisible();
  await expect(page.getByText(/gem shape · double border · stone texture/)).toBeVisible();

  // The shadcn config can be read and copied.
  await page.getByRole("button", { name: "shadcn config" }).click();
  await expect(page.locator("pre")).toContainText("--primary: #f59e0b; /* amber-500 */");
  await expect(page.locator("pre")).toContainText("--radius: 0.25rem;");

  await page.getByRole("button", { name: "Reset to default theme" }).click();
  await expect(pill).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Suggestions" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Mood → UI: a failing API shows a clear message and keeps the default theme", async ({ page }) => {
  await page.route("**/api/theme", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Server broke." }) }),
  );
  await page.goto("/p/mood-ui");
  await page.getByLabel("Describe a mood").fill("calm");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("alert")).toHaveText(/Server broke/);
  await expect(page.locator(".shadcn-theme")).toHaveAttribute("data-theme-name", "default");
});

test("Mood → UI: rate limited, the theme is built offline with a quiet note", async ({ page }) => {
  await page.route("**/api/theme", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "You've reached the AI limit for now. Try again in 9 min.", limited: true }),
    }),
  );
  await page.goto("/p/mood-ui");
  await page.getByLabel("Describe a mood").fill("calm ocean");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("status").filter({ hasText: /AI limit.*made offline/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Calm Ocean · Offline generator" })).toBeVisible();
});

test("Mood → UI: after 3 AI tries in a session, briefs are built offline without calling the API", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/theme", (route) => {
    calls++;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockTheme) });
  });
  await page.goto("/p/mood-ui");
  await expect(page.getByText("3 AI")).toBeVisible();
  const input = page.getByLabel("Describe a mood");
  for (const brief of ["dragon fire", "ember night", "gold keep"]) {
    await input.fill(brief);
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("button", { name: /Ember Keep/ })).toBeVisible();
  }
  await expect(page.getByText("offline", { exact: true })).toBeVisible();
  await input.fill("calm ocean");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("status").filter({ hasText: /used your 3 AI tries/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Calm Ocean · Offline generator" })).toBeVisible();
  expect(calls).toBe(3);
});

test("Mood → UI: with no API at all, the browser falls back to the offline generator", async ({ page }) => {
  // The static preview server has no /api/theme, like a plain static host.
  await page.goto("/p/mood-ui");
  await page.getByLabel("Describe a mood").fill("calm ocean");
  await page.getByRole("button", { name: "Apply" }).click();
  const pill = page.getByRole("button", { name: "Calm Ocean · Offline generator" });
  await expect(pill).toBeVisible();
  await pill.click();
  await expect(page.getByText(/Sea Glass/)).toBeVisible();
});
