import { Terminal, User, FileDown, Search } from "lucide-react";

const chip = "rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-xs text-content-secondary";

/** Fixed top bar: brand, live stats chips, credit, shortcut hint, primary report action. */
export default function Header({ stats, onOpenPalette, onOpenReport, reportCount, reportOpen }) {
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-header/90 px-4 backdrop-blur-md transition-[right] duration-200 ${
        reportOpen ? "lg:right-[380px]" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-indigo to-accent-violet text-white shadow-md shadow-black/30">
          <Terminal size={16} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-content">PenCommand Hub</span>
      </div>

      <div className="ml-2 hidden items-center gap-2 md:flex">
        <span className={chip}>{stats.commands} commands</span>
        <span className={chip}>{stats.categories} categories</span>
        <span className={`${chip} hidden lg:inline`}>{stats.tags} tags</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 text-xs text-content-dim xl:flex">
          <User size={13} /> Built by Hard Pansara
        </span>
        <button
          onClick={onOpenPalette}
          aria-label="Open command palette"
          title="Command palette (Ctrl/⌘ + K)"
          className="flex items-center gap-1.5 rounded-md border border-line bg-white/[0.03] px-2 py-1 text-content-dim transition-colors duration-150 hover:border-line-hover hover:text-content"
        >
          <Search size={13} className="sm:hidden" />
          <kbd className="hidden font-mono text-[11px] sm:block">⌘K</kbd>
        </button>
        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-indigo to-accent-violet px-3.5 py-1.5 text-sm font-medium text-white shadow-lg shadow-indigo-950/40 transition-[filter] duration-150 hover:brightness-110"
        >
          <FileDown size={15} /> <span className="hidden sm:inline">Export Report</span>
          {reportCount > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-[11px] leading-5">{reportCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
