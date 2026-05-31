import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { GustoContractor } from '../../types/gusto';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

interface FormData {
  type: 'Individual' | 'Business';
  onboarding_method: 'manual' | 'invite';
  first_name: string; last_name: string; business_name: string;
  email: string; start_date: string; work_state: string;
  wage_type: 'Fixed' | 'Hourly'; rate: string;
}

const INIT: FormData = {
  type: 'Individual', onboarding_method: 'manual',
  first_name: '', last_name: '', business_name: '',
  email: '', start_date: '', work_state: '',
  wage_type: 'Fixed', rate: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (c: Omit<GustoContractor, 'uuid' | 'steps'>) => void;
}

function StepIndicator({ step }: { step: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      {[1, 2, 3, 4].map(n => (
        <Box key={n} sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600,
          bgcolor: n === step ? '#2DA38D' : n < step ? '#DBF6E7' : '#F3F4F6',
          color: n === step ? '#fff' : n < step ? '#1F7262' : '#6B7280' }}>
          {n}
        </Box>
      ))}
    </Box>
  );
}

export default function AddContractorModal({ open, onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const set = (k: keyof FormData) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleSave() {
    onSave({
      type: form.type,
      onboarding_status: form.onboarding_method === 'invite' ? 'self_onboarding_started' : 'onboarding_pending',
      first_name: form.first_name || undefined,
      last_name: form.last_name || undefined,
      business_name: form.business_name || undefined,
      email: form.email,
      start_date: form.start_date,
      work_state: form.work_state,
      wage_type: form.wage_type,
      rate: parseFloat(form.rate) || 0,
    });
    setStep(1);
    setForm(INIT);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Contractor</DialogTitle>
      <DialogContent>
        <StepIndicator step={step} />
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">Contractor type</Typography>
            <ToggleButtonGroup exclusive value={form.type} onChange={(_, v) => v && set('type')(v)} fullWidth>
              <ToggleButton value="Individual">Individual</ToggleButton>
              <ToggleButton value="Business">Business</ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="subtitle2">Onboarding method</Typography>
            <ToggleButtonGroup exclusive value={form.onboarding_method} onChange={(_, v) => v && set('onboarding_method')(v)} fullWidth>
              <ToggleButton value="manual">I'll enter info</ToggleButton>
              <ToggleButton value="invite">Send invite</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
        {step === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {form.type === 'Individual' ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="First name" size="small" fullWidth value={form.first_name} onChange={e => set('first_name')(e.target.value)} />
                <TextField label="Last name" size="small" fullWidth value={form.last_name} onChange={e => set('last_name')(e.target.value)} />
              </Box>
            ) : (
              <TextField label="Business name" size="small" fullWidth value={form.business_name} onChange={e => set('business_name')(e.target.value)} />
            )}
            <TextField label="Email" size="small" fullWidth type="email" value={form.email} onChange={e => set('email')(e.target.value)} />
            <TextField label="Start date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={e => set('start_date')(e.target.value)} />
            <TextField select label="Work state" size="small" fullWidth value={form.work_state} onChange={e => set('work_state')(e.target.value)}>
              {US_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Box>
        )}
        {step === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ToggleButtonGroup exclusive value={form.wage_type} onChange={(_, v) => v && set('wage_type')(v)} fullWidth>
              <ToggleButton value="Fixed">Fixed</ToggleButton>
              <ToggleButton value="Hourly">Hourly</ToggleButton>
            </ToggleButtonGroup>
            <TextField label={`Rate (${form.wage_type === 'Hourly' ? 'per hour' : 'per payment'})`} size="small" fullWidth type="number" value={form.rate} onChange={e => set('rate')(e.target.value)}
              InputProps={{ startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography> }} />
          </Box>
        )}
        {step === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {([
              ['Type', form.type],
              ['Name', form.type === 'Business' ? form.business_name : `${form.first_name} ${form.last_name}`],
              ['Email', form.email],
              ['Start date', form.start_date],
              ['Work state', form.work_state],
              ['Compensation', `$${form.rate} ${form.wage_type}`],
            ] as [string, string][]).map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={500}>{value}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step > 1 && <Button onClick={() => setStep(s => s - 1)}>Back</Button>}
        {step < 4
          ? <Button variant="contained" onClick={() => setStep(s => s + 1)}>Next</Button>
          : <Button variant="contained" color="secondary" onClick={handleSave}>Add Contractor</Button>}
      </DialogActions>
    </Dialog>
  );
}
