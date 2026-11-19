window.bootApp=(async()=>{const timer=setTimeout(()=>{$("#loading").textContent=t("signin")},10000);
db=await claude.use("db");user=await claude.use("user");
assets=await claude.use("assets");uid=await user.id();ADMIN=REAL=!!(user.isOwner()||user.canEdit());applyTheme();
view=ADMIN?"o_dash":"e_dash";const h=location.hash.slice(1);if(ICON[h]&&h.startsWith(ADMIN?"o_":"e_"))view=h;
try{const me=await user.me();names[uid]=me.name||""}catch(e){}
const live=(col,cb)=>db.collection(col).onSnapshot(s=>{clearTimeout(timer);cb(s.docs.map(d=>({id:d.id,...d.data()})));render()},()=>{});
live("events",r=>events=r);live("settings",r=>{settings=(r.find(x=>x.id==="theme")||{});applyTheme()});live("urgent",r=>{urgent=r;processUrgent()});live("claims",r=>{claims=r;processUrgent()});live("board",r=>board=r);if(REAL){live("clients",r=>clients=r);live("ledger",r=>ledger=r);live("templates",r=>tpls=r)}live("replies",r=>replies=r);if(REAL){live("projects",r=>projects=r);live("audit",r=>audit=r)}live("roles",r=>{roles={};r.forEach(x=>roles[x.id]=x.role)});
if(REAL)live("jobs",r=>jobs=r);
watch(uid);
live("members",r=>{members=r;if(!r.find(m=>m.id===uid)&&!window.__memW&&(window.__memW=1))db.doc("members/"+uid).set({phone:(PROFILE&&PROFILE.phone)||"",isAdmin:ADMIN,joined:Date.now()}).catch(()=>{});
if(REAL)r.forEach(m=>watch(m.id));resolveNames()});
apply()});
