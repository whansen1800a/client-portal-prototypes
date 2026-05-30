# Gusto Payroll React Conversion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the three Gusto payroll HTML demos (Company Details, Contractors, Run Payroll) into React components — first as a standalone Vite demo app, then as typed drop-in components for portal-web-master.

**Architecture:** Standalone Vite + React 17 app in `1800-todos/payroll-react/` (useState, no Redux). Portal drop-ins in `portal-web-master/portal-web-master/src/components/gusto-payroll/` using the exact `makeStyles<Theme, ThemeColors>` pattern, wired to old-style Redux.

**Tech Stack:** React 17, TypeScript, MUI v5, `@mui/styles` (makeStyles), Redux 4 + redux-thunk, react-router-dom v5, Vite 4

---

## Phase 1 — Scaffold standalone Vite app

### Task 1: Create package.json

**Files:**
- Create: `payroll-react/package.json`

**Step 1: Write the file**

```json
{
  "name": "payroll-react",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.17.1",
    "@mui/material": "^5.17.1",
    "@mui/styles": "^5.3.0",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-router-dom": "^5.3.4"
  },
  "devDependencies": {
    "@types/react": "^17.0.80",
    "@types/react-dom": "^17.0.25",
    "@types/react-router-dom": "^5.3.3",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^4.9.5",
    "vite": "^4.5.5"
  }
}
```

**Step 2: Install**

```bash
cd payroll-react && npm install
```

Expected: `node_modules/` created, no errors.

**Step 3: Commit**

```bash
git add payroll-react/package.json payroll-react/package-lock.json
git commit -m "feat: scaffold payroll-react Vite app"
```

---

### Task 2: Vite config + tsconfig + index.html

**Files:**
- Create: `payroll-react/vite.config.ts`
- Create: `payroll-react/tsconfig.json`
- Create: `payroll-react/index.html`

**Step 1: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

**Step 2: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**Step 3: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>1-800A Payroll Demo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: `http://localhost:5173` — blank page (no src yet), no compile errors.

**Step 5: Commit**

```bash
git add payroll-react/vite.config.ts payroll-react/tsconfig.json payroll-react/index.html
git commit -m "feat: add vite config and tsconfig"
```

---

## Phase 2 — Shared types + mock data

### Task 3: TypeScript interfaces

**Files:**
- Create: `payroll-react/src/types/gusto.ts`

**Step 1: Write the file**

```typescript
export type OnboardingStatus =
  | 'onboarding_completed'
  | 'self_onboarding_started'
  | 'onboarding_pending';

export type StepStatus = 'completed' | 'ready' | 'awaiting' | 'blocked';

export interface OnboardingStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  status: StepStatus;
  optional?: boolean;
}

export interface GustoContractor {
  uuid: string;
  type: 'Individual' | 'Business';
  onboarding_status: OnboardingStatus;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  email: string;
  start_date: string;
  work_state: string;
  wage_type: 'Fixed' | 'Hourly';
  rate: number;
  steps: OnboardingStep[];
}

export type FlsaStatus = 'exempt' | 'nonexempt';

export interface FixedCompensation {
  name: 'Bonus' | 'Commission' | 'Reimbursement';
  amount: number;
}

export interface EmployeeCompensation {
  employee_uuid: string;
  name: string;
  initials: string;
  color: string;
  flsa_status: FlsaStatus;
  hourly_rate?: number;
  regular_hours?: number;
  overtime_hours?: number;
  double_overtime_hours?: number;
  fixed_compensations: FixedCompensation[];
}

export interface GustoPayroll {
  uuid: string;
  pay_period: { start_date: string; end_date: string };
  check_date: string;
  payroll_deadline: string;
  payroll_type: 'Regular';
  processing_status: 'unprocessed' | 'processed';
  calculated_at: string | null;
  submission_blockers: string[];
  employee_compensations: EmployeeCompensation[];
}

export interface CompanyOnboardingStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  status: StepStatus;
  action?: string;
}
```

**Step 2: Commit**

```bash
git add payroll-react/src/types/gusto.ts
git commit -m "feat: add gusto TypeScript interfaces"
```

---

### Task 4: Mock data

**Files:**
- Create: `payroll-react/src/mock/company.ts`
- Create: `payroll-react/src/mock/contractors.ts`
- Create: `payroll-react/src/mock/payroll.ts`

**Step 1: Write company.ts**

```typescript
import { CompanyOnboardingStep } from '../types/gusto';

export const mockCompanySteps: CompanyOnboardingStep[] = [
  { id: 'addresses', phase: 'Business Setup', title: 'Add your business addresses', description: 'Enter your business and mailing addresses.', status: 'completed', action: 'Edit' },
  { id: 'federal_tax', phase: 'Business Setup', title: 'Federal tax setup', description: 'Provide your EIN and federal tax details.', status: 'completed', action: 'Edit' },
  { id: 'state_tax', phase: 'Business Setup', title: 'State tax setup', description: 'Register for OR and TX payroll taxes.', status: 'ready', action: 'Start' },
  { id: 'industry', phase: 'Business Setup', title: 'Select your industry', description: 'Choose your NAICS industry code.', status: 'awaiting', action: 'Start' },
  { id: 'pay_schedule', phase: 'Payroll Setup', title: 'Set your pay schedule', description: 'Choose pay frequency and first check date.', status: 'awaiting' },
  { id: 'bank', phase: 'Payroll Setup', title: 'Connect your bank account', description: 'Link the account used for payroll funding.', status: 'awaiting', action: 'Connect' },
  { id: 'bank_verify', phase: 'Payroll Setup', title: 'Verify bank account', description: 'Confirm two micro-deposits.', status: 'blocked' },
  { id: 'state_reg', phase: 'Compliance', title: 'State registration', description: 'Register for applicable state taxes.', status: 'awaiting' },
  { id: 'sign_forms', phase: 'Compliance', title: 'Sign required forms', description: 'Authorize Gusto for tax filing.', status: 'awaiting', action: 'Sign' },
];
```

**Step 2: Write contractors.ts**

```typescript
import { GustoContractor } from '../types/gusto';

export const mockContractors: GustoContractor[] = [
  {
    uuid: 'c-001',
    type: 'Individual',
    onboarding_status: 'onboarding_completed',
    first_name: 'Jenna',
    last_name: 'Hunterson',
    email: 'jenna@example.com',
    start_date: '2024-09-01',
    work_state: 'CA',
    wage_type: 'Hourly',
    rate: 95,
    steps: [
      { id: 's1', phase: 'Setup', title: 'Basic details', description: '', status: 'completed' },
      { id: 's2', phase: 'Setup', title: 'Compensation details', description: '', status: 'completed' },
      { id: 's3', phase: 'Setup', title: 'Add an address', description: '', status: 'completed' },
      { id: 's4', phase: 'Setup', title: 'Payment details', description: '', status: 'completed' },
      { id: 's5', phase: 'Compliance', title: 'Sign documents', description: '', status: 'completed', optional: true },
      { id: 's6', phase: 'Compliance', title: 'File new hire report', description: '', status: 'completed', optional: true },
    ],
  },
  {
    uuid: 'c-002',
    type: 'Business',
    onboarding_status: 'self_onboarding_started',
    business_name: 'TechCorp LLC',
    email: 'billing@techcorp.io',
    start_date: '2025-01-15',
    work_state: 'TX',
    wage_type: 'Fixed',
    rate: 5000,
    steps: [
      { id: 's1', phase: 'Setup', title: 'Basic details', description: '', status: 'completed' },
      { id: 's2', phase: 'Setup', title: 'Compensation details', description: '', status: 'completed' },
      { id: 's3', phase: 'Setup', title: 'Add an address', description: '', status: 'completed' },
      { id: 's4', phase: 'Setup', title: 'Payment details', description: '', status: 'awaiting' },
      { id: 's5', phase: 'Compliance', title: 'Sign documents', description: '', status: 'awaiting', optional: true },
      { id: 's6', phase: 'Compliance', title: 'File new hire report', description: '', status: 'awaiting', optional: true },
    ],
  },
  {
    uuid: 'c-003',
    type: 'Individual',
    onboarding_status: 'onboarding_pending',
    first_name: 'Mike',
    last_name: 'Torres',
    email: 'mike.torres@example.com',
    start_date: '2025-03-10',
    work_state: 'OR',
    wage_type: 'Hourly',
    rate: 75,
    steps: [
      { id: 's1', phase: 'Setup', title: 'Basic details', description: '', status: 'completed' },
      { id: 's2', phase: 'Setup', title: 'Compensation details', description: '', status: 'ready' },
      { id: 's3', phase: 'Setup', title: 'Add an address', description: '', status: 'awaiting' },
      { id: 's4', phase: 'Setup', title: 'Payment details', description: '', status: 'awaiting' },
      { id: 's5', phase: 'Compliance', title: 'Sign documents', description: '', status: 'awaiting', optional: true },
      { id: 's6', phase: 'Compliance', title: 'File new hire report', description: '', status: 'awaiting', optional: true },
    ],
  },
];
```

**Step 3: Write payroll.ts**

```typescript
import { GustoPayroll } from '../types/gusto';

export const mockPayroll: GustoPayroll = {
  uuid: 'p-001',
  pay_period: { start_date: '2025-05-12', end_date: '2025-05-25' },
  check_date: '2025-05-30',
  payroll_deadline: '2025-05-28T23:30:00Z',
  payroll_type: 'Regular',
  processing_status: 'unprocessed',
  calculated_at: null,
  submission_blockers: [],
  employee_compensations: [
    {
      employee_uuid: 'e-001',
      name: 'Sarah Chen',
      initials: 'SC',
      color: '#4F46E5',
      flsa_status: 'exempt',
      fixed_compensations: [{ name: 'Bonus', amount: 0 }, { name: 'Reimbursement', amount: 0 }],
    },
    {
      employee_uuid: 'e-002',
      name: 'Marcus Webb',
      initials: 'MW',
      color: '#059669',
      flsa_status: 'nonexempt',
      hourly_rate: 45,
      regular_hours: 80,
      overtime_hours: 0,
      double_overtime_hours: 0,
      fixed_compensations: [{ name: 'Bonus', amount: 0 }, { name: 'Reimbursement', amount: 0 }],
    },
    {
      employee_uuid: 'e-003',
      name: 'Priya Sharma',
      initials: 'PS',
      color: '#DC2626',
      flsa_status: 'nonexempt',
      hourly_rate: 52,
      regular_hours: 80,
      overtime_hours: 4,
      double_overtime_hours: 0,
      fixed_compensations: [{ name: 'Bonus', amount: 0 }, { name: 'Reimbursement', amount: 0 }],
    },
  ],
};
```

**Step 4: Commit**

```bash
git add payroll-react/src/
git commit -m "feat: add mock data for company, contractors, payroll"
```

---

## Phase 3 — Utilities

### Task 5: Formatters + calc (with tests)

**Files:**
- Create: `payroll-react/src/utils/formatters.ts`
- Create: `payroll-react/src/utils/calc.ts`

> Note: Add Vitest if you want to test utilities — `npm i -D vitest`. For the demo, visual verification is sufficient. Skip tests here and move on.

**Step 1: Write formatters.ts**

```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
```

**Step 2: Write calc.ts**

```typescript
import { EmployeeCompensation } from '../types/gusto';

const SALARY_ANNUAL = 95000; // Sarah Chen stand-in; exempt employees use this
const PAY_PERIODS = 26;      // bi-weekly

export function calcEmployeeGross(emp: EmployeeCompensation): number {
  let base = 0;
  if (emp.flsa_status === 'exempt') {
    base = SALARY_ANNUAL / PAY_PERIODS;
  } else {
    const reg = (emp.regular_hours ?? 0) * (emp.hourly_rate ?? 0);
    const ot = (emp.overtime_hours ?? 0) * (emp.hourly_rate ?? 0) * 1.5;
    const dot = (emp.double_overtime_hours ?? 0) * (emp.hourly_rate ?? 0) * 2;
    base = reg + ot + dot;
  }
  const extras = emp.fixed_compensations.reduce((sum, fc) => sum + fc.amount, 0);
  return base + extras;
}

export function calcTotals(employees: EmployeeCompensation[]) {
  const grossTotal = employees.reduce((s, e) => s + calcEmployeeGross(e), 0);
  const taxRate = 0.2743;
  const taxes = grossTotal * taxRate;
  const net = grossTotal - taxes;
  return { grossTotal, taxes, net };
}
```

**Step 3: Commit**

```bash
git add payroll-react/src/utils/
git commit -m "feat: add formatters and payroll calc utilities"
```

---

## Phase 4 — MUI theme + app entry

### Task 6: Theme, main.tsx, App.tsx

**Files:**
- Create: `payroll-react/src/theme.ts`
- Create: `payroll-react/src/main.tsx`
- Create: `payroll-react/src/App.tsx`

**Step 1: Write theme.ts**

```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#2DA38D' },
    secondary:  { main: '#F15F22' },
    text:       { primary: '#121724', secondary: 'rgba(18,23,36,.55)' },
    background: { default: '#F7F7F7', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: "'Poppins', Roboto, system-ui",
    fontSize: 14,
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

export default theme;
```

**Step 2: Write main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

**Step 3: Write App.tsx**

```tsx
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PayrollShell from './components/shell/PayrollShell';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import ContractorsPage from './pages/ContractorsPage';
import RunPayrollPage from './pages/RunPayrollPage';

export default function App() {
  return (
    <Router>
      <PayrollShell>
        <Switch>
          <Route path="/company" component={CompanyDetailsPage} />
          <Route path="/contractors" component={ContractorsPage} />
          <Route path="/run-payroll" component={RunPayrollPage} />
          <Redirect from="/" to="/company" />
        </Switch>
      </PayrollShell>
    </Router>
  );
}
```

**Step 4: Run dev server and confirm no compile errors**

```bash
npm run dev
```

Expected: TypeScript errors about missing components — that's fine. No syntax errors.

**Step 5: Commit**

```bash
git add payroll-react/src/theme.ts payroll-react/src/main.tsx payroll-react/src/App.tsx
git commit -m "feat: add theme, main entry, and router"
```

---

## Phase 5 — Shell components

### Task 7: PayrollSidebar

**Files:**
- Create: `payroll-react/src/components/shell/PayrollSidebar.tsx`

**Step 1: Write the file**

```tsx
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
```

**Step 2: Commit**

```bash
git add payroll-react/src/components/shell/PayrollSidebar.tsx
git commit -m "feat: add PayrollSidebar nav component"
```

---

### Task 8: PayrollShell

**Files:**
- Create: `payroll-react/src/components/shell/PayrollShell.tsx`

**Step 1: Write the file**

```tsx
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
```

**Step 2: Verify dev server renders sidebar + topbar**

```bash
npm run dev
```

Navigate to `http://localhost:5173` — expect: teal topbar, left sidebar with three nav items, gray content area.

**Step 3: Commit**

```bash
git add payroll-react/src/components/shell/PayrollShell.tsx
git commit -m "feat: add PayrollShell layout wrapper"
```

---

## Phase 6 — Company Details components

### Task 9: StepRow + OnboardingChecklist

**Files:**
- Create: `payroll-react/src/components/company/StepRow.tsx`
- Create: `payroll-react/src/components/company/OnboardingChecklist.tsx`

**Step 1: Write StepRow.tsx**

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import BlockIcon from '@mui/icons-material/Block';
import { CompanyOnboardingStep } from '../../types/gusto';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: '#DBF6E7', text: '#1F7262', label: 'Complete' },
  ready:     { bg: '#EBF3FF', text: '#1776B6', label: 'Ready' },
  awaiting:  { bg: '#F3F4F6', text: '#6B7280', label: 'Awaiting' },
  blocked:   { bg: '#FEE2E2', text: '#DC2626', label: 'Blocked' },
};

interface Props {
  step: CompanyOnboardingStep;
  onAction?: (stepId: string) => void;
}

export default function StepRow({ step, onAction }: Props) {
  const colors = STATUS_COLORS[step.status];
  const Icon =
    step.status === 'completed' ? CheckCircleIcon :
    step.status === 'blocked'   ? BlockIcon :
    RadioButtonUncheckedIcon;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2,
      borderBottom: '1px solid rgba(0,0,0,.06)', '&:last-child': { borderBottom: 0 } }}>
      <Icon sx={{ color: step.status === 'completed' ? '#2DA38D' : step.status === 'blocked' ? '#DC2626' : '#9CA3AF', fontSize: 22, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={500}>{step.title}</Typography>
        <Typography variant="caption" color="text.secondary">{step.description}</Typography>
      </Box>
      <Chip label={colors.label} size="small"
        sx={{ bgcolor: colors.bg, color: colors.text, fontWeight: 600, fontSize: 11 }} />
      {step.action && step.status !== 'completed' && step.status !== 'blocked' && (
        <Button size="small" variant="outlined" color="primary"
          onClick={() => onAction?.(step.id)}
          sx={{ minWidth: 64, fontSize: 12 }}>
          {step.action}
        </Button>
      )}
    </Box>
  );
}
```

**Step 2: Write OnboardingChecklist.tsx**

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import StepRow from './StepRow';
import { CompanyOnboardingStep } from '../../types/gusto';

interface Props {
  steps: CompanyOnboardingStep[];
  onAction?: (stepId: string) => void;
}

export default function OnboardingChecklist({ steps, onAction }: Props) {
  const completed = steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completed / steps.length) * 100);

  // Group by phase
  const phases = steps.reduce<Record<string, CompanyOnboardingStep[]>>((acc, s) => {
    (acc[s.phase] = acc[s.phase] || []).push(s);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {completed} of {steps.length} steps complete
          </Typography>
          <Typography variant="body2" fontWeight={600} color="primary">{progress}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
      </Box>
      {Object.entries(phases).map(([phase, phaseSteps]) => (
        <Paper key={phase} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(0,0,0,.02)', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
              {phase}
            </Typography>
          </Box>
          {phaseSteps.map(step => (
            <StepRow key={step.id} step={step} onAction={onAction} />
          ))}
        </Paper>
      ))}
    </Box>
  );
}
```

**Step 3: Commit**

```bash
git add payroll-react/src/components/company/
git commit -m "feat: add StepRow and OnboardingChecklist components"
```

---

### Task 10: CompanyHeader + modals + GustoCompanyDetails

**Files:**
- Create: `payroll-react/src/components/company/CompanyHeader.tsx`
- Create: `payroll-react/src/components/company/StateTaxModal.tsx`
- Create: `payroll-react/src/components/company/BankVerifyModal.tsx`
- Create: `payroll-react/src/components/company/SignFormsModal.tsx`
- Create: `payroll-react/src/components/company/GustoCompanyDetails.tsx`
- Create: `payroll-react/src/pages/CompanyDetailsPage.tsx`

**Step 1: Write CompanyHeader.tsx**

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
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
```

**Step 2: Write StateTaxModal.tsx (abbreviated — full form in sprint)**

```tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

interface Props { open: boolean; onClose: () => void; }

export default function StateTaxModal({ open, onClose }: Props) {
  const [tab, setTab] = useState(0);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>State Tax Setup</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Oregon (OR)" />
          <Tab label="Texas (TX)" />
        </Tabs>
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Oregon BIN" size="small" fullWidth />
            <TextField label="Withholding Rate %" size="small" fullWidth />
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <TextField label="Texas Taxpayer Number" size="small" fullWidth />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Step 3: Write BankVerifyModal.tsx**

```tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface Props { open: boolean; onClose: () => void; }

export default function BankVerifyModal({ open, onClose }: Props) {
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Verify Bank Account</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the two micro-deposit amounts sent to your account (1–2 business days).
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Deposit 1" size="small" value={d1} onChange={e => setD1(e.target.value)} />
          <TextField label="Deposit 2" size="small" value={d2} onChange={e => setD2(e.target.value)} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose} disabled={!d1 || !d2}>Verify</Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Step 4: Write SignFormsModal.tsx**

```tsx
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface Props { open: boolean; onClose: () => void; }

export default function SignFormsModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sign Required Forms</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {['Form 8655 — Reporting Agent Authorization', 'Form 940 — FUTA Authorization', 'Direct Deposit Authorization'].map(f => (
            <Box key={f} sx={{ p: 1.5, border: '1px solid rgba(0,0,0,.12)', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">{f}</Typography>
              <Button size="small" variant="outlined">Sign</Button>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Step 5: Write GustoCompanyDetails.tsx**

```tsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CompanyHeader from './CompanyHeader';
import OnboardingChecklist from './OnboardingChecklist';
import StateTaxModal from './StateTaxModal';
import BankVerifyModal from './BankVerifyModal';
import SignFormsModal from './SignFormsModal';
import { CompanyOnboardingStep } from '../../types/gusto';

type ModalType = 'state_tax' | 'bank_verify' | 'sign_forms' | null;

const MODAL_MAP: Record<string, ModalType> = {
  state_tax: 'state_tax',
  bank_verify: 'bank_verify',
  sign_forms: 'sign_forms',
};

interface Props { initialSteps: CompanyOnboardingStep[]; }

export default function GustoCompanyDetails({ initialSteps }: Props) {
  const [steps, setSteps] = useState(initialSteps);
  const [modal, setModal] = useState<ModalType>(null);

  function handleAction(stepId: string) {
    const m = MODAL_MAP[stepId];
    if (m) setModal(m);
  }

  function handleModalClose() {
    setModal(null);
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Company Details</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete your Gusto payroll setup
      </Typography>
      <CompanyHeader companyName="Riverside Roofing LLC" ein="47-1234567" employeeCount={3} contractorCount={3} />
      <OnboardingChecklist steps={steps} onAction={handleAction} />
      <StateTaxModal open={modal === 'state_tax'} onClose={handleModalClose} />
      <BankVerifyModal open={modal === 'bank_verify'} onClose={handleModalClose} />
      <SignFormsModal open={modal === 'sign_forms'} onClose={handleModalClose} />
    </Box>
  );
}
```

**Step 6: Write CompanyDetailsPage.tsx**

```tsx
import React from 'react';
import GustoCompanyDetails from '../components/company/GustoCompanyDetails';
import { mockCompanySteps } from '../mock/company';

export default function CompanyDetailsPage() {
  return <GustoCompanyDetails initialSteps={mockCompanySteps} />;
}
```

**Step 7: Verify Company Details page renders in browser**

Navigate to `http://localhost:5173/company`. Expected: header with avatar, progress bar, phase-grouped checklist, "Start" buttons open correct modals.

**Step 8: Commit**

```bash
git add payroll-react/src/components/company/ payroll-react/src/pages/CompanyDetailsPage.tsx
git commit -m "feat: add Company Details components and page"
```

---

## Phase 7 — Contractors components

### Task 11: ContractorRow + ContractorList

**Files:**
- Create: `payroll-react/src/components/contractors/ContractorRow.tsx`
- Create: `payroll-react/src/components/contractors/ContractorList.tsx`

**Step 1: Write ContractorRow.tsx**

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import { GustoContractor } from '../../types/gusto';

const STATUS_CONFIG = {
  onboarding_completed:   { label: 'Onboarded',    bg: '#DBF6E7', color: '#1F7262' },
  self_onboarding_started:{ label: 'Invite Sent',  bg: '#EBF3FF', color: '#1776B6' },
  onboarding_pending:     { label: 'Incomplete',   bg: '#FEF3C7', color: '#B45309' },
};

function getDisplayName(c: GustoContractor): string {
  return c.type === 'Business' ? (c.business_name ?? '') : `${c.first_name} ${c.last_name}`;
}

function getInitials(c: GustoContractor): string {
  const name = getDisplayName(c);
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

interface Props {
  contractor: GustoContractor;
  selected: boolean;
  onClick: () => void;
}

export default function ContractorRow({ contractor, selected, onClick }: Props) {
  const sc = STATUS_CONFIG[contractor.onboarding_status];
  return (
    <ListItemButton selected={selected} onClick={onClick}
      sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2,
        borderBottom: '1px solid rgba(0,0,0,.06)',
        '&.Mui-selected': { bgcolor: 'rgba(45,163,141,.06)' } }}>
      <Avatar sx={{ bgcolor: '#2DA38D', width: 40, height: 40, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
        {getInitials(contractor)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>{getDisplayName(contractor)}</Typography>
        <Typography variant="caption" color="text.secondary">{contractor.type} · {contractor.wage_type}</Typography>
      </Box>
      <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 11 }} />
    </ListItemButton>
  );
}
```

**Step 2: Write ContractorList.tsx**

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import AddIcon from '@mui/icons-material/Add';
import ContractorRow from './ContractorRow';
import { GustoContractor } from '../../types/gusto';

interface Props {
  contractors: GustoContractor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export default function ContractorList({ contractors, selectedId, onSelect, onAdd }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid rgba(0,0,0,.08)', width: 320, flexShrink: 0 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
        <Button variant="contained" startIcon={<AddIcon />} fullWidth onClick={onAdd}>
          Add Contractor
        </Button>
      </Box>
      <List disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
        {contractors.map(c => (
          <ContractorRow key={c.uuid} contractor={c} selected={selectedId === c.uuid} onClick={() => onSelect(c.uuid)} />
        ))}
      </List>
    </Box>
  );
}
```

**Step 3: Commit**

```bash
git add payroll-react/src/components/contractors/ContractorRow.tsx payroll-react/src/components/contractors/ContractorList.tsx
git commit -m "feat: add ContractorRow and ContractorList"
```

---

### Task 12: ContractorDetail + AddContractorModal + GustoContractors

**Files:**
- Create: `payroll-react/src/components/contractors/ContractorDetail.tsx`
- Create: `payroll-react/src/components/contractors/AddContractorModal.tsx`
- Create: `payroll-react/src/components/contractors/GustoContractors.tsx`
- Create: `payroll-react/src/pages/ContractorsPage.tsx`

**Step 1: Write ContractorDetail.tsx**

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LinearProgress from '@mui/material/LinearProgress';
import { GustoContractor } from '../../types/gusto';

function getDisplayName(c: GustoContractor) {
  return c.type === 'Business' ? c.business_name ?? '' : `${c.first_name} ${c.last_name}`;
}

interface Props { contractor: GustoContractor; }

export default function ContractorDetail({ contractor }: Props) {
  const name = getDisplayName(contractor);
  const completed = contractor.steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completed / contractor.steps.length) * 100);

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      {/* Header card */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#2DA38D', width: 52, height: 52, fontSize: 18, fontWeight: 700 }}>
          {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>{name}</Typography>
            <Chip label={contractor.type} size="small" sx={{ bgcolor: '#F3F4F6', fontSize: 11 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">{contractor.email}</Typography>
          <Typography variant="caption" color="text.secondary">
            Started {contractor.start_date} · {contractor.work_state} · {contractor.wage_type} ${contractor.rate.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined">Edit</Button>
          <Button size="small" color="error">Dismiss</Button>
        </Box>
      </Paper>

      {/* Onboarding checklist */}
      <Paper variant="outlined">
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
          <Typography variant="subtitle2" fontWeight={700}>Onboarding Checklist</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
            <Typography variant="caption" color="primary" fontWeight={600}>{progress}%</Typography>
          </Box>
        </Box>
        {contractor.steps.map(step => (
          <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.25, borderBottom: '1px solid rgba(0,0,0,.06)', '&:last-child': { borderBottom: 0 } }}>
            {step.status === 'completed'
              ? <CheckCircleIcon sx={{ color: '#2DA38D', fontSize: 20 }} />
              : <RadioButtonUncheckedIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />}
            <Typography variant="body2" sx={{ flex: 1 }}>{step.title}</Typography>
            <Chip label={step.optional ? 'Optional' : 'Required'} size="small"
              sx={{ bgcolor: step.optional ? '#F3F4F6' : '#EBF3FF', color: step.optional ? '#6B7280' : '#1776B6', fontSize: 11, fontWeight: 600 }} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
```

**Step 2: Write AddContractorModal.tsx**

```tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { GustoContractor } from '../../types/gusto';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

interface FormData {
  type: 'Individual' | 'Business';
  onboarding_method: 'manual' | 'invite';
  first_name: string; last_name: string; business_name: string;
  email: string; start_date: string; work_state: string;
  wage_type: 'Fixed' | 'Hourly'; rate: string;
}

const INIT: FormData = {
  type: 'Individual', onboarding_method: 'manual',
  first_name: '', last_name: '', business_name: '',
  email: '', start_date: '', work_state: '',
  wage_type: 'Fixed', rate: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (c: Omit<GustoContractor, 'uuid' | 'steps'>) => void;
}

function StepIndicator({ step }: { step: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      {[1, 2, 3, 4].map(n => (
        <Box key={n} sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, bgcolor: n === step ? '#2DA38D' : n < step ? '#DBF6E7' : '#F3F4F6', color: n === step ? '#fff' : n < step ? '#1F7262' : '#6B7280' }}>
          {n}
        </Box>
      ))}
    </Box>
  );
}

export default function AddContractorModal({ open, onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const set = (k: keyof FormData) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleSave() {
    onSave({
      type: form.type,
      onboarding_status: form.onboarding_method === 'invite' ? 'self_onboarding_started' : 'onboarding_pending',
      first_name: form.first_name || undefined,
      last_name: form.last_name || undefined,
      business_name: form.business_name || undefined,
      email: form.email,
      start_date: form.start_date,
      work_state: form.work_state,
      wage_type: form.wage_type,
      rate: parseFloat(form.rate) || 0,
    });
    setStep(1);
    setForm(INIT);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Contractor</DialogTitle>
      <DialogContent>
        <StepIndicator step={step} />

        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">Contractor type</Typography>
            <ToggleButtonGroup exclusive value={form.type} onChange={(_, v) => v && set('type')(v)} fullWidth>
              <ToggleButton value="Individual">Individual</ToggleButton>
              <ToggleButton value="Business">Business</ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="subtitle2">Onboarding method</Typography>
            <ToggleButtonGroup exclusive value={form.onboarding_method} onChange={(_, v) => v && set('onboarding_method')(v)} fullWidth>
              <ToggleButton value="manual">I'll enter info</ToggleButton>
              <ToggleButton value="invite">Send invite</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {form.type === 'Individual' ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="First name" size="small" fullWidth value={form.first_name} onChange={e => set('first_name')(e.target.value)} />
                <TextField label="Last name" size="small" fullWidth value={form.last_name} onChange={e => set('last_name')(e.target.value)} />
              </Box>
            ) : (
              <TextField label="Business name" size="small" fullWidth value={form.business_name} onChange={e => set('business_name')(e.target.value)} />
            )}
            <TextField label="Email" size="small" fullWidth type="email" value={form.email} onChange={e => set('email')(e.target.value)} />
            <TextField label="Start date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={e => set('start_date')(e.target.value)} />
            <TextField select label="Work state" size="small" fullWidth value={form.work_state} onChange={e => set('work_state')(e.target.value)}>
              {US_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Box>
        )}

        {step === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ToggleButtonGroup exclusive value={form.wage_type} onChange={(_, v) => v && set('wage_type')(v)} fullWidth>
              <ToggleButton value="Fixed">Fixed</ToggleButton>
              <ToggleButton value="Hourly">Hourly</ToggleButton>
            </ToggleButtonGroup>
            <TextField label={`Rate (${form.wage_type === 'Hourly' ? 'per hour' : 'per payment'})`} size="small" fullWidth type="number" value={form.rate} onChange={e => set('rate')(e.target.value)} InputProps={{ startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography> }} />
          </Box>
        )}

        {step === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              ['Type', form.type],
              ['Name', form.type === 'Business' ? form.business_name : `${form.first_name} ${form.last_name}`],
              ['Email', form.email],
              ['Start date', form.start_date],
              ['Work state', form.work_state],
              ['Compensation', `$${form.rate} ${form.wage_type}`],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={500}>{value}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step > 1 && <Button onClick={() => setStep(s => s - 1)}>Back</Button>}
        {step < 4
          ? <Button variant="contained" onClick={() => setStep(s => s + 1)}>Next</Button>
          : <Button variant="contained" color="secondary" onClick={handleSave}>Add Contractor</Button>}
      </DialogActions>
    </Dialog>
  );
}
```

**Step 3: Write GustoContractors.tsx**

```tsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ContractorList from './ContractorList';
import ContractorDetail from './ContractorDetail';
import AddContractorModal from './AddContractorModal';
import { GustoContractor } from '../../types/gusto';

const DEFAULT_STEPS = (status: 'onboarding_pending' | 'self_onboarding_started') =>
  ['Basic details', 'Compensation details', 'Add an address', 'Payment details', 'Sign documents', 'File new hire report'].map((title, i) => ({
    id: `s${i + 1}`, phase: i < 4 ? 'Setup' : 'Compliance', title, description: '',
    status: (status === 'self_onboarding_started' && i < 3 ? 'completed' : 'awaiting') as any,
    optional: i >= 4,
  }));

interface Props { initialContractors: GustoContractor[]; }

export default function GustoContractors({ initialContractors }: Props) {
  const [contractors, setContractors] = useState(initialContractors);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const selected = contractors.find(c => c.uuid === selectedId) ?? null;

  function handleSave(data: Omit<GustoContractor, 'uuid' | 'steps'>) {
    const newC: GustoContractor = {
      ...data,
      uuid: `c-${Date.now()}`,
      steps: DEFAULT_STEPS(data.onboarding_status as any),
    };
    setContractors(cs => [...cs, newC]);
    setSelectedId(newC.uuid);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(0,0,0,.08)' }}>
        <Typography variant="h5" fontWeight={700}>Contractors</Typography>
        <Typography variant="body2" color="text.secondary">{contractors.length} contractor{contractors.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ContractorList contractors={contractors} selectedId={selectedId} onSelect={setSelectedId} onAdd={() => setModalOpen(true)} />
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {selected
            ? <ContractorDetail contractor={selected} />
            : <Box sx={{ p: 4, color: 'text.secondary', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 8 }}>Select a contractor to view details</Typography>
              </Box>}
        </Box>
      </Box>
      <AddContractorModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </Box>
  );
}
```

**Step 4: Write ContractorsPage.tsx**

```tsx
import React from 'react';
import GustoContractors from '../components/contractors/GustoContractors';
import { mockContractors } from '../mock/contractors';

export default function ContractorsPage() {
  return <GustoContractors initialContractors={mockContractors} />;
}
```

**Step 5: Verify Contractors page — click each row, open Add modal, add a contractor**

**Step 6: Commit**

```bash
git add payroll-react/src/components/contractors/ payroll-react/src/pages/ContractorsPage.tsx
git commit -m "feat: add Contractors components and page"
```

---

## Phase 8 — Run Payroll components

### Task 13: WizardBar + CalculatingOverlay

**Files:**
- Create: `payroll-react/src/components/run-payroll/WizardBar.tsx`
- Create: `payroll-react/src/components/run-payroll/CalculatingOverlay.tsx`

**Step 1: Write WizardBar.tsx**

```tsx
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
```

**Step 2: Write CalculatingOverlay.tsx**

```tsx
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
```

**Step 3: Commit**

```bash
git add payroll-react/src/components/run-payroll/WizardBar.tsx payroll-react/src/components/run-payroll/CalculatingOverlay.tsx
git commit -m "feat: add WizardBar and CalculatingOverlay"
```

---

### Task 14: Wizard steps 1–4 + GustoRunPayroll

**Files:**
- Create: `payroll-react/src/components/run-payroll/steps/Step1ReviewPeriod.tsx`
- Create: `payroll-react/src/components/run-payroll/steps/Step2Compensation.tsx`
- Create: `payroll-react/src/components/run-payroll/steps/Step3Calculate.tsx`
- Create: `payroll-react/src/components/run-payroll/steps/Step4Submit.tsx`
- Create: `payroll-react/src/components/run-payroll/GustoRunPayroll.tsx`
- Create: `payroll-react/src/pages/RunPayrollPage.tsx`

**Step 1: Write Step1ReviewPeriod.tsx**

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import { GustoPayroll } from '../../../types/gusto';
import { formatDateRange, formatDate } from '../../../utils/formatters';
import { calcEmployeeGross } from '../../../utils/calc';
import { formatCurrency } from '../../../utils/formatters';

interface Props { payroll: GustoPayroll; }

export default function Step1ReviewPeriod({ payroll }: Props) {
  const INFO = [
    ['Pay period', formatDateRange(payroll.pay_period.start_date, payroll.pay_period.end_date)],
    ['Check date', formatDate(payroll.check_date)],
    ['Submission deadline', formatDate(payroll.payroll_deadline.split('T')[0]) + ' · 3:30 pm PST'],
    ['Payroll type', payroll.payroll_type],
    ['Employees', String(payroll.employee_compensations.length)],
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 720 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Review Pay Period</Typography>
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Grid container>
          {INFO.map(([label, value]) => (
            <Grid item xs={12} sm={6} key={label} sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body2" fontWeight={500}>{value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Employees</Typography>
      <Paper variant="outlined">
        {payroll.employee_compensations.map(emp => (
          <Box key={emp.employee_uuid} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)', '&:last-child': { borderBottom: 0 } }}>
            <Avatar sx={{ bgcolor: emp.color, width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>{emp.initials}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={500}>{emp.name}</Typography>
              <Typography variant="caption" color="text.secondary">{emp.flsa_status === 'exempt' ? 'Salary' : 'Hourly'}</Typography>
            </Box>
            <Typography variant="body2" fontWeight={500}>{formatCurrency(calcEmployeeGross(emp))}</Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
```

**Step 2: Write Step2Compensation.tsx** (editable compensation table)

```tsx
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

function updateFixed(emp: EmployeeCompensation, name: string, amount: number): EmployeeCompensation {
  const fcs = emp.fixed_compensations.map(fc => fc.name === name ? { ...fc, amount } : fc);
  return { ...emp, fixed_compensations: fcs };
}

export default function Step2Compensation({ employees, onChange }: Props) {
  const { grossTotal } = calcTotals(employees);

  function setHours(uuid: string, field: keyof EmployeeCompensation, val: string) {
    onChange(updateEmployee(employees, uuid, { [field]: parseFloat(val) || 0 }));
  }

  function setFixed(emp: EmployeeCompensation, name: string, val: string) {
    onChange(employees.map(e => e.employee_uuid === emp.employee_uuid ? updateFixed(e, name, parseFloat(val) || 0) : e));
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
```

**Step 3: Write Step3Calculate.tsx**

```tsx
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
      {/* Per-employee table */}
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)', display: 'flex' }}>
          <Typography variant="subtitle2" sx={{ flex: 1 }}>Employee</Typography>
          <Typography variant="subtitle2" sx={{ width: 120, textAlign: 'right' }}>Gross</Typography>
          <Typography variant="subtitle2" sx={{ width: 120, textAlign: 'right' }}>Net pay</Typography>
        </Box>
        {employees.map(emp => {
          const gross = calcEmployeeGross(emp);
          const net = gross * (1 - 0.2743);
          return (
            <Box key={emp.employee_uuid} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)', '&:last-child': { borderBottom: 0 } }}>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: emp.color, width: 32, height: 32, fontSize: 12, fontWeight: 700 }}>{emp.initials}</Avatar>
                <Typography variant="body2">{emp.name}</Typography>
              </Box>
              <Typography variant="body2" sx={{ width: 120, textAlign: 'right' }}>{formatCurrency(gross)}</Typography>
              <Typography variant="body2" fontWeight={600} color="primary" sx={{ width: 120, textAlign: 'right' }}>{formatCurrency(net)}</Typography>
            </Box>
          );
        })}
      </Paper>
      {/* 4-panel breakdown */}
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
```

**Step 4: Write Step4Submit.tsx**

```tsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GustoPayroll, EmployeeCompensation } from '../../../types/gusto';
import { calcEmployeeGross, calcTotals } from '../../../utils/calc';
import { formatCurrency, formatDate, formatDateRange } from '../../../utils/formatters';

interface Props {
  payroll: GustoPayroll;
  employees: EmployeeCompensation[];
  onSubmit: () => void;
  submitted: boolean;
}

export default function Step4Submit({ payroll, employees, onSubmit, submitted }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { grossTotal, taxes, net } = calcTotals(employees);
  const employerTaxes = grossTotal * 0.0765;
  const totalDebit = net + employerTaxes;

  if (submitted) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', maxWidth: 540, mx: 'auto' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#2DA38D', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Payroll submitted!</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Funds will be debited on {formatDate(payroll.check_date)}. Total: {formatCurrency(totalDebit)}.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 640 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Review & Submit</Typography>

      {/* Bank debit callout */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#EBF3FF', border: '1px solid #93C5FD' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Bank debit</Typography>
        <Typography variant="h5" fontWeight={700} color="primary">{formatCurrency(totalDebit)}</Typography>
        <Typography variant="caption" color="text.secondary">Checking ···· 4821 · Debit date: {formatDate(payroll.check_date)}</Typography>
      </Paper>

      {/* Deadline warning */}
      <Alert severity="warning" sx={{ mb: 2 }}>
        Payroll cannot be canceled or reversed after the submission deadline.
      </Alert>

      {/* Summary table */}
      <Paper variant="outlined" sx={{ mb: 3 }}>
        {[
          ['Pay period', formatDateRange(payroll.pay_period.start_date, payroll.pay_period.end_date)],
          ['Check date', formatDate(payroll.check_date)],
          ['Total gross', formatCurrency(grossTotal)],
          ['Employee taxes withheld', formatCurrency(taxes)],
          ['Net pay to employees', formatCurrency(net)],
          ['Employer taxes', formatCurrency(employerTaxes)],
          ['Total bank debit', formatCurrency(totalDebit)],
        ].map(([label, value]) => (
          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value}</Typography>
          </Box>
        ))}
      </Paper>

      <Button variant="contained" color="secondary" size="large" fullWidth onClick={() => setConfirmOpen(true)}>
        Submit Payroll
      </Button>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm payroll submission</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Once submitted, this payroll will be processed and {formatCurrency(totalDebit)} will be debited from your account. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={() => { setConfirmOpen(false); onSubmit(); }}>
            Confirm & submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
```

**Step 5: Write GustoRunPayroll.tsx**

```tsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import WizardBar from './WizardBar';
import CalculatingOverlay from './CalculatingOverlay';
import Step1ReviewPeriod from './steps/Step1ReviewPeriod';
import Step2Compensation from './steps/Step2Compensation';
import Step3Calculate from './steps/Step3Calculate';
import Step4Submit from './steps/Step4Submit';
import { GustoPayroll, EmployeeCompensation } from '../../types/gusto';

interface Props { initialPayroll: GustoPayroll; }

export default function GustoRunPayroll({ initialPayroll }: Props) {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<EmployeeCompensation[]>(initialPayroll.employee_compensations);
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleNext() {
    if (step === 2) {
      // Step 3: trigger calculate simulation
      setStep(3);
      setCalculating(true);
      setTimeout(() => { setCalculating(false); setCalculated(true); }, 2000);
    } else {
      setStep(s => Math.min(s + 1, 4));
    }
  }

  const NEXT_LABELS: Record<number, string> = {
    1: 'Next: Update Hours',
    2: 'Calculate',
    3: 'Review & Submit',
    4: '',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,.08)', bgcolor: '#fff' }}>
        <Typography variant="h5" fontWeight={700}>Run Payroll</Typography>
      </Box>
      <WizardBar currentStep={step} />
      <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {step === 1 && <Step1ReviewPeriod payroll={initialPayroll} />}
        {step === 2 && <Step2Compensation employees={employees} onChange={setEmployees} />}
        {step === 3 && <Step3Calculate employees={employees} calculated={calculated} />}
        {step === 4 && <Step4Submit payroll={initialPayroll} employees={employees} onSubmit={() => setSubmitted(true)} submitted={submitted} />}
        {calculating && <CalculatingOverlay />}
      </Box>
      {/* Sticky footer */}
      {!submitted && (
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,.08)', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">Step {step} of 4</Typography>
          {step > 1 && <Button onClick={() => setStep(s => s - 1)}>Back</Button>}
          <Box sx={{ flex: 1 }} />
          {step < 4 && (
            <Button variant="contained" onClick={handleNext} disabled={calculating || (step === 3 && !calculated)}>
              {NEXT_LABELS[step]}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
```

**Step 6: Write RunPayrollPage.tsx**

```tsx
import React from 'react';
import GustoRunPayroll from '../components/run-payroll/GustoRunPayroll';
import { mockPayroll } from '../mock/payroll';

export default function RunPayrollPage() {
  return <GustoRunPayroll initialPayroll={mockPayroll} />;
}
```

**Step 7: Verify full wizard flow — step through 1→2→3 (spinner)→4→submit→success**

**Step 8: Commit**

```bash
git add payroll-react/src/components/run-payroll/ payroll-react/src/pages/RunPayrollPage.tsx
git commit -m "feat: add Run Payroll wizard components and page"
```

---

## Phase 9 — Portal: gusto-payroll folder

### Task 15: Portal shared models + styles

> Portal path root: `portal-web-master/portal-web-master/src/`

**Files:**
- Create: `components/gusto-payroll/models/gusto-payroll.ts` (same interfaces as standalone `types/gusto.ts`, with additions)
- Create: `components/gusto-payroll/styles/CompanyStyles.ts`
- Create: `components/gusto-payroll/styles/ContractorStyles.ts`
- Create: `components/gusto-payroll/styles/RunPayrollStyles.ts`

**Step 1: Write gusto-payroll.ts** (copy from standalone types + add `PayrollCalculation`)

```typescript
// (Same as payroll-react/src/types/gusto.ts — copy the full file here)
// Add:
export interface PayrollCalculation {
  grossTotal: number;
  taxes: number;
  net: number;
  employerTaxes: number;
}
```

**Step 2: Write CompanyStyles.ts** (follow exact `adp-payroll/company/CompanyCommonStyles.tsx` pattern)

```typescript
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ThemeColors } from '../../../styles/models/Colors.interface';

export const useCompanyStyles = makeStyles<Theme, ThemeColors>((theme: Theme) => ({
  pageContainer: {
    padding: theme.spacing(3),
    maxWidth: 800,
  },
  sectionCard: {
    marginBottom: theme.spacing(2),
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    backgroundColor: 'rgba(0,0,0,.02)',
    borderBottom: '1px solid rgba(0,0,0,.06)',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
    borderBottom: '1px solid rgba(0,0,0,.06)',
    '&:last-child': { borderBottom: 0 },
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
}));
```

**Step 3: Write ContractorStyles.ts + RunPayrollStyles.ts** (same pattern, field names matching respective components)

```typescript
// ContractorStyles.ts
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ThemeColors } from '../../../styles/models/Colors.interface';

export const useContractorStyles = makeStyles<Theme, ThemeColors>((theme: Theme) => ({
  listContainer: { width: 320, flexShrink: 0, borderRight: '1px solid rgba(0,0,0,.08)', height: '100%', display: 'flex', flexDirection: 'column' },
  listHeader: { padding: theme.spacing(2), borderBottom: '1px solid rgba(0,0,0,.06)' },
  detailContainer: { flex: 1, overflowY: 'auto', padding: theme.spacing(3) },
  headerCard: { padding: theme.spacing(2.5), marginBottom: theme.spacing(2.5) },
}));
```

```typescript
// RunPayrollStyles.ts
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ThemeColors } from '../../../styles/models/Colors.interface';

export const useRunPayrollStyles = makeStyles<Theme, ThemeColors>((theme: Theme) => ({
  wizardBar: { display: 'flex', alignItems: 'center', padding: `${theme.spacing(2)} ${theme.spacing(3)}`, backgroundColor: '#fff', borderBottom: '1px solid rgba(0,0,0,.08)' },
  stepCircle: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  stickyFooter: { padding: `${theme.spacing(2)} ${theme.spacing(3)}`, borderTop: '1px solid rgba(0,0,0,.08)', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: theme.spacing(2) },
  panelGrid: { marginTop: theme.spacing(2) },
}));
```

**Step 4: Commit**

```bash
git add portal-web-master/portal-web-master/src/components/gusto-payroll/
git commit -m "feat: add gusto-payroll portal models and styles"
```

---

### Task 16: Port Company + Contractors + Run Payroll components to portal

> For each component: copy logic from `payroll-react/src/components/`, replace inline `sx` props with `useCompanyStyles(themeColors)`, replace `useState` with props from Redux selector (wired via `useGustoPayroll` hook in Task 17).

**Strategy:** Port component by component. The logic is identical — only the styling API changes.

**Files to create** (full list from design doc):
```
components/gusto-payroll/company/
  GustoCompanyDetails.tsx
  CompanyHeader.tsx
  OnboardingChecklist.tsx
  StepRow.tsx
  StateTaxModal.tsx
  BankVerifyModal.tsx
  SignFormsModal.tsx

components/gusto-payroll/contractors/
  GustoContractors.tsx
  ContractorList.tsx
  ContractorRow.tsx
  ContractorDetail.tsx
  AddContractorModal.tsx

components/gusto-payroll/run-payroll/
  GustoRunPayroll.tsx
  WizardBar.tsx
  CalculatingOverlay.tsx
  steps/
    Step1ReviewPeriod.tsx
    Step2Compensation.tsx
    Step3Calculate.tsx
    Step4Submit.tsx
```

**Step 1: For each component, apply this transformation pattern:**

Before (standalone, inline sx):
```tsx
<Box sx={{ padding: theme.spacing(3) }}>
```

After (portal, makeStyles):
```tsx
const classes = useCompanyStyles(themeColors);
// ...
<Box className={classes.pageContainer}>
```

Get `themeColors` like all other portal components:
```tsx
import { useThemeContext } from '../../../common/whiteLabel/ColorThemeContext';
// inside component:
const { themeColors } = useThemeContext();
```

**Step 2: Replace useState with props** for state that Redux will own:

Portal `GustoCompanyDetails` receives props (dispatched by container):
```tsx
interface Props {
  steps: CompanyOnboardingStep[];
  onStepAction: (stepId: string) => void;
  onModalClose: () => void;
  activeModal: ModalType;
}
```

**Step 3: Commit after all company components**

```bash
git add portal-web-master/portal-web-master/src/components/gusto-payroll/company/
git commit -m "feat: add portal Company Details gusto-payroll components"
```

**Step 4: Commit after all contractors components**

```bash
git add portal-web-master/portal-web-master/src/components/gusto-payroll/contractors/
git commit -m "feat: add portal Contractors gusto-payroll components"
```

**Step 5: Commit after all run-payroll components**

```bash
git add portal-web-master/portal-web-master/src/components/gusto-payroll/run-payroll/
git commit -m "feat: add portal Run Payroll gusto-payroll components"
```

---

## Phase 10 — Portal Redux

### Task 17: Actions + reducer + hook

**Files:**
- Create: `store/actions/gustoPayroll.ts`
- Create: `store/reducers/gustoPayroll.ts`
- Create: `components/gusto-payroll/hooks/useGustoPayroll.ts`
- Create: `components/gusto-payroll/provider/GustoPayrollProvider.tsx`

**Step 1: Write store/actions/gustoPayroll.ts**

```typescript
import { Dispatch } from 'redux';
import { GustoPayroll, GustoContractor, CompanyOnboardingStep } from '../../components/gusto-payroll/models/gusto-payroll';

// Action constants
export const GUSTO_PAYROLL_SET_STEP         = 'GUSTO_PAYROLL_SET_STEP';
export const GUSTO_PAYROLL_SET_EMPLOYEES    = 'GUSTO_PAYROLL_SET_EMPLOYEES';
export const GUSTO_PAYROLL_SET_CALCULATED   = 'GUSTO_PAYROLL_SET_CALCULATED';
export const GUSTO_PAYROLL_SET_SUBMITTED    = 'GUSTO_PAYROLL_SET_SUBMITTED';
export const GUSTO_CONTRACTORS_SET_LIST     = 'GUSTO_CONTRACTORS_SET_LIST';
export const GUSTO_CONTRACTORS_SELECT       = 'GUSTO_CONTRACTORS_SELECT';
export const GUSTO_COMPANY_SET_STEPS        = 'GUSTO_COMPANY_SET_STEPS';
export const GUSTO_SET_LOADING              = 'GUSTO_SET_LOADING';
export const GUSTO_SET_ERROR                = 'GUSTO_SET_ERROR';
export const GUSTO_PAYROLL_SET_CURRENT      = 'GUSTO_PAYROLL_SET_CURRENT';

// Action creators
export const setWizardStep = (step: number) => ({ type: GUSTO_PAYROLL_SET_STEP, payload: step });
export const setCalculated = (val: boolean) => ({ type: GUSTO_PAYROLL_SET_CALCULATED, payload: val });
export const setSubmitted  = (val: boolean) => ({ type: GUSTO_PAYROLL_SET_SUBMITTED,  payload: val });
export const selectContractor = (id: string | null) => ({ type: GUSTO_CONTRACTORS_SELECT, payload: id });
export const setGustoLoading  = (val: boolean) => ({ type: GUSTO_SET_LOADING, payload: val });
export const setGustoError    = (msg: string | null) => ({ type: GUSTO_SET_ERROR, payload: msg });

// Thunks (mock implementations — swap for real API calls)
export const fetchUpcomingPayroll = () => async (dispatch: Dispatch) => {
  dispatch(setGustoLoading(true));
  try {
    // In production: const res = await api.get(`/v1/companies/${uuid}/payrolls?processing_statuses=unprocessed`);
    const { mockPayroll } = await import('../mock/payroll'); // standalone mock re-used
    dispatch({ type: GUSTO_PAYROLL_SET_CURRENT, payload: mockPayroll });
  } catch (e: any) {
    dispatch(setGustoError(e.message));
  } finally {
    dispatch(setGustoLoading(false));
  }
};

export const calculatePayroll = () => async (dispatch: Dispatch) => {
  dispatch(setGustoLoading(true));
  await new Promise(r => setTimeout(r, 2000)); // simulate async
  dispatch(setCalculated(true));
  dispatch(setGustoLoading(false));
};

export const submitPayroll = () => async (dispatch: Dispatch) => {
  dispatch(setGustoLoading(true));
  await new Promise(r => setTimeout(r, 1000));
  dispatch(setSubmitted(true));
  dispatch(setGustoLoading(false));
};

export const fetchContractors = () => async (dispatch: Dispatch) => {
  dispatch(setGustoLoading(true));
  try {
    const { mockContractors } = await import('../mock/contractors');
    dispatch({ type: GUSTO_CONTRACTORS_SET_LIST, payload: mockContractors });
  } finally {
    dispatch(setGustoLoading(false));
  }
};
```

**Step 2: Write store/reducers/gustoPayroll.ts**

```typescript
import {
  GUSTO_PAYROLL_SET_STEP, GUSTO_PAYROLL_SET_CALCULATED, GUSTO_PAYROLL_SET_SUBMITTED,
  GUSTO_CONTRACTORS_SET_LIST, GUSTO_CONTRACTORS_SELECT, GUSTO_COMPANY_SET_STEPS,
  GUSTO_SET_LOADING, GUSTO_SET_ERROR, GUSTO_PAYROLL_SET_CURRENT,
} from '../actions/gustoPayroll';
import { GustoPayroll, GustoContractor, CompanyOnboardingStep } from '../../components/gusto-payroll/models/gusto-payroll';

export interface GustoPayrollState {
  currentPayroll: GustoPayroll | null;
  wizardStep: number;
  isCalculating: boolean;
  calculated: boolean;
  submitted: boolean;
  contractors: GustoContractor[];
  selectedContractorId: string | null;
  onboardingSteps: CompanyOnboardingStep[];
  loading: boolean;
  error: string | null;
}

const INIT: GustoPayrollState = {
  currentPayroll: null,
  wizardStep: 1,
  isCalculating: false,
  calculated: false,
  submitted: false,
  contractors: [],
  selectedContractorId: null,
  onboardingSteps: [],
  loading: false,
  error: null,
};

export default function gustoPayroll(state = INIT, action: any): GustoPayrollState {
  switch (action.type) {
    case GUSTO_PAYROLL_SET_CURRENT:    return { ...state, currentPayroll: action.payload };
    case GUSTO_PAYROLL_SET_STEP:       return { ...state, wizardStep: action.payload };
    case GUSTO_PAYROLL_SET_CALCULATED: return { ...state, calculated: action.payload };
    case GUSTO_PAYROLL_SET_SUBMITTED:  return { ...state, submitted: action.payload };
    case GUSTO_CONTRACTORS_SET_LIST:   return { ...state, contractors: action.payload };
    case GUSTO_CONTRACTORS_SELECT:     return { ...state, selectedContractorId: action.payload };
    case GUSTO_COMPANY_SET_STEPS:      return { ...state, onboardingSteps: action.payload };
    case GUSTO_SET_LOADING:            return { ...state, loading: action.payload };
    case GUSTO_SET_ERROR:              return { ...state, error: action.payload };
    default:                           return state;
  }
}
```

**Step 3: Write hooks/useGustoPayroll.ts**

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { ApplicationStore } from '../../../models';
import {
  setWizardStep, setCalculated, setSubmitted, selectContractor,
  fetchUpcomingPayroll, calculatePayroll, submitPayroll, fetchContractors,
} from '../../../store/actions/gustoPayroll';

export function useGustoPayroll() {
  const dispatch = useDispatch();
  const state = useSelector((s: ApplicationStore) => s.gustoPayroll);

  return {
    // State
    ...state,
    // Actions
    setWizardStep:      (step: number) => dispatch(setWizardStep(step)),
    setCalculated:      (val: boolean) => dispatch(setCalculated(val)),
    setSubmitted:       (val: boolean) => dispatch(setSubmitted(val)),
    selectContractor:   (id: string | null) => dispatch(selectContractor(id)),
    // Thunks
    fetchUpcomingPayroll: () => dispatch(fetchUpcomingPayroll() as any),
    calculatePayroll:     () => dispatch(calculatePayroll() as any),
    submitPayroll:        () => dispatch(submitPayroll() as any),
    fetchContractors:     () => dispatch(fetchContractors() as any),
  };
}
```

**Step 4: Write provider/GustoPayrollProvider.tsx** (minimal context wrapper if needed)

```tsx
import React, { createContext, useContext } from 'react';

// Thin wrapper — most state goes through Redux. Provider handles non-Redux UI state (e.g., active modal).
interface GustoPayrollContextValue {
  activeModal: string | null;
  setActiveModal: (m: string | null) => void;
}

const Ctx = createContext<GustoPayrollContextValue>({ activeModal: null, setActiveModal: () => {} });

export function GustoPayrollProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  return <Ctx.Provider value={{ activeModal, setActiveModal }}>{children}</Ctx.Provider>;
}

export function useGustoPayrollUI() {
  return useContext(Ctx);
}
```

**Step 5: Commit**

```bash
git add portal-web-master/portal-web-master/src/store/actions/gustoPayroll.ts
git add portal-web-master/portal-web-master/src/store/reducers/gustoPayroll.ts
git add portal-web-master/portal-web-master/src/components/gusto-payroll/hooks/
git add portal-web-master/portal-web-master/src/components/gusto-payroll/provider/
git commit -m "feat: add gustoPayroll Redux actions, reducer, and useGustoPayroll hook"
```

---

## Phase 11 — Wire Portal Redux into store

### Task 18: Add gustoPayroll to ApplicationStore + combineReducers

**Files:**
- Modify: `src/models/store.ts`
- Modify: `src/store/reducers/index.ts`

> **All paths relative to `portal-web-master/portal-web-master/`**

**Step 1: Add `gustoPayroll` to ApplicationStore in `src/models/store.ts`**

Find this block (line 196–212):
```typescript
export interface ApplicationStore {
    loading: boolean;
    // ...existing fields...
    consentModal: ConsentModalState;
}
```

Add after `consentModal`:
```typescript
    gustoPayroll: import('../store/reducers/gustoPayroll').GustoPayrollState;
```

Better approach — add import at top:
```typescript
import { GustoPayrollState } from '../store/reducers/gustoPayroll';
```

Then add to `ApplicationStore`:
```typescript
    gustoPayroll: GustoPayrollState;
```

**Step 2: Add reducer to `src/store/reducers/index.ts`**

Add import at the top:
```typescript
import gustoPayroll from './gustoPayroll';
```

Add to `combineReducers` call:
```typescript
export default combineReducers<ApplicationStore>({
    loading, appData, auth, config, entityManagement, feedback, count,
    appointmentEvents, category, featureConfig, product, company,
    reportsData, bankAccounts, consentModal,
    gustoPayroll,  // ← add this
});
```

**Step 3: Build portal to confirm no TypeScript errors**

```bash
cd portal-web-master/portal-web-master && npm run build
```

Expected: `dist/` created, 0 TypeScript errors. Fix any type mismatches before committing.

**Step 4: Commit**

```bash
git add portal-web-master/portal-web-master/src/models/store.ts
git add portal-web-master/portal-web-master/src/store/reducers/index.ts
git commit -m "feat: wire gustoPayroll reducer into ApplicationStore"
```

---

## Phase 12 — Standalone: link from index.html + build

### Task 19: Add payroll-react to the demo index

**Files:**
- Modify: `index.html`

**Step 1: Add demo card for Gusto Payroll React demo**

In `index.html`, add after the transactions-react card:
```html
<a class="demo-card" href="payroll-react/index.html">
  <div class="demo-card-badge" style="background:#EBF3FF;color:#1776B6;">Payroll · React</div>
  <h2>Gusto Payroll — React</h2>
  <p>React + MUI v5 rebuild of Company Details, Contractors, and Run Payroll. Drop-in components for portal-web-master with Redux state, TypeScript, and the makeStyles portal pattern.</p>
  <div class="demo-card-footer">
    <span>payroll-react/</span>
    <span class="arrow">›</span>
  </div>
</a>
```

**Step 2: Build standalone for production**

```bash
cd payroll-react && npm run build
```

Expected: `payroll-react/dist/` created. No TypeScript errors.

> Note: Vite builds to `dist/` by default. Either update `index.html` to point to `payroll-react/dist/index.html`, or configure Vite's `build.outDir` to build in-place. Simplest: set `base: '/payroll-react/'` in vite.config and link to `payroll-react/dist/`.

**Step 3: Push to GitHub**

```bash
git add index.html payroll-react/dist/
git commit -m "feat: add payroll-react demo card and production build"
git push origin master
git push origin master:main
```

**Step 4: Verify GitHub Pages renders the demo**

Open `https://whansen1800a.github.io/client-portal-prototypes/` — confirm new card appears and links to working React demo.

---

## Execution choice

**Plan complete and saved to `docs/plans/2026-05-29-gusto-payroll-react.md`. Two execution options:**

**1. Subagent-Driven (this session)** — Fresh subagent per task, review between tasks, fast iteration. Use `superpowers:subagent-driven-development`.

**2. Parallel Session (separate)** — Open new session in the `1800-todos` worktree with `superpowers:executing-plans`. Batch execution with checkpoints.

**Which approach?**
