# Gusto Payroll Portal Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the existing `gusto-payroll` React components in `portal-web-master` into the live portal with real Gusto API calls, a feature-flagged nav section, and three new page components that handle loading/error states.

**Architecture:** A new `src/services/apiService/gusto/` layer wraps all Gusto Embedded Payroll API calls and throws typed `GustoApiError` objects. Existing Redux thunk stubs in `src/store/actions/gustoPayroll.ts` are replaced with real service calls. Three new page components mount, seed Redux state via thunks, and pass data down to the existing UI components unchanged.

**Tech Stack:** React (portal version), Redux (old-style — no RTK), TypeScript, MUI v5, Gusto Embedded Payroll API v1

**Reference demo:** `payroll-react/src/` in this repo — the standalone demo whose components this plan integrates.

**Target repo:** `portal-web-master` — all file paths below are relative to its root.

---

## Context you need before starting

### Token + company UUID

Both are pre-provisioned server-side and live in `state.appData`:

```typescript
const { gusto_token, gusto_company_uuid } = store.getState().appData;
```

Neither field is ever set by the portal UI — if missing, the nav section stays hidden.

### Feature flag

`state.featureConfig.gusto_payroll_enabled: boolean` — set server-side per business, `false` by default. Nav section is hidden when `false` OR when token/UUID are absent.

### Existing stubs

`src/store/actions/gustoPayroll.ts` has thunk bodies that return hardcoded mock data or call `setTimeout`. You are **replacing** those bodies — the action type constants and action creators above them are untouched.

### Portal styling rules (critical — reviewers will reject violations)

- **No `sx` prop ever.** Use `className={classes.xxx}` for static styles, `style={{…}}` for dynamic runtime values.
- `makeStyles<Theme, ThemeColors>((theme: Theme) => ({…}))` for all style sheets.
- Import `useThemeContext` from `'common/whiteLabel/ColorThemeContext'`.
- Import `ThemeColors` from `'../../../styles/models/Colors.interface'` (adjust relative depth as needed).
- `<Loader />` is the portal's full-page loading component — use it instead of MUI CircularProgress.
- Existing gusto-payroll components (`GustoCompanyDetails`, `GustoContractors`, `GustoRunPayroll`) accept props and render — **do not modify them**.

---

## Task 1: Gusto API base client

**Files:**
- Create: `src/services/apiService/gusto/client.ts`

**What it does:** Single `gustoFetch<T>` function that reads the token from Redux, adds the `Authorization` header, and throws a typed `GustoApiError` on non-2xx responses.

**Step 1: Create the file**

```typescript
// src/services/apiService/gusto/client.ts
import store from '../../../store'; // adjust path to match portal's store export

const BASE_URL = 'https://api.gusto.com';

export interface GustoApiError {
  type: string;
  message: string;
  status: number;
}

export function isGustoApiError(e: unknown): e is GustoApiError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    typeof (e as GustoApiError).status === 'number'
  );
}

export async function gustoFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const { gusto_token } = store.getState().appData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${gusto_token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: GustoApiError = {
      type: body.error_type ?? 'api_error',
      message: body.message ?? `HTTP ${res.status}`,
      status: res.status,
    };
    throw err;
  }

  return res.json() as Promise<T>;
}
```

**Step 2: Verify the store import path**

Find where portal-web-master exports its store singleton (common locations: `src/store/index.ts`, `src/store/store.ts`, `src/store/configureStore.ts`). Update the import path in the file you just created.

**Step 3: Commit**

```bash
git add src/services/apiService/gusto/client.ts
git commit -m "feat(gusto): add Gusto API base fetch client"
```

---

## Task 2: Gusto company service

**Files:**
- Create: `src/services/apiService/gusto/company.ts`

**What it does:** Single function — `getOnboardingStatus` — that returns the company's onboarding step list.

**Step 1: Create the file**

```typescript
// src/services/apiService/gusto/company.ts
import { gustoFetch } from './client';
import { CompanyOnboardingStep } from '../../models/gusto-payroll'; // adjust path if needed

interface GustoOnboardingStatusResponse {
  uuid: string;
  onboarding_steps: Array<{
    id: string;
    phase: string;
    title: string;
    description: string;
    completed: boolean;
    skippable: boolean;
    action_url?: string;
    action?: string;
  }>;
}

export async function getOnboardingStatus(
  companyUuid: string
): Promise<CompanyOnboardingStep[]> {
  const data = await gustoFetch<GustoOnboardingStatusResponse>(
    `/v1/companies/${companyUuid}/onboarding_status`
  );

  return data.onboarding_steps.map((s) => ({
    id: s.id,
    phase: s.phase,
    title: s.title,
    description: s.description,
    status: s.completed ? 'completed' : 'ready',
    action: s.action,
  }));
}
```

**Step 2: Commit**

```bash
git add src/services/apiService/gusto/company.ts
git commit -m "feat(gusto): add company onboarding status service"
```

---

## Task 3: Gusto contractors service

**Files:**
- Create: `src/services/apiService/gusto/contractors.ts`

**What it does:** `getContractors` and `createContractor` — fetch and create contractors.

**Step 1: Create the file**

```typescript
// src/services/apiService/gusto/contractors.ts
import { gustoFetch } from './client';
import { GustoContractor } from '../../models/gusto-payroll'; // adjust path

interface CreateContractorPayload {
  type: 'Individual' | 'Business';
  first_name?: string;
  last_name?: string;
  business_name?: string;
  email: string;
  start_date: string;
  work_state: string;
  wage_type: 'Fixed' | 'Hourly';
  hourly_rate?: number;
  file_new_hire_report?: boolean;
}

export async function getContractors(
  companyUuid: string
): Promise<GustoContractor[]> {
  return gustoFetch<GustoContractor[]>(
    `/v1/companies/${companyUuid}/contractors`
  );
}

export async function createContractor(
  companyUuid: string,
  data: CreateContractorPayload
): Promise<GustoContractor> {
  return gustoFetch<GustoContractor>(
    `/v1/companies/${companyUuid}/contractors`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}
```

**Step 2: Commit**

```bash
git add src/services/apiService/gusto/contractors.ts
git commit -m "feat(gusto): add contractors service (get + create)"
```

---

## Task 4: Gusto payroll service

**Files:**
- Create: `src/services/apiService/gusto/payroll.ts`

**What it does:** Four functions covering the full run-payroll flow.

**Step 1: Create the file**

```typescript
// src/services/apiService/gusto/payroll.ts
import { gustoFetch } from './client';
import { GustoPayroll, EmployeeCompensation } from '../../models/gusto-payroll'; // adjust path

interface UpdatePayrollPayload {
  employee_compensations: EmployeeCompensation[];
}

export async function getUpcomingPayroll(
  companyUuid: string
): Promise<GustoPayroll | null> {
  const results = await gustoFetch<GustoPayroll[]>(
    `/v1/companies/${companyUuid}/payrolls?processing_statuses=unprocessed`
  );
  return results[0] ?? null;
}

export async function updatePayroll(
  companyUuid: string,
  payrollUuid: string,
  payload: UpdatePayrollPayload
): Promise<GustoPayroll> {
  return gustoFetch<GustoPayroll>(
    `/v1/companies/${companyUuid}/payrolls/${payrollUuid}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
}

export async function calculatePayroll(
  companyUuid: string,
  payrollUuid: string
): Promise<void> {
  await gustoFetch<void>(
    `/v1/companies/${companyUuid}/payrolls/${payrollUuid}/calculate`,
    { method: 'PUT' }
  );
}

export async function submitPayroll(
  companyUuid: string,
  payrollUuid: string
): Promise<GustoPayroll> {
  return gustoFetch<GustoPayroll>(
    `/v1/companies/${companyUuid}/payrolls/${payrollUuid}/submit`,
    { method: 'PUT' }
  );
}
```

**Step 2: Commit**

```bash
git add src/services/apiService/gusto/payroll.ts
git commit -m "feat(gusto): add payroll service (get, update, calculate, submit)"
```

---

## Task 5: Add `fetchOnboardingStatus` thunk + update `fetchContractors`

**Files:**
- Modify: `src/store/actions/gustoPayroll.ts`

**Context:** The file already has thunk stubs and action constants. You're adding one new thunk and replacing the stub body of one existing thunk. Do NOT change the action type constants or action creators.

**Step 1: Add the import block at the top of the file**

After the existing imports, add:

```typescript
import { getOnboardingStatus } from '../../services/apiService/gusto/company';
import { getContractors } from '../../services/apiService/gusto/contractors';
```

**Step 2: Add `fetchOnboardingStatus` thunk**

Find where the existing thunks end and add:

```typescript
export function fetchOnboardingStatus() {
  return async (dispatch: AppDispatch, getState: () => ApplicationStore) => {
    dispatch(setGustoLoading(true));
    try {
      const { gusto_company_uuid } = getState().appData;
      const steps = await getOnboardingStatus(gusto_company_uuid);
      dispatch(setCompanySteps(steps));
    } catch (e) {
      if (isGustoApiError(e) && (e.status === 401 || e.status === 403)) {
        window.location.href = '/login';
        return;
      }
      dispatch(setGustoError(isGustoApiError(e) ? e.message : 'Failed to load company details'));
    } finally {
      dispatch(setGustoLoading(false));
    }
  };
}
```

**Step 3: Replace `fetchContractors` stub body**

Find the existing `fetchContractors` thunk (it currently does `dispatch(setContractors([]))`). Replace its body:

```typescript
export function fetchContractors() {
  return async (dispatch: AppDispatch, getState: () => ApplicationStore) => {
    dispatch(setGustoLoading(true));
    try {
      const { gusto_company_uuid } = getState().appData;
      const contractors = await getContractors(gusto_company_uuid);
      dispatch(setContractors(contractors));
    } catch (e) {
      if (isGustoApiError(e) && (e.status === 401 || e.status === 403)) {
        window.location.href = '/login';
        return;
      }
      dispatch(setGustoError(isGustoApiError(e) ? e.message : 'Failed to load contractors'));
    } finally {
      dispatch(setGustoLoading(false));
    }
  };
}
```

**Step 4: Add the `isGustoApiError` import**

At the top of the file where you added the service imports:

```typescript
import { isGustoApiError } from '../../services/apiService/gusto/client';
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors in `gustoPayroll.ts`.

**Step 6: Commit**

```bash
git add src/store/actions/gustoPayroll.ts
git commit -m "feat(gusto): add fetchOnboardingStatus thunk; replace fetchContractors stub"
```

---

## Task 6: Replace payroll thunk stubs

**Files:**
- Modify: `src/store/actions/gustoPayroll.ts`

**Context:** Three thunks still have stubs: `fetchUpcomingPayroll` (hardcoded mock), `calculatePayroll` (setTimeout 2s), `submitPayroll` (setTimeout 1s).

**Step 1: Add payroll service imports**

Add to the import block you created in Task 5:

```typescript
import {
  getUpcomingPayroll,
  calculatePayroll as apiCalculatePayroll,
  submitPayroll as apiSubmitPayroll,
} from '../../services/apiService/gusto/payroll';
```

**Step 2: Replace `fetchUpcomingPayroll` stub body**

```typescript
export function fetchUpcomingPayroll() {
  return async (dispatch: AppDispatch, getState: () => ApplicationStore) => {
    dispatch(setGustoLoading(true));
    try {
      const { gusto_company_uuid } = getState().appData;
      const payroll = await getUpcomingPayroll(gusto_company_uuid);
      if (payroll) {
        dispatch(setCurrentPayroll(payroll));
      }
    } catch (e) {
      if (isGustoApiError(e) && (e.status === 401 || e.status === 403)) {
        window.location.href = '/login';
        return;
      }
      dispatch(setGustoError(isGustoApiError(e) ? e.message : 'Failed to load payroll'));
    } finally {
      dispatch(setGustoLoading(false));
    }
  };
}
```

**Step 3: Replace `calculatePayroll` stub body**

This thunk starts the calculate, then polls `getUpcomingPayroll` every 3s until `calculated_at` is populated, timing out at 60s:

```typescript
export function calculatePayroll() {
  return async (dispatch: AppDispatch, getState: () => ApplicationStore) => {
    dispatch(setGustoLoading(true));
    try {
      const { gusto_company_uuid } = getState().appData;
      const { currentPayroll } = getState().gustoPayroll;
      if (!currentPayroll) throw new Error('No payroll loaded');

      // Kick off calculate (async on Gusto's side)
      await apiCalculatePayroll(gusto_company_uuid, currentPayroll.uuid);

      // Poll until calculated_at is set (max 60s)
      const POLL_INTERVAL_MS = 3000;
      const TIMEOUT_MS = 60000;
      const startTime = Date.now();

      await new Promise<void>((resolve, reject) => {
        const poll = setInterval(async () => {
          try {
            const updated = await getUpcomingPayroll(gusto_company_uuid);
            if (updated?.calculated_at) {
              dispatch(setCurrentPayroll(updated));
              dispatch(setCalculated(true));
              clearInterval(poll);
              resolve();
            } else if (Date.now() - startTime > TIMEOUT_MS) {
              clearInterval(poll);
              reject(new Error('Calculate timed out after 60s'));
            }
          } catch (pollErr) {
            clearInterval(poll);
            reject(pollErr);
          }
        }, POLL_INTERVAL_MS);
      });
    } catch (e) {
      if (isGustoApiError(e) && (e.status === 401 || e.status === 403)) {
        window.location.href = '/login';
        return;
      }
      dispatch(setGustoError(isGustoApiError(e) ? e.message : (e as Error).message ?? 'Calculate failed'));
    } finally {
      dispatch(setGustoLoading(false));
    }
  };
}
```

**Step 4: Replace `submitPayroll` stub body**

```typescript
export function submitPayroll() {
  return async (dispatch: AppDispatch, getState: () => ApplicationStore) => {
    dispatch(setGustoLoading(true));
    try {
      const { gusto_company_uuid } = getState().appData;
      const { currentPayroll } = getState().gustoPayroll;
      if (!currentPayroll) throw new Error('No payroll loaded');

      await apiSubmitPayroll(gusto_company_uuid, currentPayroll.uuid);
      dispatch(setSubmitted(true));
    } catch (e) {
      if (isGustoApiError(e) && (e.status === 401 || e.status === 403)) {
        window.location.href = '/login';
        return;
      }
      dispatch(setGustoError(isGustoApiError(e) ? e.message : 'Submit failed'));
    } finally {
      dispatch(setGustoLoading(false));
    }
  };
}
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/store/actions/gustoPayroll.ts
git commit -m "feat(gusto): replace payroll thunk stubs with real API calls"
```

---

## Task 7: `GustoCompanyPage` page component

**Files:**
- Create: `src/components/gusto-payroll/pages/GustoCompanyPage.tsx`

**What it does:** Dispatches `fetchOnboardingStatus` on mount. Shows `<Loader />` while loading, `<Alert>` on error, then renders `<GustoCompanyDetails>` with live data.

**Step 1: Create the file**

```typescript
// src/components/gusto-payroll/pages/GustoCompanyPage.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import Loader from 'common/loader/Loader'; // adjust path to portal's Loader
import GustoCompanyDetails from '../company/GustoCompanyDetails';
import { fetchOnboardingStatus } from '../../../store/actions/gustoPayroll';
import { clearError } from '../../../store/actions/gustoPayroll';
import { ApplicationStore } from '../../../models/store';

export default function GustoCompanyPage() {
  const dispatch = useDispatch();
  const { onboardingSteps, loading, error } = useSelector(
    (s: ApplicationStore) => s.gustoPayroll
  );

  useEffect(() => {
    dispatch(fetchOnboardingStatus());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <>
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          style={{ marginBottom: 16 }}
        >
          {error}
        </Alert>
      )}
      <GustoCompanyDetails initialSteps={onboardingSteps} />
    </>
  );
}
```

**Step 2: Find the portal's Loader import path**

Search portal-web-master for `Loader` — common paths: `common/loader/Loader`, `components/shared/Loader`, `components/common/Loader`. Update the import.

**Step 3: Verify `onboardingSteps` is the correct state key**

Open `src/store/reducers/gustoPayroll.ts` and confirm the property name. If it's named differently (e.g., `companySteps`), update line in the selector.

**Step 4: Commit**

```bash
git add src/components/gusto-payroll/pages/GustoCompanyPage.tsx
git commit -m "feat(gusto): add GustoCompanyPage with loading/error handling"
```

---

## Task 8: `GustoContractorsPage` page component

**Files:**
- Create: `src/components/gusto-payroll/pages/GustoContractorsPage.tsx`

**Step 1: Create the file**

```typescript
// src/components/gusto-payroll/pages/GustoContractorsPage.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import Loader from 'common/loader/Loader'; // adjust path
import GustoContractors from '../contractors/GustoContractors';
import { fetchContractors, clearError } from '../../../store/actions/gustoPayroll';
import { ApplicationStore } from '../../../models/store';

export default function GustoContractorsPage() {
  const dispatch = useDispatch();
  const { contractors, loading, error } = useSelector(
    (s: ApplicationStore) => s.gustoPayroll
  );

  useEffect(() => {
    dispatch(fetchContractors());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <>
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          style={{ marginBottom: 16 }}
        >
          {error}
        </Alert>
      )}
      <GustoContractors initialContractors={contractors} />
    </>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/gusto-payroll/pages/GustoContractorsPage.tsx
git commit -m "feat(gusto): add GustoContractorsPage with loading/error handling"
```

---

## Task 9: `GustoRunPayrollPage` page component

**Files:**
- Create: `src/components/gusto-payroll/pages/GustoRunPayrollPage.tsx`

**Step 1: Create the file**

```typescript
// src/components/gusto-payroll/pages/GustoRunPayrollPage.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import Loader from 'common/loader/Loader'; // adjust path
import GustoRunPayroll from '../run-payroll/GustoRunPayroll';
import { fetchUpcomingPayroll, clearError } from '../../../store/actions/gustoPayroll';
import { ApplicationStore } from '../../../models/store';

export default function GustoRunPayrollPage() {
  const dispatch = useDispatch();
  const { currentPayroll, loading, error } = useSelector(
    (s: ApplicationStore) => s.gustoPayroll
  );

  useEffect(() => {
    dispatch(fetchUpcomingPayroll());
  }, [dispatch]);

  if (loading) return <Loader />;

  if (!currentPayroll) {
    return (
      <Alert severity="info">
        No upcoming payroll found. Check back when a new pay period opens.
      </Alert>
    );
  }

  return (
    <>
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          style={{ marginBottom: 16 }}
        >
          {error}
        </Alert>
      )}
      <GustoRunPayroll initialPayroll={currentPayroll} />
    </>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/gusto-payroll/pages/GustoRunPayrollPage.tsx
git commit -m "feat(gusto): add GustoRunPayrollPage with loading/error handling"
```

---

## Task 10: Add routes to portal router

**Files:**
- Modify: `src/app/App.tsx` (or wherever the portal's `<Switch>` / routes live — find it by searching for existing `<Route path="/payroll/`)

**Context:** The portal likely uses React Router v5 (`react-router-dom` with `<Switch>` and `<Route>`). If v6, the syntax is `<Routes>` + `<Route element={…} />`.

**Step 1: Add the three imports near the top of the router file**

```typescript
import GustoCompanyPage from '../components/gusto-payroll/pages/GustoCompanyPage';
import GustoContractorsPage from '../components/gusto-payroll/pages/GustoContractorsPage';
import GustoRunPayrollPage from '../components/gusto-payroll/pages/GustoRunPayrollPage';
```

**Step 2: Add three routes inside the existing `<Switch>` (before any catch-all `<Redirect>`)**

React Router v5:
```tsx
<Route path="/payroll/gusto/company" component={GustoCompanyPage} />
<Route path="/payroll/gusto/contractors" component={GustoContractorsPage} />
<Route path="/payroll/gusto/run-payroll" component={GustoRunPayrollPage} />
```

React Router v6:
```tsx
<Route path="/payroll/gusto/company" element={<GustoCompanyPage />} />
<Route path="/payroll/gusto/contractors" element={<GustoContractorsPage />} />
<Route path="/payroll/gusto/run-payroll" element={<GustoRunPayrollPage />} />
```

**Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/app/App.tsx   # or whatever router file you edited
git commit -m "feat(gusto): register /payroll/gusto/* routes in portal router"
```

---

## Task 11: Add Gusto Payroll section to `sections.json`

**Files:**
- Modify: `public/config/sections.json`

**Context:** This JSON file drives the portal's left nav. Existing entries look like `{ "title": "...", "icon": "...", "path": "..." }`. The Gusto Payroll section uses `feature_flag` and `children` — check if those fields are already supported by the nav renderer. If not, the nav component may need a small update (see note below).

**Step 1: Open `public/config/sections.json` and locate the Payroll section**

Find where the existing Payroll entries are grouped and add this object alongside them:

```json
{
  "title": "Gusto Payroll",
  "icon": "PaymentsIcon",
  "feature_flag": "gusto_payroll_enabled",
  "children": [
    { "title": "Company Details", "path": "/payroll/gusto/company" },
    { "title": "Contractors",     "path": "/payroll/gusto/contractors" },
    { "title": "Run Payroll",     "path": "/payroll/gusto/run-payroll" }
  ]
}
```

**Step 2: Check whether the nav renderer already handles `feature_flag` + `children`**

Search portal-web-master:

```bash
grep -r "feature_flag" src/ --include="*.tsx" --include="*.ts" -l
grep -r "children" src/components/shell/ --include="*.tsx" -l
```

**If `feature_flag` is NOT handled:** find the nav item renderer and add:

```typescript
// wherever a nav section is rendered, e.g. Sidebar.tsx
import { useSelector } from 'react-redux';
import { ApplicationStore } from '../../models/store';

// inside the component, before rendering sections:
const featureConfig = useSelector((s: ApplicationStore) => s.featureConfig);
const appData = useSelector((s: ApplicationStore) => s.appData);

// filter sections before rendering:
const visibleSections = sections.filter((section) => {
  if (section.feature_flag && !featureConfig[section.feature_flag]) return false;
  // hide gusto sections when token/uuid are absent
  if (section.feature_flag === 'gusto_payroll_enabled') {
    if (!appData.gusto_token || !appData.gusto_company_uuid) return false;
  }
  return true;
});
```

**If `children` is NOT handled:** add nested rendering in the same component:

```tsx
{section.children ? (
  <List disablePadding>
    {section.children.map((child) => (
      <ListItemButton
        key={child.path}
        component={NavLink}
        to={child.path}
        style={{ paddingLeft: 36 }}
        selected={location.pathname === child.path}
      >
        <ListItemText primary={child.title} />
      </ListItemButton>
    ))}
  </List>
) : (
  /* existing single-item rendering */
)}
```

**Step 3: Commit**

```bash
git add public/config/sections.json
# include any nav component changes
git commit -m "feat(gusto): add Gusto Payroll nav section with feature flag + child routes"
```

---

## Task 12: End-to-end smoke test

No code changes — verification only.

**Step 1: Start the portal dev server**

```bash
npm start
# or
yarn start
```

**Step 2: Verify nav hidden without flag**

With `featureConfig.gusto_payroll_enabled = false` (default), confirm "Gusto Payroll" does not appear in the sidebar.

**Step 3: Enable the flag in dev**

In `src/store/reducers/featureConfig.ts` (or wherever the initial state is), temporarily set `gusto_payroll_enabled: true` for local testing.

Also ensure `state.appData.gusto_token` and `state.appData.gusto_company_uuid` are populated (mock values are fine in dev).

**Step 4: Verify nav appears**

Confirm the "Gusto Payroll" section with three child items is visible in the sidebar.

**Step 5: Verify each page route**

- Visit `/payroll/gusto/company` → `<Loader />` appears briefly, then company details render
- Visit `/payroll/gusto/contractors` → `<Loader />` appears briefly, then contractors render
- Visit `/payroll/gusto/run-payroll` → `<Loader />` appears briefly, then payroll wizard renders

(With real Gusto credentials these will call the live API; with mock token they'll return a 401 which should redirect to login — confirm the redirect works.)

**Step 6: Verify error handling**

With a deliberately bad token, confirm:
- 401/403 → redirects to login page
- Other errors → shows `<Alert severity="error">` above content
- Alert can be dismissed (× button calls `clearError()`)

**Step 7: Revert the temporary flag change**

```bash
git checkout src/store/reducers/featureConfig.ts
```

---

## Files summary

### New files

| File | Task |
|---|---|
| `src/services/apiService/gusto/client.ts` | 1 |
| `src/services/apiService/gusto/company.ts` | 2 |
| `src/services/apiService/gusto/contractors.ts` | 3 |
| `src/services/apiService/gusto/payroll.ts` | 4 |
| `src/components/gusto-payroll/pages/GustoCompanyPage.tsx` | 7 |
| `src/components/gusto-payroll/pages/GustoContractorsPage.tsx` | 8 |
| `src/components/gusto-payroll/pages/GustoRunPayrollPage.tsx` | 9 |

### Modified files

| File | Task |
|---|---|
| `src/store/actions/gustoPayroll.ts` | 5, 6 |
| `src/app/App.tsx` (or router file) | 10 |
| `public/config/sections.json` | 11 |
| Nav sidebar component (if needed) | 11 |

### Untouched

All files under `src/components/gusto-payroll/` except the new `pages/` subfolder.
