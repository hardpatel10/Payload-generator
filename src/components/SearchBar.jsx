import { Search, X, Rows3, LayoutGrid } from "lucide-react";

/** Full-width search row: input, result badge, copy-format toggle, density toggle. */
export default function SearchBar({ value, onChange, resultCount, idle, compact, onToggleCompact, copyMode, onSetCopyMode }) {
  const seg = (mode, label) => (
    <button
      onClick={() => onSetCopyMode(mode)}
      aria-pressed={copyMode === mode}
      className={`px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
        copyMode === mode ? "bg-accent-indigo/25 text-accent-indigo" : "text-content-dim hover:text-content"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="px-4 py-2.5">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-content-dim" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search title, command, description, tags…"
            aria-label="Search commands"
            className="w-full rounded-xl border border-line bg-surface/80 py-2 pl-11 pr-10 text-[15px] text-content placeholder:text-content-dim transition-[border-color,box-shadow] duration-150 focus:border-accent-cyan/70 focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
          />
          {value && (
            <button onClick={() => onChange("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-content-dim transition-colors duration-150 hover:text-content">
              <X size={16} />
            </button>
          )}
        </div>
        <span className="hidden whitespace-nowrap rounded-full border border-line bg-raised px-3 py-1 text-xs text-content-secondary sm:block">
          {idle ? "0 selected — pick a filter to browse" : `${resultCount} result${resultCount === 1 ? "" : "s"}`}
        </span>
        <div
          className="hidden overflow-hidden rounded-lg border border-line md:flex"
          role="group"
          aria-label="Copy format"
          title="Copy raw command, or as a fenced code block (```bash / ```powershell)"
        >
          {seg("raw", "Copy raw")}
          {seg("block", "Copy as block")}
        </div>
        <button
          onClick={onToggleCompact}
          aria-label={compact ? "Switch to comfortable view" : "Switch to compact view"}
          title={compact ? "Comfortable view" : "Compact view"}
          className="rounded-lg border border-line p-2 text-content-dim transition-colors duration-150 hover:border-line-hover hover:text-content"
        >
          {compact ? <LayoutGrid size={16} /> : <Rows3 size={16} />}
        </button>
      </div>
      {idle ? null : (
        <div className="mx-auto mt-1 max-w-[1600px] text-xs text-content-dim sm:hidden">
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
