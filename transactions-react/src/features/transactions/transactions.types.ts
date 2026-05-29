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
