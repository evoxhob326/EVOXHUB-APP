
/* ===== v3 modules ===== */
Object.assign(T.ar,{o_ops:"مركز العمليات",o_proj:"المشاريع",o_urgent:"الأعمال المستعجلة",o_pay:"الرواتب والعمولات",o_ai:"المساعد الذكي",o_audit:"سجل العمليات",o_set:"الإعدادات والثيمات",
e_urgent:"أعمال مستعجلة",e_pay:"راتبي وعمولاتي",ownerMode:"وضع المالك",empMode:"وضع الموظف",switchTo:"التبديل إلى",
project:"المشروع",projects:"المشاريع",manager:"المدير",active:"نشط",paused:"متوقف",revenue:"الإيرادات",expenses:"المصروفات",comms:"العمولات",tasksN:"المهام",
av_free:"متاح",av_busy:"مشغول",av_mission:"في مهمة",av_off:"غير متاح",av_leave:"إجازة",av_out:"خارج الدوام",myStatus:"حالتي",
specialty:"المسمى الوظيفي",need:"العدد المطلوب",location:"الموقع",execTime:"وقت التنفيذ",deadline:"آخر موعد للقبول",pay:"الأجر (ر.ع)",terms:"الشروط",publish:"نشر العمل المستعجل",accept:"قبول العمل",accepted:"قبلت",
u_open:"مفتوح",u_full:"اكتمل العدد",u_closed:"مغلق",u_cancel:"ملغى",youWon:"تم تكليفك بهذا العمل",tooLate:"اكتمل العدد",close_:"إغلاق",reopen:"إعادة فتح",cancelJob:"إلغاء",acceptedBy:"المقبولون",urgentNew:"🔴 عمل مستعجل جديد: {t}",urgentWon:"تم تكليفك بالعمل المستعجل: {t}",
value:"قيمة العمل (ر.ع)",commPct:"نسبة العمولة %",payType:"النوع",pt_salary:"راتب",pt_comm:"عمولة",pt_bonus:"مكافأة",pt_ded:"خصم",dueDate:"تاريخ الاستحقاق",paid:"المدفوع",remaining:"المتبقي",
ps_calc:"قيد الاحتساب",ps_due:"مستحق",ps_ok:"معتمد",ps_part:"مدفوع جزئياً",ps_paid:"مدفوع بالكامل",ps_cancel:"ملغى",recordPay:"تسجيل دفعة",addPay:"إضافة بند",commDue:"عمولات جاهزة للاحتساب",createComm:"احتساب العمولة",
totalDue:"المستحق",totalPaid:"المدفوع",
liveFree:"متاحون الآن",liveField:"في مهمة",liveUrgent:"أعمال مستعجلة مفتوحة",liveProj:"مشاريع قيد التنفيذ",noMap:"الخريطة المباشرة مرحلة قادمة.",
aiHint:"اكتب المطلوب بلهجتك…",aiRun:"رتّب المشروع",aiThinking:"جارٍ الترتيب…",aiType:"نوع المشروع",aiQs:"أسئلة يجب توضيحها",aiTasks:"المهام المقترحة",aiApprove:"اعتماد وإرسال التكليفات",aiNA:"المساعد الذكي مرحلة قادمة في النسخة الجديدة",aiDone:"تم إنشاء المهام وإرسالها",
action:"العملية",user_:"المستخدم",time:"الوقت",theme:"الثيم",th_petrol:"بترولي EVOXHUB",th_night:"ليلي",th_reve:"ريڤ",forced:"ثيم إجباري للجميع",noForce:"— بدون (يختار كل شخص) —",activeTheme:"الثيم النشط",
ref:"رقم مرجعي"});
Object.assign(T.en,{o_ops:"Live operations",o_proj:"Projects",o_urgent:"Urgent jobs",o_pay:"Payroll & commissions",o_ai:"AI assistant",o_audit:"Audit log",o_set:"Settings & themes",
e_urgent:"Urgent jobs",e_pay:"My pay",ownerMode:"Owner mode",empMode:"Employee mode",switchTo:"Switch to",
project:"Project",projects:"Projects",manager:"Manager",active:"Active",paused:"Paused",revenue:"Revenue",expenses:"Expenses",comms:"Commissions",tasksN:"Tasks",
av_free:"Available",av_busy:"Busy",av_mission:"On a job",av_off:"Unavailable",av_leave:"On leave",av_out:"Off duty",myStatus:"My status",
specialty:"Job title",need:"People needed",location:"Location",execTime:"Execution time",deadline:"Accept by",pay:"Pay (OMR)",terms:"Terms",publish:"Publish urgent job",accept:"Accept job",accepted:"Accepted",
u_open:"Open",u_full:"Filled",u_closed:"Closed",u_cancel:"Cancelled",youWon:"You got this job",tooLate:"Already filled",close_:"Close",reopen:"Reopen",cancelJob:"Cancel",acceptedBy:"Accepted by",urgentNew:"🔴 New urgent job: {t}",urgentWon:"You're assigned the urgent job: {t}",
value:"Work value (OMR)",commPct:"Commission %",payType:"Type",pt_salary:"Salary",pt_comm:"Commission",pt_bonus:"Bonus",pt_ded:"Deduction",dueDate:"Due date",paid:"Paid",remaining:"Remaining",
ps_calc:"Calculating",ps_due:"Due",ps_ok:"Approved",ps_part:"Partly paid",ps_paid:"Paid in full",ps_cancel:"Cancelled",recordPay:"Record payment",addPay:"Add item",commDue:"Commissions ready to calculate",createComm:"Calculate",
totalDue:"Owed",totalPaid:"Paid",
liveFree:"Available now",liveField:"On a job",liveUrgent:"Open urgent jobs",liveProj:"Projects in progress",noMap:"Live map is a later phase.",
aiHint:"Describe the job in your own words…",aiRun:"Organise it",aiThinking:"Organising…",aiType:"Project type",aiQs:"Questions to clarify",aiTasks:"Suggested tasks",aiApprove:"Approve & send assignments",aiNA:"AI assistant is a later phase in the new version",aiDone:"Tasks created and sent",
action:"Action",user_:"User",time:"Time",theme:"Theme",th_petrol:"EVOXHUB petrol",th_night:"Night",th_reve:"REVE",forced:"Forced theme for everyone",noForce:"— none (personal choice) —",activeTheme:"Active theme",
ref:"Ref"});
Object.assign(ICON,{o_ops:"◎",o_proj:"▤",o_urgent:"⚡",o_pay:"﷼",o_ai:"✧",o_audit:"≡",o_set:"⚙",e_urgent:"⚡",e_pay:"﷼"});
let REAL=false,projects=[],urgent=[],claims=[],audit=[],settings={},sample=null,aiResult=null,aiBusy=false;
const AV=["av_free","av_busy","av_mission","av_off","av_leave","av_out"];
const avColor=a=>a==="av_free"?"ok":a==="av_mission"||a==="av_busy"?"warn":"bad";
const mem=id=>members.find(m=>m.id===id)||{};
const projName=id=>(projects.find(p=>p.id===id)||{}).name||"";
const money=n=>(+n||0).toFixed(3);
function log(action,detail){if(REAL)db.collection("audit").doc(uuid()).set({by:uid,action,detail:String(detail||"").slice(0,300),at:Date.now()}).catch(()=>{})}

const THEMES={th_petrol:{petrol:"#0B3D3F",petrol2:"#0f5356",petrol3:"#13686c",sand:"#C9A45C"},th_night:{petrol:"#0d1b2a",petrol2:"#1b263b",petrol3:"#415a77",sand:"#e0b354"},th_reve:{petrol:"#5a1726",petrol2:"#6e2333",petrol3:"#8c3448",sand:"#efe3c8"}};
function activeTheme(){let p="th_petrol";try{p=localStorage.getItem("evx_theme")||p}catch(e){}return settings.forced||p}
function applyTheme(){const th=THEMES[activeTheme()]||THEMES.th_petrol;const r=document.documentElement.style;Object.entries(th).forEach(([k,v])=>r.setProperty("--"+k,v))}

const claimsOf=id=>claims.filter(c=>c.job===id&&!c.removed).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
const winners=u=>claimsOf(u.id).slice(0,+u.need||1);
function processUrgent(){if(!REAL)return;urgent.forEach(u=>{if(u.status==="u_cancel"||u.status==="u_closed")return;const w=winners(u);
w.forEach(c=>{if(!c.assigned){db.doc("claims/"+c.id).update({assigned:true}).catch(()=>{});
db.doc(`${ws(c.by,"tasks")}/${uuid()}`).set({title:"⚡ "+u.title,details:[u.details,u.location&&("📍 "+u.location),u.terms].filter(Boolean).join("\n"),due:(u.exec||"").slice(0,10)||dstr(0),priority:"p_h",status:"s_new",progress:0,project:u.project||"",jobTitle:projName(u.project),value:+u.pay||0,urgent:u.id,at:Date.now()}).catch(()=>{});
sysMsg(c.by,t("urgentWon").replace("{t}",u.title));log("urgent_assign",u.title+" → "+nm(c.by))}});
if(w.length>=(+u.need||1)&&u.status==="u_open")db.doc("urgent/"+u.id).update({status:"u_full"}).catch(()=>{})})}

function renderV3(a,top){
if(view==="o_ops"){const all=allTasks();const free=team().filter(m=>(m.avail||"av_free")==="av_free"),field=team().filter(m=>m.avail==="av_mission");
a.innerHTML=`<div class="grid">
<div class="card stat"><b>${all.filter(x=>x.status!=="s_done").length}</b><span>${t("open")}</span></div>
<div class="card stat"><b style="color:var(--bad)">${all.filter(isLate).length}</b><span>${t("late")}</span></div>
<div class="card stat"><b style="color:var(--bad)">${urgent.filter(u=>u.status==="u_open").length}</b><span>${t("liveUrgent")}</span></div>
<div class="card stat"><b style="color:var(--ok)">${free.length}</b><span>${t("liveFree")}</span></div>
<div class="card stat"><b style="color:var(--warn)">${field.length}</b><span>${t("liveField")}</span></div>
<div class="card stat"><b>${projects.filter(p=>p.status!=="paused").length}</b><span>${t("liveProj")}</span></div></div>
<h2>${t("o_team")}</h2><table><tr><th></th><th>${t("assignee")}</th><th>${t("myStatus")}</th><th>${t("open")}</th><th>${t("late")}</th></tr>${team().map(m=>{const tk=(W[m.id]||{}).tasks||[];
return`<tr><td><div class="av">${esc(ini(m.id))}</div></td><td><b>${esc(nm(m.id))}</b><div class="mute">${esc(m.specialty||"")}</div></td><td><span class="tag ${avColor(m.avail||"av_free")}">${t(m.avail||"av_free")}</span></td><td>${tk.filter(x=>x.status!=="s_done").length}</td><td style="color:var(--bad)">${tk.filter(isLate).length}</td></tr>`}).join("")}</table>
<h2>${t("o_urgent")}</h2>${urgentList(true)}<div class="alert info" style="margin-top:14px">🗺 ${t("noMap")}</div>`}

else if(view==="o_proj"){top(`<button class="b pri" id="np">+ ${t("add")}</button>`);const all=allTasks();
a.innerHTML=projects.length?`<div class="col3">${projects.slice().sort((a,b)=>(a.order||0)-(b.order||0)).map(p=>{const pj=jobs.filter(j=>j.project===p.id),pt=all.filter(x=>x.project===p.id||pj.some(j=>j.id===x.job));
const rev=pj.reduce((s,j)=>s+(+j.value||0),0);const exp=Object.values(W).flatMap(w=>w.money||[]).filter(m=>m.kind==="k_exp"&&m.state==="ok"&&m.project===p.id).reduce((s,m)=>s+(+m.amount||0),0);
const com=Object.values(W).flatMap(w=>w.pay||[]).filter(x=>x.type==="pt_comm"&&x.project===p.id&&x.status!=="ps_cancel").reduce((s,x)=>s+(+x.amount||0),0);
return`<div class="card" style="border-top:4px solid ${esc(p.color||"var(--sand)")}"><div class="row"><b style="font-size:16px">${esc(p.name)}</b><span class="grow"></span><span class="tag ${p.status==="paused"?"bad":"ok"}">${t(p.status==="paused"?"paused":"active")}</span></div>
<div class="mute">${esc(p.desc||"")}</div><div class="mute">${t("manager")}: ${esc(p.manager?nm(p.manager):"—")}</div>
<div class="grid" style="grid-template-columns:repeat(2,1fr);gap:6px;margin-top:10px;font-size:13px"><div>${t("o_jobs")}: <b>${pj.length}</b></div><div>${t("tasksN")}: <b>${pt.filter(x=>x.status!=="s_done").length}</b></div>
<div>${t("revenue")}: <b>${money(rev)}</b></div><div>${t("expenses")}: <b>${money(exp)}</b></div><div>${t("comms")}: <b>${money(com)}</b></div><div style="color:${rev-exp-com<0?"var(--bad)":"var(--ok)"}">= <b>${money(rev-exp-com)}</b></div></div>
<div class="row" style="margin-top:10px"><button class="b sm" data-ep="${p.id}">${t("edit")}</button></div></div>`}).join("")}</div>`:empty();
$("#np").onclick=()=>projForm()}

else if(view==="o_urgent"){top(`<button class="b pri" id="nu">⚡ ${t("publish")}</button>`);a.innerHTML=urgentList(true);$("#nu").onclick=urgentForm}
else if(view==="e_urgent"){a.innerHTML=urgentList(false)}

else if(view==="o_pay"){top(`<select id="pm" style="width:auto"><option value="">${t("pickMember")}</option>${team().map(m=>`<option value="${m.id}" ${m.id===selMember?"selected":""}>${esc(nm(m.id))}</option>`).join("")}</select> <button class="b pri" id="ap">+ ${t("addPay")}</button>`);
const ready=allTasks().filter(x=>x.status==="s_done"&&+x.commPct>0&&+x.value>0&&!((W[x._m]||{}).pay||[]).some(p=>p.task===x.id));
const rows=Object.entries(W).flatMap(([id,w])=>(w.pay||[]).map(p=>({...p,_m:id}))).filter(p=>!selMember||p._m===selMember).sort((a,b)=>(b.at||0)-(a.at||0));
const due=rows.filter(p=>!["ps_paid","ps_cancel"].includes(p.status)&&p.type!=="pt_ded").reduce((s,p)=>s+(+p.amount||0)-(+p.paid||0),0);
a.innerHTML=`<div class="grid"><div class="card stat"><b style="color:var(--warn)">${money(due)}</b><span>${t("totalDue")}</span></div><div class="card stat"><b style="color:var(--ok)">${money(rows.reduce((s,p)=>s+(+p.paid||0),0))}</b><span>${t("totalPaid")}</span></div></div>
${ready.length?`<h2>${t("commDue")}</h2>${ready.map(x=>`<div class="alert warn"><b>${esc(x.title)}</b><span class="mute">${esc(nm(x._m))} · ${money(x.value)} × ${+x.commPct}% = <b>${money(x.value*x.commPct/100)}</b></span><span class="grow"></span><button class="b sm gold" data-cc="${x._m}|${x.id}">${t("createComm")}</button></div>`).join("")}`:""}
<h2>${t("o_pay")}</h2>${payTable(rows,true)}`;
$("#pm").onchange=e=>{selMember=e.target.value;render()};$("#ap").onclick=()=>payForm()}
else if(view==="e_pay"){const rows=(myW().pay||[]).map(p=>({...p,_m:uid}));const due=rows.filter(p=>!["ps_paid","ps_cancel"].includes(p.status)&&p.type!=="pt_ded").reduce((s,p)=>s+(+p.amount||0)-(+p.paid||0),0);
a.innerHTML=`<div class="grid"><div class="card stat"><b style="color:var(--warn)">${money(due)}</b><span>${t("totalDue")}</span></div><div class="card stat"><b style="color:var(--ok)">${money(rows.reduce((s,p)=>s+(+p.paid||0),0))}</b><span>${t("totalPaid")}</span></div></div><h2>${t("e_pay")}</h2>${payTable(rows,false)}`}

else if(view==="o_ai"){a.innerHTML=`<div class="card empty">✧ ${t("aiNA")}</div>`}

else if(view==="o_audit"){a.innerHTML=audit.length?`<table><tr><th>${t("time")}</th><th>${t("user_")}</th><th>${t("action")}</th><th>${t("details")}</th></tr>${audit.slice().sort((a,b)=>b.at-a.at).slice(0,300).map(r=>`<tr><td class="mute">${fmt(r.at)}</td><td>${esc(nm(r.by))}</td><td><span class="tag">${esc(r.action)}</span></td><td>${esc(r.detail)}</td></tr>`).join("")}</table>`:empty()}

else if(view==="o_set"){a.innerHTML=`<div class="card" style="margin-bottom:14px"><b>روابط صفحة الدخول</b><div class="grid" style="margin-top:10px"><label>انستقرام<input id="lk_ig" dir="ltr" placeholder="https://instagram.com/..."></label><label>قوقل ماب<input id="lk_map" dir="ltr" placeholder="https://maps.app.goo.gl/..."></label><label>واتساب<input id="lk_wa" dir="ltr" placeholder="968xxxxxxxx"></label><label>البطاقة الرقمية<input id="lk_card" dir="ltr" placeholder="https://..."></label></div><button class="b gold" id="lk_save" style="margin-top:10px">حفظ الروابط</button></div><div class="card"><label>${t("forced")}<select id="fth"><option value="">${t("noForce")}</option>${Object.keys(THEMES).map(k=>`<option value="${k}" ${settings.forced===k?"selected":""}>${t(k)}</option>`).join("")}</select></label></div>`+themePicker();
SB.from("docs").select("data").eq("path","settings/links").maybeSingle().then(({data})=>{const d=(data&&data.data)||{};["ig","map","wa","card"].forEach(k=>{const i=$("#lk_"+k);if(i)i.value=d[k]||""})});
$("#lk_save").onclick=()=>db.doc("settings/links").set({ig:$("#lk_ig").value.trim(),map:$("#lk_map").value.trim(),wa:$("#lk_wa").value.trim(),card:$("#lk_card").value.trim()}).then(()=>{toast("تم حفظ الروابط",1);log("links","update")}).catch(err);
$("#fth").onchange=e=>db.doc("settings/theme").set({forced:e.target.value}).then(()=>log("theme_forced",e.target.value||"none")).catch(err);bindTheme()}
bind();bindV3()}

const themePicker=()=>`<h2>${t("theme")}</h2><div class="row">${Object.keys(THEMES).map(k=>`<button class="b ${activeTheme()===k?"pri":""}" data-th="${k}" ${settings.forced&&settings.forced!==k?"disabled":""}><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${THEMES[k].petrol};border:2px solid ${THEMES[k].sand}"></span> ${t(k)}</button>`).join("")}</div><div class="mute" style="margin-top:6px;color:#cfe0e0">${t("activeTheme")}: ${t(activeTheme())}${settings.forced?" 🔒":""}</div>`;
function bindTheme(){document.querySelectorAll("[data-th]").forEach(b=>b.onclick=()=>{try{localStorage.setItem("evx_theme",b.dataset.th)}catch(e){}applyTheme();render()})}

function urgentList(own){const list=urgent.filter(u=>own||u.status==="u_open"||claimsOf(u.id).some(c=>c.by===uid)).sort((a,b)=>(a.status!=="u_open")-(b.status!=="u_open")||b.at-a.at);
if(!list.length)return empty();
return`<div class="col3">${list.map(u=>{const cl=claimsOf(u.id),w=winners(u),mineC=cl.find(c=>c.by===uid),won=w.some(c=>c.by===uid),full=w.length>=(+u.need||1);
const st=u.status==="u_open"&&full?"u_full":u.status;
return`<div class="card" style="border-inline-start:4px solid ${st==="u_open"?"var(--bad)":"var(--line)"}"><div class="row"><span class="tag ${st==="u_open"?"bad":st==="u_full"?"ok":""}">${t(st)}</span>${u.project?`<span class="tag gold">${esc(projName(u.project))}</span>`:""}<span class="grow"></span><b>${Math.min(w.length,+u.need||1)}/${+u.need||1}</b></div>
<h3 style="margin:8px 0 4px;font-size:16px">⚡ ${esc(u.title)}</h3><div class="mute" style="white-space:pre-wrap">${esc(u.details)}</div>
<div class="mute" style="margin-top:6px">${u.specialty?`🛠 ${esc(u.specialty)} · `:""}${u.location?`📍 ${esc(u.location)} · `:""}${u.exec?`◷ ${esc(u.exec.replace("T"," "))}`:""}</div>
<div class="mute">${u.pay?`${t("pay")}: <b>${money(u.pay)}</b>`:""} ${u.deadline?` · ${t("deadline")}: ${esc(u.deadline.replace("T"," "))}`:""}</div>${u.terms?`<div class="mute">📋 ${esc(u.terms)}</div>`:""}
${own?`<div class="mute" style="margin-top:6px">${t("acceptedBy")}: ${w.map(c=>esc(nm(c.by))).join("، ")||"—"}</div><div class="row" style="margin-top:8px">
${u.status==="u_open"?`<button class="b sm" data-us="${u.id}|u_closed">${t("close_")}</button>`:`<button class="b sm" data-us="${u.id}|u_open">${t("reopen")}</button>`}<button class="b sm" data-us="${u.id}|u_cancel">${t("cancelJob")}</button></div>`
:won?`<div class="alert info" style="margin-top:8px">✓ ${t("youWon")}</div>`:mineC?`<div class="alert warn" style="margin-top:8px">${t("tooLate")}</div>`
:st==="u_open"&&!(u.deadline&&u.deadline<new Date().toISOString().slice(0,16))?`<button class="b gold" style="width:100%;margin-top:10px" data-acc="${u.id}">${t("accept")}</button>`:`<div class="mute" style="margin-top:8px">${t("tooLate")}</div>`}</div>`}).join("")}</div>`}

const payTable=(rows,own)=>rows.length?`<table><tr><th>${t("payType")}</th>${own?`<th>${t("assignee")}</th>`:""}<th>${t("details")}</th><th>${t("amount")}</th><th>${t("paid")}</th><th>${t("remaining")}</th><th>${t("status")}</th>${own?"<th></th>":""}</tr>${rows.map(p=>{const rem=(+p.amount||0)-(+p.paid||0);
return`<tr><td><span class="tag ${p.type==="pt_ded"?"bad":p.type==="pt_comm"?"gold":""}">${t(p.type)}</span></td>${own?`<td>${esc(nm(p._m))}</td>`:""}<td>${esc(p.note||"")}${p.project?`<div class="mute">${esc(projName(p.project))}</div>`:""}${p.due?`<div class="mute">${t("dueDate")}: ${esc(p.due)}</div>`:""}</td>
<td>${money(p.amount)}</td><td>${money(p.paid)}</td><td>${money(rem)}</td><td><span class="tag ${p.status==="ps_paid"?"ok":p.status==="ps_cancel"?"bad":"warn"}">${t(p.status||"ps_calc")}</span></td>
${own?`<td style="white-space:nowrap"><select data-pst="${p._m}|${p.id}" style="width:auto;padding:4px">${["ps_calc","ps_due","ps_ok","ps_part","ps_paid","ps_cancel"].map(s=>`<option value="${s}" ${s===(p.status||"ps_calc")?"selected":""}>${t(s)}</option>`).join("")}</select> <button class="b sm" data-ppay="${p._m}|${p.id}">${t("recordPay")}</button></td>`:""}</tr>`}).join("")}</table>`:empty();

function bindV3(){const a=$("#app");
a.querySelectorAll("[data-ep]").forEach(b=>b.onclick=()=>projForm(projects.find(p=>p.id===b.dataset.ep)));
a.querySelectorAll("[data-us]").forEach(b=>b.onclick=()=>{const[id,s]=b.dataset.us.split("|");db.doc("urgent/"+id).update({status:s}).then(()=>log("urgent_status",s)).catch(err)});
a.querySelectorAll("[data-acc]").forEach(b=>b.onclick=()=>{b.disabled=true;db.doc(`claims/${b.dataset.acc}_${uid}`).set({job:b.dataset.acc,by:uid,at:Date.now()}).then(()=>toast(t("accepted"),1)).catch(err)});
a.querySelectorAll("[data-cc]").forEach(b=>b.onclick=()=>{const[m,id]=b.dataset.cc.split("|");const x=W[m].tasks.find(x=>x.id===id);
db.doc(`${ws(m,"pay")}/${uuid()}`).set({type:"pt_comm",task:id,project:x.project||"",note:`${x.title} — ${money(x.value)} × ${x.commPct}%`,amount:+(x.value*x.commPct/100).toFixed(3),paid:0,status:"ps_due",at:Date.now()}).then(()=>{log("commission_created",`${nm(m)}: ${x.title}`);sysMsg(m,`${t("pt_comm")}: ${x.title}`)}).catch(err)});
a.querySelectorAll("[data-pst]").forEach(s=>s.onchange=()=>{const[m,id]=s.dataset.pst.split("|");db.doc(`${ws(m,"pay")}/${id}`).update({status:s.value}).then(()=>log("pay_status",`${nm(m)}: ${t(s.value)}`)).catch(err)});
a.querySelectorAll("[data-ppay]").forEach(b=>b.onclick=()=>{const[m,id]=b.dataset.ppay.split("|");const p=W[m].pay.find(x=>x.id===id);
openDlg(t("recordPay"),`<label>${t("amount")}<input name="v" type="number" step="0.001" min="0" required value="${money((+p.amount||0)-(+p.paid||0))}"></label>`,fd=>{const paid=+(((+p.paid||0)+(+fd.get("v")||0)).toFixed(3));
const st=paid>=(+p.amount||0)?"ps_paid":"ps_part";db.doc(`${ws(m,"pay")}/${id}`).update({paid,status:st,paidAt:Date.now()}).then(()=>{log("payment",`${nm(m)}: +${fd.get("v")}`);sysMsg(m,`${t("recordPay")}: ${money(fd.get("v"))} — ${p.note||t(p.type)}`)}).catch(err)})})}

function projForm(p){p=p||{status:"active",color:"#C9A45C"};
openDlg(p.id?t("edit"):t("add"),`<label>${t("title")}<input name="name" required value="${esc(p.name)}"></label><label>${t("details")}<textarea name="desc">${esc(p.desc)}</textarea></label>
<div class="row"><label class="grow">${t("manager")}<select name="manager"><option value="">—</option>${members.map(m=>`<option value="${m.id}" ${m.id===p.manager?"selected":""}>${esc(nm(m.id))}</option>`).join("")}</select></label>
<label class="grow">${t("status")}<select name="status"><option value="active" ${p.status!=="paused"?"selected":""}>${t("active")}</option><option value="paused" ${p.status==="paused"?"selected":""}>${t("paused")}</option></select></label>
<label style="width:90px">🎨<input type="color" name="color" value="${esc(p.color||"#C9A45C")}" style="padding:2px;height:40px"></label></div>`,
fd=>{const d=Object.fromEntries(fd);(p.id?db.doc("projects/"+p.id).update(d):db.doc("projects/"+uuid()).set({...d,order:projects.length+1,at:Date.now()})).then(()=>log(p.id?"project_edit":"project_add",d.name)).catch(err)})}

function urgentForm(){openDlg(t("publish"),`<label>${t("title")}<input name="title" required></label><label>${t("details")}<textarea name="details"></textarea></label>
<div class="row"><label class="grow">${t("project")}<select name="project"><option value="">—</option>${projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label><label class="grow">${t("specialty")}<input name="specialty"></label></div>
<div class="row"><label class="grow">${t("need")}<input name="need" type="number" min="1" value="1" required></label><label class="grow">${t("pay")}<input name="pay" type="number" step="0.001" min="0"></label></div>
<label>${t("location")}<input name="location"></label><div class="row"><label class="grow">${t("execTime")}<input name="exec" type="datetime-local" required></label><label class="grow">${t("deadline")}<input name="deadline" type="datetime-local"></label></div>
<label>${t("terms")}<input name="terms"></label>`,fd=>{const d=Object.fromEntries(fd);d.need=Math.max(1,+d.need||1);const id=uuid();
db.doc("urgent/"+id).set({...d,status:"u_open",at:Date.now()}).then(()=>{log("urgent_publish",d.title);
team().filter(m=>!["av_leave","av_off"].includes(m.avail)).forEach(m=>sysMsg(m.id,t("urgentNew").replace("{t}",d.title)))}).catch(err)},"⚡ "+t("publish"))}

function payForm(){openDlg(t("addPay"),`<label>${t("assignee")}<select name="m" required>${team().map(m=>`<option value="${m.id}" ${m.id===selMember?"selected":""}>${esc(nm(m.id))}</option>`).join("")}</select></label>
<div class="row"><label class="grow">${t("payType")}<select name="type">${opt(["pt_salary","pt_comm","pt_bonus","pt_ded"])}</select></label><label class="grow">${t("amount")}<input name="amount" type="number" step="0.001" min="0" required></label></div>
<div class="row"><label class="grow">${t("project")}<select name="project"><option value="">—</option>${projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label><label class="grow">${t("dueDate")}<input name="due" type="date" value="${dstr(0)}"></label></div>
<label>${t("details")}<input name="note"></label>`,fd=>{const d=Object.fromEntries(fd);const m=d.m;delete d.m;d.amount=+d.amount||0;
db.doc(`${ws(m,"pay")}/${uuid()}`).set({...d,paid:0,status:"ps_due",at:Date.now()}).then(()=>log("pay_add",`${nm(m)}: ${t(d.type)} ${money(d.amount)}`)).catch(err)})}

/* ===== v4: board ===== */
Object.assign(T.ar,{o_board:"الأسئلة والنقاشات",e_board:"الأسئلة والنقاشات",q_question:"سؤال",q_idea:"فكرة",q_discuss:"نقاش",q_remind:"تذكير",b_open:"مفتوح",b_answered:"تمت الإجابة",b_later:"مؤجل",b_done:"منتهي",
scope:"لمن؟",sc_me:"خاص بي فقط",sc_team:"الفريق كله",sc_person:"شخص محدد",sc_mgmt:"للإدارة",answer:"الإجابة / القرار",remindOn:"ذكّرني في",replies:"الردود",writeReply:"اكتب رداً…",newItem:"إضافة جديدة",
f_all:"الكل",f_open:"المفتوحة",f_mine:"الخاصة بي",f_team:"الفريق",remindDue:"تذكير مستحق",privateTag:"خاص",teamTag:"للفريق",forTag:"إلى",from:"من"});
Object.assign(T.en,{o_board:"Questions & discussions",e_board:"Questions & discussions",q_question:"Question",q_idea:"Idea",q_discuss:"Discussion",q_remind:"Reminder",b_open:"Open",b_answered:"Answered",b_later:"Later",b_done:"Done",
scope:"Who sees it?",sc_me:"Only me",sc_team:"Whole team",sc_person:"One person",sc_mgmt:"Management",answer:"Answer / decision",remindOn:"Remind me on",replies:"Replies",writeReply:"Write a reply…",newItem:"Add new",
f_all:"All",f_open:"Open",f_mine:"Private",f_team:"Team",remindDue:"Reminder due",privateTag:"Private",teamTag:"Team",forTag:"To",from:"From"});
Object.assign(ICON,{o_board:"❖",e_board:"❖"});
let board=[],replies=[],bFilter="f_open",bOpen=null;
