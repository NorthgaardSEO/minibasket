/* ============ MINI BASKET — Supabase-backed app ============ */
const SUPABASE_URL = "https://bemngqxfwunfihvfgkrt.supabase.co";
const SUPABASE_KEY = "sb_publishable_mK-BfAEcmVyuEeAQhswPgQ_31-DldiK";
const MOBILEPAY_BOX = "8447ZA";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m){ const t=$("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),1800); }
function vibrate(x){ if(navigator.vibrate) try{navigator.vibrate(x);}catch(e){} }

const ONCOURT = [3,4,5], PERIODS = [4,5,6], LENGTHS = [4,5,6,8,10];

let me = null;               // {id,email,name,role}
let teams = [], players = [], sessions = [], rot = {}; // rot[playerId] = {period: 'D'|'S'}
let curTeam = null, curSession = null, view = "kamp";
let timer = { remaining:0, running:false, iv:null, lenMin:5, period:0 };
let poll = null;
let lastWrite = 0; // guards polling from clobbering in-progress local edits

/* ---------------- AUTH ---------------- */
let authMode = "login";
function setAuthMode(m){
  authMode = m;
  document.querySelectorAll(".auth-tab").forEach(b=>b.classList.toggle("active", b.dataset.mode===m));
  $("au-name").style.display = m==="signup" ? "block" : "none";
  $("au-pass").setAttribute("autocomplete", m==="signup"?"new-password":"current-password");
  $("au-submit").textContent = m==="signup" ? "Opret konto" : "Log ind";
  $("auth-msg").textContent = "";
}
document.querySelectorAll(".auth-tab").forEach(b=> b.onclick=()=>setAuthMode(b.dataset.mode));

$("auth-form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const email=$("au-email").value.trim(), pass=$("au-pass").value, name=$("au-name").value.trim();
  const msg=$("auth-msg"); msg.className="auth-msg"; msg.textContent="";
  $("au-submit").disabled=true;
  try{
    if(authMode==="signup"){
      const { data, error } = await sb.auth.signUp({ email, password:pass, options:{ data:{ name }, emailRedirectTo: location.origin+location.pathname } });
      if(error) throw error;
      if(!data.session){ msg.className="auth-msg ok"; msg.textContent="Tjek din email for at bekræfte kontoen, og log så ind."; setAuthMode("login"); }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password:pass });
      if(error) throw error;
    }
  }catch(err){ msg.className="auth-msg err"; msg.textContent = translateErr(err.message); }
  $("au-submit").disabled=false;
});

$("au-forgot").addEventListener("click", async ()=>{
  const email=$("au-email").value.trim(); const msg=$("auth-msg");
  if(!email){ msg.className="auth-msg err"; msg.textContent="Skriv din email først."; return; }
  try{
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin+location.pathname });
    if(error) throw error;
    msg.className="auth-msg ok"; msg.textContent="Vi har sendt et nulstillingslink til "+email+".";
  }catch(err){ msg.className="auth-msg err"; msg.textContent=translateErr(err.message); }
});

$("reset-form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const pass=$("rs-pass").value; const msg=$("reset-msg");
  $("rs-submit").disabled=true;
  try{
    const { error } = await sb.auth.updateUser({ password: pass });
    if(error) throw error;
    msg.className="auth-msg ok"; msg.textContent="Adgangskode opdateret!";
    setTimeout(()=>{ $("reset").classList.add("hidden"); }, 900);
  }catch(err){ msg.className="auth-msg err"; msg.textContent=translateErr(err.message); }
  $("rs-submit").disabled=false;
});

$("logout").addEventListener("click", async ()=>{ await sb.auth.signOut(); location.reload(); });

function translateErr(m){
  if(!m) return "Noget gik galt.";
  if(/invalid login credentials/i.test(m)) return "Forkert email eller adgangskode.";
  if(/already registered/i.test(m)) return "Den email er allerede oprettet — log ind i stedet.";
  if(/password should be at least/i.test(m)) return "Adgangskoden skal være mindst 6 tegn.";
  if(/email not confirmed/i.test(m)) return "Bekræft din email først (tjek indbakken).";
  return m;
}

sb.auth.onAuthStateChange((event, session)=>{
  if(event==="PASSWORD_RECOVERY"){ $("auth").classList.add("hidden"); $("reset").classList.remove("hidden"); return; }
  if(session && session.user){ if(!me) boot(session.user); }
  else { $("app").classList.add("hidden"); $("auth").classList.remove("hidden"); }
});

/* ---------------- BOOT ---------------- */
async function boot(user){
  $("auth").classList.add("hidden"); $("reset").classList.add("hidden");
  // ensure coach row
  const name = (user.user_metadata && user.user_metadata.name) || (user.email||"").split("@")[0];
  await sb.from("mb_coaches").upsert({ id:user.id, email:user.email, name }, { onConflict:"id" });
  const { data:coach } = await sb.from("mb_coaches").select("*").eq("id", user.id).single();
  me = coach || { id:user.id, email:user.email, name, role:"coach" };
  $("who-name").textContent = me.name || me.email;
  $("who-role").textContent = me.role;
  $("who-role").className = "badge" + (me.role==="admin"?" admin":"");
  document.body.classList.toggle("is-admin", me.role==="admin");
  $("app").classList.remove("hidden");
  await loadTeams();
  startPolling();
}

async function loadTeams(){
  const { data } = await sb.from("mb_teams").select("*").order("sort").order("created_at");
  teams = data || [];
  renderTeamTabs();
  if(teams.length){
    if(!curTeam || !teams.find(t=>t.id===curTeam)) curTeam = teams[0].id;
    await selectTeam(curTeam);
  } else if(me.role==="admin"){
    // First-run onboarding: give a brand-new admin a working team + game immediately
    const { data:t } = await sb.from("mb_teams").insert({ name:"Mit hold", sort:0 }).select().single();
    if(t){
      await sb.from("mb_sessions").insert({ team_id:t.id, name:"Kamp 1", sort:0 });
      teams=[t]; renderTeamTabs(); await selectTeam(t.id);
      toast("Velkommen! Dit hold er klar — tilføj spillere under Trup ✨");
    } else {
      $("team-title").textContent="Mini Basket"; $("team-sub").textContent="opret et hold under Admin";
      $("session-tabs").innerHTML=""; $("grid-wrap").innerHTML='<div class="empty"><div class="big">Intet hold</div><div class="mono">Gå til Admin og opret et hold</div></div>';
    }
  } else {
    $("team-title").textContent = "Mini Basket";
    $("team-sub").textContent = "du er ikke tildelt et hold endnu";
    $("session-tabs").innerHTML=""; $("grid-wrap").innerHTML='<div class="empty"><div class="big">Intet hold</div><div class="mono">Bed din admin om at tildele dig et hold</div></div>';
  }
}

async function selectTeam(teamId){
  curTeam = teamId; curSession = null;
  const t = teams.find(x=>x.id===teamId);
  applyTeamColors(t);
  $("team-title").textContent = t ? t.name : "Rotation";
  renderTeamTabs();
  const [{data:pl},{data:se}] = await Promise.all([
    sb.from("mb_players").select("*").eq("team_id",teamId).order("sort").order("created_at"),
    sb.from("mb_sessions").select("*").eq("team_id",teamId).order("sort").order("created_at")
  ]);
  players = pl||[]; sessions = se||[];
  $("team-sub").textContent = players.length+" spillere · "+sessions.length+" kampe";
  if(sessions.length){ if(!curSession) curSession = sessions[0].id; await selectSession(curSession); }
  else { curSession=null; renderSessionTabs(); renderAll(); }
}

async function selectSession(sid){
  curSession = sid;
  timer.running=false; if(timer.iv) clearInterval(timer.iv); timer.remaining=0; timer.period=0;
  await loadDayRotations();
  renderSessionTabs(); renderAll();
}

function curSess(){ return sessions.find(s=>s.id===curSession); }
function activePlayers(){ return players.filter(p=>!p.injured); }

/* ---------------- DAY (flere kampe samme dag) ---------------- */
let dayRot = {}; // dayRot[sessionId][playerId][period] = role
function dayGames(){ const s=curSess(); if(!s) return []; const d=s.game_date; return sessions.filter(x=>x.team_id===s.team_id && x.game_date===d).sort((a,b)=>(a.sort-b.sort)||(((a.created_at||"")<(b.created_at||""))?-1:1)); }
function dayCellRole(gid,pid,per){ return dayRot[gid] && dayRot[gid][pid] && dayRot[gid][pid][per]; }
function dayPlayerTotal(pid){ let t=0; dayGames().forEach(g=>{ for(let i=0;i<g.periods;i++) if(dayCellRole(g.id,pid,i)) t++; }); return t; }
function dayTotalSlots(){ return dayGames().reduce((a,g)=>a+g.oncourt*g.periods,0); }
async function loadDayRotations(){
  const day = dayGames(); const ids = day.map(g=>g.id); dayRot = {};
  if(ids.length){
    const { data } = await sb.from("mb_rotations").select("*").in("session_id", ids);
    (data||[]).forEach(r=>{ const g=(dayRot[r.session_id]=dayRot[r.session_id]||{}); (g[r.player_id]=g[r.player_id]||{})[r.period]=r.role||"D"; });
  }
  day.forEach(g=>{ if(!dayRot[g.id]) dayRot[g.id]={}; });
  rot = dayRot[curSession] || (dayRot[curSession]={});
}
async function balanceDay(){
  const day=dayGames(); const ps=activePlayers();
  if(!day.length) return; if(!ps.length){ toast("Ingen aktive spillere"); return; }
  if(day.some(g=>g.locked)){ toast("Lås kampene op først"); return; }
  lastWrite=Date.now();
  await sb.from("mb_rotations").delete().in("session_id", day.map(g=>g.id));
  dayRot={}; day.forEach(g=>dayRot[g.id]={});
  const counts={}; ps.forEach(p=>counts[p.id]=0); const rows=[];
  day.forEach(g=>{ for(let per=0;per<g.periods;per++){
    const order=ps.slice().sort((a,b)=>counts[a.id]-counts[b.id]||Math.random()-0.5);
    order.slice(0,Math.min(g.oncourt,order.length)).forEach(p=>{ const role=p.role==="S"?"S":"D"; (dayRot[g.id][p.id]=dayRot[g.id][p.id]||{})[per]=role; counts[p.id]++; rows.push({session_id:g.id,player_id:p.id,period:per,role}); });
  }});
  rot = dayRot[curSession]||{}; renderGrid();
  try{ if(rows.length) await sb.from("mb_rotations").insert(rows); logEvent("balance","Balancerede dagen ("+day.length+" kampe)"); toast(day.length>1?"Dagen balanceret ⚡ ("+day.length+" kampe)":"Balanceret ⚡"); }catch(e){ toast("Fejl ved gem"); }
}
async function lockAllDay(){
  const day=dayGames(); if(!day.length) return; const lock = day.some(g=>!g.locked);
  day.forEach(g=>g.locked=lock); lastWrite=Date.now(); renderAll();
  try{ await sb.from("mb_sessions").update({locked:lock}).in("id", day.map(g=>g.id)); logEvent("lock",(lock?"Låste ":"Åbnede ")+"alle "+day.length+" kampe"); }catch(e){}
  toast(lock?"Alle kampe låst 🔒":"Alle kampe åbnet");
}
function renderDayPanel(){
  const el=$("day-panel"); if(!el) return; const day=dayGames();
  if(day.length<2){ el.innerHTML=""; return; }
  const ps=activePlayers();
  const chips=ps.map(p=>'<div class="daychip"><span class="dn">'+esc(p.number||p.name)+'</span><b>'+dayPlayerTotal(p.id)+'</b></div>').join('');
  el.innerHTML='<div class="day-card"><div class="day-head"><div><span class="eyebrow">I dag · '+day.length+' kampe</span><div class="day-sub">'+dayTotalSlots()+' perioder i alt · balancér fordeler på tværs</div></div>'+
    '<button class="mini-act" id="lock-all-btn">'+(day.every(g=>g.locked)?"🔓 Lås op":"🔒 Lås alle")+'</button></div><div class="daychips">'+chips+'</div></div>';
  const b=$("lock-all-btn"); if(b) b.onclick=lockAllDay;
}

/* ---------------- TEAM COLORS ---------------- */
const DEFAULT_D = "#6e1526", DEFAULT_S = "#c39b41";
const PALETTE_D = ["#6e1526","#d0342c","#1f5fbf","#2e7d46","#e0a92b","#1a1a1a","#6d3b9e","#ffffff"];
const PALETTE_S = ["#c39b41","#e0a92b","#9aa0a6","#7fb3e0","#e08fb0","#2e7d46","#d0342c","#ffffff"];
function textOn(hex){ const c=(hex||"").replace('#',''); if(c.length<6) return '#ffffff'; const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16); return (0.299*r+0.587*g+0.114*b)>150 ? '#1a1a1a' : '#ffffff'; }
function darkenHex(hex,f){ const c=(hex||"").replace('#',''); if(c.length<6) return hex; const p=i=>parseInt(c.substr(i,2),16), h=x=>('0'+Math.max(0,Math.round(x*(1-f))).toString(16)).slice(-2); return '#'+h(p(0))+h(p(2))+h(p(4)); }
function applyTeamColors(t){
  const r = document.documentElement.style;
  const d = (t && t.color_d) || DEFAULT_D, s = (t && t.color_s) || DEFAULT_S;
  r.setProperty('--wine', d); r.setProperty('--wine-2', d); r.setProperty('--wine-dark', darkenHex(d,0.25)); r.setProperty('--wine-text', textOn(d));
  r.setProperty('--gold', s); r.setProperty('--gold-2', s); r.setProperty('--gold-text', textOn(s));
  r.setProperty('--dark', darkenHex(d,0.52)); r.setProperty('--dark-2', darkenHex(d,0.44));
}
function renderAdminTeams(){
  const el=$("admin-teams"); if(!el) return;
  if(!teams.length){ el.innerHTML='<div class="rc-sub" style="padding:4px 2px">Opret et hold ovenfor, så kan du vælge holdfarver.</div>'; return; }
  el.innerHTML = teams.map(t=>{
    const d=t.color_d||DEFAULT_D, s=t.color_s||DEFAULT_S;
    const row=(pal,slot,cur)=>pal.map(c=>'<button class="swatch-btn'+(c.toLowerCase()===cur.toLowerCase()?' sel':'')+'" style="background:'+c+'" data-tc="'+t.id+'|'+slot+'|'+c+'" title="'+c+'"></button>').join('');
    return '<div class="adm-team-card"><div class="tn"><span class="tn-dot" style="background:'+esc(d)+'"></span><span class="tn-dot" style="background:'+esc(s)+'"></span>'+esc(t.name)+'</div>'+
      '<div class="lbl">Primær · forsvar (D)</div><div class="swrow">'+row(PALETTE_D,"d",d)+'</div>'+
      '<div class="lbl">Sekundær · spil (S)</div><div class="swrow">'+row(PALETTE_S,"s",s)+'</div></div>';
  }).join('');
}

/* ---------------- POLLING (light sync) ---------------- */
function startPolling(){ if(poll) clearInterval(poll); poll = setInterval(refreshQuiet, 9000); }
document.addEventListener("visibilitychange", ()=>{ if(!document.hidden) refreshQuiet(); });
async function refreshQuiet(){
  if(!curTeam || document.hidden) return;
  if(Date.now() - lastWrite < 4500) return; // don't overwrite recent local edits
  try{
    if(curSession && (view==="kamp"||view==="tid")){
      const [{data:se},{data:rt}] = await Promise.all([
        sb.from("mb_sessions").select("*").eq("id",curSession).single(),
        sb.from("mb_rotations").select("*").eq("session_id",curSession)
      ]);
      if(se){ const i=sessions.findIndex(x=>x.id===se.id); if(i>=0) sessions[i]=se; }
      rot={}; (rt||[]).forEach(r=>{ (rot[r.player_id]=rot[r.player_id]||{})[r.period]=r.role||"D"; });
      if(view==="kamp") renderGrid(); if(view==="tid") renderTid(); renderScorePill();
    }
  }catch(e){}
}

/* ---------------- LOG ---------------- */
async function logEvent(action, summary){
  try{ await sb.from("mb_logs").insert({ team_id:curTeam, session_id:curSession, coach_id:me.id, coach_name:me.name, action, summary }); }catch(e){}
}

/* ---------------- RENDER: TABS ---------------- */
function renderTeamTabs(){
  const el=$("team-tabs"); el.innerHTML="";
  teams.forEach(t=>{ const b=document.createElement("button"); b.className="chip"+(t.id===curTeam?" active":""); b.textContent=t.name; b.onclick=()=>selectTeam(t.id); el.appendChild(b); });
}
function renderSessionTabs(){
  const el=$("session-tabs"); el.innerHTML="";
  sessions.forEach(s=>{ const b=document.createElement("button"); b.className="chip session"+(s.id===curSession?" active":""); b.textContent=s.name; b.onclick=()=>{ if(s.id===curSession) renameSession(s); else selectSession(s.id); }; el.appendChild(b); });
  if(curTeam){ const a=document.createElement("button"); a.className="chip add"; a.textContent="+ Kamp"; a.onclick=openNewSession; el.appendChild(a); }
}
async function renameSession(s){
  const name = prompt("Nyt navn til kampen:", s.name);
  if(name===null) return; const n=name.trim(); if(!n || n===s.name) return;
  s.name=n; lastWrite=Date.now(); renderSessionTabs(); $("session-title").textContent=n;
  try{ await sb.from("mb_sessions").update({name:n}).eq("id",s.id); logEvent("session","Omdøbte kamp til "+n); }catch(e){ toast("Kunne ikke gemme navn"); }
}

/* ---------------- RENDER: KAMP GRID ---------------- */
function cellRole(pid,per){ return rot[pid] && rot[pid][per]; }
function periodCount(per){ return activePlayers().reduce((n,p)=> n + (cellRole(p.id,per)?1:0), 0); }
function playerTotal(pid){ const s=curSess(); if(!s) return 0; let t=0; for(let i=0;i<s.periods;i++) if(cellRole(pid,i)) t++; return t; }
function fairTarget(){ const s=curSess(); const n=activePlayers().length; return n? (s.oncourt*s.periods)/n : 0; }

function renderAll(){
  renderSegs(); renderScorePill();
  $("session-title").textContent = curSess() ? curSess().name : "—";
  const locked = curSess() && curSess().locked;
  $("btn-lock").textContent = locked ? "🔒" : "🔓"; $("btn-lock").classList.toggle("on", !!locked);
  setView(view);
}
function renderScorePill(){ const s=curSess(); $("score-pill").textContent = s ? (s.score_us+" / "+s.score_them) : "0 / 0"; }

function renderSegs(){
  const s=curSess();
  const so=$("seg-oncourt"); so.innerHTML=""; ONCOURT.forEach(v=>{ const b=document.createElement("button"); b.textContent=v; if(s&&v===s.oncourt)b.className="on"; b.onclick=()=>updateSession({oncourt:v}); so.appendChild(b); });
  const sp=$("seg-periods"); sp.innerHTML=""; PERIODS.forEach(v=>{ const b=document.createElement("button"); b.textContent=v; if(s&&v===s.periods)b.className="on"; b.onclick=()=>updateSession({periods:v}); sp.appendChild(b); });
}

function renderGrid(){
  const wrap=$("grid-wrap"); const s=curSess();
  renderDayPanel();
  if(!s){ wrap.innerHTML='<div class="empty"><div class="big">Ingen kamp</div><div class="mono">Tryk “+ Kamp” for at oprette en</div></div>'; renderBalance(); return; }
  if(!players.length){ wrap.innerHTML='<div class="empty"><div class="big">Ingen spillere</div><div class="mono">Gå til Trup og tilføj din trup</div></div>'; renderBalance(); return; }
  const cols = "minmax(96px,1.3fr) repeat("+s.periods+",1fr) 46px";
  let h='<div class="grid" style="grid-template-columns:'+cols+'">';
  h+='<div class="gh left">Spiller</div>';
  for(let i=0;i<s.periods;i++) h+='<div class="gh">P'+(i+1)+'</div>';
  h+='<div class="gh">Σ</div>';
  const target=fairTarget();
  players.forEach(p=>{
    const ini = p.number || (p.name.trim()[0]||"?").toUpperCase();
    h+='<div class="pcell-name" data-edit="'+p.id+'"><div class="num">'+esc(ini)+'</div><div class="pname'+(p.injured?" injured":"")+'">'+esc(p.name)+'</div></div>';
    for(let i=0;i<s.periods;i++){
      if(p.injured){ h+='<div class="cell empty locked">–</div>'; continue; }
      const r=cellRole(p.id,i);
      const cls = r==="D"?"d":(r==="S"?"s":"empty");
      h+='<div class="cell '+cls+(s.locked?" locked":"")+'" data-cell="'+p.id+','+i+'">'+(r||"")+'</div>';
    }
    const tot=p.injured?0:playerTotal(p.id);
    let tc="ptot"; if(!p.injured && tot<Math.floor(target)) tc+=" under";
    h+='<div class="'+tc+'">'+(p.injured?"–":tot)+'</div>';
  });
  h+='<div class="totrow-lbl">På banen</div>';
  for(let i=0;i<s.periods;i++){ const c=periodCount(i); let cc="totcell"; if(c===s.oncourt)cc+=" full"; else if(c>s.oncourt)cc+=" over"; h+='<div class="'+cc+'">'+c+'</div>'; }
  const grand=activePlayers().reduce((a,p)=>a+playerTotal(p.id),0);
  h+='<div class="totcell sum">'+grand+'</div>';
  h+='</div>';
  wrap.innerHTML=h; renderBalance();
}

function renderBalance(){
  const s=curSess(); const ps=activePlayers();
  const val=$("balance-val"); const barsEl=$("balance-bars");
  if(!s||!ps.length){ val.innerHTML="—"; barsEl.innerHTML=""; return; }
  const target=fairTarget();
  const okCount = ps.filter(p=> playerTotal(p.id) >= Math.floor(target)).length;
  val.innerHTML='<b>'+okCount+'</b> <span>/ '+ps.length+'</span>';
  let bars=""; const n=Math.min(ps.length,12);
  for(let i=0;i<n;i++){ bars+= i<okCount ? '<i class="full"></i>' : (i<okCount+1?'<i class="on"></i>':'<i></i>'); }
  barsEl.innerHTML=bars;
}

/* cell click: cycle empty -> D -> S -> empty */
async function cycleCell(pid,per){
  const s=curSess(); if(!s||s.locked) return;
  lastWrite = Date.now();
  const cur = cellRole(pid,per);
  let next = cur==null ? "D" : (cur==="D" ? "S" : null);
  if(next){ (rot[pid]=rot[pid]||{})[per]=next; } else { if(rot[pid]) delete rot[pid][per]; }
  renderGrid();
  try{
    if(next) await sb.from("mb_rotations").upsert({ session_id:s.id, player_id:pid, period:per, role:next }, { onConflict:"session_id,player_id,period" });
    else await sb.from("mb_rotations").delete().match({ session_id:s.id, player_id:pid, period:per });
  }catch(e){ toast("Kunne ikke gemme"); }
}

async function autoBalance(){
  const s=curSess(); if(!s){ return; } if(s.locked){ toast("Kampen er låst"); return; }
  const ps=activePlayers(); if(!ps.length){ toast("Ingen spillere"); return; }
  await sb.from("mb_rotations").delete().eq("session_id",s.id);
  rot={};
  const counts={}; ps.forEach(p=>counts[p.id]=0);
  const rows=[];
  for(let per=0;per<s.periods;per++){
    const order=ps.slice().sort((a,b)=> counts[a.id]-counts[b.id] || Math.random()-0.5);
    order.slice(0,Math.min(s.oncourt,order.length)).forEach(p=>{
      const role = p.role==="S" ? "S" : "D";
      (rot[p.id]=rot[p.id]||{})[per]=role; counts[p.id]++;
      rows.push({ session_id:s.id, player_id:p.id, period:per, role });
    });
  }
  renderGrid();
  try{ if(rows.length) await sb.from("mb_rotations").insert(rows); logEvent("balance","Auto-balancerede "+s.name); toast("Balanceret ⚡"); }catch(e){ toast("Fejl ved gem"); }
}

async function clearPeriod(){
  const s=curSess(); if(!s||s.locked) return; const per=timer.period||0;
  activePlayers().forEach(p=>{ if(rot[p.id]) delete rot[p.id][per]; });
  renderGrid();
  try{ await sb.from("mb_rotations").delete().eq("session_id",s.id).eq("period",per); toast("Periode "+(per+1)+" ryddet"); }catch(e){}
}

/* ---------------- SESSION ops ---------------- */
async function updateSession(patch){
  const s=curSess(); if(!s) return; lastWrite = Date.now(); Object.assign(s,patch);
  renderSegs(); renderGrid(); renderScorePill();
  try{ await sb.from("mb_sessions").update(patch).eq("id",s.id); }catch(e){}
}
$("btn-lock").addEventListener("click", async ()=>{ const s=curSess(); if(!s) return; await updateSession({locked:!s.locked}); $("btn-lock").textContent=s.locked?"🔒":"🔓"; $("btn-lock").classList.toggle("on",s.locked); logEvent("lock",(s.locked?"Låste ":"Åbnede ")+s.name); renderGrid(); });

function openNewSession(){ $("ms-name").value=""; $("modal-session").classList.add("open"); }
$("ms-cancel").onclick=()=>$("modal-session").classList.remove("open");
$("ms-save").onclick=async ()=>{
  const name=$("ms-name").value.trim()||("Kamp "+(sessions.length+1));
  const { data, error } = await sb.from("mb_sessions").insert({ team_id:curTeam, name, sort:sessions.length }).select().single();
  if(error){ toast("Fejl: "+error.message); return; }
  sessions.push(data); $("modal-session").classList.remove("open"); logEvent("session","Oprettede kamp "+name); await selectSession(data.id);
};

/* ---------------- TRUP ---------------- */
function renderTrup(){
  const el=$("trup-list"); $("trup-count").textContent=players.length+" spillere";
  if(!curTeam){ el.innerHTML='<div class="empty"><div class="big">Vælg et hold</div></div>'; return; }
  if(!players.length){ el.innerHTML='<div class="empty"><div class="big">Tom trup</div><div class="mono">Tilføj din første spiller</div></div>'; return; }
  el.innerHTML="";
  players.forEach(p=>{
    const c=document.createElement("div"); c.className="row-card"+(p.injured?" injured":"");
    const ini=p.number||(p.name.trim()[0]||"?").toUpperCase();
    const rb = p.role==="D"?'<span class="rolebadge d">D</span>':(p.role==="S"?'<span class="rolebadge s">S</span>':'');
    c.innerHTML='<div class="num">'+esc(ini)+'</div>'+
      '<div class="rc-body" data-edit="'+p.id+'"><div class="rc-name'+(p.injured?" injured":"")+'">'+esc(p.name)+' '+rb+'</div><div class="rc-sub">'+(p.number?"#"+esc(p.number)+" · ":"")+(p.injured?"ude":"klar")+'</div></div>'+
      '<button class="mini-act '+(p.injured?"on":"")+'" data-injure="'+p.id+'">'+(p.injured?"Ude":"Klar")+'</button>';
    el.appendChild(c);
  });
}
$("add-player").addEventListener("click", addPlayer);
$("add-name").addEventListener("keydown", e=>{ if(e.key==="Enter") addPlayer(); });
async function addPlayer(){
  if(!curTeam){ toast("Vælg et hold først"); return; }
  const name=$("add-name").value.trim(), num=$("add-num").value.trim();
  if(!name){ toast("Skriv et navn"); return; }
  const { data, error } = await sb.from("mb_players").insert({ team_id:curTeam, name, number:num||null, sort:players.length }).select().single();
  if(error){ toast("Fejl: "+error.message); return; }
  players.push(data); $("add-name").value=""; $("add-num").value=""; renderTrup(); if(view==="kamp") renderGrid();
  $("team-sub").textContent = players.length+" spillere · "+sessions.length+" kampe";
}

let editId=null, editRole="";
function openPlayer(id){
  const p=players.find(x=>x.id===id); if(!p) return; editId=id; editRole=p.role||"";
  $("mp-name").value=p.name; $("mp-num").value=p.number||"";
  document.querySelectorAll("#mp-roles .roleopt").forEach(b=>b.classList.toggle("on", (b.dataset.role||"")===editRole));
  $("modal-player").classList.add("open");
}
document.querySelectorAll("#mp-roles .roleopt").forEach(b=> b.onclick=()=>{ editRole=b.dataset.role||""; document.querySelectorAll("#mp-roles .roleopt").forEach(x=>x.classList.toggle("on",x===b)); });
$("mp-cancel").onclick=()=>$("modal-player").classList.remove("open");
$("mp-save").onclick=async ()=>{
  const p=players.find(x=>x.id===editId); if(!p) return;
  const patch={ name:$("mp-name").value.trim()||p.name, number:$("mp-num").value.trim()||null, role:editRole||null };
  Object.assign(p,patch); $("modal-player").classList.remove("open"); renderTrup(); if(view==="kamp") renderGrid();
  try{ await sb.from("mb_players").update(patch).eq("id",p.id); }catch(e){ toast("Fejl ved gem"); }
};
$("mp-del").onclick=async ()=>{
  if(!confirm("Slet spiller?")) return;
  const id=editId; players=players.filter(x=>x.id!==id); $("modal-player").classList.remove("open"); renderTrup(); if(view==="kamp") renderGrid();
  try{ await sb.from("mb_players").delete().eq("id",id); }catch(e){}
};

/* ---------------- TID ---------------- */
function fmt(s){ const m=Math.floor(s/60), x=s%60; return (m<10?"0":"")+m+":"+(x<10?"0":"")+x; }
function renderTid(){
  const s=curSess();
  $("tid-plabel").textContent="Periode "+((timer.period||0)+1);
  $("tid-curp").textContent=(timer.period||0)+1;
  $("sc-us").textContent = s?s.score_us:0; $("sc-them").textContent = s?s.score_them:0;
  if(!timer.running && timer.remaining===0) timer.remaining=timer.lenMin*60;
  $("tid-clock").textContent=fmt(timer.remaining);
  $("tid-card").className="tid-clock-card"+(timer.running?" run":"");
  $("tid-state").textContent = timer.running?"Kører — tryk for pause":(timer.remaining===timer.lenMin*60?"Klar — tryk for at starte":"Pause");
  const lu=$("tid-lineup"); const per=timer.period||0;
  const on=activePlayers().filter(p=>cellRole(p.id,per));
  lu.innerHTML = on.length? on.map(p=>{ const ini=p.number||(p.name.trim()[0]||"?").toUpperCase(); return '<div class="lu"><div class="num">'+esc(ini)+'</div><div class="lu-name">'+esc(p.name)+'</div></div>'; }).join("") : '<div class="empty" style="grid-column:1/-1;padding:12px"><div class="mono">Ingen valgt til periode '+(per+1)+'</div></div>';
  const lg=$("tid-len"); lg.innerHTML=""; LENGTHS.forEach(v=>{ const b=document.createElement("button"); b.className="segbtn"+(v===timer.lenMin?" on":""); b.textContent=v+"m"; b.onclick=()=>{ timer.lenMin=v; if(!timer.running) timer.remaining=v*60; renderTid(); }; lg.appendChild(b); });
  const pr=$("tid-per"); const np=s?s.periods:6; pr.style.gridTemplateColumns="repeat("+np+",1fr)"; pr.innerHTML="";
  for(let i=0;i<np;i++){ (function(i){ const b=document.createElement("button"); b.className="segbtn"+(i===(timer.period||0)?" cur":""); b.textContent=(i+1); b.onclick=()=>{ timer.period=i; renderTid(); }; pr.appendChild(b); })(i); }
}
function tick(){ if(timer.remaining<=0){ stopT(); vibrate([200,100,200]); toast("Tiden er gået ⏱"); return; } timer.remaining--; $("tid-clock").textContent=fmt(timer.remaining); if(timer.remaining===0){ stopT(); vibrate([200,100,200]); toast("Tiden er gået ⏱"); } }
function startT(){ if(timer.running) return; if(timer.remaining===0) timer.remaining=timer.lenMin*60; timer.running=true; timer.iv=setInterval(tick,1000); renderTid(); }
function stopT(){ timer.running=false; if(timer.iv) clearInterval(timer.iv); renderTid(); }
$("tid-card").addEventListener("click", ()=>{ if(timer.running) stopT(); else startT(); });
$("tid-card").addEventListener("dblclick", ()=>{ stopT(); timer.remaining=timer.lenMin*60; renderTid(); });

/* ---------------- LOG ---------------- */
async function renderLog(){
  const el=$("log-list"); el.innerHTML='<div class="loading">Henter log…</div>';
  const { data, error } = await sb.from("mb_logs").select("*").eq("team_id",curTeam).order("created_at",{ascending:false}).limit(80);
  if(error){ el.innerHTML='<div class="empty"><div class="mono">Kun admin kan se loggen.</div></div>'; return; }
  if(!data||!data.length){ el.innerHTML='<div class="empty"><div class="big">Ingen aktivitet</div></div>'; return; }
  el.innerHTML=data.map(l=>{
    const d=new Date(l.created_at); const when=d.toLocaleString("da-DK",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
    return '<div class="log-item"><div class="log-dot"></div><div class="log-body"><div class="log-sum">'+esc(l.summary||l.action)+'</div><div class="log-meta"><span>'+esc(l.coach_name||"?")+'</span><span>'+when+'</span></div></div></div>';
  }).join("");
}

/* ---------------- ADMIN ---------------- */
async function renderAdmin(){
  renderAdminTeams();
  const el=$("admin-coaches"); el.innerHTML='<div class="loading">Henter…</div>';
  const [{data:coaches},{data:ct}] = await Promise.all([
    sb.from("mb_coaches").select("*").order("created_at"),
    sb.from("mb_coach_teams").select("*")
  ]);
  if(!coaches){ el.innerHTML='<div class="empty"><div class="mono">Kun admin.</div></div>'; return; }
  const byCoach={}; (ct||[]).forEach(r=>{ (byCoach[r.coach_id]=byCoach[r.coach_id]||new Set()).add(r.team_id); });
  el.innerHTML="";
  coaches.forEach(c=>{
    const card=document.createElement("div"); card.className="adm-card"+(c.role==="admin"?" admin":"");
    const teamChips = teams.map(t=>{ const on=byCoach[c.id]&&byCoach[c.id].has(t.id); return '<button class="tchip'+(on?" on":"")+'" data-assign="'+c.id+"|"+t.id+'">'+esc(t.name)+'</button>'; }).join("");
    card.innerHTML='<div class="adm-head"><div><div class="adm-name">'+esc(c.name||"—")+'</div><div class="adm-email">'+esc(c.email||"")+'</div></div>'+
      '<div class="roletoggle"><button class="'+(c.role!=="admin"?"on":"")+'" data-role="'+c.id+'|coach">Træner</button><button class="'+(c.role==="admin"?"on admin":"")+'" data-role="'+c.id+'|admin">Admin</button></div></div>'+
      '<div class="adm-teams">'+(teams.length?teamChips:'<span class="mono" style="color:var(--ink-soft);font-size:11px">Opret hold først</span>')+'</div>';
    el.appendChild(card);
  });
}
$("add-team-btn").addEventListener("click", async ()=>{
  const name=$("add-team").value.trim(); if(!name){ toast("Skriv holdnavn"); return; }
  const { data, error } = await sb.from("mb_teams").insert({ name, sort:teams.length }).select().single();
  if(error){ toast("Fejl: "+error.message); return; }
  teams.push(data); $("add-team").value=""; logEvent("team","Oprettede hold "+name); renderTeamTabs(); renderAdmin(); await selectTeam(data.id); toast("Hold oprettet — tilføj spillere under Trup");
});

/* admin delegated clicks */
$("view-admin").addEventListener("click", async (e)=>{
  const tc=e.target.closest("[data-tc]");
  if(tc){ const [tid,slot,hex]=tc.dataset.tc.split("|"); const col = slot==="d"?"color_d":"color_s";
    const team=teams.find(x=>x.id===tid); if(team){ team[col]=hex; }
    renderAdminTeams(); renderTeamTabs();
    if(tid===curTeam){ applyTeamColors(team); if(view==="kamp") renderGrid(); }
    try{ await sb.from("mb_teams").update({[col]:hex}).eq("id",tid); }catch(err){ toast("Kunne ikke gemme farve"); }
    return; }
  const r=e.target.closest("[data-role]");
  if(r){ const [cid,role]=r.dataset.role.split("|"); await sb.from("mb_coaches").update({role}).eq("id",cid); renderAdmin(); toast("Rolle opdateret"); return; }
  const a=e.target.closest("[data-assign]");
  if(a){ const [cid,tid]=a.dataset.assign.split("|"); const on=a.classList.contains("on");
    if(on){ await sb.from("mb_coach_teams").delete().match({coach_id:cid,team_id:tid}); }
    else { await sb.from("mb_coach_teams").insert({coach_id:cid,team_id:tid}); }
    renderAdmin(); return; }
});

/* ---------------- SCORE ---------------- */
$("view-tid").addEventListener("click", async (e)=>{
  const b=e.target.closest("[data-sc]"); if(!b) return; const s=curSess(); if(!s){ toast("Opret en kamp først"); return; } lastWrite = Date.now();
  const [side,d]=b.dataset.sc.split(","); const key=side==="us"?"score_us":"score_them";
  s[key]=Math.max(0,(s[key]||0)+(+d)); $(side==="us"?"sc-us":"sc-them").textContent=s[key]; renderScorePill();
  try{ await sb.from("mb_sessions").update({[key]:s[key]}).eq("id",s.id); }catch(e){}
});

/* ---------------- VIEW SWITCH ---------------- */
function setView(v){
  view=v;
  document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active", el.id==="view-"+v));
  document.querySelectorAll(".tb").forEach(el=>el.classList.toggle("active", el.dataset.view===v));
  $("action-bar").style.display = v==="kamp" ? "block" : "none";
  if(v==="kamp"){ renderSegs(); renderGrid(); }
  if(v==="trup") renderTrup();
  if(v==="tid") renderTid();
  if(v==="log") renderLog();
  if(v==="admin") renderAdmin();
}
$("tabbar").addEventListener("click", e=>{ const b=e.target.closest(".tb"); if(b) setView(b.dataset.view); });
$("btn-auto").addEventListener("click", balanceDay);
$("btn-clear").addEventListener("click", clearPeriod);

/* global delegated: grid cells + player edits + injure */
document.body.addEventListener("click", e=>{
  const cell=e.target.closest("[data-cell]"); if(cell){ const [pid,per]=cell.dataset.cell.split(","); cycleCell(pid,+per); return; }
  const edit=e.target.closest("[data-edit]"); if(edit){ openPlayer(edit.dataset.edit); return; }
  const inj=e.target.closest("[data-injure]"); if(inj){ toggleInjure(inj.dataset.injure); return; }
});
async function toggleInjure(id){ const p=players.find(x=>x.id===id); if(!p) return; p.injured=!p.injured; renderTrup(); if(view==="kamp") renderGrid(); try{ await sb.from("mb_players").update({injured:p.injured}).eq("id",id); }catch(e){} }

/* ---------------- COFFEE ---------------- */
let coffeeAmt=50;
$("coffee-open").addEventListener("click", ()=>$("modal-coffee").classList.add("open"));
$("coffee-cancel").addEventListener("click", ()=>$("modal-coffee").classList.remove("open"));
$("coffee-amts").addEventListener("click", e=>{ const b=e.target.closest("[data-amt]"); if(!b) return; coffeeAmt=+b.dataset.amt; document.querySelectorAll(".coffee-amt").forEach(x=>x.classList.toggle("sel",x===b)); });
$("coffee-send").addEventListener("click", ()=>{ const url="https://mobilepay.dk/erhverv/betalingslink/betalingslink-svar?phone="+encodeURIComponent(MOBILEPAY_BOX)+"&amount="+coffeeAmt+"&comment="+encodeURIComponent("Mini Basket kaffe"); window.open(url,"_blank"); toast("Åbner MobilePay…"); });

/* ---------------- COFFEE (ekstra knap i Links-visning) ---------------- */
const _co2=$("coffee-open2"); if(_co2) _co2.addEventListener("click", ()=>$("modal-coffee").classList.add("open"));

document.querySelectorAll(".backdrop").forEach(b=> b.addEventListener("click", e=>{ if(e.target===b) b.classList.remove("open"); }));

/* ---------------- INIT ---------------- */
(async ()=>{
  const { data } = await sb.auth.getSession();
  if(data.session && data.session.user){ boot(data.session.user); }
  else { $("auth").classList.remove("hidden"); }
})();

if("serviceWorker" in navigator){ window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{})); }
