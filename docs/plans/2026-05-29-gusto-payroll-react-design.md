# Design: Gusto Payroll React Conversion
**Date:** 2026-05-29  
**Status:** Approved — ready for implementation  
**Scope:** Convert HTML prototype payroll demos to React (standalone Vite app + portal drop-in components)

---

## What we're building

Two parallel outputs from the same component set:

1. **`payroll-react/`** — standalone Vite + React 17 demo app, self-contained, lives in `1800-todos/` alongside the existing HTML prototypes. Runs without the portal.
2. **`src/components/gusto-payroll/`** — drop-in TypeScript components for `portal-web-master`, following exact portal conventions, ready to merge.

Covers all three payroll sections: Company Details (9-step onboarding), Contractors (list/detail + Add flow), and Run Payroll (4-step wizard).

---

## Project structure

### Standalone app (`1800-todos/payroll-react/`)

```
payroll-react/
├── index.html
├── package.json          # React 17, MUI v5, Vite, react-router-dom v5
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx            # Router: /company, /contractors, /run-payroll
    ├── theme.ts           # MUI theme — 1-800A brand tokens
    ├── types/
    │   └── gusto.ts       # All shared TypeScript interfaces
    ├── mock/
    │   ├── company.ts
    │   ├── contractors.ts
    │   └── payroll.ts
    ├── components/
    │   ├── shell/
    │   │   ├── PayrollShell.tsx
    │   │   └── PayrollSidebar.tsx
    │   ├── company/
    │   │   ├── GustoCompanyDetails.tsx
    │   │   ├── CompanyHeader.tsx
    │   │   ├── OnboardingChecklist.tsx
    │   │   ├── StepRow.tsx
    │   │   ├── StateTaxModal.tsx
    │   │   ├── BankVerifyModal.tsx
    │   │   └── SignFormsModal.tsx
    │   ├── contractors/
    │   │   ├── GustoContractors.tsx
    │   │   ├── ContractorList.tsx
    │   │   ├── ContractorRow.tsx
    │   │   ├── ContractorDetail.tsx
    │   │   └── AddContractorModal.tsx
    │   └── run-payroll/
    │       ├── GustoRunPayroll.tsx
    │       ├── WizardBar.tsx
    │       ├── CalculatingOverlay.tsx
    │       └── steps/
    │           ├── Step1ReviewPeriod.tsx
    │           ├── Step2Compensation.tsx
    │           ├── Step3Calculate.tsx
    │           └── Step4Submit.tsx
    ├── utils/
    │   ├── formatters.ts   # formatCurrency, formatDateRange
    │   └── calc.ts         # calcEmployeeGross, calcTotals
    └── pages/
        ├── CompanyDetailsPage.tsx
        ├── ContractorsPage.tsx
        └── RunPayrollPage.tsx
```

### Portal components (`portal-web-master/src/components/gusto-payroll/`)

```
gusto-payroll/
├── company/
│   ├── GustoCompanyDetails.tsx
│   ├── CompanyHeader.tsx
│   ├── OnboardingChecklist.tsx
│   ├── StepRow.tsx
│   ├── StateTaxModal.tsx
│   ├── BankVerifyModal.tsx
│   └── SignFormsModal.tsx
├── contractors/
│   ├── GustoContractors.tsx
│   ├── ContractorList.tsx
│   ├── ContractorRow.tsx
│   ├── ContractorDetail.tsx
│   └── AddContractorModal.tsx
├── run-payroll/
│   ├── GustoRunPayroll.tsx
│   ├── WizardBar.tsx
│   ├── CalculatingOverlay.tsx
│   └── steps/
│       ├── Step1ReviewPeriod.tsx
│       ├── Step2Compensation.tsx
│       ├── Step3Calculate.tsx
│       └── Step4Submit.tsx
├── provider/
│   └── GustoPayrollProvider.tsx
├── hooks/
│   └── useGustoPayroll.ts
├── models/
│   └── gusto-payroll.ts
└── styles/
    ├── CompanyStyles.ts
    ├── ContractorStyles.ts
    └── RunPayrollStyles.ts
```

Redux additions in portal:
```
src/store/actions/gustoPayroll.ts   # Action constants + creators + thunks
src/store/reducers/gustoPayroll.ts  # Reducer (added to combineReducers)
```

---

## Component inventory

### Shell (standalone only)
| Component | Purpose |
|-----------|---------|
| `PayrollShell` | Sidebar + topbar layout wrapper |
| `PayrollSidebar` | Nav with React Router links, active state per route |

### Company Details
| Component | Purpose |
|-----------|---------|
| `GustoCompanyDetails` | Page root — step list + active modal orchestration |
| `CompanyHeader` | Avatar, company name, EIN, employee count stats bar |
| `OnboardingChecklist` | Phase-grouped step list with overall progress bar |
| `StepRow` | Single step — status icon, title, pill, action button |
| `StateTaxModal` | OR + TX tabbed form |
| `BankVerifyModal` | Micro-deposit verification form |
| `SignFormsModal` | Document signing flow |

### Contractors
| Component | Purpose |
|-----------|---------|
| `GustoContractors` | Page root — split layout, selectedContractor + modalOpen state |
| `ContractorList` | Left column — scrollable list + Add Contractor button |
| `ContractorRow` | Single row — avatar, name, type, status pill |
| `ContractorDetail` | Right column — header card + onboarding checklist |
| `AddContractorModal` | 4-step modal: type → details → compensation → review |

### Run Payroll
| Component | Purpose |
|-----------|---------|
| `GustoRunPayroll` | Page root — wizard step, employees, calculated, submitted state |
| `WizardBar` | 4-step indicator — done/active/future states |
| `Step1ReviewPeriod` | Pay period info grid + read-only employee roster |
| `Step2Compensation` | Editable comp table — exempt vs. hourly, live gross estimate |
| `Step3Calculate` | Idle card → overlay → results breakdown (4 panels) |
| `Step4Submit` | Bank debit callout, deadline warning, summary, submit → success |
| `CalculatingOverlay` | Full-screen spinner during async calculate simulation |

---

## Data layer

### TypeScript interfaces (`gusto-payroll/models/gusto-payroll.ts`)

```typescript
interface GustoPayroll {
  uuid: string;
  pay_period: { start_date: string; end_date: string };
  check_date: string;
  payroll_deadline: string;
  payroll_type: 'Regular';
  processing_status: 'unprocessed' | 'processed';
  calculated_at: string | null;
  submission_blockers: SubmissionBlocker[];
  employee_compensations: EmployeeCompensation[];
}

interface EmployeeCompensation {
  employee_uuid: string;
  name: string; initials: string; color: string;
  flsa_status: 'exempt' | 'nonexempt';
  hourly_rate?: number;
  regular_hours?: number;
  overtime_hours?: number;
  double_overtime_hours?: number;
  fixed_compensations: FixedCompensation[];
}

interface FixedCompensation {
  name: 'Bonus' | 'Commission' | 'Reimbursement';
  amount: number;
}

interface GustoContractor {
  uuid: string;
  type: 'Individual' | 'Business';
  onboarding_status: 'onboarding_completed' | 'self_onboarding_started' | 'onboarding_pending';
  first_name?: string; last_name?: string; business_name?: string;
  email: string; start_date: string; work_state: string;
  wage_type: 'Fixed' | 'Hourly'; rate: number;
  steps: ContractorStep[];
}

interface OnboardingStep {
  id: string; phase: string; title: string; description: string;
  status: 'completed' | 'ready' | 'awaiting' | 'blocked';
}
```

### Standalone state (per page, useState)
- `CompanyDetailsPage`: `steps[]`, `activeModal`, modal form state per modal
- `ContractorsPage`: `contractors[]`, `selectedId`, `modalOpen`, `modalStep`, `formData`
- `RunPayrollPage`: `wizardStep`, `employees[]`, `calculated`, `calculating`, `submitted`

### Portal Redux state
```typescript
interface GustoPayrollState {
  currentPayroll: GustoPayroll | null;
  employees: EmployeeCompensation[];
  calculationResult: PayrollCalculation | null;
  wizardStep: number;
  isCalculating: boolean;
  isSubmitting: boolean;
  contractors: GustoContractor[];
  selectedContractorId: string | null;
  onboardingSteps: OnboardingStep[];
  loading: boolean;
  error: string | null;
}
```

Action constants: `GUSTO_PAYROLL_SET_STEP`, `GUSTO_PAYROLL_SET_EMPLOYEES`, `GUSTO_PAYROLL_SET_CALCULATED`, `GUSTO_PAYROLL_SET_SUBMITTED`, `GUSTO_CONTRACTORS_SET_LIST`, `GUSTO_CONTRACTORS_SELECT`, `GUSTO_COMPANY_SET_STEPS`, `GUSTO_SET_LOADING`, `GUSTO_SET_ERROR`

Thunks: `fetchUpcomingPayroll()`, `preparePayroll()`, `calculatePayroll()`, `submitPayroll()`, `fetchContractors()`

Hook: `useGustoPayroll()` — wraps `useSelector` + `useDispatch`, one import gives components everything they need.

---

## Styling

### MUI theme (standalone `theme.ts`)
```typescript
createTheme({
  palette: {
    primary:    { main: '#2DA38D' },   // teal — portal chrome
    secondary:  { main: '#F15F22' },   // orange — CTAs only
    text:       { primary: '#121724', secondary: 'rgba(18,23,36,.55)' },
    background: { default: '#F7F7F7', paper: '#FFFFFF' },
  },
  typography: { fontFamily: "'Poppins', Roboto, system-ui" },
  shape: { borderRadius: 8 },
});
```

### Pattern (both standalone and portal)
`makeStyles<Theme, ThemeColors>` — identical signature to `adp-payroll/company/CompanyCommonStyles.tsx`. Portal components import `ThemeColors` from `styles/models/Colors.interface` and `useThemeContext` from `common/whiteLabel/ColorThemeContext`. No new portal dependencies.

### MUI components used (all in portal's existing package.json)
`Box`, `Grid`, `Typography`, `Stack`, `Divider`, `Button`, `TextField`, `Select`, `MenuItem`, `Chip`, `LinearProgress`, `CircularProgress`, `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Tab`, `Tabs`

---

## Key decisions
| Decision | Choice | Reason |
|---|---|---|
| Standalone location | `1800-todos/payroll-react/` | Clean separation from HTML prototypes |
| Portal location | `src/components/gusto-payroll/` | Mirrors `adp-payroll/`, correct domain |
| React version | 17 | Matches portal exactly |
| Styling | `makeStyles<Theme, ThemeColors>` | Exact portal pattern, zero friction merging |
| Standalone state | `useState` per page | Simple, no overhead for demo |
| Portal state | Old-style Redux actions + thunks | Matches existing `store/actions/` pattern |
| Types | Shared in `gusto-payroll/models/` | Single source of truth |
