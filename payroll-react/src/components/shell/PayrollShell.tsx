import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PayrollSidebar from './PayrollSidebar';

interface Props { children: React.ReactNode; }

export default function PayrollShell({ children }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={0}
        sx={{ borderBottom: '1px solid rgba(0,0,0,.08)', bgcolor: '#fff', zIndex: 10 }}>
        <Toolbar>
          <Typography variant="h6" fontWeight={700} color="primary" fontSize={16}>
            1-800Accountant
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Payroll
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <PayrollSidebar />
        <Box component="main" sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
