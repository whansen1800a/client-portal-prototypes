import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import { GustoContractor } from '../../types/gusto';

const STATUS_CONFIG = {
  onboarding_completed:    { label: 'Onboarded',   bg: '#DBF6E7', color: '#1F7262' },
  self_onboarding_started: { label: 'Invite Sent', bg: '#EBF3FF', color: '#1776B6' },
  onboarding_pending:      { label: 'Incomplete',  bg: '#FEF3C7', color: '#B45309' },
};

function getDisplayName(c: GustoContractor): string {
  return c.type === 'Business' ? (c.business_name ?? '') : `${c.first_name} ${c.last_name}`;
}

function getInitials(c: GustoContractor): string {
  const name = getDisplayName(c);
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

interface Props {
  contractor: GustoContractor;
  selected: boolean;
  onClick: () => void;
}

export default function ContractorRow({ contractor, selected, onClick }: Props) {
  const sc = STATUS_CONFIG[contractor.onboarding_status];
  return (
    <ListItemButton selected={selected} onClick={onClick}
      sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2,
        borderBottom: '1px solid rgba(0,0,0,.06)',
        '&.Mui-selected': { bgcolor: 'rgba(45,163,141,.06)' } }}>
      <Avatar sx={{ bgcolor: '#2DA38D', width: 40, height: 40, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
        {getInitials(contractor)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>{getDisplayName(contractor)}</Typography>
        <Typography variant="caption" color="text.secondary">{contractor.type} · {contractor.wage_type}</Typography>
      </Box>
      <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 11 }} />
    </ListItemButton>
  );
}
