# 1-800Accountant · Design System

> Small-business accounting, on your team. This is the internal design system for 1-800Accountant's **Client Portal** product — the React web app where small-business owners manage their books, taxes, payroll, and advisor relationship.

## What's in this project

| File / Folder                | What it is                                                         |
| ---------------------------- | ------------------------------------------------------------------ |
| `colors_and_type.css`        | The single source of truth. Color vars, typography vars, spacing, radii, shadows, motion. Import this first. |
| `assets/logo/`               | Full, medium, and mini "A" monogram marks (SVG)                    |
| `assets/brand/`              | Favicon, email logo, app icon PNG, SOC2 badge                      |
| `assets/icons/`              | The portal's custom icon set (27 SVGs — Dashboard, Bookkeeping, Taxes, Payroll, etc.) |
| `assets/illustrations/`      | Service illustrations (advisory, bookkeeping, payroll, tax-advisory) + empty states (no-activity, no-message) + the "meeting" photo |
| `assets/images/`             | Full-bleed photography (auth backdrop)                             |
| `preview/`                   | Swatch / specimen / component cards surfaced in the Design System tab |
| `ui_kits/portal/`            | React recreation of the Client Portal — Dashboard, Transactions, Documents, Messages, Bookkeeping |
| `SKILL.md`                   | Claude Skills entrypoint — load this file to invoke the system as a skill |

## Source material

Everything here was derived from **`github.com/1-800Accountant/portal-web`** (default branch, April 2026). Key files to consult if you need to go deeper than this system:

- `src/variables/colors.ts` — canonical color palette
- `src/styles/ThemeCustom.tsx` — MUI theme overrides (buttons, typography, shadows, spacing)
- `src/components/common/ui/UiText.tsx` — the "vehicle" typography scale (`bike_50` → `semi_450`)
- `src/components/layout/DashboardLayout.tsx` — sidebar + shell
- `src/components/dashboard/AiDashboard/CurvedBox.tsx` — the signature 32px rounded hero panel
- `public/assets/icons/` — custom icon set (copied into `assets/icons/`)

---

## About the product

1-800Accountant is a small-business accounting firm that bundles a dedicated human team (CPA advisor + bookkeeper + payroll specialist) with a web portal and mobile app. The **Client Portal** is where clients:

- Connect bank accounts and watch transactions auto-categorize
- Review monthly books and year-end returns
- Schedule calls with their advisor and message their team
- Run payroll, upload documents, track tax deadlines
- Consult the AI assistant ("AI Dashboard") for tax-planning suggestions

The tone is **confident-but-warm CPA on your side** — not a DIY accounting tool, not a fintech. The product knows you're not going to learn GAAP, and it's not going to make you.

---

## Content fundamentals

**Voice**
- **Second person, always.** "Your books", "You'll meet", "We'll handle it." Never "the user" or "users."
- **Confident, not hedgy.** "Your Q2 strategy is ready." Not "We think your strategy might be ready to review."
- **Plainspoken.** "Save $3,400 in Q2" beats "optimize your fiscal posture." Jargon earns its place or gets cut.
- **Warm, lightly personal.** Caveat script accents ("Good morning,") on dashboards. First-name references to your team ("Sarah pencilled us in").
- **We, not the brand name.** Inside the portal it's "we" / "your team" / "your advisor." "1-800Accountant" shows up in email and marketing, rarely in-app.

**Grammar & form**
- **Sentence case for everything** — page titles, buttons, section headings, pills. Never ALL CAPS except the `overline` / `eyebrow` micro-labels (10–12px letter-spaced text).
- **Title case reserved for** proper names (Form 1120-S, Chase, Gusto) and legal boilerplate.
- **Numbers**: currency with `$` and commas, two decimals in financial tables, no decimals in summary KPIs ("$48,210" not "$48,210.00"). Percentages: "▲ 12%", "▼ 3%".
- **Dates**: "Apr 18" in lists, "April 18, 2026" in formal / long-form. Relative ("Yesterday", "2 days ago") in messaging. Deadlines always show absolute + relative ("Jun 15 · 58 days").
- **No emoji** in product surfaces. Iconography does the emotional work.
- **No exclamation points** in system copy. Clients got enough news from the IRS; keep it calm.

**Examples**

| Good | Bad |
| --- | --- |
| "You could save ~$3,400 in Q2 with S-Corp distributions." | "Our AI has detected potential tax optimization opportunities!!!" |
| "We'll handle the IRS. You get back to running the business." | "Leverage our proprietary platform for end-to-end tax synergy." |
| "Q2 estimated tax · due Jun 15" | "IMPORTANT: Upcoming tax deadline" |
| "2 transactions need a category." | "You have uncategorized items." |
| "Sarah pencilled us in for Friday at 10am PT." | "Appointment scheduled." |

**CTAs**
- **Verb-first, specific.** "Book a call", "Review plan", "Upload W-9", "Connect account" — never "Submit", "Click here", "Go".
- **Two-word maximum** for primary buttons; one verb-phrase for secondary text links ("See the math →").

---

## Visual foundations

### Color

Two families do the heavy lifting:

- **Warm orange** (`#F15F22`, `--primary`) is the **action** color — exclusively. Primary buttons, notification badges, the "A" monogram. Use sparingly. A page with more than three orange moments is probably wrong.
- **Portal teal-green** (`#2DA38D`, `--primary-green`) is the **chrome** color — navigation selection, active tabs, scrollbar thumb, focus rings, outgoing chat bubbles, loader. It's the "we're working" color.
- **Secondary slate** (`#3F5261`, `--secondary`) is the **surface text / avatar** neutral — the color of calm authority.

Everything else is **black-at-%** for neutrals (the portal leans on `rgba(0,0,0,.08 / .12 / .20)` rather than a quantized grey ramp) and soft **tinted status colors** (#DBF6E7 / #FFF0F0 / #FFCF7C40 / #EBF3FF) with saturated text on them.

**Imagery color vibe**: warm. The auth background is a sun-dappled photograph. Illustrations lean orange + teal + cream. No cold blues, no black-and-white, no grain.

### Type

- **Poppins** is the primary sans — across the whole portal. Weights 300/400/500/600/700.
- **Roboto** is the fallback, shipped for compatibility.
- **Caveat** (script) is used *sparingly* for warm personal touches: "Good morning," on dashboards, signatures at the bottom of emails. Never for body copy.
- **Mono** (Menlo / source-code-pro) for **numeric tables** — currency columns, EINs, account numbers. This is explicit in the portal: financial values almost always align in mono.

Typography scale is the `UiText` **"vehicle" scale** lifted verbatim from the codebase:

| Variant | Size / LH | Used for |
| --- | --- | --- |
| `bike_50` | 10 / 16 | Legal, timestamps |
| `moped_75` | 12 / 16 | Metadata, chips, captions |
| `motorcycle_90` | 14 / 20 | Body, nav items, most UI text |
| `car_100` | 16 / 24 | Form labels, paragraph |
| `hatchback_125` | 18 / 24 | Card titles |
| `suv_150` | 24 / 32 | Page titles |
| `truck_175` | 28 / 40 | Hero statements |
| `van_225`+ | 36 / 48+ | Marketing, rarely in-app |

Headings are `font-weight: 600` (semibold), never bold. Body is 400. Active nav / emphasized values are 500.

### Spacing

MUI-derived 4px scale: `4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 56 · 64 · 72 · 80 · 96`. The portal is most comfortable at **16–24px gaps** between cards, **20–28px card padding**, **32–40px page padding**.

### Corner radii

| Radius | Used for |
| --- | --- |
| **4px** | Inputs, outlined buttons, the "Beta"/"New" tag chips |
| **8px** | Cards, modals, menus — the default |
| **16px** | Large panels (illustrations, onboarding cards) |
| **32px** | **CurvedBox** — the AI Dashboard hero panel signature |
| **999px (pill)** | Status pills, counter badges, avatars, "Active"/"Due soon" labels |

The 32px CurvedBox is the single most recognizable visual flourish of the portal. Use it for: AI-branded moments, personal welcome panels, quote pull-outs. Never for regular cards.

### Elevation & shadows

Three layers, no more:

1. **Card** — `0 2px 4px rgba(18,23,36,.06), 0 1px 2px rgba(18,23,36,.04)`. Almost imperceptible; more about a soft edge than a shadow.
2. **Menu / popover** — MUI default layered shadow.
3. **CurvedBox / hero** — `0 28px 80px rgba(8,83,115,0.12)`. A distant, cool, long shadow, using a teal-tinted alpha. This is what makes the hero feel like it's floating.

**No inner shadows.** **No colored glow shadows** except the one above.

### Borders

Borders do a lot of the work shadows don't.

- Default divider / card border: `rgba(0,0,0,.08)` or `.12`
- Selected nav row: **3px solid `#2DA38D`** on the left edge
- Focus ring: **2px solid `#2DA38D`** on the element (no outline halo)
- Error input: `1px solid #C71D1D`
- Warm tinted panels: `1px solid rgba(241,95,34,.15)` to bind them to the warm bg

### Backgrounds

- App background: `#F7F7F7` (--grey-3300), very light cool grey, or `#F6F4F2` (--grey-2500) "warm paper" for settings / marketing-adjacent surfaces.
- Cards: pure white (`#FFFFFF`)
- Auth / login: full-bleed warm photograph (`assets/images/bg-auth.jpg`)
- **Gradients are rare** and only in hero panels: `linear-gradient(135deg, #FFF6E5 → #FFE8CE → #FAD4B2)` for warm, `linear-gradient(135deg, #D5FFFA → #AAF2DC)` for cool. Never purple, never vibrant.
- **No patterns, no noise, no grain.** The portal is clean paper, not textured.

### Motion

- Standard MUI easing: `cubic-bezier(0.4, 0, 0.2, 1)` (`--motion-ease`).
- Durations: **120ms** (micro — hover tints), **180ms** (base — state transitions), **280ms** (slow — page panel swaps).
- **No bounces, no spring physics, no parallax.** Professional restraint.
- **Hover** = slight background tint (`rgba(0,0,0,.04)` on ghost rows / `rgba(0,0,0,.05)` on icon buttons) or a 5% darken of fill color on primary. Never scale-up.
- **Press** = 8% darken, no scale transform.
- **Loaders** are teal (`#2DA38D`) — the MUI circular spinner, never orange.
- **Scrollbar** thumb is `#2DA38D` — one of the most distinctive portal-isms.

### Transparency & blur

Rarely used. Sidebar and topbar are solid white with a 1px hairline border. No glassmorphism, no backdrop-filter. The only translucency is the **black-at-%** alphas used for borders/dividers (see Color above).

### Layout rules

- Sidebar: **248px fixed** on desktop, sticky top-0
- Topbar: **64px fixed**, sticky, with 1px bottom border
- Content max-width: **1360px**, centered with auto margins
- Default content padding: **28px horizontal / 32px top**
- Grids: usually `2fr 1fr` (dashboard), `repeat(4, 1fr)` (KPI strips), `repeat(3, 1fr)` (reports)

---

## Iconography

The portal ships **its own custom SVG icon set**. Every nav item, tab, and service card has a bespoke icon — see `assets/icons/` for all 27. They are:

- **Line-based with occasional duotone fills** (Bookkeeping, Financial Team). Stroke ~1.5–2px.
- **Square-ish, roughly 24–32px native** — render them at 20px in nav, 32px in cards, 40px in empty states.
- **Single-color tint-able**. For active states, tint to `#2DA38D` using a CSS filter (see Shell.jsx for the hue-rotate filter string).
- **Paired with Material Icons** (`@mui/icons-material`, shipped by MUI) for general-purpose UI glyphs (chevrons, close, search, check). Same stroke weight family. When you need an icon that isn't in `assets/icons/`, reach for Material Icons before anything else.

**Logo marks** (`assets/logo/`):
- `logo-full.svg` — full `1-800 ACCOUNTANT` wordmark with the orange "A" mark on the left. Default in the portal top-left.
- `logo-medium.svg` — compact lockup, used in email headers and narrow chrome.
- `logo-mini.svg` — just the "A" monogram (warm orange triangle). Used as a favicon, avatar placeholder, and app icon. PNG version at `assets/brand/app-icon-192.png`.

**Emoji**: not used in the portal. Ever. Status uses **colored dots or pills** with icons, not emoji.

**Unicode characters as icons**: allowed for the simplest cases — ▲ / ▼ for directional deltas in tables, ✓ / × in inline confirmations, → in link affordances. Don't build complex affordances with unicode.

**Illustrations** (`assets/illustrations/`):
- `advisory.svg`, `bookkeeping-ad.svg`, `payroll-ad.svg`, `tax-advisory-ad.svg` — friendly rounded service vignettes with orange + teal palette. Used on service landing panels and upsell moments.
- `no-activity.svg`, `no-message.svg` — empty-state illustrations. Use these instead of inventing your own.
- `meeting.png` — a photograph used on advisor-booking surfaces.

**When you don't have an icon**: fall back to a Material Icon (CDN: `https://fonts.googleapis.com/icon?family=Material+Icons`). If there's genuinely nothing appropriate, use a sturdy placeholder (a filled square with the right color) and flag it — never draw your own SVG from scratch.

---

## Using the system

Every HTML or React artifact should start by importing `colors_and_type.css`:

```html
<link rel="stylesheet" href="path/to/colors_and_type.css">
```

Then compose with the tokens: `var(--primary)`, `var(--fg-primary)`, `var(--space-5)`, etc. The `portal.css` inside `ui_kits/portal/` is a worked example of composing the shell.

## Caveats

- **Caveat** (the script font) is the closest Google-Fonts match to the portal's handwriting accents. The repo doesn't ship a proprietary script face, so Caveat is an acceptable default — swap it if the brand team has a preferred signature font.
- **Mobile app**: this system covers the web portal only. The mobile app (`portal-mobile`?) would deserve its own UI kit if the repo is attached in a future session.
- **Marketing site** (`1-800accountant.com`): not in scope here — different design language (more photography-forward).

