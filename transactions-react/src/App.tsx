import React from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography,
  List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, IconButton, InputBase
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { TransactionsPage } from './features/transactions/TransactionsPage';

const SIDEBAR_WIDTH = 248;

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: <DashboardOutlinedIcon /> },
  { label: 'Bookkeeping', icon: <MenuBookOutlinedIcon /> },
  { label: 'Taxes',       icon: <ReceiptOutlinedIcon /> },
  { label: 'Payroll',     icon: <AttachMoneyOutlinedIcon /> },
  { label: 'Advisory',    icon: <PeopleOutlinedIcon /> },
  { label: 'Documents',   icon: <FolderOutlinedIcon /> },
];

export function App() {
  const [activeNav, setActiveNav] = React.useState(1); // Bookkeeping active

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {/* Logo area */}
        <Box sx={{ px: 2, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, #EF8A31, #F5BA27)',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '14px',
              }}
            >
              A
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#3F5261', letterSpacing: '-0.01em' }}>
              1-800Accountant
            </Typography>
          </Box>
        </Box>

        {/* Nav items */}
        <List disablePadding sx={{ pt: 1 }}>
          {NAV_ITEMS.map((item, idx) => (
            <ListItemButton
              key={item.label}
              selected={activeNav === idx}
              onClick={() => setActiveNav(idx)}
              sx={{
                mx: 0, py: '10px', px: 2,
                borderLeft: '3px solid transparent',
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  borderLeftColor: 'secondary.main',
                  pl: '13px',
                },
                '&.Mui-selected .MuiListItemIcon-root': { color: 'secondary.main' },
                '&.Mui-selected .MuiListItemText-primary': { color: 'secondary.main', fontWeight: 500 },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary', '& svg': { fontSize: 20 } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 2, minHeight: '64px !important' }}>
            <Typography variant="h6" sx={{ flexGrow: 0, mr: 2 }}>Transactions</Typography>

            {/* Search */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                bgcolor: 'background.default', border: '1px solid', borderColor: 'divider',
                borderRadius: '4px', px: 1.5, height: 36, width: 220,
                '&:focus-within': { borderColor: 'secondary.main', bgcolor: 'background.paper' },
              }}
            >
              <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <InputBase placeholder="Search transactions" sx={{ fontSize: '0.875rem', flexGrow: 1 }} />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton size="small" sx={{ position: 'relative' }}>
              <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
              <Box
                sx={{
                  position: 'absolute', top: 6, right: 6,
                  width: 8, height: 8, bgcolor: 'primary.main',
                  borderRadius: '50%', border: '1.5px solid white',
                }}
              />
            </IconButton>

            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.dark', fontSize: '0.75rem', fontWeight: 600 }}>
              SC
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TransactionsPage />
        </Box>
      </Box>
    </Box>
  );
}
