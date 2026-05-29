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

  it('calls onFilterChange with null category when chip is deleted', () => {
    const onFilterChange = vi.fn();
    const filters: IFilterState = { ...DEFAULT_FILTERS, category: 'Utilities' };
    const { container } = render(<FilterBar filters={filters} onFilterChange={onFilterChange} />, { wrapper });
    // MUI Chip renders the delete icon with class MuiChip-deleteIcon
    const deleteIcon = container.querySelector('.MuiChip-deleteIcon');
    expect(deleteIcon).not.toBeNull();
    fireEvent.click(deleteIcon!);
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

  it('calls onFilterChange with all nulls when Clear all clicked', () => {
    const onFilterChange = vi.fn();
    const filters: IFilterState = { ...DEFAULT_FILTERS, category: 'Utilities' };
    render(<FilterBar filters={filters} onFilterChange={onFilterChange} />, { wrapper });
    fireEvent.click(screen.getByText('Clear all'));
    expect(onFilterChange).toHaveBeenCalledWith({
      category: null, account: null, amountFilter: null, dateRange: 'all',
    });
  });
});
