import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import AddIcon from '@mui/icons-material/Add';
import ContractorRow from './ContractorRow';
import { GustoContractor } from '../../types/gusto';

interface Props {
  contractors: GustoContractor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export default function ContractorList({ contractors, selectedId, onSelect, onAdd }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid rgba(0,0,0,.08)', width: 320, flexShrink: 0 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
        <Button variant="contained" startIcon={<AddIcon />} fullWidth onClick={onAdd}>
          Add Contractor
        </Button>
      </Box>
      <List disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
        {contractors.map(c => (
          <ContractorRow key={c.uuid} contractor={c} selected={selectedId === c.uuid} onClick={() => onSelect(c.uuid)} />
        ))}
      </List>
    </Box>
  );
}
