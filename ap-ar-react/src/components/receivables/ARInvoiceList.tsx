import React, { useState } from 'react';
import {
  Box, Typography, Card, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Button, Stack, TextField, InputAdornment,
  LinearProgress, Tooltip, IconButton, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import { APARState } from '../../types/invoice.types';
import { formatCurrency } from '../../utils/invoiceHelpers';
import StatusChip from '../payables/StatusChip';
import ARInvoiceDetail from './ARInvoiceDetail';
import NewInvoiceModal from './NewInvoiceModal';

interface Props {
  state: APARState;
  updateState: (partial: Partial<APARState>) => void;
}

export default function ARInvoiceList({ state, updateState }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = state.arInvoices.filter(inv => {
    const matchSearch = inv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
                        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetail = (id: string) => updateState({ selectedARInvoiceId: id, arDetailOpen: true });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Accounts Receivable</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            {filtered.length} invoices · {formatCurrency(filtered.reduce((s, i) => s + i.amount, 0))} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} size="small"
          onClick={() => updateState({ arCreateOpen: true })}>
          New Invoice
        </Button>
      </Stack>

      <Stack direction="row" gap={2} mb={2}>
        <TextField
          size="small"
          placeholder="Search customer or invoice #"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          sx={{ width: 280 }}
        />
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending_approval">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(inv => {
                const paidPct = (inv.amountPaid / inv.amount) * 100;
                return (
                  <TableRow key={inv.id} hover>
                    <TableCell sx={{ fontSize: 13 }}>{inv.invoiceNumber}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{inv.customer.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{inv.customer.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{inv.issueDate}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: inv.agingDays > 0 ? '#E0284A' : 'inherit', fontWeight: inv.agingDays > 0 ? 600 : 400 }}>
                      {inv.dueDate}
                      {inv.agingDays > 0 && <Typography component="span" sx={{ fontSize: 11, ml: 0.5 }}>({inv.agingDays}d)</Typography>}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(inv.amount)}</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <Typography sx={{ fontSize: 12, mb: 0.5 }}>
                        {formatCurrency(inv.amountPaid)}{' '}
                        <Typography component="span" sx={{ color: 'text.secondary', fontSize: 11 }}>/ {formatCurrency(inv.amount)}</Typography>
                      </Typography>
                      <LinearProgress variant="determinate" value={paidPct}
                        sx={{ height: 4, borderRadius: 999, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: paidPct === 100 ? '#2DA38D' : '#1776B6' } }} />
                    </TableCell>
                    <TableCell><StatusChip status={inv.status} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                        {inv.status !== 'paid' && (
                          <Tooltip title="Send Reminder">
                            <IconButton size="small"><SendIcon sx={{ fontSize: 16 }} /></IconButton>
                          </Tooltip>
                        )}
                        <IconButton size="small" onClick={() => openDetail(inv.id)}>
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ARInvoiceDetail state={state} updateState={updateState} />
      <NewInvoiceModal state={state} updateState={updateState} />
    </Box>
  );
}
