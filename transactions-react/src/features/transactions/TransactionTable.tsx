import React, { useMemo } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow,
  TableCell, Checkbox, Box, Typography, TablePagination
} from '@mui/material';
import { ITransaction } from './transactions.types';
import { TransactionRow } from './TransactionRow';
import { BulkActionBar } from './BulkActionBar';

interface TransactionTableProps {
  transactions: ITransaction[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onClearSelection: () => void;
}

function groupByMonth(transactions: ITransaction[]): Map<string, ITransaction[]> {
  const groups = new Map<string, ITransaction[]>();
  transactions.forEach(tx => {
    const d = new Date(tx.date + 'T00:00:00');
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(tx);
  });
  return groups;
}

function getTotals(transactions: ITransaction[]) {
  const expenses = transactions.filter(t => !t.isIncome).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const income   = transactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  return { expenses, income };
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TransactionTable({
  transactions, selectedIds, onToggle, onToggleAll, onClearSelection
}: TransactionTableProps) {
  const groups = useMemo(() => groupByMonth(transactions), [transactions]);
  const { expenses, income } = useMemo(() => getTotals(transactions), [transactions]);
  const allSelected = transactions.length > 0 && selectedIds.size === transactions.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const [page, setPage] = React.useState(0);
  const rowsPerPage = 15;

  return (
    <Box>
      <Paper>
        {/* Bulk action bar */}
        <BulkActionBar
          selectedCount={selectedIds.size}
          onCategorize={() => {}}
          onExclude={() => {}}
          onClear={onClearSelection}
        />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ pl: 2 }}>
                <Checkbox
                  color="secondary"
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={e => onToggleAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ width: 60 }}>Date</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell sx={{ width: 220 }}>Category</TableCell>
              <TableCell sx={{ width: 100 }}>Status</TableCell>
              <TableCell align="right" sx={{ width: 120 }}>Amount</TableCell>
              <TableCell sx={{ width: 36 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.from(groups.entries()).map(([month, txs]) => (
              <React.Fragment key={month}>
                {/* Month divider row */}
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell
                    colSpan={7}
                    sx={{
                      py: '6px',
                      typography: 'overline',
                      color: 'text.secondary',
                      letterSpacing: '0.08em',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {month}
                  </TableCell>
                </TableRow>

                {txs.map(tx => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    selected={selectedIds.has(tx.id)}
                    onToggle={onToggle}
                  />
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        {/* Footer summary */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2, py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Showing {transactions.length} transactions
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">Total expenses</Typography>
            <Typography
              variant="body2" fontWeight={600}
              fontFamily="Menlo, 'source-code-pro', monospace"
            >
              ${formatCurrency(expenses)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>·</Typography>
            <Typography variant="caption" color="text.secondary">Total income</Typography>
            <Typography
              variant="body2" fontWeight={600} color="success.main"
              fontFamily="Menlo, 'source-code-pro', monospace"
            >
              +${formatCurrency(income)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <TablePagination
          component="div"
          count={transactions.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[15, 25, 50]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={() => {}}
          sx={{ '& .MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Box>
    </Box>
  );
}
