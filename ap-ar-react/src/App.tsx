import { useState } from 'react';
import AppShell from './components/shell/AppShell';
import type { ActiveView } from './components/shell/AppShell';
import APARDashboard from './components/overview/APARDashboard';
import APInvoiceList from './components/payables/APInvoiceList';
import ARInvoiceList from './components/receivables/ARInvoiceList';
import { mockAPInvoices, mockARInvoices } from './mock/mockData';
import type { APARState } from './types/invoice.types';

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
    <AppShell
      activeView={activeView}
      onViewChange={setActiveView}
      userRole={state.userRole}
      onRoleChange={(r) => updateState({ userRole: r })}
    >
      {activeView === 'overview' && <APARDashboard state={state} onNavigate={setActiveView} />}
      {activeView === 'payables' && <APInvoiceList state={state} updateState={updateState} />}
      {activeView === 'receivables' && <ARInvoiceList state={state} updateState={updateState} />}
    </AppShell>
  );
}
