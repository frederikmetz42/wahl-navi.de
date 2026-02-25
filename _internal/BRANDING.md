# MUCwahl Branding Codex

## Wordmark

**MUC** (extrabold, slate-900) + **wahl** (light, slate-900). Both black, weight contrast creates the visual split. No colour in the wordmark.

Subtitle: "Kommunalwahl München 2026" in slate-400, uppercase, 10px, bold, wide tracking.

## Logo

Source file: `_internal/logo.svg` (2MB, complex vector, not for web use).
Web assets: `muc/icon.png` (192x192, 43KB) and `muc/favicon.png` (64x64, 7KB).

The logo depicts Munich landmarks (Frauenkirche, Olympic bridge) with a ballot checkbox. Its two dominant colours define the entire palette.

## Colour System

Two brand colours, derived from the logo. Everything else is neutral (slate).

### Blue (Information, Trust)

| Token    | Tailwind          | Hex     | Usage                                 |
| -------- | ----------------- | ------- | ------------------------------------- |
| blue-50  | `bg-blue-50`      | #eff6ff | Tag backgrounds, info badges, banners |
| blue-200 | `border-blue-200` | #bfdbfe | Banner/badge borders                  |
| blue-500 | `bg-blue-500`     | #3b82f6 | Indicator dots                        |
| blue-600 | `bg-blue-600`     | #2563eb | Progress bar, links                   |
| blue-700 | `text-blue-700`   | #1d4ed8 | Topic tag text                        |
| blue-800 | `text-blue-800`   | #1e40af | Banner text                           |

Blue signals: progress, topic context, informational badges, hyperlinks, trust indicators.

### Orange (Action, Brand Warmth)

| Token | Tailwind | Hex | Usage |
|-------|----------|-----|-------|
| orange-50 | `bg-orange-50` | #fff7ed | Active toggle backgrounds, tradeoff tag bg |
| orange-100 | `border-orange-100` | #ffedd5 | Tradeoff tag border |
| orange-500 | `bg-orange-500` | #f97316 | Active weight badge |
| orange-600 | `bg-orange-600` | #ea580c | Primary CTA buttons |
| orange-700 | `hover:bg-orange-700` | #c2410c | CTA hover, tradeoff tag text |

Orange signals: forward-progress actions (Starten, Weitermachen, Ergebnis berechnen), active user choices (weight toggles), tradeoff context.

### Neutrals

| Token | Tailwind | Usage |
|-------|----------|-------|
| slate-900 | `text-slate-900` | Headings, wordmark, body text |
| slate-600 | `text-slate-600` | Secondary body text |
| slate-500 | `text-slate-500` | Labels, descriptions |
| slate-400 | `text-slate-400` | Subtle text, subtitle, timestamps |
| slate-200 | `border-slate-200` | Card borders, dividers |
| slate-100 | `bg-slate-100` | Inactive buttons, answer buttons |
| slate-50 | `bg-slate-50` | Page background (#f8fafc via body) |
| white | `bg-white` | Cards, modals, nav |

### Semantic Colours (Answers Only)

These appear only in quiz answer feedback and party comparison. They are not brand colours.

| Colour | Usage |
|--------|-------|
| emerald-500/600 | Zustimmung (agree) ring/icon |
| rose-500/600 | Ablehnung (disagree) ring/icon |
| slate-400/500 | Neutral answer ring/icon |

## Typography

**Font**: Inter (self-hosted, weights 400/500/600/700).

| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| H1 (hero) | text-4xl / md:text-5xl | extrabold (800) | tight |
| H2 (quiz question) | text-xl / md:text-3xl | bold (700) | - |
| H3 (card titles) | text-sm / text-lg | bold (700) | - |
| Body | text-lg | normal (400) | - |
| Labels | text-xs / text-[10px] | bold (700) | wider / widest |
| Mono (counters) | font-mono text-xs | medium (500) | - |

## Border Radius

Consistent `rounded-lg` (0.5rem / 8px) across all interactive elements:

| Element | Class |
|---------|-------|
| Buttons (CTA, answer) | `rounded-lg` (via `.btn`) |
| Cards | `rounded-xl` (via `.card`) |
| Tags (topic, tradeoff, info) | `rounded-lg` |
| Badges (trust, theme count) | `rounded-lg` |
| Modals | `rounded-2xl` (sm+) |

Exception: tiny indicator dots and party colour swatches use `rounded-full`.

## Component Patterns

### CTA Button (`.btn-primary`)
`bg-orange-600 text-white hover:bg-orange-700 rounded-lg shadow-sm`

### Answer Button (`.btn-answer`)
`bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg`

### Card (`.card`)
`bg-white border border-slate-200 rounded-xl shadow-sm`

### Topic Tag (quiz)
`bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider rounded-lg px-3 py-1`

### Tradeoff Tag (quiz)
`bg-orange-50 text-orange-700 text-[10px] font-bold tracking-wide rounded-lg border border-orange-100 px-3 py-1`

### Info Badge (homepage)
`bg-blue-50 text-blue-800 rounded-lg px-4 py-2 text-sm font-medium`

## Rules

1. **No green** in brand elements. Green only for answer-agree feedback (emerald).
2. **No amber**. Former amber elements migrated to orange.
3. **Orange = action only**. Never use orange for static/informational elements.
4. **Blue = information only**. Never use blue for primary CTAs.
5. **One radius** for tags and badges: `rounded-lg`. No pills except tiny dots.
6. **Slate for structure**. Nav, footer, cards, modals all use slate neutrals.
7. **No colour in the wordmark**. Both parts are slate-900, differentiated by weight.
