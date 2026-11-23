// Dev only: Claude through the local Claude Code CLI (`claude -p`), using your Claude Code login instead of an API
// key. Node-only (spawns a process), so it is never imported by the Cloudflare Function: the Vite dev middleware loads
// it and passes it to the provider chain. Enable with THEME_PROVIDER=claude in .env.local.
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { themeJsonSchema } from "../../app/demos/mood-ui/schema";
import { THEME_SYSTEM } from "../prompt";

export const CLAUDE_CLI_MODEL = "sonnet";

type CliResult = { is_error?: boolean; result?: string; structured_output?: unknown; subtype?: string };

export function claudeCliTheme(user: string, model = CLAUDE_CLI_MODEL): Promise<unknown> {
  const args = [
    "-p",
    user,
    "--output-format",
    "json",
    "--model",
    model,
    "--system-prompt",
    THEME_SYSTEM,
    "--json-schema",
    JSON.stringify(themeJsonSchema),
    "--tools",
    "", // no tools: it only writes JSON
    "--strict-mcp-config",
    "--setting-sources",
    "",
    "--no-session-persistence",
  ];
  // Without the API key the CLI uses your Claude Code login; run outside the repo so no CLAUDE.md is picked up.
  const { ANTHROPIC_API_KEY: _key, ...env } = process.env;
  return new Promise((resolve, reject) => {
    execFile("claude", args, { cwd: tmpdir(), env, timeout: 120_000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout) => {
      if (error && !stdout) return reject(new Error(`claude CLI failed: ${error.message.split("\n")[0]}`));
      try {
        const out = JSON.parse(stdout) as CliResult;
        if (out.is_error) return reject(new Error(`claude CLI: ${out.subtype ?? "error"}`));
        if (out.structured_output) return resolve(out.structured_output);
        const text = out.result ?? "";
        resolve(JSON.parse(text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1")));
      } catch (e) {
        reject(e);
      }
    });
  });
}
