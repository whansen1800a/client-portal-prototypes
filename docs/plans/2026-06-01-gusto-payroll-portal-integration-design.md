# Design: Gusto Payroll Portal Integration

**Date:** 2026-06-01
**Status:** Approved — ready for implementation
**Scope:** Wire existing `gusto-payroll` components into the portal with real Gusto API calls, feature-flagged navigation, and a typed service layer

---

## What we're building

The `gusto-payroll` React components are fully built but run on mock data. This integration:

1. Adds a typed **Gusto API service layer** (`src/services/apiService/gusto/`) that calls Gusto's Embedded Payroll API directly
2. Replaces the stub `setTimeout` bodies in the existing Redux thunks with real service calls
3. Adds a **feature-flagged "Gusto Payroll" nav section** with three routes
4. Adds **three portal page components** that handle loading/error states and seed Redux on mount

All three flows are in scope: **Company Details**, **Contractors**, **Run Payroll**.

---

## Architecture

```
Portal nav (feature-flagged: gusto_payroll_enabled)
  └── Gusto Payroll section
        ├── /payroll/gusto/company
        ├── /payroll/gusto/contractors
        └── /payroll/gusto/run-payroll

Page components (new)
  └── src/components/gusto-payroll/pages/
        ├── GustoCompanyPage.tsx
        ├── GustoContractorsPage.tsx
        └── GustoRunPayrollPage.tsx

Redux thunks (update existing stubs in store/actions/gustoPayroll.ts)
  └── call Gusto API service functions

Gusto API service layer (new)
  └── src/services/apiService/gusto/
        ├── client.ts       # base fetch + token injection + error handling
        ├── payroll.ts      # payroll endpoints
        ├── contractors.ts  # contractor endpoints
        └── company.ts      # onboarding/company endpoints

Token + company UUID
  └── pulled from state.appData.gusto_token + state.appData.gusto_company_uuid
      (pre-provisioned server-side — no OAuth flow in the portal UI)
```

The existing components in `src/components/gusto-payroll/` are **unchanged** — only the data flowing into them changes from mock → real.

---

## Service Layer

### `client.ts` — base fetch wrapper

```typescript
// Reads gustoToken + gustoCompanyUuid from portal Redux store
// Adds Authorization: Bearer {token} header to every request
// Throws typed GustoApiError on non-2xx responses
// GustoApiError shape: { type: string; message: string; status: number }

export async function gustoFetch<T>(path: string, options?: RequestInit): Promise<T>
```

Base URL: `https://api.gusto.com`

### `payroll.ts`

| Function | Method + Path |
|---|---|
| `getUpcomingPayroll(companyUuid)` | `GET /v1/companies/{uuid}/payrolls?processing_statuses=unprocessed` |
| `updatePayroll(companyUuid, payrollUuid, payload)` | `PUT /v1/companies/{uuid}/payrolls/{uuid}` |
| `calculatePayroll(companyUuid, payrollUuid)` | `PUT /v1/companies/{uuid}/payrolls/{uuid}/calculate` |
| `submitPayroll(companyUuid, payrollUuid)` | `PUT /v1/companies/{uuid}/payrolls/{uuid}/submit` |

### `contractors.ts`

| Function | Method + Path |
|---|---|
| `getContractors(companyUuid)` | `GET /v1/companies/{uuid}/contractors` |
| `createContractor(companyUuid, data)` | `POST /v1/companies/{uuid}/contractors` |

### `company.ts`

| Function | Method + Path |
|---|---|
| `getOnboardingStatus(companyUuid)` | `GET /v1/companies/{uuid}/onboarding_status` |

All functions return typed Promises — no `any`.

---

## Feature Flag + Navigation

**Flag:** `state.featureConfig.gusto_payroll_enabled: boolean`
- Set server-side per business, `false` by default
- Nav section hidden entirely when `false` or when `gusto_token`/`gusto_company_uuid` are absent from `appData`

**`sections.json` addition:**

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

**Route registration** — three new `<Route>` entries added to the portal's main router, each rendering the corresponding page component.

---

## Page Components

Three new components in `src/components/gusto-payroll/pages/`:

### `GustoCompanyPage.tsx`
- On mount: dispatches `fetchOnboardingStatus()`
- While loading: renders portal `<Loader />`
- On error: renders dismissible `<Alert severity="error">` above content
- On success: renders `<GustoCompanyDetails initialSteps={onboardingSteps} />`

### `GustoContractorsPage.tsx`
- On mount: dispatches `fetchContractors()`
- Same loading/error pattern
- On success: renders `<GustoContractors initialContractors={contractors} />`

### `GustoRunPayrollPage.tsx`
- On mount: dispatches `fetchUpcomingPayroll()`
- Same loading/error pattern
- On success: renders `<GustoRunPayroll initialPayroll={currentPayroll} />`
- Additional thunk needed: `fetchOnboardingStatus()` added to `company.ts` actions

---

## Data Flow

**Token acquisition:**
```typescript
// In gustoFetch client.ts — reads from Redux store directly
const { gusto_token, gusto_company_uuid } = store.getState().appData;
```
If either is missing → do not render page, hide nav section.

**Standard per-page flow:**
```
Page mounts
  → dispatch(fetchX())
    → dispatch(setGustoLoading(true))
    → await gustoFetch(endpoint)
      → SUCCESS: dispatch(setX(data)) → dispatch(setGustoLoading(false))
      → FAILURE: dispatch(setGustoError(message)) → dispatch(setGustoLoading(false))
```

**Async operation specifics:**

| Operation | Strategy |
|---|---|
| Contractor create | Pessimistic — wait for API response, then add to list |
| Payroll calculate | Poll `calculated_at` field every 3s, timeout after 60s with error |
| Payroll submit | Pessimistic — show success screen only on confirmed 200 response |
| 401/403 response | Redirect to portal login (token expired/revoked) |

---

## Error Handling

Three tiers:

1. **`loading: true`** → portal `<Loader />` centered in the content area
2. **`error: string`** → `<Alert severity="error">` above page content, dismissible (calls `clearError()`)
3. **401/403 from Gusto** → redirect to portal login page

---

## Redux Thunk Updates

Existing thunks in `src/store/actions/gustoPayroll.ts` have stub bodies with comments pointing to the correct Gusto endpoints. Replace each stub with a real service call:

| Thunk | Current | Updated |
|---|---|---|
| `fetchUpcomingPayroll` | Returns hardcoded mock payroll | Calls `getUpcomingPayroll(companyUuid)` |
| `calculatePayroll` | `setTimeout(2000)` | Calls `calculatePayroll()`, polls `calculated_at` every 3s |
| `submitPayroll` | `setTimeout(1000)` | Calls `submitPayroll()`, confirms 200 |
| `fetchContractors` | `dispatch(setContractors([]))` | Calls `getContractors(companyUuid)` |

New thunk needed: `fetchOnboardingStatus()` — calls `getOnboardingStatus(companyUuid)`, dispatches `setCompanySteps()`.

---

## Files Changed / Created

### New files
```
src/services/apiService/gusto/client.ts
src/services/apiService/gusto/payroll.ts
src/services/apiService/gusto/contractors.ts
src/services/apiService/gusto/company.ts
src/components/gusto-payroll/pages/GustoCompanyPage.tsx
src/components/gusto-payroll/pages/GustoContractorsPage.tsx
src/components/gusto-payroll/pages/GustoRunPayrollPage.tsx
```

### Modified files
```
src/store/actions/gustoPayroll.ts   # Replace stubs with real service calls; add fetchOnboardingStatus
src/app/App.tsx (or router file)    # Add three new <Route> entries
public/config/sections.json         # Add Gusto Payroll nav section
```

### Unchanged
```
src/components/gusto-payroll/**     # All existing components untouched
src/store/reducers/gustoPayroll.ts  # No changes needed
src/models/store.ts                 # Already has GustoPayrollState
```

---

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| API call location | Frontend → Gusto API directly | Token is pre-provisioned; no proxy needed |
| Token source | `state.appData.gusto_token` | Consistent with how portal reads other config |
| Service architecture | Dedicated `services/apiService/gusto/` | Mirrors existing `services/apiService/payroll/`; separates API shape from Redux logic |
| Calculate polling | Poll `calculated_at` every 3s, 60s timeout | Gusto calculate is async; matches Gusto's recommended pattern |
| Feature gating | `featureConfig.gusto_payroll_enabled` | Uses existing portal flag infrastructure |
| Component changes | None | Components already accept props; only data source changes |
