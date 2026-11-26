import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { CATEGORY_META, DEFAULT_META } from "./categoryMeta.js";
import { tagStyle } from "../utils/tagColors.js";
import { subKey, tagList } from "../utils/library.js";

const pill = "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150";
const inactive = "border-line bg-white/[0.02] text-content-secondary hover:border-line-hover hover:text-content";

/** Searchable multi-select list of tags with counts (used in the popover and the mobile sheet). */
function TagPicker({ selectedTags, onToggle, autoFocus }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => tagList.filter((t) => t.tag.toLowerCase().includes(q.trim().toLowerCase())), [q]);
  return (
    <div>
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-content-dim" />
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${tagList.length} tags…`}
          aria-label="Search tags"
          className="w-full rounded-lg border border-line bg-surface py-1.5 pl-8 pr-2 text-sm text-content placeholder:text-content-dim focus:border-accent-cyan/70 focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
        />
      </div>
      <ul className="mt-2 max-h-64 space-y-0.5 overflow-y-auto pr-1" role="listbox" aria-multiselectable="true">
        {list.length === 0 && <li className="px-2 py-3 text-center text-xs text-content-dim">No tags match</li>}
        {list.map(({ tag, count }) => {
          const on = selectedTags.has(tag);
          return (
            <li key={tag}>
              <button
                role="option"
                aria-selected={on}
                onClick={() => onToggle(tag)}
                className="cat-indigo flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm text-content-secondary transition-colors duration-150 hover:bg-white/5 hover:text-content"
              >
                <input type="checkbox" readOnly checked={on} tabIndex={-1} className="ui-check pointer-events-none" />
                <span className="flex-1">{tag}</span>
                <span className="rounded-full bg-raised px-2 text-[11px] leading-5">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Tags dropdown (popover combobox) for desktop. */
function TagPopover({ selectedTags, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${pill} ${selectedTags.size ? "border-accent-cyan/40 bg-accent-cyan/[0.12] text-accent-cyan" : inactive}`}
      >
        Tags{selectedTags.size > 0 && ` (${selectedTags.size})`}
        <ChevronDown size={13} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 animate-fadeIn rounded-xl border border-line-hover bg-panel p-3 shadow-2xl shadow-black/50">
          <TagPicker selectedTags={selectedTags} onToggle={onToggle} autoFocus />
        </div>
      )}
    </div>
  );
}

/** Mobile/tablet bottom sheet holding the secondary filters (subcategories + tags). */
function FilterSheet({ open, onClose, tree, selection, counts, selectedTags, onToggleSub, onToggleTag, onClear, hasFilters }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  // Portal: the sticky filter container uses backdrop-filter, which would otherwise become the
  // containing block for this fixed overlay and clip it.
  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-end bg-page/70 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label="Filters"
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full animate-fadeIn overflow-y-auto rounded-t-2xl border border-line-hover bg-panel p-4 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Filters</h2>
          <button onClick={onClose} aria-label="Close filters" className="text-content-dim hover:text-content"><X size={20} /></button>
        </div>

        <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-content-dim">Subcategories</h3>
        <div className="space-y-3">
          {tree.map(({ category, subcategories }) => {
            const meta = CATEGORY_META[category] ?? DEFAULT_META;
            return (
              <div key={category}>
                <div className={`mb-1.5 text-xs font-medium ${meta.text}`}>{category}</div>
                <div className="flex flex-wrap gap-1.5">
                  {subcategories.map((sub) => {
                    const on = selection.has(subKey(category, sub));
                    return (
                      <button
                        key={sub}
                        aria-pressed={on}
                        onClick={() => onToggleSub(category, sub)}
                        className={`${pill} ${on ? meta.badge : inactive}`}
                      >
                        {sub} <span className="opacity-70">{counts[subKey(category, sub)] ?? 0}</span>
                        {on && <X size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="mb-2 mt-5 text-[11px] font-medium uppercase tracking-[0.06em] text-content-dim">Tags</h3>
        <TagPicker selectedTags={selectedTags} onToggle={onToggleTag} />

        <div className="mt-4 flex gap-2">
          <button onClick={onClear} disabled={!hasFilters} className="flex-1 rounded-lg border border-line py-2 text-sm text-content-secondary disabled:opacity-40">
            Clear all filters
          </button>
          <button onClick={onClose} className="flex-1 rounded-lg bg-gradient-to-r from-accent-indigo to-accent-violet py-2 text-sm font-medium text-white">
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Horizontal filter bar (replaces the sidebar).
 * Row 1: Favorites + category pills (+ Tags popover / "Filters (N)" button, Clear all)
 * Row 2: subcategory chips for each active category (desktop)
 * Row 3: selected tags as removable chips
 */
export default function FilterBar({
  tree, selection, counts, selectedTags, favoritesOnly, favoriteCount,
  onToggleCategory, onToggleSub, onToggleTag, onToggleFavorites, onClear,
  hasFilters, detailCount, compactLayout,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCats = tree.filter(
    (t) => selection.has(t.category) || t.subcategories.some((s) => selection.has(subKey(t.category, s)))
  );

  return (
    <div className="border-t border-line/60 px-4 py-2.5">
      <div className="mx-auto max-w-[1600px] space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleFavorites}
            aria-pressed={favoritesOnly}
            className={`${pill} ${favoritesOnly ? "border-accent-amber/50 bg-accent-amber/20 text-accent-amber" : inactive}`}
          >
            <Star size={13} className={favoritesOnly ? "fill-current" : ""} /> Favorites
            <span className="opacity-70">{favoriteCount}</span>
          </button>

          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

          {tree.map(({ category }) => {
            const meta = CATEGORY_META[category] ?? DEFAULT_META;
            const Icon = meta.icon;
            const on = activeCats.some((t) => t.category === category);
            return (
              <button
                key={category}
                onClick={() => onToggleCategory(category)}
                aria-pressed={on}
                className={`${pill} ${on ? meta.badge : inactive}`}
              >
                <Icon size={14} className={on ? "" : meta.text} />
                {category}
                <span className="opacity-70">{counts[category] ?? 0}</span>
              </button>
            );
          })}

          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

          {compactLayout ? (
            <button onClick={() => setSheetOpen(true)} className={`${pill} ${detailCount ? "border-accent-cyan/40 bg-accent-cyan/[0.12] text-accent-cyan" : inactive}`}>
              <SlidersHorizontal size={13} /> Filters ({detailCount})
            </button>
          ) : (
            <TagPopover selectedTags={selectedTags} onToggle={onToggleTag} />
          )}

          <button
            onClick={onClear}
            disabled={!hasFilters}
            className="ml-auto text-xs text-content-secondary transition-colors duration-150 hover:text-content disabled:opacity-40 disabled:hover:text-content-secondary"
          >
            Clear all filters
          </button>
        </div>

        {!compactLayout && activeCats.length > 0 && (
          <div className="space-y-1.5">
            {activeCats.map(({ category, subcategories }) => {
              const meta = CATEGORY_META[category] ?? DEFAULT_META;
              return (
                <div key={category} className="flex flex-wrap items-center gap-1.5">
                  <span className={`mr-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] ${meta.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {category}
                  </span>
                  {subcategories.map((sub) => {
                    const on = selection.has(subKey(category, sub));
                    return (
                      <button
                        key={sub}
                        aria-pressed={on}
                        onClick={() => onToggleSub(category, sub)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs transition-colors duration-150 ${on ? meta.badge : inactive}`}
                      >
                        {sub} <span className="opacity-70">{counts[subKey(category, sub)] ?? 0}</span>
                        {on && <X size={11} aria-label="remove" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {!compactLayout && selectedTags.size > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-dim">Tags</span>
            {[...selectedTags].map((tag) => (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                aria-label={`Remove tag ${tag}`}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${tagStyle(tag).active}`}
              >
                {tag} <X size={11} />
              </button>
            ))}
          </div>
        )}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        tree={tree}
        selection={selection}
        counts={counts}
        selectedTags={selectedTags}
        onToggleSub={onToggleSub}
        onToggleTag={onToggleTag}
        onClear={onClear}
        hasFilters={hasFilters}
      />
    </div>
  );
}
