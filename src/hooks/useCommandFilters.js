import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce, useLocalStorage } from "./hooks.js";
import { subKey } from "../utils/library.js";

/**
 * All filter state + derived results for the command library.
 *
 * Selection model (set of keys: "<Category>" and "<Category>::<Sub>"):
 *  - category on, no sub chosen  -> whole category matches
 *  - category on, subs chosen    -> only those subcategories match
 *  - category off, sub key set   -> that subcategory matches (e.g. restored from a URL)
 * Different categories OR together. Tags AND together. Search and Favorites narrow further.
 * Nothing selected + empty search => idle (no results shown).
 *
 * State is mirrored into the URL query string (?q=&cat=&sub=&tag=&fav=1) so views can be shared.
 */

const hasSubSelected = (selection, category, subs) => subs.some((s) => selection.has(subKey(category, s)));

function readUrl(tree, tagSet) {
  const p = new URLSearchParams(window.location.search);
  const cats = new Map(tree.map((t) => [t.category, t.subcategories]));
  const selection = new Set();
  for (const c of p.getAll("cat")) if (cats.has(c)) selection.add(c);
  for (const k of p.getAll("sub")) {
    const [c, s] = k.split("::");
    if (cats.get(c)?.includes(s)) selection.add(k);
  }
  return {
    search: p.get("q") ?? "",
    selection,
    tags: new Set(p.getAll("tag").filter((t) => tagSet.has(t))),
    fav: p.get("fav") === "1",
  };
}

export default function useCommandFilters(commands, tree, tagList) {
  const tagSet = useMemo(() => new Set(tagList.map((t) => t.tag)), [tagList]);
  const [initial] = useState(() => readUrl(tree, tagSet));

  const [search, setSearch] = useState(initial.search);
  const debounced = useDebounce(search, 200);
  const [selection, setSelection] = useState(initial.selection);
  const [selectedTags, setSelectedTags] = useState(initial.tags);
  const [favoritesOnly, setFavoritesOnly] = useState(initial.fav);
  const [favIds, setFavIds] = useLocalStorage("pencommand-favorites-v1", []);
  const favorites = useMemo(() => new Set(favIds), [favIds]);

  // ── URL sync ──
  useEffect(() => {
    const p = new URLSearchParams();
    if (debounced.trim()) p.set("q", debounced.trim());
    for (const { category, subcategories } of tree) {
      if (selection.has(category)) p.append("cat", category);
      for (const s of subcategories) if (selection.has(subKey(category, s))) p.append("sub", subKey(category, s));
    }
    for (const t of selectedTags) p.append("tag", t);
    if (favoritesOnly) p.set("fav", "1");
    const qs = p.toString();
    const url = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
    window.history.replaceState(null, "", url);
  }, [debounced, selection, selectedTags, favoritesOnly, tree]);

  // ── filtering ──
  const matchesSelection = useCallback(
    (c) => {
      const catOn = selection.has(c.category);
      const key = subKey(c.category, c.subcategory);
      if (!catOn) return selection.has(key);
      const subs = tree.find((t) => t.category === c.category)?.subcategories ?? [];
      return hasSubSelected(selection, c.category, subs) ? selection.has(key) : true;
    },
    [selection, tree]
  );

  const matchesSearch = (c, q) =>
    !q || [c.title, c.command, c.description, ...c.tags].filter(Boolean).some((f) => f.toLowerCase().includes(q));

  const idle = selection.size === 0 && selectedTags.size === 0 && !debounced.trim() && !favoritesOnly;

  const visible = useMemo(() => {
    if (idle) return [];
    const q = debounced.trim().toLowerCase();
    return commands.filter((c) => {
      if (selection.size && !matchesSelection(c)) return false;
      for (const t of selectedTags) if (!c.tags.includes(t)) return false;
      if (favoritesOnly && !favorites.has(c.id)) return false;
      return matchesSearch(c, q);
    });
  }, [commands, idle, debounced, selection, selectedTags, favoritesOnly, favorites, matchesSelection]);

  // Live counts per category / subcategory, honouring search + tags (but not the category selection itself).
  const counts = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const out = {};
    for (const c of commands) {
      if ([...selectedTags].some((t) => !c.tags.includes(t))) continue;
      if (!matchesSearch(c, q)) continue;
      out[c.category] = (out[c.category] ?? 0) + 1;
      const k = subKey(c.category, c.subcategory);
      out[k] = (out[k] ?? 0) + 1;
    }
    return out;
  }, [commands, debounced, selectedTags]);

  // ── actions ──
  const toggleCategory = useCallback(
    (category) =>
      setSelection((s) => {
        const next = new Set(s);
        const subs = tree.find((t) => t.category === category)?.subcategories ?? [];
        if (next.has(category) || hasSubSelected(next, category, subs)) {
          next.delete(category);
          for (const sub of subs) next.delete(subKey(category, sub));
        } else next.add(category);
        return next;
      }),
    [tree]
  );

  const toggleSub = useCallback(
    (category, sub) =>
      setSelection((s) => {
        const next = new Set(s);
        const k = subKey(category, sub);
        next.has(k) ? next.delete(k) : next.add(k);
        return next;
      }),
    []
  );

  const toggleTag = useCallback(
    (tag) =>
      setSelectedTags((s) => {
        const next = new Set(s);
        next.has(tag) ? next.delete(tag) : next.add(tag);
        return next;
      }),
    []
  );

  const selectOnlyCategory = useCallback((category) => setSelection(new Set([category])), []);
  const selectOnlySub = useCallback((category, sub) => setSelection(new Set([category, subKey(category, sub)])), []);

  const toggleFavorite = useCallback(
    (id) => setFavIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])),
    [setFavIds]
  );

  /** Clears everything (filters, tags, favourites quick-filter and search) => idle state. */
  const clearAll = useCallback(() => {
    setSelection(new Set());
    setSelectedTags(new Set());
    setFavoritesOnly(false);
    setSearch("");
  }, []);

  const subSelectedCount = [...selection].filter((k) => k.includes("::")).length;
  const hasFilters = selection.size > 0 || selectedTags.size > 0 || favoritesOnly || search.trim() !== "";

  return {
    search, setSearch, debounced,
    selection, selectedTags, favoritesOnly, setFavoritesOnly,
    favorites, toggleFavorite,
    visible, idle, counts, hasFilters,
    /** subcategories + tags currently chosen (shown on the mobile "Filters (N)" button) */
    detailCount: subSelectedCount + selectedTags.size,
    toggleCategory, toggleSub, toggleTag, selectOnlyCategory, selectOnlySub, clearAll,
  };
}
