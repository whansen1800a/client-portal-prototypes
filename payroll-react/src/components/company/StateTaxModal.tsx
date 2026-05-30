import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

interface Props { open: boolean; onClose: () => void; }

export default function StateTaxModal({ open, onClose }: Props) {
  const [tab, setTab] = useState(0);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>State Tax Setup</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Oregon (OR)" />
          <Tab label="Texas (TX)" />
        </Tabs>
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Oregon BIN" size="small" fullWidth />
            <TextField label="Withholding Rate %" size="small" fullWidth />
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <TextField label="Texas Taxpayer Number" size="small" fullWidth />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
