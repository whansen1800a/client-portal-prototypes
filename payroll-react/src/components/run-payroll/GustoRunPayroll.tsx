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
