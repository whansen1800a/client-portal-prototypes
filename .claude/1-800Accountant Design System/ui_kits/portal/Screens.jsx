// Transactions, Documents, Messages, and a Bookkeeping page.

// ---------- Transactions ----------
const FULL_TXNS = [
  { date: 'Apr 18', merchant: 'Stripe payout', category: 'Revenue',  amount:  4820.00, method: 'Chase ••1142', status: 'cleared' },
  { date: 'Apr 17', merchant: 'Adobe Creative Cloud', category: 'Software', amount: -59.99, method: 'Amex ••3002', status: 'cleared' },
  { date: 'Apr 17', merchant: 'Southwest Airlines', category: 'Travel', amount: -412.40, method: 'Amex ••3002', status: 'review' },
  { date: 'Apr 17', merchant: 'Uber · SFO → HQ', category: 'Travel', amount: -38.50, method: 'Amex ••3002', status: 'cleared' },
  { date: 'Apr 16', merchant: 'Client — Patel Labs', category: 'Revenue', amount: 2200.00, method: 'Chase ••1142', status: 'cleared' },
  { date: 'Apr 16', merchant: 'Gusto — Payroll run', category: 'Payroll', amount: -8420.15, method: 'Chase ••1142', status: 'cleared' },
  { date: 'Apr 15', merchant: 'WeWork Midtown', category: 'Office', amount: -650.00, method: 'Chase ••1142', status: 'cleared' },
  { date: 'Apr 15', merchant: 'Uncategorized · ACH debit', category: '—', amount: -240.00, method: 'Chase ••1142', status: 'review' },
  { date: 'Apr 14', merchant: 'Apple.com', category: 'Equipment', amount: -1899.00, method: 'Amex ••3002', status: 'cleared' },
  { date: 'Apr 14', merchant: 'Google Workspace', category: 'Software', amount: -18.00, method: 'Amex ••3002', status: 'cleared' },
];

function Transactions() {
  const [filter, setFilter] = React.useState('all');
  const [q, setQ] = React.useState('');
  const rows = FULL_TXNS.filter(t => {
    if (filter === 'review' && t.status !== 'review') return false;
    if (filter === 'income' && t.amount <= 0) return false;
    if (filter === 'expenses' && t.amount > 0) return false;
    if (q && !t.merchant.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="content">
      <div className="page-header" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
        <div>
          <h1 style={{marginBottom:2}}>Transactions</h1>
          <div className="sub">April 2026 · 2 accounts linked</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-secondary">
            <img src="../../assets/icons/Download.svg" width="16" height="16" alt=""/>Export
          </button>
          <button className="btn btn-primary">
            <img src="../../assets/icons/Bank.svg" width="16" height="16" alt="" style={{filter:'brightness(0) invert(1)'}}/>Connect account
          </button>
        </div>
      </div>

      <div className="tabs">
        {['all','review','income','expenses'].map(id => (
          <div key={id} className={'tab ' + (filter===id?'active':'')} onClick={()=>setFilter(id)}>
            {id === 'all' ? 'All' : id === 'review' ? 'Needs review · 2' : id[0].toUpperCase()+id.slice(1)}
          </div>
        ))}
      </div>

      <div className="card-s" style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.06)'}}>
          <div className="search" style={{flex:'0 1 320px',background:'#F5F5F9'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search transactions" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <div style={{flex:1}}/>
          <div className="tiny">{rows.length} of {FULL_TXNS.length}</div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#F7F7F7'}}>
              {['Date','Merchant','Category','Account','Amount','Status'].map(h => (
                <th key={h} style={{textAlign:'left',padding:'10px 20px',fontSize:11,fontWeight:600,color:'rgba(18,23,36,.65)',letterSpacing:'.05em',textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t,i) => (
              <tr key={i} style={{borderTop:'1px solid rgba(0,0,0,.04)'}}>
                <td style={{padding:'14px 20px', fontSize:13, color:'rgba(18,23,36,.65)'}}>{t.date}</td>
                <td style={{padding:'14px 20px', fontSize:14, fontWeight:500}}>{t.merchant}</td>
                <td style={{padding:'14px 20px'}}>
                  {t.category === '—' ? <span className="pill pill-warn">Uncategorized</span> : <span className="pill pill-muted">{t.category}</span>}
                </td>
                <td style={{padding:'14px 20px', fontSize:13, color:'rgba(18,23,36,.65)'}}>{t.method}</td>
                <td style={{padding:'14px 20px', fontFamily:'Menlo,monospace', fontSize:13, fontWeight:600, textAlign:'right', color: t.amount>0?'#1F7262':'#121724'}}>
                  {t.amount>0?'+':''}${Math.abs(t.amount).toLocaleString('en-US',{minimumFractionDigits:2})}
                </td>
                <td style={{padding:'14px 20px'}}>
                  {t.status==='review'
                    ? <span className="pill pill-warn">Review</span>
                    : <span className="pill pill-success">Cleared</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Documents ----------
const DOCS = [
  { name: '2025 Form 1120-S.pdf', cat: 'Tax returns', size: '412 KB', date: 'Mar 11, 2026', by: 'Sarah Miller' },
  { name: 'March P&L.pdf', cat: 'Reports', size: '86 KB', date: 'Apr 02, 2026', by: 'David Kim' },
  { name: 'W-9 — Patel Labs.pdf', cat: 'Contractors', size: '54 KB', date: 'Apr 10, 2026', by: 'You' },
  { name: 'Chase bank statement — March.pdf', cat: 'Bank statements', size: '220 KB', date: 'Apr 01, 2026', by: 'Auto-import' },
  { name: 'Receipt — Apple Store.jpg', cat: 'Receipts', size: '1.2 MB', date: 'Apr 14, 2026', by: 'You' },
];

function Documents() {
  return (
    <div className="content">
      <div className="page-header" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
        <div><h1 style={{marginBottom:2}}>Documents</h1><div className="sub">5 folders · 38 files · encrypted at rest</div></div>
        <button className="btn btn-primary">
          <img src="../../assets/icons/Upload-Cloud.svg" width="16" height="16" alt="" style={{filter:'brightness(0) invert(1)'}}/>Upload
        </button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16,marginBottom:24}}>
        {[
          {name:'Tax returns', count:8, color:'#FFF6E5', fg:'#E54604'},
          {name:'Reports', count:12, color:'#DBF6E7', fg:'#1F7262'},
          {name:'Bank statements', count:9, color:'#EBF3FF', fg:'#1776B6'},
          {name:'Receipts', count:6, color:'#F6F4F2', fg:'#3F5261'},
          {name:'Contractors', count:3, color:'#FFF0F0', fg:'#C71D1D'},
        ].map(f => (
          <div key={f.name} className="card-s" style={{padding:16,cursor:'pointer'}}>
            <div style={{width:40,height:40,borderRadius:10,background:f.color,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
              <img src="../../assets/icons/Documents.svg" width="22" height="22" alt="" style={{filter: f.fg==='#E54604' ? 'invert(33%) sepia(82%) saturate(2828%) hue-rotate(4deg)' : 'none', opacity: .85}}/>
            </div>
            <div style={{fontWeight:600,fontSize:14}}>{f.name}</div>
            <div className="tiny">{f.count} files</div>
          </div>
        ))}
      </div>

      <div className="card-s" style={{padding:0}}>
        <div className="card-s head" style={{boxShadow:'none',padding:'16px 20px'}}>
          <h3 style={{margin:0,fontSize:16}}>Recent</h3>
          <a className="btn btn-text btn-sm">View all →</a>
        </div>
        {DOCS.map((d,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 20px',borderTop:'1px solid rgba(0,0,0,.05)'}}>
            <div style={{width:36,height:40,background:'#F6F4F2',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'rgba(18,23,36,.65)',flexShrink:0}}>
              {d.name.split('.').pop().toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:500,fontSize:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{d.name}</div>
              <div className="tiny">{d.cat} · {d.size} · by {d.by}</div>
            </div>
            <div className="tiny">{d.date}</div>
            <div className="icon-btn" style={{width:32,height:32}}>
              <img src="../../assets/icons/Download.svg" width="18" height="18" alt=""/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Messages ----------
const THREADS = [
  { id:1, who:'Sarah Miller', role:'Advisor', tone:'teal', init:'SM', preview:'Great — I pencilled us in for Friday at 10am PT.', time:'9:02am', unread:0, active:true },
  { id:2, who:'David Kim', role:'Bookkeeper', tone:'orange', init:'DK', preview:'Two transactions need your category confirmation.', time:'Yesterday', unread:2 },
  { id:3, who:'Jess Rivera', role:'Payroll', tone:'slate', init:'JR', preview:'April payroll is approved and scheduled for 4/30.', time:'Apr 16', unread:0 },
  { id:4, who:'1-800Accountant Team', role:'Support', tone:'teal', init:'1A', preview:'Your Q1 books close is ready for review.', time:'Apr 14', unread:1 },
];

function Messages() {
  const [activeId, setActiveId] = React.useState(1);
  const active = THREADS.find(t => t.id === activeId);
  const [input, setInput] = React.useState('');
  const [msgs, setMsgs] = React.useState([
    { from:'them', text:"Hi Maya — I took a look at your March P&L. Your revenue is up 18% YoY which is terrific.", time:'8:48am' },
    { from:'them', text:"Given the pace, I'd love to revisit your S-Corp distribution strategy before June 15.", time:'8:49am' },
    { from:'me',   text:"Sounds good. Can we do Friday morning?", time:'8:55am' },
    { from:'them', text:"Great — I pencilled us in for Friday at 10am PT. I'll send a calendar invite shortly.", time:'9:02am' },
  ]);
  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { from:'me', text: input, time:'Now' }]);
    setInput('');
  };

  return (
    <div className="content" style={{padding:'20px 24px'}}>
      <div className="page-header" style={{marginBottom:16}}>
        <h1 style={{marginBottom:2}}>Messages</h1>
        <div className="sub">Your team responds within 1 business day.</div>
      </div>
      <div className="card-s" style={{padding:0,display:'grid',gridTemplateColumns:'300px 1fr',minHeight:540,overflow:'hidden'}}>
        <div style={{borderRight:'1px solid rgba(0,0,0,.06)',overflow:'auto'}}>
          {THREADS.map(t => (
            <div key={t.id} onClick={()=>setActiveId(t.id)} style={{display:'flex',gap:12,padding:'14px 16px',borderBottom:'1px solid rgba(0,0,0,.04)',cursor:'pointer',background: t.id===activeId ? '#F6F4F2' : 'transparent'}}>
              <div className={'av md ' + t.tone}>{t.init}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                  <div style={{fontWeight:600,fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.who}</div>
                  <div className="tiny" style={{flexShrink:0}}>{t.time}</div>
                </div>
                <div className="tiny" style={{color:'#3B7A80',fontWeight:500,marginBottom:2}}>{t.role}</div>
                <div style={{fontSize:12,color:'rgba(18,23,36,.65)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.preview}</div>
              </div>
              {t.unread > 0 && <span style={{alignSelf:'center',background:'#F15F22',color:'#fff',fontSize:10,fontWeight:700,minWidth:18,height:18,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 6px'}}>{t.unread}</span>}
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,.06)',display:'flex',alignItems:'center',gap:12}}>
            <div className={'av md ' + active.tone}>{active.init}</div>
            <div>
              <div style={{fontWeight:600}}>{active.who}</div>
              <div className="tiny">{active.role} · usually replies within an hour</div>
            </div>
            <div style={{flex:1}}/>
            <button className="btn btn-secondary btn-sm">
              <img src="../../assets/icons/Call.svg" width="14" height="14" alt=""/>Call
            </button>
          </div>
          <div style={{flex:1,padding:'20px 24px',overflow:'auto',background:'#F7F7F7'}}>
            {msgs.map((m,i) => (
              <div key={i} style={{display:'flex',justifyContent: m.from==='me' ? 'flex-end' : 'flex-start',marginBottom:10}}>
                <div style={{maxWidth:'72%',padding:'10px 14px',borderRadius: m.from==='me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',background: m.from==='me' ? '#2DA38D' : '#fff',color: m.from==='me' ? '#fff' : '#121724',fontSize:14,lineHeight:1.4,boxShadow:'0 1px 2px rgba(18,23,36,.06)'}}>
                  {m.text}
                  <div style={{fontSize:10,opacity:.7,marginTop:4,textAlign:'right'}}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'14px 20px',borderTop:'1px solid rgba(0,0,0,.06)',display:'flex',gap:10,alignItems:'center'}}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter')send();}}
              placeholder="Message Sarah…"
              style={{flex:1,height:44,padding:'0 14px',borderRadius:8,border:'1px solid rgba(0,0,0,.12)',fontFamily:'Poppins',fontSize:14,outline:'none'}}
            />
            <button className="btn btn-primary" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Bookkeeping placeholder (minor detail screen) ----------
function Bookkeeping() {
  return (
    <div className="content">
      <div className="page-header">
        <h1 style={{marginBottom:2}}>Bookkeeping</h1>
        <div className="sub">Your books are <b style={{color:'#1F7262'}}>up to date</b> as of April 18.</div>
      </div>

      <div className="grid-3" style={{marginBottom:24}}>
        <div className="card-s">
          <div className="muted tiny" style={{marginBottom:6}}>Revenue · April MTD</div>
          <div style={{fontSize:28,fontWeight:600}}>$24,810</div>
          <div style={{fontSize:12,color:'#1F7262',marginTop:4}}>▲ 18% vs March</div>
        </div>
        <div className="card-s">
          <div className="muted tiny" style={{marginBottom:6}}>Expenses · April MTD</div>
          <div style={{fontSize:28,fontWeight:600}}>$14,122</div>
          <div style={{fontSize:12,color:'#784E03',marginTop:4}}>▲ 4% vs March</div>
        </div>
        <div className="card-s">
          <div className="muted tiny" style={{marginBottom:6}}>Net profit · April MTD</div>
          <div style={{fontSize:28,fontWeight:600,color:'#1F7262'}}>$10,688</div>
          <div style={{fontSize:12,color:'rgba(18,23,36,.65)',marginTop:4}}>43% margin</div>
        </div>
      </div>

      <div className="card-s">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <h3 style={{margin:0,fontSize:16}}>Category breakdown · April</h3>
          <span className="pill pill-success">Reconciled</span>
        </div>
        {[
          {cat:'Payroll', amt:8420, pct:60, color:'#F15F22'},
          {cat:'Office & rent', amt:2150, pct:15, color:'#2DA38D'},
          {cat:'Software', amt:1240, pct:9, color:'#3B7A80'},
          {cat:'Travel', amt:1120, pct:8, color:'#F3831A'},
          {cat:'Equipment', amt:1192, pct:8, color:'#1776B6'},
        ].map((r,i) => (
          <div key={i} style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:13}}>
              <span style={{fontWeight:500}}>{r.cat}</span>
              <span style={{fontFamily:'Menlo,monospace',fontWeight:600}}>${r.amt.toLocaleString()}</span>
            </div>
            <div style={{height:8,background:'#F7F7F7',borderRadius:4,overflow:'hidden'}}>
              <div style={{width:r.pct+'%',height:'100%',background:r.color,borderRadius:4}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Transactions, Documents, Messages, Bookkeeping });
