// Cloudflare Pages Function: POST /api/theme. Deployed with the static site by `wrangler pages deploy`.
// Free by default: uses the Workers AI binding "AI" (see wrangler.toml). Optional: set ANTHROPIC_API_KEY as a secret
// in the Pages project to use Claude first.
import { handleThemeRequest, type ThemeEnv } from "../../server/mood-theme";

type Context = { request: Request; env: ThemeEnv };

export const onRequest = ({ request, env }: Context): Promise<Response> => handleThemeRequest(request, env);
