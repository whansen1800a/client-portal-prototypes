import { Stack, Chip, Typography, Tooltip } from '@mui/material';
import type { UserRole } from '../../types/invoice.types';

interface Props {
  role: UserRole;
  onChange: (r: UserRole) => void;
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'submitter', label: 'Submitter',  description: 'Can create and submit invoices only' },
  { value: 'approver',  label: 'Approver',   description: 'Can approve invoices (SoD: cannot pay)' },
  { value: 'payer',     label: 'Payer',       description: 'Can schedule payments (SoD: cannot approve)' },
];

export default function RoleSwitcher({ role, onChange }: Props) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>ROLE:</Typography>
      {ROLES.map(r => (
        <Tooltip key={r.value} title={r.description}>
          <Chip
            label={r.label}
            size="small"
            onClick={() => onChange(r.value)}
            sx={{
              height: 24, fontSize: 11, fontWeight: 600,
              bgcolor: role === r.value ? '#121724' : 'transparent',
              color: role === r.value ? '#fff' : 'text.secondary',
              border: '1px solid',
              borderColor: role === r.value ? '#121724' : 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
}
