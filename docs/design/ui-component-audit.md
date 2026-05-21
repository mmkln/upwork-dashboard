# UI Component Audit

Date: 2026-05-12
Implementation status: fixes applied on 2026-05-12.

This audit originally checked the UI component layer against the Apple-aligned token and structure rules in this directory. The implementation update below records the fixes that have since been applied.

Scope:

- Public product wrappers in `src/shared/ui`
- Legacy UI exports in `src/components/ui`
- shadcn primitive re-exports exposed through `src/shared/ui`
- Feature-level controls that still import shadcn primitives directly

Severity:

- `High`: breaks token rules, hardcodes visual values, or bypasses the product UI layer.
- `Medium`: works, but still uses old shadcn roles/sizes instead of project semantic tokens.
- `Low`: mostly aligned; cleanup would improve consistency.
- `Aligned`: no meaningful mismatch found in this audit.

## Implementation Update

| Area | Implemented fix |
| --- | --- |
| Product wrappers | `Button`, `IconButton`, `Badge`, `Dropdown`, `ToggleGroup`, `MultiSelect`, `RangeInput`, `ReadOnlyField`, `DetailRow`, `MutedBlock`, `EmptyState`, and `StatCard` now use Apple-aligned semantic tokens and control-size tokens instead of old shadcn `accent`/`muted` roles or hardcoded component sizing. |
| Overlay primitives | `Popover`, `Dialog`, `Command`, `Tooltip`, dropdown menu content, and Radix select content now use material tokens (`bg-material-*`, `border-island-border`, `shadow-premium`, `backdrop-blur-*`) and semantic text/spacing roles. |
| Select architecture | Feature-level shadcn select imports were replaced with shared `RadixSelect*` exports from `src/shared/ui`, preserving Radix behavior while routing usage through the project UI API. |
| Legacy UI | `src/components/ui/Badge` no longer hardcodes rgba color values; it now derives dynamic color from semantic CSS variables. `src/components/ui/Card` uses `shadow-block` for optional elevation. |
| Primitive defaults | shadcn `button`, `input`, `badge`, `card`, `toggle`, `select`, `popover`, `dialog`, `command`, `dropdown-menu`, `tooltip`, and `separator` defaults were aligned because these primitives are exposed through shared wrappers. Card primitives are borderless by default. |
| Card/block elevation | `Card` and block-like chart wrappers now use `bg-block`, `rounded-block`, `p-block`, no default border, and `shadow-block` only when raised/interactive elevation is intentional. |
| Control primitives | `Button`, `IconButton`, `Input`, `Select`, `Textarea`, `MultiSelect`, `Checkbox`, `RangeInput`, shadcn `button`, `input`, `select`, and `toggle` now use the dedicated `bg-control`, `hover:bg-control-hover`, `bg-control-selected`, and `border-control-border` roles instead of content block or island roles. |
| Premium pass | Base tokens now use Athens Gray/Shark/Graphite, Science Blue, restrained Indigo/Purple accents, elevated/chrome surfaces, and liquid/vibrant material roles. Components that render surfaces, controls, and overlays now inherit those premium roles. |
| App organization pass | `PageShell`, `PageHeader`, and `ContentToolbar` now express repeated page anatomy. `PageContainer`, `AppShell`, and `Sidebar` use semantic app layout tokens instead of local widths and gutters. Dashboard, Jobs, Market Signals, Opportunity Radar, and Login now use the shared structure/width tokens where their layout roles repeat. |
| Motion pass | Shared controls, overlays, sidebar disclosure, nav label reveal, loading feedback, and hoverable list controls now use semantic motion tokens from `docs/design/motion.md` instead of local `duration-*`, `delay-*`, and `ease-*` values. |
| Market Signals page flow | Passive source/relevance/pattern counters and explanatory top-page chrome were removed from the persistent page path. The default visible flow is now page title, one content toolbar for actions on the visible board, and the primary table/pattern content. Secondary setup and context belong behind disclosure or in focused settings/detail surfaces. |

## App And Page Structure Pass

| Area | Previous mismatch | Applied fix |
| --- | --- | --- |
| App shell | Content offset and sidebar widths were encoded as local pixel utilities. | Added `ml-app-rail`, `w-sidebar-collapsed`, and `hover:w-sidebar-expanded`; applied them in `AppShell` and `Sidebar`. |
| Page gutters | `PageContainer` used generic page padding and a local top offset. | Added `p-app-gutter`; the standard header owns the top boundary, so page content does not need a floating-header offset. |
| Page anatomy | Pages repeated local header markup and inconsistent max widths. | Added `PageShell` and `PageHeader`; applied them to Dashboard, Jobs, Market Signals, and Opportunity Radar. |
| Toolbars | Jobs and Radar used local rows for content controls; Jobs used hard section borders. | Added `ContentToolbar`; moved pagination, filters, search, sort, and focus controls into the shared toolbar surface. |
| Search and numeric fields | Repeated search and numeric widths were local arbitrary values. | Added `search`, `search-compact`, and `number-field` tokens; applied them to Market Signals and Radar controls. |
| Content/detail layouts | Board/detail layouts used local arbitrary grid templates. | Added `grid-cols-inspector`, `grid-cols-overview`, and `grid-cols-settings`; applied them to Dashboard, Market Signals, and board settings. |
| Forms and presentations | Login and sheets used local max-width values. | Added `max-w-form`, `max-w-sheet-sm`, `max-w-sheet-md`, `max-w-modal-lg`, and `max-w-viewport-safe`; applied them to Login, Radar sheets, and board settings. |
| Menus and tables | Dropdown/menu and dense table widths were local arbitrary values. | Added `menu`, `min-w-table-sm`, `min-w-table-lg`, `max-w-title`, and `max-w-chip`; applied them to dropdowns, tables, titles, and collection chips. |

The original findings are kept below as the audit trail for why these changes were made; their status labels describe the pre-fix state.

## Public Shared UI

| Component | File | Status | Findings | Impact | Recommended action |
| --- | --- | --- | --- | --- | --- |
| `Button` | `src/shared/ui/Button.tsx` | Medium | Default sizes now use `h-target`, but `ghost` and `soft` still use `hover:bg-accent`, `text-accent-foreground`, and `hover:bg-muted`. | Hover states remain tied to old shadcn roles instead of Apple fill roles. | Replace old hover roles with `hover:bg-fill-secondary` or `hover:bg-fill-tertiary`; keep `primary` on system blue. |
| `IconButton` | `src/shared/ui/IconButton.tsx` | Medium | Sizes use `h-control-small`/`h-target`, but hover states still use `bg-accent` and `text-accent-foreground`. | Icon controls visually drift from the new fill-token model. | Use fill tokens for hover and selected states; keep `text-text-secondary` for idle icons. |
| `Input` | `src/shared/ui/Input.tsx` | Aligned | Uses `h-target`, `border-input`, `bg-surface`, semantic text, placeholder, focus, and disabled tokens. | None found. | No action. |
| `Select` | `src/shared/ui/Select.tsx` | Aligned | Native select wrapper uses `h-target`, semantic color roles, and focus tokens. | None found. | Prefer this wrapper for simple native select cases. |
| `Textarea` | `src/shared/ui/Textarea.tsx` | Aligned | Uses semantic surface, input border, text, placeholder, focus, and disabled roles. | None found. | No action. |
| `Checkbox` | `src/shared/ui/Checkbox.tsx` | Low | Checkbox visual is `h-4 w-4`; Apple target rules require the surrounding label/hit area to provide practical touch size. | Standalone checkbox usage can create small hit targets. | Keep the visual size, but document/enforce usage inside `min-h-target` or label wrappers for interactive forms. |
| `RangeInput` | `src/shared/ui/RangeInput.tsx` | Medium | Uses `h-2`, `bg-muted`, and `accent-primary`. | Track and accent styling bypass the new fill/action vocabulary. | Use fill tokens for the track and `accent-action` or `accent-primary`; consider a wrapper that guarantees usable hit area. |
| `Badge` | `src/shared/ui/Badge.tsx` | Medium | `neutral` uses `bg-muted`; `info` uses `bg-accent text-accent-foreground`. | Badge tones are still partly coupled to old shadcn roles. | Map neutral/info to `bg-fill-secondary`, `text-text-secondary`, `bg-action-muted`, and `text-action` or a dedicated badge role. |
| `Card` | `src/shared/ui/Card.tsx` | Low | Uses semantic surface tokens, but default radius is `rounded-[12px]` and default padding is always `p-panel`. | Can make ordinary content feel heavier than the lightweight Apple-structured direction, especially when nested. | Decide whether cards should standardize on a smaller radius and lighter default padding; avoid using `Card` for page sections. |
| `Dropdown` | `src/shared/ui/Dropdown.tsx` | High | Imports shadcn `Button` directly, uses `h-auto`, `bg-accent`, `text-accent-foreground`, `bg-popover`, and `shadow-lg`. | Bypasses the product `Button` wrapper and misses target/material token rules. | Use shared `Button`; use `h-target` or documented compact size; map menu surface to `bg-material-regular border-material-border shadow-material backdrop-blur-*`. |
| `ToggleGroup` | `src/shared/ui/ToggleGroup.tsx` | Medium | Sizes include `h-7` and `h-9`; container uses `bg-surface-muted`; item states use `bg-surface`. | Segmented controls do not use Apple control-size tokens or fill roles consistently. | Replace with `h-control-mini`, `h-control-small`, `h-target`; use `bg-fill-secondary` for backing and `bg-surface`/action text for selection. |
| `MultiSelect` | `src/shared/ui/MultiSelect.tsx` | Medium | Default trigger uses `h-target`, but compact mode uses `h-8`; hover uses `bg-accent`; popover width is arbitrary `w-[320px]`; option checkbox is `h-4 w-4`. | Compact variant and popover surface can drift from shared control/material rules. | Keep compact only for dense desktop surfaces; use fill hover tokens and adapt `PopoverContent` through a material wrapper. |
| `FormField` | `src/shared/ui/FormField.tsx` | Aligned | Uses label/control structure, `gap-item`, `text-label`, and semantic muted label color. | None found. | No action. |
| `NumberField` | `src/shared/ui/NumberField.tsx` | Aligned | Mirrors `FormField` and uses the shared `Input`. | None found. | No action. |
| `ReadOnlyField` | `src/shared/ui/ReadOnlyField.tsx` | Low | Uses semantic text colors, but label/value text lacks explicit typography tokens and layout uses `grid-cols-[92px_minmax(0,1fr)]`. | Read-only details can render differently from `DetailRow` and other field components. | Add `text-label`/`text-ui`; consider a semantic width or shared detail-field pattern. |
| `DetailRow` | `src/shared/ui/DetailRow.tsx` | Low | Uses `max-w-[170px]`; empty value swaps to `text-body` inside a `text-ui` value area. | Detail rows can have inconsistent rhythm and arbitrary width constraints. | Replace arbitrary width with a layout prop or semantic detail wrapper; align fallback typography with the value style. |
| `MutedBlock` | `src/shared/ui/MutedBlock.tsx` | Low | Uses `bg-surface-subtle` as a filled block. | Acceptable for quiet grouped content, but can encourage extra nested blocks. | Prefer only for true muted callouts; consider `bg-fill-quaternary` if used as an overlay-like fill. |
| `EmptyState` | `src/shared/ui/EmptyState.tsx` | Medium | Uses both dashed border and `bg-surface-subtle`; builds class strings manually instead of `cn`. | Empty states may become another bordered card instead of a light replacement inside the content region. | Use `cn`; consider an unframed default with optional dashed/drop-zone variant. |
| `StatCard` | `src/shared/ui/StatCard.tsx` | Low | Uses `min-h-[118px]` and wraps `Card`. | Fixed arbitrary height can create layout drift across dashboards. | Replace with a semantic min-height token if this pattern is repeated, or make height a layout responsibility. |
| `TooltipIconButton` | `src/shared/ui/TooltipIconButton.tsx` | Aligned | Correctly composes shared `IconButton` with tooltip semantics and aria label. | Depends on `TooltipContent` primitive styling. | No action in this wrapper; fix tooltip styling in the tooltip primitive/wrapper. |

## shadcn Re-Exports Exposed As Shared UI

| Component | File | Status | Findings | Impact | Recommended action |
| --- | --- | --- | --- | --- | --- |
| `Command` exports | `src/shared/ui/Command.tsx`, `src/components/shadcn/ui/command.tsx` | High | Shared wrapper only re-exports shadcn. Primitive still uses `rounded-md`, `bg-popover`, `text-sm`, `text-xs`, `text-muted-foreground`, `bg-accent`, and `tracking-widest`. | Command menus bypass the Apple-aligned typography, fill, and material tokens. | Create a real shared `Command` wrapper or update the primitive to use `text-ui`, `text-label`, fill hover states, and material popover surfaces. |
| `Popover` exports | `src/shared/ui/Popover.tsx`, `src/components/shadcn/ui/popover.tsx` | High | Shared wrapper only re-exports shadcn. Content uses `bg-popover`, `shadow-md`, `rounded-md`, `p-4`, and no material tokens. | Popovers do not follow the new material guidance for overlays. | Wrap/adapt `PopoverContent` with `bg-material-regular border-material-border shadow-material backdrop-blur-*`. |
| `Dialog` exports | `src/shared/ui/Dialog.tsx`, `src/components/shadcn/ui/dialog.tsx` | High | Shared wrapper only re-exports shadcn. Content uses `bg-background`, `p-6`, `shadow-lg`, `gap-4`; title/description use `text-lg`, `text-sm`, and `tracking-tight`. | Dialogs do not use semantic typography/spacing/material tokens and can look like page backgrounds instead of elevated overlays. | Adapt `DialogContent`, `DialogTitle`, and `DialogDescription` to `bg-surface` or material roles, `p-panel`, `gap-component`, `text-heading`, `text-body`, and `text-text-secondary`. |
| `Tooltip` exports | `src/shared/ui/Tooltip.tsx`, `src/components/shadcn/ui/tooltip.tsx` | Medium | Tooltip content uses `bg-primary`, `text-xs`, and raw spacing classes. | Tooltips are styled as blue action chips instead of neutral overlay help. | Use a neutral/material tooltip surface with `text-label` and semantic spacing. |
| `Separator` export | `src/shared/ui/Separator.tsx`, `src/components/shadcn/ui/separator.tsx` | Low | Primitive uses generic separator implementation rather than the explicit `separator`/`separator-opaque` roles. | Minor drift from the newly named separator tokens. | Expose a shared wrapper with variants for `border-separator` and `border-separator-opaque`. |
| `ScrollArea` export | `src/shared/ui/ScrollArea.tsx`, `src/components/shadcn/ui/scroll-area.tsx` | Low | Primitive contains raw pixel utilities like `p-[1px]`. | Mostly internal scrollbar styling; low product impact. | Leave unless scrollbar visuals become product-visible; otherwise keep as primitive exception. |

## Legacy UI Components

| Component | File | Status | Findings | Impact | Recommended action |
| --- | --- | --- | --- | --- | --- |
| `components/ui/Card` | `src/components/ui/Card.tsx` | Medium | Duplicates `shared/ui/Card`; includes `hover:shadow-lg` and highlighted ring behavior. | Keeps a second card API alive and encourages shadow/elevation outside the new structure rules. | Move remaining usages to `src/shared/ui/Card` or fold needed variants into the shared wrapper. |
| `components/ui/Badge` | `src/components/ui/Badge.tsx` | High | Uses inline `rgba(...)` colors, custom style props, manual label truncation, and a custom hover tooltip. | Directly violates token rules and duplicates tooltip/badge behavior outside shared UI. | Replace with shared `Badge` plus a tokenized intensity strategy, or move the chart-specific color logic to `chartColors.ts`/CSS variables. |
| `PageLoadingBar` | `src/components/ui/PageLoadingBar.tsx`, `src/App.css` | Aligned | The class is legacy-located, but `App.css` uses semantic CSS variables for action/success/destructive. | No token mismatch found. | Optional: move to `src/shared/ui` only if reused beyond `App`. |

## Feature-Level UI Bypasses

| Component | File | Status | Findings | Impact | Recommended action |
| --- | --- | --- | --- | --- | --- |
| `FilterComponent` job type select | `src/features/filters/Filters.tsx` | High | Imports `components/shadcn/ui/select` directly; trigger uses `h-10` instead of `h-target` or `h-control-small`. Bookmark checkbox row uses `min-h-10`. | Feature code bypasses shared `Select` rules and keeps pre-token control sizing. | Create a shared Radix select wrapper or use native `shared/ui/Select` where possible; use `h-target` for default controls. |
| `JobStatusSelect` | `src/components/elements/JobStatusSelect.tsx` | High | Imports shadcn select directly; trigger uses `h-8`; tones use `bg-muted` for draft/default; content uses `rounded-xl`. | Status control bypasses shared UI wrappers and mixes old muted roles with status tokens. | Move to `shared/ui` or adapt through a shared select/chip-select wrapper; use `h-control-small` only if intentionally compact, and replace `bg-muted` with fill/status roles. |

## Summary

Highest-priority mismatches:

1. Direct shadcn usage still appears in feature UI where project wrappers should exist.
2. Overlay primitives (`Popover`, `Dialog`, `Command`, `Tooltip`, dropdown menu content) are not yet adapted to material tokens.
3. Old shadcn roles (`accent`, `muted`, `popover`, `text-sm`, `text-xs`, `h-8`, `h-9`, `h-10`) remain in several shared wrappers.
4. Legacy `src/components/ui/Badge` still hardcodes rgba colors and should be replaced or tokenized.
5. Structural components need a clearer split between ordinary content surfaces and real overlay/material surfaces.
