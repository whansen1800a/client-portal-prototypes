import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import { EmployeeCompensation } from '../../../types/gusto';
import { calcEmployeeGross, calcTotals } from '../../../utils/calc';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  employees: EmployeeCompensation[];
  onChange: (employees: EmployeeCompensation[]) => void;
}

function updateEmployee(employees: EmployeeCompensation[], uuid: string, patch: Partial<EmployeeCompensation>): EmployeeCompensation[] {
  return employees.map(e => e.employee_uuid === uuid ? { ...e, ...patch } : e);
}

export default function Step2Compensation({ employees, onChange }: Props) {
  const { grossTotal } = calcTotals(employees);

  function setHours(uuid: string, field: keyof EmployeeCompensation, val: string) {
    onChange(updateEmployee(employees, uuid, { [field]: parseFloat(val) || 0 } as Partial<EmployeeCompensation>));
  }

  function setFixed(emp: EmployeeCompensation, name: string, val: string) {
    const fcs = emp.fixed_compensations.map(fc => fc.name === name ? { ...fc, amount: parseFloat(val) || 0 } : fc);
    onChange(updateEmployee(employees, emp.employee_uuid, { fixed_compensations: fcs }));
  }

  return (
    <Box sx={{ p: 3, maxWidth: 840 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Update Hours & Compensation</Typography>
      {employees.map(emp => (
        <Paper key={emp.employee_uuid} variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
            <Avatar sx={{ bgcolor: emp.color, width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>{emp.initials}</Avatar>
            <Typography variant="subtitle2" fontWeight={700}>{emp.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              Est. gross: <strong>{formatCurrency(calcEmployeeGross(emp))}</strong>
            </Typography>
          </Box>
          <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {emp.flsa_status === 'nonexempt' ? (
              <>
                <TextField size="small" label="Regular hours" type="number" sx={{ width: 140 }}
                  value={emp.regular_hours ?? ''} onChange={e => setHours(emp.employee_uuid, 'regular_hours', e.target.value)} />
                <TextField size="small" label="OT hours (1.5×)" type="number" sx={{ width: 140 }}
                  value={emp.overtime_hours ?? ''} onChange={e => setHours(emp.employee_uuid, 'overtime_hours', e.target.value)} />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                Salary employee — regular pay is fixed.
              </Typography>
            )}
            {emp.fixed_compensations.map(fc => (
              <TextField key={fc.name} size="small" label={fc.name} type="number" sx={{ width: 140 }}
                value={fc.amount || ''} onChange={e => setFixed(emp, fc.name, e.target.value)}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, fontSize: 14 }}>$</Typography> }} />
            ))}
          </Box>
        </Paper>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Typography variant="body1" fontWeight={700}>
          Total estimated gross: {formatCurrency(grossTotal)}
        </Typography>
      </Box>
    </Box>
  );
}
