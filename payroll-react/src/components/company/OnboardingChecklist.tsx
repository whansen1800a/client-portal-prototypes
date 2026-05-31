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
