import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ContractorList from './ContractorList';
import ContractorDetail from './ContractorDetail';
import AddContractorModal from './AddContractorModal';
import { GustoContractor, OnboardingStep, StepStatus } from '../../types/gusto';

function makeDefaultSteps(status: 'onboarding_pending' | 'self_onboarding_started'): OnboardingStep[] {
  return [
    { id: 's1', phase: 'Setup', title: 'Basic details', description: '', status: 'completed' },
    { id: 's2', phase: 'Setup', title: 'Compensation details', description: '', status: status === 'self_onboarding_started' ? 'completed' as StepStatus : 'ready' as StepStatus },
    { id: 's3', phase: 'Setup', title: 'Add an address', description: '', status: status === 'self_onboarding_started' ? 'completed' as StepStatus : 'awaiting' as StepStatus },
    { id: 's4', phase: 'Setup', title: 'Payment details', description: '', status: 'awaiting' },
    { id: 's5', phase: 'Compliance', title: 'Sign documents', description: '', status: 'awaiting', optional: true },
    { id: 's6', phase: 'Compliance', title: 'File new hire report', description: '', status: 'awaiting', optional: true },
  ];
}

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
      steps: makeDefaultSteps(data.onboarding_status as 'onboarding_pending' | 'self_onboarding_started'),
    };
    setContractors(cs => [...cs, newC]);
    setSelectedId(newC.uuid);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(0,0,0,.08)' }}>
        <Typography variant="h5" fontWeight={700}>Contractors</Typography>
        <Typography variant="body2" color="text.secondary">
          {contractors.length} contractor{contractors.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ContractorList contractors={contractors} selectedId={selectedId} onSelect={setSelectedId} onAdd={() => setModalOpen(true)} />
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {selected
            ? <ContractorDetail contractor={selected} />
            : <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 8 }}>
                  Select a contractor to view details
                </Typography>
              </Box>}
        </Box>
      </Box>
      <AddContractorModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </Box>
  );
}
