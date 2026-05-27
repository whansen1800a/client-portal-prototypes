// Dashboard page — AI Dashboard style (CurvedBox hero + KPI cards + activity)

function Dashboard({ onNavigate }) {
  return (
    <div className="content">
      <div className="page-header">
        <div className="greeting">Good morning,</div>
        <h1>Maya — you're in great shape this quarter.</h1>
        <div className="sub">Ramirez Consulting LLC · S-Corp · FY 2026</div>
      </div>

      <NextAppointmentCard />

      {/* CurvedBox hero */}
      <div className="curved warm" style={{marginBottom: 24, display:'flex', alignItems:'center', gap:24}}>
        <img src="../../assets/illustrations/advisory.svg" alt="" style={{height: 120, flexShrink:0}} />
        <div style={{flex:1}}>
          <div className="pill" style={{background:'#fff',color:'#E54604',marginBottom:8,fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase'}}>AI Assistant</div>
          <h2 style={{fontSize:22, margin:'0 0 6px', letterSpacing:'-0.01em'}}>You could save ~$3,400 in Q2 with S-Corp distributions.</h2>
          <p style={{margin:'0 0 14px', color:'rgba(18,23,36,.70)', fontSize:14, maxWidth: 560}}>
            Based on your March P&amp;L and projected revenue, shifting $12k to owner distribution before June 15 reduces your SE tax burden.
          </p>
          <div style={{display:'flex', gap:10}}>
            <button className="btn btn-primary">Review with Sarah</button>
            <button className="btn btn-text">See the math →</button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid-4" style={{marginBottom:24}}>
        <KpiCard icon="Bookkeeping.svg" label="Books" value="Up to date" tone="success" detail="Reconciled Apr 18" />
        <KpiCard icon="Bank.svg"        label="Cash on hand" value="$48,210" detail="▲ 12% vs March" />
        <KpiCard icon="Taxes.svg"       label="Est. tax reserve" value="$9,140" detail="Q2 target: $10.8k" />
        <KpiCard icon="Calendar.svg"    label="Next deadline" value="Jun 15" tone="warn" detail="Q2 est. payment" />
      </div>

      {/* Main split */}
      <div className="grid-dash">
        <div className="stack-16">
          <div className="card-s">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{margin:0, fontSize:16}}>Recent transactions</h3>
              <a className="btn btn-text btn-sm" onClick={() => onNavigate('transactions')}>See all →</a>
            </div>
            <TransactionList />
          </div>

          <div className="card-s">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{margin:0, fontSize:16}}>Upcoming deadlines</h3>
              <a className="btn btn-text btn-sm" onClick={() => onNavigate('calendar')}>Calendar →</a>
            </div>
            <DeadlineList />
          </div>
        </div>

        <div className="stack-16">
          <TeamCard />
          <ChecklistCard />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, detail, tone }) {
  const toneColor = tone === 'success' ? '#1F7262' : tone === 'warn' ? '#784E03' : 'rgba(18,23,36,.65)';
  const toneDot   = tone === 'success' ? '#2DA38D' : tone === 'warn' ? '#FFCF7C' : '';
  return (
    <div className="card-s" style={{padding:16}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:'#F6F4F2',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={`../../assets/icons/${icon}`} width="20" height="20" alt="" />
        </div>
        <div className="muted" style={{fontSize:12, fontWeight:500}}>{label}</div>
      </div>
      <div style={{fontSize:24,fontWeight:600,letterSpacing:'-0.01em'}}>{value}</div>
      <div style={{fontSize:12,color:toneColor,marginTop:4,display:'flex',alignItems:'center',gap:6}}>
        {toneDot && <span style={{width:6,height:6,background:toneDot,borderRadius:'50%'}}/>}
        {detail}
      </div>
    </div>
  );
}

const TXNS = [
  { date: 'Apr 18', merchant: 'Stripe payout',   category: 'Revenue',       amount: +4820.00, method: 'Chase ••1142' },
  { date: 'Apr 17', merchant: 'Adobe Creative Cloud', category: 'Software', amount:  -59.99,  method: 'Amex ••3002' },
  { date: 'Apr 17', merchant: 'Southwest Airlines',   category: 'Travel',   amount:  -412.40, method: 'Amex ••3002' },
  { date: 'Apr 16', merchant: 'Client — Patel Labs',  category: 'Revenue',  amount: +2200.00, method: 'Chase ••1142' },
  { date: 'Apr 15', merchant: 'WeWork Midtown',       category: 'Office',   amount:  -650.00, method: 'Chase ••1142' },
];

function TransactionList() {
  return (
    <div>
      {TXNS.map((t, i) => (
        <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'10px 0', borderTop: i ? '1px solid rgba(0,0,0,.06)':'none'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background: t.amount > 0 ? '#DBF6E7' : '#F6F4F2',color: t.amount > 0 ? '#1F7262' : 'rgba(18,23,36,.65)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,flexShrink:0}}>
            {t.amount > 0 ? '↑' : '↓'}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:500,fontSize:14}}>{t.merchant}</div>
            <div className="tiny">{t.category} · {t.method}</div>
          </div>
          <div style={{fontWeight:600, fontFamily:'Menlo, monospace', fontSize:14, color: t.amount > 0 ? '#1F7262' : '#121724'}}>
            {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="tiny" style={{width:56,textAlign:'right'}}>{t.date}</div>
        </div>
      ))}
    </div>
  );
}

const DEADS = [
  { when: 'Jun 15', title: 'Q2 estimated tax', pill: 'warn', text: '58 days · file 1040-ES' },
  { when: 'Jul 31', title: 'Form 941 (Q2)',    pill: 'info', text: 'Payroll tax return' },
  { when: 'Sep 15', title: 'Q3 estimated tax', pill: 'muted', text: '145 days' },
];

function DeadlineList() {
  return (
    <div className="stack-12">
      {DEADS.map((d,i) => (
        <div key={i} style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:52,textAlign:'center',background:'#F6F4F2',border:'1px solid rgba(0,0,0,.06)',borderRadius:8,padding:'6px 4px'}}>
            <div className="tiny" style={{color:'#E54604',fontWeight:700}}>{d.when.split(' ')[0].toUpperCase()}</div>
            <div style={{fontSize:18,fontWeight:600,lineHeight:1}}>{d.when.split(' ')[1]}</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:500,fontSize:14}}>{d.title}</div>
            <div className="tiny">{d.text}</div>
          </div>
          <span className={'pill pill-' + d.pill}>{d.pill === 'warn' ? 'Due soon' : d.pill === 'info' ? 'Scheduled' : 'Upcoming'}</span>
        </div>
      ))}
    </div>
  );
}

function TeamCard() {
  return (
    <div className="card-s">
      <h3 style={{margin:'0 0 14px', fontSize:16}}>Your team</h3>
      <div className="stack-12">
        <TeamRow initials="SM" name="Sarah Miller, CPA" role="Lead advisor" tone="teal" online />
        <TeamRow initials="DK" name="David Kim" role="Bookkeeper" tone="orange" />
        <TeamRow initials="JR" name="Jess Rivera" role="Payroll specialist" tone="slate" />
      </div>
      <div className="divider" />
      <button className="btn btn-secondary" style={{width:'100%'}}>
        <img src="../../assets/icons/Call.svg" width="16" height="16" alt=""/>
        Book a call
      </button>
    </div>
  );
}
function TeamRow({ initials, name, role, tone, online }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div style={{position:'relative'}}>
        <div className={'av md ' + tone}>{initials}</div>
        {online && <span style={{position:'absolute',bottom:0,right:0,width:10,height:10,background:'#2DA38D',border:'2px solid #fff',borderRadius:'50%'}}/>}
      </div>
      <div style={{flex:1}}>
        <div style={{fontWeight:500,fontSize:14}}>{name}</div>
        <div className="tiny">{role}</div>
      </div>
      <div className="icon-btn" style={{width:32,height:32}}>
        <img src="../../assets/icons/Chat.svg" width="18" height="18" alt=""/>
      </div>
    </div>
  );
}

function ChecklistCard() {
  const [items, setItems] = React.useState([
    { id:1, t:'Connect Chase business account', done:true },
    { id:2, t:'Verify 2 uncategorized transactions', done:false, meta:'2 pending' },
    { id:3, t:'Upload W-9 for contractor', done:false, meta:'Due Apr 30' },
    { id:4, t:'Approve Q1 books close', done:false },
  ]);
  const toggle = (id) => setItems(items.map(x => x.id === id ? {...x, done: !x.done} : x));
  return (
    <div className="card-s">
      <h3 style={{margin:'0 0 14px', fontSize:16}}>Your to-do</h3>
      <div className="stack-12">
        {items.map(it => (
          <label key={it.id} style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
            <div onClick={() => toggle(it.id)} style={{width:20,height:20,borderRadius:6,border:'1.5px solid '+(it.done?'#2DA38D':'rgba(0,0,0,.2)'),background:it.done?'#2DA38D':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {it.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,textDecoration:it.done?'line-through':'none',color:it.done?'rgba(18,23,36,.45)':'#121724'}}>{it.t}</div>
              {it.meta && <div className="tiny" style={{marginTop:2}}>{it.meta}</div>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function NextAppointmentCard() {
  const appt = {
    month: 'MAY',
    day: '1',
    time: '2:00 PM ET',
    title: 'Q2 Tax Planning Review',
    advisor: 'Sarah Miller, CPA',
    initials: 'SM',
    type: 'Advisory call',
    daysAway: 9,
  };

  const badge = appt.daysAway === 0
    ? { label: 'Today',    cls: 'pill-warn' }
    : appt.daysAway === 1
    ? { label: 'Tomorrow', cls: 'pill-info' }
    : { label: `In ${appt.daysAway} days`, cls: 'pill-muted' };

  return (
    <div
      className="card-s"
      style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '14px 20px',
        borderLeft: '3px solid #2DA38D',
        cursor: 'default',
      }}
    >
      {/* Date badge */}
      <div style={{
        width: 52,
        textAlign: 'center',
        background: '#F6F4F2',
        border: '1px solid rgba(0,0,0,.06)',
        borderRadius: 8,
        padding: '6px 4px',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#2DA38D', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {appt.month}
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1, color: '#121724' }}>
          {appt.day}
        </div>
      </div>

      {/* Appointment info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#121724' }}>{appt.title}</span>
          <span className="pill pill-info" style={{ fontSize: 11 }}>{appt.type}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(18,23,36,.65)' }}>
          <div className="av teal" style={{ width: 22, height: 22, fontSize: 9, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, background: '#2DA38D', color: '#fff', flexShrink: 0 }}>
            {appt.initials}
          </div>
          {appt.advisor} · {appt.time}
        </div>
      </div>

      {/* Status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span className={'pill ' + badge.cls}>{badge.label}</span>
        <button className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>Join call</button>
        <button className="btn btn-text btn-sm" style={{ cursor: 'pointer' }}>Reschedule</button>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, KpiCard, TransactionList, DeadlineList, TeamCard, ChecklistCard, NextAppointmentCard });
