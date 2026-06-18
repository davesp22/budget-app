import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:      "#0A0C12",
  surface: "#12151E",
  card:    "#181C28",
  border:  "#232840",
  accent:  "#5B8AF0",
  green:   "#29D49A",
  red:     "#F05B5B",
  yellow:  "#F0C429",
  purple:  "#9B6EF0",
  text:    "#E6E9F4",
  muted:   "#606888",
  dim:     "#2A3050",
};

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MONTHS_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "alimentation", label: "Alimentation", icon: "🛒", color: "#29D49A",
    keywords: ["coop","migros","aldi","lidl","denner","spar","volg","pick pay","laiterie","boucherie","boulangerie","fromagerie","epicerie","manor food","supermarché","grocery","cominox","gottardo"] },
  { id: "restaurant",   label: "Restaurant",   icon: "🍽️", color: "#F0C429",
    keywords: ["mcdonald","mcdo","burger king","kfc","subway","starbucks","uber eats","ubereats","hungry bear","chez mon cousin","imprévu café","imprevu cafe","sixty five","big brother tacos","can dersim","kebab","pizzeria","pizza","sushi","restaurant","bistro","brasserie","trattoria","grotto","café","cafe","bar ","food","take away","takeaway","tacos","laseRed"] },
  { id: "transport",    label: "Transport",    icon: "🚗", color: "#5B8AF0",
    keywords: ["sbb","cff","tpf","tpl","tl","bls","flixbus","bus","train","taxi","uber ","parking","tamoil","esso","shell","bp ","agrola","socar","coop pronto","migrol","autoroute","vignette","mobility"] },
  { id: "loisirs",      label: "Loisirs",      icon: "🎮", color: "#9B6EF0",
    keywords: ["netflix","spotify","disney","apple","steam","playstation","xbox","nintendo","cinema","theatre","concert","fitness","piscine","musée","billets","ticket","airbnb","hôtel","hotel","booking","fnac","intersport","decathlon","claude","anthropic","chatgpt","openai"] },
  { id: "sante",        label: "Santé",        icon: "💊", color: "#F07B5B",
    keywords: ["pharmacie","médecin","docteur","dentiste","hôpital","hopital","concordia","sanitas","css","swica","visana","helsana","atupri","droguerie","apotheke","cabinet"] },
  { id: "vetements",    label: "Vêtements",    icon: "👕", color: "#F05BAA",
    keywords: ["zara","h&m","hm ","pull","manor","zalando","nike","adidas","bestsecret","best secret","hetm","black and white","lyre ","clothing","vêtement","mode","boutique"] },
  { id: "logement",     label: "Logement",     icon: "🏠", color: "#5BF0D4",
    keywords: ["loyer","conforama","ikea","jumbo","obi","bricorama","luminaire","électricité","chauffage","eau ","gaz ","internet","swisscom","salt ","sunrise","upc","office de la circulation"] },
  { id: "tech",         label: "Tech / Achat", icon: "💻", color: "#60A5FA",
    keywords: ["digitec","galaxus","aliexpress","amazon","mediamarkt","media markt","fnac","microspot","interdiscount","brack","apple store","sags"] },
  { id: "twint_out",    label: "TWINT envoyé", icon: "📲", color: "#FB923C",
    keywords: [] }, // géré par type d'activité Neon
  { id: "autre",        label: "Autre",        icon: "📦", color: "#606888",
    keywords: [] },
];

// Types Neon à ignorer complètement
const NEON_SKIP_TYPES = ["REWARD_RECEIVED","GOAL_WITHDRAWAL","GOAL_DEPOSIT","CASH_TRANSACTION_RELATED_OTHER"];
// Types Neon = revenu
const NEON_INCOME_TYPES = ["PAYMENT_TRANSACTION_IN","CARD_TRANSACTION_IN","CASH_TRANSACTION_OTHER","TRANSFER_IN"];
// Types Neon = dépense
const NEON_EXPENSE_TYPES = ["CARD_TRANSACTION_OUT","PAYMENT_TRANSACTION_OUT","TRANSFER_OUT"];

function cleanName(s) {
  return s.replace(/"""/g,"").replace(/"/g,"").replace(/^Twint (à|de) /i,"").replace(/^Transfert (à|de) /i,"").trim();
}

function smartCategorize(description, activityType) {
  if (!description) return "autre";
  const d = description.toLowerCase();

  // TWINT sortant détecté par type d'activité Neon
  if (activityType === "PAYMENT_TRANSACTION_OUT" && d.includes("twint")) return "twint_out";

  for (const cat of CATEGORIES) {
    if (cat.id === "twint_out") continue;
    if (cat.keywords.some(k => d.includes(k))) return cat.id;
  }
  return "autre";
}

// ─── CSV parsers ──────────────────────────────────────────────────────────────
function cleanCell(s) { return (s||"").replace(/"""/g,"").replace(/"/g,"").trim(); }

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  const sep = ";";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === sep && !inQuotes) { result.push(current.trim()); current = ""; continue; }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function toDate(str) {
  if (!str) return null;
  const s = cleanCell(str);
  const m1 = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,"0")}-${m1[1].padStart(2,"0")}`;
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return s.slice(0,10);
  return null;
}

function toAmount(str) {
  if (!str) return 0;
  const s = cleanCell(str).replace(/['''\s]/g,"").replace(",",".");
  const n = parseFloat(s.replace(/[^0-9.\-]/g,""));
  return isNaN(n) ? 0 : n;
}

function detectAndParseCSV(text) {
  // Strip BOM
  const clean = text.replace(/^\uFEFF/,"");
  const lines = clean.trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  const header = lines[0].toLowerCase();

  // Neon: has "activity type" column
  if (header.includes("activity type") || header.includes("activity name")) {
    return parseNeon(lines);
  }
  // Yuh: has "original amount" and "exchange rate"
  if (header.includes("original amount") || header.includes("exchange rate") || header.includes("original currency")) {
    return parseYuh(lines);
  }
  return parseGeneric(lines);
}

// Neon CSV: DATE;ACTIVITY TYPE;ACTIVITY NAME;DEBIT;DEBIT CURRENCY;CREDIT;CREDIT CURRENCY;CARD NUMBER;LOCALITY;RECIPIENT;SENDER;...
function parseNeon(lines) {
  const headers = parseCSVLine(lines[0]).map(h => cleanCell(h).toLowerCase());
  const dateIdx     = headers.findIndex(h => h === "date");
  const typeIdx     = headers.findIndex(h => h === "activity type");
  const nameIdx     = headers.findIndex(h => h === "activity name");
  const debitIdx    = headers.findIndex(h => h === "debit");
  const creditIdx   = headers.findIndex(h => h === "credit");
  const localityIdx = headers.findIndex(h => h === "locality");
  const recipIdx    = headers.findIndex(h => h === "recipient");

  const txs = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseCSVLine(lines[i]);
    const actType = cleanCell(cols[typeIdx] || "");
    if (NEON_SKIP_TYPES.includes(actType)) continue;

    const date = toDate(cols[dateIdx] || "");
    if (!date) continue;

    const rawName = cleanCell(cols[nameIdx] || "");
    // Use recipient name if available, else clean the activity name
    const recipRaw = cleanCell(cols[recipIdx] || "");
    const description = recipRaw || cleanName(rawName);

    const debit  = toAmount(cols[debitIdx]  || "");
    const credit = toAmount(cols[creditIdx] || "");
    const isIncome = NEON_INCOME_TYPES.includes(actType) || credit > 0;
    const amount = Math.abs(debit || credit);
    if (amount === 0) continue;

    const category = isIncome ? "income" : smartCategorize(description + " " + rawName, actType);
    txs.push({ date, description, amount, isIncome, category, source: "neon" });
  }
  return txs;
}

// Yuh CSV: "Date";"Amount";"Original amount";"Original currency";"Exchange rate";"Description";"Subject";"Category"...
// Amount est déjà en CHF (converti par Yuh). Négatif = dépense, positif = revenu.
function parseYuh(lines) {
  const headers = parseCSVLine(lines[0]).map(h => cleanCell(h).toLowerCase());
  const dateIdx   = headers.findIndex(h => h === "date");
  const amtIdx    = headers.findIndex(h => h === "amount");
  const descIdx   = headers.findIndex(h => h === "description");
  const catIdx    = headers.findIndex(h => h === "category");

  const txs = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols   = parseCSVLine(lines[i]);
    const date   = toDate(cols[dateIdx] || "");
    const amount = toAmount(cols[amtIdx] || "");
    if (!date || amount === 0) continue;

    const description = cleanCell(cols[descIdx] || "");
    const yuhCat = cleanCell(cols[catIdx] || "").toLowerCase();
    const isIncome = amount > 0 || yuhCat === "income";

    // Map Yuh categories to ours
    let category = "autre";
    if (isIncome) category = "income";
    else if (yuhCat === "food") category = "restaurant";
    else if (yuhCat === "household") category = "logement";
    else if (yuhCat === "shopping") category = "tech";
    else if (yuhCat === "leisure") category = smartCategorize(description, "");
    else category = smartCategorize(description, "");

    txs.push({ date, description, amount: Math.abs(amount), isIncome, category, source: "yuh" });
  }
  return txs;
}

function parseGeneric(lines) {
  const headers = parseCSVLine(lines[0]).map(h => cleanCell(h).toLowerCase());
  const dateIdx   = headers.findIndex(h => h.includes("date") || h.includes("datum"));
  const amountIdx = headers.findIndex(h => h.includes("amount") || h.includes("betrag") || h.includes("montant"));
  const descIdx   = headers.findIndex(h => h.includes("desc") || h.includes("label") || h.includes("text") || h.includes("merchant"));

  const txs = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols   = parseCSVLine(lines[i]);
    const amount = toAmount(cols[amountIdx >= 0 ? amountIdx : 1] || "");
    const date   = toDate(cols[dateIdx >= 0 ? dateIdx : 0] || "");
    const desc   = cleanCell(cols[descIdx >= 0 ? descIdx : 2] || "");
    if (!date || amount === 0) continue;
    txs.push({ date, description: desc, amount: Math.abs(amount), isIncome: amount > 0, category: smartCategorize(desc,""), source: "import" });
  }
  return txs;
}

// ─── AI Categorization via Claude API ────────────────────────────────────────
async function aiCategorizeMultiple(transactions) {
  const toClassify = transactions.filter(t => !t.isIncome).slice(0, 40);
  if (toClassify.length === 0) return {};

  const prompt = `Tu es un assistant de classification de dépenses bancaires suisses.
Classe chaque transaction dans UNE des catégories suivantes :
alimentation, restaurant, transport, loisirs, sante, vetements, logement, twint_out, autre

Transactions à classifier (format: index|description|montant):
${toClassify.map((t, i) => `${i}|${t.description}|CHF ${t.amount}`).join("\n")}

Réponds UNIQUEMENT en JSON valide, un tableau d'objets: [{"index":0,"category":"alimentation"}, ...]
Pas de texte avant ou après.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const results = JSON.parse(clean);
    const map = {};
    for (const r of results) {
      const tx = toClassify[r.index];
      if (tx) map[tx.description + "|" + tx.amount] = r.category;
    }
    return map;
  } catch {
    return {};
  }
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const SK = { tx: "bgt_tx2", income: "bgt_inc2", recurring: "bgt_rec2", budgets: "bgt_bud2", settings: "bgt_set2" };
const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const fmt = (n) => `CHF ${Math.abs(Number(n)).toFixed(2)}`;
const today = () => new Date().toISOString().slice(0, 10);

function getCat(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]; }

// ─── UI Components ────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { if (msg) { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); } }, [msg]);
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:T.green, color:"#000", borderRadius:14, padding:"11px 22px", fontWeight:700, fontSize:14, zIndex:999, boxShadow:"0 4px 24px #0009", whiteSpace:"nowrap", letterSpacing:".2px" }}>
      {msg}
    </div>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#000B", zIndex:500, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, borderRadius:"22px 22px 0 0", width:"100%", maxHeight:"92vh", overflowY:"auto", padding:"0 20px 44px" }}>
        <div style={{ position:"sticky", top:0, background:T.surface, paddingTop:12, paddingBottom:12, zIndex:1 }}>
          <div style={{ width:36, height:4, background:T.dim, borderRadius:2, margin:"0 auto 14px" }} />
          <div style={{ fontWeight:800, fontSize:18, color:T.text }}>{title}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:11, color:T.muted, fontWeight:700, marginBottom:6, letterSpacing:".6px" }}>{label.toUpperCase()}</div>}
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return <input {...props} style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:11, padding:"13px 14px", color:T.text, fontSize:15, outline:"none", boxSizing:"border-box", ...props.style }} />;
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:11, padding:"13px 14px", color:T.text, fontSize:15, outline:"none", appearance:"none" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Btn({ children, variant="primary", full, sm, onClick, style: s={} }) {
  const bg = variant==="primary" ? T.accent : variant==="success" ? T.green : variant==="danger" ? T.red : T.card;
  const color = variant==="ghost" ? T.text : variant==="success" ? "#000" : "#fff";
  return (
    <button onClick={onClick} style={{ background:bg, color, border:variant==="ghost"?`1px solid ${T.border}`:"none", borderRadius:12, padding:sm?"8px 16px":"14px 20px", fontWeight:700, fontSize:sm?13:15, cursor:"pointer", width:full?"100%":"auto", ...s }}>
      {children}
    </button>
  );
}

function CatChips({ value, onChange }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
      {CATEGORIES.map(cat => (
        <button key={cat.id} onClick={() => onChange(cat.id)} style={{ background:value===cat.id ? cat.color : T.card, border:`1px solid ${value===cat.id ? cat.color : T.border}`, borderRadius:20, padding:"6px 12px", color:value===cat.id?"#fff":T.text, fontSize:13, cursor:"pointer", fontWeight:value===cat.id?700:400, transition:"all .15s" }}>
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const now = new Date();
  const [tab, setTab] = useState("home");
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [transactions, setTx] = useState(() => load(SK.tx, []));
  const [incomes, setIncomes] = useState(() => load(SK.income, []));
  const [recurring, setRec] = useState(() => load(SK.recurring, []));
  const [budgets, setBudgets] = useState(() => load(SK.budgets, {}));

  // Modals
  const [sheet, setSheet] = useState(null); // "addTx"|"addInc"|"addRec"|"import"|"review"|"history"|"settings"|"insights"
  const [toast, setToast] = useState("");

  // Import flow
  const [importParsed, setImportParsed] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [reviewItems, setReviewItems] = useState([]);

  // Manual add forms
  const [txForm, setTxForm] = useState({ description:"", amount:"", category:"alimentation", date:today(), isIncome:false });
  const [incForm, setIncForm] = useState({ label:"", amount:"", type:"salary", day:25, recurring:true });
  const [recForm, setRecForm] = useState({ label:"", amount:"", category:"logement", day:1 });

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [catDetail, setCatDetail] = useState(null);

  const fileRef = useRef();

  // Persist
  useEffect(() => save(SK.tx, transactions), [transactions]);
  useEffect(() => save(SK.income, incomes), [incomes]);
  useEffect(() => save(SK.recurring, recurring), [recurring]);
  useEffect(() => save(SK.budgets, budgets), [budgets]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const prevMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    return d.getMonth() === pm && d.getFullYear() === py;
  });

  const expenses = monthTx.filter(t => !t.isIncome);
  const manualIncome = monthTx.filter(t => t.isIncome).reduce((s, t) => s + Number(t.amount), 0);
  const recurringIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalIncome = manualIncome + recurringIncome;
  const totalRecurring = recurring.reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0) + totalRecurring;
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0;

  const spentByCat = {};
  for (const t of expenses) spentByCat[t.category] = (spentByCat[t.category] || 0) + Number(t.amount);

  const prevSpentByCat = {};
  for (const t of prevMonthTx.filter(x => !x.isIncome))
    prevSpentByCat[t.category] = (prevSpentByCat[t.category] || 0) + Number(t.amount);

  // Annual
  const annualData = Array.from({ length:12 }, (_, i) => {
    const monthTxs = transactions.filter(t => { const d = new Date(t.date); return d.getMonth()===i && d.getFullYear()===year; });
    const spent = monthTxs.filter(t => !t.isIncome).reduce((s,t) => s+Number(t.amount),0) + totalRecurring;
    const earned = monthTxs.filter(t => t.isIncome).reduce((s,t) => s+Number(t.amount),0) + recurringIncome;
    return { month: MONTHS_SHORT[i], spent, earned };
  });

  // Insights
  const insights = [];
  for (const cat of CATEGORIES) {
    const curr = spentByCat[cat.id] || 0;
    const prev = prevSpentByCat[cat.id] || 0;
    if (curr > 0 && prev > 0) {
      const diff = ((curr - prev) / prev) * 100;
      if (diff > 30) insights.push({ type:"warning", msg:`+${diff.toFixed(0)}% en ${cat.label} vs mois dernier`, icon:cat.icon });
      if (diff < -25) insights.push({ type:"good", msg:`-${Math.abs(diff).toFixed(0)}% en ${cat.label} vs mois dernier`, icon:cat.icon });
    }
    const budget = Number(budgets[cat.id] || 0);
    if (budget > 0 && curr > budget * 0.9) insights.push({ type:"alert", msg:`${cat.label} : ${curr > budget ? "dépassé" : "proche du budget"} (${fmt(curr)} / ${fmt(budget)})`, icon:cat.icon });
  }
  if (savingsRate > 20) insights.push({ type:"good", msg:`Taux d'épargne de ${savingsRate}% ce mois 🎯`, icon:"💰" });

  // ── Actions ───────────────────────────────────────────────────────────────
  function addTx(data) { setTx(p => [{ id: Date.now() + Math.random(), ...data }, ...p]); setToast("✅ Ajouté"); }
  function delTx(id) { setTx(p => p.filter(x => x.id !== id)); setToast("🗑 Supprimé"); }
  function addIncome(data) { setIncomes(p => [...p, { id: Date.now(), ...data }]); setToast("✅ Revenu ajouté"); }
  function delIncome(id) { setIncomes(p => p.filter(x => x.id !== id)); setToast("🗑 Supprimé"); }
  function addRec(data) { setRec(p => [...p, { id: Date.now(), ...data }]); setToast("✅ Récurrente ajoutée"); }
  function delRec(id) { setRec(p => p.filter(x => x.id !== id)); setToast("🗑 Supprimé"); }

  // ── CSV Import ────────────────────────────────────────────────────────────
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportLoading(true);
    setSheet("import");

    const text = await file.text();
    const parsed = detectAndParseCSV(text);

    if (!parsed || parsed.length === 0) {
      setImportLoading(false);
      setToast("❌ Format CSV non reconnu");
      setSheet(null);
      return;
    }

    // Pre-categorize with rules
    const withCats = parsed.map(t => ({ ...t, category: t.isIncome ? "income" : smartCategorize(t.description, t.amount) }));

    // AI categorization
    try {
      const aiMap = await aiCategorizeMultiple(withCats);
      const withAI = withCats.map(t => {
        const key = t.description + "|" + t.amount;
        return { ...t, category: aiMap[key] || t.category };
      });
      setImportParsed(withAI);
      setReviewItems(withAI.map((t, i) => ({ ...t, _idx: i, _include: true })));
    } catch {
      setImportParsed(withCats);
      setReviewItems(withCats.map((t, i) => ({ ...t, _idx: i, _include: true })));
    }

    setImportLoading(false);
    setSheet("review");
  }

  function confirmImport() {
    const toAdd = reviewItems.filter(t => t._include).map(({ _idx, _include, ...t }) => ({ id: Date.now() + Math.random() + _idx, ...t }));
    setTx(p => [...toAdd, ...p]);
    setSheet(null);
    setToast(`✅ ${toAdd.length} transaction${toAdd.length > 1 ? "s" : ""} importée${toAdd.length > 1 ? "s" : ""}`);
  }

  // ── Month nav ─────────────────────────────────────────────────────────────
  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }

  // ── Filtered history ──────────────────────────────────────────────────────
  const filteredTx = transactions.filter(t => {
    if (!searchQuery) return true;
    return t.description?.toLowerCase().includes(searchQuery.toLowerCase());
  }).slice(0, 100);

  // ─── TABS ─────────────────────────────────────────────────────────────────

  // HOME
  function HomeTab() {
    return (
      <div>
        {/* Month nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <button onClick={prevMonth} style={{ background:"none", border:"none", color:T.muted, fontSize:24, cursor:"pointer", padding:"4px 8px" }}>‹</button>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontWeight:800, fontSize:18, color:T.text }}>{MONTHS[month]}</div>
            <div style={{ fontSize:12, color:T.muted }}>{year}</div>
          </div>
          <button onClick={nextMonth} style={{ background:"none", border:"none", color:T.muted, fontSize:24, cursor:"pointer", padding:"4px 8px" }}>›</button>
        </div>

        {/* Balance hero */}
        <div style={{ background:`linear-gradient(135deg, ${T.accent}20, ${balance>=0?T.green:T.red}15)`, border:`1px solid ${balance>=0?T.accent:T.red}33`, borderRadius:22, padding:"24px 20px 20px", marginBottom:14, position:"relative", overflow:"hidden" }}>
          <div style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:1, marginBottom:6 }}>SOLDE DU MOIS</div>
          <div style={{ fontSize:42, fontWeight:900, color:balance>=0?T.green:T.red, letterSpacing:-2, lineHeight:1 }}>
            {balance>=0?"+":""}{fmt(balance)}
          </div>
          {totalIncome > 0 && (
            <div style={{ marginTop:10, fontSize:12, color:T.muted }}>
              Épargne : <span style={{ color:T.text, fontWeight:700 }}>{savingsRate}%</span>
            </div>
          )}
          <div style={{ display:"flex", gap:20, marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
            <div>
              <div style={{ fontSize:11, color:T.muted, fontWeight:600 }}>REVENUS</div>
              <div style={{ fontSize:20, fontWeight:800, color:T.green }}>{fmt(totalIncome)}</div>
            </div>
            <div>
              <div style={{ fontSize:11, color:T.muted, fontWeight:600 }}>DÉPENSES</div>
              <div style={{ fontSize:20, fontWeight:800, color:T.red }}>{fmt(totalExpenses)}</div>
            </div>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div style={{ marginBottom:14 }}>
            {insights.slice(0, 2).map((ins, i) => (
              <div key={i} style={{ background:ins.type==="good"?T.green+"15":ins.type==="alert"?T.red+"15":T.yellow+"15", border:`1px solid ${ins.type==="good"?T.green:ins.type==="alert"?T.red:T.yellow}33`, borderRadius:12, padding:"10px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>{ins.icon}</span>
                <span style={{ fontSize:13, color:T.text, fontWeight:500 }}>{ins.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          <button onClick={() => fileRef.current?.click()} style={{ background:T.accent, border:"none", borderRadius:14, padding:"15px 10px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:22 }}>📂</span>
            Importer CSV
          </button>
          <button onClick={() => { setTxForm({ description:"", amount:"", category:"alimentation", date:today(), isIncome:false }); setSheet("addTx"); }} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"15px 10px", color:T.text, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:22 }}>✏️</span>
            Ajout manuel
          </button>
        </div>

        {/* Recurring warning */}
        {recurring.length > 0 && (
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:13, color:T.text, fontWeight:600 }}>🔄 Dépenses fixes</div>
              <div style={{ fontSize:11, color:T.muted }}>{recurring.length} abonnement{recurring.length>1?"s":""}</div>
            </div>
            <div style={{ fontSize:17, fontWeight:800, color:T.red }}>{fmt(totalRecurring)}</div>
          </div>
        )}

        {/* Categories */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:.8, marginBottom:10 }}>PAR CATÉGORIE</div>
          {CATEGORIES.filter(c => spentByCat[c.id] > 0).map(cat => {
            const spent = spentByCat[cat.id] || 0;
            const budget = Number(budgets[cat.id] || 0);
            const pct = budget > 0 ? Math.min((spent/budget)*100, 100) : 0;
            const over = budget > 0 && spent > budget;
            const prev = prevSpentByCat[cat.id] || 0;
            const trend = prev > 0 ? ((spent-prev)/prev*100).toFixed(0) : null;
            return (
              <div key={cat.id} onClick={() => { setCatDetail(cat.id); setSheet("catDetail"); }} style={{ background:T.card, border:`1px solid ${over?T.red+"66":T.border}`, borderRadius:14, padding:"13px 14px", marginBottom:8, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:11, background:cat.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:T.text }}>{cat.label}</div>
                      {trend && <div style={{ fontSize:11, color: Number(trend)>0?T.red:T.green }}>{Number(trend)>0?"+":""}{trend}% vs mois dernier</div>}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:800, color:over?T.red:cat.color, fontSize:15 }}>{fmt(spent)}</div>
                    {budget > 0 && <div style={{ fontSize:11, color:T.muted }}>/ {fmt(budget)}</div>}
                  </div>
                </div>
                {budget > 0 && (
                  <div style={{ marginTop:10, background:T.dim, borderRadius:6, height:5 }}>
                    <div style={{ width:`${pct}%`, background:over?T.red:cat.color, borderRadius:6, height:5, transition:"width .4s" }} />
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(spentByCat).length === 0 && (
            <div style={{ textAlign:"center", padding:"28px 0", color:T.muted }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
              <div style={{ fontSize:14 }}>Importe un CSV ou ajoute une dépense</div>
            </div>
          )}
        </div>

        {/* Recent */}
        {expenses.length > 0 && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:.8 }}>RÉCENTES</div>
              <button onClick={() => setSheet("history")} style={{ background:"none", border:"none", color:T.accent, fontSize:12, fontWeight:700, cursor:"pointer" }}>Tout voir</button>
            </div>
            {expenses.slice(0, 6).map(t => <TxRow key={t.id} t={t} onDelete={() => delTx(t.id)} />)}
          </div>
        )}

        <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={handleFileUpload} />
      </div>
    );
  }

  function TxRow({ t, onDelete }) {
    const cat = getCat(t.category);
    return (
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:cat.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{cat.icon}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:13, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.description}</div>
            <div style={{ fontSize:11, color:T.muted }}>{t.date} · {cat.label}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <span style={{ fontWeight:800, color:t.isIncome?T.green:T.red, fontSize:14 }}>{t.isIncome?"+":"-"}{fmt(t.amount)}</span>
          {onDelete && <button onClick={onDelete} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:18, padding:"0 2px" }}>×</button>}
        </div>
      </div>
    );
  }

  // ANNUAL
  function AnnualTab() {
    const maxSpent = Math.max(...annualData.map(d => d.spent), 1);
    const totalY = annualData.reduce((s,d) => s+d.spent, 0);
    const realIncY = annualData.reduce((s,d) => s+d.earned, 0);
    return (
      <div>
        <div style={{ fontWeight:800, fontSize:22, color:T.text, marginBottom:4 }}>Année {year}</div>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          <button onClick={() => setYear(y=>y-1)} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:"6px 14px", color:T.muted, cursor:"pointer", fontSize:13 }}>‹ {year-1}</button>
          <button onClick={() => setYear(y=>y+1)} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:9, padding:"6px 14px", color:T.muted, cursor:"pointer", fontSize:13 }}>{year+1} ›</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          {[
            { l:"Revenus totaux", v:fmt(realIncY), c:T.green },
            { l:"Dépenses totales", v:fmt(totalY), c:T.red },
            { l:"Économies", v:fmt(realIncY-totalY), c:realIncY-totalY>=0?T.green:T.red },
            { l:"Moy. mensuelle", v:fmt(totalY/12), c:T.yellow },
          ].map(({ l,v,c }) => (
            <div key={l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 14px" }}>
              <div style={{ fontSize:10, color:T.muted, fontWeight:700, letterSpacing:.6, marginBottom:6 }}>{l.toUpperCase()}</div>
              <div style={{ fontSize:19, fontWeight:900, color:c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px 14px", marginBottom:16 }}>
          <div style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:.6, marginBottom:14 }}>DÉPENSES PAR MOIS</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:120 }}>
            {annualData.map((d, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer" }} onClick={() => { setMonth(i); setTab("home"); }}>
                <div style={{ fontSize:9, color:d.spent>0?T.text:"transparent", fontWeight:700 }}>
                  {d.spent>0?`${(d.spent/1000).toFixed(1)}k`:""}
                </div>
                <div style={{ width:"100%", height:`${Math.max((d.spent/maxSpent)*90,2)}px`, background:i===month?T.accent:T.dim, borderRadius:"4px 4px 0 0", transition:"height .3s" }} />
                <div style={{ fontSize:9, color:i===month?T.accent:T.muted, fontWeight:i===month?700:400 }}>{MONTHS_SHORT[i].slice(0,1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly table */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:T.surface, padding:"10px 14px" }}>
            {["Mois","Dépenses","Solde"].map(h => <div key={h} style={{ fontSize:11, fontWeight:700, color:T.muted }}>{h}</div>)}
          </div>
          {annualData.map((d, i) => {
            const saldo = d.earned - d.spent;
            const hasTx = d.spent > 0 || d.earned > 0;
            return (
              <div key={i} onClick={() => { setMonth(i); setTab("home"); }} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", padding:"12px 14px", borderTop:`1px solid ${T.border}`, cursor:"pointer", background:i===month?T.accent+"12":"transparent" }}>
                <div style={{ fontWeight:i===month?800:400, color:i===month?T.accent:T.text, fontSize:14 }}>{MONTHS_SHORT[i]}</div>
                <div style={{ color:T.red, fontWeight:600, fontSize:14 }}>{d.spent>0?fmt(d.spent):"—"}</div>
                <div style={{ color:hasTx?(saldo>=0?T.green:T.red):T.muted, fontWeight:700, fontSize:14 }}>{hasTx?fmt(Math.abs(saldo)):"—"}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // SETTINGS
  function SettingsTab() {
    return (
      <div>
        <div style={{ fontWeight:800, fontSize:22, color:T.text, marginBottom:20 }}>Paramètres</div>

        {/* Income sources */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:.6 }}>SOURCES DE REVENUS</div>
            <button onClick={() => { setIncForm({ label:"", amount:"", type:"salary", day:25 }); setSheet("addInc"); }} style={{ background:T.green+"22", border:"none", borderRadius:9, padding:"6px 14px", color:T.green, fontWeight:700, fontSize:12, cursor:"pointer" }}>+ Ajouter</button>
          </div>
          {incomes.length === 0 && <div style={{ color:T.muted, fontSize:14, textAlign:"center", padding:16 }}>Aucun revenu configuré</div>}
          {incomes.map(inc => (
            <div key={inc.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"13px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{inc.label}</div>
                <div style={{ fontSize:11, color:T.muted }}>Versé le {inc.day} · {inc.type === "salary" ? "Salaire" : "Autre"}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontWeight:800, color:T.green, fontSize:15 }}>{fmt(inc.amount)}</span>
                <button onClick={() => delIncome(inc.id)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:20 }}>×</button>
              </div>
            </div>
          ))}
        </div>

        {/* Recurring expenses */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:.6 }}>DÉPENSES FIXES MENSUELLES</div>
            <button onClick={() => { setRecForm({ label:"", amount:"", category:"logement", day:1 }); setSheet("addRec"); }} style={{ background:T.red+"22", border:"none", borderRadius:9, padding:"6px 14px", color:T.red, fontWeight:700, fontSize:12, cursor:"pointer" }}>+ Ajouter</button>
          </div>
          {recurring.length === 0 && <div style={{ color:T.muted, fontSize:14, textAlign:"center", padding:16 }}>Aucune dépense fixe</div>}
          {recurring.map(r => {
            const cat = getCat(r.category);
            return (
              <div key={r.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"13px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{r.label}</div>
                    <div style={{ fontSize:11, color:T.muted }}>Le {r.day} · {cat.label}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontWeight:800, color:T.red, fontSize:15 }}>{fmt(r.amount)}</span>
                  <button onClick={() => delRec(r.id)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:20 }}>×</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Budgets */}
        <div>
          <div style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:.6, marginBottom:10 }}>BUDGET PAR CATÉGORIE</div>
          <div style={{ fontSize:12, color:T.muted, marginBottom:12 }}>Définis un plafond mensuel par catégorie pour suivre tes limites.</div>
          {CATEGORIES.filter(c => c.id !== "autre" && c.id !== "twint_out").map(cat => (
            <div key={cat.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"11px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <span>{cat.icon}</span>
                <span style={{ fontSize:14, color:T.text }}>{cat.label}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:T.muted }}>CHF</span>
                <input type="number" placeholder="—" value={budgets[cat.id]||""} onChange={e => setBudgets(p => ({ ...p, [cat.id]: e.target.value }))}
                  style={{ width:72, background:T.surface, border:`1px solid ${T.border}`, borderRadius:9, padding:"7px 9px", color:T.text, fontSize:14, textAlign:"right", outline:"none" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Sheets ───────────────────────────────────────────────────────────────

  function AddTxSheet() {
    const [f, setF] = useState(txForm);
    return (
      <Sheet title={f.isIncome ? "Ajouter un revenu" : "Ajouter une dépense"} onClose={() => setSheet(null)}>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <button onClick={() => setF(p=>({...p,isIncome:false}))} style={{ flex:1, background:!f.isIncome?T.red:T.card, border:`1px solid ${!f.isIncome?T.red:T.border}`, borderRadius:10, padding:"11px", color:!f.isIncome?"#fff":T.muted, fontWeight:700, fontSize:14, cursor:"pointer" }}>💸 Dépense</button>
          <button onClick={() => setF(p=>({...p,isIncome:true}))} style={{ flex:1, background:f.isIncome?T.green:T.card, border:`1px solid ${f.isIncome?T.green:T.border}`, borderRadius:10, padding:"11px", color:f.isIncome?"#000":T.muted, fontWeight:700, fontSize:14, cursor:"pointer" }}>💰 Revenu</button>
        </div>
        <Field label="Description"><Input placeholder="Ex: Migros, Salaire…" value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} /></Field>
        <Field label="Montant (CHF)"><Input type="number" placeholder="0.00" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></Field>
        {!f.isIncome && <Field label="Catégorie"><CatChips value={f.category} onChange={v=>setF(p=>({...p,category:v}))} /></Field>}
        <Field label="Date"><Input type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))} /></Field>
        <Btn full onClick={() => { if (!f.description||!f.amount) return; addTx(f); setSheet(null); }}>Ajouter</Btn>
      </Sheet>
    );
  }

  function AddIncSheet() {
    const [f, setF] = useState(incForm);
    return (
      <Sheet title="Revenu mensuel récurrent" onClose={() => setSheet(null)}>
        <div style={{ fontSize:13, color:T.muted, marginBottom:16 }}>Configure un revenu fixe (salaire, rente…) qui compte automatiquement chaque mois.</div>
        <Field label="Label"><Input placeholder="Ex: Salaire HouseTrap" value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))} /></Field>
        <Field label="Montant net (CHF)"><Input type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></Field>
        <Field label="Type">
          <Select value={f.type} onChange={e=>setF(p=>({...p,type:e.target.value}))} options={[{value:"salary",label:"Salaire"},{value:"other",label:"Autre revenu"}]} />
        </Field>
        <Field label="Jour de versement"><Input type="number" min={1} max={31} value={f.day} onChange={e=>setF(p=>({...p,day:e.target.value}))} /></Field>
        <Btn full variant="success" onClick={() => { if (!f.label||!f.amount) return; addIncome(f); setSheet(null); }}>Enregistrer</Btn>
      </Sheet>
    );
  }

  function AddRecSheet() {
    const [f, setF] = useState(recForm);
    return (
      <Sheet title="Dépense fixe mensuelle" onClose={() => setSheet(null)}>
        <div style={{ fontSize:13, color:T.muted, marginBottom:16 }}>Loyer, abonnements, assurances — ces montants sont déduits automatiquement chaque mois.</div>
        <Field label="Label"><Input placeholder="Ex: Loyer, Spotify, Netflix…" value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))} /></Field>
        <Field label="Montant (CHF)"><Input type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></Field>
        <Field label="Catégorie"><CatChips value={f.category} onChange={v=>setF(p=>({...p,category:v}))} /></Field>
        <Field label="Jour de prélèvement"><Input type="number" min={1} max={31} value={f.day} onChange={e=>setF(p=>({...p,day:e.target.value}))} /></Field>
        <Btn full variant="danger" onClick={() => { if (!f.label||!f.amount) return; addRec(f); setSheet(null); }}>Ajouter</Btn>
      </Sheet>
    );
  }

  function ImportLoadingSheet() {
    return (
      <Sheet title="Analyse en cours…" onClose={() => {}}>
        <div style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
          <div style={{ fontSize:16, color:T.text, fontWeight:700, marginBottom:8 }}>Catégorisation intelligente</div>
          <div style={{ fontSize:14, color:T.muted }}>Claude analyse tes transactions et les classe automatiquement…</div>
          <div style={{ marginTop:24, display:"flex", justifyContent:"center", gap:6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:T.accent, animation:`pulse 1.2s ${i*0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </Sheet>
    );
  }

  function ReviewSheet() {
    const [items, setItems] = useState(reviewItems);
    const incomeItems = items.filter(t => t.isIncome);
    const expenseItems = items.filter(t => !t.isIncome);
    const included = items.filter(t => t._include);

    function toggle(idx) { setItems(p => p.map(t => t._idx===idx ? {...t,_include:!t._include} : t)); }
    function setCat(idx, cat) { setItems(p => p.map(t => t._idx===idx ? {...t,category:cat} : t)); }

    return (
      <Sheet title={`Vérifier l'import (${included.length}/${items.length})`} onClose={() => setSheet(null)}>
        <div style={{ fontSize:13, color:T.muted, marginBottom:16 }}>Vérifie les catégories et décoche ce que tu ne veux pas importer.</div>

        {incomeItems.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:T.green, fontWeight:700, letterSpacing:.6, marginBottom:8 }}>REVENUS DÉTECTÉS ({incomeItems.length})</div>
            {incomeItems.map(t => (
              <div key={t._idx} style={{ background:T.card, border:`1px solid ${t._include?T.green+"66":T.border}`, borderRadius:12, padding:"11px 14px", marginBottom:7, display:"flex", justifyContent:"space-between", alignItems:"center", opacity:t._include?1:.5 }}>
                <div style={{ flex:1, minWidth:0, marginRight:10 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.description}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{t.date}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontWeight:800, color:T.green }}>{fmt(t.amount)}</span>
                  <input type="checkbox" checked={t._include} onChange={() => toggle(t._idx)} style={{ width:18, height:18, cursor:"pointer" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize:11, color:T.red, fontWeight:700, letterSpacing:.6, marginBottom:8 }}>DÉPENSES ({expenseItems.length})</div>
        {expenseItems.map(t => {
          const cat = getCat(t.category);
          return (
            <div key={t._idx} style={{ background:T.card, border:`1px solid ${t._include?cat.color+"55":T.border}`, borderRadius:12, padding:"11px 14px", marginBottom:7, opacity:t._include?1:.5 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:t._include?8:0 }}>
                <div style={{ flex:1, minWidth:0, marginRight:10 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.description}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{t.date}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontWeight:800, color:T.red, fontSize:14 }}>{fmt(t.amount)}</span>
                  <input type="checkbox" checked={t._include} onChange={() => toggle(t._idx)} style={{ width:18, height:18, cursor:"pointer" }} />
                </div>
              </div>
              {t._include && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setCat(t._idx, c.id)} style={{ background:t.category===c.id?c.color:T.surface, border:`1px solid ${t.category===c.id?c.color:T.border}`, borderRadius:16, padding:"4px 9px", color:t.category===c.id?"#fff":T.muted, fontSize:11, cursor:"pointer", fontWeight:t.category===c.id?700:400 }}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ position:"sticky", bottom:0, background:T.surface, paddingTop:12, marginTop:8 }}>
          <Btn full variant="success" onClick={() => { setReviewItems(items); confirmImport(); }}>
            Importer {included.length} transaction{included.length>1?"s":""}
          </Btn>
        </div>
      </Sheet>
    );
  }

  function CatDetailSheet() {
    const cat = getCat(catDetail);
    const catTx = expenses.filter(t => t.category === catDetail).sort((a,b) => new Date(b.date)-new Date(a.date));
    const total = catTx.reduce((s,t) => s+Number(t.amount), 0);
    return (
      <Sheet title={`${cat.icon} ${cat.label}`} onClose={() => setSheet(null)}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:cat.color+"18", border:`1px solid ${cat.color}33`, borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ fontSize:13, color:T.muted, fontWeight:600 }}>Total {MONTHS[month]}</div>
          <div style={{ fontSize:20, fontWeight:800, color:cat.color }}>{fmt(total)}</div>
        </div>
        {catTx.length === 0 && <div style={{ textAlign:"center", color:T.muted, padding:24 }}>Aucune dépense</div>}
        {catTx.map(t => <TxRow key={t.id} t={t} onDelete={() => { delTx(t.id); }} />)}
      </Sheet>
    );
  }

  function HistorySheet() {
    return (
      <Sheet title="Historique complet" onClose={() => setSheet(null)}>
        <div style={{ marginBottom:14 }}>
          <Input placeholder="🔍 Rechercher…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        {filteredTx.length === 0 && <div style={{ textAlign:"center", color:T.muted, padding:24 }}>Aucune transaction</div>}
        {filteredTx.map(t => <TxRow key={t.id} t={t} onDelete={() => delTx(t.id)} />)}
      </Sheet>
    );
  }

  function TxRow({ t, onDelete }) {
    const cat = getCat(t.category);
    return (
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:13, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:cat.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{cat.icon}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:13, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.description}</div>
            <div style={{ fontSize:11, color:T.muted }}>{t.date} · {cat.label}{t.source?` · ${t.source}`:""}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <span style={{ fontWeight:800, color:t.isIncome?T.green:T.red, fontSize:14 }}>{t.isIncome?"+":"-"}{fmt(t.amount)}</span>
          {onDelete && <button onClick={onDelete} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:18, padding:"0 2px" }}>×</button>}
        </div>
      </div>
    );
  }

  // ─── Layout ───────────────────────────────────────────────────────────────
  const TABS = [
    { id:"home",     icon:"🏠", label:"Accueil" },
    { id:"annual",   icon:"📊", label:"Année" },
    { id:"settings", icon:"⚙️", label:"Réglages" },
  ];

  return (
    <div style={{ background:T.bg, minHeight:"100vh", minHeight:"100dvh", fontFamily:"'Inter','SF Pro Display',system-ui,sans-serif", color:T.text, maxWidth:430, margin:"0 auto", position:"relative" }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        html, body { background: #0A0C12 !important; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ padding:"56px 16px 100px" }}>
        {tab === "home"     && <HomeTab />}
        {tab === "annual"   && <AnnualTab />}
        {tab === "settings" && <SettingsTab />}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:T.surface, borderTop:`1px solid ${T.border}`, display:"flex", padding:"10px 0 24px", zIndex:100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 0" }}>
            <span style={{ fontSize:22 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, color:tab===t.id?T.accent:T.muted, letterSpacing:.4 }}>{t.label.toUpperCase()}</span>
            {tab===t.id && <div style={{ width:4, height:4, borderRadius:"50%", background:T.accent }} />}
          </button>
        ))}
      </div>

      {/* Sheets */}
      {sheet === "addTx"   && <AddTxSheet />}
      {sheet === "addInc"  && <AddIncSheet />}
      {sheet === "addRec"  && <AddRecSheet />}
      {sheet === "import"  && importLoading && <ImportLoadingSheet />}
      {sheet === "review"  && !importLoading && <ReviewSheet />}
      {sheet === "history" && <HistorySheet />}
      {sheet === "catDetail" && catDetail && <CatDetailSheet />}

      <Toast msg={toast} onDone={() => setToast("")} />
    </div>
  );
}
