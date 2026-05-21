# Adoption Checklist

Use this checklist before applying the foundation to another React project.

## Project Compatibility

- React version is compatible with the peer dependencies.
- Tailwind is installed and processes package source files.
- Radix dependencies used by shared primitives are installed.
- The target project can import package CSS once at app root.
- Existing tokens named `primary`, `muted`, `surface`, `card`, or `border` are audited for conflicts.

## Design Migration

- Read `docs/design/README.md` in the source project before changing UI.
- Start with tokens and primitive controls before page layouts.
- Keep app shell local unless multiple projects share the exact same navigation behavior.
- Use semantic classes from the preset instead of hardcoded hex colors or arbitrary durations.
- Respect `prefers-reduced-motion` and use motion tokens for transitions.

## Component Migration

- Prefer `@upboard/ui-foundation/ui` imports over direct Radix/shadcn imports.
- If a target project already has shadcn components, replace them one primitive at a time.
- Check overlays carefully because dialogs, sheets, popovers, and dropdowns require Radix focus and portal behavior to remain intact.
- Do not migrate data-specific cards, tables, charts, or routing code into the foundation.
