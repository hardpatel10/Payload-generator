import commands, { CATEGORIES } from "../data/commands.js";

/** Category -> subcategories tree, derived from the data so new entries appear automatically. */
export const tree = (() => {
  const cats = [...new Set([...CATEGORIES, ...commands.map((c) => c.category)])];
  return cats
    .map((category) => ({
      category,
      subcategories: [...new Set(commands.filter((c) => c.category === category).map((c) => c.subcategory))],
    }))
    .filter((c) => c.subcategories.length);
})();

/** All tags with usage counts, most-used first (then alphabetical). */
export const tagList = (() => {
  const m = new Map();
  for (const c of commands) for (const t of c.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
})();

export const subKey = (category, sub) => `${category}::${sub}`;
