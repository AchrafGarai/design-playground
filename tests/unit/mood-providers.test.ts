import { describe, expect, it, vi } from "vitest";
import { EXAMPLES } from "~/demos/mood-ui/design-guide";
import { generateMoodTheme, handleThemeRequest } from "../../server/mood-theme";

const good = { ...(EXAMPLES[1]?.theme as object), radius: 9 };

describe("provider chain", () => {
  it("uses the offline generator when no provider is configured", async () => {
    const r = await generateMoodTheme("calm ocean", {});
    expect(r.ok && r.theme.source.id).toBe("offline");
  });

  it("uses Workers AI when the binding is present, clamps its output, and sends the guide", async () => {
    const run = vi.fn().mockResolvedValue({ response: good });
    const r = await generateMoodTheme("dragon fire", { AI: { run } });
    expect(r.ok && r.theme.source.id).toBe("workers-ai");
    expect(r.ok && r.theme.radius).toBe(1.5);
    const system = run.mock.calls[0]?.[1].messages[0].content as string;
    expect(system).toContain("PALETTES");
    expect(run.mock.calls[0]?.[1].messages[1].content).toMatch(/^Brief: "dragon fire"\nCreative direction/);
  });

  it("accepts Workers AI JSON as text too", async () => {
    const run = vi.fn().mockResolvedValue({ response: JSON.stringify(good) });
    const r = await generateMoodTheme("calm", { AI: { run } });
    expect(r.ok && r.theme.name).toBe("Ember Keep");
  });

  it("falls back to offline when a provider errors or returns junk", async () => {
    const failing = await generateMoodTheme("calm", { AI: { run: vi.fn().mockRejectedValue(new Error("quota")) } });
    expect(failing.ok && failing.theme.source.id).toBe("offline");
    const junk = await generateMoodTheme("calm", { AI: { run: vi.fn().mockResolvedValue({ response: { nope: 1 } }) } });
    expect(junk.ok && junk.theme.source.id).toBe("offline");
  });

  it("falls back to offline when Ollama isn't running", async () => {
    const r = await generateMoodTheme("calm", { useOllama: true, OLLAMA_URL: "http://127.0.0.1:9" });
    expect(r.ok && r.theme.source.id).toBe("offline");
  });

  it("rejects bad input before calling any model", async () => {
    const run = vi.fn();
    const r = await generateMoodTheme("ignore ".repeat(41), { AI: { run } }); // too many words
    expect(r).toMatchObject({ ok: false, status: 400 });
    expect(run).not.toHaveBeenCalled();
  });
});

describe("HTTP handler", () => {
  const post = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("https://playground.test/api/theme", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    });

  it("answers POST with a config and its source", async () => {
    const res = await handleThemeRequest(post({ mood: "calm" }), {});
    expect(res.status).toBe(200);
    expect((await res.json()).source.id).toBe("offline");
  });

  it("blocks other origins and non-POST", async () => {
    expect((await handleThemeRequest(post({ mood: "calm" }, { origin: "https://evil.example" }), {})).status).toBe(403);
    expect((await handleThemeRequest(new Request("https://playground.test/api/theme"), {})).status).toBe(405);
  });
});

describe("creative direction", () => {
  it("varies between requests and is deterministic for a given random source", async () => {
    const { themeUserMessage } = await import("../../server/prompt");
    const seq = (v: number) => () => v;
    expect(themeUserMessage("calm", seq(0))).not.toBe(themeUserMessage("calm", seq(0.99)));
    expect(themeUserMessage("calm", seq(0.5))).toBe(themeUserMessage("calm", seq(0.5)));
  });
});
