import { Command } from "cmdk";
import { Search, Layers, Tag, Terminal, Zap } from "lucide-react";
import { CATEGORY_META, DEFAULT_META } from "./categoryMeta.js";
import { tree, tagList } from "../utils/library.js";

const group =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-content-dim";
const item =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-secondary data-[selected=true]:bg-white/10 data-[selected=true]:text-content";

/** Every search word must appear somewhere in the item's keywords. */
const filter = (_value, search, keywords = []) => {
  const hay = keywords.join(" ").toLowerCase();
  return search.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w)) ? 1 : 0;
};

/**
 * ⌘K / Ctrl+K palette: jump to a category, subcategory or tag, run an action, or search for a command.
 */
export default function CommandPalette({ open, onClose, commands, actions, nav }) {
  if (!open) return null;
  const run = (fn) => () => {
    fn();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-page/70 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onClose}>
      <Command
        label="Command palette"
        filter={filter}
        loop
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="w-full max-w-xl animate-fadeIn overflow-hidden rounded-xl border border-line-hover bg-panel shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={16} className="text-content-dim" />
          <Command.Input
            autoFocus
            placeholder="Jump to a category, tag, command or action…"
            className="h-12 w-full bg-transparent text-sm text-content placeholder:text-content-dim focus:outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-content-dim">ESC</kbd>
        </div>
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-content-dim">No matches</Command.Empty>

          <Command.Group heading="Actions" className={group}>
            {actions.map((a) => (
              <Command.Item key={a.id} value={`action:${a.id}`} keywords={["action", a.label]} onSelect={run(a.run)} className={item}>
                <Zap size={15} className="text-accent-amber" /> {a.label}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Categories" className={group}>
            {tree.map(({ category }) => {
              const meta = CATEGORY_META[category] ?? DEFAULT_META;
              const Icon = meta.icon;
              return (
                <Command.Item key={category} value={`cat:${category}`} keywords={["category", category]} onSelect={run(() => nav.pickCategory(category))} className={item}>
                  <Icon size={15} className={meta.text} /> {category}
                </Command.Item>
              );
            })}
          </Command.Group>

          <Command.Group heading="Subcategories" className={group}>
            {tree.flatMap(({ category, subcategories }) =>
              subcategories.map((sub) => {
                const meta = CATEGORY_META[category] ?? DEFAULT_META;
                return (
                  <Command.Item
                    key={`${category}::${sub}`}
                    value={`sub:${category}::${sub}`}
                    keywords={["subcategory", category, sub]}
                    onSelect={run(() => nav.pickSub(category, sub))}
                    className={item}
                  >
                    <Layers size={15} className={meta.text} />
                    {sub} <span className="ml-auto text-xs text-content-dim">{category}</span>
                  </Command.Item>
                );
              })
            )}
          </Command.Group>

          <Command.Group heading="Tags" className={group}>
            {tagList.map(({ tag, count }) => (
              <Command.Item key={tag} value={`tag:${tag}`} keywords={["tag", tag]} onSelect={run(() => nav.toggleTag(tag))} className={item}>
                <Tag size={15} className="text-accent-cyan" /> {tag}
                <span className="ml-auto text-xs text-content-dim">{count}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Commands" className={group}>
            {commands.map((c) => (
              <Command.Item
                key={c.id}
                value={`cmd:${c.id}`}
                keywords={["command", c.title, c.command ?? c.referenceUrl ?? "", c.subcategory, ...c.tags]}
                onSelect={run(() => nav.searchFor(c.title))}
                className={item}
              >
                <Terminal size={15} className="text-accent-indigo" />
                <span className="truncate">{c.title}</span>
                <span className="ml-auto shrink-0 text-xs text-content-dim">{c.category}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
