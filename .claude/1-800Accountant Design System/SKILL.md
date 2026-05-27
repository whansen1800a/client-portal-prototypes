---
name: 1-800accountant-design
description: Use this skill to generate well-branded interfaces and assets for 1-800Accountant, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping the Client Portal and related surfaces.
user-invocable: true
---

# 1-800Accountant Design Skill

Read `README.md` for the full system (content fundamentals, visual foundations, iconography).
Then browse the other files as you need them — they're all small and focused.

## Starting points

- **Token source of truth**: `colors_and_type.css` — import this in every artifact. All color/type/spacing/radius/shadow tokens live here.
- **Visual foundations**: see `README.md` → *Visual foundations* for color vibe, elevation rules, motion, layout grid, CurvedBox usage, etc.
- **Voice & tone**: see `README.md` → *Content fundamentals* for copy rules. Never invent emoji or vendor-jargon copy — second-person, warm, confident.
- **UI kit**: `ui_kits/portal/` — fully working React recreation of the Client Portal. `Shell.jsx` (Sidebar + Topbar), `Dashboard.jsx`, `Screens.jsx` (Transactions, Documents, Messages, Bookkeeping). `portal.css` is the shell stylesheet. Copy pieces out — don't reinvent them.
- **Assets**:
  - `assets/logo/` — full / medium / mini lockups (SVG)
  - `assets/icons/` — 27 custom portal icons (SVG). Pair with Material Icons for missing glyphs.
  - `assets/illustrations/` — service illustrations + empty states
  - `assets/brand/` — favicon, app icon, SOC2 badge
  - `assets/images/bg-auth.jpg` — full-bleed auth backdrop

## Working modes

**Visual artifacts** (slides, mocks, prototypes, HTML one-offs):
Copy assets out of `assets/` into your artifact folder. Import `colors_and_type.css`. Build with the tokens. For Portal-like screens, lift components from `ui_kits/portal/` rather than recreating.

**Production code**:
Everything in `colors_and_type.css` maps directly to the portal's `src/variables/colors.ts` and `src/styles/ThemeCustom.tsx` names — use that as a cross-reference. The "vehicle" type scale is `UiText.tsx`.

## If invoked bare

If a user invokes this skill without any other guidance, ask them:
1. What are you designing? (screen, slide, email, mock, prototype)
2. Is it *inside* the Client Portal (tight brand adherence) or *around* it (marketing, partner, onboarding — more room to breathe)?
3. Any specific service to feature — bookkeeping, tax plan, payroll, advisory?
4. Static or interactive?

Then act as an expert designer and output HTML artifacts *or* production code, depending on the need.

## Hard rules
- **No emoji** in portal product surfaces.
- **Sentence case** for titles and buttons.
- **Second person** — "your books", never "the user."
- **Orange is for action**, teal is for chrome. Don't invert.
- **CurvedBox (32px radius)** is reserved for AI / personal / hero moments. Don't use it for every card.
- **No gradients** except the warm/cool hero gradients documented in README.
- **No drawn-from-scratch SVGs**. Use `assets/icons/` first, Material Icons second.
