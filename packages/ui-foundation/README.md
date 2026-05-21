# UI Foundation

Transferable React UI foundation extracted from the Upwork Dashboard design system.

This package is intentionally a starting point, not a finished published package. It contains:

- Apple-inspired semantic design tokens.
- Tailwind v4 CSS theme, legacy Tailwind v3 preset, and `tailwind-merge` configuration.
- Theme runtime with `light`, `dark`, and `system` modes.
- Shared UI wrappers and adapted shadcn/Radix primitives.
- Base CSS variables, dark theme, and reduced-motion defaults.

## Build

From the repository root:

```bash
npm run build:ui-foundation
```

From this package directory:

```bash
npm run build
```

The build emits JS, declarations, source maps, copied CSS, and the Tailwind preset into `dist`.

The source app still consumes the legacy Tailwind v3 preset from the root `tailwind.config.js`. Tailwind v4 projects should use `styles/tailwind-v4.css` instead.

## Use In Another React Project

1. Copy or install this package into the target repo.
2. Build the package before consuming it as a dependency.
3. Import the foundation Tailwind v4 CSS once near the app root, after Tailwind:

```css
@import "tailwindcss";
@import "@upboard/ui-foundation/styles/tailwind-v4.css";
```

4. Make sure Tailwind scans the package output:

```css
@source "../node_modules/@upboard/ui-foundation/dist";
```

5. Wrap the app with `ThemeProvider` if the project needs appearance switching:

```tsx
import { ThemeProvider } from "@upboard/ui-foundation/theme";

export function App() {
  return <ThemeProvider>{/* routes */}</ThemeProvider>;
}
```

6. Use shared components through the public UI API:

```tsx
import { Button, Card, Input } from "@upboard/ui-foundation/ui";
```

CRA note: if a target Create React App project cannot transpile TypeScript from workspace or `node_modules` packages, copy `src` and `styles` into the target repo first, or add a package build step before installing it as a dependency. Copy `tailwind.preset.cjs` only for Tailwind v3 projects.

## Migration Order

Follow this order in each React project:

1. Add the Tailwind v4 CSS theme and base CSS tokens. Use the legacy preset only for Tailwind v3 projects.
2. Add `cn` and theme helpers.
3. Replace primitive controls first: `Button`, `Input`, `Badge`, `Card`.
4. Replace overlays next: `Dialog`, `Sheet`, `DropdownMenu`, `Popover`, `Tooltip`.
5. Introduce page wrappers: `PageShell`, `PageHeader`, `ContentToolbar`.
6. Only then migrate app-specific header/sidebar/page layouts.

Do not copy app-specific shells blindly. Treat `Header`, `Sidebar`, auth menus, and routing containers as local implementations that consume the foundation.
