import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Table, TableBody } from '@mui/material';
import theme from '../../theme';
import { TransactionRow } from './TransactionRow';
import { MOCK_TRANSACTIONS } from './transactions.mock';

const tx = MOCK_TRANSACTIONS[0]; // QuickBooks Online, -$35.00, reconciled, categorized

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

  it('renders formatted expense amount without + prefix', () => {
    render(<TransactionRow transaction={tx} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('$35.00')).toBeInTheDocument();
  });

  it('renders +$ prefix for income transaction', () => {
    const income = MOCK_TRANSACTIONS[4]; // tx-005 Client payment, +$4500
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
    const uncategorized = MOCK_TRANSACTIONS[2]; // tx-003 Google Ads, needs_review
    render(<TransactionRow transaction={uncategorized} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });

  it('shows R badge for reconciled transactions', () => {
    render(<TransactionRow transaction={tx} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('shows category name for categorized transactions', () => {
    render(<TransactionRow transaction={tx} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('Software & subscriptions')).toBeInTheDocument();
  });

  it('shows "Needs review" sub-label for needs_review transaction', () => {
    const needsReview = MOCK_TRANSACTIONS[2]; // tx-003 Google Ads
    render(<TransactionRow transaction={needsReview} selected={false} onToggle={() => {}} />, { wrapper });
    expect(screen.getByText('Needs review')).toBeInTheDocument();
  });
});
