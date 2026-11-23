import { afterEach, describe, expect, it, vi } from "vitest";
import { EXAMPLES } from "~/demos/mood-ui/design-guide";
import { generateMoodTheme } from "../../server/mood-theme";

const theme = EXAMPLES[0]?.theme;
const chat = (content: string, status = 200) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status });

afterEach(() => vi.unstubAllGlobals());

describe("OpenRouter provider", () => {
  it("is the default provider, with a strict JSON schema and the chosen model", async () => {
    const fetchMock = vi.fn().mockResolvedValue(chat(JSON.stringify(theme)));
    vi.stubGlobal("fetch", fetchMock);
    const r = await generateMoodTheme("calm ocean", { OPEN_ROUTER_API_KEY: "k", OPENROUTER_MODEL: "x/y:free" });
    expect(r.ok && r.theme.source).toEqual({ id: "openrouter", label: "x/y:free via OpenRouter" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe("x/y:free");
    expect(body.response_format.type).toBe("json_schema");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer k");
  });

  it("comes before Gemini by default, and THEME_PROVIDER=gemini swaps them", async () => {
    const fetchMock = vi.fn().mockResolvedValue(chat(JSON.stringify(theme)));
    vi.stubGlobal("fetch", fetchMock);
    const r = await generateMoodTheme("calm", { GEMINI_API_KEY: "g", OPEN_ROUTER_API_KEY: "k" });
    expect(r.ok && r.theme.source.id).toBe("openrouter");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("openrouter.ai");

    fetchMock.mockClear();
    await generateMoodTheme("calm", { GEMINI_API_KEY: "g", OPEN_ROUTER_API_KEY: "k", THEME_PROVIDER: "gemini" });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("generativelanguage.googleapis.com");
  });

  it("falls back to Gemini when OpenRouter is busy", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 429 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(theme) }] } }] })),
      );
    vi.stubGlobal("fetch", fetchMock);
    const r = await generateMoodTheme("calm", { GEMINI_API_KEY: "g", OPEN_ROUTER_API_KEY: "k" });
    expect(r.ok && r.theme.source.id).toBe("gemini");
  });

  it("retries without a schema on 400, and reads JSON wrapped in text", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 400 }))
      .mockResolvedValueOnce(chat(`Here you go:\n\`\`\`json\n${JSON.stringify(theme)}\n\`\`\``));
    vi.stubGlobal("fetch", fetchMock);
    const r = await generateMoodTheme("calm", { OPEN_ROUTER_API_KEY: "k" });
    expect(r.ok && r.theme.source.id).toBe("openrouter");
    expect(JSON.parse(String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body)).response_format.type).toBe(
      "json_object",
    );
  });

  it("falls back to offline when OpenRouter is rate limited", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
    const r = await generateMoodTheme("calm", { OPEN_ROUTER_API_KEY: "k" });
    expect(r.ok && r.theme.source.id).toBe("offline");
  });
});

describe("Local Claude CLI provider (dev only)", () => {
  it("is tried first when the dev middleware injects it", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const localClaude = vi.fn().mockResolvedValue(theme);
    const r = await generateMoodTheme("calm", { OPEN_ROUTER_API_KEY: "k", localClaude });
    expect(r.ok && r.theme.source.id).toBe("claude-cli");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls through to OpenRouter when the CLI fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(chat(JSON.stringify(theme))));
    const localClaude = vi.fn().mockRejectedValue(new Error("not logged in"));
    const r = await generateMoodTheme("calm", { OPEN_ROUTER_API_KEY: "k", localClaude });
    expect(r.ok && r.theme.source.id).toBe("openrouter");
  });
});
