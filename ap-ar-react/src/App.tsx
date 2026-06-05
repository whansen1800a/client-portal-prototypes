import React, { useState } from 'react';
import { Box } from '@mui/material';
import AppShell, { ActiveView } from './components/shell/AppShell';
import APARDashboard from './components/overview/APARDashboard';
import { mockAPInvoices, mockARInvoices } from './mock/mockData';
import { APARState } from './types/invoice.types';

const initialState: APARState = {
  userRole: 'approver',
  apInvoices: mockAPInvoices,
  arInvoices: mockARInvoices,
  selectedAPInvoiceId: null,
  selectedARInvoiceId: null,
  apDetailOpen: false,
  arDetailOpen: false,
  arCreateOpen: false,
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [state, setState] = useState<APARState>(initialState);
  const updateState = (partial: Partial<APARState>) => setState(s => ({ ...s, ...partial }));

  return (
    <AppShell activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'overview' && <APARDashboard state={state} onNavigate={setActiveView} />}
      {activeView === 'payables' && <Box sx={{ p: 4 }}>Payables coming soon...</Box>}
      {activeView === 'receivables' && <Box sx={{ p: 4 }}>Receivables coming soon...</Box>}
    </AppShell>
  );
}
