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
