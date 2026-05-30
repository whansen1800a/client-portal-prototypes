import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GustoPayroll, EmployeeCompensation } from '../../../types/gusto';
import { calcTotals } from '../../../utils/calc';
import { formatCurrency, formatDate, formatDateRange } from '../../../utils/formatters';

interface Props {
  payroll: GustoPayroll;
  employees: EmployeeCompensation[];
  onSubmit: () => void;
  submitted: boolean;
}

export default function Step4Submit({ payroll, employees, onSubmit, submitted }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { grossTotal, taxes, net } = calcTotals(employees);
  const employerTaxes = grossTotal * 0.0765;
  const totalDebit = net + employerTaxes;

  if (submitted) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', maxWidth: 540, mx: 'auto' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#2DA38D', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Payroll submitted!</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Funds will be debited on {formatDate(payroll.check_date)}. Total: {formatCurrency(totalDebit)}.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 640 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Review & Submit</Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#EBF3FF', border: '1px solid #93C5FD' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Bank debit</Typography>
        <Typography variant="h5" fontWeight={700} color="primary">{formatCurrency(totalDebit)}</Typography>
        <Typography variant="caption" color="text.secondary">Checking ···· 4821 · Debit date: {formatDate(payroll.check_date)}</Typography>
      </Paper>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Payroll cannot be canceled or reversed after the submission deadline.
      </Alert>
      <Paper variant="outlined" sx={{ mb: 3 }}>
        {([
          ['Pay period', formatDateRange(payroll.pay_period.start_date, payroll.pay_period.end_date)],
          ['Check date', formatDate(payroll.check_date)],
          ['Total gross', formatCurrency(grossTotal)],
          ['Employee taxes withheld', formatCurrency(taxes)],
          ['Net pay to employees', formatCurrency(net)],
          ['Employer taxes', formatCurrency(employerTaxes)],
          ['Total bank debit', formatCurrency(totalDebit)],
        ] as [string, string][]).map(([label, value]) => (
          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value}</Typography>
          </Box>
        ))}
      </Paper>
      <Button variant="contained" color="secondary" size="large" fullWidth onClick={() => setConfirmOpen(true)}>
        Submit Payroll
      </Button>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm payroll submission</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Once submitted, this payroll will be processed and {formatCurrency(totalDebit)} will be debited. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={() => { setConfirmOpen(false); onSubmit(); }}>
            Confirm & submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
