import React from 'react';
import {
  Box, Paper, Button, Chip, Badge
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

  const chips: { label: string; key: keyof IFilterState }[] = [];
  if (filters.category) chips.push({ label: `Category: ${filters.category}`, key: 'category' });
  if (filters.account)  chips.push({ label: `Account: ${filters.account}`,  key: 'account' });

  const filterBtnSx = (active: boolean) => ({
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
        <Button endIcon={<KeyboardArrowDownIcon />} sx={filterBtnSx(filters.dateRange !== 'all')}>
          {DATE_LABELS[filters.dateRange]}
        </Button>

        <Button endIcon={<KeyboardArrowDownIcon />} sx={filterBtnSx(!!filters.category)}>
          {filters.category ?? 'All categories'}
        </Button>

        <Button endIcon={<KeyboardArrowDownIcon />} sx={filterBtnSx(!!filters.account)}>
          {filters.account ?? 'All accounts'}
        </Button>

        <Button endIcon={<KeyboardArrowDownIcon />} sx={filterBtnSx(!!filters.amountFilter)}>
          {filters.amountFilter ? 'Amount filter' : 'All amounts'}
        </Button>

        <Box sx={{ flexGrow: 1 }} />

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
