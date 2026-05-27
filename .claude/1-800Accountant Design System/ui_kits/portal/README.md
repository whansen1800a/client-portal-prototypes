# Portal UI Kit — 1-800Accountant Client Portal

A React recreation of key screens from `portal-web` (the `/client-portal` single-page app).

## Screens (click-through)
- **Dashboard** — AI Dashboard hero (CurvedBox), KPI strip, recent transactions, deadlines, team, to-do
- **Transactions** — tabs (All / Needs review / Income / Expenses), search, table with status pills
- **Bookkeeping** — MTD totals, category breakdown with inline bars
- **Documents** — folder grid + recent file list with type chips
- **Messages** — threads rail + conversation view with green outgoing bubbles

## Files
- `index.html` — mounts the app, switches screens
- `portal.css` — shared shell styles (sidebar, topbar, cards, pills, buttons)
- `Shell.jsx` — `Sidebar`, `Topbar`, `NAV_ITEMS`
- `Dashboard.jsx` — `Dashboard`, `KpiCard`, `TransactionList`, `DeadlineList`, `TeamCard`, `ChecklistCard`
- `Screens.jsx` — `Transactions`, `Documents`, `Messages`, `Bookkeeping`

## Faithful-to-source notes
- Sidebar selected state (`#DBF6E7` fill + 3px `#2DA38D` left border) mirrors `DashboardLayout.tsx`
- CurvedBox hero (32px radius, soft shadow, warm gradient) comes from the AI Dashboard
- Buttons are 36px / 4px radius / no uppercase — matches `ThemeCustom.tsx`
- Typography scale is the "vehicle" scale (`bike_50` → `truck_175`) from `UiText.tsx`
- Scrollbar track uses `#2DA38D` — portal signature

## What's faked
- Data is in-memory; no backend
- Auth/onboarding flows are not represented
- Advanced tables (pagination, filters beyond tabs) are simplified
