import React from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography,
  List, ListItem, ListItemIcon, ListItemText,
  Avatar, IconButton, InputBase, Divider, Collapse,
  Menu, MenuItem,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';

// Portal SVG icons (copied from portal-web-master)
import logoSrc from './assets/icons/Logo.svg';
import purposeIconSrc from './assets/icons/Purpose.svg';
import notificationsIconSrc from './assets/icons/Notifications.svg';
import financialTeamIconSrc from './assets/icons/Financial Team.svg';
import dashboardIconSrc from './assets/icons/Dashboard.svg';
import documentsIconSrc from './assets/icons/Documents.svg';
import messagesIconSrc from './assets/icons/Messages.svg';
import calendarIconSrc from './assets/icons/Calendar.svg';
import bookkeepingIconSrc from './assets/icons/Bookkeeping.svg';
import transactionsIconSrc from './assets/icons/Transactions.svg';
import bankIconSrc from './assets/icons/Bank.svg';
import uploadCloudIconSrc from './assets/icons/Upload-Cloud.svg';
import downloadIconSrc from './assets/icons/Download.svg';
import taxesIconSrc from './assets/icons/Taxes.svg';
import taxPlanIconSrc from './assets/icons/Tax Plan.svg';
import payrollIconSrc from './assets/icons/Payroll.svg';
import companyIconSrc from './assets/icons/Company.svg';
import vehiclesIconSrc from './assets/icons/Vehicles.svg';
import supportIconSrc from './assets/icons/Support.svg';

import { TransactionsPage } from './features/transactions/TransactionsPage';

const SIDEBAR_WIDTH = 240;
const SUPPORT_URL = 'https://support.1800accountant.com/s/';

// ─── Nav data ────────────────────────────────────────────────────────────────

const INFO_SECTIONS = [
  { name: 'notifications', title: 'Notifications', icon: notificationsIconSrc },
  { name: 'team',          title: 'Team',           icon: financialTeamIconSrc },
];

const PORTAL_SECTIONS = [
  { name: 'dashboard',       title: 'Dashboard',       icon: dashboardIconSrc  },
  { name: 'documents',       title: 'Documents',        icon: documentsIconSrc  },
  { name: 'communications',  title: 'Communications',   icon: messagesIconSrc   },
  { name: 'calendar',        title: 'Calendar',         icon: calendarIconSrc   },
];

const EXPANDABLE_SECTIONS = [
  {
    name: 'bookkeeping', title: 'Bookkeeping', icon: bookkeepingIconSrc,
    children: [
      { name: 'transactions',  title: 'Transactions',      icon: transactionsIconSrc },
      { name: 'je',            title: 'Journal Entries',    icon: null },
      { name: 'banking',       title: 'Banking',            icon: bankIconSrc },
      { name: 'coa',           title: 'Chart of Accounts',  icon: null },
      { name: 'reconcile',     title: 'Reconciliations',    icon: null },
      { name: 'reports',       title: 'Reports',            icon: null },
      { name: 'receiptsScan',  title: 'Receipts Scan',      icon: uploadCloudIconSrc },
    ],
  },
  {
    name: 'invoicing', title: 'Invoicing', icon: downloadIconSrc,
    children: [
      { name: 'invoices',    title: 'Invoices',            icon: null },
      { name: 'contacts',    title: 'Contacts',            icon: null },
      { name: 'ps',          title: 'Products / Services', icon: null },
      { name: 'mc',          title: 'Manage Categories',   icon: null },
    ],
  },
  {
    name: 'taxes', title: 'Taxes', icon: taxesIconSrc,
    children: [
      { name: 'bvto', title: 'Business Tax Information', icon: null },
      { name: 'pvto', title: 'Personal Tax Information', icon: null },
      { name: 'et',   title: 'Estimated Taxes',          icon: null },
      { name: 'be',   title: 'Business Extension',       icon: null },
      { name: 'pe',   title: 'Personal Extension',       icon: null },
    ],
  },
  {
    name: 'tax-planner', title: 'Tax Planner', icon: taxPlanIconSrc,
    children: [
      { name: 'tp', title: 'Tax Projections', icon: null },
      { name: 'ts', title: 'Tax Suggestions', icon: null },
      { name: 'dr', title: 'Draft Returns',   icon: null },
    ],
  },
  {
    name: 'payroll', title: 'Payroll', icon: payrollIconSrc,
    children: [
      { name: 'company',   title: 'Company Details', icon: companyIconSrc },
      { name: 'employees', title: 'Employees',        icon: null },
    ],
  },
  {
    name: 'issue1099', title: 'Issue 1099', icon: payrollIconSrc,
    children: [
      { name: 'f1n', title: 'File 1099-NECs',      icon: null },
      { name: 'mc2', title: 'Manage Contractors',  icon: null },
    ],
  },
  {
    name: 'mileage-log', title: 'Mileage Log', icon: vehiclesIconSrc,
    children: [
      { name: 'trips',     title: 'Trips',     icon: null },
      { name: 'vehicles',  title: 'Vehicles',  icon: null },
      { name: 'locations', title: 'Locations', icon: null },
      { name: 'purposes',  title: 'Purposes',  icon: null },
    ],
  },
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const NAV_ICON_SIZE = 20;

function NavIcon({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <Box sx={{ width: NAV_ICON_SIZE, height: NAV_ICON_SIZE }} />;
  return (
    <img
      src={src}
      alt={alt}
      width={NAV_ICON_SIZE}
      height={NAV_ICON_SIZE}
      style={{ display: 'block' }}
    />
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function App() {
  // Bookkeeping expanded by default (index 0), Transactions active
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({ bookkeeping: true });
  const [activeItem, setActiveItem] = React.useState('transactions');
  const [businessMenuAnchor, setBusinessMenuAnchor] = React.useState<null | HTMLElement>(null);

  const toggleSection = (name: string) => {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const selectedBg = '#DBF6E7'; // green500 equivalent — matches portal selected state
  const hoverBg = 'rgba(45,163,141,0.08)';

  const listItemSx = (active: boolean) => ({
    px: 1,
    py: '6px',
    borderRadius: 0,
    bgcolor: active ? selectedBg : 'transparent',
    '&:hover': { bgcolor: active ? selectedBg : hoverBg },
    cursor: 'pointer',
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <img src={logoSrc} alt="1-800Accountant" height={40} />
        </Box>

        {/* Scrollable nav content */}
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', py: 1 }}>
          {/* Business switcher */}
          <ListItem
            dense
            onClick={e => setBusinessMenuAnchor(e.currentTarget)}
            sx={{
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: '4px',
              mx: 1,
              mb: 1,
              px: 1,
              py: '6px',
              cursor: 'pointer',
              width: 'auto',
              '&:hover': { bgcolor: hoverBg },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <img src={purposeIconSrc} alt="Business" width={20} height={20} />
            </ListItemIcon>
            <ListItemText
              primary="Demo Business LLC"
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, noWrap: true }}
            />
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary', ml: 'auto' }} />
          </ListItem>

          <Menu
            anchorEl={businessMenuAnchor}
            open={Boolean(businessMenuAnchor)}
            onClose={() => setBusinessMenuAnchor(null)}
            PaperProps={{ sx: { width: 230, left: '8px !important' } }}
          >
            <MenuItem dense sx={{ px: 3 }}>Details &amp; Settings</MenuItem>
            <MenuItem dense sx={{ px: 3 }}>Manage Users</MenuItem>
            <Divider />
            <MenuItem dense sx={{ px: 3 }}>Add Business</MenuItem>
          </Menu>

          {/* Info sections: Notifications + Team */}
          <List disablePadding>
            {INFO_SECTIONS.map(s => (
              <ListItem
                key={s.name}
                dense
                sx={listItemSx(false)}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <NavIcon src={s.icon} alt={s.title} />
                </ListItemIcon>
                <ListItemText
                  primary={s.title}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          {/* Portal sections: flat links */}
          <List disablePadding>
            {PORTAL_SECTIONS.map(s => (
              <ListItem
                key={s.name}
                dense
                onClick={() => setActiveItem(s.name)}
                sx={listItemSx(activeItem === s.name)}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <NavIcon src={s.icon} alt={s.title} />
                </ListItemIcon>
                <ListItemText
                  primary={s.title}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          {/* Expandable sections */}
          <List disablePadding>
            {EXPANDABLE_SECTIONS.map(section => (
              <React.Fragment key={section.name}>
                {/* Section header (uppercase) */}
                <ListItem
                  dense
                  onClick={() => toggleSection(section.name)}
                  sx={{
                    px: 1,
                    py: '6px',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: hoverBg },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <NavIcon src={section.icon} alt={section.title} />
                  </ListItemIcon>
                  <ListItemText
                    primary={section.title}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      noWrap: true,
                    }}
                  />
                  {openSections[section.name]
                    ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
                </ListItem>

                {/* Child links */}
                <Collapse in={openSections[section.name]} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {section.children.map(child => (
                      <ListItem
                        key={child.name}
                        dense
                        onClick={() => setActiveItem(child.name)}
                        sx={{
                          ...listItemSx(activeItem === child.name),
                          pl: '40px', // indent under parent
                        }}
                      >
                        <ListItemText
                          primary={child.title}
                          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>

          {/* Spacer pushes support to bottom */}
          <Box sx={{ flex: 1 }} />

          <Divider sx={{ my: 1 }} />

          {/* Support Center */}
          <ListItem
            dense
            component="a"
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ px: 1, py: '6px', '&:hover': { bgcolor: hoverBg } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <NavIcon src={supportIconSrc} alt="Support" />
            </ListItemIcon>
            <ListItemText
              primary="Support Center"
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </ListItem>
        </Box>
      </Drawer>

      {/* ── Main area ────────────────────────────────────────────────────── */}
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
