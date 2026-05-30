import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface Props { open: boolean; onClose: () => void; }

export default function BankVerifyModal({ open, onClose }: Props) {
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Verify Bank Account</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the two micro-deposit amounts sent to your account (1–2 business days).
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Deposit 1" size="small" value={d1} onChange={e => setD1(e.target.value)} />
          <TextField label="Deposit 2" size="small" value={d2} onChange={e => setD2(e.target.value)} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose} disabled={!d1 || !d2}>Verify</Button>
      </DialogActions>
    </Dialog>
  );
}
