import { useState, useEffect, useRef, useMemo } from "react";

// ════════════════════════════════════════════════════════════════════════════
//  THEME — "Aurora" : charbon profond, indigo électrique, violet, accents néon
// ════════════════════════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    name: "dark",
    bg:        "#0A0A12",
    bgGrad:    "radial-gradient(140% 100% at 50% 0%, #15132A 0%, #0A0A12 55%)",
    card:      "rgba(255,255,255,0.045)",
    cardHi:    "rgba(255,255,255,0.08)",
    glass:     "rgba(20,18,38,0.55)",
    glassHi:   "rgba(255,255,255,0.07)",
    stroke:    "rgba(255,255,255,0.10)",
    strokeSoft:"rgba(255,255,255,0.06)",
    blur:      "blur(28px) saturate(190%)",
    indigo:    "#6E5DF0",
    indigoLt:  "#9A8CFF",
    violet:    "#B66BFF",
    cyan:      "#4FD8E8",
    glow:      "rgba(110,93,240,0.35)",
    up:        "#34E5A0",
    upGlow:    "rgba(52,229,160,0.22)",
    down:      "#FF5C7A",
    downGlow:  "rgba(255,92,122,0.22)",
    gold:      "#FFC95C",
    ink:       "#FFFFFF",
    inkSub:    "rgba(255,255,255,0.62)",
    inkDim:    "rgba(255,255,255,0.34)",
    inkFaint:  "rgba(255,255,255,0.16)",
    shadow:    "0 16px 48px rgba(0,0,0,0.55)",
    shadowSm:  "0 4px 18px rgba(0,0,0,0.4)",
  },
  light: {
    name: "light",
    bg:        "#F4F4FB",
    bgGrad:    "radial-gradient(140% 100% at 50% 0%, #FFFFFF 0%, #ECECF6 60%)",
    card:      "rgba(255,255,255,0.8)",
    cardHi:    "rgba(255,255,255,0.95)",
    glass:     "rgba(255,255,255,0.7)",
    glassHi:   "rgba(255,255,255,0.85)",
    stroke:    "rgba(20,20,50,0.09)",
    strokeSoft:"rgba(20,20,50,0.05)",
    blur:      "blur(28px) saturate(190%)",
    indigo:    "#5B4BD6",
    indigoLt:  "#7C6FE0",
    violet:    "#9D4EDD",
    cyan:      "#0DA8BC",
    glow:      "rgba(91,75,214,0.2)",
    up:        "#13B981",
    upGlow:    "rgba(19,185,129,0.16)",
    down:      "#F0436A",
    downGlow:  "rgba(240,67,106,0.16)",
    gold:      "#E0930A",
    ink:       "#13132B",
    inkSub:    "rgba(19,19,43,0.6)",
    inkDim:    "rgba(19,19,43,0.38)",
    inkFaint:  "rgba(19,19,43,0.14)",
    shadow:    "0 16px 48px rgba(60,50,120,0.16)",
    shadowSm:  "0 4px 18px rgba(60,50,120,0.1)",
  },
};

const ThemeCtx = { current: THEMES.dark };
const useT = () => ThemeCtx.current;

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const DAYS = ["L","M","M","J","V","S","D"];

// ════════════════════════════════════════════════════════════════════════════
//  CATEGORIES
// ════════════════════════════════════════════════════════════════════════════
// Noms propres à ignorer à l'import (virements internes)
const SELF_NAMES = ["esposito davide","davide esposito","esposito, davide","esposito,davide","neon switzerland"];

// TWINT personnes connues — sortantes → catégorie spécifique
const TWINT_OUT_MAP = {
  "oberson":           "loisirs",     // Spotify famille
  "digitecgalaxus":    "tech",
  "bestsecretgmbh":    "vetements",
  "cafe":              "restaurant",
  "restaurant":        "restaurant",
  "pizzeria":          "restaurant",
  // personnes → twint (pas de mapping = twint par défaut)
};

// Noms de personnes physiques → catégorie twint (virements entre amis/famille)
const TWINT_PERSONS = ["marshall","dylan","thierry","arbian","maman","papa","jager","mettraux","yerly","jorand","beaud","tiphaine","samuel","consiglia","vincent","kylian","baptiste","choue","lara","tatiana","francisco","gael","iman","perritaz","bro","burri","clement","damien","raphael","romain","pierre","marc","thomas","nicolas","simon","julien","antoine","maxime","steven","kevin","sarah","marie","lea","emma","sofia","lisa","anouk","manon"];

// TWINT personnes connues — entrantes → revenus
const TWINT_IN_KNOWN = ["beaud tiphaine","mettraux vincent","yerly simon","jager kylian","jorand baptiste","esposito samuel","esposito-mezza consiglia"];

const BASE_CATS = [
  { id:"alimentation", label:"Alimentation", icon:"🛒", color:"#34E5A0",
    kw:["coop","migros","aldi","lidl","denner","spar","volg","pick pay","laiterie","boucherie","boulangerie","fromagerie","epicerie","manor food","supermarché","grocery","cominox","gottardo","pascal rossier","landi","too good to go","toogoodtogo","k kiosk","kiosk","tabac"] },
  { id:"restaurant",   label:"Restaurant",   icon:"🍽️", color:"#FFC95C",
    kw:["mcdonald","mcdo","burger king","kfc","subway","starbucks","uber eats","ubereats","hungry bear","chez mon cousin",
        "imprévu café","imprevu café","imprevu cafe","sixty five","big brother tacos","can dersim",
        "kebab","pizzeria","pizza","sushi","restaurant","bistro","brasserie","trattoria","grotto",
        "café","cafe","bar ","food","take away","takeaway","tacos","tao lounge","lounge bar","tao ",
        "sumup **star","star sarl","sumup **la","sumup **le","sumup **au","sumup **chez",
        "popeye","popeyes","f304","mac42","mol*brese","brese gmbh","molbrese",
        "holy cow","holycow","happy bowl","planet bowl","eleventh floor","ls eleventh","ls holy","ls bro",
        "padella","pasta","noodle","ramen","poke","wok","grill","snack","sandwich","döner",
        "crêpe","crepe","crep","waffle","bubble tea","tea room","tearoom","five guys","burgeriste"] },
  { id:"transport",    label:"Transport",    icon:"🚗", color:"#4FD8E8",
    kw:["sbb","cff","tpf","tpl","tl","bls","flixbus","bus","train","taxi","uber ","parking",
        "tamoil","jubin","esso","shell","bp ","agrola","socar","coop pronto","migrol",
        "autoroute","vignette","mobility","dhl","post ch","swiss post","la poste","fedex","ups ",
        "tcs ","touring club","axa auto"] },
  { id:"loisirs",      label:"Loisirs",      icon:"🎮", color:"#B66BFF",
    kw:["netflix","spotify","disney","apple.com/bill","steam","playstation","xbox","nintendo",
        "cinema","cinéma","theatre","concert","fitness","piscine","musée","billets","ticket",
        "airbnb","hôtel","hotel","booking.com","fnac","intersport","decathlon",
        "claude","anthropic","chatgpt","openai","adobe","canva","github","notion",
        "goodvibe","goodvibe.ch","polarsteps","atelieraikoo","atelier aikoo","raikoo",
        "deuba","deubagmbh","deuba gmbh","apple ","apple.com","itunes","icloud",
        "laser","lasertag","paintball","escape","karting","bowling","trampoline","aquapark"] },
  { id:"sante",        label:"Santé",        icon:"💊", color:"#FF9F5C",
    kw:["pharmacie","médecin","docteur","dentiste","hôpital","hopital","clinique",
        "concordia","sanitas","css","swica","visana","helsana","atupri","droguerie",
        "apotheke","apothèque","cabinet médical","physio","kiné","optique","lunettes","optic",
        "bain-bleusa","bain bleusa","spa ","bien-être","massage","hammam"] },
  { id:"vetements",    label:"Vêtements",    icon:"👕", color:"#FF6BAE",
    kw:["zara","h&m","hm ","pull&bear","pull ","manor","zalando","nike","adidas",
        "bestsecret","best secret","bestsecretgmbh","hetm","black and white","lyre ",
        "clothing","vêtement","mode","boutique","uniqlo","gap ","primark","c&a","kiabi","undiz"] },
  { id:"logement",     label:"Logement",     icon:"🏠", color:"#5CC8FF",
    kw:["loyer","conforama","ikea","jumbo","obi","bricorama","luminaire",
        "électricité","chauffage","eau ","gaz ","internet","swisscom","salt ","sunrise","upc",
        "office de la circulation","leroy merlin","castorama","bauhaus","hornbach","do it","migros do","brico",
        "action ","action.","maxi bazar","maxibazar","gifi","g-fi","netto","home","hema","kitchenette"] },
  { id:"tech",         label:"Tech",         icon:"💻", color:"#6E5DF0",
    kw:["digitec","galaxus","aliexpress","amazon","mediamarkt","media markt",
        "microspot","interdiscount","brack","apple store","sags","fnac","ldlc","materiel.net","back market",
        "lenovo","hp ","dell ","asus","acer","foletti","foletticomp","informatique","ordinateur"] },
  { id:"taxes",        label:"Impôts/Taxes",  icon:"🏛️", color:"#94A3B8",
    kw:["etat de neuchatel","etat de fribourg","etat de vaud","etat de geneve","administration fiscale","impots","impôts","service des contributions","afc ","oci ","caisse cantonale"] },
  { id:"twint",        label:"TWINT",        icon:"📲", color:"#FF8A3D",
    kw:[] },
  { id:"autre",        label:"Autre",        icon:"📦", color:"#8E8EA8",
    kw:[] },
];
let _cats = BASE_CATS; // will be overridden by App state
const catById = id => _cats.find(c => c.id === id) || _cats[_cats.length-1];

// ════════════════════════════════════════════════════════════════════════════
//  CSV PARSING
// ════════════════════════════════════════════════════════════════════════════
const NEON_SKIP = ["REWARD_RECEIVED","GOAL_WITHDRAWAL","GOAL_DEPOSIT","CASH_TRANSACTION_RELATED_OTHER","CASH_TRANSACTION_OTHER"];
const NEON_IN   = ["PAYMENT_TRANSACTION_IN","CARD_TRANSACTION_IN","TRANSFER_IN"];
const NEON_STANDING = ["PAYMENT_TRANSACTION_OUT_STANDING_ORDER"];

const cc = s => (s||"").replace(/"""/g,"").replace(/"/g,"").trim();
function splitCSV(line){ const r=[],sep=";"; let c="",q=false; for(const ch of line){ if(ch==='"'){q=!q;continue;} if(ch===sep&&!q){r.push(c.trim());c="";continue;} c+=ch; } r.push(c.trim()); return r; }
function toDate(s){ const c=cc(s); let m=c.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/); if(m)return`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`; m=c.match(/^(\d{4})-(\d{2})-(\d{2})/); return m?c.slice(0,10):null; }
function toAmt(s){ const n=parseFloat(cc(s).replace(/['''\s]/g,"").replace(",",".").replace(/[^0-9.\-]/g,"")); return isNaN(n)?0:n; }
function applyLearnedRules(desc, learnedRules){
  if(!desc||!learnedRules) return null;
  return learnedRules[desc.trim().toLowerCase()] || null;
}

function isSelfTransfer(desc){
  const d=(desc||"").toLowerCase();
  return SELF_NAMES.some(n=>d.includes(n));
}

function smartCat(desc, act){
  if(!desc) return "autre";
  const d = desc.toLowerCase();

  // Tout type de paiement sortant (y compris ordre permanent)
  const isOut = act && (act.includes("OUT") || act.includes("STANDING"));

  if(isOut || !act){
    // Ordre permanent Oberson → Loisirs (Spotify)
    if(d.includes("oberson")) return "loisirs";
    // CHOUE → Logement (loyer)
    // Map TWINT noms spéciaux
    for(const [name,cat] of Object.entries(TWINT_OUT_MAP)){
      if(d.includes(name)) return cat;
    }
    // TWINT générique personnes → catégorie twint
    if(d.includes("twint")||TWINT_PERSONS.some(n=>d.includes(n))) return "twint";
  }

  // Personnes connues hors TWINT → twint aussi
  if(TWINT_PERSONS.some(n=>d.includes(n))) return "twint";

  // Mots-clés étendus (cherche dans toutes les catégories)
  for(const cat of BASE_CATS){
    if(cat.id==="twint") continue;
    if(cat.kw.some(k => d.includes(k))) return cat.id;
  }
  return "autre";
}

function parseCSV(text){
  const clean=text.replace(/^\uFEFF/,"").replace(/^\xEF\xBB\xBF/,"");
  const lines=clean.trim().split(/\r?\n/);
  if(lines.length<2)return null;
  const h=lines[0].toLowerCase();
  // Yuh: has ACTIVITY TYPE, DEBIT, CREDIT columns
  if(h.includes("activity type")||h.includes("activity name"))return parseYuhReal(lines);
  // Neon: has original amount, exchange rate columns
  if(h.includes("original amount")||h.includes("exchange rate"))return parseNeonReal(lines);
  return parseGeneric(lines);
}
function parseYuhReal(lines){
  const H=splitCSV(lines[0]).map(x=>cc(x).toLowerCase());
  const dI=H.indexOf("date"),tI=H.indexOf("activity type"),nI=H.indexOf("activity name"),dbI=H.indexOf("debit"),crI=H.indexOf("credit"),rI=H.indexOf("recipient");
  const out=[];
  for(let i=1;i<lines.length;i++){ if(!lines[i].trim())continue; const c=splitCSV(lines[i]); const act=cc(c[tI]||""); if(NEON_SKIP.includes(act))continue; const date=toDate(c[dI]||""); if(!date)continue; const raw=cc(c[nI]||""),recip=cc(c[rI]||""); const desc=recip||raw.replace(/^Twint (à|de) /i,"").replace(/^Transfert (à|de) /i,"").trim(); const debit=toAmt(c[dbI]||""),credit=toAmt(c[crI]||""); const isInc=NEON_IN.includes(act)||credit>0; const amt=Math.abs(debit||credit); if(!amt)continue; if(!isInc && isSelfTransfer(desc+" "+raw)) continue;
    out.push({date,description:desc,amount:amt,isIncome:isInc,category:isInc?"income":smartCat(desc+" "+raw,act),source:"yuh"}); }
  return out;
}
function parseNeonReal(lines){
  const H=splitCSV(lines[0]).map(x=>cc(x).toLowerCase());
  const dI=H.indexOf("date"),aI=H.indexOf("amount"),dscI=H.indexOf("description"),cI=H.indexOf("category");
  const out=[];
  for(let i=1;i<lines.length;i++){ if(!lines[i].trim())continue; const c=splitCSV(lines[i]); const date=toDate(c[dI]||""),amt=toAmt(c[aI]||""); if(!date||!amt)continue; const desc=cc(c[dscI]||""),yc=cc(c[cI]||"").toLowerCase(); const isInc=amt>0||yc==="income"; let cat="autre"; if(isInc)cat="income"; else if(yc==="food")cat="restaurant"; else if(yc==="household")cat="logement"; else if(yc==="shopping")cat="tech"; else cat=smartCat(desc,""); out.push({date,description:desc,amount:Math.abs(amt),isIncome:isInc,category:cat,source:"yuh"}); }
  return out;
}
function parseGeneric(lines){
  const H=splitCSV(lines[0]).map(x=>cc(x).toLowerCase());
  const dI=H.findIndex(h=>h.includes("date")),aI=H.findIndex(h=>h.includes("amount")||h.includes("betrag")),dscI=H.findIndex(h=>h.includes("desc")||h.includes("text")||h.includes("merchant"));
  const out=[];
  for(let i=1;i<lines.length;i++){ if(!lines[i].trim())continue; const c=splitCSV(lines[i]); const date=toDate(c[dI>=0?dI:0]||""),amt=toAmt(c[aI>=0?aI:1]||""),desc=cc(c[dscI>=0?dscI:2]||""); if(!date||!amt)continue; out.push({date,description:desc,amount:Math.abs(amt),isIncome:amt>0,category:smartCat(desc,""),source:"import"}); }
  return out;
}

async function aiCategorize(txs){
  // Only send transactions that local rules couldn't classify (still "autre")
  const toC = txs.filter(t => !t.isIncome && t.category === "autre");
  if(!toC.length) return {};

  const BATCH = 60;
  const allMap = {};

  for(let b = 0; b < toC.length; b += BATCH){
    const batch = toC.slice(b, b + BATCH);
    const lines = batch.map((t,i) => i+"|"+t.description+"|CHF "+t.amount).join("\n");

    const prompt = "Tu es un expert en classification de transactions bancaires pour un utilisateur en Suisse romande.\n\n"+
"RAISONNE comme un humain : si tu vois un nom de restaurant, c'est restaurant. Utilise ton bon sens sur les noms inconnus.\n\n"+
"CATÉGORIES :\n"+
"- alimentation : supermarchés, épiceries, boulangeries, kiosques, Too Good To Go...\n"+
"- restaurant : restaurants, cafés, bars, fast-food, livraison, bowls, burgers...\n"+
"- transport : trains, bus, taxi, essence, parking, colis DHL/PostCH...\n"+
"- loisirs : streaming, sport, cinéma, hôtels, voyages, apps, abonnements numériques...\n"+
"- sante : médecins, pharmacies, assurances, spa, bien-être, optique...\n"+
"- vetements : habits, chaussures, mode, accessoires...\n"+
"- logement : loyer, ameublement, bricolage, telecom, magasins maison (Action, GiFi, Maxi Bazar, Bauhaus...)\n"+
"- tech : électronique, informatique, téléphones (Lenovo, Foletti, Apple produits...)\n"+
"- twint : virement à une personne physique (prénom/nom seul: BRO, LARA, GAEL, MAMAN...)\n"+
"- taxes : impôts, amendes, frais cantonaux (État de Neuchâtel, État de Fribourg...)\n"+
"- autre : vraiment inclassable\n\n"+
"EXEMPLES:\n"+
"Happy Bowl → restaurant | Planet Bowl → restaurant | LS Eleventh Floor → restaurant\n"+
"LS HolyCow → restaurant | Lenovo → tech | FOLETTICOMP → tech | Foletti → tech\n"+
"Action → logement | Maxi Bazar → logement | GiFi → logement | K Kiosk → alimentation\n"+
"Polarsteps → loisirs | ATELIERAIKOO → loisirs | Bain-Bleusa → sante\n"+
"BRO → twint | BURRI CHRISTOPHE → twint | Apple (seul) → loisirs\n\n"+
"TRANSACTIONS (index|nom|montant):\n"+lines+"\n\n"+
"JSON uniquement: [{\"index\":0,\"category\":\"restaurant\"}]";

    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      const txt = data.content?.[0]?.text||"[]";
      const parsed = JSON.parse(txt.replace(/```json|```/g,"").trim());
      for(const r of parsed){ const t=batch[r.index]; if(t) allMap[t.description+"|"+t.amount]=r.category; }
    }catch(e){ console.error("AI batch error:",e); }
  }
  return allMap;
}


// ════════════════════════════════════════════════════════════════════════════
//  STORAGE & FORMAT
// ════════════════════════════════════════════════════════════════════════════
const SK={tx:"aur_tx",inc:"aur_inc",rec:"aur_rec",bud:"aur_bud",theme:"aur_theme",cats:"aur_cats",rules:"aur_rules"};
const load=(k,fb)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
const chf=n=>`CHF ${Math.abs(+n).toFixed(2)}`;
const chfK=n=>{const a=Math.abs(n);return a>=1000?`${(a/1000).toFixed(1)}k`:a.toFixed(0);};
const today=()=>new Date().toISOString().slice(0,10);

// ════════════════════════════════════════════════════════════════════════════
//  PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════
function Glass({ children, style={}, onClick, pad="16px 18px", r=22, hover }) {
  const T=useT();
  return (
    <div onClick={onClick} style={{ background:T.glass, backdropFilter:T.blur, WebkitBackdropFilter:T.blur, border:`1px solid ${T.stroke}`, borderRadius:r, padding:pad, boxShadow:T.shadowSm, transition:"transform .2s, border-color .2s", ...style }}>
      {children}
    </div>
  );
}
function Avatar({ icon, color, size=44 }) {
  return <div style={{ width:size,height:size,borderRadius:size*0.3,background:`linear-gradient(135deg,${color}38,${color}14)`,border:`1px solid ${color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.46,flexShrink:0 }}>{icon}</div>;
}
function Pill({ children, color }) {
  return <span style={{ background:color+"1F",color,border:`1px solid ${color}3A`,borderRadius:20,padding:"4px 11px",fontSize:12,fontWeight:700,letterSpacing:.2,whiteSpace:"nowrap" }}>{children}</span>;
}
function Bar({ v, max, color, h=5 }) {
  const T=useT(); const pct=max>0?Math.min(v/max*100,100):0;
  return <div style={{ background:T.strokeSoft,borderRadius:h,height:h,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:h,borderRadius:h,background:`linear-gradient(90deg,${color},${color}AA)`,transition:"width .6s cubic-bezier(.4,0,.2,1)" }} /></div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  DATA-VIZ : Donut chart
// ════════════════════════════════════════════════════════════════════════════
function Donut({ data, size=180, thickness=26, centerLabel, centerValue, onSegment }) {
  const T=useT();
  const total=data.reduce((s,d)=>s+d.value,0)||1;
  const R=(size-thickness)/2, C=2*Math.PI*R;
  let offset=0;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={T.strokeSoft} strokeWidth={thickness} />
        {data.map((d,i)=>{
          const frac=d.value/total, len=frac*C;
          const el=<circle key={i} cx={size/2} cy={size/2} r={R} fill="none" stroke={d.color} strokeWidth={thickness} strokeDasharray={`${len} ${C-len}`} strokeDashoffset={-offset} strokeLinecap="round" onClick={onSegment?()=>onSegment(d):undefined} style={{ transition:"stroke-dasharray .7s cubic-bezier(.4,0,.2,1)", cursor:onSegment?"pointer":"default" }} />;
          offset+=len; return el;
        })}
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
        <div style={{ fontSize:11,color:T.inkDim,fontWeight:600,letterSpacing:.5 }}>{centerLabel}</div>
        <div style={{ fontSize:24,fontWeight:800,color:T.ink,letterSpacing:-.5 }}>{centerValue}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  DATA-VIZ : Smooth line/area trend
// ════════════════════════════════════════════════════════════════════════════
function TrendChart({ points, color, height=120, labels }) {
  const T=useT();
  const W=320, H=height, pad=8;
  const vals=points.length?points:[0];
  const max=Math.max(...vals,1), min=Math.min(...vals,0);
  const range=max-min||1;
  const stepX=(W-pad*2)/Math.max(vals.length-1,1);
  const pts=vals.map((v,i)=>[pad+i*stepX, H-pad-((v-min)/range)*(H-pad*2)]);
  // smooth path
  let d=`M ${pts[0][0]} ${pts[0][1]}`;
  for(let i=1;i<pts.length;i++){ const[x0,y0]=pts[i-1],[x1,y1]=pts[i]; const cx=(x0+x1)/2; d+=` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`; }
  const area=d+` L ${pts[pts.length-1][0]} ${H} L ${pts[0][0]} ${H} Z`;
  const gid="g"+Math.random().toString(36).slice(2,7);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} preserveAspectRatio="none">
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.32"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
        <path d={area} fill={`url(#${gid})`} />
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===pts.length-1?4:0} fill={color} />)}
      </svg>
      {labels&&<div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>{labels.map((l,i)=><span key={i} style={{ fontSize:9,color:T.inkDim,fontWeight:600 }}>{l}</span>)}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  DATA-VIZ : Calendar heatmap
// ════════════════════════════════════════════════════════════════════════════
function Heatmap({ month, year, dayTotals, color }) {
  const T=useT();
  const first=new Date(year,month,1).getDay(); // 0=Sun
  const offset=(first+6)%7; // Monday-first
  const daysInMonth=new Date(year,month+1,0).getDate();
  const max=Math.max(...Object.values(dayTotals),1);
  const cells=[];
  for(let i=0;i<offset;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(d);
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:8 }}>
        {DAYS.map((d,i)=><div key={i} style={{ textAlign:"center",fontSize:10,color:T.inkDim,fontWeight:700 }}>{d}</div>)}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5 }}>
        {cells.map((d,i)=>{
          if(d===null)return <div key={i} />;
          const v=dayTotals[d]||0;
          const intensity=v/max;
          const bg=v===0?T.strokeSoft:`${color}${Math.round(20+intensity*70).toString(16).padStart(2,"0")}`;
          return (
            <div key={i} style={{ aspectRatio:"1",borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${v>0?color+"30":"transparent"}`,position:"relative" }}>
              <span style={{ fontSize:10,fontWeight:600,color:v>max*0.5?"#fff":T.inkDim }}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  Toast / Confirm / Sheet
// ════════════════════════════════════════════════════════════════════════════
function Toast({ msg, onDone }) {
  const T=useT();
  useEffect(()=>{ if(msg){const t=setTimeout(onDone,2400);return()=>clearTimeout(t);}},[msg]);
  if(!msg)return null;
  return <div style={{ position:"fixed",bottom:108,left:"50%",transform:"translateX(-50%)",background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:`1px solid ${T.stroke}`,color:T.ink,borderRadius:18,padding:"13px 24px",fontWeight:600,fontSize:14,zIndex:999,boxShadow:T.shadow,whiteSpace:"nowrap" }}>{msg}</div>;
}
function Confirm({ msg, onYes, onNo }) {
  const T=useT();
  if(!msg)return null;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:`1px solid ${T.stroke}`,borderRadius:26,padding:"30px 24px",width:"100%",maxWidth:320,boxShadow:T.shadow }}>
        <div style={{ fontSize:18,fontWeight:800,color:T.ink,marginBottom:8,textAlign:"center" }}>Supprimer</div>
        <div style={{ fontSize:14,color:T.inkSub,marginBottom:26,textAlign:"center",lineHeight:1.5 }}>{msg}</div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onNo} style={{ flex:1,background:T.cardHi,border:`1px solid ${T.stroke}`,borderRadius:15,padding:"14px",color:T.inkSub,fontWeight:600,fontSize:15,cursor:"pointer" }}>Annuler</button>
          <button onClick={onYes} style={{ flex:1,background:`linear-gradient(135deg,${T.down},#FF8AA0)`,border:"none",borderRadius:15,padding:"14px",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer" }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}
function Sheet({ title, subtitle, onClose, children }) {
  const T=useT();
  const [dy,setDy]=useState(0),[sy,setSy]=useState(null);
  const ref=useRef(null);
  const ts=e=>{ if(ref.current&&ref.current.scrollTop===0)setSy(e.touches[0].clientY); };
  const tm=e=>{ if(sy===null)return; const d=e.touches[0].clientY-sy; if(d>0)setDy(d); };
  const te=()=>{ if(dy>110)onClose(); setDy(0); setSy(null); };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",zIndex:500,display:"flex",alignItems:"flex-end" }} onClick={onClose}>
      <div ref={ref} onClick={e=>e.stopPropagation()} onTouchStart={ts} onTouchMove={tm} onTouchEnd={te} style={{ background:T.bg,borderRadius:"30px 30px 0 0",width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"93vh",overflowY:"auto",transform:`translateY(${dy}px)`,transition:dy===0?"transform .35s cubic-bezier(.32,0,.67,0)":"none",borderTop:`1px solid ${T.stroke}`,willChange:"transform" }}>
        <div style={{ padding:"14px 22px 0",position:"sticky",top:0,background:T.bg,zIndex:2 }}>
          <div style={{ width:38,height:4,background:T.inkFaint,borderRadius:2,margin:"0 auto 18px" }} />
          <div style={{ fontWeight:800,fontSize:24,color:T.ink,letterSpacing:-.4 }}>{title}</div>
          {subtitle&&<div style={{ fontSize:14,color:T.inkSub,marginTop:3 }}>{subtitle}</div>}
          <div style={{ height:1,background:T.strokeSoft,marginTop:16 }} />
        </div>
        <div style={{ padding:"18px 22px 48px" }}>{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }){ const T=useT(); return <div style={{ marginBottom:16 }}>{label&&<div style={{ fontSize:12,color:T.inkDim,fontWeight:700,marginBottom:8,letterSpacing:.8,textTransform:"uppercase" }}>{label}</div>}{children}</div>; }
function TInput(props){ const T=useT(); return <input {...props} style={{ width:"100%",background:T.cardHi,border:`1px solid ${T.stroke}`,borderRadius:15,padding:"15px 16px",color:T.ink,fontSize:16,outline:"none",boxSizing:"border-box",fontFamily:"inherit",...props.style }} />; }
function TBtn({ children, variant="primary", full, onClick }){ const T=useT(); const bg=variant==="primary"?`linear-gradient(135deg,${T.indigo},${T.violet})`:variant==="up"?`linear-gradient(135deg,${T.up},#5AF0B8)`:variant==="down"?`linear-gradient(135deg,${T.down},#FF8AA0)`:T.cardHi; const col=variant==="ghost"?T.inkSub:"#fff"; return <button onClick={onClick} style={{ background:bg,color:col,border:variant==="ghost"?`1px solid ${T.stroke}`:"none",borderRadius:17,padding:"16px 24px",fontWeight:700,fontSize:16,cursor:"pointer",width:full?"100%":"auto",fontFamily:"inherit",boxShadow:variant!=="ghost"?`0 6px 22px ${T.glow}`:"none",marginTop:4 }}>{children}</button>; }
function CatPicker({ value, onChange, cats=BASE_CATS }){ const T=useT(); return <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{cats.map(c=><button key={c.id} onClick={()=>onChange(c.id)} style={{ background:value===c.id?`linear-gradient(135deg,${c.color}33,${c.color}15)`:T.cardHi,border:`1px solid ${value===c.id?c.color:T.stroke}`,borderRadius:20,padding:"8px 14px",color:value===c.id?c.color:T.inkSub,fontSize:13,cursor:"pointer",fontWeight:value===c.id?700:400,transition:"all .15s" }}>{c.icon} {c.label}</button>)}</div>; }
function TxRow({ t, onDel, onEdit }){ const T=useT(); const c=catById(t.category); return (
  <div style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.strokeSoft}` }}>
    <div onClick={onEdit} style={{ cursor:onEdit?"pointer":"default" }}>
      <Avatar icon={c.icon} color={c.color} size={44} />
    </div>
    <div style={{ flex:1,minWidth:0,cursor:onEdit?"pointer":"default" }} onClick={onEdit}>
      <div style={{ fontWeight:600,fontSize:15,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.description}</div>
      <div style={{ fontSize:12,color:T.inkDim,marginTop:2 }}>{t.date} · {c.label}{t.source?` · ${t.source}`:""}</div>
    </div>
    <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
      <span style={{ fontWeight:700,fontSize:15,color:t.isIncome?T.up:T.ink }}>{t.isIncome?"+":"–"}{chf(t.amount)}</span>
      {onEdit&&<button onClick={onEdit} style={{ background:T.cardHi,border:`1px solid ${T.stroke}`,borderRadius:8,color:T.inkDim,cursor:"pointer",fontSize:13,padding:"4px 8px",lineHeight:1 }}>✏️</button>}
      {onDel&&<button onClick={onDel} style={{ background:"none",border:"none",color:T.inkDim,cursor:"pointer",fontSize:20,padding:"0 2px",lineHeight:1 }}>×</button>}
    </div>
  </div>
); }

// ════════════════════════════════════════════════════════════════════════════
//  APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const now=new Date();
  const [themeKey,setThemeKey]=useState(()=>load(SK.theme,"dark"));
  ThemeCtx.current=THEMES[themeKey];
  const T=THEMES[themeKey];

  const [tab,setTab]=useState("home");
  const [month,setMonth]=useState(now.getMonth());
  const [year,setYear]=useState(now.getFullYear());
  const [customCats,setCustomCats]=useState(()=>load(SK.cats,[]));
  const [learnedRules,setLearnedRules]=useState(()=>load(SK.rules,{})); // {desc: catId}
  const [txs,setTxs]=useState(()=>load(SK.tx,[]));
  const [incomes,setIncomes]=useState(()=>load(SK.inc,[]));
  const [recurring,setRecurring]=useState(()=>load(SK.rec,[]));
  const [sheet,setSheet]=useState(null);
  const [toast,setToast]=useState("");
  const [confirm,setConfirm]=useState(null);
  const [catDetail,setCatDetail]=useState(null);
  const [merchDetail,setMerchDetail]=useState(null);
  const [searchQ,setSearchQ]=useState("");
  const [impItems,setImpItems]=useState([]);
  const [impLoad,setImpLoad]=useState(false);
  const fileRef=useRef(), swipeX=useRef(null);

  const [txForm,setTxForm]=useState({description:"",amount:"",category:"alimentation",date:today(),isIncome:false});
  const [incForm,setIncForm]=useState({label:"",amount:"",day:25});
  const [recForm,setRecForm]=useState({label:"",amount:"",category:"logement",day:1});

  useEffect(()=>save(SK.tx,txs),[txs]);
  useEffect(()=>save(SK.inc,incomes),[incomes]);
  useEffect(()=>save(SK.rec,recurring),[recurring]);
  useEffect(()=>save(SK.theme,themeKey),[themeKey]);
  useEffect(()=>save(SK.cats,customCats),[customCats]);
  useEffect(()=>save(SK.rules,learnedRules),[learnedRules]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const C=useMemo(()=>{
    const mTx=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===month&&d.getFullYear()===year;});
    const pm=month===0?11:month-1, py=month===0?year-1:year;
    const pTx=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===pm&&d.getFullYear()===py;});
    const exp=mTx.filter(t=>!t.isIncome), incT=mTx.filter(t=>t.isIncome);
    const recInc=incomes.reduce((s,i)=>s+ +i.amount,0);
    const impInc=incT.reduce((s,t)=>s+ +t.amount,0);
    const totalIncome=recInc+impInc;
    const recExp=recurring.reduce((s,r)=>s+ +r.amount,0);
    const totalExp=exp.reduce((s,t)=>s+ +t.amount,0)+recExp;
    const balance=totalIncome-totalExp;
    const savings=totalIncome>0?balance/totalIncome*100:0;
    const byCat={},pByCat={};
    for(const t of exp)byCat[t.category]=(byCat[t.category]||0)+ +t.amount;
    for(const r of recurring)byCat[r.category]=(byCat[r.category]||0)+ +r.amount;
    for(const t of pTx.filter(x=>!x.isIncome))pByCat[t.category]=(pByCat[t.category]||0)+ +t.amount;
    // merchants
    const merch={};
    for(const t of exp){ const k=t.description.trim(); merch[k]=(merch[k]||0)+ +t.amount; }
    const topMerch=Object.entries(merch).sort((a,b)=>b[1]-a[1]).slice(0,6);
    // day totals
    const dayTot={};
    for(const t of exp){ const d=new Date(t.date).getDate(); dayTot[d]=(dayTot[d]||0)+ +t.amount; }
    return {mTx,exp,incT,recInc,impInc,totalIncome,recExp,totalExp,balance,savings,byCat,pByCat,topMerch,dayTot};
  },[txs,incomes,recurring,month,year]);

  const annual=useMemo(()=>Array.from({length:12},(_,i)=>{
    const mTx=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===i&&d.getFullYear()===year;});
    const recExp=recurring.reduce((s,r)=>s+ +r.amount,0);
    const recInc=incomes.reduce((s,x)=>s+ +x.amount,0);
    const spent=mTx.filter(t=>!t.isIncome).reduce((s,t)=>s+ +t.amount,0)+recExp;
    const earned=mTx.filter(t=>t.isIncome).reduce((s,t)=>s+ +t.amount,0)+recInc;
    return{spent,earned};
  }),[txs,recurring,incomes,year]);

  const insights=useMemo(()=>{
    const r=[];
    const cats=[...BASE_CATS.filter(x=>x.id!=="autre"), ...customCats, BASE_CATS[BASE_CATS.length-1]];
    for(const c of cats){ const cur=C.byCat[c.id]||0,pr=C.pByCat[c.id]||0;
      if(cur>0&&pr>0){ const d=(cur-pr)/pr*100; if(d>35)r.push({m:`+${d.toFixed(0)}% ${c.label}`,i:c.icon,col:T.gold}); if(d<-30)r.push({m:`–${Math.abs(d).toFixed(0)}% ${c.label}`,i:c.icon,col:T.up}); }
    }
    return r;
  },[C,customCats,T]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const addTx=d=>{setTxs(p=>[{id:Date.now()+Math.random(),...d},...p]);setToast("Ajouté");};
  const delTx=id=>{setTxs(p=>p.filter(x=>x.id!==id));setToast("Supprimé");setConfirm(null);};
  const askDel=t=>setConfirm({id:t.id,label:t.description});
  // Merge base + custom categories, update global ref
  const allCats = [...BASE_CATS.filter(c=>c.id!=="autre"), ...customCats, BASE_CATS[BASE_CATS.length-1]];
  _cats = allCats;

  const [editTx,setEditTx]=useState(null);
  const [editCat,setEditCat]=useState(null); // null | "new" | catId // transaction being edited
  function updateTx(id, changes){
    setTxs(p=>p.map(t=>t.id===id?{...t,...changes}:t));
    // Learn the rule if category changed
    if(changes.category){
      const tx=txs.find(t=>t.id===id);
      if(tx && tx.description){
        setLearnedRules(r=>({...r,[tx.description.trim().toLowerCase()]:changes.category}));
      }
    }
    setToast("✅ Modifié");
  }
  const EMOJI_LIST=["🛒","🍽️","🚗","🎮","💊","👕","🏠","💻","📲","📦","🎵","🏋️","✈️","🐾","🎁","☕","🏦","📚","🎨","🐟","🧴","🔧","💈","🌿","🎯","🏊","🎸","🧹","🛍️","💰"];
  const COLOR_LIST=["#34E5A0","#FFC95C","#4FD8E8","#B66BFF","#FF9F5C","#FF6BAE","#5CC8FF","#6E5DF0","#FF8A3D","#94A3B8","#F87171","#34D399","#60A5FA","#FBBF24","#A78BFA","#FB7185"];

  function addCustomCat(cat){
    setCustomCats(p=>[...p,{...cat,id:"custom_"+Date.now(),kw:[]}]);
    setToast("✅ Catégorie créée");
  }
  function updateCustomCat(id, changes){
    setCustomCats(p=>p.map(c=>c.id===id?{...c,...changes}:c));
    setToast("✅ Catégorie modifiée");
  }
  function deleteCustomCat(id){
    setCustomCats(p=>p.filter(c=>c.id!==id));
    // Move transactions from deleted cat to "autre"
    setTxs(p=>p.map(t=>t.category===id?{...t,category:"autre"}:t));
    setToast("🗑 Catégorie supprimée");
  }

  function bulkRecategorize(fromDesc, toCategory){
    const count=txs.filter(t=>t.description.trim()===fromDesc.trim()&&!t.isIncome).length;
    setTxs(p=>p.map(t=>t.description.trim()===fromDesc.trim()&&!t.isIncome?{...t,category:toCategory}:t));
    setToast("✅ "+count+" transaction"+(count>1?"s":""+" recatégorisée"+(count>1?"s":"")));
  }
  const addInc=d=>{setIncomes(p=>[...p,{id:Date.now(),...d}]);setToast("Revenu ajouté");};
  const delInc=id=>setIncomes(p=>p.filter(x=>x.id!==id));
  const addRec=d=>{setRecurring(p=>[...p,{id:Date.now(),...d}]);setToast("Ajouté");};
  const delRec=id=>setRecurring(p=>p.filter(x=>x.id!==id));
  const prevM=()=>{month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1);};
  const nextM=()=>{month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1);};

  async function handleFile(e){
    const f=e.target.files?.[0]; if(!f)return; e.target.value="";
    setImpLoad(true); setSheet("import");
    const parsed=parseCSV(await f.text());
    if(!parsed||!parsed.length){setImpLoad(false);setToast("Format non reconnu");setSheet(null);return;}
    const wc=parsed.map(t=>({...t,category:t.isIncome?"income":(applyLearnedRules(t.description,learnedRules)||smartCat(t.description,""))}));
    try{ const map=await aiCategorize(wc); setImpItems(wc.map((t,i)=>({...t,category:map[t.description+"|"+t.amount]||t.category,_idx:i,_on:true}))); }
    catch{ setImpItems(wc.map((t,i)=>({...t,_idx:i,_on:true}))); }
    setImpLoad(false); setSheet("review");
  }
  function doImport(items){
    const add=items.filter(t=>t._on).map(({_idx,_on,...t})=>({id:Date.now()+Math.random()+_idx,...t}));
    setTxs(p=>[...add,...p]); setSheet(null); setToast(`${add.length} importée${add.length>1?"s":""}`);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HOME
  // ════════════════════════════════════════════════════════════════════════
  function Home(){
    const balCol=C.balance>=0?T.up:T.down;
    const cats=allCats.filter(c=>C.byCat[c.id]>0);
    return (
      <div style={{ paddingBottom:8 }}>
        {/* Hero */}
        <div onTouchStart={e=>swipeX.current=e.touches[0].clientX} onTouchEnd={e=>{const d=swipeX.current-e.changedTouches[0].clientX;if(Math.abs(d)>60)d>0?nextM():prevM();}}
          style={{ borderRadius:30,padding:"26px 24px 22px",marginBottom:18,position:"relative",overflow:"hidden",border:`1px solid ${T.stroke}`,background:`linear-gradient(160deg,${T.indigo}26 0%,${T.violet}12 45%,transparent 100%)`,touchAction:"pan-y" }}>
          <div style={{ position:"absolute",top:-50,right:-30,width:170,height:170,borderRadius:"50%",background:`radial-gradient(circle,${T.violet}28,transparent 70%)`,pointerEvents:"none" }} />
          <div style={{ position:"absolute",bottom:-40,left:-30,width:140,height:140,borderRadius:"50%",background:`radial-gradient(circle,${T.indigo}22,transparent 70%)`,pointerEvents:"none" }} />
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,position:"relative" }}>
            <button onClick={prevM} style={navBtn(T)}>‹</button>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:15,fontWeight:700,color:T.ink }}>{MONTHS[month]}</div>
              <div style={{ fontSize:12,color:T.inkDim }}>{year}</div>
            </div>
            <button onClick={nextM} style={navBtn(T)}>›</button>
          </div>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:12,color:T.inkDim,fontWeight:600,letterSpacing:1.2,marginBottom:8 }}>SOLDE DU MOIS</div>
            <div style={{ fontSize:48,fontWeight:900,color:balCol,letterSpacing:-2,lineHeight:1,fontVariantNumeric:"tabular-nums" }}>{C.balance>=0?"+":"–"}{chf(C.balance)}</div>
            {C.totalIncome>0&&<div style={{ fontSize:13,color:T.inkDim,marginTop:8 }}>Épargne <span style={{ color:C.savings>=0?T.up:T.down,fontWeight:700 }}>{C.savings.toFixed(0)}%</span> ce mois</div>}
          </div>
          <div style={{ display:"flex",gap:1,marginTop:18,position:"relative" }}>
            <div onClick={()=>setSheet("incDetail")} style={{ flex:1,background:T.glassHi,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderRadius:"16px 5px 5px 16px",padding:"13px 16px",cursor:"pointer",border:`1px solid ${T.stroke}` }}>
              <div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4 }}>REVENUS ›</div>
              <div style={{ fontSize:19,fontWeight:800,color:T.up }}>{chf(C.totalIncome)}</div>
            </div>
            <div style={{ flex:1,background:T.glassHi,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderRadius:"5px 16px 16px 5px",padding:"13px 16px",border:`1px solid ${T.stroke}` }}>
              <div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4 }}>DÉPENSES</div>
              <div style={{ fontSize:19,fontWeight:800,color:T.down }}>{chf(C.totalExp)}</div>
            </div>
          </div>
        </div>

        {insights.length>0&&(
          <div style={{ display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4 }}>
            {insights.slice(0,5).map((ins,i)=>(
              <div key={i} style={{ flexShrink:0,background:ins.col+"15",border:`1px solid ${ins.col}33`,borderRadius:15,padding:"8px 14px",display:"flex",alignItems:"center",gap:7 }}>
                <span style={{ fontSize:15 }}>{ins.i}</span><span style={{ fontSize:12,color:ins.col,fontWeight:700,whiteSpace:"nowrap" }}>{ins.m}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
          <button onClick={()=>fileRef.current?.click()} style={{ background:`linear-gradient(135deg,${T.indigo},${T.violet})`,border:"none",borderRadius:20,padding:"17px 12px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,boxShadow:`0 6px 22px ${T.glow}` }}><span style={{ fontSize:26 }}>📂</span>Importer CSV</button>
          <button onClick={()=>{setTxForm({description:"",amount:"",category:"alimentation",date:today(),isIncome:false});setSheet("addTx");}} style={{ background:T.cardHi,border:`1px solid ${T.stroke}`,borderRadius:20,padding:"17px 12px",color:T.ink,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}><span style={{ fontSize:26 }}>✏️</span>Ajout manuel</button>
        </div>

        {recurring.length>0&&(
          <Glass pad="13px 16px" r={18} style={{ marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div><div style={{ fontSize:13,fontWeight:700,color:T.ink }}>🔄 Dépenses fixes</div><div style={{ fontSize:12,color:T.inkDim }}>{recurring.length} récurrente{recurring.length>1?"s":""}</div></div>
            <div style={{ fontWeight:800,fontSize:16,color:T.down }}>{chf(C.recExp)}</div>
          </Glass>
        )}

        {cats.length>0&&(
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13,fontWeight:700,color:T.inkDim,letterSpacing:.5,marginBottom:12 }}>PAR CATÉGORIE</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {cats.sort((a,b)=>(C.byCat[b.id]||0)-(C.byCat[a.id]||0)).map(c=>{
                const sp=C.byCat[c.id]||0,pr=C.pByCat[c.id]||0,tr=pr>0?(sp-pr)/pr*100:null,over=false;
                return (
                  <Glass key={c.id} r={18} pad="14px 16px" onClick={()=>{setCatDetail(c.id);setSheet("catDetail");}} style={{ cursor:"pointer" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <Avatar icon={c.icon} color={c.color} size={44} />
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:b>0?8:0 }}>
                          <div><div style={{ fontWeight:700,fontSize:15,color:T.ink }}>{c.label}</div>{tr!==null&&<div style={{ fontSize:12,color:tr>0?T.down:T.up,marginTop:2 }}>{tr>0?"+":""}{tr.toFixed(0)}% vs mois dernier</div>}</div>
                          <div style={{ textAlign:"right" }}><div style={{ fontWeight:800,fontSize:16,color:c.color }}>{chf(sp)}</div></div>
                        </div>

                      </div>
                    </div>
                  </Glass>
                );
              })}
            </div>
          </div>
        )}

        {C.exp.length>0&&(
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <div style={{ fontSize:13,fontWeight:700,color:T.inkDim,letterSpacing:.5 }}>RÉCENTES</div>
              <button onClick={()=>setSheet("history")} style={{ background:"none",border:"none",color:T.indigoLt,fontSize:13,fontWeight:700,cursor:"pointer" }}>Tout voir</button>
            </div>
            <Glass pad="0 16px" r={20}>{C.exp.slice(0,6).map(t=><TxRow key={t.id} t={t} onDel={()=>askDel(t)} onEdit={()=>setEditTx(t)} />)}</Glass>
          </div>
        )}

        {C.exp.length===0&&Object.keys(C.byCat).length===0&&(
          <div style={{ textAlign:"center",padding:"56px 0",color:T.inkDim }}>
            <div style={{ fontSize:52,marginBottom:16 }}>✨</div>
            <div style={{ fontSize:17,fontWeight:700,color:T.inkSub,marginBottom:8 }}>Commence ton suivi</div>
            <div style={{ fontSize:14 }}>Importe un CSV ou ajoute une dépense</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={handleFile} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ANALYSE  (la nouvelle section qui tape à l'œil)
  // ════════════════════════════════════════════════════════════════════════
  function Analyse(){
    const cats=allCats.filter(c=>C.byCat[c.id]>0).sort((a,b)=>(C.byCat[b.id]||0)-(C.byCat[a.id]||0));
    const donutData=cats.map(c=>({value:C.byCat[c.id]||0,color:c.color,label:c.label,id:c.id}));
    const last6=useMemo(()=>{
      const arr=[];
      for(let i=5;i>=0;i--){ let m=month-i,y=year; while(m<0){m+=12;y--;} const mTx=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===m&&d.getFullYear()===y&&!t.isIncome;}); const rec=recurring.reduce((s,r)=>s+ +r.amount,0); arr.push({label:MS[m],value:mTx.reduce((s,t)=>s+ +t.amount,0)+rec}); }
      return arr;
    },[txs,recurring,month,year]);
    const trendVals=last6.map(x=>x.value), trendLabels=last6.map(x=>x.label);
    const maxMerch=C.topMerch[0]?.[1]||1;

    return (
      <div>
        <div style={{ fontSize:28,fontWeight:900,color:T.ink,letterSpacing:-.5,marginBottom:4 }}>Analyse</div>
        <div style={{ fontSize:14,color:T.inkSub,marginBottom:22 }}>{MONTHS[month]} {year}</div>

        {C.exp.length===0?(
          <div style={{ textAlign:"center",padding:"56px 0",color:T.inkDim }}>
            <div style={{ fontSize:52,marginBottom:16 }}>📊</div>
            <div style={{ fontSize:17,fontWeight:700,color:T.inkSub,marginBottom:8 }}>Pas encore de données</div>
            <div style={{ fontSize:14 }}>Ajoute des dépenses pour voir tes analyses</div>
          </div>
        ):(
          <>
            {/* Donut répartition */}
            <Glass r={24} pad="22px 20px" style={{ marginBottom:16 }}>
              <div style={{ fontSize:13,fontWeight:700,color:T.inkDim,letterSpacing:.5,marginBottom:18 }}>RÉPARTITION</div>
              <div style={{ display:"flex",alignItems:"center",gap:20 }}>
                <Donut data={donutData} size={150} thickness={24} centerLabel="TOTAL" centerValue={chfK(C.totalExp)} onSegment={d=>{setCatDetail(d.id);setSheet("catDetail");}} />
                <div style={{ flex:1,display:"flex",flexDirection:"column",gap:4 }}>
                  {cats.slice(0,5).map(c=>{
                    const pct=(C.byCat[c.id]/C.totalExp*100).toFixed(0);
                    return (
                      <div key={c.id} onClick={()=>{setCatDetail(c.id);setSheet("catDetail");}} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"5px 6px",margin:"-1px -6px",borderRadius:10 }}>
                        <div style={{ width:10,height:10,borderRadius:3,background:c.color,flexShrink:0 }} />
                        <span style={{ fontSize:13,color:T.inkSub,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.label}</span>
                        <span style={{ fontSize:13,fontWeight:700,color:T.ink }}>{pct}%</span>
                        <span style={{ fontSize:13,color:T.inkDim }}>›</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Glass>

            {/* Tendance 6 mois */}
            <Glass r={24} pad="22px 20px" style={{ marginBottom:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
                <div style={{ fontSize:13,fontWeight:700,color:T.inkDim,letterSpacing:.5 }}>TENDANCE — 6 MOIS</div>
                <div style={{ fontSize:13,fontWeight:700,color:T.indigoLt }}>{chf(trendVals[trendVals.length-1])}</div>
              </div>
              <TrendChart points={trendVals} color={T.indigoLt} labels={trendLabels} height={120} />
            </Glass>

            {/* Heatmap calendrier */}
            <Glass r={24} pad="22px 20px" style={{ marginBottom:16 }}>
              <div style={{ fontSize:13,fontWeight:700,color:T.inkDim,letterSpacing:.5,marginBottom:18 }}>CALENDRIER DES DÉPENSES</div>
              <Heatmap month={month} year={year} dayTotals={C.dayTot} color={T.indigo} />
              <div style={{ display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,marginTop:14 }}>
                <span style={{ fontSize:10,color:T.inkDim }}>Moins</span>
                {[0.15,0.4,0.65,0.9].map((o,i)=><div key={i} style={{ width:12,height:12,borderRadius:3,background:`${T.indigo}${Math.round(o*255).toString(16).padStart(2,"0")}` }} />)}
                <span style={{ fontSize:10,color:T.inkDim }}>Plus</span>
              </div>
            </Glass>

            {/* Top marchands */}
            <Glass r={24} pad="22px 20px">
              <div style={{ fontSize:13,fontWeight:700,color:T.inkDim,letterSpacing:.5,marginBottom:18 }}>OÙ PART TON ARGENT</div>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {C.topMerch.map(([name,amt],i)=>(
                  <div key={i} onClick={()=>{setMerchDetail(name);setSheet("merchDetail");}} style={{ cursor:"pointer" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,minWidth:0 }}>
                        <span style={{ fontSize:13,fontWeight:800,color:T.inkDim,width:18 }}>{i+1}</span>
                        <span style={{ fontSize:14,fontWeight:600,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{name}</span>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                        <span style={{ fontSize:14,fontWeight:700,color:T.ink }}>{chf(amt)}</span>
                        <span style={{ fontSize:14,color:T.inkDim }}>›</span>
                      </div>
                    </div>
                    <Bar v={amt} max={maxMerch} color={T.indigoLt} h={6} />
                  </div>
                ))}
              </div>
            </Glass>
          </>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ANNÉE
  // ════════════════════════════════════════════════════════════════════════
  function Annee(){
    const maxSp=Math.max(...annual.map(d=>d.spent),1);
    const totalY=annual.reduce((s,d)=>s+d.spent,0);
    const incY=annual.reduce((s,d)=>s+d.earned,0);
    const sav=incY-totalY;
    return (
      <div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <div style={{ fontSize:28,fontWeight:900,color:T.ink,letterSpacing:-.5 }}>Année {year}</div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>setYear(y=>y-1)} style={navBtn(T)}>‹</button>
            <button onClick={()=>setYear(y=>y+1)} style={navBtn(T)}>›</button>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
          {[{l:"Revenus",v:chf(incY),c:T.up},{l:"Dépenses",v:chf(totalY),c:T.down},{l:"Économies",v:chf(sav),c:sav>=0?T.up:T.down},{l:"Moy./mois",v:`CHF ${chfK(totalY/12)}`,c:T.indigoLt}].map(({l,v,c})=>(
            <Glass key={l} r={18} pad="16px"><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,letterSpacing:.6,marginBottom:8 }}>{l.toUpperCase()}</div><div style={{ fontSize:20,fontWeight:800,color:c }}>{v}</div></Glass>
          ))}
        </div>
        <Glass r={22} pad="20px 16px" style={{ marginBottom:16 }}>
          <div style={{ fontSize:12,fontWeight:700,color:T.inkDim,letterSpacing:.5,marginBottom:16 }}>DÉPENSES PAR MOIS</div>
          <div style={{ display:"flex",alignItems:"flex-end",gap:4,height:110 }}>
            {annual.map((d,i)=>(
              <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer" }} onClick={()=>{setMonth(i);setTab("home");}}>
                <div style={{ fontSize:8,color:d.spent>0?T.inkSub:"transparent",fontWeight:700 }}>{d.spent>0?chfK(d.spent):""}</div>
                <div style={{ width:"100%",background:i===month?`linear-gradient(180deg,${T.indigo},${T.violet})`:T.cardHi,borderRadius:"6px 6px 0 0",height:`${Math.max(d.spent/maxSp*85,2)}px`,transition:"height .5s cubic-bezier(.4,0,.2,1)",boxShadow:i===month?`0 0 14px ${T.glow}`:"none" }} />
                <div style={{ fontSize:9,color:i===month?T.indigoLt:T.inkDim,fontWeight:i===month?800:400 }}>{MS[i][0]}</div>
              </div>
            ))}
          </div>
        </Glass>
        <Glass r={22} pad="0" style={{ overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 16px",borderBottom:`1px solid ${T.strokeSoft}` }}>{["Mois","Dépenses","Solde"].map(h=><div key={h} style={{ fontSize:11,fontWeight:700,color:T.inkDim }}>{h}</div>)}</div>
          {annual.map((d,i)=>{ const sol=d.earned-d.spent,has=d.spent>0||d.earned>0; return (
            <div key={i} onClick={()=>{setMonth(i);setTab("home");}} style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"14px 16px",borderBottom:i<11?`1px solid ${T.strokeSoft}`:"none",cursor:"pointer",background:i===month?T.indigo+"12":"transparent" }}>
              <div style={{ fontWeight:i===month?800:500,color:i===month?T.indigoLt:T.ink,fontSize:14 }}>{MS[i]}</div>
              <div style={{ color:d.spent>0?T.down:T.inkDim,fontWeight:600,fontSize:14 }}>{d.spent>0?chf(d.spent):"—"}</div>
              <div style={{ color:has?(sol>=0?T.up:T.down):T.inkDim,fontWeight:700,fontSize:14 }}>{has?chf(Math.abs(sol)):"—"}</div>
            </div>
          ); })}
        </Glass>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RÉGLAGES
  // ════════════════════════════════════════════════════════════════════════
  function Reglages(){
    const allExp=txs.filter(t=>!t.isIncome).length, allInc=txs.filter(t=>t.isIncome).length;
    return (
      <div>
        <div style={{ fontSize:28,fontWeight:900,color:T.ink,letterSpacing:-.5,marginBottom:24 }}>Réglages</div>

        {/* Stats overview */}
        <div style={{ display:"flex",gap:10,marginBottom:24 }}>
          <Glass r={18} pad="16px" style={{ flex:1 }}><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:6 }}>TRANSACTIONS</div><div style={{ fontSize:22,fontWeight:800,color:T.ink }}>{txs.length}</div></Glass>
          <Glass r={18} pad="16px" style={{ flex:1 }}><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:6 }}>DÉPENSES</div><div style={{ fontSize:22,fontWeight:800,color:T.down }}>{allExp}</div></Glass>
          <Glass r={18} pad="16px" style={{ flex:1 }}><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:6 }}>ENTRÉES</div><div style={{ fontSize:22,fontWeight:800,color:T.up }}>{allInc}</div></Glass>
        </div>

        {/* Appearance */}
        <Section label="APPARENCE">
          <Glass r={20} pad="0" style={{ overflow:"hidden" }}>
            <Row onClick={()=>setThemeKey(k=>k==="dark"?"light":"dark")} icon={themeKey==="dark"?"🌙":"☀️"} title="Thème" sub={themeKey==="dark"?"Mode sombre":"Mode clair"}>
              <Toggle on={themeKey==="dark"} />
            </Row>
          </Glass>
        </Section>

        {/* Income */}
        <Section label="REVENUS RÉCURRENTS" action={<AddBtn color={T.up} onClick={()=>{setIncForm({label:"",amount:"",day:25});setSheet("addInc");}} />}>
          {incomes.length===0&&<Empty>Aucun revenu configuré</Empty>}
          {incomes.length>0&&<Glass r={20} pad="0" style={{ overflow:"hidden" }}>
            {incomes.map((inc,i)=>(
              <div key={inc.id} style={rowStyle(T,i<incomes.length-1)}>
                <div><div style={{ fontWeight:600,fontSize:15,color:T.ink }}>{inc.label}</div><div style={{ fontSize:12,color:T.inkDim }}>Versé le {inc.day}</div></div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}><Pill color={T.up}>{chf(inc.amount)}</Pill><Del onClick={()=>delInc(inc.id)} /></div>
              </div>
            ))}
          </Glass>}
        </Section>

        {/* Recurring */}
        <Section label="DÉPENSES FIXES" action={<AddBtn color={T.down} onClick={()=>{setRecForm({label:"",amount:"",category:"logement",day:1});setSheet("addRec");}} />}>
          {recurring.length===0&&<Empty>Aucune dépense fixe</Empty>}
          {recurring.length>0&&<Glass r={20} pad="0" style={{ overflow:"hidden" }}>
            {recurring.map((r,i)=>{ const c=catById(r.category); return (
              <div key={r.id} style={rowStyle(T,i<recurring.length-1)}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar icon={c.icon} color={c.color} size={38} /><div><div style={{ fontWeight:600,fontSize:15,color:T.ink }}>{r.label}</div><div style={{ fontSize:12,color:T.inkDim }}>Le {r.day} · {c.label}</div></div></div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}><Pill color={T.down}>{chf(r.amount)}</Pill><Del onClick={()=>delRec(r.id)} /></div>
              </div>
            ); })}
          </Glass>}
        </Section>

        {/* Budgets */}


        {/* Data */}
        <Section label="MES CATÉGORIES" action={<AddBtn color={T.indigoLt} onClick={()=>setEditCat("new")} />}>
          <Glass r={20} pad="0" style={{ overflow:"hidden" }}>
            {/* Base categories — can be renamed */}
            {BASE_CATS.filter(c=>c.id!=="autre"&&c.id!=="twint").map((cat,i,arr)=>(
              <div key={cat.id} style={rowStyle(T,true)}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{cat.icon}</div>
                  <span style={{ fontSize:15,color:T.ink,fontWeight:500 }}>{cat.label}</span>
                </div>
                <span style={{ fontSize:11,color:T.inkDim }}>Intégrée</span>
              </div>
            ))}
            {/* Custom categories — can be edited/deleted */}
            {customCats.map((cat,i)=>(
              <div key={cat.id} style={rowStyle(T,true)}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{cat.icon}</div>
                  <span style={{ fontSize:15,color:T.ink,fontWeight:500 }}>{cat.label}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <button onClick={()=>setEditCat(cat.id)} style={{ background:T.cardHi,border:`1px solid ${T.stroke}`,borderRadius:8,padding:"5px 10px",color:T.inkSub,fontSize:12,cursor:"pointer" }}>✏️ Modifier</button>
                  <Del onClick={()=>deleteCustomCat(cat.id)} />
                </div>
              </div>
            ))}
            {customCats.length===0&&BASE_CATS.length>0&&<div style={{ padding:"12px 16px",fontSize:13,color:T.inkDim }}>Appuie sur + pour créer une catégorie personnalisée</div>}
          </Glass>
        </Section>

        <Section label="RÈGLES APPRISES">
          <Glass r={20} pad="0" style={{ overflow:"hidden" }}>
            {Object.keys(learnedRules).length===0&&<Empty>Aucune règle — modifie une catégorie pour en créer</Empty>}
            {Object.entries(learnedRules).slice(0,20).map(([desc,cat],i,arr)=>{ const c=catById(cat); return (
              <div key={desc} style={rowStyle(T,i<arr.length-1)}>
                <div style={{ minWidth:0,flex:1 }}>
                  <div style={{ fontWeight:600,fontSize:14,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{desc}</div>
                  <div style={{ fontSize:12,color:T.inkDim }}>→ {c.icon} {c.label}</div>
                </div>
                <button onClick={()=>setLearnedRules(r=>{ const n={...r}; delete n[desc]; return n; })} style={{ background:"none",border:"none",color:T.inkDim,cursor:"pointer",fontSize:20 }}>×</button>
              </div>
            ); })}
          </Glass>
        </Section>

        <Section label="DONNÉES">
          <Glass r={20} pad="0" style={{ overflow:"hidden" }}>
            <Row onClick={()=>{ if(confirm)return; setConfirm({all:true,label:"toutes tes données"}); }} icon="🗑️" title="Tout effacer" sub="Supprime toutes les transactions" danger last />
          </Glass>
        </Section>

        <div style={{ textAlign:"center",color:T.inkFaint,fontSize:12,marginTop:8 }}>Aurora · Budget personnel</div>
      </div>
    );
  }



  // ════════════════════════════════════════════════════════════════════════
  //  SHEETS
  // ════════════════════════════════════════════════════════════════════════
  function AddTxSheet(){
    const [f,setF]=useState(txForm);
    return (
      <Sheet title={f.isIncome?"Nouveau revenu":"Nouvelle dépense"} onClose={()=>setSheet(null)}>
        <div style={{ display:"flex",gap:6,marginBottom:20,background:T.cardHi,borderRadius:16,padding:4 }}>
          {[{k:false,l:"💸 Dépense"},{k:true,l:"💰 Revenu"}].map(({k,l})=><button key={String(k)} onClick={()=>setF(p=>({...p,isIncome:k}))} style={{ flex:1,background:f.isIncome===k?(k?T.up:T.indigo):"transparent",border:"none",borderRadius:12,padding:"11px",color:f.isIncome===k?"#fff":T.inkSub,fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .2s" }}>{l}</button>)}
        </div>
        <Field label="Description"><TInput placeholder="Ex: Migros, Salaire…" value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} /></Field>
        <Field label="Montant (CHF)"><TInput type="number" placeholder="0.00" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></Field>
        {!f.isIncome&&<Field label="Catégorie"><CatPicker value={f.category} onChange={v=>setF(p=>({...p,category:v}))} cats={allCats} /></Field>}
        <Field label="Date"><TInput type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))} /></Field>
        <TBtn full variant={f.isIncome?"up":"primary"} onClick={()=>{if(!f.description||!f.amount)return;addTx(f);setSheet(null);}}>Ajouter</TBtn>
      </Sheet>
    );
  }
  function AddIncSheet(){
    const [f,setF]=useState(incForm);
    return (
      <Sheet title="Revenu récurrent" subtitle="Compté automatiquement chaque mois" onClose={()=>setSheet(null)}>
        <Field label="Label"><TInput placeholder="Ex: Salaire HouseTrap" value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))} /></Field>
        <Field label="Montant net (CHF)"><TInput type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></Field>
        <Field label="Jour de versement"><TInput type="number" min={1} max={31} value={f.day} onChange={e=>setF(p=>({...p,day:e.target.value}))} /></Field>
        <TBtn full variant="up" onClick={()=>{if(!f.label||!f.amount)return;addInc(f);setSheet(null);}}>Enregistrer</TBtn>
      </Sheet>
    );
  }
  function AddRecSheet(){
    const [f,setF]=useState(recForm);
    return (
      <Sheet title="Dépense fixe" subtitle="Loyer, abonnements…" onClose={()=>setSheet(null)}>
        <Field label="Label"><TInput placeholder="Ex: Loyer, Spotify…" value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))} /></Field>
        <Field label="Montant (CHF)"><TInput type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))} /></Field>
        <Field label="Catégorie"><CatPicker value={f.category} onChange={v=>setF(p=>({...p,category:v}))} cats={allCats} /></Field>
        <Field label="Jour de prélèvement"><TInput type="number" min={1} max={31} value={f.day} onChange={e=>setF(p=>({...p,day:e.target.value}))} /></Field>
        <TBtn full variant="down" onClick={()=>{if(!f.label||!f.amount)return;addRec(f);setSheet(null);}}>Ajouter</TBtn>
      </Sheet>
    );
  }
  function ImportLoad(){
    return <Sheet title="Analyse en cours…" onClose={()=>{}}>
      <div style={{ textAlign:"center",padding:"44px 0" }}>
        <div style={{ fontSize:56,marginBottom:20 }}>🤖</div>
        <div style={{ fontSize:17,fontWeight:700,color:T.ink,marginBottom:8 }}>Catégorisation IA</div>
        <div style={{ fontSize:14,color:T.inkDim,marginBottom:32 }}>Claude classe tes transactions…</div>
        <div style={{ display:"flex",justifyContent:"center",gap:8 }}>{[0,1,2].map(i=><div key={i} style={{ width:10,height:10,borderRadius:"50%",background:T.indigo,animation:`pulse 1.2s ${i*.25}s infinite` }} />)}</div>
      </div>
    </Sheet>;
  }
  function ReviewSheet(){
    const [items,setItems]=useState(impItems);
    const inc=items.filter(t=>t.isIncome),exp=items.filter(t=>!t.isIncome),on=items.filter(t=>t._on);
    const tog=idx=>setItems(p=>p.map(t=>t._idx===idx?{...t,_on:!t._on}:t));
    const setC=(idx,cat)=>setItems(p=>p.map(t=>t._idx===idx?{...t,category:cat}:t));
    return (
      <Sheet title="Vérifier l'import" subtitle={`${on.length}/${items.length} sélectionnées`} onClose={()=>setSheet(null)}>
        {inc.length>0&&<div style={{ marginBottom:20 }}><div style={{ fontSize:12,fontWeight:700,color:T.up,letterSpacing:.6,marginBottom:10 }}>REVENUS ({inc.length})</div>
          {inc.map(t=><div key={t._idx} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:T.cardHi,border:`1px solid ${t._on?T.up+"44":T.stroke}`,borderRadius:14,padding:"12px 14px",marginBottom:8,opacity:t._on?1:.4 }}>
            <div style={{ minWidth:0,flex:1,marginRight:10 }}><div style={{ fontWeight:600,fontSize:14,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.description}</div><div style={{ fontSize:11,color:T.inkDim }}>{t.date}</div></div>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}><span style={{ fontWeight:700,color:T.up }}>{chf(t.amount)}</span><input type="checkbox" checked={t._on} onChange={()=>tog(t._idx)} style={{ width:18,height:18 }} /></div>
          </div>)}
        </div>}
        <div style={{ fontSize:12,fontWeight:700,color:T.down,letterSpacing:.6,marginBottom:10 }}>DÉPENSES ({exp.length})</div>
        {exp.map(t=>{ const c=catById(t.category); return (
          <div key={t._idx} style={{ background:T.cardHi,border:`1px solid ${t._on?c.color+"44":T.stroke}`,borderRadius:14,padding:"12px 14px",marginBottom:8,opacity:t._on?1:.4 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:t._on?10:0 }}>
              <div style={{ minWidth:0,flex:1,marginRight:10 }}><div style={{ fontWeight:600,fontSize:14,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.description}</div><div style={{ fontSize:11,color:T.inkDim }}>{t.date}</div></div>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}><span style={{ fontWeight:700,color:T.down }}>{chf(t.amount)}</span><input type="checkbox" checked={t._on} onChange={()=>tog(t._idx)} style={{ width:18,height:18 }} /></div>
            </div>
            {t._on&&<div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{allCats.map(cc2=><button key={cc2.id} onClick={()=>setC(t._idx,cc2.id)} style={{ background:t.category===cc2.id?cc2.color+"22":T.card,border:`1px solid ${t.category===cc2.id?cc2.color:T.stroke}`,borderRadius:14,padding:"4px 10px",color:t.category===cc2.id?cc2.color:T.inkDim,fontSize:11,cursor:"pointer",fontWeight:t.category===cc2.id?700:400 }}>{cc2.icon} {cc2.label}</button>)}</div>}
          </div>
        ); })}
        <div style={{ position:"sticky",bottom:0,background:T.bg,paddingTop:12,marginTop:8 }}><TBtn full variant="up" onClick={()=>doImport(items)}>Importer {on.length} transaction{on.length>1?"s":""}</TBtn></div>
      </Sheet>
    );
  }
  function MerchDetailSheet(){
    const list=C.exp.filter(t=>t.description.trim()===merchDetail).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const total=list.reduce((s,t)=>s+ +t.amount,0);
    const cat=list.length?catById(list[0].category):catById("autre");
    // also look across all months for this merchant
    const allTime=txs.filter(t=>!t.isIncome&&t.description.trim()===merchDetail);
    const allTotal=allTime.reduce((s,t)=>s+ +t.amount,0);
    const avgPerVisit=allTime.length?allTotal/allTime.length:0;
    return (
      <Sheet title={merchDetail} subtitle={`${MONTHS[month]} ${year}`} onClose={()=>setSheet(null)}>
        <div style={{ display:"flex",gap:10,marginBottom:18 }}>
          <Glass r={16} pad="14px 16px" style={{ flex:1 }}><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4 }}>CE MOIS</div><div style={{ fontSize:20,fontWeight:800,color:cat.color }}>{chf(total)}</div></Glass>
          <Glass r={16} pad="14px 16px" style={{ flex:1 }}><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4 }}>VISITES</div><div style={{ fontSize:20,fontWeight:800,color:T.ink }}>{list.length}</div></Glass>
        </div>
        <div style={{ display:"flex",gap:10,marginBottom:18 }}>
          <Glass r={16} pad="14px 16px" style={{ flex:1 }}><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4 }}>TOTAL (TOUT)</div><div style={{ fontSize:18,fontWeight:800,color:T.inkSub }}>{chf(allTotal)}</div></Glass>
          <Glass r={16} pad="14px 16px" style={{ flex:1 }}><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4 }}>MOY./VISITE</div><div style={{ fontSize:18,fontWeight:800,color:T.inkSub }}>{chf(avgPerVisit)}</div></Glass>
        </div>
        {list.length===0&&<Empty>Aucune dépense ce mois</Empty>}
        <Glass pad="0 16px" r={20}>{list.map(t=><TxRow key={t.id} t={t} onDel={()=>askDel(t)} onEdit={()=>setEditTx(t)} />)}</Glass>
      </Sheet>
    );
  }

  function CatDetailSheet(){
    const c=catById(catDetail);
    const list=C.exp.filter(t=>t.category===catDetail).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const total=list.reduce((s,t)=>s+ +t.amount,0);
    return (
      <Sheet title={c.label} subtitle={`${MONTHS[month]} ${year}`} onClose={()=>setSheet(null)}>
        <div style={{ display:"flex",gap:10,marginBottom:18 }}>
          <Glass r={16} pad="14px 16px" style={{ flex:1 }}><div style={{ fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4 }}>TOTAL</div><div style={{ fontSize:20,fontWeight:800,color:c.color }}>{chf(total)}</div></Glass>
        </div>
        {list.length===0&&<Empty>Aucune dépense</Empty>}
        <Glass pad="0 16px" r={20}>{list.map(t=><TxRow key={t.id} t={t} onDel={()=>askDel(t)} onEdit={()=>setEditTx(t)} />)}</Glass>
      </Sheet>
    );
  }
  function IncDetailSheet(){
    return (
      <Sheet title="Revenus" subtitle={`${MONTHS[month]} ${year}`} onClose={()=>setSheet(null)}>
        {incomes.length>0&&<div style={{ marginBottom:20 }}><div style={{ fontSize:12,fontWeight:700,color:T.inkDim,letterSpacing:.6,marginBottom:10 }}>FIXES CONFIGURÉS</div>
          <Glass pad="0 16px" r={18}>{incomes.map(inc=><div key={inc.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.strokeSoft}` }}><div><div style={{ fontWeight:600,fontSize:15,color:T.ink }}>{inc.label}</div><div style={{ fontSize:12,color:T.inkDim }}>Versé le {inc.day}</div></div><span style={{ fontWeight:700,color:T.up }}>{chf(inc.amount)}</span></div>)}</Glass>
        </div>}
        {C.incT.length>0&&<div><div style={{ fontSize:12,fontWeight:700,color:T.inkDim,letterSpacing:.6,marginBottom:10 }}>ENTRÉES IMPORTÉES</div>
          <Glass pad="0 16px" r={18}>{C.incT.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=><div key={t.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.strokeSoft}` }}><div style={{ minWidth:0,flex:1,marginRight:10 }}><div style={{ fontWeight:600,fontSize:15,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.description}</div><div style={{ fontSize:12,color:T.inkDim }}>{t.date}</div></div><span style={{ fontWeight:700,color:T.up,flexShrink:0 }}>+{chf(t.amount)}</span></div>)}</Glass>
        </div>}
        {C.incT.length===0&&incomes.length===0&&<Empty>Aucun revenu ce mois</Empty>}
        <Glass pad="14px 18px" r={16} style={{ marginTop:16,display:"flex",justifyContent:"space-between" }}><span style={{ color:T.inkSub,fontWeight:600 }}>Total</span><span style={{ fontWeight:800,color:T.up,fontSize:17 }}>{chf(C.totalIncome)}</span></Glass>
      </Sheet>
    );
  }
  function EditTxSheet(){
    const T=useT();
    const [desc,setDesc]=useState(editTx?.description||"");
    const [cat,setCat]=useState(editTx?.category||"autre");
    if(!editTx) return null;
    const sameDesc=txs.filter(t=>t.description.trim()===editTx.description.trim()&&!t.isIncome&&t.id!==editTx.id);
    return (
      <Sheet title="Modifier" subtitle={editTx.description} onClose={()=>setEditTx(null)}>
        <Field label="Nom de la transaction">
          <TInput value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Nom du marchand" />
        </Field>
        <Field label="Catégorie">
          <CatPicker value={cat} onChange={setCat} cats={allCats} />
        </Field>
        <TBtn full onClick={()=>{ updateTx(editTx.id,{description:desc,category:cat}); setEditTx(null); }} style={{marginBottom:12}}>
          Enregistrer
        </TBtn>
        {sameDesc.length>0&&(
          <div style={{ marginTop:8 }}>
            <div style={{ height:1,background:T.strokeSoft,marginBottom:16 }} />
            <div style={{ fontSize:13,fontWeight:700,color:T.inkDim,marginBottom:6 }}>RECATÉGORISER EN MASSE</div>
            <div style={{ fontSize:13,color:T.inkSub,marginBottom:14,lineHeight:1.5 }}>
              {sameDesc.length + 1} transaction{sameDesc.length>0?"s":""} avec le nom <span style={{color:T.ink,fontWeight:700}}>"{editTx.description}"</span> — appliquer la catégorie <span style={{color:catById(cat).color,fontWeight:700}}>{catById(cat).icon} {catById(cat).label}</span> à toutes ?
            </div>
            <TBtn full variant="down" onClick={()=>{ bulkRecategorize(editTx.description,cat); setEditTx(null); }}>
              Appliquer à toutes ({sameDesc.length+1})
            </TBtn>
          </div>
        )}
      </Sheet>
    );
  }

  function EditCatSheet(){
    const T=useT();
    const isNew=editCat==="new";
    const existing=isNew?null:customCats.find(c=>c.id===editCat);
    const [label,setLabel]=useState(existing?.label||"");
    const [icon,setIcon]=useState(existing?.icon||"📦");
    const [color,setColor]=useState(existing?.color||"#6E5DF0");
    if(!editCat)return null;
    return (
      <Sheet title={isNew?"Nouvelle catégorie":"Modifier la catégorie"} onClose={()=>setEditCat(null)}>
        <Field label="Nom">
          <TInput placeholder="Ex: Cadeaux, Animaux…" value={label} onChange={e=>setLabel(e.target.value)} />
        </Field>
        <Field label="Icône">
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {EMOJI_LIST.map(e=>(
              <button key={e} onClick={()=>setIcon(e)} style={{ width:44,height:44,borderRadius:12,background:icon===e?color+"33":T.cardHi,border:`2px solid ${icon===e?color:T.stroke}`,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>{e}</button>
            ))}
          </div>
        </Field>
        <Field label="Couleur">
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {COLOR_LIST.map(col=>(
              <button key={col} onClick={()=>setColor(col)} style={{ width:38,height:38,borderRadius:"50%",background:col,border:color===col?"3px solid #fff":"3px solid transparent",cursor:"pointer",boxShadow:color===col?`0 0 0 2px ${col}`:"none" }} />
            ))}
          </div>
        </Field>
        {/* Preview */}
        <div style={{ display:"flex",alignItems:"center",gap:12,background:T.cardHi,borderRadius:16,padding:"14px 16px",marginBottom:16 }}>
          <div style={{ width:44,height:44,borderRadius:13,background:color+"33",border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>{icon}</div>
          <span style={{ fontSize:16,fontWeight:700,color:T.ink }}>{label||"Aperçu"}</span>
        </div>
        <TBtn full onClick={()=>{
          if(!label.trim())return;
          if(isNew) addCustomCat({label:label.trim(),icon,color});
          else updateCustomCat(editCat,{label:label.trim(),icon,color});
          setEditCat(null);
        }}>{isNew?"Créer la catégorie":"Enregistrer"}</TBtn>
      </Sheet>
    );
  }

  function HistorySheet(){
    const f=txs.filter(t=>!searchQ||t.description?.toLowerCase().includes(searchQ.toLowerCase())).slice(0,120);
    return (
      <Sheet title="Historique" onClose={()=>setSheet(null)}>
        <div style={{ marginBottom:16 }}><TInput placeholder="🔍 Rechercher…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} /></div>
        {f.length===0&&<Empty>Aucune transaction</Empty>}
        <Glass pad="0 16px" r={20}>{f.map(t=><TxRow key={t.id} t={t} onDel={()=>askDel(t)} onEdit={()=>setEditTx(t)} />)}</Glass>
      </Sheet>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  LAYOUT
  // ════════════════════════════════════════════════════════════════════════
  const TABS=[{id:"home",icon:"⌂",label:"Accueil"},{id:"analyse",icon:"◑",label:"Analyse"},{id:"annual",icon:"▦",label:"Année"},{id:"settings",icon:"⚙",label:"Réglages"}];

  return (
    <div style={{ background:T.bg,backgroundImage:T.bgGrad,minHeight:"100dvh",fontFamily:"-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",color:T.ink,maxWidth:430,margin:"0 auto",position:"relative" }}>
      <style>{`
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
        html,body{background:${T.bg}!important;margin:0;padding:0;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input[type=date]{color-scheme:${themeKey};}
        ::-webkit-scrollbar{display:none;}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.75)}50%{opacity:1;transform:scale(1)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div key={tab} style={{ padding:"58px 16px 100px",animation:"fadeIn .35s ease" }}>
        {tab==="home"&&<Home />}
        {tab==="analyse"&&<Analyse />}
        {tab==="annual"&&<Annee />}
        {tab==="settings"&&<Reglages />}
      </div>

      {/* Tab bar */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,zIndex:200,paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
        <div style={{ background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderTop:`1px solid ${T.stroke}`,display:"flex",padding:"12px 8px 14px",boxShadow:T.shadow }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"2px 0",position:"relative" }}>
              {tab===t.id&&<div style={{ position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",width:30,height:3,borderRadius:"0 0 4px 4px",background:`linear-gradient(90deg,${T.indigo},${T.violet})` }} />}
              <span style={{ fontSize:21,color:tab===t.id?T.indigoLt:T.inkDim,transition:"color .2s" }}>{t.icon}</span>
              <span style={{ fontSize:10,fontWeight:tab===t.id?800:500,color:tab===t.id?T.indigoLt:T.inkDim,letterSpacing:.3 }}>{t.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {sheet==="addTx"&&<AddTxSheet />}
      {sheet==="addInc"&&<AddIncSheet />}
      {sheet==="addRec"&&<AddRecSheet />}
      {sheet==="import"&&impLoad&&<ImportLoad />}
      {sheet==="review"&&!impLoad&&<ReviewSheet />}
      {sheet==="history"&&<HistorySheet />}
      {editTx&&<EditTxSheet />}
      {editCat&&<EditCatSheet />}
      {sheet==="catDetail"&&catDetail&&<CatDetailSheet />}
      {sheet==="merchDetail"&&merchDetail&&<MerchDetailSheet />}
      {sheet==="incDetail"&&<IncDetailSheet />}

      <Toast msg={toast} onDone={()=>setToast("")} />
      {confirm&&<Confirm msg={confirm.all?"Effacer toutes tes données ? Cette action est irréversible.":`Supprimer "${confirm.label}" ?`} onYes={()=>{ if(confirm.all){setTxs([]);setToast("Tout effacé");setConfirm(null);}else delTx(confirm.id); }} onNo={()=>setConfirm(null)} />}
    </div>
  );
}

// ── Settings helpers ──────────────────────────────────────────────────────────
const navBtn=T=>({ background:T.cardHi,border:`1px solid ${T.stroke}`,borderRadius:12,width:36,height:36,color:T.inkSub,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" });
const rowStyle=(T,border)=>({ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:border?`1px solid ${T.strokeSoft}`:"none" });
function Section({ label, action, children }){ const T=useT(); return <div style={{ marginBottom:24 }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}><div style={{ fontSize:12,fontWeight:700,color:T.inkDim,letterSpacing:.8 }}>{label}</div>{action}</div>{children}</div>; }
function Row({ icon, title, sub, onClick, children, danger, last }){ const T=useT(); return <div onClick={onClick} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 18px",cursor:onClick?"pointer":"default",borderBottom:last?"none":`1px solid ${T.strokeSoft}` }}><div style={{ display:"flex",alignItems:"center",gap:12 }}><div style={{ width:36,height:36,borderRadius:11,background:T.cardHi,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{icon}</div><div><div style={{ fontWeight:600,fontSize:15,color:danger?T.down:T.ink }}>{title}</div>{sub&&<div style={{ fontSize:12,color:T.inkDim }}>{sub}</div>}</div></div>{children}</div>; }
function Toggle({ on }){ const T=useT(); return <div style={{ background:on?T.indigo:T.inkFaint,borderRadius:20,width:50,height:30,position:"relative",transition:"background .3s" }}><div style={{ position:"absolute",top:3,left:on?22:3,width:24,height:24,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.3)",transition:"left .3s" }} /></div>; }
function AddBtn({ color, onClick }){ return <button onClick={onClick} style={{ background:color+"22",border:`1px solid ${color}44`,borderRadius:10,padding:"6px 14px",color,fontWeight:700,fontSize:12,cursor:"pointer" }}>+ Ajouter</button>; }
function Del({ onClick }){ const T=useT(); return <button onClick={onClick} style={{ background:"none",border:"none",color:T.inkDim,cursor:"pointer",fontSize:20 }}>×</button>; }
function Empty({ children }){ const T=useT(); return <div style={{ color:T.inkDim,fontSize:14,textAlign:"center",padding:20 }}>{children}</div>; }
