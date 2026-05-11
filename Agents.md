# Agent Instructions

- Do not run tests unless the user explicitly asks for a test run.
- Do not run builds after each change unless the user explicitly asks for a build.

## Design

- Before changing UI components, layouts, text, labels, tables, metrics, charts, or page copy, read `docs/design/README.md` and follow the relevant topic documents linked from it.
- Avoid nested blocks with backgrounds and borders when possible.
- Keep the design clean and lightweight without unnecessary blocks or borders.
- Create visual hierarchy with spacing, alignment, and typography instead of extra bordered containers.

## shadcn/ui

- Treat `src/components/shadcn/ui` as the low-level primitive layer. These files are generated into the repo and can be edited, but avoid changing them for product-specific styling unless there is a strong reason.
- Treat `src/shared/ui` as the public UI API for pages and features. Prefer importing `Button`, `Card`, `Badge`, `Input`, `Dropdown`, `IconButton`, and other reusable UI from `shared/ui`.
- Pages and feature components should not import directly from `components/shadcn/ui` when a project wrapper exists. Use direct shadcn imports only for local one-off primitives or complex Radix-style composition that does not yet have a wrapper.
- When a shadcn primitive is needed in more than one place, create a wrapper in `src/shared/ui` and export it from `src/shared/ui/index.ts`.
- Add new shadcn primitives with the shadcn CLI, then adapt them through `shared/ui` if they become part of the product design system.
- Use semantic Tailwind tokens for styling: `bg-primary`, `text-primary-foreground`, `hover:bg-primary-hover`, `bg-surface`, `bg-surface-subtle`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `border-border`, and `border-input`.
- Use semantic typography tokens from Tailwind when possible: `text-display`, `text-heading`, `text-body`, `text-ui`, `text-label`, and `text-data`.
- Use semantic spacing tokens from Tailwind when possible: `p-page`, `gap-section`, `p-card`, `gap-control`, `gap-item`, and related `micro/item/control/component/card/panel/page/section/layout/spacious` spacing keys.
- Do not add hardcoded hex colors in page or shared UI component class names. If a new color role is needed, add or reuse a semantic token in `src/index.css` and `tailwind.config.js`.
- Tailwind tokens are the default implementation path for JSX, layout, and component styling. Do not import theme constants just to build ordinary `className` strings.
- Use `src/shared/theme/chartColors.ts` for Recharts, inline chart styles, and JS-driven color values where Tailwind classes cannot be used.
- Use `src/shared/theme/typography.ts` and `src/shared/theme/spacing.ts` only as an escape hatch for inline styles, charts, canvas/SVG rendering, third-party component style callbacks, or JS-driven layout calculations.
- If both a Tailwind token and a theme constant can solve the same styling need, prefer the Tailwind token.
