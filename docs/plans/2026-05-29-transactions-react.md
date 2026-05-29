# Transactions React Rebuild — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild `transactions-single-col.html` as a React 17 + TypeScript + MUI v5 Vite app, structured as drop-in components for `portal-web-master`.

**Architecture:** Flat 5-component split with one smart parent (`TransactionsPage`) that owns all state via a `useTransactions` hook. The hook uses local `useState` for the standalone demo and can be swapped for a Redux version for portal integration. MUI v5 + Emotion provides all styling via `sx` prop and `styled()`.

**Tech Stack:** React 17, TypeScript 4.9, Vite 4, MUI v5 (`@mui/material`, `@mui/icons-material`), Emotion, Vitest, @testing-library/react

---

## Reference

- Design doc: `docs/plans/2026-05-29-transactions-react-design.md`
- HTML prototype to match: `transactions-single-col.html`
- Brand tokens: `.claude/1-800Accountant Design System/` (colors: `#F15F22` orange CTAs, `#2DA38D` teal chrome, `#F7F7F7` bg, `#121724` text)
- Portal stack reference: `C:\Users\swade\OneDrive\Desktop\portal-code\client-portal-code`

---

## Task 1: Scaffold the Vite project

**Files:**
- Create: `transactions-react/` (project root)

**Step 1: Scaffold**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
npm create vite@4 transactions-react -- --template react-ts
cd transactions-react
```

**Step 2: Install dependencies**

```bash
npm install @mui/material@5 @mui/icons-material@5 @emotion/react@11 @emotion/styled@11
npm install --save-dev vitest @testing-library/react@14 @testing-library/jest-dom@6 @testing-library/user-event@14 jsdom
```

**Step 3: Configure Vitest in `vite.config.ts`**

Replace the generated `vite.config.ts` entirely:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
```

**Step 4: Create test setup file**

Create `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom';
```

**Step 5: Update `tsconfig.json`** — ensure `strict: false` to match portal:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

**Step 6: Delete generated boilerplate**

Delete: `src/App.css`, `src/index.css`, `src/assets/react.svg`, `public/vite.svg`

**Step 7: Run dev server to verify scaffold works**

```bash
npm run dev
```
Expected: Vite dev server starts on `http://localhost:5173`

**Step 8: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/
git commit -m "feat: scaffold transactions-react Vite + MUI v5 project"
```

---

## Task 2: TypeScript interfaces + mock data

**Files:**
- Create: `transactions-react/src/features/transactions/transactions.types.ts`
- Create: `transactions-react/src/features/transactions/transactions.mock.ts`
- Create: `transactions-react/src/features/transactions/transactions.types.test.ts`

**Step 1: Write the types**

Create `src/features/transactions/transactions.types.ts`:

```ts
export type TransactionStatus = 'reconciled' | 'transfer' | 'duplicate';
export type CategorizationState = 'categorized' | 'uncategorized' | 'needs_review';
export type DateRangeFilter = 'all' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type ActiveTab = 'active' | 'excluded';

export interface ITransaction {
  id: string;
  date: string;                    // ISO "2026-05-27"
  merchantName: string;
  merchantInitials: string;        // e.g. "QBO"
  merchantColor: string;           // hex
  accountMask: string;             // e.g. "Chase ···· 4821"
  categoryName: string;
  categoryColor: string;           // hex dot color
  categorizationState: CategorizationState;
  statuses: TransactionStatus[];
  amount: number;                  // negative = expense, positive = income
  isIncome: boolean;
}

export interface IFilterState {
  dateRange: DateRangeFilter;
  category: string | null;
  account: string | null;
  amountFilter: null | { operator: 'gt' | 'lt' | 'eq'; value: number };
}

export const DEFAULT_FILTERS: IFilterState = {
  dateRange: 'all',
  category: null,
  account: null,
  amountFilter: null,
};
```

**Step 2: Write mock data**

Create `src/features/transactions/transactions.mock.ts`:

```ts
import { ITransaction } from './transactions.types';

export const MOCK_TRANSACTIONS: ITransaction[] = [
  {
    id: 'tx-001',
    date: '2026-05-27',
    merchantName: 'QuickBooks Online',
    merchantInitials: 'QBO',
    merchantColor: '#4A90D9',
    accountMask: 'Chase ···· 4821',
    categoryName: 'Software & subscriptions',
    categoryColor: '#7C3AED',
    categorizationState: 'categorized',
    statuses: ['reconciled'],
    amount: -35.00,
    isIncome: false,
  },
  {
    id: 'tx-002',
    date: '2026-05-27',
    merchantName: 'Amazon Business',
    merchantInitials: 'AM',
    merchantColor: '#E54604',
    accountMask: 'Chase ···· 4821',
    categoryName: 'Office supplies',
    categoryColor: '#0780A6',
    categorizationState: 'categorized',
    statuses: [],
    amount: -142.87,
    isIncome: false,
  },
  {
    id: 'tx-003',
    date: '2026-05-26',
    merchantName: 'Google Ads',
    merchantInitials: 'GA',
    merchantColor: '#148672',
    accountMask: 'BOA ···· 2203',
    categoryName: 'Uncategorized',
    categoryColor: '#F15F22',
    categorizationState: 'needs_review',
    statuses: [],
    amount: -380.00,
    isIncome: false,
  },
  {
    id: 'tx-004',
    date: '2026-05-26',
    merchantName: 'Zoom',
    merchantInitials: 'ZM',
    merchantColor: '#3F5261',
    accountMask: 'Chase ···· 4821',
    categoryName: 'Software & subscriptions',
    categoryColor: '#7C3AED',
    categorizationState: 'categorized',
    statuses: ['reconciled'],
    amount: -16.99,
    isIncome: false,
  },
  {
    id: 'tx-005',
    date: '2026-05-25',
    merchantName: 'Client payment — Acme Corp',
    merchantInitials: 'CL',
    merchantColor: '#1776B6',
    accountMask: 'Chase ···· 4821',
    categoryName: 'Business income',
    categoryColor: '#148672',
    categorizationState: 'categorized',
    statuses: ['reconciled'],
    amount: 4500.00,
    isIncome: true,
  },
  {
    id: 'tx-006',
    date: '2026-05-25',
    merchantName: "Morton's The Steakhouse",
    merchantInitials: 'MR',
    merchantColor: '#C71D1D',
    accountMask: 'Amex ···· 9001',
    categoryName: 'Meals & entertainment',
    categoryColor: '#F34B04',
    categorizationState: 'categorized',
    statuses: [],
    amount: -213.40,
    isIncome: false,
  },
  {
    id: 'tx-007',
    date: '2026-05-24',
    merchantName: 'Slack Technologies',
    merchantInitials: 'SL',
    merchantColor: '#274F54',
    accountMask: 'Chase ···· 4821',
    categoryName: 'Uncategorized',
    categoryColor: '#F15F22',
    categorizationState: 'needs_review',
    statuses: [],
    amount: -87.50,
    isIncome: false,
  },
  {
    id: 'tx-008',
    date: '2026-05-23',
    merchantName: 'USPS Priority Shipping',
    merchantInitials: 'US',
    merchantColor: '#58595C',
    accountMask: 'Chase ···· 4821',
    categoryName: 'Shipping & postage',
    categoryColor: '#0780A6',
    categorizationState: 'categorized',
    statuses: ['reconciled'],
    amount: -28.75,
    isIncome: false,
  },
  {
    id: 'tx-009',
    date: '2026-05-22',
    merchantName: 'ComEd — Electric',
    merchantInitials: 'CW',
    merchantColor: '#1F7262',
    accountMask: 'BOA ···· 2203',
    categoryName: 'Utilities',
    categoryColor: '#3B7A80',
    categorizationState: 'categorized',
    statuses: ['reconciled'],
    amount: -194.22,
    isIncome: false,
  },
  {
    id: 'tx-010',
    date: '2026-05-21',
    merchantName: 'LinkedIn Premium',
    merchantInitials: 'LK',
    merchantColor: '#154C79',
    accountMask: 'Chase ···· 4821',
    categoryName: 'Software & subscriptions',
    categoryColor: '#7C3AED',
    categorizationState: 'categorized',
    statuses: ['transfer'],
    amount: -39.99,
    isIncome: false,
  },
  {
    id: 'tx-011',
    date: '2026-04-30',
    merchantName: 'Stripe — Payment processing',
    merchantInitials: 'SP',
    merchantColor: '#3F5261',
    accountMask: 'Chase ···· 4821',
    categoryName: 'Professional services',
    categoryColor: '#0780A6',
    categorizationState: 'categorized',
    statuses: ['reconciled'],
    amount: -56.42,
    isIncome: false,
  },
  {
    id: 'tx-012',
    date: '2026-04-29',
    merchantName: 'Office Depot',
    merchantInitials: 'OD',
    merchantColor: '#784E03',
    accountMask: 'Amex ···· 9001',
    categoryName: 'Uncategorized',
    categoryColor: '#F15F22',
    categorizationState: 'needs_review',
    statuses: ['duplicate'],
    amount: -74.19,
    isIncome: false,
  },
];
```

**Step 3: Write a smoke test**

Create `src/features/transactions/transactions.types.test.ts`:

```ts
import { MOCK_TRANSACTIONS } from './transactions.mock';
import { DEFAULT_FILTERS } from './transactions.types';

describe('transactions mock data', () => {
  it('has 12 transactions', () => {
    expect(MOCK_TRANSACTIONS).toHaveLength(12);
  });

  it('every transaction has required fields', () => {
    MOCK_TRANSACTIONS.forEach(tx => {
      expect(tx.id).toBeTruthy();
      expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof tx.amount).toBe('number');
      expect(Array.isArray(tx.statuses)).toBe(true);
    });
  });

  it('income transactions have positive amount', () => {
    MOCK_TRANSACTIONS
      .filter(tx => tx.isIncome)
      .forEach(tx => expect(tx.amount).toBeGreaterThan(0));
  });

  it('DEFAULT_FILTERS has all null filters', () => {
    expect(DEFAULT_FILTERS.category).toBeNull();
    expect(DEFAULT_FILTERS.account).toBeNull();
    expect(DEFAULT_FILTERS.amountFilter).toBeNull();
    expect(DEFAULT_FILTERS.dateRange).toBe('all');
  });
});
```

**Step 4: Run tests**

```bash
cd transactions-react && npx vitest run
```
Expected: 4 tests pass

**Step 5: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/src/features/
git commit -m "feat: add transaction types, mock data, and smoke tests"
```

---

## Task 3: MUI theme

**Files:**
- Create: `transactions-react/src/theme.ts`
- Create: `transactions-react/src/theme.test.ts`

**Step 1: Write the theme**

Create `src/theme.ts`:

```ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#F15F22', contrastText: '#FFFFFF' },
    secondary:  { main: '#2DA38D', contrastText: '#FFFFFF' },
    error:      { main: '#E0284A' },
    warning:    { main: '#784E03', light: '#FFCF7C' },
    success:    { main: '#2DA38D', light: '#DBF6E7' },
    info:       { main: '#1776B6', light: '#EBF3FF' },
    text: {
      primary:   '#121724',
      secondary: 'rgba(18,23,36,0.65)',
      disabled:  'rgba(18,23,36,0.42)',
    },
    background: {
      default: '#F7F7F7',
      paper:   '#FFFFFF',
    },
    divider: 'rgba(0,0,0,0.12)',
    action: {
      hover:    'rgba(0,0,0,0.08)',
      selected: '#DBF6E7',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  500,
    fontWeightBold:    600,
    caption: { fontSize: '0.75rem',  lineHeight: 1.33 },  // moped_75
    body2:   { fontSize: '0.875rem', lineHeight: 1.43 },  // motorcycle_90
    body1:   { fontSize: '1rem',     lineHeight: 1.5  },  // car_100
    h6:      { fontSize: '1.125rem', fontWeight: 600  },  // hatchback_125
    h5:      { fontSize: '1.5rem',   fontWeight: 600  },  // suv_150
    h4:      { fontSize: '1.75rem',  fontWeight: 600  },  // truck_175
    overline: {
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F7F7F7' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          height: 36,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        sizeSmall: { height: 28, fontSize: '0.75rem' },
        sizeLarge:  { height: 52, fontSize: '1rem' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
    MuiCheckbox: {
      defaultProps: { color: 'secondary' },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'rgba(0,0,0,0.04)' },
        head: {
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'rgba(18,23,36,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(18,23,36,0.06), 0 1px 2px rgba(18,23,36,0.04)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 36,
          height: 36,
          fontSize: '0.8125rem',
          fontWeight: 600,
          borderRadius: '50%',
        },
      },
    },
  },
});

export default theme;
```

**Step 2: Write a smoke test**

Create `src/theme.test.ts`:

```ts
import theme from './theme';

describe('1-800A MUI theme', () => {
  it('primary color is orange', () => {
    expect(theme.palette.primary.main).toBe('#F15F22');
  });

  it('secondary color is teal', () => {
    expect(theme.palette.secondary.main).toBe('#2DA38D');
  });

  it('font family starts with Poppins', () => {
    expect(theme.typography.fontFamily).toMatch(/^'Poppins'/);
  });

  it('default border radius is 8px', () => {
    expect(theme.shape.borderRadius).toBe(8);
  });
});
```

**Step 3: Run tests**

```bash
npx vitest run
```
Expected: 8 tests pass (4 from Task 2 + 4 new)

**Step 4: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/src/theme.ts transactions-react/src/theme.test.ts
git commit -m "feat: add 1-800A MUI v5 theme with brand tokens"
```

---

## Task 4: `useTransactions` hook

**Files:**
- Create: `transactions-react/src/features/transactions/useTransactions.ts`
- Create: `transactions-react/src/features/transactions/useTransactions.test.ts`

**Step 1: Write the hook**

Create `src/features/transactions/useTransactions.ts`:

```ts
import { useState, useCallback, useMemo } from 'react';
import { ITransaction, IFilterState, DEFAULT_FILTERS } from './transactions.types';
import { MOCK_TRANSACTIONS } from './transactions.mock';

export interface UseTransactionsReturn {
  transactions: ITransaction[];
  filters: IFilterState;
  selectedIds: Set<string>;
  setFilters: (partial: Partial<IFilterState>) => void;
  toggleSelect: (id: string) => void;
  toggleAll: (checked: boolean) => void;
  clearSelection: () => void;
}

export function useTransactions(): UseTransactionsReturn {
  const [filters, setFiltersState] = useState<IFilterState>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Apply filters to mock data
  const transactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(tx => {
      if (filters.category && tx.categoryName !== filters.category) return false;
      if (filters.account && tx.accountMask !== filters.account) return false;
      if (filters.amountFilter) {
        const { operator, value } = filters.amountFilter;
        const abs = Math.abs(tx.amount);
        if (operator === 'gt' && abs <= value) return false;
        if (operator === 'lt' && abs >= value) return false;
        if (operator === 'eq' && abs !== value) return false;
      }
      return true;
    });
  }, [filters]);

  const setFilters = useCallback((partial: Partial<IFilterState>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
    setSelectedIds(new Set()); // clear selection on filter change
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    setSelectedIds(checked ? new Set(MOCK_TRANSACTIONS.map(t => t.id)) : new Set());
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return { transactions, filters, selectedIds, setFilters, toggleSelect, toggleAll, clearSelection };
}
```

**Step 2: Write tests**

Create `src/features/transactions/useTransactions.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { useTransactions } from './useTransactions';
import { MOCK_TRANSACTIONS } from './transactions.mock';

describe('useTransactions', () => {
  it('returns all mock transactions by default', () => {
    const { result } = renderHook(() => useTransactions());
    expect(result.current.transactions).toHaveLength(MOCK_TRANSACTIONS.length);
  });

  it('starts with empty selection', () => {
    const { result } = renderHook(() => useTransactions());
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('toggleSelect adds and removes an id', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.toggleSelect('tx-001'));
    expect(result.current.selectedIds.has('tx-001')).toBe(true);
    act(() => result.current.toggleSelect('tx-001'));
    expect(result.current.selectedIds.has('tx-001')).toBe(false);
  });

  it('toggleAll selects all transactions', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.toggleAll(true));
    expect(result.current.selectedIds.size).toBe(MOCK_TRANSACTIONS.length);
  });

  it('toggleAll(false) clears all selections', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.toggleAll(true));
    act(() => result.current.toggleAll(false));
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('clearSelection empties the set', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.toggleSelect('tx-001'));
    act(() => result.current.clearSelection());
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('setFilters clears selection', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.toggleSelect('tx-001'));
    act(() => result.current.setFilters({ category: 'Utilities' }));
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('filters by category', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.setFilters({ category: 'Utilities' }));
    expect(result.current.transactions.every(tx => tx.categoryName === 'Utilities')).toBe(true);
  });
});
```

**Step 3: Run tests**

```bash
npx vitest run
```
Expected: all tests pass

**Step 4: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/src/features/transactions/useTransactions.ts \
        transactions-react/src/features/transactions/useTransactions.test.ts
git commit -m "feat: add useTransactions hook with filtering and selection"
```

---

## Task 5: `BulkActionBar` component

**Files:**
- Create: `transactions-react/src/features/transactions/BulkActionBar.tsx`
- Create: `transactions-react/src/features/transactions/BulkActionBar.test.tsx`

**Step 1: Write the component**

Create `src/features/transactions/BulkActionBar.tsx`:

```tsx
import React from 'react';
import { Box, Button, Collapse, Typography } from '@mui/material';
import CategoryIcon from '@mui/icons-material/LabelOutlined';
import ExcludeIcon from '@mui/icons-material/BlockOutlined';

interface BulkActionBarProps {
  selectedCount: number;
  onCategorize: () => void;
  onExclude: () => void;
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, onCategorize, onExclude, onClear }: BulkActionBarProps) {
  const open = selectedCount > 0;

  return (
    <Collapse in={open}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: '10px',
          bgcolor: 'action.selected',  // #DBF6E7
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="body2"
          sx={{ flexGrow: 1, color: 'secondary.main', fontWeight: 500 }}
        >
          {selectedCount} transaction{selectedCount !== 1 ? 's' : ''} selected
        </Typography>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<CategoryIcon />}
          onClick={onCategorize}
          sx={{ borderRadius: '4px' }}
        >
          Categorize
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<ExcludeIcon />}
          onClick={onExclude}
          sx={{ borderRadius: '4px' }}
        >
          Exclude
        </Button>

        <Button
          variant="text"
          size="small"
          onClick={onClear}
          sx={{ color: 'text.secondary', minWidth: 'auto' }}
        >
          Clear
        </Button>
      </Box>
    </Collapse>
  );
}
```

**Step 2: Write tests**

Create `src/features/transactions/BulkActionBar.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { BulkActionBar } from './BulkActionBar';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('BulkActionBar', () => {
  const noop = () => {};

  it('does not render when selectedCount is 0', () => {
    render(
      <BulkActionBar selectedCount={0} onCategorize={noop} onExclude={noop} onClear={noop} />,
      { wrapper }
    );
    expect(screen.queryByText(/selected/)).not.toBeVisible();
  });

  it('shows correct count for 3 selected', () => {
    render(
      <BulkActionBar selectedCount={3} onCategorize={noop} onExclude={noop} onClear={noop} />,
      { wrapper }
    );
    expect(screen.getByText('3 transactions selected')).toBeInTheDocument();
  });

  it('uses singular when 1 is selected', () => {
    render(
      <BulkActionBar selectedCount={1} onCategorize={noop} onExclude={noop} onClear={noop} />,
      { wrapper }
    );
    expect(screen.getByText('1 transaction selected')).toBeInTheDocument();
  });

  it('calls onCategorize when Categorize button clicked', () => {
    const onCategorize = vi.fn();
    render(
      <BulkActionBar selectedCount={2} onCategorize={onCategorize} onExclude={noop} onClear={noop} />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Categorize'));
    expect(onCategorize).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when Clear clicked', () => {
    const onClear = vi.fn();
    render(
      <BulkActionBar selectedCount={2} onCategorize={noop} onExclude={noop} onClear={onClear} />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
```

**Step 3: Run tests**

```bash
npx vitest run
```
Expected: all pass

**Step 4: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/src/features/transactions/BulkActionBar.tsx \
        transactions-react/src/features/transactions/BulkActionBar.test.tsx
git commit -m "feat: add BulkActionBar component with Collapse animation"
```

---

## Task 6: `TransactionRow` component

**Files:**
- Create: `transactions-react/src/features/transactions/TransactionRow.tsx`
- Create: `transactions-react/src/features/transactions/TransactionRow.test.tsx`

**Step 1: Write the component**

Create `src/features/transactions/TransactionRow.tsx`:

```tsx
import React from 'react';
import {
  TableRow, TableCell, Checkbox, Avatar,
  Box, Typography, Chip
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ITransaction } from './transactions.types';

interface TransactionRowProps {
  transaction: ITransaction;
  selected: boolean;
  onToggle: (id: string) => void;
}

const STATUS_CONFIG = {
  reconciled: { label: 'R', bgcolor: '#DBF6E7', color: '#2DA38D' },
  transfer:   { label: 'T', bgcolor: '#EBF3FF', color: '#1776B6' },
  duplicate:  { label: 'D', bgcolor: '#FFCF7C', color: '#784E03' },
} as const;

function formatAmount(amount: number, isIncome: boolean): string {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isIncome ? `+$${abs}` : `$${abs}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TransactionRow({ transaction: tx, selected, onToggle }: TransactionRowProps) {
  return (
    <TableRow
      hover
      selected={selected}
      onClick={() => onToggle(tx.id)}
      sx={{
        cursor: 'pointer',
        '&.Mui-selected': { bgcolor: 'rgba(219,246,231,0.25)' },
        '&.Mui-selected:hover': { bgcolor: 'rgba(219,246,231,0.4)' },
        '& .row-actions': { opacity: 0 },
        '&:hover .row-actions': { opacity: 1 },
      }}
    >
      {/* Checkbox */}
      <TableCell padding="checkbox" sx={{ pl: 2 }}>
        <Checkbox
          checked={selected}
          color="secondary"
          size="small"
          onClick={e => e.stopPropagation()}
          onChange={() => onToggle(tx.id)}
        />
      </TableCell>

      {/* Date */}
      <TableCell sx={{ width: 60, color: 'text.secondary', typography: 'caption', fontWeight: 500 }}>
        {formatDate(tx.date)}
      </TableCell>

      {/* Merchant */}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: tx.merchantColor, width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700 }}>
            {tx.merchantInitials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {tx.merchantName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {tx.accountMask}
              {tx.categorizationState === 'needs_review' && (
                <>
                  &nbsp;·&nbsp;
                  <Box component="span" sx={{ color: 'warning.main', fontWeight: 500 }}>
                    Needs review
                  </Box>
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Category */}
      <TableCell sx={{ width: 220 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              bgcolor: tx.categoryColor,
            }}
          />
          <Typography
            variant="body2"
            color={tx.categorizationState === 'uncategorized' || tx.categorizationState === 'needs_review'
              ? 'text.secondary' : 'text.secondary'}
            fontStyle={tx.categorizationState !== 'categorized' ? 'italic' : 'normal'}
            noWrap
          >
            {tx.categorizationState !== 'categorized' ? 'Uncategorized' : tx.categoryName}
          </Typography>
        </Box>
      </TableCell>

      {/* Status badges */}
      <TableCell sx={{ width: 100 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {tx.statuses.map(status => {
            const cfg = STATUS_CONFIG[status];
            return (
              <Box
                key={status}
                sx={{
                  width: 18, height: 18,
                  borderRadius: '50%',
                  bgcolor: cfg.bgcolor,
                  color: cfg.color,
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {cfg.label}
              </Box>
            );
          })}
        </Box>
      </TableCell>

      {/* Amount */}
      <TableCell align="right" sx={{ width: 120 }}>
        <Typography
          variant="body2"
          fontWeight={500}
          fontFamily="Menlo, 'source-code-pro', monospace"
          color={tx.isIncome ? 'success.main' : 'text.primary'}
        >
          {formatAmount(tx.amount, tx.isIncome)}
        </Typography>
      </TableCell>

      {/* Chevron */}
      <TableCell sx={{ width: 36, pr: 1 }}>
        <ChevronRightIcon
          className="row-actions"
          sx={{ color: 'text.disabled', fontSize: 18, transition: 'opacity 120ms ease', display: 'block' }}
        />
      </TableCell>
    </TableRow>
  );
}
```

**Step 2: Write tests**

Create `src/features/transactions/TransactionRow.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Table, TableBody } from '@mui/material';
import theme from '../../theme';
import { TransactionRow } from './TransactionRow';
import { MOCK_TRANSACTIONS } from './transactions.mock';

const tx = MOCK_TRANSACTIONS[0]; // QuickBooks Online, -$35.00, reconciled

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <Table><TableBody>{children}</TableBody></Table>
  </ThemeProvider>
);

describe('TransactionRow', () => {
  it('renders merchant name', () => {
    render(<TransactionRow transaction={tx} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('QuickBooks Online')).toBeInTheDocument();
  });

  it('renders formatted amount', () => {
    render(<TransactionRow transaction={tx} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('$35.00')).toBeInTheDocument();
  });

  it('renders +$ prefix for income', () => {
    const income = MOCK_TRANSACTIONS[4]; // Client payment, +$4500
    render(<TransactionRow transaction={income} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('+$4,500.00')).toBeInTheDocument();
  });

  it('calls onToggle with transaction id when row clicked', () => {
    const onToggle = vi.fn();
    render(<TransactionRow transaction={tx} selected={false} onToggle={onToggle} />, { wrapper });
    fireEvent.click(screen.getByText('QuickBooks Online'));
    expect(onToggle).toHaveBeenCalledWith('tx-001');
  });

  it('shows "Uncategorized" for needs_review transactions', () => {
    const uncategorized = MOCK_TRANSACTIONS[2]; // Google Ads, needs_review
    render(<TransactionRow transaction={uncategorized} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });

  it('shows R badge for reconciled transactions', () => {
    render(<TransactionRow transaction={tx} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('R')).toBeInTheDocument();
  });
});
```

**Step 3: Run tests**

```bash
npx vitest run
```
Expected: all pass

**Step 4: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/src/features/transactions/TransactionRow.tsx \
        transactions-react/src/features/transactions/TransactionRow.test.tsx
git commit -m "feat: add TransactionRow component with merchant, category, badges, amount"
```

---

## Task 7: `FilterBar` component

**Files:**
- Create: `transactions-react/src/features/transactions/FilterBar.tsx`
- Create: `transactions-react/src/features/transactions/FilterBar.test.tsx`

**Step 1: Write the component**

Create `src/features/transactions/FilterBar.tsx`:

```tsx
import React from 'react';
import {
  Box, Paper, Button, Chip, Badge, Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import { IFilterState } from './transactions.types';

interface FilterBarProps {
  filters: IFilterState;
  onFilterChange: (partial: Partial<IFilterState>) => void;
}

const DATE_LABELS: Record<string, string> = {
  all: 'All dates', week: 'This week', month: 'This month',
  quarter: 'Last 3 months', year: 'This year', custom: 'Custom range',
};

function activeFilterCount(filters: IFilterState): number {
  let count = 0;
  if (filters.dateRange !== 'all') count++;
  if (filters.category) count++;
  if (filters.account) count++;
  if (filters.amountFilter) count++;
  return count;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const filterCount = activeFilterCount(filters);

  // Active chips — one per active filter
  const chips: { label: string; key: keyof IFilterState }[] = [];
  if (filters.category) chips.push({ label: `Category: ${filters.category}`, key: 'category' });
  if (filters.account)  chips.push({ label: `Account: ${filters.account}`, key: 'account' });

  const filterBtnStyle = (active: boolean) => ({
    color: active ? 'secondary.main' : 'text.secondary',
    fontWeight: active ? 500 : 400,
    borderRadius: 0,
    px: 2,
    py: '12px',
    height: 'auto',
    borderRight: '1px solid',
    borderColor: 'divider',
    '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
  });

  return (
    <Box>
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: chips.length > 0 ? 1.5 : 2,
          overflow: 'hidden',
        }}
      >
        {/* Date filter */}
        <Button
          endIcon={<KeyboardArrowDownIcon />}
          sx={filterBtnStyle(filters.dateRange !== 'all')}
        >
          {DATE_LABELS[filters.dateRange]}
        </Button>

        {/* Category filter */}
        <Button
          endIcon={<KeyboardArrowDownIcon />}
          sx={filterBtnStyle(!!filters.category)}
        >
          {filters.category ?? 'All categories'}
        </Button>

        {/* Account filter */}
        <Button
          endIcon={<KeyboardArrowDownIcon />}
          sx={filterBtnStyle(!!filters.account)}
        >
          {filters.account ?? 'All accounts'}
        </Button>

        {/* Amount filter */}
        <Button
          endIcon={<KeyboardArrowDownIcon />}
          sx={filterBtnStyle(!!filters.amountFilter)}
        >
          {filters.amountFilter ? `Amount filter` : 'All amounts'}
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        {/* Filters button with badge */}
        <Badge
          badgeContent={filterCount}
          color="primary"
          invisible={filterCount === 0}
          sx={{ mr: 1 }}
        >
          <Button
            startIcon={<TuneIcon />}
            sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
          >
            Filters
          </Button>
        </Badge>
      </Paper>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
          {chips.map(chip => (
            <Chip
              key={chip.key}
              label={chip.label}
              size="small"
              onDelete={() => onFilterChange({ [chip.key]: null })}
              sx={{
                bgcolor: 'success.light',
                color: 'secondary.main',
                fontWeight: 500,
                '& .MuiChip-deleteIcon': { color: 'secondary.main', opacity: 0.6 },
              }}
            />
          ))}
          <Button
            variant="text"
            size="small"
            onClick={() => onFilterChange({ category: null, account: null, amountFilter: null, dateRange: 'all' })}
            sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
          >
            Clear all
          </Button>
        </Box>
      )}
    </Box>
  );
}
```

**Step 2: Write tests**

Create `src/features/transactions/FilterBar.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { FilterBar } from './FilterBar';
import { DEFAULT_FILTERS, IFilterState } from './transactions.types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('FilterBar', () => {
  it('renders all four filter buttons', () => {
    render(<FilterBar filters={DEFAULT_FILTERS} onFilterChange={() => {}} />, { wrapper });
    expect(screen.getByText('All dates')).toBeInTheDocument();
    expect(screen.getByText('All categories')).toBeInTheDocument();
    expect(screen.getByText('All accounts')).toBeInTheDocument();
    expect(screen.getByText('All amounts')).toBeInTheDocument();
  });

  it('shows active category chip when category filter is set', () => {
    const filters: IFilterState = { ...DEFAULT_FILTERS, category: 'Utilities' };
    render(<FilterBar filters={filters} onFilterChange={() => {}} />, { wrapper });
    expect(screen.getByText('Category: Utilities')).toBeInTheDocument();
  });

  it('calls onFilterChange with null category when chip deleted', () => {
    const onFilterChange = vi.fn();
    const filters: IFilterState = { ...DEFAULT_FILTERS, category: 'Utilities' };
    render(<FilterBar filters={filters} onFilterChange={onFilterChange} />, { wrapper });
    fireEvent.click(screen.getByTestId('CancelIcon')); // MUI chip delete icon
    expect(onFilterChange).toHaveBeenCalledWith({ category: null });
  });

  it('shows Clear all when chips are present', () => {
    const filters: IFilterState = { ...DEFAULT_FILTERS, category: 'Utilities' };
    render(<FilterBar filters={filters} onFilterChange={() => {}} />, { wrapper });
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('does not show Clear all when no filters active', () => {
    render(<FilterBar filters={DEFAULT_FILTERS} onFilterChange={() => {}} />, { wrapper });
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });
});
```

**Step 3: Run tests**

```bash
npx vitest run
```
Expected: all pass

**Step 4: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/src/features/transactions/FilterBar.tsx \
        transactions-react/src/features/transactions/FilterBar.test.tsx
git commit -m "feat: add FilterBar with dropdown triggers and active filter chips"
```

---

## Task 8: `TransactionTable` component

**Files:**
- Create: `transactions-react/src/features/transactions/TransactionTable.tsx`
- Create: `transactions-react/src/features/transactions/TransactionTable.test.tsx`

**Step 1: Write the component**

Create `src/features/transactions/TransactionTable.tsx`:

```tsx
import React, { useMemo } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow,
  TableCell, Checkbox, Box, Typography, TablePagination
} from '@mui/material';
import { ITransaction } from './transactions.types';
import { TransactionRow } from './TransactionRow';
import { BulkActionBar } from './BulkActionBar';

interface TransactionTableProps {
  transactions: ITransaction[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onClearSelection: () => void;
}

function groupByMonth(transactions: ITransaction[]): Map<string, ITransaction[]> {
  const groups = new Map<string, ITransaction[]>();
  transactions.forEach(tx => {
    const d = new Date(tx.date + 'T00:00:00');
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(tx);
  });
  return groups;
}

function getTotals(transactions: ITransaction[]) {
  const expenses = transactions.filter(t => !t.isIncome).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const income   = transactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  return { expenses, income };
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TransactionTable({
  transactions, selectedIds, onToggle, onToggleAll, onClearSelection
}: TransactionTableProps) {
  const groups = useMemo(() => groupByMonth(transactions), [transactions]);
  const { expenses, income } = useMemo(() => getTotals(transactions), [transactions]);
  const allSelected = transactions.length > 0 && selectedIds.size === transactions.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const [page, setPage] = React.useState(0);
  const rowsPerPage = 15;

  return (
    <Box>
      <Paper>
        {/* Bulk action bar */}
        <BulkActionBar
          selectedCount={selectedIds.size}
          onCategorize={() => {}}
          onExclude={() => {}}
          onClear={onClearSelection}
        />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ pl: 2 }}>
                <Checkbox
                  color="secondary"
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={e => onToggleAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ width: 60 }}>Date</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell sx={{ width: 220 }}>Category</TableCell>
              <TableCell sx={{ width: 100 }}>Status</TableCell>
              <TableCell align="right" sx={{ width: 120 }}>Amount</TableCell>
              <TableCell sx={{ width: 36 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.from(groups.entries()).map(([month, txs]) => (
              <React.Fragment key={month}>
                {/* Month divider row */}
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell
                    colSpan={7}
                    sx={{
                      py: '6px',
                      typography: 'overline',
                      color: 'text.secondary',
                      letterSpacing: '0.08em',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {month}
                  </TableCell>
                </TableRow>

                {txs.map(tx => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    selected={selectedIds.has(tx.id)}
                    onToggle={onToggle}
                  />
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        {/* Footer summary */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2, py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Showing {transactions.length} transactions
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">Total expenses</Typography>
            <Typography
              variant="body2" fontWeight={600}
              fontFamily="Menlo, 'source-code-pro', monospace"
            >
              ${formatCurrency(expenses)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>·</Typography>
            <Typography variant="caption" color="text.secondary">Total income</Typography>
            <Typography
              variant="body2" fontWeight={600} color="success.main"
              fontFamily="Menlo, 'source-code-pro', monospace"
            >
              +${formatCurrency(income)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <TablePagination
          component="div"
          count={transactions.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[15, 25, 50]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={() => {}}
          sx={{ '& .MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Box>
    </Box>
  );
}
```

**Step 2: Write tests**

Create `src/features/transactions/TransactionTable.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import { TransactionTable } from './TransactionTable';
import { MOCK_TRANSACTIONS } from './transactions.mock';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

const noop = () => {};

describe('TransactionTable', () => {
  it('renders all merchant names', () => {
    render(
      <TransactionTable
        transactions={MOCK_TRANSACTIONS}
        selectedIds={new Set()}
        onToggle={noop}
        onToggleAll={noop}
        onClearSelection={noop}
      />,
      { wrapper }
    );
    expect(screen.getByText('QuickBooks Online')).toBeInTheDocument();
    expect(screen.getByText('Amazon Business')).toBeInTheDocument();
  });

  it('renders month group dividers', () => {
    render(
      <TransactionTable
        transactions={MOCK_TRANSACTIONS}
        selectedIds={new Set()}
        onToggle={noop}
        onToggleAll={noop}
        onClearSelection={noop}
      />,
      { wrapper }
    );
    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(screen.getByText('April 2026')).toBeInTheDocument();
  });

  it('shows correct transaction count in footer', () => {
    render(
      <TransactionTable
        transactions={MOCK_TRANSACTIONS}
        selectedIds={new Set()}
        onToggle={noop}
        onToggleAll={noop}
        onClearSelection={noop}
      />,
      { wrapper }
    );
    expect(screen.getByText(`Showing ${MOCK_TRANSACTIONS.length} transactions`)).toBeInTheDocument();
  });
});
```

**Step 3: Run tests**

```bash
npx vitest run
```
Expected: all pass

**Step 4: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/src/features/transactions/TransactionTable.tsx \
        transactions-react/src/features/transactions/TransactionTable.test.tsx
git commit -m "feat: add TransactionTable with month groups, footer totals, pagination"
```

---

## Task 9: `TransactionsPage` + `App.tsx` + wiring

**Files:**
- Create: `transactions-react/src/features/transactions/TransactionsPage.tsx`
- Create: `transactions-react/src/App.tsx`
- Modify: `transactions-react/src/main.tsx`

**Step 1: Write `TransactionsPage`**

Create `src/features/transactions/TransactionsPage.tsx`:

```tsx
import React from 'react';
import { Box, Tabs, Tab, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/SyncOutlined';
import { FilterBar } from './FilterBar';
import { TransactionTable } from './TransactionTable';
import { useTransactions } from './useTransactions';

export function TransactionsPage() {
  const [activeTab, setActiveTab] = React.useState(0);
  const { transactions, filters, selectedIds, setFilters, toggleSelect, toggleAll, clearSelection } =
    useTransactions();

  return (
    <Box sx={{ p: 4, maxWidth: 1120 }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">Bookkeeping</Typography>
        <Typography variant="caption" color="text.disabled">›</Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>Transactions</Typography>
      </Box>

      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Transactions</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<AddIcon />} color="inherit">
            Add transaction
          </Button>
          <Button variant="contained" startIcon={<SyncIcon />} color="primary">
            Sync from bank
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        textColor="secondary"
        indicatorColor="secondary"
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="Active" disableRipple />
        <Tab label="Excluded" disableRipple />
      </Tabs>

      {/* Filter bar */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* Table */}
      <TransactionTable
        transactions={transactions}
        selectedIds={selectedIds}
        onToggle={toggleSelect}
        onToggleAll={toggleAll}
        onClearSelection={clearSelection}
      />
    </Box>
  );
}
```

**Step 2: Write `App.tsx`** (portal shell with sidebar)

Create `src/App.tsx`:

```tsx
import React from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography,
  List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, IconButton, InputBase, Divider
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { TransactionsPage } from './features/transactions/TransactionsPage';

const SIDEBAR_WIDTH = 248;

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: <DashboardOutlinedIcon /> },
  { label: 'Bookkeeping', icon: <MenuBookOutlinedIcon /> },
  { label: 'Taxes',       icon: <ReceiptOutlinedIcon /> },
  { label: 'Payroll',     icon: <AttachMoneyIcon /> },
  { label: 'Advisory',    icon: <PeopleOutlinedIcon /> },
  { label: 'Documents',   icon: <FolderOutlinedIcon /> },
];

export function App() {
  const [activeNav, setActiveNav] = React.useState(1); // Bookkeeping active

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {/* Logo area */}
        <Box sx={{ px: 2, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, #EF8A31, #F5BA27)',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '14px',
              }}
            >
              A
            </Box>
            <Typography
              sx={{
                fontWeight: 600, fontSize: '0.9375rem',
                color: '#3F5261', letterSpacing: '-0.01em',
              }}
            >
              1-800Accountant
            </Typography>
          </Box>
        </Box>

        {/* Nav items */}
        <List disablePadding sx={{ pt: 1 }}>
          {NAV_ITEMS.map((item, idx) => (
            <ListItemButton
              key={item.label}
              selected={activeNav === idx}
              onClick={() => setActiveNav(idx)}
              sx={{
                mx: 0, py: '10px', px: 2,
                borderLeft: '3px solid transparent',
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  borderLeftColor: 'secondary.main',
                  pl: '13px',
                },
                '&.Mui-selected .MuiListItemIcon-root': { color: 'secondary.main' },
                '&.Mui-selected .MuiListItemText-primary': {
                  color: 'secondary.main', fontWeight: 500,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary', '& svg': { fontSize: 20 } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 2, minHeight: '64px !important' }}>
            <Typography variant="h6" sx={{ flexGrow: 0, mr: 2 }}>Transactions</Typography>

            {/* Search */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                bgcolor: 'background.default', border: '1px solid', borderColor: 'divider',
                borderRadius: '4px', px: 1.5, height: 36, width: 220,
                '&:focus-within': { borderColor: 'secondary.main', bgcolor: 'background.paper' },
              }}
            >
              <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <InputBase
                placeholder="Search transactions"
                sx={{ fontSize: '0.875rem', flexGrow: 1 }}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton size="small" sx={{ position: 'relative' }}>
              <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
              <Box
                sx={{
                  position: 'absolute', top: 6, right: 6,
                  width: 8, height: 8, bgcolor: 'primary.main',
                  borderRadius: '50%', border: '1.5px solid white',
                }}
              />
            </IconButton>

            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'secondary.dark', fontSize: '0.75rem', fontWeight: 600 }}
            >
              SC
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TransactionsPage />
        </Box>
      </Box>
    </Box>
  );
}
```

**Step 3: Update `main.tsx`**

Replace the generated `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { App } from './App';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

**Step 4: Run the dev server and verify**

```bash
cd transactions-react && npm run dev
```

Open `http://localhost:5173` — should show the full portal shell with sidebar, topbar, filter bar, and transaction list.

**Step 5: Run all tests**

```bash
npx vitest run
```
Expected: all tests pass

**Step 6: Commit**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/src/
git commit -m "feat: wire up TransactionsPage, App shell, and main entry point"
```

---

## Task 10: Build + add to index.html

**Files:**
- Modify: `transactions-react/vite.config.ts`
- Modify: `1800-todos/index.html`

**Step 1: Configure Vite base path for GitHub Pages**

Update `transactions-react/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/client-portal-prototypes/transactions-react/',
  build: { outDir: '../transactions-react-dist' },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
```

**Step 2: Build**

```bash
cd transactions-react && npm run build
```
Expected: `transactions-react-dist/` created in `1800-todos/`

**Step 3: Rename dist to deployable folder**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
mv transactions-react-dist transactions-react-build
```

**Step 4: Add demo card to index.html**

In `index.html`, add before the `payroll-contractors` card:

```html
<a class="demo-card" href="transactions-react-build/index.html">
  <div class="demo-card-badge" style="background:#EBF3FF;color:#1776B6;">Bookkeeping · React</div>
  <h2>Transactions — React</h2>
  <p>React 17 + MUI v5 rebuild of the single-column transactions list. Drop-in components for portal-web-master with useTransactions hook, full TypeScript, and Vitest test suite.</p>
  <div class="demo-card-footer">
    <span>transactions-react-build/</span>
    <span class="arrow">›</span>
  </div>
</a>
```

**Step 5: Run all tests one final time**

```bash
cd transactions-react && npx vitest run
```
Expected: all tests pass, zero failures

**Step 6: Final commit and push**

```bash
cd "C:\Users\swade\OneDrive\Desktop\1800-todos"
git add transactions-react/ transactions-react-build/ index.html
git commit -m "feat: add transactions React build (MUI v5 + TS + Vitest)"
git push origin master
```

---

## Portal drop-in checklist

When integrating into `portal-web-master`:

- [ ] Copy `src/features/transactions/` → `src/components/bookkeeping/transactions/`
- [ ] Replace `useTransactions.ts` with Redux version (`useSelector` / `useDispatch` against existing `transactionsReducer`)
- [ ] Remove `theme.ts` — use portal's existing `ThemeCustom.tsx` provider
- [ ] Remove `App.tsx` / `main.tsx` — portal shell already exists
- [ ] Reconcile `ITransaction` fields against portal's existing `transaction-models.ts`
- [ ] Replace `MOCK_TRANSACTIONS` import with real API data from `transactionsService.ts`
