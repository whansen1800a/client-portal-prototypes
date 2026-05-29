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
