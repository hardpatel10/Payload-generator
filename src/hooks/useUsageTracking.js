import { useCallback } from "react";
import { useLocalStorage } from "./hooks.js";

/**
 * Deprecated/unused: previously backed the "Most-Added to Reports" dashboard panel, which was
 * replaced by the static "OWASP Coverage" panel (derived from commands.js, so it's populated for
 * every user — see src/utils/stats.js#owaspCoverage) because a usage-based panel is empty on
 * every fresh browser. Kept here, unused, in case per-user usage tracking is wanted again.
 *
 * Persistent all-time "added to report" counters (id -> count). Separate from the report itself, so
 * clearing or exporting a report never resets them.
 */
export const USAGE_KEY = "pch_usage_counts";

export default function useUsageTracking() {
  const [counts, setCounts] = useLocalStorage(USAGE_KEY, {});
  /** Increment (never overwrite) the counter for a command id. */
  const track = useCallback(
    (id) => setCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 })),
    [setCounts]
  );
  return [counts, track];
}
