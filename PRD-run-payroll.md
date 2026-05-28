# PRD: Run Payroll — Client Portal
**Product area:** Payroll  
**Surface:** Client Portal (web)  
**Integration:** Gusto Embedded Payroll API  
**Status:** Ready for engineering  
**Last updated:** 2026-05-28  
**Prototype:** https://whansen1800a.github.io/client-portal-prototypes/payroll-run.html

---

## 1. Overview

This document describes the requirements for the "Run Payroll" feature inside the 1-800Accountant Client Portal. The feature enables business owners to submit a regular payroll directly within the portal via the Gusto Embedded Payroll API — without leaving to a separate Gusto-hosted UI.

The flow is a four-step linear wizard:

| Step | Name | Purpose |
|------|------|---------|
| 1 | Review Pay Period | Confirm the upcoming payroll details before entering data |
| 2 | Update Hours & Compensation | Edit employee hours, overtime, bonuses, and reimbursements |
| 3 | Calculate | Trigger Gusto's tax/benefit calculation engine asynchronously |
| 4 | Review & Submit | Final review of totals, bank debit, and submission |

---

## 2. Background & problem statement

Clients currently have to leave the Client Portal and log into the standalone Gusto portal to run payroll. This creates friction, increases support volume, and weakens portal stickiness. With Gusto Embedded Payroll, we can surface the end-to-end regular payroll run natively inside the portal, keeping the experience within our product.

---

## 3. Goals

- Allow clients to complete a full regular payroll run without leaving the Client Portal.
- Reduce payroll-related support tickets caused by clients navigating two separate systems.
- Provide real-time tax and deduction calculations driven by Gusto's engine.
- Surface a clear submission deadline so clients never miss the Gusto cutoff (3:30 pm PST on the deadline date).

### Non-goals

- **Off-cycle / contractor payrolls.** This PRD covers regular (scheduled) payrolls only.
- **Payroll cancellation or reversal.** Post-submission mutations are out of scope.
- **Employee management.** Adding, editing, or terminating employees is handled in the Employees module.
- **Tax filing.** Gusto handles all tax remittance automatically; no in-portal filing UI is needed.

---

## 4. Users

**Primary:** Business owner / admin — the person who runs payroll and has Gusto company-admin permissions.

**Secondary:** Bookkeeper / accountant (internal 1-800A team member) — may review or assist but does not submit payroll on behalf of the client.

---

## 5. User stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|----------|
| US-1 | Business owner | See the upcoming payroll period and deadline before I start | I can confirm I'm working on the right payroll |
| US-2 | Business owner | Edit employee hours and add bonuses or reimbursements | I can make adjustments before finalizing |
| US-3 | Business owner | See a calculated breakdown of gross pay, taxes, and net pay | I understand exactly what will be deducted and paid out |
| US-4 | Business owner | Submit payroll with a single confirm action | The fund transfer initiates via Gusto |
| US-5 | Business owner | See a clear deadline warning before submitting | I never miss the 3:30 pm PST cutoff |
| US-6 | Business owner | View a per-employee net pay summary after submission | I can confirm who will be paid and how much |

---

## 6. Functional requirements

### 6.1 Navigation entry point

- A "Run Payroll" item appears in the left sidebar under the Payroll section, below Contractors.
- Clicking it navigates to the Run Payroll page at `/payroll/run` (or equivalent route).
- The nav item shows a **deadline warning badge** (orange dot or pill) if the submission deadline for the next unprocessed payroll is within 48 hours.

---

### 6.2 Step 1 — Review pay period

**Purpose:** Fetch the next unprocessed payroll and display details for user confirmation.

**API call:**
```
GET /v1/companies/{company_uuid}/payrolls?processing_statuses=unprocessed
```

**Display (info grid):**
| Field | Source | Example |
|-------|--------|---------|
| Pay period | `pay_period.start_date` – `pay_period.end_date` | May 12 – May 25, 2025 |
| Check date | `check_date` | May 30, 2025 |
| Submission deadline | `payroll_deadline` | May 28, 2025 · 3:30 pm PST |
| Payroll type | `payroll_type` | Regular |
| Employee count | `employee_compensations` array length | 3 employees |

**Employee roster (read-only):**
- List each employee with: name, title, pay type (Salary / Hourly), and estimated regular pay.
- Estimated regular pay = salary / pay periods per year (exempt) or `regular_hours` × rate (non-exempt).

**Deadline warning:**
- If `payroll_deadline` is within 48 hours, display an amber warning banner at the top of the info grid.
- If `payroll_deadline` has passed, block progression and show an error state explaining the payroll cannot be submitted.

**Edge cases:**
- If no unprocessed payroll is returned, show an empty state: "No payroll is scheduled for this period. Your next payroll will appear here when it's ready."
- If multiple unprocessed payrolls are returned, show the one with the earliest `check_date` first; provide a selector for the user to switch between pending payrolls.

---

### 6.3 Step 2 — Update hours & compensation

**Purpose:** Allow edits to employee compensation before calculation.

**API calls:**
```
PUT /v1/companies/{company_uuid}/payrolls/{payroll_uuid}/prepare
```
Called on entry to this step. Returns the payroll object including a `version` field (required for the update call) and `employee_compensations` with current values.

```
PUT /v1/companies/{company_uuid}/payrolls/{payroll_uuid}
```
Called when the user advances to Step 3. Sends updated `employee_compensations`.

**Exempt (salaried) employees:**
| Field | Editable | Notes |
|-------|----------|-------|
| Regular pay | No | Salary-derived, display-only |
| Bonus | Yes | Added to `fixed_compensations` with type `Bonus` |
| Commission | Yes | Added to `fixed_compensations` with type `Commission` |
| Reimbursement | Yes | Added to `fixed_compensations` with type `Reimbursement`; excluded from tax base |

**Non-exempt (hourly) employees:**
| Field | Editable | Notes |
|-------|----------|-------|
| Regular hours | Yes | Max 80 per bi-weekly period; validates > 0 |
| Overtime hours (1.5×) | Yes | Defaults to 0 |
| Double overtime hours (2×) | Yes | Defaults to 0; display only if applicable in employee's work state |
| Bonus | Yes | Fixed compensation |
| Reimbursement | Yes | Fixed compensation; not taxed |

**Live gross estimate:**
- Each employee row displays a running gross estimate updated on every field change.
- Formula: `(reg_hours × rate) + (ot_hours × rate × 1.5) + (dot_hours × rate × 2) + bonus + reimbursement`
- A total estimated gross is shown in the card footer.

**Validation:**
- Regular hours must be a positive number (non-exempt).
- Overtime and double-overtime must be ≥ 0.
- No field can be negative.
- Bonus and reimbursement fields accept two decimal places only.
- If all regular hours for a non-exempt employee are 0, show an inline warning: "This employee has 0 regular hours. Is that correct?"

---

### 6.4 Step 3 — Calculate

**Purpose:** Trigger Gusto's async calculation engine and display the results.

**API call (trigger):**
```
PUT /v1/companies/{company_uuid}/payrolls/{payroll_uuid}/calculate
```
Returns HTTP 202 Accepted immediately. The portal displays a loading state while polling.

**Polling:**
```
GET /v1/companies/{company_uuid}/payrolls/{payroll_uuid}?include=taxes,benefits,deductions
```
Poll every 2 seconds. Calculation is complete when `calculated_at` is populated and `submission_blockers` is empty.

**Loading state:**
- Show a spinner with the message "Calculating payroll — Gusto is applying taxes, benefits, and deductions."
- Do not allow the user to navigate away during calculation.
- Timeout after 30 seconds; show an error with a "Try again" option.

**Results display — per-employee table:**
| Column | Value |
|--------|-------|
| Employee name | — |
| Gross pay | Sum of all compensations |
| Net pay | Gross minus all employee withholdings |

**Results display — breakdown panels (4 panels in 2×2 grid):**

1. **Compensation breakdown** — Regular wages / Overtime / Bonuses / Reimbursements → Total gross
2. **Employee tax withholding** — Federal income tax / Social Security (6.2%) / Medicare (1.45%) / State income tax(es) → Total withheld
3. **Net pay to employees** — Per-employee net → Total net
4. **Employer payroll taxes** — Employer SS / Employer Medicare / FUTA / State SUI → Total employer taxes

**Submission blockers:**
- If `submission_blockers` is non-empty after calculation, display each blocker as an inline error and prevent progression to Step 4 until resolved.
- Common blockers to handle: missing bank account, missing state tax registration, employee missing SSN.

---

### 6.5 Step 4 — Review & submit

**Purpose:** Final review before the irreversible submit action.

**Display:**
- **Bank debit callout** (prominent) — total debit amount, bank account name/last-4, debit date.
- **Deadline warning** (amber) — "Payroll cannot be canceled or reversed after {deadline}."
- **Payroll summary table** — pay period, check date, total gross, total withheld, net pay, employer taxes, total bank debit.
- **Per-employee payment list** — name, gross, net.

**Submit action:**
- CTA button label: "Submit payroll" (orange, primary).
- On click: show a confirmation dialog — "Once submitted, this payroll will be processed and funds will be debited. This action cannot be undone."
- On confirm:

```
PUT /v1/companies/{company_uuid}/payrolls/{payroll_uuid}/submit
```
Returns HTTP 202. Poll `processed` field; when `true`, show the success screen.

**Success screen:**
- Confirmation message with check date and total bank debit.
- Per-employee net pay summary.
- Two secondary actions: "Run another payroll" (navigates back to Step 1 / fetches next unprocessed payroll) and "View payroll receipt" (links to receipt).

---

### 6.6 Payroll receipt & paystubs

These are accessible after submission from the success screen and from payroll history.

```
GET /v1/payrolls/{payroll_uuid}/receipt
GET /v1/payrolls/{payroll_id}/employees/{employee_id}/pay_stub
```

- "View payroll receipt" opens a PDF receipt in a new tab.
- Individual paystubs are accessible from a payroll history detail view (separate feature, not in scope for this release).

---

## 7. UI/UX requirements

### Layout & navigation
- Full portal shell: sidebar + topbar, consistent with Company Details and Contractors pages.
- "Run Payroll" is the fourth child item under the Payroll section in the sidebar.
- Sidebar shows a deadline warning indicator when a payroll deadline is within 48 hours.
- The wizard step bar is fixed below the page titlebar and above the scrollable content area.
- A sticky footer shows "Step N of 4", a Back button, and the primary forward/submit action.

### Step indicator (wizard bar)
- Four steps shown horizontally: Review Period → Update Hours → Calculate → Review & Submit.
- Completed steps show a check icon and teal color.
- Active step shows a filled teal circle with white numeral.
- Future steps are muted.
- Connector lines between steps transition from gray to teal as steps are completed.

### Deadline warning
- Appears in the page titlebar on all steps.
- Amber background (`#FFF7ED`), amber border, amber text.
- Format: "Deadline {date} · {time} PST"
- If deadline is within 24 hours, escalate to red.

### Back navigation
- Back button is always visible on steps 2–4.
- Going back does not lose entered data (state is preserved in memory for the session).
- Going back from Step 3 (after calculate) returns to Step 2 without re-triggering the prepare call.

### Accessibility
- All form inputs have visible labels.
- Error messages are associated with their fields via `aria-describedby`.
- Wizard step bar uses `role="navigation"` and `aria-label="Payroll steps"`.
- The submit confirmation dialog traps focus and is dismissible via Escape.
- Color is never the sole indicator of state (icons accompany all status changes).

---

## 8. Error handling

| Scenario | Handling |
|----------|----------|
| No unprocessed payroll found | Empty state with explanation; no wizard shown |
| Deadline already passed | Block wizard entry; show error banner with support contact |
| Prepare call fails | Inline error on Step 2 entry; retry button |
| Update call fails (version conflict) | Re-fetch current payroll and re-populate form; notify user |
| Calculate call fails | Error on Step 3 with "Try again" button |
| Calculate times out (>30s) | Timeout message; offer to resume by polling manually |
| Submission blockers present | Block Step 4 entry; list each blocker with resolution guidance |
| Submit call fails | Error banner on Step 4; do not navigate away; allow retry |
| Network offline | Global banner: "You're offline. Reconnect to continue." Disable form submission. |

---

## 9. Data model (frontend state)

```typescript
interface PayrollSession {
  payroll_uuid: string;
  company_uuid: string;
  version: string;                      // Required for PUT /payrolls/{uuid}
  pay_period: { start_date: string; end_date: string };
  check_date: string;
  payroll_deadline: string;
  employee_compensations: EmployeeCompensation[];
  calculated_at: string | null;
  submission_blockers: SubmissionBlocker[];
  processed: boolean;
}

interface EmployeeCompensation {
  employee_uuid: string;
  name: string;
  flsa_status: 'exempt' | 'nonexempt';
  hourly_rate?: number;
  regular_hours?: number;
  overtime_hours?: number;
  double_overtime_hours?: number;
  fixed_compensations: FixedCompensation[];  // Bonus, Commission, Reimbursement
}

interface FixedCompensation {
  name: 'Bonus' | 'Commission' | 'Reimbursement';
  amount: number;
  job_uuid: string;
}
```

---

## 10. Non-functional requirements

| Requirement | Target |
|-------------|--------|
| Step transitions | < 300ms (client-side only) |
| Prepare API call | < 2s p95 |
| Calculate polling resolution | ≤ 10s for typical payrolls (3–10 employees) |
| Submit API call | < 5s p95 to receive 202 |
| Accessibility | WCAG 2.1 AA |
| Mobile | Responsive down to 768px (tablet); payroll is a desktop-primary task |
| Session persistence | Wizard state survives page refresh via sessionStorage |

---

## 11. Gusto API reference summary

| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch upcoming payroll | GET | `/v1/companies/{uuid}/payrolls?processing_statuses=unprocessed` |
| Prepare for editing | PUT | `/v1/companies/{uuid}/payrolls/{uuid}/prepare` |
| Save compensation edits | PUT | `/v1/companies/{uuid}/payrolls/{uuid}` |
| Trigger calculation | PUT | `/v1/companies/{uuid}/payrolls/{uuid}/calculate` |
| Poll calculation status | GET | `/v1/companies/{uuid}/payrolls/{uuid}?include=taxes,benefits,deductions` |
| Submit payroll | PUT | `/v1/companies/{uuid}/payrolls/{uuid}/submit` |
| Fetch receipt | GET | `/v1/payrolls/{uuid}/receipt` |
| Fetch employee paystub | GET | `/v1/payrolls/{uuid}/employees/{employee_uuid}/pay_stub` |

Full documentation: https://docs.gusto.com/embedded-payroll/docs/complete-a-regular-payroll

**Important notes for engineering:**
- `calculate` and `submit` both return HTTP 202. Do not treat a 202 as "done" — poll until `calculated_at` is set (calculate) or `processed: true` (submit).
- The `version` field returned by `prepare` must be passed back on every `PUT /payrolls/{uuid}` call. Stale versions return a 409 conflict.
- `employee_compensations` arrays sent to `PUT /payrolls/{uuid}` must include all employees even if unchanged, or Gusto will zero out missing employees.
- Payroll cannot be submitted after the `payroll_deadline`. The portal should surface this clearly and block the submit button server-side.

---

## 12. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| OQ-1 | Should the portal support multiple simultaneous unprocessed payrolls (e.g., off-cycle + regular)? | Product | Open |
| OQ-2 | Is there a Gusto webhook we can use instead of polling for calculate/submit completion? | Engineering | Open |
| OQ-3 | Do we need to support direct check payroll (in addition to direct deposit)? | Product | Open |
| OQ-4 | What happens if an employee is terminated mid-period — does Gusto handle prorating? | Engineering | Open |
| OQ-5 | Should 1-800A accountants be able to view payroll run history from the admin side? | Product | Open |
| OQ-6 | Is session persistence (sessionStorage) sufficient, or do we need server-side draft saving for long-lived wizard sessions? | Engineering | Open |

---

## 13. Appendix

### Prototype
Interactive prototype built with React + Gusto API mock data:  
https://whansen1800a.github.io/client-portal-prototypes/payroll-run.html

Source: `payroll-run.html` in the `client-portal-prototypes` GitHub repo.

### Related portal pages (same repo)
| Page | URL |
|------|-----|
| Portal demo index | `/index.html` |
| Company Details (onboarding) | `/payroll-company.html` |
| Contractors | `/payroll-contractors.html` |

### Gusto Embedded Payroll docs
- Complete a regular payroll: https://docs.gusto.com/embedded-payroll/docs/complete-a-regular-payroll
- Payroll object reference: https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-payrolls
