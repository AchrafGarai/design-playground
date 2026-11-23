import { afterEach, describe, expect, it, vi } from "vitest";
import { EXAMPLES } from "~/demos/mood-ui/design-guide";
import { cleanName, generateMoodTheme } from "../../server/mood-theme";

const theme = EXAMPLES[1]?.theme;
const reply = (text: string, status = 200) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status });

afterEach(() => vi.unstubAllGlobals());

describe("Gemini provider", () => {
  it("is used first when GEMINI_API_KEY is set, with the guide and a JSON schema", async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(JSON.stringify(theme)));
    vi.stubGlobal("fetch", fetchMock);
    const run = vi.fn();
    const r = await generateMoodTheme("dragon fire", { GEMINI_API_KEY: "test-key", AI: { run } });
    expect(r.ok && r.theme.source).toEqual({ id: "gemini", label: "gemini-3.5-flash-lite" });
    expect(run).not.toHaveBeenCalled();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/models/gemini-3.5-flash-lite:generateContent");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
    const body = JSON.parse(init.body as string);
    expect(body.systemInstruction.parts[0].text).toContain("PALETTES");
    expect(body.contents[0].parts[0].text).toBe('Brief: "dragon fire"');
    expect(body.generationConfig.responseJsonSchema.required).toContain("colors");
  });

  it("uses GEMINI_MODEL and accepts JSON wrapped in a code fence", async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(`\`\`\`json\n${JSON.stringify(theme)}\n\`\`\``));
    vi.stubGlobal("fetch", fetchMock);
    const r = await generateMoodTheme("dragon", { GEMINI_API_KEY: "k", GEMINI_MODEL: "gemini-pro-x" });
    expect(r.ok && r.theme.source.label).toBe("gemini-pro-x");
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/models/gemini-pro-x:generateContent");
  });

  it("retries once without the schema when the API rejects it", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: "bad field" } }), { status: 400 }))
      .mockResolvedValueOnce(reply(JSON.stringify(theme)));
    vi.stubGlobal("fetch", fetchMock);
    const r = await generateMoodTheme("dragon", { GEMINI_API_KEY: "k" });
    expect(r.ok && r.theme.source.id).toBe("gemini");
    expect(JSON.parse(fetchMock.mock.calls[1]?.[1].body).generationConfig.responseJsonSchema).toBeUndefined();
  });

  it("retries a 503 'high demand' response before giving up", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(reply(JSON.stringify(theme)));
    vi.stubGlobal("fetch", fetchMock);
    const r = await generateMoodTheme("dragon", { GEMINI_API_KEY: "k" });
    expect(r.ok && r.theme.source.id).toBe("gemini");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back down the chain on a bad key or an outage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 403 })));
    const r = await generateMoodTheme("calm", { GEMINI_API_KEY: "wrong" });
    expect(r.ok && r.theme.source.id).toBe("offline");
  });

  it("reports a blocked brief instead of silently falling back", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }))),
    );
    const r = await generateMoodTheme("calm", { GEMINI_API_KEY: "k" });
    expect(r).toMatchObject({ ok: false, status: 422 });
  });
});

describe("theme names", () => {
  it("replaces a name that echoes a one-word brief", () => {
    expect(cleanName("Scapers Realm", "RuneScape", "Night Keep")).toBe("Night Keep");
    expect(cleanName("Warcrafted Halls", "Warcraft", "Night Keep")).toBe("Night Keep");
    expect(cleanName("Ember Keep", "Warcraft", "Night Keep")).toBe("Ember Keep");
  });
});
