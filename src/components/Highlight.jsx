import { Fragment } from "react";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps case-insensitive matches of `query` in <mark>. */
export function Highlight({ text, query }) {
  const q = (query || "").trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRe(q)})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded-sm bg-accent-amber/40 px-0.5 text-content">{p}</mark>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    )
  );
}

// 1: base command (first word)  2: quoted strings  3: URLs / paths  4: flags
const TOKEN_RE =
  /^([A-Za-z][\w.\-]*)|("[^"]*"|'[^']*')|(https?:\/\/[^\s"']+|(?:[A-Za-z]:)?[\\/][\w.\-\\/<>*:]+)|((?<=\s)--?[A-Za-z][\w-]*)/g;

/**
 * Lightweight shell/PowerShell highlighter: command name bold white, flags cyan,
 * strings/paths emerald. Search matches are layered on top via <Highlight>.
 */
export function HighlightedCommand({ command, query }) {
  const out = [];
  let last = 0;
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(command))) {
    if (m.index > last) out.push(<Highlight key={last} text={command.slice(last, m.index)} query={query} />);
    const cls = m[1]
      ? "font-semibold text-white"
      : m[4]
      ? "text-accent-cyan"
      : "text-accent-emerald";
    out.push(
      <span key={m.index} className={cls}>
        <Highlight text={m[0]} query={query} />
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < command.length) out.push(<Highlight key={last} text={command.slice(last)} query={query} />);
  return out;
}
