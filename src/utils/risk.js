/**
 * Risk severity for an entry's riskNote.
 *  - "high": lockout / brute-force / destructive / production-impact / credential risk (rose)
 *  - "low":  general cautions (amber)
 *  - null:   no risk note
 *
 * An entry can override the heuristic with an optional `riskLevel: "high" | "low"` field in commands.js.
 */
const HIGH_RE = /lockout|brute|destructive|production|credential/i;

export function riskSeverity(entry) {
  if (!entry.riskNote) return null;
  if (entry.riskLevel === "high" || entry.riskLevel === "low") return entry.riskLevel;
  return HIGH_RE.test(entry.riskNote) ? "high" : "low";
}
