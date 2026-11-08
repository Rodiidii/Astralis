# Astralis UI foundation

`design-system.css` is loaded last so it can unify the existing vanilla-JS UI without replacing application behavior. It aliases user-configured tokens (`--bg`, `--surface`, `--surface-2`, `--ink`, `--muted`, `--line`, `--accent`) and honors light theme, character/game accents, custom radius, and reduced motion.

## Shared component classes

| Component | Existing semantic hooks | Contract |
|---|---|---|
| Button | `.quiet-btn`, `.button-primary`, `.filter-toggle`, `.view-toggle` | Rounded, focus-visible, pressed feedback |
| Field | `input`, `select`, `textarea` | Inherits site typography, token border and focus |
| Searchable illustrated select | `.picker-*` | Existing picker overlay; retain image/name rows and search |
| Selector / tabs | `.game-choice`, `.game-tab`, `.detail-tabs` | Active state follows game or accent token |
| Card / tile | `.archive-card`, `.task-card`, `.note-card`, `.team-sheet`, `.panel`, `.card` | Shared border, surface and subtle elevation |
| Badge | `.eyebrow`, `small`, `.nav-update-badge` | Compact metadata, accent-led |
| Gauge / chart | Existing `.progress-*`, `.chart-*`, `.wish-*` hooks | Must use theme tokens and responsive sizing |
| Side panel | `.side-rail`, `.modal-card`, `.detail-modal` | Independent contained scroll |
| Table | `.calc-table`, `.stats-table`, `table` | Existing semantic table structure |
| Empty / loading / notification | `.empty-state`, `.loading-skeleton`, `.toast-message` | Explicit states; reduced-motion safe |

## Page templates

`src/design-system.js` annotates `#page-content` with `data-template` and `data-section` after route changes. `catalog` covers characters, weapons, sets, materials; `detail` covers modal detail sheets; `tool` covers team/build/lab/calcs/farm/endgame/profile/wishes tools; `dashboard` is the modular dashboard. These annotations are a migration seam: page-specific markup can move into these templates incrementally without changing route/state ownership.

The rail search is injected once per rendered rail, supports accent-insensitive filtering and Enter-to-open, and Ctrl+K / Cmd+K focuses it. The game/library sections are native collapsible details groups. Modal scroll is contained and the page behind it is locked while the modal is open.
