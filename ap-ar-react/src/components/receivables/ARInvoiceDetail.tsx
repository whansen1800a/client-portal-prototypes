import {
  Drawer, Box, Typography, Stack, Button, Divider,
  Table, TableHead, TableBody, TableRow, TableCell, LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { APARState } from '../../types/invoice.types';
import { formatCurrency } from '../../utils/invoiceHelpers';
import StatusChip from '../payables/StatusChip';

interface Props {
  state: APARState;
  updateState: (partial: Partial<APARState> | ((s: APARState) => Partial<APARState>)) => void;
}

export default function ARInvoiceDetail({ state, updateState }: Props) {
  const invoice = state.arInvoices.find(i => i.id === state.selectedARInvoiceId);
  const close = () => updateState({ arDetailOpen: false, selectedARInvoiceId: null });

  const handleMarkPaid = () => {
    if (!invoice) return;
    updateState(s => ({
      arInvoices: s.arInvoices.map(i =>
        i.id === invoice.id ? { ...i, status: 'paid' as const, amountPaid: i.amount } : i
      ),
    }));
  };

  if (!invoice) return null;

  const paidPct = Math.min(100, (invoice.amountPaid / invoice.amount) * 100);

  return (
    <Drawer anchor="right" open={state.arDetailOpen} onClose={close}
      PaperProps={{ sx: { width: 520, p: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{invoice.invoiceNumber}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{invoice.customer.name}</Typography>
        </Box>
        <Stack direction="row" gap={1} alignItems="center">
          <StatusChip status={invoice.status} />
          <Box component="button" onClick={close}
            sx={{ border: 'none', background: 'none', cursor: 'pointer', p: 0.5, color: 'text.secondary', display: 'flex' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </Box>
        </Stack>
      </Stack>

      {/* Payment Progress */}
      <Box sx={{ p: 2, bgcolor: '#F7F7F7', borderRadius: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Payment Progress</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{Math.round(paidPct)}%</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={paidPct}
          sx={{ height: 8, borderRadius: 999, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: paidPct === 100 ? '#2DA38D' : '#1776B6' } }} />
        <Stack direction="row" justifyContent="space-between" mt={1}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Paid: {formatCurrency(invoice.amountPaid)}</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Total: {formatCurrency(invoice.amount)}</Typography>
        </Stack>
      </Box>

      <Stack direction="row" gap={4} mb={3}>
        <Box>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Issue Date</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{invoice.issueDate}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Due Date</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: invoice.agingDays > 0 ? '#E0284A' : 'inherit' }}>{invoice.dueDate}</Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Line Items
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Unit Price</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoice.lineItems.map(li => (
            <TableRow key={li.id}>
              <TableCell sx={{ fontSize: 13 }}>{li.description}</TableCell>
              <TableCell align="right" sx={{ fontSize: 13 }}>{li.quantity}</TableCell>
              <TableCell align="right" sx={{ fontSize: 13 }}>{formatCurrency(li.unitPrice)}</TableCell>
              <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(li.total)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, borderBottom: 'none' }}>Total</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: 15, borderBottom: 'none' }}>{formatCurrency(invoice.amount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Stack direction="row" gap={2}>
        {invoice.status !== 'paid' && (
          <Button fullWidth variant="contained" onClick={handleMarkPaid}
            sx={{ bgcolor: '#2DA38D', '&:hover': { bgcolor: '#238a76' } }}>
            Mark as Paid
          </Button>
        )}
        <Button variant="outlined" onClick={close} fullWidth={invoice.status === 'paid'}>Close</Button>
      </Stack>
    </Drawer>
  );
}
