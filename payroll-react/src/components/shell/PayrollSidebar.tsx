import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const NAV_ITEMS = [
  { label: 'Company Details', path: '/company' },
  { label: 'Contractors', path: '/contractors' },
  { label: 'Run Payroll', path: '/run-payroll' },
];

export default function PayrollSidebar() {
  const location = useLocation();
  const history = useHistory();

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid rgba(0,0,0,.08)',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
      }}
    >
      <Box sx={{ px: 3, pb: 2 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={600} fontSize={11}>
          Payroll
        </Typography>
      </Box>
      <Divider />
      <List disablePadding>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => history.push(item.path)}
                sx={{
                  pl: 3,
                  borderLeft: active ? '3px solid #2DA38D' : '3px solid transparent',
                  '&.Mui-selected': { bgcolor: 'rgba(45,163,141,.08)', color: '#2DA38D' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(45,163,141,.12)' },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
