# Design Typography

This document defines the premium typography rules for Opportunity Radar and the broader Upwork Dashboard interface. Use it when creating or changing components, page copy, tables, cards, badges, buttons, metrics, and labels.

## Typography Goal

Typography should feel clean, precise, and expensive. In a premium SaaS interface, type is not just content; it is a structural graphic element. The UI should use weight, spacing, line height, and neutral color hierarchy to create clarity without relying on loud colors.

## Font Selection

Use one high-quality geometric UI font across the application. Preferred options:

1. **Inter**: Best default choice. Clear, highly readable, excellent for tables, dashboards, and numeric data.
2. **Plus Jakarta Sans**: More geometric and design-forward. Good when the interface needs a more editorial premium character.
3. **Manrope**: Technical, precise, and premium. Good for analytics-heavy product surfaces.

Avoid Arial, system-default-looking typography, or overly generic Roboto-like styling when a premium screen is being designed.

## Type Scale

Use these levels consistently:

| Level | Size | Weight | Tracking | Use |
| --- | ---: | ---: | --- | --- |
| Display / H1 | 30px | 800 | -0.02em | Main page title |
| Heading / H2 | 20px | 700 | -0.01em | Section and card titles |
| Body Regular | 14px | 400 | normal | Main body text and descriptions |
| UI Medium | 14px | 500 | normal | Buttons, menus, table row text |
| Label Caps | 11px | 900 | 0.15em | Table headers, metadata labels |
| Data / Score | 18px | 900 | -0.01em | Key metrics, scores, important numeric data |

## Premium Styling Rules

### Letter Spacing

- For H1 and H2, use tight tracking. Large headings should feel compact and solid.
- For small uppercase labels, use wide tracking. `tracking-[0.15em]` is the standard for premium caps labels.
- Do not use negative tracking on small body text or compact controls.

### Line Height

- Body text should use `1.5` line height for comfortable reading.
- Headings should use `1.1` to `1.2` line height so they read as one visual block.
- Table rows and compact controls may use tighter line height only when the fixed component height already provides enough vertical rhythm.

### Text Color Hierarchy

Do not make all text pure black. Use the neutral hierarchy from the design palette:

- `#0F172A` / `text-text-primary`: only the most important text, such as headings, key labels, and primary data.
- `#64748B` / `text-text-secondary`: most descriptions, table body text, secondary metadata, and default UI text.
- `#94A3B8` / `text-text-muted`: hints, placeholders, table headers, supporting captions, and low-priority metadata.

As a rule of thumb:

- Text Primary: about 10% of text.
- Text Secondary: about 70% of text.
- Text Muted: about 20% of text.

### Numeric Data

Use tabular figures for numbers in tables, statistics, prices, budgets, rates, scores, and aligned metric columns. This keeps digits visually stable and prevents columns from shifting.

Use Tailwind utility classes such as:

```tsx
className="tabular-nums"
```

For key scores and important metrics, prefer:

```tsx
className="text-[18px] font-black tracking-[-0.01em] tabular-nums text-text-primary"
```

## Tailwind Examples

Main page title:

```tsx
<h1 className="text-[30px] font-extrabold tracking-[-0.02em] leading-[1.1] text-text-primary">
  Opportunity Radar
</h1>
```

Section title:

```tsx
<h2 className="text-[20px] font-bold tracking-[-0.01em] leading-[1.2] text-text-primary">
  Market Signals
</h2>
```

Body text:

```tsx
<p className="text-sm font-normal leading-6 text-text-secondary">
  Track pricing, demand, and opportunity quality across the market.
</p>
```

Table header:

```tsx
<th className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted">
  Score
</th>
```

Metric value:

```tsx
<p className="text-[18px] font-black tracking-[-0.01em] tabular-nums text-text-primary">
  92
</p>
```

## Implementation Rules

- Prefer semantic Tailwind classes from the project theme: `text-text-primary`, `text-text-secondary`, and `text-text-muted`.
- Do not hardcode text hex colors in components.
- Do not use oversized hero typography inside compact dashboards, cards, tables, sidebars, or tool surfaces.
- Do not use uppercase labels without wider tracking.
- Do not use ultra-light weights for functional UI text; premium product UI should stay readable.
- When adding or changing component text, choose the type level intentionally instead of copying a random nearby class.
