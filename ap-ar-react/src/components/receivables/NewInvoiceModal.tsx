import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { APARState, ARInvoice, LineItem } from '../../types/invoice.types';
import { formatCurrency } from '../../utils/invoiceHelpers';

interface Props {
  state: APARState;
  updateState: (partial: Partial<APARState>) => void;
}

function emptyLine(): LineItem {
  return {
    id: `li-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    description: '', quantity: 1, unitPrice: 0, total: 0, category: 'Services',
  };
}

export default function NewInvoiceModal({ state, updateState }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLine()]);

  const close = () => updateState({ arCreateOpen: false });

  const updateLine = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map(li => {
      if (li.id !== id) return li;
      const updated = { ...li, [field]: value };
      updated.total = Number(updated.quantity) * Number(updated.unitPrice);
      return updated;
    }));
  };

  const total = lineItems.reduce((s, li) => s + li.total, 0);

  const handleSave = () => {
    const newInvoice: ARInvoice = {
      id: `ar-${Date.now()}`,
      invoiceNumber: `AR-2024-${1200 + state.arInvoices.length}`,
      customer: { id: `c-new-${Date.now()}`, name: customerName, email: customerEmail },
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      amount: total,
      amountPaid: 0,
      status: 'draft',
      lineItems,
      agingDays: 0,
    };
    updateState({ arInvoices: [...state.arInvoices, newInvoice], arCreateOpen: false });
    setCustomerName('');
    setCustomerEmail('');
    setDueDate('');
    setLineItems([emptyLine()]);
  };

  return (
    <Dialog open={state.arCreateOpen} onClose={close} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>New Invoice</Typography>
          <IconButton size="small" onClick={close}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, mt: 1 }}>
          Customer
        </Typography>
        <Stack direction="row" gap={2} mb={3}>
          <TextField size="small" label="Customer Name" fullWidth value={customerName} onChange={e => setCustomerName(e.target.value)} />
          <TextField size="small" label="Email" fullWidth value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
          <TextField size="small" label="Due Date" type="date" fullWidth value={dueDate} onChange={e => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Line Items
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setLineItems(i => [...i, emptyLine()])}>
            Add Item
          </Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell sx={{ width: 80 }}>Qty</TableCell>
              <TableCell sx={{ width: 120 }}>Unit Price</TableCell>
              <TableCell align="right" sx={{ width: 100 }}>Total</TableCell>
              <TableCell sx={{ width: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.map(li => (
              <TableRow key={li.id}>
                <TableCell>
                  <TextField size="small" variant="standard" fullWidth placeholder="Description"
                    value={li.description} onChange={e => updateLine(li.id, 'description', e.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField size="small" variant="standard" type="number" inputProps={{ min: 1, style: { textAlign: 'right' } }}
                    value={li.quantity} onChange={e => updateLine(li.id, 'quantity', Number(e.target.value))} />
                </TableCell>
                <TableCell>
                  <TextField size="small" variant="standard" type="number" inputProps={{ min: 0, step: '0.01', style: { textAlign: 'right' } }}
                    value={li.unitPrice} onChange={e => updateLine(li.id, 'unitPrice', Number(e.target.value))} />
                </TableCell>
                <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(li.total)}</TableCell>
                <TableCell>
                  {lineItems.length > 1 && (
                    <IconButton size="small" onClick={() => setLineItems(i => i.filter(x => x.id !== li.id))}>
                      <DeleteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, borderBottom: 'none', pt: 2 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 16, borderBottom: 'none', pt: 2 }}>{formatCurrency(total)}</TableCell>
              <TableCell sx={{ borderBottom: 'none' }} />
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outlined" onClick={close}>Cancel</Button>
        <Button variant="outlined" disabled={!customerName || total === 0}>Save Draft</Button>
        <Button variant="contained" disabled={!customerName || !dueDate || total === 0} onClick={handleSave}>
          Save &amp; Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
