/**
 * Pure aggregation helpers for the dashboard. Everything is derived from the
 * commands array at render time — no separate data files.
 */

import { OWASP_TOP10, OWASP_TAG_RE } from "./owasp.js";

/** Count occurrences into a Map. */
const tally = (items, keyFn) => {
  const m = new Map();
  for (const it of items) {
    const k = keyFn(it);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
};

/**
 * @param {Array} commands  command entries
 * @param {Record<string,string>} categoryColors  category name -> hex colour
 * @param {number} topN  how many top tags to return
 */
export function computeStats(commands, categoryColors = {}, topN = 10) {
  const catCounts = tally(commands, (c) => c.category);
  const byCategory = [...catCounts].map(([name, value]) => ({ name, value, color: categoryColors[name] ?? "#818cf8" }));

  // Subcategories, grouped by category in the order categories first appear
  const subCounts = tally(commands, (c) => `${c.category}::${c.subcategory}`);
  const bySubcategory = [];
  for (const { name: category, color } of byCategory) {
    for (const [key, value] of subCounts) {
      const [cat, sub] = key.split("::");
      if (cat === category) bySubcategory.push({ name: sub, category, value, color });
    }
  }

  const tagCounts = tally(commands.flatMap((c) => c.tags), (t) => t);
  const topTags = [...tagCounts]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, topN);

  return {
    total: commands.length,
    categoryCount: catCounts.size,
    tagCount: tagCounts.size,
    riskCount: commands.filter((c) => c.riskNote).length,
    byCategory,
    bySubcategory,
    topTags,
  };
}

/**
 * Per-category risk coverage: how many commands carry a riskNote.
 * @returns {{name:string,color:string,flagged:number,total:number}[]}
 */
export function riskCoverage(commands, categoryColors = {}) {
  const order = [...new Set(commands.map((c) => c.category))];
  return order.map((name) => {
    const inCat = commands.filter((c) => c.category === name);
    return { name, color: categoryColors[name] ?? "#818cf8", flagged: inCat.filter((c) => c.riskNote).length, total: inCat.length };
  });
}

/**
 * Deprecated: the "Most-Added to Reports" dashboard panel (which used this) has been replaced
 * by the static "OWASP Coverage" panel (see owaspCoverage below), since a usage-based panel is
 * empty for every new user/fresh browser. Kept, unused, in case usage-based reporting returns
 * in a form with real (e.g. server-side, cross-user) data.
 *
 * Top-N commands by all-time "added to report" count.
 * @param {Record<string, number>} counts  id -> count
 * @returns {{id:string,title:string,category:string,count:number}[]} (ids no longer in the library are skipped)
 */
export function topUsed(commands, counts = {}, n = 5) {
  const byId = new Map(commands.map((c) => [c.id, c]));
  return Object.entries(counts)
    .filter(([id, count]) => byId.has(id) && count > 0)
    .map(([id, count]) => ({ id, title: byId.get(id).title, category: byId.get(id).category, count }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    .slice(0, n);
}

/** One true, data-derived insight for the donut panel: the largest category by command count. */
export function largestCategory(byCategory, total) {
  if (!byCategory.length || !total) return null;
  const top = [...byCategory].sort((a, b) => b.value - a.value)[0];
  return { name: top.name, count: top.value, pct: Math.round((top.value / total) * 100) };
}

/**
 * How the command library maps onto the OWASP Top 10 (2021), from each command's own
 * `#owasp-aNN` tags. Always derived straight from commands.js, so it's non-empty and
 * identical for every user — no dependency on report-builder or other user activity.
 * @returns {{id:string,name:string,count:number}[]} sorted by count desc, then OWASP id
 */
export function owaspCoverage(commands) {
  const counts = new Map();
  for (const c of commands) {
    for (const tag of c.tags) {
      const m = OWASP_TAG_RE.exec(tag);
      if (m) {
        const id = `A${m[1]}:2021`;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
  }
  return [...counts]
    .map(([id, count]) => ({ id, name: OWASP_TOP10[id] ?? "Uncategorized", count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}
