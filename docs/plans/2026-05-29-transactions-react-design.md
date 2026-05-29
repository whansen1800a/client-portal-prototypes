# Transactions Page — React Rebuild Design

**Date:** 2026-05-29  
**Status:** Approved  
**Goal:** Rebuild `transactions-single-col.html` as a React application using the portal's actual tech stack (React 17 + TypeScript + MUI v5 + Emotion), delivered as both a standalone Vite demo and drop-in portal components.

---

## Decisions

| Question | Decision |
|---|---|
| Target | Both standalone demo + drop-in portal components |
| State management | Local `useState` for demo; `useTransactions` hook swapped for Redux in portal |
| Styling | MUI v5 + Emotion, matching portal exactly |
| Architecture | Option B — flat component split (5 components, one smart parent) |

---

## Component Tree

**Standalone demo** lives at `transactions-react/` in the `1800-todos` repo.  
**Portal drop-in** maps to `portal-web-master/src/components/bookkeeping/transactions/`.

```
transactions-react/
├── index.html
├── package.json              (Vite + React 17 + MUI v5 + Emotion + TS)
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── theme.ts
    ├── App.tsx
    └── features/transactions/
        ├── TransactionsPage.tsx
        ├── FilterBar.tsx
        ├── TransactionTable.tsx
        ├── TransactionRow.tsx
        ├── BulkActionBar.tsx
        ├── transactions.types.ts
        ├── transactions.mock.ts
        └── useTransactions.ts
```

### Component responsibilities

| Component | Responsibility |
|---|---|
| `TransactionsPage` | Layout shell, state owner, composes all children |
| `FilterBar` | Dropdown filter triggers + active filter chips |
| `TransactionTable` | Month group dividers, column headers, renders `TransactionRow` list |
| `TransactionRow` | Single row: date, merchant avatar, category, status badges, amount, chevron |
| `BulkActionBar` | Animated `Collapse` panel; shows count + Categorize/Exclude actions when rows selected |

---

## Data Model (`transactions.types.ts`)

```ts
export type TransactionStatus = 'reconciled' | 'transfer' | 'duplicate';
export type CategorizationState = 'categorized' | 'uncategorized' | 'needs_review';

export interface ITransaction {
  id: string;
  date: string;                    // ISO "2026-05-27"
  merchantName: string;
  merchantInitials: string;
  merchantColor: string;           // hex
  accountMask: string;             // "Chase ···· 4821"
  categoryName: string;
  categoryColor: string;
  categorizationState: CategorizationState;
  statuses: TransactionStatus[];
  amount: number;                  // negative = expense, positive = income
  isIncome: boolean;
}

export interface IFilterState {
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  category: string | null;
  account: string | null;
  amountFilter: null | { operator: 'gt' | 'lt' | 'eq'; value: number };
}
```

---

## State Shape

```ts
// TransactionsPage local state (demo)
const [transactions, setTransactions]  = useState<ITransaction[]>(mockData);
const [filters, setFilters]            = useState<IFilterState>(defaultFilters);
const [selectedIds, setSelectedIds]    = useState<Set<string>>(new Set());
const [activeTab, setActiveTab]        = useState<'active' | 'excluded'>('active');
```

### `useTransactions` hook contract
```ts
interface UseTransactionsReturn {
  transactions: ITransaction[];
  filters: IFilterState;
  selectedIds: Set<string>;
  setFilters: (f: Partial<IFilterState>) => void;
  toggleSelect: (id: string) => void;
  toggleAll: (checked: boolean) => void;
  clearSelection: () => void;
}
```
Demo implementation uses `useState`. Portal implementation exports the same shape from Redux selectors + `useDispatch`. `TransactionsPage` is identical in both.

---

## MUI Theme (`theme.ts`)

```ts
createTheme({
  palette: {
    primary:   { main: '#F15F22' },   // orange — CTAs only
    secondary: { main: '#2DA38D' },   // teal — active states, chrome
    text: { primary: '#121724', secondary: '#121724A6' },
    background: { default: '#F7F7F7', paper: '#FFFFFF' },
    error:   { main: '#E0284A' },
    warning: { main: '#784E03' },
    success: { main: '#2DA38D' },
    info:    { main: '#1776B6' },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', sans-serif",
    caption:    { fontSize: '0.75rem' },   // moped_75
    body2:      { fontSize: '0.875rem' },  // motorcycle_90
    body1:      { fontSize: '1rem' },      // car_100
    h6:         { fontSize: '1.125rem', fontWeight: 600 }, // hatchback_125
    h5:         { fontSize: '1.5rem',   fontWeight: 600 }, // suv_150
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton:   { styleOverrides: { root: { height: 36, textTransform: 'none', fontWeight: 500 } } },
    MuiChip:     { styleOverrides: { root: { borderRadius: 999 } } },
    MuiCheckbox: { defaultProps: { color: 'secondary' } },
  },
})
```

### Styling approach per component
- **`styled()`** for reusable variants (e.g., `FilterButton`, `StatusBadge`, `MerchantAvatar`)
- **`sx` prop** for one-off layout overrides on MUI primitives
- No raw CSS files

---

## MUI Components Used

| Feature | MUI Components |
|---|---|
| Layout shell | `Box`, `Drawer`, `AppBar`, `Toolbar` |
| Filter bar | `Paper`, `Button`, `Chip`, `Badge`, `Collapse` |
| Transaction table | `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell` |
| Transaction row | `Avatar`, `Typography`, `Checkbox`, `Chip` |
| Bulk action bar | `Collapse`, `Box`, `Button` |
| Pagination | `TablePagination` |

---

## Portal Drop-in Notes

To wire into `portal-web-master`:
1. Copy `features/transactions/` to `src/components/bookkeeping/transactions/`
2. Replace `useTransactions.ts` with Redux version (selectors from existing `transactionsReducer`, dispatch to existing actions)
3. Remove `theme.ts` and `main.tsx` — portal `ThemeProvider` already wraps the tree
4. Update imports for existing `ITransaction` model if shape differs

---

## Out of Scope

- Transaction detail / side panel (existing portal has `TransactionThread`)
- Category rule creation
- Manual transaction creation modal
- Mobile responsive layout
