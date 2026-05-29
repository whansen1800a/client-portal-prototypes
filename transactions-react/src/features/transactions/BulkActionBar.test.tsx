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

  it('does not show content when selectedCount is 0', () => {
    const { container } = render(
      <BulkActionBar selectedCount={0} onCategorize={noop} onExclude={noop} onClear={noop} />,
      { wrapper }
    );
    // MUI Collapse hides via height:0, content may still be in DOM
    const text = screen.queryByText(/selected/);
    if (text) {
      expect(text).not.toBeVisible();
    } else {
      expect(text).toBeNull();
    }
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

  it('calls onExclude when Exclude button clicked', () => {
    const onExclude = vi.fn();
    render(
      <BulkActionBar selectedCount={2} onCategorize={noop} onExclude={onExclude} onClear={noop} />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('Exclude'));
    expect(onExclude).toHaveBeenCalledTimes(1);
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
