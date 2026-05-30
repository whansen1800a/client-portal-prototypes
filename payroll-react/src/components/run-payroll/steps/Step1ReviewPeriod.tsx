import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import { GustoPayroll } from '../../../types/gusto';
import { formatDateRange, formatDate, formatCurrency } from '../../../utils/formatters';
import { calcEmployeeGross } from '../../../utils/calc';

interface Props { payroll: GustoPayroll; }

export default function Step1ReviewPeriod({ payroll }: Props) {
  const INFO = [
    ['Pay period', formatDateRange(payroll.pay_period.start_date, payroll.pay_period.end_date)],
    ['Check date', formatDate(payroll.check_date)],
    ['Submission deadline', formatDate(payroll.payroll_deadline.split('T')[0]) + ' · 3:30 pm PST'],
    ['Payroll type', payroll.payroll_type],
    ['Employees', String(payroll.employee_compensations.length)],
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 720 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Review Pay Period</Typography>
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Grid container>
          {INFO.map(([label, value]) => (
            <Grid item xs={12} sm={6} key={label} sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body2" fontWeight={500}>{value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Employees</Typography>
      <Paper variant="outlined">
        {payroll.employee_compensations.map(emp => (
          <Box key={emp.employee_uuid} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)', '&:last-child': { borderBottom: 0 } }}>
            <Avatar sx={{ bgcolor: emp.color, width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>{emp.initials}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={500}>{emp.name}</Typography>
              <Typography variant="caption" color="text.secondary">{emp.flsa_status === 'exempt' ? 'Salary' : 'Hourly'}</Typography>
            </Box>
            <Typography variant="body2" fontWeight={500}>{formatCurrency(calcEmployeeGross(emp))}</Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
