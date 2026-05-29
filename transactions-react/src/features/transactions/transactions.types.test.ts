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
