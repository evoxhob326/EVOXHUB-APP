let clients=[],ledger=[],tpls=[],clientOpen=null,clientFiles=[];
const LC=["lc_payment","lc_gov","lc_mat","lc_ops","lc_fixed","lc_other"];
const monthKey=d=>(d||"").slice(0,7);
function finCards(){const td=dstr(0),mk=monthKey(td);const inc=ledger.filter(l=>l.type==="l_income"),exp=ledger.filter(l=>l.type==="l_expense");
const expected=jobs.filter(j=>j.status!=="j_done").reduce((s,j)=>s+(+j.value||0),0);
const sum=a=>a.reduce((s,l)=>s+(+l.amount||0),0);
return{expected,todayInc:sum(inc.filter(l=>l.date===td)),todayExp:sum(exp.filter(l=>l.date===td)),jobExp:sum(exp.filter(l=>monthKey(l.date)===mk&&l.job)),net:sum(inc.filter(l=>monthKey(l.date)===mk))-sum(exp.filter(l=>monthKey(l.date)===mk))}}
const finGrid=()=>{const f=finCards();return`<div class="grid">
<div class="card stat"><b>${money(f.expected)}</b><span>${t("expIncome")}</span></div>
<div class="card stat"><b style="color:var(--ok)">${money(f.todayInc)}</b><span>${t("todayIncome")}</span></div>
<div class="card stat"><b style="color:var(--bad)">${money(f.todayExp)}</b><span>${t("todayExp")}</span></div>
<div class="card stat"><b style="color:var(--warn)">${money(f.jobExp)}</b><span>${t("jobExp")}</span></div>
<div class="card stat"><b style="color:${f.net<0?"var(--bad)":"var(--ok)"}">${money(f.net)}</b><span>${t("monthNet")}</span></div></div>`};
function expiringClients(){const lim=dstr(30);return clients.filter(c=>c.expiry&&c.expiry<=lim)}
function renderV5(a,top){
if(view==="o_fin"){top(`<button class="b pri" id="ne">+ ${t("addEntry")}</button>`);
const svc={};jobs.forEach(j=>{const k=j.service||"—";svc[k]=svc[k]||{rev:0,exp:0};svc[k].rev+=+j.value||0;svc[k].exp+=ledger.filter(l=>l.type==="l_expense"&&l.job===j.id).reduce((s,l)=>s+(+l.amount||0),0)});
a.innerHTML=finGrid()+`<h2>${t("byService")}</h2>${Object.keys(svc).length?`<table><tr><th>${t("service")}</th><th>${t("revenue")}</th><th>${t("expenses")}</th><th>=</th></tr>${Object.entries(svc).sort((a,b)=>(b[1].rev-b[1].exp)-(a[1].rev-a[1].exp)).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${money(v.rev)}</td><td>${money(v.exp)}</td><td style="color:${v.rev-v.exp<0?"var(--bad)":"var(--ok)"}"><b>${money(v.rev-v.exp)}</b></td></tr>`).join("")}</table>`:empty()}
<h2>${t("entries")}</h2>${ledger.length?`<table><tr><th>${t("date")}</th><th>${t("type")}</th><th>${t("category")}</th><th>${t("details")}</th><th>${t("amount")}</th><th></th></tr>${ledger.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.at-a.at).slice(0,200).map(l=>`<tr><td>${esc(l.date)}</td><td><span class="tag ${l.type==="l_income"?"ok":"bad"}">${t(l.type)}</span></td><td>${t(l.category)}${l.monthly?" 🔁":""}</td><td>${esc(l.note)}<div class="mute">${esc(jobName(l.job))}</div></td><td><b>${money(l.amount)}</b></td><td><button class="b sm" data-del="ledger/${l.id}">${t("del")}</button></td></tr>`).join("")}</table>`:empty()}`;
$("#ne").onclick=()=>ledgerForm()}
else if(view==="o_clients"&&clientOpen){const c=clients.find(x=>x.id===clientOpen);if(!c){clientOpen=null;return render()}
top(`<button class="b" id="bk">${t("back")}</button> <button class="b" id="ec">${t("edit")}</button>`);const cj=jobs.filter(j=>j.clientId===c.id||j.client===c.name);
a.innerHTML=`<div class="card"><h3 style="margin:0 0 6px">${esc(c.name)}</h3><div class="row mute">${c.company?`<span>🏢 ${esc(c.company)}</span>`:""}${c.phone?`<a href="https://wa.me/${esc(String(c.phone).replace(/\D/g,""))}" target="_blank" rel="noopener">📱 ${esc(c.phone)}</a>`:""}${c.email?`<span>✉ ${esc(c.email)}</span>`:""}</div>
${c.expiry?`<div class="alert ${c.expiry<=dstr(30)?"warn":"info"}" style="margin-top:8px">⏰ ${esc(c.expiryWhat||"")} — ${esc(c.expiry)}</div>`:""}${c.notes?`<p style="white-space:pre-wrap">${esc(c.notes)}</p>`:""}</div>
<h2>${t("cJobs")}</h2>${cj.length?`<table><tr><th>${t("title")}</th><th>${t("status")}</th><th>${t("value")}</th></tr>${cj.map(j=>`<tr data-job="${j.id}" style="cursor:pointer"><td>${esc(j.title)}</td><td>${jTag(j.status)}</td><td>${money(j.value)}</td></tr>`).join("")}</table>`:empty()}
<h2>${t("cFiles")}</h2><div class="card"><div class="row" style="margin-bottom:10px"><input type="file" id="cf2" style="max-width:320px"><span id="cfs" class="mute"></span></div><div id="cfl">${fileList(clientFiles)}</div></div>`;
$("#bk").onclick=()=>{clientOpen=null;render()};$("#ec").onclick=()=>clientForm(c);
$("#cf2").onchange=async e=>{const f=e.target.files[0],st=$("#cfs");if(!f)return;st.textContent=t("uploading");try{const r=await assets.upload(f);await db.collection(`clients/${c.id}/files`).doc(uuid()).set({name:f.name,asset:r.id,size:r.sizeBytes,type:r.contentType||f.type,at:Date.now()});st.textContent="✓"}catch(x){st.textContent=t("noUpload")}};
a.querySelectorAll("[data-job]").forEach(b=>b.onclick=()=>{view="o_jobs";jobOpen=b.dataset.job;render()})}
else if(view==="o_clients"){top(`<input id="cq" placeholder="🔍" style="width:160px"> <button class="b pri" id="nc">+ ${t("add")}</button>`);
const q=(window._cq||"").trim();const list=clients.filter(c=>!q||[c.name,c.phone,c.company].join(" ").includes(q)).sort((a,b)=>(a.name||"").localeCompare(b.name||""));
a.innerHTML=`${expiringClients().map(c=>`<div class="alert warn">⏰ ${t("expSoon")}: <b>${esc(c.name)}</b> — ${esc(c.expiryWhat||"")} ${esc(c.expiry)}</div>`).join("")}
${list.length?`<table><tr><th>${t("cName")}</th><th>${t("cCompany")}</th><th>${t("cPhone")}</th><th>${t("cExpiry")}</th></tr>${list.map(c=>`<tr data-cl="${c.id}" style="cursor:pointer"><td><b>${esc(c.name)}</b></td><td>${esc(c.company)}</td><td>${esc(c.phone)}</td><td>${esc(c.expiry||"")}</td></tr>`).join("")}</table>`:empty()}`;
$("#cq").value=q;$("#cq").oninput=e=>{window._cq=e.target.value;render();const i=$("#cq");i.focus();i.setSelectionRange(i.value.length,i.value.length)};$("#nc").onclick=()=>clientForm();
a.querySelectorAll("[data-cl]").forEach(r=>r.onclick=()=>openClient(r.dataset.cl))}
else if(view==="o_tpl"){top(`<button class="b pri" id="nt">+ ${t("add")}</button>`);
a.innerHTML=tpls.length?`<div class="col3">${tpls.map(p=>`<div class="card"><b>${esc(p.title)}</b><div class="mute" style="white-space:pre-wrap;margin:6px 0">${esc(p.details||"")}</div>${p.goal?`<div class="mute">🎯 ${esc(p.goal)}</div>`:""}${(p.checklistText||"").trim()?`<div class="mute">☑ ${(p.checklistText||"").split("\n").filter(Boolean).length}</div>`:""}<div class="row" style="margin-top:8px"><button class="b sm" data-et="${p.id}">${t("edit")}</button><button class="b sm" data-del="templates/${p.id}">${t("del")}</button></div></div>`).join("")}</div>`:empty();
$("#nt").onclick=()=>tplForm();a.querySelectorAll("[data-et]").forEach(b=>b.onclick=()=>tplForm(tpls.find(x=>x.id===b.dataset.et)))}
bind()}
let clientFilesUnsub=null;
function openClient(id){clientOpen=id;clientFiles=[];if(clientFilesUnsub)clientFilesUnsub();clientFilesUnsub=db.collection(`clients/${id}/files`).onSnapshot(s=>{clientFiles=s.docs.map(d=>({id:d.id,...d.data()}));if(clientOpen===id&&$("#cfl"))$("#cfl").innerHTML=fileList(clientFiles)},()=>{});render()}
function clientForm(c){c=c||{};openDlg(c.id?t("edit"):t("add"),`<label>${t("cName")}<input name="name" required value="${esc(c.name)}"></label>
<div class="row"><label class="grow">${t("cPhone")}<input name="phone" value="${esc(c.phone)}" placeholder="9689xxxxxxx"></label><label class="grow">${t("cEmail")}<input name="email" type="email" value="${esc(c.email)}"></label></div>
<label>${t("cCompany")}<input name="company" value="${esc(c.company)}"></label>
<div class="row"><label class="grow">${t("cExpiryWhat")}<input name="expiryWhat" value="${esc(c.expiryWhat)}"></label><label class="grow">${t("cExpiry")}<input name="expiry" type="date" value="${esc(c.expiry)}"></label></div>
<label>${t("cNotes")}<textarea name="notes">${esc(c.notes)}</textarea></label>`,fd=>{const d=Object.fromEntries(fd);(c.id?db.doc("clients/"+c.id).update(d):db.doc("clients/"+uuid()).set({...d,at:Date.now()})).then(()=>log(c.id?"client_edit":"client_add",d.name)).catch(err)})}
function ledgerForm(){openDlg(t("addEntry"),`<div class="row"><label class="grow">${t("type")}<select name="type">${opt(["l_income","l_expense"])}</select></label><label class="grow">${t("category")}<select name="category">${opt(LC)}</select></label></div>
<div class="row"><label class="grow">${t("amount")}<input name="amount" type="number" step="0.001" min="0" required></label><label class="grow">${t("date")}<input name="date" type="date" value="${dstr(0)}" required></label></div>
<label>${t("job")}<select name="job"><option value="">${t("none")}</option>${jobs.map(j=>`<option value="${j.id}">${esc(j.title)} — ${esc(j.client)}</option>`).join("")}</select></label>
<label>${t("details")}<input name="note"></label><label style="flex-direction:row;display:flex;gap:8px;align-items:center"><input type="checkbox" name="monthly" style="width:auto"> ${t("fixedMonthly")}</label>`,
fd=>{const d=Object.fromEntries(fd);d.amount=+d.amount||0;d.monthly=!!d.monthly;db.collection("ledger").doc(uuid()).set({...d,by:uid,at:Date.now()}).then(()=>log("ledger",`${t(d.type)} ${money(d.amount)} ${t(d.category)}`)).catch(err)})}
function tplForm(p){p=p||{};openDlg(p.id?t("edit"):t("add"),`<label>${t("title")}<input name="title" required value="${esc(p.title)}"></label><label>${t("details")}<textarea name="details">${esc(p.details)}</textarea></label>
<label>${t("goal")}<input name="goal" value="${esc(p.goal)}"></label><label>${t("method")}<textarea name="method">${esc(p.method)}</textarea></label><label>${t("checklist")}<textarea name="checklistText" style="min-height:110px">${esc(p.checklistText)}</textarea></label>
<div class="row"><label class="grow">${t("priority")}<select name="priority">${opt(["p_h","p_m","p_l"],p.priority||"p_m")}</select></label><label class="grow">${t("repeat")}<select name="repeat">${opt(["rp_none","rp_week","rp_month"],p.repeat||"rp_none")}</select></label></div>`,
fd=>{const d=Object.fromEntries(fd);(p.id?db.doc("templates/"+p.id).update(d):db.doc("templates/"+uuid()).set({...d,at:Date.now()})).catch(err)})}
function processRecurring(){if(!REAL)return;Object.entries(W).forEach(([m,w])=>(w.tasks||[]).forEach(x=>{if(x.status!=="s_done"||!x.repeat||x.repeat==="rp_none"||x.nextMade)return;
const d=new Date((x.due||dstr(0))+"T12:00:00");if(x.repeat==="rp_week")d.setDate(d.getDate()+7);else d.setMonth(d.getMonth()+1);const due=d.toLocaleDateString("en-CA");
db.doc(`${ws(m,"tasks")}/${x.id}`).update({nextMade:true}).then(()=>{const{id,_m,nextMade,...rest}=x;return db.doc(`${ws(m,"tasks")}/${uuid()}`).set({...rest,due,status:"s_new",progress:0,at:Date.now(),checklist:(x.checklist||[]).map(c=>({t:c.t,done:false}))})}).then(()=>sysMsg(m,t("autoAssign").replace("{t}",x.title).replace("{d}",due))).catch(()=>{})}))}
function celebrate(){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const d=document.createElement("div");d.className="xburst";d.innerHTML=`<div>X</div><span>${t("well")}</span>`;document.body.appendChild(d);setTimeout(()=>d.remove(),1400)}

document.addEventListener("change",e=>{if(e.target.id!=="tplSel")return;const p=tpls.find(x=>x.id===e.target.value);if(!p)return;const f=$("#frm");["title","details","goal","method","checklistText","priority","repeat"].forEach(k=>{if(f.elements[k]&&p[k]!=null)f.elements[k].value=p[k]})});
