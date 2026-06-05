import React from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, AppBar, Typography, Avatar, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import type { UserRole } from '../../types/invoice.types';
import RoleSwitcher from './RoleSwitcher';

const DRAWER_WIDTH = 240;

export type ActiveView = 'overview' | 'payables' | 'receivables';

interface AppShellProps {
  activeView: ActiveView;
  onViewChange: (v: ActiveView) => void;
  children: React.ReactNode;
  userRole: UserRole;
  onRoleChange: (r: UserRole) => void;
}

const NAV_ITEMS: { label: string; view: ActiveView; icon: React.ReactNode }[] = [
  { label: 'Overview', view: 'overview', icon: <DashboardIcon /> },
  { label: 'Accounts Payable', view: 'payables', icon: <ArrowDownwardIcon /> },
  { label: 'Accounts Receivable', view: 'receivables', icon: <ArrowUpwardIcon /> },
];

export default function AppShell({ activeView, onViewChange, children, userRole, onRoleChange }: AppShellProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: '#fff', boxShadow: '0 1px 0 rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ width: DRAWER_WIDTH - 24, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>1</Typography>
            </Box>
            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: 15 }}>1-800Accountant</Typography>
          </Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, flexGrow: 1 }}>
            AP / AR Management
          </Typography>
          <RoleSwitcher role={userRole} onChange={onRoleChange} />
          <Chip label="Demo Mode" size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 500 }} />
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>SC</Avatar>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid rgba(0,0,0,0.08)' },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 1, pt: 2 }}>
          <List disablePadding>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.view}
                selected={activeView === item.view}
                onClick={() => onViewChange(item.view)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': { bgcolor: '#DBF6E7', color: 'secondary.main', '& .MuiListItemIcon-root': { color: 'secondary.main' } },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: activeView === item.view ? 600 : 400 }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
