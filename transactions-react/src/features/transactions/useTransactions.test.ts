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
