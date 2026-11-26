import { useState } from "react";
import { Copy, Check, ChevronDown, AlertTriangle, Plus, ExternalLink, Star, BookOpenText } from "lucide-react";
import { CATEGORY_META, DEFAULT_META } from "./categoryMeta.js";
import { Highlight, HighlightedCommand } from "./Highlight.jsx";
import { tagStyle } from "../utils/tagColors.js";
import { riskSeverity } from "../utils/risk.js";

const COLLAPSE_LINES = 6;

export default function CommandCard({ entry, inReport, isFavorite, onToggleFavorite, onCopy, onAddToReport, onTagClick, activeTags, query, compact }) {
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[entry.category] ?? DEFAULT_META;

  const high = riskSeverity(entry) === "high";
  const lineCount = entry.referenceOnly ? 0 : entry.command.split("\n").length;
  const isLong = lineCount > COLLAPSE_LINES;

  const handleCopy = async () => {
    const ok = await onCopy(entry);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <article
      className={`group relative rounded-xl border border-line bg-surface/80 backdrop-blur-sm transition-all duration-200 animate-fadeIn
                  hover:-translate-y-px hover:border-line-hover hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] ${meta.card} ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-1.5">
          <button
            onClick={() => onToggleFavorite(entry.id)}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite}
            className={`mt-0.5 shrink-0 rounded-md p-0.5 transition-colors duration-150 ${isFavorite ? "text-accent-amber" : "text-content-dim hover:text-accent-amber"}`}
          >
            <Star size={15} className={isFavorite ? "fill-current" : ""} />
          </button>
          <h3 className="text-base font-semibold leading-snug text-content">
            <Highlight text={entry.title} query={query} />
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {entry.category}
          </span>
          <span className="text-xs text-content-dim">{entry.subcategory}</span>
        </div>
      </div>

      {entry.referenceOnly ? (
        <a
          href={entry.referenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2.5 rounded-lg border border-line bg-raised px-3 py-2.5 text-sm text-content transition-colors duration-150 hover:border-accent-rose/40 hover:text-accent-rose ${
            compact ? "mt-2" : "mt-4"
          }`}
        >
          <BookOpenText size={16} className="shrink-0 text-accent-rose" />
          <span className="min-w-0 flex-1 truncate">Open reference — {new URL(entry.referenceUrl).hostname.replace(/^www\./, "")}</span>
          <ExternalLink size={14} className="shrink-0" />
        </a>
      ) : (
        <div className={`rounded-lg border border-line bg-raised ${compact ? "mt-2" : "mt-4"}`}>
          <div className="flex items-start">
            <pre
              className={`min-w-0 flex-1 overflow-x-auto p-3 text-content ${isLong && !expanded ? "max-h-40 overflow-y-hidden" : ""}`}
            >
              <code><HighlightedCommand command={entry.command} query={query} /></code>
            </pre>
            <button
              onClick={handleCopy}
              aria-label="Copy command"
              className={`m-2 shrink-0 rounded-md p-1.5 transition-colors duration-150 ${
                copied ? "text-accent-emerald" : "text-content-dim hover:bg-white/5 hover:text-white"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          {lineCount > 1 && (
            <div className="flex items-center justify-between border-t border-line px-3 py-1 text-[11px] uppercase tracking-[0.06em] text-content-dim">
              <span>{lineCount} lines</span>
              {isLong && (
                <button onClick={() => setExpanded((e) => !e)} className="normal-case tracking-normal text-accent-cyan hover:underline">
                  {expanded ? "Show less" : `Show all ${lineCount} lines`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!compact && (
        <p className="mt-5 text-sm leading-relaxed text-content-secondary">
          <Highlight text={entry.description} query={query} />
        </p>
      )}

      <button
        onClick={() => setShowOutput((s) => !s)}
        aria-expanded={showOutput}
        className={`flex items-center gap-1 text-sm text-accent-cyan hover:underline ${compact ? "mt-2" : "mt-3"}`}
      >
        {showOutput ? "Hide expected output" : "Show expected output"}
        <ChevronDown size={14} className={`transition-transform duration-200 ${showOutput ? "rotate-180" : ""}`} />
      </button>
      {showOutput && (
        <p className="mt-2 animate-fadeIn rounded-lg border border-line bg-raised p-3 text-sm text-content-secondary">
          {entry.expectedOutput}
        </p>
      )}

      {entry.riskNote && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-1.5 text-xs ${
            high
              ? "border-accent-rose/40 bg-accent-rose/10 text-accent-rose"
              : "border-accent-amber/30 bg-accent-amber/10 text-accent-amber"
          }`}
        >
          <AlertTriangle size={13} className="mt-px shrink-0" />
          <span>
            {high && <strong className="mr-1 uppercase tracking-[0.06em]">High risk:</strong>}
            {entry.riskNote}
          </span>
        </div>
      )}

      {!compact && entry.references?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {entry.references.map((ref) => {
            // Backward-compatible: a plain URL string, or a {label, url} pair for multiple
            // named sources (e.g. both OWASP and PortSwigger) on one card.
            const url = typeof ref === "string" ? ref : ref.url;
            const label = typeof ref === "string" ? "Reference" : ref.label ?? "Reference";
            return (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-cyan hover:underline">
                <ExternalLink size={12} /> {label}
              </a>
            );
          })}
        </div>
      )}

      <div className={`flex items-end justify-between gap-2 ${compact ? "mt-2" : "mt-4"}`}>
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={`rounded-full border px-2 py-0.5 text-[11px] tracking-[0.02em] transition-colors duration-150 ${
                activeTags.has(tag) ? tagStyle(tag).active : tagStyle(tag).chip
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          onClick={() => onAddToReport(entry)}
          disabled={inReport}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-transparent bg-gradient-to-r from-accent-indigo to-accent-violet px-2.5 py-1 text-xs font-medium text-white shadow-md shadow-indigo-950/40 transition-[filter] duration-150
                     enabled:hover:brightness-110 disabled:border-accent-emerald/40 disabled:bg-none disabled:bg-accent-emerald/15 disabled:text-accent-emerald disabled:shadow-none
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 disabled:sm:opacity-100"
        >
          {inReport ? <><Check size={12} /> In report</> : <><Plus size={12} /> Add to report</>}
        </button>
      </div>
    </article>
  );
}
