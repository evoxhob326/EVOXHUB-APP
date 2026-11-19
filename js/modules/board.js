const QK=["q_question","q_idea","q_discuss","q_remind"],BS=["b_open","b_answered","b_later","b_done"];
function boardItems(){const team_=board.map(x=>({...x,_path:"board/"+x.id,_scope:"sc_team"}));
const ws_=Object.entries(W).flatMap(([id,w])=>(w.board||[]).map(x=>({...x,_path:`${ws(id,"board")}/${x.id}`,_scope:id===uid&&x.by===uid?"sc_me":"sc_person",_owner:id})));
return[...team_,...ws_].sort((a,b)=>(a.status==="b_done")-(b.status==="b_done")||(b.at||0)-(a.at||0))}
function renderBoard(a,top){top(`<button class="b pri" id="nb">+ ${t("newItem")}</button>`);
let list=boardItems();const td=dstr(0);
if(bFilter==="f_open")list=list.filter(x=>!["b_done","b_answered"].includes(x.status));if(bFilter==="f_mine")list=list.filter(x=>x._scope==="sc_me");if(bFilter==="f_team")list=list.filter(x=>x._scope==="sc_team");
const due=boardItems().filter(x=>x.remindOn&&x.remindOn<=td&&x.status!=="b_done");
a.innerHTML=`${due.map(x=>`<div class="alert warn">⏰ ${t("remindDue")}: <b>${esc(x.title)}</b></div>`).join("")}
<div class="row" style="margin-bottom:12px">${["f_open","f_all","f_mine","f_team"].map(f=>`<button class="b ${f===bFilter?"pri":""}" data-bf="${f}">${t(f)}</button>`).join("")}</div>
${list.length?`<div class="col3">${list.map(x=>{const rs=[...replies,...Object.values(W).flatMap(w=>w.replies||[])].filter(r=>r.item===x._path);const open=bOpen===x._path;
return`<div class="card" style="border-top:3px solid ${x.kind==="q_question"?"var(--sand)":x.kind==="q_idea"?"var(--ok)":x.kind==="q_remind"?"var(--warn)":"var(--petrol3)"}">
<div class="row"><span class="tag gold">${t(x.kind)}</span><span class="tag ${x.status==="b_done"||x.status==="b_answered"?"ok":x.status==="b_later"?"warn":""}">${t(x.status||"b_open")}</span><span class="grow"></span><span class="tag">${x._scope==="sc_team"?t("teamTag"):x._scope==="sc_me"?"🔒 "+t("privateTag"):(x.by===uid?t("forTag")+" "+esc(nm(x._owner)):t("from")+" "+esc(nm(x.by)))}</span></div>
<h3 style="margin:8px 0 4px;font-size:15px">${esc(x.title)}</h3>${x.body?`<div style="white-space:pre-wrap" class="mute">${esc(x.body)}</div>`:""}
${x.answer?`<div class="alert info" style="margin-top:8px">✓ ${esc(x.answer)}</div>`:""}
<div class="row mute" style="margin-top:6px"><span>${esc(nm(x.by))} · ${fmt(x.at)}</span>${x.remindOn?`<span>⏰ ${esc(x.remindOn)}</span>`:""}</div>
<div class="row" style="margin-top:8px"><button class="b sm" data-bo="${x._path}">💬 ${t("replies")} (${rs.length})</button>${(ADMIN||x.by===uid)?`<button class="b sm" data-be="${x._path}">${t("edit")}</button>`:""}</div>
${open?`<div style="margin-top:10px;border-top:1px solid var(--line);padding-top:8px">${rs.sort((a,b)=>a.at-b.at).map(r=>`<div style="margin-bottom:6px"><b>${esc(nm(r.by))}</b> <span class="mute">${fmt(r.at)}</span><div style="white-space:pre-wrap">${esc(r.body)}</div></div>`).join("")}
<form class="row" data-rf="${x._path}"><input name="b" required placeholder="${t("writeReply")}" style="flex:1;width:auto"><button class="b sm pri">${t("send")}</button></form></div>`:""}</div>`}).join("")}</div>`:empty()}`;
$("#nb").onclick=()=>boardForm();
a.querySelectorAll("[data-bf]").forEach(b=>b.onclick=()=>{bFilter=b.dataset.bf;render()});
a.querySelectorAll("[data-bo]").forEach(b=>b.onclick=()=>{bOpen=bOpen===b.dataset.bo?null:b.dataset.bo;render()});
a.querySelectorAll("[data-be]").forEach(b=>b.onclick=()=>boardForm(boardItems().find(x=>x._path===b.dataset.be)));
a.querySelectorAll("[data-rf]").forEach(f=>f.onsubmit=e=>{e.preventDefault();const body=f.b.value.trim();if(!body)return;
const ip=f.dataset.rf,rp=ip.startsWith("ws/")?ip.split("/").slice(0,2).join("/")+"/replies":"replies";db.collection(rp).doc(uuid()).set({item:ip,body,by:uid,at:Date.now()}).catch(err)})}
function boardForm(x){const isNew=!x;x=x||{kind:"q_question",status:"b_open"};
const scopes=ADMIN?["sc_me","sc_team","sc_person"]:["sc_me","sc_mgmt"];
openDlg(isNew?t("newItem"):t("edit"),`<div class="row"><label class="grow">${t("type")}<select name="kind">${opt(QK,x.kind)}</select></label><label class="grow">${t("status")}<select name="status">${opt(BS,x.status)}</select></label></div>
<label>${t("title")}<input name="title" required value="${esc(x.title)}"></label><label>${t("details")}<textarea name="body">${esc(x.body)}</textarea></label>
${isNew?`<div class="row"><label class="grow">${t("scope")}<select name="scope" id="bsc">${opt(scopes)}</select></label>${ADMIN?`<label class="grow" id="bpw" style="display:none">${t("assignee")}<select name="person">${team().map(m=>`<option value="${m.id}">${esc(nm(m.id))}</option>`).join("")}</select></label>`:""}</div>`:""}
<label>${t("answer")}<textarea name="answer">${esc(x.answer)}</textarea></label><label>${t("remindOn")}<input type="date" name="remindOn" value="${esc(x.remindOn)}"></label>`,
fd=>{const d=Object.fromEntries(fd);const sc=d.scope,pr=d.person;delete d.scope;delete d.person;
if(!isNew)return db.doc(x._path).update(d).catch(err);
const path=sc==="sc_team"?"board":sc==="sc_person"?ws(pr,"board"):ws(uid,"board");
db.collection(path).doc(uuid()).set({...d,by:uid,at:Date.now(),mgmt:sc==="sc_mgmt"}).then(()=>{if(sc==="sc_person")sysMsg(pr,`❖ ${d.title}`);if(sc==="sc_team")log("board_team",d.title)}).catch(err)});
const s=$("#bsc"),w=$("#bpw");if(s&&w)s.onchange=()=>w.style.display=s.value==="sc_person"?"":"none"}

/* ===== v5: clients, finance, templates ===== */
Object.assign(T.ar,{o_clients:"العملاء",o_fin:"المالية اليومية",o_tpl:"قوالب المهام",goal:"الهدف",method:"طريقة التنفيذ",checklist:"قائمة التحقق (سطر لكل بند)",checklistV:"قائمة التحقق",repeat:"التكرار",rp_none:"لا يتكرر",rp_week:"أسبوعياً",rp_month:"شهرياً",fromTpl:"من قالب",
cName:"اسم العميل",cPhone:"الهاتف",cEmail:"البريد",cCompany:"الشركة",cNotes:"ملاحظات",cExpiry:"تاريخ انتهاء (سجل/ترخيص)",cExpiryWhat:"ما الذي ينتهي؟",expSoon:"ينتهي قريباً",cFiles:"مستندات العميل",cJobs:"معاملاته",
l_income:"دخل",l_expense:"مصروف",lc_gov:"رسوم حكومية",lc_mat:"مواد وأغراض",lc_ops:"تشغيلية",lc_fixed:"ثابتة (إيجار/اشتراكات)",lc_other:"أخرى",lc_payment:"دفعة عميل",date:"التاريخ",category:"التصنيف",service:"نوع الخدمة",
expIncome:"الدخل المتوقع",todayIncome:"دخل اليوم",todayExp:"مصروفات اليوم",jobExp:"مصروفات المعاملات (الشهر)",monthNet:"صافي الشهر",byService:"الربح حسب الخدمة",addEntry:"تسجيل حركة",entries:"الحركات",fixedMonthly:"يتكرر شهرياً",well:"أحسنت!"});
Object.assign(T.en,{o_clients:"Clients",o_fin:"Daily finance",o_tpl:"Task templates",goal:"Goal",method:"How to execute",checklist:"Checklist (one item per line)",checklistV:"Checklist",repeat:"Repeat",rp_none:"No repeat",rp_week:"Weekly",rp_month:"Monthly",fromTpl:"From template",
cName:"Client name",cPhone:"Phone",cEmail:"Email",cCompany:"Company",cNotes:"Notes",cExpiry:"Expiry date (record/licence)",cExpiryWhat:"What expires?",expSoon:"Expiring soon",cFiles:"Client documents",cJobs:"Their transactions",
l_income:"Income",l_expense:"Expense",lc_gov:"Government fees",lc_mat:"Materials",lc_ops:"Operating",lc_fixed:"Fixed (rent/subscriptions)",lc_other:"Other",lc_payment:"Client payment",date:"Date",category:"Category",service:"Service type",
expIncome:"Expected income",todayIncome:"Income today",todayExp:"Expenses today",jobExp:"Transaction expenses (month)",monthNet:"Net this month",byService:"Profit by service",addEntry:"Record entry",entries:"Entries",fixedMonthly:"Repeats monthly",well:"Well done!"});
Object.assign(ICON,{o_clients:"☺",o_fin:"﷼",o_tpl:"▦"});
