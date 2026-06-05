import React, { useState } from 'react';
import {
  Box, Typography, Card, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Button, Stack, TextField, InputAdornment, Tooltip,
  Checkbox, IconButton, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { APARState } from '../../types/invoice.types';
import { formatCurrency } from '../../utils/invoiceHelpers';
import StatusChip from './StatusChip';
import APInvoiceDetail from './APInvoiceDetail';

interface Props {
  state: APARState;
  updateState: (partial: Partial<APARState>) => void;
}

export default function APInvoiceList({ state, updateState }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = state.apInvoices.filter(inv => {
    const matchSearch = inv.vendor.name.toLowerCase().includes(search.toLowerCase()) ||
                        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const canApprove = state.userRole === 'approver' || state.userRole === 'payer';
  const canPay     = state.userRole === 'payer';

  const openDetail = (id: string) => {
    updateState({ selectedAPInvoiceId: id, apDetailOpen: true });
  };

  const toggleSelect = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Accounts Payable</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            {filtered.length} invoices · {formatCurrency(filtered.reduce((s, i) => s + i.amount, 0))} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} size="small">New Invoice</Button>
      </Stack>

      {/* Filters */}
      <Stack direction="row" gap={2} mb={2}>
        <TextField
          size="small"
          placeholder="Search vendor or invoice #"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          sx={{ width: 280 }}
        />
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending_approval">Pending Approval</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
          </Select>
        </FormControl>
        {selected.length > 0 && (
          <Stack direction="row" gap={1} ml="auto" alignItems="center">
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{selected.length} selected</Typography>
            {canApprove && <Button size="small" variant="outlined" color="success">Approve Selected</Button>}
            {canPay     && <Button size="small" variant="outlined" color="primary">Schedule Payment</Button>}
          </Stack>
        )}
      </Stack>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map(i => i.id))}
                  />
                </TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>3-Way Match</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(inv => (
                <TableRow key={inv.id} hover selected={selected.includes(inv.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.includes(inv.id)} onChange={() => toggleSelect(inv.id)} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{inv.invoiceNumber}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{inv.vendor.name}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{inv.vendor.email}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{inv.issueDate}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: inv.agingDays > 0 ? '#E0284A' : 'inherit', fontWeight: inv.agingDays > 0 ? 600 : 400 }}>
                    {inv.dueDate}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(inv.amount)}</TableCell>
                  <TableCell>
                    <Stack direction="row" gap={0.5}>
                      <Tooltip title="PO Match">
                        {inv.poMatched
                          ? <CheckCircleIcon sx={{ fontSize: 16, color: '#2DA38D' }} />
                          : <CancelIcon      sx={{ fontSize: 16, color: '#bdbdbd' }} />}
                      </Tooltip>
                      <Tooltip title="Receipt Match">
                        {inv.receiptMatched
                          ? <CheckCircleIcon sx={{ fontSize: 16, color: '#2DA38D' }} />
                          : <CancelIcon      sx={{ fontSize: 16, color: '#bdbdbd' }} />}
                      </Tooltip>
                      <Tooltip title="Invoice">
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#2DA38D' }} />
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell><StatusChip status={inv.status} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openDetail(inv.id)}>
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Detail Drawer */}
      <APInvoiceDetail state={state} updateState={updateState} />
    </Box>
  );
}
