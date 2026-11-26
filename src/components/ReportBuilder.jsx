import { useState } from "react";
import { X, Trash2, GripVertical, Copy, Download, ClipboardList } from "lucide-react";
import { CATEGORY_META, DEFAULT_META } from "./categoryMeta.js";

/** Group report items by category (first-appearance order), preserving item order within each group. */
export function groupByCategory(items) {
  const groups = [];
  for (const it of items) {
    let g = groups.find((x) => x.category === it.entry.category);
    if (!g) groups.push((g = { category: it.entry.category, items: [] }));
    g.items.push(it);
  }
  return groups;
}

/** Build the Markdown report, with a heading per category. */
export function buildMarkdown(items) {
  return groupByCategory(items)
    .map(
      ({ category, items: group }) =>
        `# ${category}\n\n` +
        group
          .map(({ entry, notes }) => {
            const body = entry.referenceOnly
              ? `**Reference:** ${entry.referenceUrl}`
              : `**Command:**\n\`\`\`\n${entry.command}\n\`\`\``;
            return `## ${entry.title}\n${body}\n**Notes:** ${notes || ""}\n**Tags:** ${entry.tags.join(" ")}\n---\n`;
          })
          .join("\n")
    )
    .join("\n");
}

const sectionLabel = "text-[11px] font-medium uppercase tracking-[0.06em] text-content-dim";

/**
 * Right-hand slide-in panel.
 * `items` = [{ entry, notes }] in report order; displayed grouped by category.
 * Drag-and-drop reorders by entry id (drop onto another item to take its position).
 */
export default function ReportBuilder({ open, onClose, items, onNotes, onRemove, onReorder, onClearAll, onCopyAll, onDownload }) {
  const [dragId, setDragId] = useState(null);
  const groups = groupByCategory(items);
  const primary =
    "flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-indigo to-accent-violet py-2 text-sm font-medium text-white shadow-lg shadow-indigo-950/40 transition-[filter] duration-150 enabled:hover:brightness-110 disabled:opacity-40";

  return (
    <aside
      className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-line bg-panel/95 shadow-2xl shadow-black/50 backdrop-blur-md transition-transform duration-200 sm:w-[380px] ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <h2 className="flex items-center gap-2 font-semibold">
          Report Builder
          <span className="rounded-full bg-raised px-2 text-xs font-normal leading-5 text-content-secondary">{items.length}</span>
        </h2>
        <button onClick={onClose} aria-label="Close report builder" className="text-content-dim transition-colors duration-150 hover:text-content"><X size={20} /></button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {items.length === 0 && (
          <div className="flex animate-fadeIn flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-line-hover bg-surface">
              <ClipboardList size={32} className="text-content-dim" />
            </div>
            <h3 className="font-semibold">Your report is empty</h3>
            <p className="mt-1 max-w-[240px] text-sm text-content-secondary">
              Click “Add to report” on any command card to start assembling findings.
            </p>
          </div>
        )}

        {groups.map(({ category, items: group }) => {
          const meta = CATEGORY_META[category] ?? DEFAULT_META;
          return (
            <section key={category}>
              <h3 className={`${sectionLabel} mb-2 flex items-center gap-2`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {category}
                <span>({group.length})</span>
              </h3>
              <div className="space-y-3">
                {group.map(({ entry, notes }) => (
                  <div
                    key={entry.id}
                    draggable
                    onDragStart={() => setDragId(entry.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragId && dragId !== entry.id) onReorder(dragId, entry.id); setDragId(null); }}
                    onDragEnd={() => setDragId(null)}
                    className={`rounded-xl border border-line bg-surface/80 p-3 transition-opacity ${dragId === entry.id ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={16} className="mt-0.5 shrink-0 cursor-grab text-content-dim" />
                      <div className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                          <span className="truncate">{entry.title}</span>
                        </span>
                        {entry.referenceOnly ? (
                          <a
                            href={entry.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block truncate rounded-lg border border-line bg-raised p-2 text-xs text-accent-cyan hover:underline"
                          >
                            {entry.referenceUrl}
                          </a>
                        ) : (
                          <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-raised p-2 text-xs"><code>{entry.command}</code></pre>
                        )}
                      </div>
                      <button onClick={() => onRemove(entry.id)} aria-label={`Remove ${entry.title}`} className="text-content-dim transition-colors duration-150 hover:text-accent-rose">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <label className={`${sectionLabel} mt-3 block`}>Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => onNotes(entry.id, e.target.value)}
                      placeholder="Notes / findings…"
                      rows={3}
                      className="mt-1 w-full resize-y rounded-lg border border-line bg-page/60 p-2 text-sm text-content placeholder:text-content-dim transition-[border-color,box-shadow] duration-150 focus:border-accent-cyan/70 focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-line p-4">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onCopyAll} disabled={!items.length} className={primary}>
            <Copy size={14} /> Copy all
          </button>
          <button onClick={onDownload} disabled={!items.length} className={primary}>
            <Download size={14} /> Download .md
          </button>
        </div>
        <button onClick={onClearAll} disabled={!items.length} className="w-full text-xs text-content-dim transition-colors duration-150 enabled:hover:text-accent-rose disabled:opacity-40">
          Clear report
        </button>
      </div>
    </aside>
  );
}
