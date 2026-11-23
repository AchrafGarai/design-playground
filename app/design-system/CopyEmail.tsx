import { useEffect, useRef, useState } from "react";
import { Check } from "./icons";

/** Portfolio copy-email field: mailto link + Copy button that swaps to "Copied". */
export function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1800);
  };

  return (
    <div className="mx-auto flex w-full max-w-xs items-center gap-1 rounded-xl border border-line p-1 pl-3 text-sm transition-colors focus-within:border-line-strong hover:border-line-strong">
      <a
        href={`mailto:${email}`}
        className="min-w-0 flex-1 truncate text-left text-fg transition-colors hover:text-contrast"
      >
        {email}
      </a>
      <button type="button" className="btn copy-btn" onClick={copy}>
        <span className="swap" data-state={done ? "done" : "idle"}>
          <span className="a">Copy</span>
          <span className="b" aria-hidden="true">
            <Check className="size-3.5" /> Copied
          </span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {done ? "Email copied" : ""}
      </span>
    </div>
  );
}
