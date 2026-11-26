import { SearchX, MousePointerClick } from "lucide-react";
import { CATEGORY_META, DEFAULT_META } from "./categoryMeta.js";
import { tree } from "../utils/library.js";
import CommandCard from "./CommandCard.jsx";

/** Bold divider row labelling one subcategory's section when browsing within a single category. */
function SectionHeader({ category, subcategory, count, first }) {
  const meta = CATEGORY_META[category] ?? DEFAULT_META;
  const Icon = meta.icon;
  return (
    <div className={`mb-3 flex items-center gap-3 ${first ? "" : "mt-8"}`}>
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${meta.tile}`}>
        <Icon size={14} />
      </span>
      <h2 className="whitespace-nowrap text-base font-semibold text-content">{subcategory}</h2>
      <span className="rounded-full bg-raised px-2 text-xs leading-5 text-content-secondary">{count}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Responsive grid (1 col mobile, 2 col desktop, 3 col on desktop (4 compact)) with an empty state. */
export default function CommandGrid({ items, reportIds, onCopy, onAddToReport, onTagClick, activeTags, onClear, query, compact, idle, onPickCategory, favorites, onToggleFavorite, reportOpen }) {
  if (idle) {
    return (
      <div className="flex animate-fadeIn flex-col items-center justify-center py-20 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-indigo/25 text-accent-indigo">
          <MousePointerClick size={26} />
        </span>
        <h2 className="text-lg font-semibold">Select a category, subcategory, or tag to browse commands</h2>
        <p className="mt-1 max-w-md text-sm text-content-secondary">Or start typing in the search box. Quick picks:</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {Object.entries(CATEGORY_META).map(([name, meta]) => {
            const Icon = meta.icon;
            return (
              <button
                key={name}
                onClick={() => onPickCategory(name)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-[filter] duration-150 hover:brightness-125 ${meta.badge}`}
              >
                <Icon size={16} /> {name}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
        <SearchX size={40} className="mb-4 text-content-dim" />
        <h2 className="text-lg font-semibold">No commands found</h2>
        <p className="mt-1 max-w-sm text-sm text-content-secondary">
          Nothing matches your search or filters. Try different keywords or clear the filters.
        </p>
        <button onClick={onClear} className="mt-4 rounded-lg border border-line px-3 py-1.5 text-sm text-content-secondary transition-colors duration-150 hover:border-line-hover hover:text-content">
          Clear search &amp; filters
        </button>
      </div>
    );
  }

  const gridClass = `grid grid-cols-1 lg:grid-cols-2 ${compact ? "gap-2" : "gap-4"} ${
    // The report panel pushes content on desktop, so only go wider when there is room.
    reportOpen
      ? compact ? "min-[1500px]:grid-cols-3 min-[1900px]:grid-cols-4" : "min-[1700px]:grid-cols-3"
      : compact ? "xl:grid-cols-3 min-[1700px]:grid-cols-4" : "xl:grid-cols-3"
  }`;

  const card = (entry) => (
    <CommandCard
      key={entry.id}
      entry={entry}
      inReport={reportIds.has(entry.id)}
      isFavorite={favorites.has(entry.id)}
      onToggleFavorite={onToggleFavorite}
      onCopy={onCopy}
      onAddToReport={onAddToReport}
      onTagClick={onTagClick}
      activeTags={activeTags}
      query={query}
      compact={compact}
    />
  );

  // Browsing within "Payloads" specifically — group results under a bold section header per
  // subcategory, like a structured index. Web/Android/Thick Client (and any mixed view across
  // categories) keep the plain flat grid: this grouped display is scoped to Payloads only.
  const isPayloadsOnly = items.every((e) => e.category === "Payloads");
  if (isPayloadsOnly) {
    const subcats = tree.find((t) => t.category === "Payloads")?.subcategories ?? [];
    const groups = subcats
      .map((subcategory) => ({ subcategory, group: items.filter((e) => e.subcategory === subcategory) }))
      .filter((g) => g.group.length > 0);
    return (
      <div>
        {groups.map(({ subcategory, group }, i) => (
          <section key={subcategory}>
            <SectionHeader category="Payloads" subcategory={subcategory} count={group.length} first={i === 0} />
            <div className={gridClass}>{group.map(card)}</div>
          </section>
        ))}
      </div>
    );
  }

  return <div className={gridClass}>{items.map(card)}</div>;
}
