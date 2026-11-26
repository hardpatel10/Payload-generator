// NOTE: Not used in the current layout (replaced by FilterBar + useCommandFilters). Kept for reference.
import { ChevronDown, ChevronRight, PanelLeftOpen, PanelLeftClose, X } from "lucide-react";
import { useState } from "react";
import { CATEGORY_META, DEFAULT_META } from "./categoryMeta.js";
import { tagStyle } from "../utils/tagColors.js";

const label = "text-[11px] font-medium uppercase tracking-[0.06em] text-content-dim";

/** Small count pill. */
function Count({ n }) {
  return <span className="shrink-0 rounded-full bg-raised px-2 text-[11px] leading-5 text-content-secondary">{n}</span>;
}

/**
 * Filter sidebar (sits below the fixed header).
 * mode: "full" (desktop / expanded tablet) | "rail" (collapsed tablet, icons only) | "drawer" (mobile)
 *
 * `selection` is a Set of keys: "<Category>" or "<Category>::<Subcategory>".
 * A command matches if its category key OR its subcategory key is in the set.
 */
export default function Sidebar({
  tree, selection, onToggleSelection, onSetCategory, counts,
  tags, selectedTags, onToggleTag,
  onClear, hasFilters,
  mode, open, onClose, onToggleRail,
}) {
  const [expanded, setExpanded] = useState({});
  const allSelected = (category, subs) =>
    selection.has(category) && subs.every((s) => selection.has(`${category}::${s}`));

  const base =
    "fixed left-0 top-14 z-40 h-[calc(100%-3.5rem)] border-r border-line bg-panel/95 backdrop-blur-md flex flex-col transition-all duration-200";
  const pos =
    mode === "drawer"
      ? `w-[280px] ${open ? "translate-x-0" : "-translate-x-full"}`
      : mode === "rail"
      ? "w-16"
      : "w-[272px]";

  if (mode === "rail") {
    return (
      <aside className={`${base} ${pos} items-center gap-2 py-3`}>
        <button onClick={onToggleRail} aria-label="Expand sidebar" className="rounded-md p-2 text-content-secondary hover:bg-white/5 hover:text-content">
          <PanelLeftOpen size={20} />
        </button>
        {tree.map(({ category }) => {
          const meta = CATEGORY_META[category] ?? DEFAULT_META;
          const Icon = meta.icon;
          const active = selection.has(category);
          return (
            <button
              key={category}
              title={category}
              onClick={() => onToggleSelection(category)}
              className={`rounded-full p-2 transition-colors duration-150 ${meta.tile} ${active ? "ring-1 ring-current" : "opacity-80 hover:opacity-100"}`}
            >
              <Icon size={18} />
            </button>
          );
        })}
        {hasFilters && (
          <button title="Clear filters" onClick={onClear} className="mt-2 rounded-md p-2 text-content-secondary hover:bg-white/5 hover:text-content">
            <X size={18} />
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside className={`${base} ${pos}`}>
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <h3 className={label}>Categories</h3>
        {mode === "drawer" ? (
          <button onClick={onClose} aria-label="Close filters" className="text-content-secondary hover:text-content"><X size={18} /></button>
        ) : (
          mode === "full" && onToggleRail && (
            <button onClick={onToggleRail} aria-label="Collapse sidebar" className="text-content-secondary hover:text-content lg:hidden"><PanelLeftClose size={18} /></button>
          )
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-2 py-3">
        <ul className="space-y-2">
          {tree.map(({ category, subcategories }) => {
            const meta = CATEGORY_META[category] ?? DEFAULT_META;
            const Icon = meta.icon;
            const isOpen = expanded[category] ?? true;
            const all = allSelected(category, subcategories);
            return (
              <li key={category} className={`${meta.cat} relative overflow-hidden rounded-lg transition-colors duration-150 ${isOpen ? "bg-surface/70" : ""}`}>
                {isOpen && <span className={`absolute left-0 top-0 h-full w-0.5 ${meta.bar}`} />}
                <div className="flex items-center gap-1 py-1 pl-0.5 pr-2">
                  <button
                    onClick={() => setExpanded((s) => ({ ...s, [category]: !isOpen }))}
                    aria-label={`Toggle ${category} subcategories`}
                    className="p-0.5 text-content-dim hover:text-content"
                  >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 py-1 text-[13px] font-medium text-content">
                    <input
                      type="checkbox"
                      checked={selection.has(category)}
                      onChange={() => onToggleSelection(category)}
                      className="ui-check"
                    />
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${meta.tile}`}>
                      <Icon size={13} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{category}</span>
                    <Count n={counts[category] ?? 0} />
                  </label>
                  <button
                    onClick={() => onSetCategory(category, subcategories, !all)}
                    className={`shrink-0 text-[11px] font-medium uppercase tracking-[0.06em] hover:underline ${meta.text}`}
                  >
                    {all ? "none" : "all"}
                  </button>
                </div>
                {isOpen && (
                  <ul className="mb-2 ml-9 mr-2 space-y-0.5">
                    {subcategories.map((sub) => {
                      const key = `${category}::${sub}`;
                      return (
                        <li key={key}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-xs text-content-secondary transition-colors duration-150 hover:bg-white/[0.04] hover:text-content has-[:checked]:text-content">
                            <input
                              type="checkbox"
                              checked={selection.has(key)}
                              onChange={() => onToggleSelection(key)}
                              className="ui-check"
                            />
                            <span className="flex-1">{sub}</span>
                            <Count n={counts[key] ?? 0} />
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <section>
          <h3 className={`${label} mb-2 px-1`}>Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const active = selectedTags.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] tracking-[0.02em] transition-colors duration-150 ${
                    active ? tagStyle(tag).active : tagStyle(tag).chip
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="border-t border-line p-4">
        <button
          onClick={onClear}
          disabled={!hasFilters}
          className="w-full rounded-lg border border-line py-1.5 text-xs font-medium text-content-secondary transition-colors duration-150 enabled:hover:border-line-hover enabled:hover:text-content disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>
    </aside>
  );
}
