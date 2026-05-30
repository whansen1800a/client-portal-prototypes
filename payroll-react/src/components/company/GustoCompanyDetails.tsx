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
  const [steps] = useState(initialSteps);
  const [modal, setModal] = useState<ModalType>(null);

  function handleAction(stepId: string) {
    const m = MODAL_MAP[stepId];
    if (m) setModal(m);
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Company Details</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete your Gusto payroll setup
      </Typography>
      <CompanyHeader companyName="Riverside Roofing LLC" ein="47-1234567" employeeCount={3} contractorCount={3} />
      <OnboardingChecklist steps={steps} onAction={handleAction} />
      <StateTaxModal open={modal === 'state_tax'} onClose={() => setModal(null)} />
      <BankVerifyModal open={modal === 'bank_verify'} onClose={() => setModal(null)} />
      <SignFormsModal open={modal === 'sign_forms'} onClose={() => setModal(null)} />
    </Box>
  );
}
