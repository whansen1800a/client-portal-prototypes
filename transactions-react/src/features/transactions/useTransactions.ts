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
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    setSelectedIds(checked ? new Set(transactions.map(t => t.id)) : new Set());
  }, [transactions]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return { transactions, filters, selectedIds, setFilters, toggleSelect, toggleAll, clearSelection };
}
