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
