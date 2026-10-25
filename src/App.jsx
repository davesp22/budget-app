/* eslint-disable react-hooks/static-components */
import{useState,useEffect,useRef,useMemo,useCallback}from"react";

// ═══════════════════════════════════════════════════════════════
//  THEMES — Apple HIG Design System
// ═══════════════════════════════════════════════════════════════
const THEMES={
  dark:{
    name:"dark",bg:"#000000",bgGrad:"none",
    card:"rgba(28,28,30,1)",cardHi:"rgba(44,44,46,1)",
    glass:"rgba(18,18,20,0.94)",stroke:"rgba(255,255,255,0.12)",
    strokeSoft:"rgba(255,255,255,0.07)",blur:"saturate(180%) blur(20px)",
    indigo:"#0A84FF",violet:"#5E5CE6",cyan:"#32D74B",
    up:"#32D74B",down:"#FF453A",gold:"#FFD60A",
    ink:"#FFFFFF",inkSub:"rgba(255,255,255,0.75)",
    inkDim:"rgba(255,255,255,0.45)",inkFaint:"rgba(255,255,255,0.18)",
    indigoLt:"#0A84FF",shadow:"0 -0.5px 0 rgba(255,255,255,0.08)",
    glow:"rgba(10,132,255,0.30)",
  },
  light:{
    name:"light",bg:"#F2F2F7",bgGrad:"none",
    card:"rgba(255,255,255,1)",cardHi:"rgba(255,255,255,1)",
    glass:"rgba(242,242,247,0.94)",stroke:"rgba(60,60,67,0.13)",
    strokeSoft:"rgba(60,60,67,0.07)",blur:"saturate(180%) blur(20px)",
    indigo:"#007AFF",violet:"#5856D6",cyan:"#34C759",
    up:"#34C759",down:"#FF3B30",gold:"#FF9500",
    ink:"#000000",inkSub:"rgba(0,0,0,0.70)",
    inkDim:"rgba(0,0,0,0.45)",inkFaint:"rgba(0,0,0,0.15)",
    indigoLt:"#007AFF",shadow:"0 -0.5px 0 rgba(0,0,0,0.08)",
    glow:"rgba(0,122,255,0.20)",
  }
};

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MS=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const WDAYS=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const BASE_CATS=[
  {id:"alimentation",label:"Alimentation",icon:"🛒",color:"#30D158",kw:["migros","coop","denner","aldi","lidl","manor","volg","spar","avec","rewe","globus food","supermarché","grocery"]},
  {id:"restaurant",label:"Restaurant",icon:"🍽️",color:"#FF9F0A",kw:["mcdonald","burger","pizza","sushi","restaurant","café","bar","bistro","kebab","donut","starbucks","subway","kfc","five guys","nespresso"]},
  {id:"transport",label:"Transport",icon:"🚗",color:"#64D2FF",kw:["cff","sbb","tpf","bus","tram","uber","taxi","parking","autoroute","essence","benzin","shell","bp","avia","reka","mobility"]},
  {id:"loisirs",label:"Loisirs",icon:"🎮",color:"#BF5AF2",kw:["netflix","spotify","steam","playstation","xbox","nintendo","cinema","concert","ticketmaster","disney","apple tv","dazn","twitch","youtube premium"]},
  {id:"sante",label:"Santé",icon:"💊",color:"#FF6369",kw:["pharmacie","medecin","docteur","dentiste","hôpital","apotheke","droguerie","sanitaire","physio","optique"]},
  {id:"vetements",label:"Vêtements",icon:"👕",color:"#FF9F0A",kw:["zara","h&m","uniqlo","nike","adidas","zalando","about you","c&a","ochsner","manor","decathlon","snipes","foot locker"]},
  {id:"logement",label:"Logement",icon:"🏠",color:"#0A84FF",kw:["loyer","rent","ikea","conforama","brack","microspot","elektro","jumbo","hornbach","bauhaus","nettoyage","entretien","assurance"]},
  {id:"tech",label:"Tech",icon:"💻",color:"#5E5CE6",kw:["apple","samsung","google","microsoft","digitec","galaxus","interdiscount","mediamarkt","fnac","abonnement","swisscom","sunrise","salt","yallo","wingo","quickline"]},
  {id:"taxes",label:"Taxes & Admin",icon:"🏛️",color:"#98989D",kw:["impôt","taxe","amende","caisse","avs","lpp","assurance maladie","css","helsana","concordia","swica","visana","sanitas"]},
  {id:"twint",label:"TWINT",icon:"📲",color:"#FFD60A",kw:["twint"]},
  {id:"autre",label:"Autre",icon:"📦",color:"#636366",kw:[]},
];

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
const SELF=["virement","transfer","transfert","epargne","épargne","saving","from savings","to savings","self","moi-même","myself","proprio","propre compte","eigentransfer","interbank","interne","compte à compte","remboursement propre","retrait atm","retrait bancomat","bancomat","retrait"];
const TWINT_P=["loris","luca","noe","noé","valentin","mathieu","mathis","thomas","julian","marco","kevin","david","alex","alexis","simon","nicolas","romain","pierre","antoine","benoit","benoît","michael","michaël","fabian","daniel","joel","joël","samuel","raphael","raphaël","gabriel","xavier","jonathan","clement","clément","tristan","maxime","florian","guillaume","baptiste","quentin","adrien","jordan","theo","théo","hugo","tom","lucas","arthur","ethan","noah","enzo","axel","leo","léo","noa","ilias","selim","younes","yanis","mehdi","karim","sofiane","amine","emre","furkan","jannis","lukas","jonas","tim","jan","felix","moritz","till","florin","yann","thibault","damien","vincent","christophe","emile","émile","dominic","fabrice","renaud","sebastien","sébastien","aurelien","aurélien","elisa","laura","emma","sarah","julie","marie","céline","celine","pauline","camille","lucie","alice","léa","lea","jade","chloé","chloe","amélie","amelie","anna","lisa","clara","manon","inès","ines","eva","sofia","maya","anaïs","anais"];
const TWINT_MAP={"migros":"alimentation","coop":"alimentation","denner":"alimentation","aldi":"alimentation","lidl":"alimentation","spar":"alimentation","avec":"alimentation","mcdonald":"restaurant","burger king":"restaurant","pizza":"restaurant","starbucks":"restaurant","kfc":"restaurant","subway":"restaurant","cff":"transport","sbb":"transport","tpf":"transport","uber":"transport","shell":"transport","bp":"transport","avia":"transport","netflix":"loisirs","spotify":"loisirs","steam":"loisirs","nintendo":"loisirs","apple":"tech","samsung":"tech","digitec":"tech","galaxus":"tech","swisscom":"tech","sunrise":"tech","salt":"tech","loyer":"logement","rent":"logement","ikea":"logement","pharmacie":"sante","apotheke":"sante","medecin":"sante"};
const YUH_SKIP=["CARD PAYMENT","ACCOUNT TRANSFER","STANDING ORDER","DIRECT DEBIT RETURN","BANK TRANSFER RETURN"];
const YUH_IN=["SALARY","BANK TRANSFER","SEPA CREDIT TRANSFER","INTEREST"];

const cc=s=>s?.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim()||"";
function splitCSV(line){const r=[];let cur="",inQ=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}else if((c===";"||c===",")&&!inQ){r.push(cur);cur="";}else cur+=c;}r.push(cur);return r;}
function toDate(s){if(!s)return null;const clean=s.trim().replace(/["']/g,"");const isoM=clean.match(/^(\d{4})-(\d{2})-(\d{2})/);if(isoM)return`${isoM[1]}-${isoM[2]}-${isoM[3]}`;const dmyDot=clean.match(/^(\d{2})\.(\d{2})\.(\d{4})/);if(dmyDot)return`${dmyDot[3]}-${dmyDot[2]}-${dmyDot[1]}`;const dmySlash=clean.match(/^(\d{2})\/(\d{2})\/(\d{4})/);if(dmySlash)return`${dmySlash[3]}-${dmySlash[2]}-${dmySlash[1]}`;return null;}
function toAmt(s){if(!s&&s!==0)return null;const n=parseFloat(String(s).replace(/[^0-9.,-]/g,"").replace(",","."));return isNaN(n)?null:Math.abs(n);}
function isSelf(desc){const d=cc(desc);return SELF.some(k=>d.includes(k));}
function today(){const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function chf(n){return`CHF ${(+n||0).toFixed(2)}`;}
function chfK(n){return n>=1000?`${(n/1000).toFixed(1)}k`:`${(+n||0).toFixed(0)}`;}

function smartCat(desc,allCats){
  const d=cc(desc);
  if(isSelf(d))return null;
  const isTwint=d.includes("twint");
  if(isTwint){
    const person=TWINT_P.find(p=>d.includes(p));
    if(person)return"twint";
    for(const[kw,cat]of Object.entries(TWINT_MAP)){if(d.includes(kw))return cat;}
    return"twint";
  }
  for(const cat of allCats){
    if(!cat.kw?.length)continue;
    if(cat.kw.some(k=>d.includes(cc(k))))return cat.id;
  }
  return"autre";
}

// ═══════════════════════════════════════════════════════════════
//  CSV PARSERS
// ═══════════════════════════════════════════════════════════════
function parseYuh(text,allCats){
  const lines=text.split(/\r?\n/).filter(l=>l.trim());
  const hIdx=lines.findIndex(l=>l.toLowerCase().includes("activity type")||l.toLowerCase().includes("name"));
  if(hIdx<0)return[];
  const headers=splitCSV(lines[hIdx]).map(h=>h.replace(/^"|"$/g,"").trim().toLowerCase());
  const actIdx=headers.findIndex(h=>h.includes("activity type")||h==="type");
  const nameIdx=headers.findIndex(h=>h==="name"||h.includes("description")||h.includes("libellé"));
  const amtIdx=headers.findIndex(h=>h.includes("amount")||h.includes("montant"));
  const dateIdx=headers.findIndex(h=>h.includes("date"));
  const results=[];
  for(let i=hIdx+1;i<lines.length;i++){
    const cols=splitCSV(lines[i]).map(c=>c.replace(/^"|"$/g,"").trim());
    if(cols.length<3)continue;
    const act=actIdx>=0?cols[actIdx]:"";
    if(YUH_SKIP.some(s=>act.toUpperCase().includes(s)))continue;
    const isIncome=YUH_IN.some(s=>act.toUpperCase().includes(s));
    const desc=nameIdx>=0?cols[nameIdx]:"Transaction";
    if(isSelf(desc))continue;
    const amt=toAmt(amtIdx>=0?cols[amtIdx]:0);
    const date=toDate(dateIdx>=0?cols[dateIdx]:"");
    if(!amt||!date)continue;
    results.push({id:crypto.randomUUID(),description:desc,amount:amt,date,category:isIncome?"":smartCat(desc,allCats)||"autre",isIncome,_on:true,_idx:results.length});
  }
  return results;
}

function parseNeon(text,allCats){
  const lines=text.split(/\r?\n/).filter(l=>l.trim());
  const hIdx=lines.findIndex(l=>/date/i.test(l)&&/amount/i.test(l));
  if(hIdx<0)return[];
  const headers=splitCSV(lines[hIdx]).map(h=>h.replace(/^"|"$/g,"").trim().toLowerCase());
  const dateIdx=headers.findIndex(h=>h==="date");
  const amtIdx=headers.findIndex(h=>h==="amount");
  const descIdx=headers.findIndex(h=>h.includes("description")||h==="subject"||h==="details");
  const subjIdx=headers.findIndex(h=>h==="subject"||h.includes("subject"));
  const results=[];
  for(let i=hIdx+1;i<lines.length;i++){
    const cols=splitCSV(lines[i]).map(c=>c.replace(/^"|"$/g,"").trim());
    if(cols.length<3)continue;
    const rawAmt=amtIdx>=0?parseFloat(cols[amtIdx].replace(",",".")):0;
    if(isNaN(rawAmt)||rawAmt===0)continue;
    const isIncome=rawAmt>0;
    const amt=Math.abs(rawAmt);
    const desc=(descIdx>=0?cols[descIdx]:"")||(subjIdx>=0?cols[subjIdx]:"")||"Transaction";
    if(isSelf(desc))continue;
    const date=toDate(dateIdx>=0?cols[dateIdx]:"");
    if(!date)continue;
    results.push({id:crypto.randomUUID(),description:desc,amount:amt,date,category:isIncome?"":smartCat(desc,allCats)||"autre",isIncome,_on:true,_idx:results.length});
  }
  return results;
}

function parseGeneric(text,allCats){
  const lines=text.split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2)return[];
  const hLine=lines[0];
  const sep=hLine.includes(";")?";":hLine.includes("\t")?"\t":",";
  const headers=hLine.split(sep).map(h=>h.replace(/^"|"$/g,"").trim().toLowerCase());
  const dateIdx=headers.findIndex(h=>h.includes("date"));
  const amtIdx=headers.findIndex(h=>h.includes("amount")||h.includes("montant")||h.includes("betrag"));
  const descIdx=headers.findIndex(h=>h.includes("desc")||h.includes("label")||h.includes("libel")||h.includes("name")||h.includes("text"));
  if(dateIdx<0||amtIdx<0)return[];
  const results=[];
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(sep).map(c=>c.replace(/^"|"$/g,"").trim());
    const rawAmt=parseFloat((cols[amtIdx]||"0").replace(",",".").replace(/[^0-9.-]/g,""));
    if(isNaN(rawAmt)||rawAmt===0)continue;
    const isIncome=rawAmt>0;
    const amt=Math.abs(rawAmt);
    const desc=descIdx>=0?cols[descIdx]:"Transaction";
    if(isSelf(desc))continue;
    const date=toDate(cols[dateIdx]);
    if(!date)continue;
    results.push({id:crypto.randomUUID(),description:desc,amount:amt,date,category:isIncome?"":smartCat(desc,allCats)||"autre",isIncome,_on:true,_idx:results.length});
  }
  return results;
}

function detectAndParse(text,allCats){
  const lc=text.toLowerCase();
  if(lc.includes("activity type")||lc.includes("yuh"))return parseYuh(text,allCats);
  if(lc.includes("neon")||((lc.includes("amount")&&lc.includes("date")&&lc.includes("subject"))))return parseNeon(text,allCats);
  return parseGeneric(text,allCats);
}

async function aiCategorize(items){
  // AI categorization disabled on Netlify (no backend)
  return items;
}

// ═══════════════════════════════════════════════════════════════
//  STORAGE
// ═══════════════════════════════════════════════════════════════
const SK={tx:"au4_tx",inc:"au4_inc",rec:"au4_rec",theme:"au4_th",cats:"au4_cats",rules:"au4_rules"};
const load=(k,fb)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{/* Storage may be unavailable or full. */}};

// ═══════════════════════════════════════════════════════════════
//  UI PRIMITIVES — Apple-style
// ═══════════════════════════════════════════════════════════════
function Glass({children,style={},pad="16px",r=14}){
  return<div style={{borderRadius:r,padding:pad,background:"var(--card)",border:"0.5px solid var(--stroke)",overflow:"hidden",...style}}>{children}</div>;
}

function Avatar({icon,color,size=40}){
  return<div style={{width:size,height:size,borderRadius:Math.round(size*0.26),background:color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.48,flexShrink:0}}>{icon}</div>;
}

function Bar({v,max,color,h=4}){
  const pct=max>0?Math.min(v/max*100,100):0;
  return<div style={{height:h,borderRadius:h,background:"var(--stroke)",overflow:"hidden"}}>
    <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:h,transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)"}}/>
  </div>;
}

function Pill({children,color}){
  return<span style={{display:"inline-flex",alignItems:"center",background:color+"18",color,borderRadius:20,padding:"3px 9px",fontSize:12,fontWeight:600,letterSpacing:-0.1}}>{children}</span>;
}

function Confirm({msg,onYes,onNo}){
  if(!msg)return null;
  return<div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 16px 32px"}} onClick={onNo}>
    <div style={{background:"var(--card)",borderRadius:16,width:"100%",maxWidth:398,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"20px 20px 8px",textAlign:"center"}}>
        <div style={{fontSize:15,fontWeight:500,color:"var(--ink)",lineHeight:1.5}}>{msg}</div>
      </div>
      <div style={{height:"0.5px",background:"var(--stroke)",margin:"8px 0"}}/>
      <button onClick={onYes} style={{width:"100%",padding:"16px",background:"none",border:"none",color:"#FF453A",fontSize:17,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Supprimer</button>
      <div style={{height:"0.5px",background:"var(--stroke)"}}/>
      <button onClick={onNo} style={{width:"100%",padding:"16px",background:"none",border:"none",color:"var(--indigo)",fontSize:17,fontWeight:400,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
    </div>
  </div>;
}

function Sheet({title,subtitle,children,onClose}){
  return<div style={{position:"fixed",inset:0,zIndex:800,display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={onClose}>
    <div style={{background:"var(--bg)",borderRadius:"20px 20px 0 0",maxHeight:"92dvh",display:"flex",flexDirection:"column",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"center",paddingTop:8,paddingBottom:4}}>
        <div style={{width:36,height:5,borderRadius:3,background:"var(--stroke)"}}/>
      </div>
      <div style={{padding:"4px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:17,fontWeight:600,color:"var(--ink)"}}>{title}</div>
          {subtitle&&<div style={{fontSize:13,color:"var(--inkDim)",marginTop:2}}>{subtitle}</div>}
        </div>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:"var(--cardHi)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--inkDim)",fontSize:16,fontFamily:"inherit"}}>✕</button>
      </div>
      <div style={{overflowY:"auto",padding:"0 16px 40px",flex:1}}>{children}</div>
    </div>
  </div>;
}

function Field({label,children}){
  return<div style={{marginBottom:16}}>
    <div style={{fontSize:13,fontWeight:500,color:"var(--inkDim)",marginBottom:6,paddingLeft:4}}>{label}</div>
    {children}
  </div>;
}

function TInput({style={},value,onChange,placeholder,type="text",min,max}){
  return<input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max}
    style={{width:"100%",background:"var(--cardHi)",border:"0.5px solid var(--stroke)",borderRadius:12,padding:"13px 14px",fontSize:16,color:"var(--ink)",fontFamily:"inherit",outline:"none",boxSizing:"border-box",...style}}/>;
}

function TBtn({children,onClick,full,variant="primary",style={}}){
  const bg=variant==="primary"?"var(--indigo)":variant==="up"?"var(--up)":variant==="down"?"var(--down)":"var(--cardHi)";
  const col=variant==="secondary"?"var(--indigo)":"#fff";
  return<button onClick={onClick} style={{width:full?"100%":"auto",padding:"15px 20px",background:bg,border:"none",borderRadius:14,color:col,fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"opacity 0.15s",letterSpacing:-0.2,...style}}>{children}</button>;
}

function CatPicker({value,onChange,cats}){
  return<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
    {cats.map(c=><button key={c.id} onClick={()=>onChange(c.id)} style={{background:value===c.id?c.color+"22":"var(--cardHi)",border:`1px solid ${value===c.id?c.color+"66":"var(--stroke)"}`,borderRadius:22,padding:"7px 13px",color:value===c.id?c.color:"var(--inkDim)",fontSize:13,cursor:"pointer",fontWeight:value===c.id?600:400,display:"flex",alignItems:"center",gap:5,fontFamily:"inherit"}}>{c.icon} {c.label}</button>)}
  </div>;
}

function AddBtn({color,onClick}){
  return<button onClick={onClick} style={{width:28,height:28,borderRadius:14,background:color+"18",border:"none",color:color,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>+</button>;
}

function DelBtn({onClick}){
  return<button onClick={onClick} style={{width:28,height:28,borderRadius:14,background:"rgba(255,59,48,0.12)",border:"none",color:"#FF453A",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>✕</button>;
}

function SecLabel({label,action}){
  return<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,marginTop:8,padding:"0 4px"}}>
    <div style={{fontSize:13,fontWeight:600,color:"var(--inkDim)",letterSpacing:0.2}}>{label}</div>
    {action}
  </div>;
}

function EmptyNote({children}){
  return<div style={{textAlign:"center",color:"var(--inkFaint)",fontSize:14,padding:"24px 0"}}>{children}</div>;
}

function rowSt(hasBorder){
  return{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:hasBorder?"0.5px solid var(--stroke)":"none"};
}

function navBtnSt(){
  return{background:"var(--cardHi)",border:"0.5px solid var(--stroke)",borderRadius:10,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--inkSub)",fontSize:16,fontFamily:"inherit"};
}

function TxRow({t,allCats,onDel,onEdit}){
  const cat=allCats.find(c=>c.id===t.category)||allCats.find(c=>c.id==="autre");
  return<div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"0.5px solid var(--stroke)"}}>
    <Avatar icon={t.isIncome?"💰":cat?.icon||"📦"} color={t.isIncome?"#32D74B":cat?.color||"#636366"} size={38}/>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:15,fontWeight:500,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
      <div style={{fontSize:12,color:"var(--inkDim)",marginTop:1}}>{t.date}{!t.isIncome&&cat?" · "+cat.label:""}</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
      <span style={{fontSize:15,fontWeight:600,color:t.isIncome?"var(--up)":"var(--ink)"}}>{t.isIncome?"+":""}{chf(t.amount)}</span>
      <button onClick={onEdit} style={{background:"var(--cardHi)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"var(--inkDim)",fontSize:12,fontFamily:"inherit"}}>✏️</button>
      <button onClick={onDel} style={{background:"rgba(255,59,48,0.10)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#FF453A",fontSize:12,fontFamily:"inherit"}}>✕</button>
    </div>
  </div>;
}

function Donut({data,size=140}){
  const total=data.reduce((s,d)=>s+d.value,0);
  if(!total)return<div style={{width:size,height:size,borderRadius:"50%",background:"var(--stroke)",margin:"0 auto"}}/>;
  const cx=size/2,cy=size/2,r=size*0.38,stroke=size*0.12;
  const arcs=data.reduce((acc,d)=>{
    const a=(d.value/total)*Math.PI*2;
    const x1=cx+r*Math.cos(acc.angle),y1=cy+r*Math.sin(acc.angle);
    const end=acc.angle+a;
    const x2=cx+r*Math.cos(end),y2=cy+r*Math.sin(end);
    acc.items.push({...d,d:`M${x1},${y1} A${r},${r} 0 ${a>Math.PI?1:0},1 ${x2},${y2}`,large:a>Math.PI});
    acc.angle=end;
    return acc;
  },{angle:-Math.PI/2,items:[]}).items;
  return<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    {arcs.map((a,i)=><path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={stroke} strokeLinecap="round"/>)}
  </svg>;
}

function Heatmap({txs,month,year}){
  const daysInMonth=new Date(year,month+1,0).getDate();
  const firstDay=new Date(year,month,1).getDay();
  const dayTots=useMemo(()=>{
    const m=new Array(daysInMonth+1).fill(0);
    txs.filter(t=>{const d=new Date(t.date);return!t.isIncome&&d.getMonth()===month&&d.getFullYear()===year;}).forEach(t=>{const day=new Date(t.date).getDate();m[day]+=+t.amount;});
    return m;
  },[txs,month,year,daysInMonth]);
  const maxDay=Math.max(...dayTots,1);
  const cells=[];
  for(let i=0;i<firstDay;i++)cells.push(<div key={`e${i}`}/>);
  for(let d=1;d<=daysInMonth;d++){
    const v=dayTots[d];const pct=v/maxDay;
    const today_=new Date();const isToday=today_.getDate()===d&&today_.getMonth()===month&&today_.getFullYear()===year;
    cells.push(<div key={d} title={v>0?chf(v):""} style={{aspectRatio:"1",borderRadius:6,background:v>0?`rgba(10,132,255,${0.15+pct*0.75})`:"var(--cardHi)",border:isToday?"1.5px solid var(--indigo)":"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:600,color:v>0?"#fff":"var(--inkFaint)"}}>{d}</div>);
  }
  return<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
      {WDAYS.map(w=><div key={w} style={{fontSize:9,color:"var(--inkDim)",textAlign:"center",fontWeight:500}}>{w[0]}</div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells}</div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const now=new Date();
  const[tab,setTab]=useState("home");
  const[month,setMonth]=useState(now.getMonth());
  const[year,setYear]=useState(now.getFullYear());
  const[txs,setTxs]=useState(()=>load(SK.tx,[]));
  const[incomes,setIncomes]=useState(()=>load(SK.inc,[]));
  const[recurring,setRecurring]=useState(()=>load(SK.rec,[]));
  const[customCats,setCustomCats]=useState(()=>load(SK.cats,[]));
  const[learned,setLearned]=useState(()=>load(SK.rules,{}));
  const[themeKey,setThemeKey]=useState(()=>load(SK.theme,"dark"));
  const[sheet,setSheet]=useState(null);
  const[toast,setToast]=useState("");
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(""),2600);return()=>clearTimeout(timer);},[toast]);
  const[confirm,setConfirm]=useState(null);
  const[catDetail,setCatDetail]=useState(null);
  const[merchantDetail,setMerchantDetail]=useState(null);
  const[editTx,setEditTx]=useState(null);
  const[editCat,setEditCat]=useState(null);
  const[impItems,setImpItems]=useState([]);
  const env={top:0,bottom:0};
  const isDark=themeKey==="dark";

  const T=THEMES[themeKey];
  const cssVars={
    "--bg":T.bg,"--card":T.card,"--cardHi":T.cardHi,"--glass":T.glass,
    "--stroke":T.stroke,"--strokeSoft":T.strokeSoft,"--indigo":T.indigo,
    "--violet":T.violet,"--up":T.up,"--down":T.down,"--ink":T.ink,
    "--inkSub":T.inkSub,"--inkDim":T.inkDim,"--inkFaint":T.inkFaint,
    "--indigoLt":T.indigoLt,"--gold":T.gold,
  };

  useEffect(()=>{sv(SK.tx,txs);},[txs]);
  useEffect(()=>{sv(SK.inc,incomes);},[incomes]);
  useEffect(()=>{sv(SK.rec,recurring);},[recurring]);
  useEffect(()=>{sv(SK.cats,customCats);},[customCats]);
  useEffect(()=>{sv(SK.rules,learned);},[learned]);
  useEffect(()=>{sv(SK.theme,themeKey);},[themeKey]);

  const allCats=useMemo(()=>[...BASE_CATS,...customCats],[customCats]);
  const getCat=useCallback(id=>allCats.find(c=>c.id===id)||allCats.find(c=>c.id==="autre"),[allCats]);

  // COMPUTED
  const C=useMemo(()=>{
    const mTx=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===month&&d.getFullYear()===year;});
    const exp=mTx.filter(t=>!t.isIncome);
    const incT=mTx.filter(t=>t.isIncome);
    const totalInc=incomes.reduce((s,i)=>s+(+i.amount||0),0)+incT.reduce((s,t)=>s+(+t.amount||0),0);
    const totalExp=exp.reduce((s,t)=>s+(+t.amount||0),0)+recurring.reduce((s,r)=>s+(+r.amount||0),0);
    const bal=totalInc-totalExp;
    const savePct=totalInc>0?Math.round((bal/totalInc)*100):0;
    const byCat={};
    exp.forEach(t=>{byCat[t.category]=(byCat[t.category]||0)+(+t.amount||0);});
    recurring.forEach(r=>{byCat[r.category]=(byCat[r.category]||0)+(+r.amount||0);});
    const pByCat=Object.fromEntries(Object.entries(byCat).map(([k,v])=>[k,totalExp>0?Math.round(v/totalExp*100):0]));
    const merchMap={};
    exp.forEach(t=>{const k=t.description.trim();merchMap[k]=(merchMap[k]||0)+(+t.amount||0);});
    const topMerch=Object.entries(merchMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const dayTots={};
    exp.forEach(t=>{const d=new Date(t.date).getDate();dayTots[d]=(dayTots[d]||0)+(+t.amount||0);});
    return{mTx,exp,incT,totalInc,totalExp,bal,savePct,byCat,pByCat,topMerch,dayTots};
  },[txs,incomes,recurring,month,year]);

  const annual=useMemo(()=>MONTHS.map((_,m)=>{
    const ms=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===m&&d.getFullYear()===year;});
    const recAmt=recurring.reduce((s,r)=>s+(+r.amount||0),0);
    const spent=ms.filter(t=>!t.isIncome).reduce((s,t)=>s+(+t.amount||0),0)+(ms.length?recAmt:0);
    const earned=incomes.reduce((s,i)=>s+(+i.amount||0),0)+ms.filter(t=>t.isIncome).reduce((s,t)=>s+(+t.amount||0),0);
    return{spent,earned};
  }),[txs,incomes,recurring,year]);

  const sixMonth=useMemo(()=>{
    const res=[];
    for(let i=5;i>=0;i--){
      let m=month-i,y=year;
      if(m<0){m+=12;y--;}
      const ms=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===m&&d.getFullYear()===y;});
      res.push({label:MS[m],spent:ms.filter(t=>!t.isIncome).reduce((s,t)=>s+(+t.amount||0),0)});
    }
    return res;
  },[txs,month,year]);

  // ACTION HANDLERS
  const addTx=useCallback(f=>{
    const tx={id:crypto.randomUUID(),description:f.description.trim(),amount:+f.amount,date:f.date,category:f.isIncome?"":f.category,isIncome:f.isIncome};
    setTxs(p=>[tx,...p]);setToast("✓ Ajouté");
  },[]);
  const delTx=useCallback(id=>{setTxs(p=>p.filter(t=>t.id!==id));setToast("Supprimé");setConfirm(null);},[]);
  const askDel=useCallback(t=>{setConfirm({msg:`Supprimer "${t.description}" ?`,onYes:()=>{delTx(t.id);},onNo:()=>setConfirm(null)});},[delTx]);

  const addInc=useCallback(f=>{setIncomes(p=>[...p,{id:crypto.randomUUID(),label:f.label,amount:+f.amount,day:+f.day}]);setToast("✓ Revenu ajouté");},[]);
  const delInc=useCallback(id=>{setIncomes(p=>p.filter(i=>i.id!==id));},[]);
  const addRec=useCallback(f=>{setRecurring(p=>[...p,{id:crypto.randomUUID(),label:f.label,amount:+f.amount,category:f.category,day:+f.day}]);setToast("✓ Dépense fixe ajoutée");},[]);
  const delRec=useCallback(id=>{setRecurring(p=>p.filter(r=>r.id!==id));},[]);
  const addCustomCat=useCallback(f=>{setCustomCats(p=>[...p,{id:crypto.randomUUID(),...f,kw:[]}]);setToast("✓ Catégorie créée");},[]);
  const updateCustomCat=useCallback((id,patch)=>{setCustomCats(p=>p.map(c=>c.id===id?{...c,...patch}:c));setToast("✓ Modifié");},[]);
  const deleteCustomCat=useCallback(id=>{setCustomCats(p=>p.filter(c=>c.id!==id));setToast("Catégorie supprimée");},[]);

  const handleImport=useCallback(async(e)=>{
    const files=Array.from(e.target.files||[]);
    if(!files.length)return;
    setSheet("import");
    try{
      let all=[];
      for(const f of files){const txt=await f.text();all=[...all,...detectAndParse(txt,allCats)];}
      all=all.map((t,i)=>({...t,_idx:i,_on:true,category:learned[t.description?.trim()]||t.category}));
      const aiDone=await aiCategorize(all);
      setImpItems(aiDone);setSheet("review");
    }catch{setSheet(null);setToast("Erreur import");}
  },[allCats,learned]);

  const doImport=useCallback(items=>{
    const toAdd=items.filter(t=>t._on).map(t=>{
      const copy={...t};delete copy._on;delete copy._idx;return copy;
    });
    setTxs(p=>[...toAdd,...p]);
    setSheet(null);setToast(`✓ ${toAdd.length} transactions importées`);
  },[]);

  const fileRef=useRef();

  // ═══════════════════════════════════════════════════════════════
  //  TAB: HOME
  // ═══════════════════════════════════════════════════════════════
  function Home(){
    const insights=useMemo(()=>{
      const msgs=[];
      if(C.savePct>=20)msgs.push({icon:"🎯",text:`Tu économises ${C.savePct}% ce mois — excellent !`,color:T.up});
      else if(C.savePct<0)msgs.push({icon:"⚠️",text:`Dépenses dépassent les revenus de ${chf(Math.abs(C.bal))}`,color:T.down});
      const topCat=Object.entries(C.byCat).sort((a,b)=>b[1]-a[1])[0];
      if(topCat){const cat=getCat(topCat[0]);msgs.push({icon:cat.icon,text:`${cat.label} : ${chf(topCat[1])} (${C.pByCat[topCat[0]]||0}%)`,color:cat.color});}
      return msgs.slice(0,2);
    },[]);

    return<div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <div style={{fontSize:13,color:T.inkDim,fontWeight:500,marginBottom:2}}>{MONTHS[month]} {year}</div>
          <div style={{fontSize:28,fontWeight:700,color:T.ink,letterSpacing:-0.5}}>Aurora</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>{setMonth(m=>{let nm=m-1,ny=year;if(nm<0){nm=11;ny--;setYear(ny);}return nm;})}} style={navBtnSt()}>‹</button>
          <button onClick={()=>{setMonth(m=>{let nm=m+1,ny=year;if(nm>11){nm=0;ny++;setYear(ny);}return nm;})}} style={navBtnSt()}>›</button>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{background:`linear-gradient(145deg,${T.indigo},${T.violet})`,borderRadius:20,padding:"22px 20px",marginBottom:16,boxShadow:`0 8px 32px ${T.glow}`}}>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",fontWeight:500,marginBottom:6}}>Solde estimé</div>
        <div style={{fontSize:36,fontWeight:700,color:"#fff",letterSpacing:-1,marginBottom:16}}>{chf(C.bal)}</div>
        <div style={{display:"flex",gap:16}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:3}}>REVENUS</div>
            <div style={{fontSize:16,fontWeight:600,color:"rgba(255,255,255,0.95)"}}>+{chf(C.totalInc)}</div>
          </div>
          <div style={{width:"0.5px",background:"rgba(255,255,255,0.2)"}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:3}}>DÉPENSES</div>
            <div style={{fontSize:16,fontWeight:600,color:"rgba(255,255,255,0.95)"}}>{chf(C.totalExp)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <button onClick={()=>setSheet("addTx")} style={{background:T.card,border:`0.5px solid ${T.stroke}`,borderRadius:16,padding:"14px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
          <div style={{fontSize:20,marginBottom:6}}>＋</div>
          <div style={{fontSize:14,fontWeight:600,color:T.ink}}>Ajouter</div>
          <div style={{fontSize:12,color:T.inkDim}}>Transaction</div>
        </button>
        <button onClick={()=>fileRef.current?.click()} style={{background:T.card,border:`0.5px solid ${T.stroke}`,borderRadius:16,padding:"14px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
          <div style={{fontSize:20,marginBottom:6}}>↑</div>
          <div style={{fontSize:14,fontWeight:600,color:T.ink}}>Importer</div>
          <div style={{fontSize:12,color:T.inkDim}}>CSV Yuh / Neon</div>
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".csv,.txt" multiple style={{display:"none"}} onChange={handleImport}/>

      {/* Insights */}
      {insights.length>0&&<div style={{marginBottom:16}}>
        {insights.map((ins,i)=><div key={i} style={{background:T.card,border:`0.5px solid ${T.stroke}`,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>{ins.icon}</span>
          <span style={{fontSize:13,color:T.inkSub,lineHeight:1.4}}>{ins.text}</span>
        </div>)}
      </div>}

      {/* Categories */}
      {Object.keys(C.byCat).length>0&&<>
        <SecLabel label="PAR CATÉGORIE"/>
        <Glass r={16} pad="0" style={{marginBottom:16}}>
          {Object.entries(C.byCat).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([catId,amt],i,arr)=>{
            const cat=getCat(catId);
            return<div key={catId} onClick={()=>{setCatDetail(catId);setSheet("catDetail");}} style={{...rowSt(i<arr.length-1),cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Avatar icon={cat.icon} color={cat.color} size={36}/>
                <div>
                  <div style={{fontSize:15,fontWeight:500,color:T.ink}}>{cat.label}</div>
                  <div style={{fontSize:12,color:T.inkDim}}>{C.pByCat[catId]||0}% des dépenses</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:15,fontWeight:600,color:T.ink}}>{chf(amt)}</div>
                <div style={{marginTop:4}}><Bar v={amt} max={C.totalExp} color={cat.color} h={3}/></div>
              </div>
            </div>;
          })}
        </Glass>
      </>}

      {/* Recent Transactions */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <SecLabel label="RÉCENT"/>
        <button onClick={()=>setSheet("history")} style={{background:"none",border:"none",color:T.indigo,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Tout voir</button>
      </div>
      {C.mTx.length===0?<EmptyNote>Aucune transaction ce mois</EmptyNote>:(
        <Glass r={16} pad="0 16px">{C.mTx.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8).map(t=><TxRow key={t.id} t={t} allCats={allCats} onDel={()=>askDel(t)} onEdit={()=>setEditTx(t)}/>)}</Glass>
      )}
    </div>;
  }

  // ═══════════════════════════════════════════════════════════════
  //  TAB: ANALYSE
  // ═══════════════════════════════════════════════════════════════
  function Analyse(){
    const donutData=useMemo(()=>Object.entries(C.byCat).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([id,value])=>{const cat=getCat(id);return{value,color:cat.color,label:cat.label};}),[]);
    const maxMerch=C.topMerch[0]?.[1]||1;
    return<div>
      <div style={{fontSize:22,fontWeight:700,color:T.ink,letterSpacing:-0.4,marginBottom:20}}>{MONTHS[month]} {year}</div>

      {/* Donut */}
      {donutData.length>0&&<Glass r={18} pad="20px" style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:600,color:T.inkDim,letterSpacing:0.2,marginBottom:16}}>RÉPARTITION</div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{position:"relative",flexShrink:0}}>
            <Donut data={donutData} size={120}/>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:11,color:T.inkDim}}>Total</div>
              <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{chfK(C.totalExp)}</div>
            </div>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
            {donutData.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:d.color,flexShrink:0}}/>
              <div style={{fontSize:12,color:T.inkSub,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.ink,flexShrink:0}}>{C.totalExp>0?Math.round(d.value/C.totalExp*100):0}%</div>
            </div>)}
          </div>
        </div>
      </Glass>}

      {/* 6-month trend */}
      <Glass r={18} pad="20px" style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:600,color:T.inkDim,letterSpacing:0.2,marginBottom:16}}>TENDANCE 6 MOIS</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
          {sixMonth.map((d,i)=>{
            const maxS=Math.max(...sixMonth.map(x=>x.spent),1);
            const isCurrent=i===5;
            return<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontSize:8,color:isCurrent?T.indigoLt:T.inkFaint,fontWeight:isCurrent?700:400}}>{d.spent>0?chfK(d.spent):""}</div>
              <div style={{width:"100%",background:isCurrent?T.indigo:T.cardHi,borderRadius:"6px 6px 0 0",height:`${Math.max(d.spent/maxS*64,3)}px`,transition:"height 0.5s cubic-bezier(0.4,0,0.2,1)"}}/>
              <div style={{fontSize:9,color:isCurrent?T.indigoLt:T.inkDim,fontWeight:isCurrent?700:400}}>{d.label}</div>
            </div>;
          })}
        </div>
      </Glass>

      {/* Heatmap */}
      <Glass r={18} pad="20px" style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:600,color:T.inkDim,letterSpacing:0.2,marginBottom:14}}>JOURS DE DÉPENSES</div>
        <Heatmap txs={txs} month={month} year={year} T={T}/>
      </Glass>

      {/* Top merchants */}
      {C.topMerch.length>0&&<Glass r={18} pad="20px" style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:600,color:T.inkDim,letterSpacing:0.2,marginBottom:16}}>OÙ PART TON ARGENT</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {C.topMerch.map(([name,amt],i)=><div key={i} onClick={()=>{setMerchantDetail(name);setSheet("merchant");}} style={{cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,fontWeight:700,color:T.inkFaint,width:16}}>{i+1}</span>
                <span style={{fontSize:14,fontWeight:500,color:T.ink}}>{name}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:14,fontWeight:600,color:T.ink}}>{chf(amt)}</span>
                <span style={{fontSize:12,color:T.inkDim}}>›</span>
              </div>
            </div>
            <Bar v={amt} max={maxMerch} color={T.indigo} h={3}/>
          </div>)}
        </div>
      </Glass>}
    </div>;
  }

  // ═══════════════════════════════════════════════════════════════
  //  TAB: ANNÉE
  // ═══════════════════════════════════════════════════════════════
  function Annee(){
    const maxSp=Math.max(...annual.map(d=>d.spent),1);
    const totalY=annual.reduce((s,d)=>s+d.spent,0);
    const incY=annual.reduce((s,d)=>s+d.earned,0);
    const sav=incY-totalY;
    return<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:700,color:T.ink,letterSpacing:-0.4}}>Année {year}</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setYear(y=>y-1)} style={navBtnSt()}>‹</button>
          <button onClick={()=>setYear(y=>y+1)} style={navBtnSt()}>›</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{l:"Revenus",v:chf(incY),c:T.up},{l:"Dépenses",v:chf(totalY),c:T.down},{l:"Économies",v:chf(sav),c:sav>=0?T.up:T.down},{l:"Moy./mois",v:`CHF ${chfK(totalY/12)}`,c:T.indigoLt}].map(({l,v,c})=>(
          <Glass key={l} r={16} pad="16px">
            <div style={{fontSize:11,color:T.inkDim,fontWeight:600,letterSpacing:0.2,marginBottom:8}}>{l.toUpperCase()}</div>
            <div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div>
          </Glass>
        ))}
      </div>
      <Glass r={18} pad="20px" style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:600,color:T.inkDim,letterSpacing:0.2,marginBottom:14}}>DÉPENSES PAR MOIS</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:100}}>
          {annual.map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}} onClick={()=>{setMonth(i);setTab("home");}}>
              <div style={{fontSize:7,color:d.spent>0?T.inkDim:"transparent",fontWeight:600}}>{d.spent>0?chfK(d.spent):""}</div>
              <div style={{width:"100%",background:i===month?T.indigo:T.cardHi,borderRadius:"5px 5px 0 0",height:`${Math.max(d.spent/maxSp*78,2)}px`,transition:"height 0.5s cubic-bezier(0.4,0,0.2,1)"}}/>
              <div style={{fontSize:8,color:i===month?T.indigoLt:T.inkDim,fontWeight:i===month?700:400}}>{MS[i][0]}</div>
            </div>
          ))}
        </div>
      </Glass>
      <Glass r={18} pad="0" style={{overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 16px",borderBottom:`0.5px solid ${T.stroke}`}}>
          {["Mois","Dépenses","Solde"].map(h=><div key={h} style={{fontSize:12,fontWeight:600,color:T.inkDim}}>{h}</div>)}
        </div>
        {annual.map((d,i)=>{const sol=d.earned-d.spent,has=d.spent>0||d.earned>0;return(
          <div key={i} onClick={()=>{setMonth(i);setTab("home");}} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"13px 16px",borderBottom:i<11?`0.5px solid ${T.stroke}`:"none",cursor:"pointer",background:i===month?T.indigo+"12":"transparent"}}>
            <div style={{fontWeight:i===month?700:400,color:i===month?T.indigoLt:T.ink,fontSize:14}}>{MS[i]}</div>
            <div style={{color:d.spent>0?T.down:T.inkDim,fontWeight:600,fontSize:14}}>{d.spent>0?chf(d.spent):"—"}</div>
            <div style={{color:has?(sol>=0?T.up:T.down):T.inkDim,fontWeight:700,fontSize:14}}>{has?chf(Math.abs(sol)):"—"}</div>
          </div>
        );})}
      </Glass>
    </div>;
  }

  // ═══════════════════════════════════════════════════════════════
  //  TAB: RÉGLAGES
  // ═══════════════════════════════════════════════════════════════
  function Reglages(){
    const allExp=txs.filter(t=>!t.isIncome).length;
    const allInc=txs.filter(t=>t.isIncome).length;
    return<div>
      <div style={{fontSize:22,fontWeight:700,color:T.ink,letterSpacing:-0.4,marginBottom:20}}>Réglages</div>

      {/* Stats */}
      <div style={{display:"flex",gap:10,marginBottom:24}}>
        {[{l:"TOTAL",v:txs.length,c:T.ink},{l:"DÉPENSES",v:allExp,c:T.down},{l:"REVENUS",v:allInc,c:T.up}].map(({l,v,c})=>(
          <Glass key={l} r={16} pad="14px" style={{flex:1}}>
            <div style={{fontSize:10,color:T.inkDim,fontWeight:600,letterSpacing:0.3,marginBottom:6}}>{l}</div>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
          </Glass>
        ))}
      </div>

      {/* Apparence */}
      <SecLabel label="APPARENCE"/>
      <Glass r={16} pad="0" style={{overflow:"hidden",marginBottom:24}}>
        <div onClick={()=>setThemeKey(k=>k==="dark"?"light":"dark")} style={{...rowSt(false),cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <Avatar icon={themeKey==="dark"?"🌙":"☀️"} color={T.indigoLt} size={36}/>
            <div>
              <div style={{fontWeight:500,fontSize:15,color:T.ink}}>Thème</div>
              <div style={{fontSize:12,color:T.inkDim}}>{themeKey==="dark"?"Mode sombre":"Mode clair"}</div>
            </div>
          </div>
          <div style={{background:themeKey==="dark"?T.indigo:"rgba(120,120,128,0.2)",borderRadius:30,width:51,height:31,position:"relative",transition:"background 0.3s cubic-bezier(0.4,0,0.2,1)"}}>
            <div style={{position:"absolute",top:3,left:themeKey==="dark"?22:2,width:25,height:25,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.3)",transition:"left 0.28s cubic-bezier(0.4,0,0.2,1)"}}/>
          </div>
        </div>
      </Glass>

      {/* Revenus récurrents */}
      <SecLabel label="REVENUS RÉCURRENTS" action={<AddBtn color={T.up} onClick={()=>setSheet("addInc")}/>}/>
      {incomes.length===0?<EmptyNote>Aucun revenu configuré</EmptyNote>:(
        <Glass r={16} pad="0" style={{overflow:"hidden",marginBottom:24}}>
          {incomes.map((inc,i)=>(
            <div key={inc.id} style={rowSt(i<incomes.length-1)}>
              <div><div style={{fontWeight:500,fontSize:15,color:T.ink}}>{inc.label}</div><div style={{fontSize:12,color:T.inkDim}}>Versé le {inc.day}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}><Pill color={T.up}>{chf(inc.amount)}</Pill><DelBtn onClick={()=>delInc(inc.id)}/></div>
            </div>
          ))}
        </Glass>
      )}
    </div>;
  }

  // Réglages suite (dépenses fixes, catégories, règles, données) — injectées dans Reglages via render
  function ReglagesSuite(){
    return<>
      {/* Dépenses fixes */}
      <SecLabel label="DÉPENSES FIXES" action={<AddBtn color={T.down} onClick={()=>setSheet("addRec")}/>}/>
      {recurring.length===0?<EmptyNote>Aucune dépense fixe</EmptyNote>:(
        <Glass r={16} pad="0" style={{overflow:"hidden",marginBottom:24}}>
          {recurring.map((r,i)=>{const cat=getCat(r.category);return(
            <div key={r.id} style={rowSt(i<recurring.length-1)}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Avatar icon={cat.icon} color={cat.color} size={36}/>
                <div><div style={{fontWeight:500,fontSize:15,color:T.ink}}>{r.label}</div><div style={{fontSize:12,color:T.inkDim}}>Le {r.day} · {cat.label}</div></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}><Pill color={T.down}>{chf(r.amount)}</Pill><DelBtn onClick={()=>delRec(r.id)}/></div>
            </div>
          );})}
        </Glass>
      )}

      {/* Catégories */}
      <SecLabel label="MES CATÉGORIES" action={<AddBtn color={T.indigoLt} onClick={()=>setEditCat("new")}/>}/>
      <Glass r={16} pad="0" style={{overflow:"hidden",marginBottom:24}}>
        {BASE_CATS.filter(c=>c.id!=="autre"&&c.id!=="twint").map(cat=>(
          <div key={cat.id} style={rowSt(true)}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar icon={cat.icon} color={cat.color} size={36}/>
              <span style={{fontSize:15,color:T.ink,fontWeight:400}}>{cat.label}</span>
            </div>
            <span style={{fontSize:11,color:T.inkFaint}}>Intégrée</span>
          </div>
        ))}
        {customCats.map(cat=>(
          <div key={cat.id} style={rowSt(true)}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar icon={cat.icon} color={cat.color} size={36}/>
              <span style={{fontSize:15,color:T.ink,fontWeight:400}}>{cat.label}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>setEditCat(cat.id)} style={{background:T.cardHi,border:`0.5px solid ${T.stroke}`,borderRadius:8,padding:"5px 10px",color:T.inkSub,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
              <DelBtn onClick={()=>deleteCustomCat(cat.id)}/>
            </div>
          </div>
        ))}
        {customCats.length===0&&<EmptyNote>Appuie sur + pour créer une catégorie</EmptyNote>}
      </Glass>
    </>;
  }

  // ═══════════════════════════════════════════════════════════════
  //  SHEETS
  // ═══════════════════════════════════════════════════════════════
  function AddTxSheet(){
    const[f,setF]=useState({description:"",amount:"",category:"alimentation",date:today(),isIncome:false});
    return<Sheet title={f.isIncome?"Nouveau revenu":"Nouvelle dépense"} onClose={()=>setSheet(null)}>
      <div style={{display:"flex",gap:4,marginBottom:20,background:T.cardHi,borderRadius:14,padding:3}}>
        {[{k:false,l:"Dépense"},{k:true,l:"Revenu"}].map(({k,l})=>(
          <button key={String(k)} onClick={()=>setF(p=>({...p,isIncome:k}))} style={{flex:1,background:f.isIncome===k?(k?T.up:T.indigo):"transparent",border:"none",borderRadius:11,padding:"11px",color:f.isIncome===k?"#fff":T.inkDim,fontWeight:600,fontSize:14,cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}>{l}</button>
        ))}
      </div>
      <Field label="Description"><TInput placeholder="Ex: Migros, Salaire…" value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))}/></Field>
      <Field label="Montant (CHF)"><TInput type="number" placeholder="0.00" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))}/></Field>
      {!f.isIncome&&<Field label="Catégorie"><CatPicker value={f.category} onChange={v=>setF(p=>({...p,category:v}))} cats={allCats}/></Field>}
      <Field label="Date"><TInput type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))}/></Field>
      <TBtn full variant={f.isIncome?"up":"primary"} onClick={()=>{if(!f.description||!f.amount)return;addTx(f);setSheet(null);}}>Ajouter</TBtn>
    </Sheet>;
  }

  function AddIncSheet(){
    const[f,setF]=useState({label:"",amount:"",day:25});
    return<Sheet title="Revenu récurrent" subtitle="Compté automatiquement chaque mois" onClose={()=>setSheet(null)}>
      <Field label="Label"><TInput placeholder="Ex: Salaire HouseTrap" value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))}/></Field>
      <Field label="Montant net (CHF)"><TInput type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))}/></Field>
      <Field label="Jour de versement"><TInput type="number" min={1} max={31} value={f.day} onChange={e=>setF(p=>({...p,day:e.target.value}))}/></Field>
      <TBtn full variant="up" onClick={()=>{if(!f.label||!f.amount)return;addInc(f);setSheet(null);}}>Enregistrer</TBtn>
    </Sheet>;
  }

  function AddRecSheet(){
    const[f,setF]=useState({label:"",amount:"",category:"logement",day:1});
    return<Sheet title="Dépense fixe" subtitle="Loyer, abonnements…" onClose={()=>setSheet(null)}>
      <Field label="Label"><TInput placeholder="Ex: Loyer, Spotify…" value={f.label} onChange={e=>setF(p=>({...p,label:e.target.value}))}/></Field>
      <Field label="Montant (CHF)"><TInput type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))}/></Field>
      <Field label="Catégorie"><CatPicker value={f.category} onChange={v=>setF(p=>({...p,category:v}))} cats={allCats}/></Field>
      <Field label="Jour de prélèvement"><TInput type="number" min={1} max={31} value={f.day} onChange={e=>setF(p=>({...p,day:e.target.value}))}/></Field>
      <TBtn full variant="down" onClick={()=>{if(!f.label||!f.amount)return;addRec(f);setSheet(null);}}>Ajouter</TBtn>
    </Sheet>;
  }

  function ImportLoadSheet(){
    return<Sheet title="Analyse en cours…" onClose={()=>{}}>
      <div style={{textAlign:"center",padding:"48px 0"}}>
        <div style={{fontSize:52,marginBottom:16}}>🤖</div>
        <div style={{fontSize:17,fontWeight:600,color:T.ink,marginBottom:8}}>Catégorisation intelligente</div>
        <div style={{fontSize:14,color:T.inkDim,marginBottom:32}}>Analyse des transactions…</div>
        <div style={{display:"flex",justifyContent:"center",gap:8}}>
          {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.indigo,animation:`pulse 1.2s ${i*.25}s infinite`}}/>)}
        </div>
      </div>
    </Sheet>;
  }

  function ReviewSheet(){
    const[items,setItems]=useState(impItems);
    const inc=items.filter(t=>t.isIncome),exp=items.filter(t=>!t.isIncome),on=items.filter(t=>t._on);
    const tog=idx=>setItems(p=>p.map(t=>t._idx===idx?{...t,_on:!t._on}:t));
    const setCat=(idx,cat)=>setItems(p=>p.map(t=>t._idx===idx?{...t,category:cat}:t));
    return<Sheet title="Vérifier l'import" subtitle={`${on.length}/${items.length} sélectionnées`} onClose={()=>setSheet(null)}>
      {inc.length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:600,color:T.up,letterSpacing:0.3,marginBottom:10}}>REVENUS ({inc.length})</div>
        {inc.map(t=><div key={t._idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.cardHi,border:`0.5px solid ${t._on?T.up+"55":T.stroke}`,borderRadius:14,padding:"12px 14px",marginBottom:8,opacity:t._on?1:.45}}>
          <div style={{minWidth:0,flex:1,marginRight:10}}>
            <div style={{fontWeight:500,fontSize:14,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
            <div style={{fontSize:11,color:T.inkDim}}>{t.date}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontWeight:700,color:T.up}}>{chf(t.amount)}</span>
            <input type="checkbox" checked={t._on} onChange={()=>tog(t._idx)} style={{width:18,height:18}}/>
          </div>
        </div>)}
      </div>}
      <div style={{fontSize:12,fontWeight:600,color:T.down,letterSpacing:0.3,marginBottom:10}}>DÉPENSES ({exp.length})</div>
      {exp.map(t=>{const cat=getCat(t.category);return<div key={t._idx} style={{background:T.cardHi,border:`0.5px solid ${t._on?cat.color+"55":T.stroke}`,borderRadius:14,padding:"12px 14px",marginBottom:8,opacity:t._on?1:.45}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:t._on?10:0}}>
          <div style={{minWidth:0,flex:1,marginRight:10}}>
            <div style={{fontWeight:500,fontSize:14,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
            <div style={{fontSize:11,color:T.inkDim}}>{t.date}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontWeight:700,color:T.down}}>{chf(t.amount)}</span>
            <input type="checkbox" checked={t._on} onChange={()=>tog(t._idx)} style={{width:18,height:18}}/>
          </div>
        </div>
        {t._on&&<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{allCats.map(c=><button key={c.id} onClick={()=>setCat(t._idx,c.id)} style={{background:t.category===c.id?c.color+"20":T.card,border:`0.5px solid ${t.category===c.id?c.color:T.stroke}`,borderRadius:20,padding:"4px 10px",color:t.category===c.id?c.color:T.inkDim,fontSize:11,cursor:"pointer",fontWeight:t.category===c.id?600:400,fontFamily:"inherit"}}>{c.icon} {c.label}</button>)}</div>}
      </div>;})}
      <div style={{position:"sticky",bottom:0,background:T.bg,paddingTop:12,marginTop:8}}>
        <TBtn full variant="up" onClick={()=>doImport(items)}>Importer {on.length} transaction{on.length>1?"s":""}</TBtn>
      </div>
    </Sheet>;
  }

  function CatDetailSheet(){
    const cat=getCat(catDetail);
    const list=C.exp.filter(t=>t.category===catDetail).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const total=list.reduce((s,t)=>s+(+t.amount),0);
    return<Sheet title={cat.label} subtitle={`${MONTHS[month]} ${year}`} onClose={()=>setSheet(null)}>
      <Glass r={14} pad="14px 16px" style={{marginBottom:16}}>
        <div style={{fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4}}>TOTAL</div>
        <div style={{fontSize:22,fontWeight:700,color:cat.color}}>{chf(total)}</div>
      </Glass>
      {list.length===0&&<EmptyNote>Aucune dépense ce mois</EmptyNote>}
      <Glass pad="0 16px" r={16}>{list.map(t=><TxRow key={t.id} t={t} allCats={allCats} onDel={()=>askDel(t)} onEdit={()=>setEditTx(t)}/>)}</Glass>
    </Sheet>;
  }

  function MerchantSheet(){
    const list=C.exp.filter(t=>t.description.trim()===merchantDetail).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const total=list.reduce((s,t)=>s+(+t.amount),0);
    const allTime=txs.filter(t=>!t.isIncome&&t.description.trim()===merchantDetail);
    const allTotal=allTime.reduce((s,t)=>s+(+t.amount),0);
    const avg=allTime.length?allTotal/allTime.length:0;
    const cat=list.length?getCat(list[0].category):getCat("autre");
    return<Sheet title={merchantDetail} subtitle={`${MONTHS[month]} ${year}`} onClose={()=>setSheet(null)}>
      <div style={{display:"flex",gap:10,marginBottom:10}}>
        <Glass r={14} pad="14px 16px" style={{flex:1}}><div style={{fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4}}>CE MOIS</div><div style={{fontSize:18,fontWeight:700,color:cat.color}}>{chf(total)}</div></Glass>
        <Glass r={14} pad="14px 16px" style={{flex:1}}><div style={{fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4}}>VISITES</div><div style={{fontSize:18,fontWeight:700,color:T.ink}}>{list.length}</div></Glass>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <Glass r={14} pad="14px 16px" style={{flex:1}}><div style={{fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4}}>TOTAL (TOUT)</div><div style={{fontSize:16,fontWeight:700,color:T.inkSub}}>{chf(allTotal)}</div></Glass>
        <Glass r={14} pad="14px 16px" style={{flex:1}}><div style={{fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:4}}>MOY./VISITE</div><div style={{fontSize:16,fontWeight:700,color:T.inkSub}}>{chf(avg)}</div></Glass>
      </div>
      {list.length===0&&<EmptyNote>Aucune dépense ce mois</EmptyNote>}
      <Glass pad="0 16px" r={16}>{list.map(t=><TxRow key={t.id} t={t} allCats={allCats} onDel={()=>askDel(t)} onEdit={()=>setEditTx(t)}/>)}</Glass>
    </Sheet>;
  }

  function IncDetailSheet(){
    return<Sheet title="Revenus" subtitle={`${MONTHS[month]} ${year}`} onClose={()=>setSheet(null)}>
      {incomes.length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:600,color:T.inkDim,letterSpacing:0.3,marginBottom:10}}>FIXES CONFIGURÉS</div>
        <Glass pad="0 16px" r={16}>
          {incomes.map(inc=><div key={inc.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`0.5px solid ${T.stroke}`}}>
            <div><div style={{fontWeight:500,fontSize:15,color:T.ink}}>{inc.label}</div><div style={{fontSize:12,color:T.inkDim}}>Versé le {inc.day}</div></div>
            <span style={{fontWeight:700,color:T.up}}>{chf(inc.amount)}</span>
          </div>)}
        </Glass>
      </div>}
      {C.incT.length>0&&<div>
        <div style={{fontSize:12,fontWeight:600,color:T.inkDim,letterSpacing:0.3,marginBottom:10}}>ENTRÉES IMPORTÉES</div>
        <Glass pad="0 16px" r={16}>
          {C.incT.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t=><div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`0.5px solid ${T.stroke}`}}>
            <div style={{minWidth:0,flex:1,marginRight:10}}><div style={{fontWeight:500,fontSize:15,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div><div style={{fontSize:12,color:T.inkDim}}>{t.date}</div></div>
            <span style={{fontWeight:700,color:T.up,flexShrink:0}}>+{chf(t.amount)}</span>
          </div>)}
        </Glass>
      </div>}
      {C.incT.length===0&&incomes.length===0&&<EmptyNote>Aucun revenu ce mois</EmptyNote>}
      <Glass pad="13px 16px" r={14} style={{marginTop:14,display:"flex",justifyContent:"space-between"}}>
        <span style={{color:T.inkSub,fontWeight:500}}>Total</span>
        <span style={{fontWeight:700,color:T.up,fontSize:16}}>{chf(C.totalInc)}</span>
      </Glass>
    </Sheet>;
  }

  function HistorySheet(){
    const all=[...txs].sort((a,b)=>new Date(b.date)-new Date(a.date));
    const [q,setQ]=useState("");
    const filtered=q.trim()?all.filter(t=>t.description.toLowerCase().includes(q.toLowerCase())):all;
    return<Sheet title="Historique" onClose={()=>setSheet(null)}>
      <div style={{position:"relative",marginBottom:12}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher…"
          style={{width:"100%",boxSizing:"border-box",background:T.glass,border:`0.5px solid ${T.stroke}`,borderRadius:12,padding:"10px 14px",fontSize:15,color:T.ink,outline:"none",WebkitAppearance:"none"}}/>
      </div>
      {filtered.length===0&&<EmptyNote>Aucune transaction</EmptyNote>}
      <Glass pad="0 16px" r={16}>
        {filtered.slice(0,200).map((t,i)=><TxRow key={t.id} t={t} allCats={allCats} hasBorder={i<filtered.length-1} onDel={()=>askDel(t)} onEdit={()=>setEditTx(t)}/>)}
      </Glass>
      {filtered.length>200&&<div style={{textAlign:"center",color:T.inkDim,fontSize:13,marginTop:10}}>+{filtered.length-200} autres</div>}
    </Sheet>;
  }

  function EditTxSheet(){
    const t=editTx;
    const [desc,setDesc]=useState(t.description);
    const [amt,setAmt]=useState(String(Math.abs(t.amount)));
    const [cat,setCat]=useState(t.category||"autre");
    const [dt,setDt]=useState(t.date);
    const [pickCat,setPickCat]=useState(false);
    function save(){
      const a=parseFloat(amt.replace(",","."));
      if(!desc.trim()||isNaN(a)||a<=0){setToast("Champs invalides");return;}
      const updated={...t,description:desc.trim(),amount:t.isIncome?a:-a,category:cat,date:dt};
      setTxs(prev=>prev.map(x=>x.id===t.id?updated:x));
      setToast("Transaction modifiée");setEditTx(null);
    }
    return<Sheet title="Modifier" onClose={()=>setEditTx(null)}>
      {pickCat?<CatPicker cats={allCats} value={cat} onChange={v=>{setCat(v);setPickCat(false);}}/>:<>
        <Glass pad="0 16px" r={16} style={{marginBottom:12}}>
          <Field label="Description"><TInput value={desc} onChange={e=>setDesc(e.target.value)}/></Field>
          <Field label="Montant (CHF)"><TInput value={amt} onChange={e=>setAmt(e.target.value)} type="number"/></Field>
          <Field label="Date"><TInput value={dt} onChange={e=>setDt(e.target.value)} type="date"/></Field>
          {!t.isIncome&&<Field label="Catégorie">
            <div onPointerDown={()=>setPickCat(true)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:4,paddingBottom:4}}>
              <span style={{color:getCat(cat).color,fontWeight:500}}>{getCat(cat).label}</span>
              <span style={{color:T.inkDim,fontSize:12}}>▶</span>
            </div>
          </Field>}
        </Glass>
        <TBtn full onClick={save}>Enregistrer</TBtn>
        <TBtn full variant="secondary" onClick={()=>setEditTx(null)} style={{marginTop:8}}>Annuler</TBtn>
      </>}
    </Sheet>;
  }

  function EditCatSheet(){
    const c=editCat==="new"?null:customCats.find(cat=>cat.id===editCat);
    const COLORS=["#FF453A","#FF9F0A","#FFD60A","#32D74B","#0A84FF","#5E5CE6","#BF5AF2","#FF375F","#00C7BE","#AC8E68"];
    const [label,setLabel]=useState(c?.label||"");
    const [color,setColor]=useState(c?.color||COLORS[0]);
    const [budget,setBudget]=useState(c?.budget?String(c.budget):"");
    function save(){
      if(!label.trim()){setToast("Nom requis");return;}
      const b=budget?parseFloat(budget.replace(",",".")):null;
      if(c)updateCustomCat(c.id,{label:label.trim(),color,budget:b||null});
      else addCustomCat({label:label.trim(),icon:"📦",color,budget:b||null});
      setEditCat(null);
    }
    return<Sheet title={c?"Modifier catégorie":"Nouvelle catégorie"} onClose={()=>setEditCat(null)}>
      <Glass pad="0 16px" r={16} style={{marginBottom:12}}>
        <Field label="Nom"><TInput value={label} onChange={e=>setLabel(e.target.value)}/></Field>
        <Field label="Budget mensuel (opt.)"><TInput value={budget} onChange={e=>setBudget(e.target.value)} type="number"/></Field>
      </Glass>
      <Glass pad="14px 16px" r={16} style={{marginBottom:12}}>
        <div style={{fontSize:11,color:T.inkDim,fontWeight:600,marginBottom:10}}>COULEUR</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {COLORS.map(col=><div key={col} onPointerDown={()=>setColor(col)} style={{width:30,height:30,borderRadius:15,background:col,border:color===col?`2px solid ${T.ink}`:"2px solid transparent",cursor:"pointer"}}/>)}
        </div>
      </Glass>
      <TBtn full onClick={save}>Enregistrer</TBtn>
      <TBtn full variant="secondary" onClick={()=>setEditCat(null)} style={{marginTop:8}}>Annuler</TBtn>
    </Sheet>;
  }

  // ── RÉGLAGES: règles et données ─────────────────────────────
  function ReglagesRules(){
    const rules=Object.entries(learned);
    return<div>
      <SecLabel label="RÈGLES APPRISES"/>
      {rules.length===0&&<EmptyNote>Aucune règle configurée</EmptyNote>}
      {rules.length>0&&<Glass pad="0 16px" r={16} style={{marginBottom:16}}>
        {rules.map(([pattern,category],i)=><div key={pattern} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<rules.length-1?`0.5px solid ${T.stroke}`:"none"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:500,fontSize:14,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pattern}</div>
            <div style={{fontSize:12,color:getCat(category).color,marginTop:2}}>{getCat(category).label}</div>
          </div>
          <DelBtn onClick={()=>setLearned(prev=>{const next={...prev};delete next[pattern];return next;})}/>
        </div>)}
      </Glass>}
    </div>;
  }

  function ReglagesDanger(){
    return<div>
      <SecLabel>DONNÉES</SecLabel>
      <Glass pad="0 16px" r={16} style={{marginBottom:32}}>
        <div style={{padding:"14px 0",borderBottom:`0.5px solid ${T.stroke}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontWeight:500,fontSize:15,color:T.ink}}>Réinitialiser</div><div style={{fontSize:12,color:T.inkDim}}>Supprimer toutes les données</div></div>
            <button onPointerDown={()=>setConfirm({msg:"Supprimer TOUTES les données ? Cette action est irréversible.",onYes:()=>{Object.values(SK).forEach(k=>localStorage.removeItem(k));window.location.reload();},onNo:()=>setConfirm(null)})}
              style={{background:T.down,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              Effacer
            </button>
          </div>
        </div>
        <div style={{padding:"14px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontWeight:500,fontSize:15,color:T.ink}}>Supprimer transactions</div><div style={{fontSize:12,color:T.inkDim}}>Garder config et catégories</div></div>
            <button onPointerDown={()=>setConfirm({msg:"Supprimer toutes les transactions importées ?",onYes:()=>{setTxs([]);setConfirm(null);setToast("Transactions supprimées");},onNo:()=>setConfirm(null)})}
              style={{background:"transparent",color:T.down,border:`0.5px solid ${T.down}`,borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              Effacer
            </button>
          </div>
        </div>
      </Glass>
    </div>;
  }

  // ── MAIN RETURN ──────────────────────────────────────────────

  const TAB_H=72;
  const tabs=[
    {id:"home",label:"Aurora",icon:"◆"},
    {id:"analyse",label:"Analyse",icon:"◉"},
    {id:"annual",label:"Année",icon:"▦"},
    {id:"settings",label:"Réglages",icon:"⚙"},
  ];

  return(
    <div style={{...cssVars,minHeight:"100dvh",background:T.bg,fontFamily:"-apple-system,'SF Pro Display',system-ui,sans-serif",WebkitFontSmoothing:"antialiased",color:T.ink,overscrollBehavior:"none"}}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        body{margin:0;overscroll-behavior:none;background:${T.bg};}
        input,button{font-family:inherit;}
        input[type=date]::-webkit-calendar-picker-indicator{opacity:0.4;filter:invert(${isDark?"1":"0"});}
        ::-webkit-scrollbar{display:none;}
        @keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
      `}</style>

      {/* Page content */}
      <div style={{paddingBottom:TAB_H+env.bottom,minHeight:"100dvh"}}>
        {tab==="home"&&<Home/>}
        {tab==="analyse"&&<Analyse/>}
        {tab==="annual"&&<Annee/>}
        {tab==="settings"&&<div style={{padding:"0 16px 24px"}}>
          <div style={{paddingTop:env.top+20,paddingBottom:8}}>
            <h1 style={{margin:0,fontSize:28,fontWeight:700,letterSpacing:-0.4}}>Réglages</h1>
          </div>
          <Reglages/>
          <ReglagesSuite/>
          <ReglagesRules/>
          <ReglagesDanger/>
        </div>}
      </div>

      {/* Tab bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,height:TAB_H+env.bottom,background:T.glass,backdropFilter:"blur(30px) saturate(180%)",WebkitBackdropFilter:"blur(30px) saturate(180%)",borderTop:`0.5px solid ${T.stroke}`,display:"flex",alignItems:"flex-start",paddingTop:8,paddingBottom:env.bottom,zIndex:100}}>
        {tabs.map(({id,label,icon})=>{
          const active=tab===id;
          return<button key={id} onPointerDown={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"2px 0",color:active?T.indigo:T.inkDim}}>
            <span style={{fontSize:20,transition:"transform 0.15s",transform:active?"scale(1.1)":"scale(1)"}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:active?600:400,letterSpacing:0.1}}>{label}</span>
          </button>;
        })}
      </div>

      {/* Sheets */}
      {sheet==="addTx"&&<AddTxSheet/>}
      {sheet==="addInc"&&<AddIncSheet/>}
      {sheet==="addRec"&&<AddRecSheet/>}
      {sheet==="import"&&<ImportLoadSheet/>}
      {sheet==="review"&&<ReviewSheet/>}
      {sheet==="catDetail"&&catDetail&&<CatDetailSheet/>}
      {sheet==="merchant"&&merchantDetail&&<MerchantSheet/>}
      {sheet==="incDetail"&&<IncDetailSheet/>}
      {sheet==="history"&&<HistorySheet/>}
      {editTx&&<EditTxSheet/>}
      {editCat&&<EditCatSheet/>}

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",bottom:TAB_H+env.bottom+16,left:"50%",transform:"translateX(-50%)",background:T.indigo,color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:14,fontWeight:500,whiteSpace:"nowrap",zIndex:9999,animation:"toastIn 0.3s ease",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
          {toast}
        </div>
      )}

      {confirm&&<Confirm msg={confirm.msg} onYes={confirm.onYes} onNo={confirm.onNo}/>}
    </div>
  );
}
