import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import BlockIcon from '@mui/icons-material/Block';
import { CompanyOnboardingStep } from '../../types/gusto';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: '#DBF6E7', text: '#1F7262', label: 'Complete' },
  ready:     { bg: '#EBF3FF', text: '#1776B6', label: 'Ready' },
  awaiting:  { bg: '#F3F4F6', text: '#6B7280', label: 'Awaiting' },
  blocked:   { bg: '#FEE2E2', text: '#DC2626', label: 'Blocked' },
};

interface Props {
  step: CompanyOnboardingStep;
  onAction?: (stepId: string) => void;
}

export default function StepRow({ step, onAction }: Props) {
  const colors = STATUS_COLORS[step.status];
  const Icon =
    step.status === 'completed' ? CheckCircleIcon :
    step.status === 'blocked'   ? BlockIcon :
    RadioButtonUncheckedIcon;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2,
      borderBottom: '1px solid rgba(0,0,0,.06)', '&:last-child': { borderBottom: 0 } }}>
      <Icon sx={{ color: step.status === 'completed' ? '#2DA38D' : step.status === 'blocked' ? '#DC2626' : '#9CA3AF', fontSize: 22, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={500}>{step.title}</Typography>
        <Typography variant="caption" color="text.secondary">{step.description}</Typography>
      </Box>
      <Chip label={colors.label} size="small"
        sx={{ bgcolor: colors.bg, color: colors.text, fontWeight: 600, fontSize: 11 }} />
      {step.action && step.status !== 'completed' && step.status !== 'blocked' && (
        <Button size="small" variant="outlined" color="primary"
          onClick={() => onAction?.(step.id)}
          sx={{ minWidth: 64, fontSize: 12 }}>
          {step.action}
        </Button>
      )}
    </Box>
  );
}
