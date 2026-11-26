import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList } from "lucide-react";
import commands from "./data/commands.js";
import { copyText, useLocalStorage, useMediaQuery } from "./hooks/hooks.js";
import useCommandFilters from "./hooks/useCommandFilters.js";
import { tree, tagList } from "./utils/library.js";
import { formatForCopy } from "./utils/copy.js";
import Header from "./components/Header.jsx";
import SearchBar from "./components/SearchBar.jsx";
import FilterBar from "./components/FilterBar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import CommandGrid from "./components/CommandGrid.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import ReportBuilder, { buildMarkdown } from "./components/ReportBuilder.jsx";
import Toast from "./components/Toast.jsx";

const byId = Object.fromEntries(commands.map((c) => [c.id, c]));

const DASH_KEY = "pencommand-dashboard-open-v2";

/**
 * Dashboard visibility: expanded on the very first visit, then collapsed by default on repeat
 * visits (the user's own toggle is remembered). On mobile it always starts collapsed.
 */
function useDashboardState(isMobile) {
  const [open, setOpen] = useState(() => {
    try {
      const raw = localStorage.getItem(DASH_KEY);
      return raw === null ? true : JSON.parse(raw);
    } catch {
      return true;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // First visit: stay expanded now, but make "collapsed" the default for next time.
  useEffect(() => {
    try {
      if (localStorage.getItem(DASH_KEY) === null) localStorage.setItem(DASH_KEY, "false");
    } catch { /* ignore */ }
  }, []);

  const toggle = () => {
    if (isMobile) return setMobileOpen((v) => !v);
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(DASH_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  return [isMobile ? mobileOpen : open, toggle];
}

export default function App() {
  const f = useCommandFilters(commands, tree, tagList);
  const [report, setReport] = useLocalStorage("pencommand-report-v1", []); // [{ id, notes }]
  const [compact, setCompact] = useLocalStorage("pencommand-compact-v1", false);
  const [copyMode, setCopyMode] = useLocalStorage("pencommand-copy-mode-v1", "raw"); // "raw" | "block"
  const [reportOpen, setReportOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const isMobile = useMediaQuery("(max-width: 639px)");
  const compactFilters = useMediaQuery("(max-width: 1023px)"); // mobile + tablet: secondary filters live in a sheet
  const [dashOpen, toggleDash] = useDashboardState(isMobile);

  const toast = useCallback((message) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2000);
  }, []);

  // ⌘K / Ctrl+K opens the palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── actions ──
  const handleCopy = async (entry) => {
    const ok = await copyText(formatForCopy(entry, copyMode));
    toast(ok ? (copyMode === "block" ? "Copied as code block" : "Copied to clipboard") : "Copy failed");
    return ok;
  };

  const addToReport = (entry) => {
    if (report.some((x) => x.id === entry.id)) return; // already in the report: no-op
    setReport((r) => [...r, { id: entry.id, notes: "" }]);
    toast("Added to report");
  };
  const reportItems = report.filter((r) => byId[r.id]).map((r) => ({ entry: byId[r.id], notes: r.notes }));
  const reportIds = useMemo(() => new Set(report.map((r) => r.id)), [report]);

  const reorder = (fromId, toId) =>
    setReport((r) => {
      const from = r.findIndex((x) => x.id === fromId);
      const to = r.findIndex((x) => x.id === toId);
      if (from < 0 || to < 0) return r;
      const next = [...r];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  const copyAll = async () => {
    const ok = await copyText(buildMarkdown(reportItems));
    toast(ok ? "Report copied to clipboard" : "Copy failed");
  };

  const download = () => {
    const blob = new Blob([buildMarkdown(reportItems)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pentest-report.md";
    a.click();
    URL.revokeObjectURL(url);
    toast("Report downloaded");
  };

  const paletteActions = [
    { id: "report", label: "Open report builder", run: () => setReportOpen(true) },
    { id: "clear", label: "Clear all filters", run: f.clearAll },
    { id: "favorites", label: "Show favorites", run: () => f.setFavoritesOnly(true) },
    { id: "dashboard", label: dashOpen ? "Hide dashboard" : "Show dashboard", run: toggleDash },
  ];
  const paletteNav = {
    pickCategory: f.selectOnlyCategory,
    pickSub: f.selectOnlySub,
    toggleTag: f.toggleTag,
    searchFor: f.setSearch,
  };

  return (
    <div className="relative min-h-screen">
      {/* Static blurred glow orbs behind everything */}
      <div className="glow-orb -left-40 -top-40 h-[800px] w-[800px]" style={{ background: "radial-gradient(circle, var(--bg-glow-indigo), transparent 70%)" }} />
      <div className="glow-orb -right-40 top-1/4 h-[700px] w-[700px]" style={{ background: "radial-gradient(circle, var(--bg-glow-violet), transparent 70%)" }} />
      <div className="glow-orb -bottom-60 -right-20 h-[800px] w-[800px]" style={{ background: "radial-gradient(circle, var(--bg-glow-teal), transparent 70%)" }} />

      <Header
        stats={{ commands: commands.length, categories: tree.length, tags: tagList.length }}
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenReport={() => setReportOpen(true)}
        reportCount={reportItems.length}
        reportOpen={reportOpen}
      />

      <div className={`relative z-[1] pt-14 transition-[margin] duration-200 ${reportOpen ? "lg:mr-[380px]" : ""}`}>
        {/* Search + filters stay visible while scrolling */}
        <div className="sticky top-14 z-30 border-b border-line bg-page/80 backdrop-blur-md">
          <SearchBar
            value={f.search}
            onChange={f.setSearch}
            resultCount={f.visible.length}
            idle={f.idle}
            compact={compact}
            onToggleCompact={() => setCompact((c) => !c)}
            copyMode={copyMode}
            onSetCopyMode={setCopyMode}
          />
          <FilterBar
            tree={tree}
            selection={f.selection}
            counts={f.counts}
            selectedTags={f.selectedTags}
            favoritesOnly={f.favoritesOnly}
            favoriteCount={f.favorites.size}
            onToggleCategory={f.toggleCategory}
            onToggleSub={f.toggleSub}
            onToggleTag={f.toggleTag}
            onToggleFavorites={() => f.setFavoritesOnly((v) => !v)}
            onClear={f.clearAll}
            hasFilters={f.hasFilters}
            detailCount={f.detailCount}
            compactLayout={compactFilters}
          />
        </div>

        <Dashboard commands={commands} open={dashOpen} onToggle={toggleDash} />

        <main className="mx-auto max-w-[1600px] p-4">
          <CommandGrid
            items={f.visible}
            idle={f.idle}
            onPickCategory={f.selectOnlyCategory}
            reportIds={reportIds}
            favorites={f.favorites}
            onToggleFavorite={f.toggleFavorite}
            onCopy={handleCopy}
            onAddToReport={addToReport}
            onTagClick={f.toggleTag}
            activeTags={f.selectedTags}
            query={f.debounced}
            compact={compact}
            reportOpen={reportOpen}
            onClear={f.clearAll}
          />
        </main>
      </div>

      {!reportOpen && (
        <button
          onClick={() => setReportOpen(true)}
          aria-label="Open report builder"
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-line-hover bg-raised text-accent-indigo shadow-xl shadow-black/40 transition-transform duration-200 hover:scale-105"
        >
          <ClipboardList size={22} />
          {reportItems.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-indigo px-1 text-xs font-semibold text-content-onAccent">
              {reportItems.length}
            </span>
          )}
        </button>
      )}

      <ReportBuilder
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        items={reportItems}
        onNotes={(id, notes) => setReport((r) => r.map((x) => (x.id === id ? { ...x, notes } : x)))}
        onRemove={(id) => setReport((r) => r.filter((x) => x.id !== id))}
        onReorder={reorder}
        onClearAll={() => setReport([])}
        onCopyAll={copyAll}
        onDownload={download}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
        actions={paletteActions}
        nav={paletteNav}
      />

      <Toast toasts={toasts} offset={reportOpen} />
    </div>
  );
}
