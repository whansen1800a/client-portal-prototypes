import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import { EmployeeCompensation } from '../../../types/gusto';
import { calcEmployeeGross, calcTotals } from '../../../utils/calc';
import { formatCurrency } from '../../../utils/formatters';

interface Props { employees: EmployeeCompensation[]; calculated: boolean; }

export default function Step3Calculate({ employees, calculated }: Props) {
  const { grossTotal, taxes, net } = calcTotals(employees);
  const employerTaxes = grossTotal * 0.0765;

  if (!calculated) {
    return (
      <Box sx={{ p: 3, maxWidth: 500, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Click "Calculate" to trigger Gusto's tax engine.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 840 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Calculation Results</Typography>
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)', display: 'flex' }}>
          <Typography variant="subtitle2" sx={{ flex: 1 }}>Employee</Typography>
          <Typography variant="subtitle2" sx={{ width: 120, textAlign: 'right' }}>Gross</Typography>
          <Typography variant="subtitle2" sx={{ width: 120, textAlign: 'right' }}>Net pay</Typography>
        </Box>
        {employees.map(emp => {
          const gross = calcEmployeeGross(emp);
          const empNet = gross * (1 - 0.2743);
          return (
            <Box key={emp.employee_uuid} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)', '&:last-child': { borderBottom: 0 } }}>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: emp.color, width: 32, height: 32, fontSize: 12, fontWeight: 700 }}>{emp.initials}</Avatar>
                <Typography variant="body2">{emp.name}</Typography>
              </Box>
              <Typography variant="body2" sx={{ width: 120, textAlign: 'right' }}>{formatCurrency(gross)}</Typography>
              <Typography variant="body2" fontWeight={600} color="primary" sx={{ width: 120, textAlign: 'right' }}>{formatCurrency(empNet)}</Typography>
            </Box>
          );
        })}
      </Paper>
      <Grid container spacing={2}>
        {[
          { title: 'Compensation Breakdown', rows: [['Regular wages', formatCurrency(grossTotal * 0.85)], ['Overtime', formatCurrency(grossTotal * 0.10)], ['Bonuses', formatCurrency(grossTotal * 0.05)]], total: grossTotal },
          { title: 'Employee Tax Withholding', rows: [['Federal income tax', formatCurrency(grossTotal * 0.15)], ['Social Security (6.2%)', formatCurrency(grossTotal * 0.062)], ['Medicare (1.45%)', formatCurrency(grossTotal * 0.0145)]], total: taxes },
          { title: 'Net Pay to Employees', rows: employees.map(e => [e.name, formatCurrency(calcEmployeeGross(e) * 0.7257)]), total: net },
          { title: 'Employer Payroll Taxes', rows: [['Employer SS', formatCurrency(grossTotal * 0.062)], ['Employer Medicare', formatCurrency(grossTotal * 0.0145)], ['FUTA', formatCurrency(grossTotal * 0.006)]], total: employerTaxes },
        ].map(panel => (
          <Grid item xs={12} sm={6} key={panel.title}>
            <Paper variant="outlined" sx={{ height: '100%' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                <Typography variant="subtitle2" fontWeight={700}>{panel.title}</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {panel.rows.map(([label, val]) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2">{val}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, mt: 1, borderTop: '1px solid rgba(0,0,0,.08)' }}>
                  <Typography variant="body2" fontWeight={700}>Total</Typography>
                  <Typography variant="body2" fontWeight={700}>{formatCurrency(panel.total)}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
