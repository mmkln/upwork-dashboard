# Design Colors

This document defines the product color system. Use semantic tokens in implementation rather than hardcoded hex values.

## Core Palette

| Role | Hex | Token | Use |
| --- | --- | --- | --- |
| Primary Base | `#0F172A` | `bg-primary`, `text-text-primary` | Main buttons, important headings, primary data, premium structural color |
| Primary Action | `#2563EB` | `bg-action`, `text-action`, `focus:border-action` | CTAs, active indicators, focus states, attention-driving accents |
| Secondary Background | `#F8FAFC` | `bg-background`, `bg-surface-subtle` | Application background and quiet page surfaces |
| Surface | `#FFFFFF` | `bg-surface`, `bg-card` | Cards, tables, header, panels, popovers |

## Neutral Text

| Role | Hex | Token | Use |
| --- | --- | --- | --- |
| Text Primary | `#0F172A` | `text-text-primary` | Headings, important labels, key metrics |
| Text Secondary | `#64748B` | `text-text-secondary` | Main secondary text, descriptions, table body metadata |
| Text Muted | `#94A3B8` | `text-text-muted`, `text-text-placeholder` | Hints, placeholders, table headers, low-priority captions |
| Border | `#E2E8F0` | `border-border`, `border-input` | Dividers, card borders, inputs, table separators |

## Status Colors

| Role | Hex | Token | Use |
| --- | --- | --- | --- |
| Success | `#10B981` | `text-success`, `bg-success` | Positive status and positive movement |
| Success Background | `#ECFDF5` | `bg-success-muted` | Success badge background |
| Error / Alert | `#F43F5E` | `text-destructive`, `bg-destructive` | Critical states and error markers |
| Info / Badge | `#F1F5F9` | `bg-muted`, `bg-accent` | Neutral badges, tags, secondary labels |

For small success badge text, use `text-success-foreground` on `bg-success-muted` for accessible contrast. The base `#10B981` remains the status accent color.

## Implementation Rules

- Use semantic Tailwind tokens: `bg-primary`, `bg-action`, `bg-background`, `bg-surface`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `border-border`, `border-input`.
- Do not add hardcoded hex colors in page components or shared UI wrappers.
- Add a token when a new color role is needed; do not introduce one-off arbitrary colors.
- Use `src/shared/theme/chartColors.ts` for Recharts and inline chart styles where Tailwind classes cannot be used.
- Primary base is for structure. Action blue is for attention and interaction.
- Keep borders subtle; use spacing and typography before adding more lines.

## Chart Palette

Use `src/shared/theme/chartColors.ts` for chart color values:

- `primary`: action blue
- `base`: primary base
- `green`: success
- `rose`: alert/error
- `teal`, `amber`, `violet`, `slate`: supporting chart colors
