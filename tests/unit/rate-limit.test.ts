import { describe, expect, it } from "vitest";
import { handleThemeRequest } from "../../server/mood-theme";
import { createLimiter, visitorKey } from "../../server/rate-limit";

describe("rate limit", () => {
  it("allows a few requests per visitor, then asks them to wait", () => {
    const check = createLimiter({ perVisitor: 2, windowMs: 60_000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 1).ok).toBe(true);
    const third = check("a", 2);
    expect(third).toMatchObject({ ok: false, scope: "visitor" });
    expect(third.ok === false && third.retryAfterSeconds).toBe(60);
    expect(check("b", 3).ok).toBe(true); // other visitors are unaffected
    expect(check("a", 60_001).ok).toBe(true); // the window slides
  });

  it("caps the whole site per day", () => {
    const check = createLimiter({ perVisitor: 100, globalPerDay: 2 });
    check("a", 0);
    check("b", 0);
    expect(check("c", 0)).toMatchObject({ ok: false, scope: "global" });
    expect(check("c", 86_400_000).ok).toBe(true); // a new day
  });

  it("keys visitors by Cloudflare's IP header", () => {
    const req = (h: Record<string, string>) => new Request("https://x.test/api/theme", { headers: h });
    expect(visitorKey(req({ "cf-connecting-ip": "1.2.3.4" }))).toBe("1.2.3.4");
    expect(visitorKey(req({ "x-forwarded-for": "5.6.7.8, 9.9.9.9" }))).toBe("5.6.7.8");
    expect(visitorKey(req({}))).toBe("local");
  });

  it("the API answers 429 with Retry-After once a visitor is over the limit", async () => {
    const post = () =>
      handleThemeRequest(
        new Request("https://x.test/api/theme", {
          method: "POST",
          headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.7" },
          body: JSON.stringify({ mood: "calm" }),
        }),
        {},
      );
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await post()).status);
    expect(statuses.slice(0, 6).every((s) => s === 200)).toBe(true);
    const last = await post();
    expect(last.status).toBe(429);
    expect(last.headers.get("retry-after")).toMatch(/^\d+$/);
    expect(((await last.json()) as { error: string }).error).toMatch(/limit/);
  });
});
