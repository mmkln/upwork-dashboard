# Agent Instructions

- Do not run tests unless the user explicitly asks for a test run.
- Do not run builds after each change unless the user explicitly asks for a build.
- When you learn an important lesson during work, add a clear, universal, non-case-specific instruction here that helps future agents work better next time.
- When remapping semantic design tokens, audit and update existing palette-ramp utility usages so old classes do not silently change meaning under the new token system.
- When a shared UI wrapper only re-exports a primitive, audit and align the underlying primitive too; otherwise consumers can appear to use the project UI API while still inheriting stale primitive styling.
- When adding premium or brand-adjacent colors, encode them as semantic roles first and update the base roles/components that should inherit them instead of scattering one-off accent classes through product UI.
- When modal or drawer shells need custom layout, keep the primitive-owned material surface, focus behavior, radius, border, and shadow intact; put repeated header/body/footer chrome in shared UI wrappers instead of local one-off classes.
- For standalone forms such as authentication screens, compose the shell from shared UI primitives like `Card`, `FormField`, and `Button` before adding page-local wrappers, so spacing, labels, focus states, and semantic tokens stay consistent.
- For Apple-inspired sidebar navigation, prefer rounded translucent selection fills and label/icon contrast; avoid decorative active bars or colored strips unless the product design explicitly calls for them.
- When applying Apple-inspired design, use the current 2025-2026 Liquid Glass guidance in `docs/design/apple-2025-26-guardrails.md`; do not rely on old Apple mental models or generic web dashboard patterns.
- Before adding a visual accent, custom background, border, shadow, or material effect, first ask whether removing styling and relying on hierarchy, semantic fill, contrast, spacing, and the shared primitive would better match Apple guidance.
- Keep the app shell in standard anchored positions unless the product explicitly asks for floating chrome; do not turn persistent headers or primary sidebars into inset islands by default.
- For collapsed/expanded navigation, keep the icon anchor position stable across states; reveal or hide labels independently instead of changing icon alignment, padding, or justification during the width transition.
- Reserve large stat cards for primary decision-driving metrics; passive context counters should be compact summary rows or toolbar-adjacent metadata so they do not consume the main workflow area.
- Do not stack separate passive context blocks before primary content; combine related board context, metadata, and controls into one coherent control region when they describe the same workflow.
- If a control region becomes crowded, remove passive context first and move setup/details/counters behind progressive disclosure; keep the default toolbar focused on acting on visible content.
- Before adding or keeping any persistent block above a table, list, board, or form, name the immediate user action it supports. If the block only explains context, counts, setup, or status, move it behind disclosure, into an inspector/settings surface, or into the content region.
- When a page feels cluttered, reduce visible regions before restyling individual blocks. Do not fix a control junk drawer by making each passive block smaller, prettier, or more bordered.
- After changing a top-of-page component, audit its neighboring components in the full page flow; the component is not done if the combined header, toolbar, counters, filters, and content still read as unrelated pieces.
- If a page edits or displays a named user object such as a board, project, saved search, or research topic, surface that object's name as the page identity; do not leave the page title as only a generic screen type.
- Every revealed filter, sort, or settings control must have an explicit visible label unless the control's value and surrounding group already make the meaning unmistakable.
- In list/table workflows, keep side detail panes as read-only inspectors with focused actions; move long edit/correction forms into a Sheet/Dialog so scanning and editing do not compete in the same persistent layout.
- Keep API mutation payloads separate from prepared/view-model objects; whitelist transport fields so derived UI data, caches, and non-serializable structures never leak back to the backend.
- When replacing local persisted UI state with a backend contract, remove unsupported local-only fields from persisted workflows instead of encoding them into unrelated API fields.
- When wrapping npm package binaries in a Node script on Windows, prefer resolving the package's JavaScript entrypoint and spawning it with `process.execPath` instead of spawning a `.cmd` shim directly.
- When API transport errors need app-wide UI effects, keep status detection in the API layer and route/navigation side effects in a router-aware React handler instead of importing navigation into the API client.

## Design

- Before changing UI components, layouts, text, labels, tables, metrics, charts, or page copy, read `docs/design/README.md` and follow the relevant topic documents linked from it.
- Before making an Apple-inspired visual decision, read `docs/design/apple-2025-26-guardrails.md` and follow its anti-pattern rules.
- Before changing cards, blocks, sidebars, headers, toolbars, overlays, or floating control groups, read `docs/design/blocks-islands-sidebars.md` and use its token roles.
- Before changing transitions, hover animations, overlay motion, collapsible navigation, loading animation, or disappearance behavior, read `docs/design/motion.md` and use semantic motion tokens.
- Before moving this UI system to another React project, read `docs/design/react-project-adoption.md`; migrate tokens and shared primitives before app-specific headers, sidebars, pages, or feature components.
- Before changing page composition, navigation, sidebars, toolbars, lists, tables, forms, detail panels, dialogs, popovers, or shared UI wrappers, read `docs/design/component-structure.md` and follow its Apple-inspired structure rules.
- Before changing app shell, page flow, page spacing, navigation behavior, content/detail layouts, toolbars, search placement, or UX structure, read `docs/design/app-organization.md` and use the shared page-structure wrappers where possible.
- Do not put descriptive subtitle text under product page titles; keep page headers concise and move explanatory copy into the relevant content region, empty state, onboarding state, or contextual help surface.
- For appearance/theme mode, use `ThemeProvider` from `src/shared/theme`; do not toggle `.dark` or read/write theme storage from page or feature components.
- Avoid nested blocks with backgrounds and borders when possible.
- Keep the design clean and lightweight without unnecessary blocks or borders.
- Create visual hierarchy with spacing, alignment, and typography instead of extra bordered containers.
- Keep content cards borderless by default; use subtle elevation only when the card is genuinely raised or overlapping content.
- Keep standard controls on dedicated control tokens (`bg-control`, `hover:bg-control-hover`, `bg-control-selected`, `border-control-border`) instead of content block or floating island tokens.
- When placing text on semantic background colors, use the matching foreground token for that background instead of a generic inverted text token.
- When adding custom Tailwind tokens that share prefixes with existing utilities, update the class merge configuration so token classes are not mistaken for conflicting utilities.

## shadcn/ui

- Treat `src/components/shadcn/ui` as the low-level primitive layer. These files are generated into the repo and can be edited, but avoid changing them for product-specific styling unless there is a strong reason.
- Treat `src/shared/ui` as the public UI API for pages and features. Prefer importing `Button`, `Card`, `Badge`, `Input`, `Dropdown`, `IconButton`, and other reusable UI from `shared/ui`.
- Pages and feature components should not import directly from `components/shadcn/ui` when a project wrapper exists. Use direct shadcn imports only for local one-off primitives or complex Radix-style composition that does not yet have a wrapper.
- When a shadcn primitive is needed in more than one place, create a wrapper in `src/shared/ui` and export it from `src/shared/ui/index.ts`.
- Add new shadcn primitives with the shadcn CLI, then adapt them through `shared/ui` if they become part of the product design system.
- Use semantic Tailwind tokens for styling: `bg-primary`, `text-primary-foreground`, `hover:bg-primary-hover`, `bg-surface`, `bg-surface-subtle`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `border-border`, and `border-input`.
- Use semantic typography tokens from Tailwind when possible: `text-display`, `text-heading`, `text-body`, `text-ui`, `text-label`, and `text-data`.
- Use semantic spacing tokens from Tailwind when possible: `p-page`, `gap-section`, `p-card`, `gap-control`, `gap-item`, and related `micro/tag/item/control/component/card/panel/page/section/control-mini/control-small/target/control-large/layout/control-xl/spacious` spacing keys.
- Do not add hardcoded hex colors in page or shared UI component class names. If a new color role is needed, add or reuse a semantic token in `src/index.css`, `packages/ui-foundation/styles/tailwind-v4.css`, and the legacy `packages/ui-foundation/tailwind.preset.cjs` bridge while this repo still needs Tailwind v3 support.
- Tailwind tokens are the default implementation path for JSX, layout, and component styling. Do not import theme constants just to build ordinary `className` strings.
- Use `src/shared/theme/chartColors.ts` for Recharts, inline chart styles, and JS-driven color values where Tailwind classes cannot be used.
- Use `src/shared/theme/typography.ts` and `src/shared/theme/spacing.ts` only as an escape hatch for inline styles, charts, canvas/SVG rendering, third-party component style callbacks, or JS-driven layout calculations.
- If both a Tailwind token and a theme constant can solve the same styling need, prefer the Tailwind token.
