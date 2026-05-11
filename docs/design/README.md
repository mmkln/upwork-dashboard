# Design System

This directory is the canonical design system documentation for the Upwork Dashboard product UI.

Before changing UI components, layouts, copy, tables, metrics, charts, or page structure, start here and then read the relevant topic documents.

## Required Reading

- [Spacing](./spacing.md): layout rhythm, 8pt grid, whitespace, component proximity, and density rules.
- [Typography](./typography.md): premium type scale, text hierarchy, labels, metrics, and numeric data rules.
- [Colors](./colors.md): palette roles, semantic Tailwind tokens, and chart color usage.

## Product Principles

- The interface should feel light, structured, and premium, but not pale.
- Use hierarchy through spacing, alignment, typography, and restrained color.
- Prefer white surfaces on a soft neutral application background.
- Use deep primary color for structure and important text.
- Use action blue only where the user should notice or act.
- Avoid nested bordered/background blocks when spacing and typography can communicate structure.
- Do not hardcode visual values that already exist as design tokens.

## Implementation Map

- Color tokens: `src/index.css`
- Tailwind token mapping: `tailwind.config.js`
- Typography Tailwind tokens: `text-display`, `text-heading`, `text-body`, `text-ui`, `text-label`, `text-data`
- Spacing Tailwind tokens: `micro`, `item`, `control`, `component`, `card`, `panel`, `page`, `section`, `layout`, `spacious`
- JS/inline theme helpers: `src/shared/theme`
- Product UI wrappers: `src/shared/ui`
- shadcn primitives: `src/components/shadcn/ui`

## Working Rule

If a UI decision conflicts with local code style, keep the implementation consistent with the component architecture, but preserve the intent of these design documents.
