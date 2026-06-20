import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design System ────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg:         "#07070F",
    bg2:        "#0D0D1A",
    surface:    "rgba(255,255,255,0.04)",
    surfaceHigh:"rgba(255,255,255,0.08)",
    glass:      "rgba(255,255,255,0.06)",
    glassBorder:"rgba(255,255,255,0.12)",
    glassBlur:  "blur(24px) saturate(180%)",
    accent:     "#7C6FE0",
    accentLight:"#9D94F0",
    accentGlow: "rgba(124,111,224,0.3)",
    green:      "#30D158",
    greenGlow:  "rgba(48,209,88,0.25)",
    red:        "#FF453A",
    redGlow:    "rgba(255,69,58,0.25)",
    yellow:     "#FFD60A",
    blue:       "#0A84FF",
    text:       "#FFFFFF",
    textSub:    "rgba(255,255,255,0.6)",
    textMuted:  "rgba(255,255,255,0.3)",
    border:     "rgba(255,255,255,0.08)",
    shadow:     "0 8px 32px rgba(0,0,0,0.6)",
    shadowSm:   "0 2px 12px rgba(0,0,0,0.4)",
  },
  light: {
    bg:         "#F2F2F7",
    bg2:        "#FFFFFF",
    surface:    "rgba(255,255,255,0.7)",
    surfaceHigh:"rgba(255,255,255,0.9)",
    glass:      "rgba(255,255,255,0.65)",
    glassBorder:"rgba(0,0,0,0.08)",
    glassBlur:  "blur(24px) saturate(180%)",
    accent:     "#6355D4",
    accentLight:"#7C6FE0",
    accentGlow: "rgba(99,85,212,0.2)",
    green:      "#34C759",
    greenGlow:  "rgba(52,199,89,0.2)",
    red:        "#FF3B30",
    redGlow:    "rgba(255,59,48,0.2)",
    yellow:     "#FF9500",
    blue:       "#007AFF",
    text:       "#000000",
    textSub:    "rgba(0,0,0,0.55)",
    textMuted:  "rgba(0,0,0,0.3)",
    border:     "rgba(0,0,0,0.08)",
    shadow:     "0 8px 32px rgba(0,0,0,0.12)",
    shadowSm:   "0 2px 12px rgba(0,0,0,0.08)",
  }
};

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MONTHS_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"alimentation", label:"Alimentation", icon:"🛒", color:"#30D158",
    keywords:["coop","migros","aldi","lidl","denner","spar","volg","pick pay","laiterie","boucherie","boulangerie","fromagerie","epicerie","manor food","supermarché","grocery","cominox","gottardo"] },
  { id:"restaurant",   label:"Restaurant",   icon:"🍽️", color:"#FFD60A",
    keywords:["mcdonald","mcdo","burger king","kfc","subway","starbucks","uber eats","ubereats","hungry bear","chez mon cousin","imprévu café","imprevu cafe","sixty five","big brother tacos","can dersim","kebab","pizzeria","pizza","sushi","restaurant","bistro","brasserie","trattoria","grotto","café","cafe","bar ","food","take away","takeaway","tacos"] },
  { id:"transport",    label:"Transport",    icon:"🚗", color:"#0A84FF",
    keywords:["sbb","cff","tpf","tpl","tl","bls","flixbus","bus","train","taxi","uber ","parking","tamoil","esso","shell","bp ","agrola","socar","coop pronto","migrol","autoroute","vignette","mobility","jubin"] },
  { id:"loisirs",      label:"Loisirs",      icon:"🎮", color:"#BF5AF2",
    keywords:["netflix","spotify","disney","apple","steam","playstation","xbox","nintendo","cinema","theatre","concert","fitness","piscine","musée","billets","ticket","airbnb","hôtel","hotel","booking","fnac","intersport","decathlon","claude","anthropic","chatgpt","openai","oberson"] },
  { id:"sante",        label:"Santé",        icon:"💊", color:"#FF9F0A",
    keywords:["pharmacie","médecin","docteur","dentiste","hôpital","hopital","concordia","sanitas","css","swica","visana","helsana","atupri","droguerie","apotheke","cabinet"] },
  { id:"vetements",    label:"Vêtements",    icon:"👕", color:"#FF375F",
    keywords:["zara","h&m","hm ","pull","manor","zalando","nike","adidas","bestsecret","best secret","hetm","black and white","lyre ","clothing","vêtement","mode","boutique"] },
  { id:"logement",     label:"Logement",     icon:"🏠", color:"#64D2FF",
    keywords:["loyer","conforama","ikea","jumbo","obi","bricorama","luminaire","électricité","chauffage","eau ","gaz ","internet","swisscom","salt ","sunrise","upc","office de la circulation","chous","chou"] },
  { id:"tech",         label:"Tech",         icon:"💻", color:"#7C6FE0",
    keywords:["digitec","galaxus","aliexpress","amazon","mediamarkt","media markt","microspot","interdiscount","brack","apple store","sags"] },
  { id:"twint_out",    label:"TWINT",        icon:"📲", color:"#FF6B00",
    keywords:["twint à","twint a "] },
  { id:"autre",        label:"Autre",        icon:"📦", color:"#8E8E93",
    keywords:[] },
];

const NEON_SKIP   = ["REWARD_RECEIVED","GOAL_WITHDRAWAL","GOAL_DEPOSIT","CASH_TRANSACTION_RELATED_OTHER"];
const NEON_IN     = ["PAYMENT_TRANSACTION_IN","CARD_TRANSACTION_IN","CASH_TRANSACTION_OTHER","TRANSFER_IN"];

function cleanCell(s) { return (s||"").replace(/"""/g,"").replace(/"/g,"").trim(); }
function parseCSVLine(line) {
  const r=[], sep=";"; let cur="", inQ=false;
  for(const ch of line){ if(ch==='"'){inQ=!inQ;continue;} if(ch===sep&&!inQ){r.push(cur.trim());cur="";continue;} cur+=ch; }
  r.push(cur.trim()); return r;
}
function toDate(s) {
  const c=cleanCell(s);
  const m1=c.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if(m1) return `${m1[3]}-${m1[2].padStart(2,"0")}-${m1[1].padStart(2,"0")}`;
  const m2=c.match(/^(\d{4})-(\d{2})-(\d{2})/); if(m2) return c.slice(0,10);
  return null;
}
function toAmt(s) { const n=parseFloat(cleanCell(s).replace(/['''\s]/g,"").replace(",",".").replace(/[^0-9.\-]/g,"")); return isNaN(n)?0:n; }
function smartCat(desc, actType) {
  if(!desc) return "autre";
  const d=desc.toLowerCase();
  if(actType==="PAYMENT_TRANSACTION_OUT"&&d.includes("twint")) return "twint_out";
  for(const cat of CATEGORIES){ if(cat.id==="twint_out") continue; if(cat.keywords.some(k=>d.includes(k))) return cat.id; }
  return "autre";
}
function detectAndParseCSV(text) {
  const clean=text.replace(/^\uFEFF/,"");
  const lines=clean.trim().split(/\r?\n/);
  if(lines.length<2) return null;
  const h=lines[0].toLowerCase();
  if(h.includes("activity type")||h.includes("activity name")) return parseNeon(lines);
  if(h.includes("original amount")||h.includes("exchange rate")) return parseYuh(lines);
  return parseGeneric(lines);
}
function parseNeon(lines) {
  const H=parseCSVLine(lines[0]).map(h=>cleanCell(h).toLowerCase());
  const dI=H.findIndex(h=>h==="date"), tI=H.findIndex(h=>h==="activity type");
  const nI=H.findIndex(h=>h==="activity name"), dbI=H.findIndex(h=>h==="debit");
  const crI=H.findIndex(h=>h==="credit"), rI=H.findIndex(h=>h==="recipient");
  const txs=[];
  for(let i=1;i<lines.length;i++){
    if(!lines[i].trim()) continue;
    const c=parseCSVLine(lines[i]);
    const act=cleanCell(c[tI]||"");
    if(NEON_SKIP.includes(act)) continue;
    const date=toDate(c[dI]||""); if(!date) continue;
    const rawName=cleanCell(c[nI]||"");
    const recip=cleanCell(c[rI]||"");
    const desc=recip||rawName.replace(/"""/g,"").replace(/^Twint (à|de) /i,"").replace(/^Transfert (à|de) /i,"").trim();
    const debit=toAmt(c[dbI]||""), credit=toAmt(c[crI]||"");
    const isIncome=NEON_IN.includes(act)||credit>0;
    const amount=Math.abs(debit||credit);
    if(amount===0) continue;
    const category=isIncome?"income":smartCat(desc+" "+rawName,act);
    txs.push({date,description:desc,amount,isIncome,category,source:"neon"});
  }
  return txs;
}
function parseYuh(lines) {
  const H=parseCSVLine(lines[0]).map(h=>cleanCell(h).toLowerCase());
  const dI=H.findIndex(h=>h==="date"), aI=H.findIndex(h=>h==="amount");
  const descI=H.findIndex(h=>h==="description"), catI=H.findIndex(h=>h==="category");
  const txs=[];
  for(let i=1;i<lines.length;i++){
    if(!lines[i].trim()) continue;
    const c=parseCSVLine(lines[i]);
    const date=toDate(c[dI]||""), amount=toAmt(c[aI]||"");
    if(!date||amount===0) continue;
    const desc=cleanCell(c[descI]||"");
    const yuhCat=cleanCell(c[catI]||"").toLowerCase();
    const isIncome=amount>0||yuhCat==="income";
    let category="autre";
    if(isIncome) category="income";
    else if(yuhCat==="food") category="restaurant";
    else if(yuhCat==="household") category="logement";
    else if(yuhCat==="shopping") category="tech";
    else category=smartCat(desc,"");
    txs.push({date,description:desc,amount:Math.abs(amount),isIncome,category,source:"yuh"});
  }
  return txs;
}
function parseGeneric(lines) {
  const H=parseCSVLine(lines[0]).map(h=>cleanCell(h).toLowerCase());
  const dI=H.findIndex(h=>h.includes("date")), aI=H.findIndex(h=>h.includes("amount")||h.includes("betrag"));
  const descI=H.findIndex(h=>h.includes("desc")||h.includes("text")||h.includes("merchant"));
  const txs=[];
  for(let i=1;i<lines.length;i++){
    if(!lines[i].trim()) continue;
    const c=parseCSVLine(lines[i]);
    const date=toDate(c[dI>=0?dI:0]||""), amount=toAmt(c[aI>=0?aI:1]||"");
    const desc=cleanCell(c[descI>=0?descI:2]||"");
    if(!date||amount===0) continue;
    txs.push({date,description:desc,amount:Math.abs(amount),isIncome:amount>0,category:smartCat(desc,""),source:"import"});
  }
  return txs;
}

async function aiCategorize(transactions) {
  const toC=transactions.filter(t=>!t.isIncome).slice(0,40);
  if(!toC.length) return {};
  const prompt=`Classe chaque transaction bancaire suisse dans UNE catégorie: alimentation, restaurant, transport, loisirs, sante, vetements, logement, tech, twint_out, autre\n\n${toC.map((t,i)=>`${i}|${t.description}|CHF ${t.amount}`).join("\n")}\n\nRéponds UNIQUEMENT en JSON: [{"index":0,"category":"alimentation"}]`;
  try {
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
    const data=await res.json();
    const text=data.content?.[0]?.text||"[]";
    const results=JSON.parse(text.replace(/```json|```/g,"").trim());
    const map={};
    for(const r of results){ const tx=toC[r.index]; if(tx) map[tx.description+"|"+tx.amount]=r.category; }
    return map;
  } catch { return {}; }
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const SK={tx:"bgt_tx3",inc:"bgt_inc3",rec:"bgt_rec3",bud:"bgt_bud3",theme:"bgt_theme"};
const load=(k,fb)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
const fmt=(n)=>`CHF ${Math.abs(Number(n)).toFixed(2)}`;
const fmtK=(n)=>Math.abs(n)>=1000?`CHF ${(Math.abs(n)/1000).toFixed(1)}k`:`CHF ${Math.abs(n).toFixed(0)}`;
const today=()=>new Date().toISOString().slice(0,10);
const getCat=(id)=>CATEGORIES.find(c=>c.id===id)||CATEGORIES[CATEGORIES.length-1];

// ─── Liquid Glass Component ───────────────────────────────────────────────────
function Glass({ children, style={}, onClick, padding="16px 18px", radius=20, border=true }) {
  const T=useTheme();
  return (
    <div onClick={onClick} style={{
      background: T.glass,
      backdropFilter: T.glassBlur,
      WebkitBackdropFilter: T.glassBlur,
      border: border ? `1px solid ${T.glassBorder}` : "none",
      borderRadius: radius,
      padding,
      boxShadow: T.shadowSm,
      ...style
    }}>
      {children}
    </div>
  );
}

const ThemeCtx = { current: THEMES.dark };
function useTheme() { return ThemeCtx.current; }

// ─── Micro components ─────────────────────────────────────────────────────────
function Pill({ children, color, size="sm" }) {
  return (
    <span style={{ background: color+"22", color, border:`1px solid ${color}44`, borderRadius:20, padding: size==="sm"?"3px 10px":"5px 14px", fontSize: size==="sm"?11:13, fontWeight:700, letterSpacing:.3 }}>
      {children}
    </span>
  );
}

function Avatar({ icon, color, size=42 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.28, background:`linear-gradient(135deg, ${color}33, ${color}15)`, border:`1px solid ${color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.46, flexShrink:0 }}>
      {icon}
    </div>
  );
}

function ProgressBar({ value, max, color, height=4 }) {
  const pct = max > 0 ? Math.min((value/max)*100,100) : 0;
  const T=useTheme();
  return (
    <div style={{ background:T.border, borderRadius:height, height, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${color}, ${color}BB)`, height, borderRadius:height, transition:"width .5s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(()=>{ if(msg){const t=setTimeout(onDone,2500);return()=>clearTimeout(t);}}, [msg]);
  if(!msg) return null;
  const T=useTheme();
  return (
    <div style={{ position:"fixed", bottom:100, left:"50%", transform:"translateX(-50%)", background:T.glass, backdropFilter:T.glassBlur, WebkitBackdropFilter:T.glassBlur, border:`1px solid ${T.glassBorder}`, color:T.text, borderRadius:16, padding:"12px 24px", fontWeight:600, fontSize:14, zIndex:999, boxShadow:T.shadow, whiteSpace:"nowrap" }}>
      {msg}
    </div>
  );
}

function ConfirmDialog({ msg, onConfirm, onCancel }) {
  const T=useTheme();
  if(!msg) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <Glass radius={24} padding="28px 24px" style={{ width:"100%", maxWidth:320 }}>
        <div style={{ fontSize:17, fontWeight:600, color:T.text, marginBottom:8, textAlign:"center" }}>Supprimer</div>
        <div style={{ fontSize:14, color:T.textSub, marginBottom:24, textAlign:"center", lineHeight:1.5 }}>{msg}</div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px", color:T.textSub, fontWeight:600, fontSize:15, cursor:"pointer" }}>Annuler</button>
          <button onClick={onConfirm} style={{ flex:1, background:"linear-gradient(135deg, #FF453A, #FF6B60)", border:"none", borderRadius:14, padding:"14px", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>Supprimer</button>
        </div>
      </Glass>
    </div>
  );
}

// ─── Sheet (bottom drawer) ────────────────────────────────────────────────────
function Sheet({ title, subtitle, onClose, children, accent }) {
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(null);
  const ref = useRef(null);
  const T=useTheme();

  function onTS(e){ if(ref.current&&ref.current.scrollTop===0) setStartY(e.touches[0].clientY); }
  function onTM(e){ if(startY===null) return; const d=e.touches[0].clientY-startY; if(d>0) setDragY(d); }
  function onTE(){ if(dragY>110) onClose(); setDragY(0); setStartY(null); }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", zIndex:500, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div ref={ref} onClick={e=>e.stopPropagation()} onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{ background: T.bg2, borderRadius:"28px 28px 0 0", width:"100%", maxHeight:"92vh", overflowY:"auto", transform:`translateY(${dragY}px)`, transition:dragY===0?"transform .35s cubic-bezier(.32,0,.67,0)":"none", willChange:"transform" }}>
        {/* Handle */}
        <div style={{ padding:"14px 20px 0", position:"sticky", top:0, background:T.bg2, zIndex:1 }}>
          <div style={{ width:36, height:4, background:T.border, borderRadius:2, margin:"0 auto 16px" }} />
          {accent && <div style={{ width:48, height:48, borderRadius:16, background:`linear-gradient(135deg, ${accent}33, ${accent}15)`, border:`1px solid ${accent}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:12 }}>{accent.startsWith("#")?"":accent}</div>}
          <div style={{ fontWeight:800, fontSize:22, color:T.text, letterSpacing:-.3 }}>{title}</div>
          {subtitle && <div style={{ fontSize:14, color:T.textSub, marginTop:2 }}>{subtitle}</div>}
          <div style={{ height:1, background:T.border, marginTop:16 }} />
        </div>
        <div style={{ padding:"16px 20px 48px" }}>{children}</div>
      </div>
    </div>
  );
}

function SField({ label, children }) {
  const T=useTheme();
  return (
    <div style={{ marginBottom:16 }}>
      {label && <div style={{ fontSize:12, color:T.textMuted, fontWeight:600, marginBottom:8, letterSpacing:.8, textTransform:"uppercase" }}>{label}</div>}
      {children}
    </div>
  );
}

function SInput({ ...props }) {
  const T=useTheme();
  return <input {...props} style={{ width:"100%", background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 16px", color:T.text, fontSize:16, outline:"none", boxSizing:"border-box", fontFamily:"inherit", ...props.style }} />;
}

function SBtn({ children, variant="primary", full, onClick }) {
  const T=useTheme();
  const bg = variant==="primary" ? `linear-gradient(135deg, ${T.accent}, ${T.accentLight})` : variant==="success" ? `linear-gradient(135deg, ${T.green}, #5AE17A)` : variant==="danger" ? `linear-gradient(135deg, ${T.red}, #FF6B60)` : T.surfaceHigh;
  const col = variant==="ghost" ? T.textSub : "#fff";
  return (
    <button onClick={onClick} style={{ background:bg, color:col, border: variant==="ghost"?`1px solid ${T.border}`:"none", borderRadius:16, padding:"16px 24px", fontWeight:700, fontSize:16, cursor:"pointer", width:full?"100%":"auto", fontFamily:"inherit", boxShadow: variant!=="ghost"?`0 4px 20px ${T.accentGlow}`:"none", marginTop:4 }}>
      {children}
    </button>
  );
}

function CatPicker({ value, onChange }) {
  const T=useTheme();
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {CATEGORIES.map(cat => (
        <button key={cat.id} onClick={()=>onChange(cat.id)} style={{ background:value===cat.id?`linear-gradient(135deg, ${cat.color}33, ${cat.color}15)`:T.surfaceHigh, border:`1px solid ${value===cat.id?cat.color:T.border}`, borderRadius:20, padding:"8px 14px", color:value===cat.id?cat.color:T.textSub, fontSize:13, cursor:"pointer", fontWeight:value===cat.id?700:400, transition:"all .15s" }}>
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxRow({ t, onDelete }) {
  const cat=getCat(t.category);
  const T=useTheme();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${T.border}` }}>
      <Avatar icon={cat.icon} color={cat.color} size={44} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:15, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.description}</div>
        <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{t.date} · {cat.label}{t.source?` · ${t.source}`:""}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <span style={{ fontWeight:700, fontSize:15, color:t.isIncome?T.green:T.text }}>{t.isIncome?"+":"-"}{fmt(t.amount)}</span>
        {onDelete && <button onClick={onDelete} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:20, padding:"0 2px", lineHeight:1 }}>×</button>}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const now=new Date();
  const [themeKey, setThemeKey] = useState(()=>load(SK.theme,"dark"));
  ThemeCtx.current = THEMES[themeKey];
  const T = THEMES[themeKey];

  const [tab, setTab]         = useState("home");
  const [month, setMonth]     = useState(now.getMonth());
  const [year, setYear]       = useState(now.getFullYear());
  const [transactions, setTx] = useState(()=>load(SK.tx,[]));
  const [incomes, setInc]     = useState(()=>load(SK.inc,[]));
  const [recurring, setRec]   = useState(()=>load(SK.rec,[]));
  const [budgets, setBud]     = useState(()=>load(SK.bud,{}));
  const [sheet, setSheet]     = useState(null);
  const [toast, setToast]     = useState("");
  const [confirmDel, setConf] = useState(null);
  const [catDetail, setCatD]  = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [importItems, setImp] = useState([]);
  const [importLoading, setIL]= useState(false);
  const fileRef = useRef();
  const swipeX  = useRef(null);

  const [txForm, setTxForm] = useState({description:"",amount:"",category:"alimentation",date:today(),isIncome:false});
  const [incForm, setIncF]  = useState({label:"",amount:"",type:"salary",day:25});
  const [recForm, setRecF]  = useState({label:"",amount:"",category:"logement",day:1});

  useEffect(()=>save(SK.tx,transactions),[transactions]);
  useEffect(()=>save(SK.inc,incomes),[incomes]);
  useEffect(()=>save(SK.rec,recurring),[recurring]);
  useEffect(()=>save(SK.bud,budgets),[budgets]);
  useEffect(()=>save(SK.theme,themeKey),[themeKey]);

  // ── Computed ────────────────────────────────────────────────────────────────
  const monthTx = transactions.filter(t=>{ const d=new Date(t.date); return d.getMonth()===month&&d.getFullYear()===year; });
  const prevTx  = transactions.filter(t=>{ const d=new Date(t.date); const pm=month===0?11:month-1,py=month===0?year-1:year; return d.getMonth()===pm&&d.getFullYear()===py; });
  const expenses     = monthTx.filter(t=>!t.isIncome);
  const incTx        = monthTx.filter(t=>t.isIncome);
  const recurringInc = incomes.reduce((s,i)=>s+Number(i.amount),0);
  const importedInc  = incTx.reduce((s,t)=>s+Number(t.amount),0);
  const totalIncome  = importedInc+recurringInc;
  const recurringExp = recurring.reduce((s,r)=>s+Number(r.amount),0);
  const totalExp     = expenses.reduce((s,t)=>s+Number(t.amount),0)+recurringExp;
  const balance      = totalIncome-totalExp;
  const savingsRate  = totalIncome>0?((balance/totalIncome)*100):0;

  const spentByCat={}, prevByCat={};
  for(const t of expenses) spentByCat[t.category]=(spentByCat[t.category]||0)+Number(t.amount);
  for(const t of prevTx.filter(x=>!x.isIncome)) prevByCat[t.category]=(prevByCat[t.category]||0)+Number(t.amount);

  const annualData=Array.from({length:12},(_,i)=>{
    const mTx=transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===i&&d.getFullYear()===year;});
    const spent=mTx.filter(t=>!t.isIncome).reduce((s,t)=>s+Number(t.amount),0)+recurringExp;
    const earned=mTx.filter(t=>t.isIncome).reduce((s,t)=>s+Number(t.amount),0)+recurringInc;
    return {spent,earned};
  });

  const insights=[];
  for(const cat of CATEGORIES){
    const curr=spentByCat[cat.id]||0, prev=prevByCat[cat.id]||0;
    if(curr>0&&prev>0){ const d=((curr-prev)/prev)*100; if(d>35) insights.push({type:"warn",msg:`+${d.toFixed(0)}% en ${cat.label}`,icon:cat.icon,color:T.yellow}); if(d<-30) insights.push({type:"good",msg:`-${Math.abs(d).toFixed(0)}% en ${cat.label}`,icon:cat.icon,color:T.green}); }
    const bud=Number(budgets[cat.id]||0);
    if(bud>0&&curr>bud) insights.push({type:"alert",msg:`Budget ${cat.label} dépassé`,icon:cat.icon,color:T.red});
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  const addTx  = d=>{ setTx(p=>[{id:Date.now()+Math.random(),...d},...p]); setToast("✅ Ajouté"); };
  const delTx  = id=>{ setTx(p=>p.filter(x=>x.id!==id)); setToast("Supprimé"); setConf(null); };
  const askDel = t=>setConf({id:t.id,label:t.description});
  const addInc = d=>{ setInc(p=>[...p,{id:Date.now(),...d}]); setToast("✅ Revenu ajouté"); };
  const delInc = id=>setInc(p=>p.filter(x=>x.id!==id));
  const addRec = d=>{ setRec(p=>[...p,{id:Date.now(),...d}]); setToast("✅ Ajouté"); };
  const delRec = id=>setRec(p=>p.filter(x=>x.id!==id));

  function prevMonth(){ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }
  function nextMonth(){ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }
  function toggleTheme(){ setThemeKey(k=>k==="dark"?"light":"dark"); }

  // ── CSV Import ────────────────────────────────────────────────────────────────
  async function handleFile(e){
    const file=e.target.files?.[0]; if(!file) return;
    e.target.value="";
    setIL(true); setSheet("import");
    const text=await file.text();
    const parsed=detectAndParseCSV(text);
    if(!parsed||!parsed.length){ setIL(false); setToast("❌ Format non reconnu"); setSheet(null); return; }
    const withCats=parsed.map(t=>({...t,category:t.isIncome?"income":smartCat(t.description,"")}));
    try{
      const aiMap=await aiCategorize(withCats);
      const final=withCats.map(t=>({...t,category:aiMap[t.description+"|"+t.amount]||t.category}));
      setImp(final.map((t,i)=>({...t,_idx:i,_on:true})));
    }catch{
      setImp(withCats.map((t,i)=>({...t,_idx:i,_on:true})));
    }
    setIL(false); setSheet("review");
  }
  function confirmImport(){
    const toAdd=importItems.filter(t=>t._on).map(({_idx,_on,...t})=>({id:Date.now()+Math.random()+_idx,...t}));
    setTx(p=>[...toAdd,...p]);
    setSheet(null); setToast(`✅ ${toAdd.length} transaction${toAdd.length>1?"s":""} importée${toAdd.length>1?"s":""}`);
  }

  // ─── HOME TAB ────────────────────────────────────────────────────────────────
  function HomeTab() {
    const balColor = balance>=0?T.green:T.red;
    return (
      <div style={{paddingBottom:8}}>
        {/* Hero Card */}
        <div
          onTouchStart={e=>{swipeX.current=e.touches[0].clientX;}}
          onTouchEnd={e=>{ const d=swipeX.current-e.changedTouches[0].clientX; if(Math.abs(d)>60){d>0?nextMonth():prevMonth();} }}
          style={{ background:`linear-gradient(145deg, ${T.accent}22 0%, ${T.accentLight}11 50%, transparent 100%)`, border:`1px solid ${T.glassBorder}`, borderRadius:28, padding:"28px 24px 24px", marginBottom:16, position:"relative", overflow:"hidden", touchAction:"pan-y" }}
        >
          {/* Decorative orbs */}
          <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:`radial-gradient(circle, ${T.accent}20, transparent 70%)`,pointerEvents:"none"}} />
          <div style={{position:"absolute",bottom:-30,left:-20,width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle, ${T.accentLight}15, transparent 70%)`,pointerEvents:"none"}} />

          {/* Month nav */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <button onClick={prevMonth} style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:12,width:36,height:36,color:T.textSub,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:T.text,letterSpacing:-.2}}>{MONTHS[month]}</div>
              <div style={{fontSize:12,color:T.textMuted}}>{year}</div>
            </div>
            <button onClick={nextMonth} style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:12,width:36,height:36,color:T.textSub,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          </div>

          {/* Balance */}
          <div style={{marginBottom:4}}>
            <div style={{fontSize:12,color:T.textMuted,fontWeight:600,letterSpacing:1,marginBottom:8}}>SOLDE DU MOIS</div>
            <div style={{fontSize:46,fontWeight:900,color:balColor,letterSpacing:-2,lineHeight:1}}>{balance>=0?"+":""}{fmt(balance)}</div>
          </div>
          {totalIncome>0 && <div style={{fontSize:13,color:T.textMuted,marginTop:6,marginBottom:16}}>Taux d'épargne : <span style={{color:savingsRate>=0?T.green:T.red,fontWeight:700}}>{savingsRate.toFixed(0)}%</span></div>}

          {/* Rev / Dep */}
          <div style={{display:"flex",gap:1,marginTop:8}}>
            <div onClick={()=>setSheet("incDetail")} style={{flex:1,background:T.glass,backdropFilter:T.glassBlur,WebkitBackdropFilter:T.glassBlur,borderRadius:"16px 4px 4px 16px",padding:"12px 16px",cursor:"pointer",border:`1px solid ${T.glassBorder}`}}>
              <div style={{fontSize:11,color:T.textMuted,fontWeight:600,marginBottom:4}}>REVENUS ›</div>
              <div style={{fontSize:19,fontWeight:800,color:T.green}}>{fmt(totalIncome)}</div>
            </div>
            <div style={{flex:1,background:T.glass,backdropFilter:T.glassBlur,WebkitBackdropFilter:T.glassBlur,borderRadius:"4px 16px 16px 4px",padding:"12px 16px",border:`1px solid ${T.glassBorder}`}}>
              <div style={{fontSize:11,color:T.textMuted,fontWeight:600,marginBottom:4}}>DÉPENSES</div>
              <div style={{fontSize:19,fontWeight:800,color:T.red}}>{fmt(totalExp)}</div>
            </div>
          </div>
        </div>

        {/* Insights */}
        {insights.length>0 && (
          <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
            {insights.slice(0,4).map((ins,i)=>(
              <div key={i} style={{flexShrink:0,background:ins.color+"15",border:`1px solid ${ins.color}33`,borderRadius:16,padding:"8px 14px",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>{ins.icon}</span>
                <span style={{fontSize:12,color:ins.color,fontWeight:600,whiteSpace:"nowrap"}}>{ins.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          <button onClick={()=>fileRef.current?.click()} style={{background:`linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,border:"none",borderRadius:18,padding:"16px 12px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,boxShadow:`0 4px 20px ${T.accentGlow}`}}>
            <span style={{fontSize:26}}>📂</span>Importer CSV
          </button>
          <button onClick={()=>{setTxForm({description:"",amount:"",category:"alimentation",date:today(),isIncome:false});setSheet("addTx");}} style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:18,padding:"16px 12px",color:T.text,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <span style={{fontSize:26}}>✏️</span>Ajout manuel
          </button>
        </div>

        {/* Recurring banner */}
        {recurring.length>0 && (
          <Glass padding="12px 16px" radius={16} style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>🔄 Dépenses fixes</div>
              <div style={{fontSize:12,color:T.textMuted}}>{recurring.length} abonnement{recurring.length>1?"s":""}</div>
            </div>
            <div style={{fontWeight:800,fontSize:16,color:T.red}}>{fmt(recurringExp)}</div>
          </Glass>
        )}

        {/* Categories */}
        {CATEGORIES.filter(c=>spentByCat[c.id]>0).length>0 && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:T.textMuted,letterSpacing:.5,marginBottom:12}}>PAR CATÉGORIE</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {CATEGORIES.filter(c=>spentByCat[c.id]>0).map(cat=>{
                const spent=spentByCat[cat.id]||0, bud=Number(budgets[cat.id]||0);
                const prev=prevByCat[cat.id]||0, trend=prev>0?((spent-prev)/prev*100):null;
                const over=bud>0&&spent>bud;
                return (
                  <Glass key={cat.id} radius={18} padding="14px 16px" onClick={()=>{setCatD(cat.id);setSheet("catDetail");}} style={{cursor:"pointer",border:`1px solid ${over?T.red+"44":T.glassBorder}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <Avatar icon={cat.icon} color={cat.color} size={44} />
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:bud>0?8:0}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:15,color:T.text}}>{cat.label}</div>
                            {trend!==null && <div style={{fontSize:12,color:Number(trend)>0?T.red:T.green,marginTop:2}}>{Number(trend)>0?"+":""}{trend.toFixed(0)}% vs mois dernier</div>}
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontWeight:800,fontSize:16,color:over?T.red:cat.color}}>{fmt(spent)}</div>
                            {bud>0&&<div style={{fontSize:11,color:T.textMuted}}>/ {fmt(bud)}</div>}
                          </div>
                        </div>
                        {bud>0&&<ProgressBar value={spent} max={bud} color={over?T.red:cat.color} />}
                      </div>
                    </div>
                  </Glass>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent */}
        {expenses.length>0 && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:T.textMuted,letterSpacing:.5}}>RÉCENTES</div>
              <button onClick={()=>setSheet("history")} style={{background:"none",border:"none",color:T.accent,fontSize:13,fontWeight:700,cursor:"pointer"}}>Tout voir</button>
            </div>
            <Glass padding="0 16px" radius={20}>
              {expenses.slice(0,6).map(t=><TxRow key={t.id} t={t} onDelete={()=>askDel(t)} />)}
            </Glass>
          </div>
        )}

        {expenses.length===0&&Object.keys(spentByCat).length===0&&(
          <div style={{textAlign:"center",padding:"48px 0",color:T.textMuted}}>
            <div style={{fontSize:48,marginBottom:16}}>📊</div>
            <div style={{fontSize:17,fontWeight:600,color:T.textSub,marginBottom:8}}>Aucune dépense</div>
            <div style={{fontSize:14}}>Importe un CSV ou ajoute une dépense</div>
          </div>
        )}

        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleFile} />
      </div>
    );
  }

  // ─── ANNUAL TAB ────────────────────────────────────────────────────────────
  function AnnualTab() {
    const maxSpent=Math.max(...annualData.map(d=>d.spent),1);
    const totalY=annualData.reduce((s,d)=>s+d.spent,0);
    const realIncY=annualData.reduce((s,d)=>s+d.earned,0);
    const savings=realIncY-totalY;
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:28,fontWeight:900,color:T.text,letterSpacing:-.5}}>Année {year}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setYear(y=>y-1)} style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:12,padding:"8px 14px",color:T.textSub,cursor:"pointer",fontSize:14,fontWeight:600}}>‹</button>
            <button onClick={()=>setYear(y=>y+1)} style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:12,padding:"8px 14px",color:T.textSub,cursor:"pointer",fontSize:14,fontWeight:600}}>›</button>
          </div>
        </div>

        {/* Summary */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[
            {l:"Revenus",v:fmt(realIncY),c:T.green},
            {l:"Dépenses",v:fmt(totalY),c:T.red},
            {l:"Économies",v:fmt(savings),c:savings>=0?T.green:T.red},
            {l:"Moy./mois",v:fmtK(totalY/12),c:T.accent},
          ].map(({l,v,c})=>(
            <Glass key={l} radius={18} padding="16px">
              <div style={{fontSize:11,color:T.textMuted,fontWeight:600,letterSpacing:.6,marginBottom:8}}>{l.toUpperCase()}</div>
              <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
            </Glass>
          ))}
        </div>

        {/* Bar chart */}
        <Glass radius={20} padding="20px 16px" style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:T.textMuted,letterSpacing:.5,marginBottom:16}}>DÉPENSES PAR MOIS</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:110}}>
            {annualData.map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}} onClick={()=>{setMonth(i);setTab("home");}}>
                <div style={{fontSize:8,color:d.spent>0?T.textSub:"transparent",fontWeight:700}}>{d.spent>0?fmtK(d.spent).replace("CHF ",""):""}</div>
                <div style={{width:"100%",background:i===month?`linear-gradient(180deg, ${T.accent}, ${T.accentLight})`:T.surfaceHigh,borderRadius:"6px 6px 0 0",height:`${Math.max((d.spent/maxSpent)*85,2)}px`,transition:"height .4s cubic-bezier(.4,0,.2,1)",boxShadow:i===month?`0 0 12px ${T.accentGlow}`:"none"}} />
                <div style={{fontSize:9,color:i===month?T.accent:T.textMuted,fontWeight:i===month?800:400}}>{MONTHS_SHORT[i][0]}</div>
              </div>
            ))}
          </div>
        </Glass>

        {/* Table */}
        <Glass radius={20} padding="0" style={{overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 16px",borderBottom:`1px solid ${T.border}`}}>
            {["Mois","Dépenses","Solde"].map(h=><div key={h} style={{fontSize:11,fontWeight:700,color:T.textMuted}}>{h}</div>)}
          </div>
          {annualData.map((d,i)=>{
            const sol=d.earned-d.spent, hasTx=d.spent>0||d.earned>0;
            return (
              <div key={i} onClick={()=>{setMonth(i);setTab("home");}} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"14px 16px",borderBottom:`1px solid ${T.border}`,cursor:"pointer",background:i===month?T.accent+"10":"transparent",transition:"background .2s"}}>
                <div style={{fontWeight:i===month?800:500,color:i===month?T.accent:T.text,fontSize:14}}>{MONTHS_SHORT[i]}</div>
                <div style={{color:d.spent>0?T.red:T.textMuted,fontWeight:600,fontSize:14}}>{d.spent>0?fmt(d.spent):"—"}</div>
                <div style={{color:hasTx?(sol>=0?T.green:T.red):T.textMuted,fontWeight:700,fontSize:14}}>{hasTx?fmt(Math.abs(sol)):"—"}</div>
              </div>
            );
          })}
        </Glass>
      </div>
    );
  }

  // ─── SETTINGS TAB ──────────────────────────────────────────────────────────
  function SettingsTab() {
    return (
      <div>
        <div style={{fontSize:28,fontWeight:900,color:T.text,letterSpacing:-.5,marginBottom:24}}>Réglages</div>

        {/* Appearance */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:700,color:T.textMuted,letterSpacing:.8,marginBottom:12}}>APPARENCE</div>
          <Glass radius={20} padding="0" style={{overflow:"hidden"}}>
            <div onClick={toggleTheme} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 18px",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:T.surfaceHigh,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{themeKey==="dark"?"🌙":"☀️"}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:15,color:T.text}}>Thème</div>
                  <div style={{fontSize:12,color:T.textMuted}}>{themeKey==="dark"?"Mode sombre":"Mode clair"}</div>
                </div>
              </div>
              <div style={{background:themeKey==="dark"?T.accent:"#E5E5EA",borderRadius:20,width:50,height:30,position:"relative",transition:"background .3s",cursor:"pointer"}}>
                <div style={{position:"absolute",top:3,left:themeKey==="dark"?22:3,width:24,height:24,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.3)",transition:"left .3s"}} />
              </div>
            </div>
          </Glass>
        </div>

        {/* Income */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.textMuted,letterSpacing:.8}}>REVENUS RÉCURRENTS</div>
            <button onClick={()=>{setIncF({label:"",amount:"",type:"salary",day:25});setSheet("addInc");}} style={{background:T.green+"22",border:`1px solid ${T.green}44`,borderRadius:10,padding:"6px 14px",color:T.green,fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Ajouter</button>
          </div>
          {incomes.length===0&&<div style={{color:T.textMuted,fontSize:14,textAlign:"center",padding:20}}>Aucun revenu configuré</div>}
          <Glass padding="0" radius={20} style={{overflow:"hidden"}}>
            {incomes.map((inc,i)=>(
              <div key={inc.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:i<incomes.length-1?`1px solid ${T.border}`:"none"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:15,color:T.text}}>{inc.label}</div>
                  <div style={{fontSize:12,color:T.textMuted}}>Versé le {inc.day}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <Pill color={T.green}>{fmt(inc.amount)}</Pill>
                  <button onClick={()=>delInc(inc.id)} style={{background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:20}}>×</button>
                </div>
              </div>
            ))}
          </Glass>
        </div>

        {/* Recurring exp */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.textMuted,letterSpacing:.8}}>DÉPENSES FIXES</div>
            <button onClick={()=>{setRecF({label:"",amount:"",category:"logement",day:1});setSheet("addRec");}} style={{background:T.red+"22",border:`1px solid ${T.red}44`,borderRadius:10,padding:"6px 14px",color:T.red,fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Ajouter</button>
          </div>
          {recurring.length===0&&<div style={{color:T.textMuted,fontSize:14,textAlign:"center",padding:20}}>Aucune dépense fixe</div>}
          <Glass padding="0" radius={20} style={{overflow:"hidden"}}>
            {recurring.map((r,i)=>{
              const cat=getCat(r.category);
              return (
                <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:i<recurring.length-1?`1px solid ${T.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Avatar icon={cat.icon} color={cat.color} size={38} />
                    <div>
                      <div style={{fontWeight:600,fontSize:15,color:T.text}}>{r.label}</div>
                      <div style={{fontSize:12,color:T.textMuted}}>Le {r.day} · {cat.label}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Pill color={T.red}>{fmt(r.amount)}</Pill>
                    <button onClick={()=>delRec(r.id)} style={{background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:20}}>×</button>
                  </div>
                </div>
              );
            })}
          </Glass>
        </div>

        {/* Budgets */}
        <div>
          <div style={{fontSize:12,fontWeight:700,color:T.textMuted,letterSpacing:.8,marginBottom:12}}>BUDGETS PAR CATÉGORIE</div>
          <Glass padding="0" radius={20} style={{overflow:"hidden"}}>
            {CATEGORIES.filter(c=>c.id!=="autre"&&c.id!=="twint_out").map((cat,i,arr)=>(
              <div key={cat.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>{cat.icon}</span>
                  <span style={{fontSize:15,color:T.text,fontWeight:500}}>{cat.label}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12,color:T.textMuted}}>CHF</span>
                  <input type="number" placeholder="—" value={budgets[cat.id]||""} onChange={e=>setBud(p=>({...p,[cat.id]:e.target.value}))} style={{width:72,background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 10px",color:T.text,fontSize:14,textAlign:"right",outline:"none",fontFamily:"inherit"}} />
                </div>
              </div>
            ))}
          </Glass>
        </div>
      </div>
    );
  }

  // ─── SHEETS ──────────────────────────────────────────────────────────────────
  function AddTxSheet() {
    const [f,setF]=useState(txForm);
    return (
      <Sheet title={f.isIncome?"Nouveau revenu":"Nouvelle dépense"} onClose={()=>setSheet(null)}>
        <div style={{display:"flex",gap:8,marginBottom:20,background:T.surfaceHigh,borderRadius:16,padding:4}}>
          {[{k:false,l:"💸 Dépense"},{k:true,l:"💰 Revenu"}].map(({k,l})=>(
            <button key={String(k)} onClick={()=>setF(p=>({...p,isIncome:k}))} style={{flex:1,background:f.isIncome===k?T.bg2:"transparent",border:"none",borderRadius:12,padding:"10px",color:f.isIncome===k?T.text:T.textSub,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:f.isIncome===k?T.shadowSm:"none",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
        <SField label="Description"><SInput placeholder="Ex: Migros, Salaire…" value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} /></SField>
        <SField label="Montant (CHF)"><SInput type="number" placeholder="0.00" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></SField>
        {!f.isIncome&&<SField label="Catégorie"><CatPicker value={f.category} onChange={v=>setF(p=>({...p,category:v}))} /></SField>}
        <SField label="Date"><SInput type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))} /></SField>
        <SBtn full onClick={()=>{if(!f.description||!f.amount)return;addTx(f);setSheet(null);}}>Ajouter</SBtn>
      </Sheet>
    );
  }

  function AddIncSheet() {
    const [f,setF]=useState(incForm);
    return (
      <Sheet title="Revenu récurrent" subtitle="Compte automatiquement chaque mois" onClose={()=>setSheet(null)}>
        <SField label="Label"><SInput placeholder="Ex: Salaire HouseTrap" value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))} /></SField>
        <SField label="Montant net (CHF)"><SInput type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></SField>
        <SField label="Jour de versement"><SInput type="number" min={1} max={31} value={f.day} onChange={e=>setF(p=>({...p,day:e.target.value}))} /></SField>
        <SBtn full variant="success" onClick={()=>{if(!f.label||!f.amount)return;addInc(f);setSheet(null);}}>Enregistrer</SBtn>
      </Sheet>
    );
  }

  function AddRecSheet() {
    const [f,setF]=useState(recForm);
    return (
      <Sheet title="Dépense fixe" subtitle="Loyer, abonnements…" onClose={()=>setSheet(null)}>
        <SField label="Label"><SInput placeholder="Ex: Loyer, Spotify…" value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))} /></SField>
        <SField label="Montant (CHF)"><SInput type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></SField>
        <SField label="Catégorie"><CatPicker value={f.category} onChange={v=>setF(p=>({...p,category:v}))} /></SField>
        <SField label="Jour de prélèvement"><SInput type="number" min={1} max={31} value={f.day} onChange={e=>setF(p=>({...p,day:e.target.value}))} /></SField>
        <SBtn full variant="danger" onClick={()=>{if(!f.label||!f.amount)return;addRec(f);setSheet(null);}}>Ajouter</SBtn>
      </Sheet>
    );
  }

  function ImportLoadingSheet() {
    return (
      <Sheet title="Analyse en cours…" onClose={()=>{}}>
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <div style={{fontSize:56,marginBottom:20}}>🤖</div>
          <div style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:8}}>Catégorisation IA</div>
          <div style={{fontSize:14,color:T.textMuted,marginBottom:32}}>Claude analyse tes transactions…</div>
          <div style={{display:"flex",justifyContent:"center",gap:8}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:10,height:10,borderRadius:"50%",background:T.accent,animation:`pulse 1.2s ${i*.25}s infinite`}} />
            ))}
          </div>
        </div>
      </Sheet>
    );
  }

  function ReviewSheet() {
    const [items,setItems]=useState(importItems);
    const inc=items.filter(t=>t.isIncome), exp=items.filter(t=>!t.isIncome);
    const on=items.filter(t=>t._on);
    const toggle=idx=>setItems(p=>p.map(t=>t._idx===idx?{...t,_on:!t._on}:t));
    const setCat=(idx,cat)=>setItems(p=>p.map(t=>t._idx===idx?{...t,category:cat}:t));
    return (
      <Sheet title={`Vérifier l'import`} subtitle={`${on.length}/${items.length} sélectionnées`} onClose={()=>setSheet(null)}>
        {inc.length>0&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:T.green,letterSpacing:.6,marginBottom:10}}>REVENUS ({inc.length})</div>
            {inc.map(t=>(
              <div key={t._idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.surfaceHigh,border:`1px solid ${t._on?T.green+"44":T.border}`,borderRadius:14,padding:"12px 14px",marginBottom:8,opacity:t._on?1:.4}}>
                <div style={{minWidth:0,flex:1,marginRight:10}}>
                  <div style={{fontWeight:600,fontSize:14,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{t.date}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontWeight:700,color:T.green}}>{fmt(t.amount)}</span>
                  <input type="checkbox" checked={t._on} onChange={()=>toggle(t._idx)} style={{width:18,height:18}} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{fontSize:12,fontWeight:700,color:T.red,letterSpacing:.6,marginBottom:10}}>DÉPENSES ({exp.length})</div>
        {exp.map(t=>{
          const cat=getCat(t.category);
          return (
            <div key={t._idx} style={{background:T.surfaceHigh,border:`1px solid ${t._on?cat.color+"44":T.border}`,borderRadius:14,padding:"12px 14px",marginBottom:8,opacity:t._on?1:.4}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:t._on?10:0}}>
                <div style={{minWidth:0,flex:1,marginRight:10}}>
                  <div style={{fontWeight:600,fontSize:14,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{t.date}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontWeight:700,color:T.red}}>{fmt(t.amount)}</span>
                  <input type="checkbox" checked={t._on} onChange={()=>toggle(t._idx)} style={{width:18,height:18}} />
                </div>
              </div>
              {t._on&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {CATEGORIES.map(c=>(
                    <button key={c.id} onClick={()=>setCat(t._idx,c.id)} style={{background:t.category===c.id?c.color+"22":T.surface,border:`1px solid ${t.category===c.id?c.color:T.border}`,borderRadius:14,padding:"4px 10px",color:t.category===c.id?c.color:T.textMuted,fontSize:11,cursor:"pointer",fontWeight:t.category===c.id?700:400}}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div style={{position:"sticky",bottom:0,background:T.bg2,paddingTop:12,marginTop:8}}>
          <SBtn full variant="success" onClick={()=>{setImp(items);confirmImport();}}>Importer {on.length} transaction{on.length>1?"s":""}</SBtn>
        </div>
      </Sheet>
    );
  }

  function CatDetailSheet() {
    const cat=getCat(catDetail);
    const catTx=expenses.filter(t=>t.category===catDetail).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const total=catTx.reduce((s,t)=>s+Number(t.amount),0);
    const bud=Number(budgets[catDetail]||0);
    return (
      <Sheet title={cat.label} subtitle={`${MONTHS[month]} ${year}`} onClose={()=>setSheet(null)}>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <Glass radius={16} padding="14px 16px" style={{flex:1}}>
            <div style={{fontSize:11,color:T.textMuted,fontWeight:600,marginBottom:4}}>TOTAL</div>
            <div style={{fontSize:20,fontWeight:800,color:cat.color}}>{fmt(total)}</div>
          </Glass>
          {bud>0&&(
            <Glass radius={16} padding="14px 16px" style={{flex:1}}>
              <div style={{fontSize:11,color:T.textMuted,fontWeight:600,marginBottom:4}}>BUDGET</div>
              <div style={{fontSize:20,fontWeight:800,color:total>bud?T.red:T.green}}>{fmt(bud)}</div>
            </Glass>
          )}
        </div>
        {bud>0&&<div style={{marginBottom:16}}><ProgressBar value={total} max={bud} color={total>bud?T.red:cat.color} height={6} /></div>}
        {catTx.length===0&&<div style={{textAlign:"center",color:T.textMuted,padding:24}}>Aucune dépense</div>}
        <Glass padding="0 16px" radius={20}>
          {catTx.map(t=><TxRow key={t.id} t={t} onDelete={()=>askDel(t)} />)}
        </Glass>
      </Sheet>
    );
  }

  function IncDetailSheet() {
    const total=totalIncome;
    return (
      <Sheet title="Revenus" subtitle={`${MONTHS[month]} ${year}`} onClose={()=>setSheet(null)}>
        {incomes.length>0&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:T.textMuted,letterSpacing:.6,marginBottom:10}}>FIXES CONFIGURÉS</div>
            <Glass padding="0 16px" radius={18}>
              {incomes.map(inc=>(
                <div key={inc.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:15,color:T.text}}>{inc.label}</div>
                    <div style={{fontSize:12,color:T.textMuted}}>Versé le {inc.day}</div>
                  </div>
                  <span style={{fontWeight:700,color:T.green}}>{fmt(inc.amount)}</span>
                </div>
              ))}
            </Glass>
          </div>
        )}
        {incTx.length>0&&(
          <div>
            <div style={{fontSize:12,fontWeight:700,color:T.textMuted,letterSpacing:.6,marginBottom:10}}>ENTRÉES IMPORTÉES</div>
            <Glass padding="0 16px" radius={18}>
              {incTx.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=>(
                <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{minWidth:0,flex:1,marginRight:10}}>
                    <div style={{fontWeight:600,fontSize:15,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
                    <div style={{fontSize:12,color:T.textMuted}}>{t.date}</div>
                  </div>
                  <span style={{fontWeight:700,color:T.green,flexShrink:0}}>+{fmt(t.amount)}</span>
                </div>
              ))}
            </Glass>
          </div>
        )}
        {incTx.length===0&&incomes.length===0&&<div style={{textAlign:"center",color:T.textMuted,padding:24}}>Aucun revenu ce mois</div>}
        <Glass padding="14px 18px" radius={16} style={{marginTop:16,display:"flex",justifyContent:"space-between"}}>
          <span style={{color:T.textSub,fontWeight:600}}>Total</span>
          <span style={{fontWeight:800,color:T.green,fontSize:17}}>{fmt(total)}</span>
        </Glass>
      </Sheet>
    );
  }

  function HistorySheet() {
    const filtered=transactions.filter(t=>!searchQ||t.description?.toLowerCase().includes(searchQ.toLowerCase())).slice(0,100);
    return (
      <Sheet title="Historique" onClose={()=>setSheet(null)}>
        <div style={{marginBottom:16}}>
          <SInput placeholder="🔍 Rechercher…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} />
        </div>
        {filtered.length===0&&<div style={{textAlign:"center",color:T.textMuted,padding:24}}>Aucune transaction</div>}
        <Glass padding="0 16px" radius={20}>
          {filtered.map(t=><TxRow key={t.id} t={t} onDelete={()=>askDel(t)} />)}
        </Glass>
      </Sheet>
    );
  }

  // ─── Layout ────────────────────────────────────────────────────────────────
  const TABS=[
    {id:"home",  icon:"􀉩", label:"Accueil"},
    {id:"annual",icon:"📊", label:"Année"},
    {id:"settings",icon:"⚙️",label:"Réglages"},
  ];

  return (
    <div style={{ background:T.bg, minHeight:"100dvh", fontFamily:"-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", color:T.text, maxWidth:430, margin:"0 auto", position:"relative" }}>
      <style>{`
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
        html,body{background:${T.bg}!important;margin:0;padding:0;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input[type=date]{color-scheme:${themeKey};}
        ::-webkit-scrollbar{display:none;}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.75)}50%{opacity:1;transform:scale(1)}}
      `}</style>

      {/* Content */}
      <div style={{ padding:"60px 16px 96px" }}>
        {tab==="home"     && <HomeTab />}
        {tab==="annual"   && <AnnualTab />}
        {tab==="settings" && <SettingsTab />}
      </div>

      {/* Tab bar — Liquid Glass */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, zIndex:200, padding:"0 16px 0", paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
        <div style={{ background:T.glass, backdropFilter:T.glassBlur, WebkitBackdropFilter:T.glassBlur, border:`1px solid ${T.glassBorder}`, borderRadius:"22px 22px 0 0", display:"flex", padding:"10px 8px 12px", boxShadow:T.shadow }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 0", position:"relative" }}>
              {tab===t.id && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", width:32, height:3, borderRadius:"0 0 4px 4px", background:`linear-gradient(90deg,${T.accent},${T.accentLight})` }} />}
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontSize:10, fontWeight:tab===t.id?800:500, color:tab===t.id?T.accent:T.textMuted, letterSpacing:.3 }}>{t.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sheets */}
      {sheet==="addTx"    && <AddTxSheet />}
      {sheet==="addInc"   && <AddIncSheet />}
      {sheet==="addRec"   && <AddRecSheet />}
      {sheet==="import"   && importLoading && <ImportLoadingSheet />}
      {sheet==="review"   && !importLoading && <ReviewSheet />}
      {sheet==="history"  && <HistorySheet />}
      {sheet==="catDetail"&& catDetail && <CatDetailSheet />}
      {sheet==="incDetail"&& <IncDetailSheet />}

      <Toast msg={toast} onDone={()=>setToast("")} />
      {confirmDel && <ConfirmDialog msg={`Supprimer "${confirmDel.label}" ?`} onConfirm={()=>delTx(confirmDel.id)} onCancel={()=>setConf(null)} />}
    </div>
  );
}
