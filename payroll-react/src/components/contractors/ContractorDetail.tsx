import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LinearProgress from '@mui/material/LinearProgress';
import { GustoContractor } from '../../types/gusto';

function getDisplayName(c: GustoContractor) {
  return c.type === 'Business' ? c.business_name ?? '' : `${c.first_name} ${c.last_name}`;
}

interface Props { contractor: GustoContractor; }

export default function ContractorDetail({ contractor }: Props) {
  const name = getDisplayName(contractor);
  const completed = contractor.steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completed / contractor.steps.length) * 100);

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#2DA38D', width: 52, height: 52, fontSize: 18, fontWeight: 700 }}>
          {name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>{name}</Typography>
            <Chip label={contractor.type} size="small" sx={{ bgcolor: '#F3F4F6', fontSize: 11 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">{contractor.email}</Typography>
          <Typography variant="caption" color="text.secondary">
            Started {contractor.start_date} · {contractor.work_state} · {contractor.wage_type} ${contractor.rate.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined">Edit</Button>
          <Button size="small" color="error">Dismiss</Button>
        </Box>
      </Paper>

      <Paper variant="outlined">
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
          <Typography variant="subtitle2" fontWeight={700}>Onboarding Checklist</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
            <Typography variant="caption" color="primary" fontWeight={600}>{progress}%</Typography>
          </Box>
        </Box>
        {contractor.steps.map(step => (
          <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.25, borderBottom: '1px solid rgba(0,0,0,.06)', '&:last-child': { borderBottom: 0 } }}>
            {step.status === 'completed'
              ? <CheckCircleIcon sx={{ color: '#2DA38D', fontSize: 20 }} />
              : <RadioButtonUncheckedIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />}
            <Typography variant="body2" sx={{ flex: 1 }}>{step.title}</Typography>
            <Chip label={step.optional ? 'Optional' : 'Required'} size="small"
              sx={{ bgcolor: step.optional ? '#F3F4F6' : '#EBF3FF', color: step.optional ? '#6B7280' : '#1776B6', fontSize: 11, fontWeight: 600 }} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
