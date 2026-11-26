/** Language hint for fenced code blocks. */
export function codeLang(entry) {
  if (entry.category === "Thick Client") return "powershell";
  if (/^\s*</.test(entry.command ?? "")) return "html";
  return "bash";
}

/**
 * "raw" copies the command as-is; "block" wraps it in a fenced Markdown code block.
 * referenceOnly entries (no `command`) have no copy button, but this stays defensive.
 */
export function formatForCopy(entry, mode) {
  if (entry.referenceOnly) return entry.referenceUrl ?? "";
  return mode === "block" ? "```" + codeLang(entry) + "\n" + entry.command + "\n```" : entry.command;
}
