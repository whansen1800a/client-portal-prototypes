import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

interface Props {
  companyName: string;
  ein: string;
  employeeCount: number;
  contractorCount: number;
}

export default function CompanyHeader({ companyName, ein, employeeCount, contractorCount }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
      <Avatar sx={{ bgcolor: '#2DA38D', width: 56, height: 56, fontSize: 22, fontWeight: 700 }}>
        {companyName[0]}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight={700}>{companyName}</Typography>
        <Typography variant="body2" color="text.secondary">EIN: {ein}</Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} color="primary">{employeeCount}</Typography>
          <Typography variant="caption" color="text.secondary">Employees</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} color="primary">{contractorCount}</Typography>
          <Typography variant="caption" color="text.secondary">Contractors</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
