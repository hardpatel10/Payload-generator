# PenCommand Hub — SaaS Roadmap & Suggestions

PenCommand Hub is currently a single-device, local-first reference tool: the command library
lives in `src/data/commands.js` and everything a user creates (report, favorites, preferences)
lives in `localStorage`. This document lists what would turn it from an internal reference page
into a shippable multi-user product.

## Shipped in the layout/SaaS-readiness pass ("quick wins")

| Feature | Where | Notes |
| --- | --- | --- |
| Command palette (`⌘K` / `Ctrl+K`) | `components/CommandPalette.jsx` (uses `cmdk`) | Jump to a category, subcategory, tag or command, or run an action (open report, clear filters, show favorites, toggle dashboard). |
| Shareable filtered views | `hooks/useCommandFilters.js` | Filters sync to the URL: `?q=&cat=&sub=&tag=&fav=1`. Unknown values are ignored on load. Uses `replaceState`, so filtering does not spam browser history. |
| Copy raw vs. copy as code block | `utils/copy.js`, search row toggle | "Block" wraps the command in a fenced block tagged `bash`, `powershell` or `html`. The choice is remembered. |
| Favorites / pinning | star on each card, "Favorites" pill | Stored in `localStorage` (`pencommand-favorites-v1`). |

## Documented for later (not built)

### 1. Multi-user accounts and team workspaces
Reports, favorites and notes should not be bound to one browser. Needs a backend and auth,
e.g. Supabase (Postgres + auth + row-level security) or a small Node/Postgres API.
Workspaces own libraries, reports and members with roles (viewer / editor / admin).

### 2. Versioned, shared command libraries
Teams maintain their own vetted command sets. Because this is a security tool, changes need an
audit trail: every add/edit/delete is a versioned record (who, when, why), additions go through
an admin review flow, and a report can pin the library version it was written against.

### 3. Report templates
Beyond the Markdown export: branded PDF and DOCX templates matching client deliverable formats
(cover page, scope, per-finding sections, severity tables), with per-workspace branding.

### 4. Usage analytics (self-hosted, privacy-respecting)
Track which commands are added to reports most often so maintainers know what to keep current.
Aggregate counts only — no command contents from reports, no per-user tracking by default;
self-hostable (e.g. Plausible/Umami-style) or opt-in.

### 5. Command freshness indicators
Add a manual `lastVerified` date per command (e.g. "Verified Mar 2026") and render it as a small
badge. Flag entries whose tool had breaking CLI changes, and surface stale ones (e.g. >12 months)
to maintainers.

### 6. Pricing / tiering (future decision, not a build item)
If this were ever offered beyond internal use, the natural split is:
- **Free:** public/standard command library, local-only reports.
- **Paid:** team workspaces, custom/versioned libraries, export templates, audit log.

### 7. Onboarding empty state
First-time users could see a 3-step mini tour (search → filter → add to report) instead of the
bare "select a category" empty state. Show once; store a `seenOnboarding` flag.

## Other suggestions worth considering
- **Sync browser back/forward with filters:** URL state currently uses `replaceState`; switching to
  `pushState` + a `popstate` listener would make filter steps navigable.
- **Import/export of favorites and reports** as JSON to bridge the gap before accounts exist.
- **Accessibility audit** (keyboard order in the filter bar, screen-reader labels on charts).
- **Command schema validation** (e.g. a unit test that checks unique ids and required fields) before
  letting teams edit the library.
- **Scope guardrail in review flow:** keep the "no exploit payloads / malware / bundled credential
  lists" rule from the original brief as an explicit checklist item for library submissions.
