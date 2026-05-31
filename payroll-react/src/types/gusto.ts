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
