// Portal shell — Sidebar + Topbar

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: 'Dashboard.svg' },
  { id: 'bookkeeping',  label: 'Bookkeeping',  icon: 'Bookkeeping.svg' },
  { id: 'transactions', label: 'Transactions', icon: 'Transactions.svg' },
  { id: 'taxes',        label: 'Taxes',        icon: 'Taxes.svg' },
  { id: 'tax-plan',     label: 'Tax plan',     icon: 'Tax Plan.svg', badge: 'New' },
  { id: 'payroll',      label: 'Payroll',      icon: 'Payroll.svg' },
  { id: 'documents',    label: 'Documents',    icon: 'Documents.svg' },
  { id: 'calendar',     label: 'Calendar',     icon: 'Calendar.svg' },
];
const SUPPORT_ITEMS = [
  { id: 'messages', label: 'Messages',  icon: 'Messages.svg', count: 3 },
  { id: 'team',     label: 'My team',   icon: 'Financial Team.svg' },
  { id: 'help',     label: 'Help',      icon: 'Help.svg' },
];

function Sidebar({ active, setActive }) {
  const renderItem = (it) => (
    <div
      key={it.id}
      className={'nav-item ' + (active === it.id ? 'active' : '')}
      onClick={() => setActive(it.id)}
    >
      <img src={`../../assets/icons/${it.icon}`} alt="" />
      <span style={{flex:1}}>{it.label}</span>
      {it.badge && <span className="pill pill-info" style={{fontSize:10,padding:'1px 6px'}}>{it.badge}</span>}
      {it.count && <span className="pill pill-success" style={{fontSize:10,padding:'1px 6px',minWidth:18,justifyContent:'center'}}>{it.count}</span>}
    </div>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="../../assets/logo/logo-full.svg" alt="1-800Accountant" />
      </div>
      <nav>
        <div className="nav-section">Workspace</div>
        {NAV_ITEMS.map(renderItem)}
        <div className="nav-section">Support</div>
        {SUPPORT_ITEMS.map(renderItem)}
      </nav>
      <div className="cta">
        <h5>Tax plan ready</h5>
        <p>Your Q2 strategy is ready to review with your advisor.</p>
        <button className="btn btn-primary btn-sm" style={{width:'100%'}}>Review plan</button>
      </div>
    </aside>
  );
}

function Topbar({ user = { name: 'Maya Chen', initials: 'MC' }, onNavigate }) {
  return (
    <div className="topbar">
      <div className="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
        <input placeholder="Search transactions, documents, tasks…" />
        <span className="tiny">⌘K</span>
      </div>
      <div style={{flex:1}} />
      <div className="actions">
        <div className="icon-btn" title="Call" onClick={() => onNavigate && onNavigate('team')}>
          <img src="../../assets/icons/Call.svg" alt="" />
        </div>
        <div className="icon-btn" title="Messages" onClick={() => onNavigate && onNavigate('messages')}>
          <img src="../../assets/icons/Messages.svg" alt="" />
          <span className="badge-dot">3</span>
        </div>
        <div className="icon-btn" title="Notifications">
          <img src="../../assets/icons/Notifications.svg" alt="" />
          <span className="badge-dot">2</span>
        </div>
        <div className="av md orange">{user.initials}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, NAV_ITEMS, SUPPORT_ITEMS });
