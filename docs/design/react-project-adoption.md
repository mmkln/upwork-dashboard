# React Project Adoption

Use this guide when moving the design system practices and components into another React project.

## Source Of Truth

The transferable starting point is `packages/ui-foundation`.

It contains:

- Tailwind v4 CSS theme: `packages/ui-foundation/styles/tailwind-v4.css`
- Legacy Tailwind v3 preset: `packages/ui-foundation/tailwind.preset.cjs`
- CSS variables and reduced-motion base layer: `packages/ui-foundation/styles/base.css`
- Theme helpers and `ThemeProvider`: `packages/ui-foundation/src/theme`
- `cn` with Tailwind merge config: `packages/ui-foundation/src/lib/cn.ts`
- Product UI wrappers: `packages/ui-foundation/src/ui`
- Adapted shadcn/Radix primitives: `packages/ui-foundation/src/components/shadcn/ui`
- Build output for dependency consumption: `packages/ui-foundation/dist`

## Do Not Direct-Copy Everything

Do not directly copy page layouts, app headers, sidebars, auth menus, routing containers, API code, charts, or feature-specific cards into another project.

Move the foundation in layers:

1. Tokens and Tailwind integration: `styles/tailwind-v4.css` for Tailwind v4, legacy preset only for Tailwind v3.
2. Base CSS variables and dark mode.
3. `cn` and theme helpers.
4. Primitive UI wrappers: `Button`, `Input`, `Badge`, `Card`.
5. Overlay wrappers: `Dialog`, `Sheet`, `DropdownMenu`, `Popover`, `Tooltip`.
6. Structure wrappers: `PageShell`, `PageHeader`, `ContentToolbar`, `OverlayHeader`, `OverlayBody`, `OverlayFooter`.
7. Local app shell implementation for the target project.

## React Project Audit

Before migration, check:

- React version and bundler: CRA, Vite, Next.js, Remix, or custom.
- Tailwind version and whether package source files are scanned by `content`.
- Existing shadcn/Radix primitives and their versions.
- Existing semantic token names that may conflict.
- Current dark-theme strategy.
- Current modal/drawer architecture.
- Whether the app can consume workspace TS packages. CRA projects may need source copying or a build step.

## Minimum Integration

For a target project that already has Tailwind v4:

```css
@import "tailwindcss";
@import "@upboard/ui-foundation/styles/tailwind-v4.css";
@source "../node_modules/@upboard/ui-foundation/dist";
```

Tailwind v3 projects can use the legacy preset:

```js
module.exports = {
  presets: [require("@upboard/ui-foundation/tailwind-preset")],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
};
```

Use the public UI API:

```tsx
import { Button, Card, Input } from "@upboard/ui-foundation/ui";
```

## Migration Rule

If a target project fights the foundation, do not patch random one-off styles into pages. Add or adjust a semantic token, shared primitive, or local wrapper first.

## Keeping Projects Aligned

Tailwind v4 consuming projects should import `styles/tailwind-v4.css` instead of copying token values. Tailwind v3 projects can keep using the legacy preset until they migrate.
