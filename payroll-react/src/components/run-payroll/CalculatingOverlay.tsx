import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function CalculatingOverlay() {
  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(255,255,255,.85)', zIndex: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <CircularProgress color="primary" size={52} />
      <Typography variant="h6" fontWeight={600}>Calculating payroll</Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={320}>
        Gusto is applying taxes, benefits, and deductions. Please don't navigate away.
      </Typography>
    </Box>
  );
}
