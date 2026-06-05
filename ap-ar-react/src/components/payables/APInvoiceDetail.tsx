import {
  Drawer, Box, Typography, Stack, Button, Divider,
  Table, TableHead, TableBody, TableRow, TableCell,
  Stepper, Step, StepLabel, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { APARState, InvoiceStatus } from '../../types/invoice.types';
import { formatCurrency } from '../../utils/invoiceHelpers';
import StatusChip from './StatusChip';

interface Props {
  state: APARState;
  updateState: (partial: Partial<APARState>) => void;
}

const APPROVAL_STEPS = ['Submitted', 'Under Review', 'Approved', 'Scheduled', 'Paid'];

function getActiveStep(status: InvoiceStatus): number {
  const map: Partial<Record<InvoiceStatus, number>> = {
    draft: 0, pending_approval: 1, approved: 2, scheduled: 3, paid: 4,
  };
  return map[status] ?? 0;
}

export default function APInvoiceDetail({ state, updateState }: Props) {
  const invoice = state.apInvoices.find(i => i.id === state.selectedAPInvoiceId);
  const canApprove = state.userRole === 'approver' || state.userRole === 'payer';
  const canPay     = state.userRole === 'payer';

  const close = () => updateState({ apDetailOpen: false, selectedAPInvoiceId: null });

  const handleApprove = () => {
    if (!invoice) return;
    updateState({
      apInvoices: state.apInvoices.map(i => i.id === invoice.id ? { ...i, status: 'approved' } : i),
    });
  };

  const handleSchedule = () => {
    if (!invoice) return;
    updateState({
      apInvoices: state.apInvoices.map(i => i.id === invoice.id ? { ...i, status: 'scheduled' } : i),
    });
  };

  if (!invoice) return null;

  return (
    <Drawer anchor="right" open={state.apDetailOpen} onClose={close}
      PaperProps={{ sx: { width: 560, p: 3 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{invoice.invoiceNumber}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{invoice.vendor.name}</Typography>
        </Box>
        <Stack direction="row" gap={1} alignItems="center">
          <StatusChip status={invoice.status} />
          <Box component="button" onClick={close}
            sx={{ border: 'none', background: 'none', cursor: 'pointer', p: 0.5, color: 'text.secondary', display: 'flex' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </Box>
        </Stack>
      </Stack>

      {/* Approval Stepper */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#F7F7F7', borderRadius: 2 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Approval Workflow
        </Typography>
        <Stepper activeStep={getActiveStep(invoice.status)} alternativeLabel>
          {APPROVAL_STEPS.map(label => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: 11 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Three-Way Match */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Three-Way Match
        </Typography>
        <Stack direction="row" gap={2}>
          {[
            { label: 'PO Matched',      ok: invoice.poMatched },
            { label: 'Receipt Matched', ok: invoice.receiptMatched },
            { label: 'Invoice',         ok: true },
          ].map(({ label, ok }) => (
            <Stack key={label} direction="row" alignItems="center" gap={0.75}
              sx={{ px: 1.5, py: 0.75, borderRadius: 999, bgcolor: ok ? '#DBF6E7' : '#F5F5F5', border: `1px solid ${ok ? '#A5D6A7' : '#E0E0E0'}` }}>
              {ok
                ? <CheckCircleIcon sx={{ fontSize: 16, color: '#2DA38D' }} />
                : <CancelIcon      sx={{ fontSize: 16, color: '#bdbdbd' }} />}
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: ok ? '#2DA38D' : '#9E9E9E' }}>{label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Invoice Details */}
      <Stack direction="row" gap={4} mb={3}>
        <Box>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Issue Date</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{invoice.issueDate}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Due Date</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: invoice.agingDays > 0 ? '#E0284A' : 'inherit' }}>{invoice.dueDate}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Amount</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(invoice.amount)}</Typography>
        </Box>
      </Stack>

      {/* Line Items */}
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
              <TableCell sx={{ fontSize: 13 }}>
                <Box>{li.description}</Box>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{li.category}</Typography>
              </TableCell>
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

      {/* Actions */}
      <Stack direction="row" gap={2} mt="auto">
        {invoice.status === 'pending_approval' && (
          <Tooltip title={!canApprove ? 'Approver role required (SoD)' : ''}>
            <span style={{ flex: 1 }}>
              <Button fullWidth variant="contained" color="success" disabled={!canApprove} onClick={handleApprove}
                sx={{ bgcolor: '#2DA38D', '&:hover': { bgcolor: '#238a76' } }}>
                Approve Invoice
              </Button>
            </span>
          </Tooltip>
        )}
        {invoice.status === 'approved' && (
          <Tooltip title={!canPay ? 'Payer role required (SoD)' : ''}>
            <span style={{ flex: 1 }}>
              <Button fullWidth variant="contained" disabled={!canPay} onClick={handleSchedule}>
                Schedule Payment
              </Button>
            </span>
          </Tooltip>
        )}
        <Button variant="outlined" onClick={close} sx={{ flex: invoice.status === 'paid' ? 1 : undefined }}>
          Close
        </Button>
      </Stack>
    </Drawer>
  );
}
