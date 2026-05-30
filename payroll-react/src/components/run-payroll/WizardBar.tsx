import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';

const STEPS = ['Review Period', 'Update Hours', 'Calculate', 'Review & Submit'];

interface Props { currentStep: number; }

export default function WizardBar({ currentStep }: Props) {
  return (
    <Box role="navigation" aria-label="Payroll steps"
      sx={{ display: 'flex', alignItems: 'center', gap: 0, py: 2, px: 3, bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,.08)' }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done   = n < currentStep;
        const active = n === currentStep;
        return (
          <React.Fragment key={n}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                bgcolor: done ? '#2DA38D' : active ? '#2DA38D' : '#F3F4F6',
                color:   done ? '#fff'    : active ? '#fff'    : '#9CA3AF' }}>
                {done ? <CheckIcon sx={{ fontSize: 16 }} /> : n}
              </Box>
              <Typography variant="body2" fontWeight={active ? 700 : 400}
                color={active ? 'primary' : done ? 'text.secondary' : 'text.disabled'} sx={{ whiteSpace: 'nowrap' }}>
                {label}
              </Typography>
            </Box>
            {i < STEPS.length - 1 && (
              <Box sx={{ flex: 1, height: 2, mx: 1, bgcolor: done ? '#2DA38D' : 'rgba(0,0,0,.1)' }} />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}
