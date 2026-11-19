(() => {
  const E=window.EVX,V6=window.V6=window.V6||{data:{services:[],inquiries:[],requests:[],ledger:[],team:[]},errors:{},filters:{}};
  V6.data=Object.assign({services:[],inquiries:[],requests:[],ledger:[],team:[]},V6.data||{});V6.errors=V6.errors||{};V6.filters=V6.filters||{};
  let refreshTimer=0,refreshing=false;
  V6.refresh=async()=>{
    if(refreshing)return;refreshing=true;
    const tasks=[
      ["services",()=>E.api.services.list({includeInactive:!!user?.isOwner?.()}),[]],
      ["inquiries",()=>E.api.inquiries.list(),[]],
      ["requests",()=>ADMIN?E.api.websiteRequests.list():Promise.resolve([]),[]],
      ["ledger",()=>E.api.ledger.list(),[]],
      ["team",()=>ADMIN?E.api.team.list():Promise.resolve(members),members]
    ];
    await Promise.all(tasks.map(async([key,load,fallback])=>{try{V6.data[key]=await load();V6.errors[key]=false;}catch(error){V6.data[key]=V6.data[key]||fallback;V6.errors[key]=true;console.warn(`EVOXHUB ${key} unavailable:`,error.message);}}));
    refreshing=false;return V6.data;
  };
  if(!window.__v6Realtime){window.__v6Realtime=SB.channel("v6-business-data").on("postgres_changes",{event:"*",schema:"public",table:"services"},()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>V6.refresh().then(()=>render()),250);}).on("postgres_changes",{event:"*",schema:"public",table:"inquiries"},()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>V6.refresh().then(()=>render()),250);}).on("postgres_changes",{event:"*",schema:"public",table:"website_requests"},()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>V6.refresh().then(()=>render()),250);}).on("postgres_changes",{event:"*",schema:"public",table:"ledger_entries"},()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>V6.refresh().then(()=>render()),250);}).subscribe();}
  const legacyRender=window.render;
  const navGroups=()=>{
    const work=[{key:"x_room",label:"غرفة العمليات",icon:"◉"}];if(E.canBrandAccess("evx"))work.push({key:"x_evx",label:"EVOXHUB",icon:"⬟"});if(E.canBrandAccess("reve"))work.push({key:"x_reve",label:"ريڤ · REVE",icon:"◆"});if(E.canBrandAccess("cc142"))work.push({key:"x_cc142",label:"CC142",icon:"🚘"});work.push({key:"x_inq",label:"استفسارات العملاء",icon:"؟"},{key:ADMIN?"o_jobs":"e_up",label:"الأعمال والمهام",icon:"▣"});
    if(ADMIN)work.push({key:"x_webreq",label:"طلبات الموقع",icon:"↙",badge:(V6.data.requests||[]).filter(row=>row.status==="new").length||""});
    const team=ADMIN?[{key:"x_staff",label:"الموظفون والصلاحيات",icon:"♙"},{key:"o_team",label:"ملفات وسجلات الفريق",icon:"♧"}]:[{key:"e_files",label:"مساحة عملي",icon:"▤"},{key:"e_money",label:"عروضي ومصروفاتي",icon:"◈"}];
    const admin=[];if(E.canAccounting())admin.push({key:"x_acc",label:"المحاسبة",icon:"ر"});if(ADMIN)admin.push({key:"x_catalog",label:"كتالوج الخدمات",icon:"▦"},{key:"o_clients",label:"العملاء المسجلون",icon:"♧"});
    const guide=[{key:"x_help",label:"الدليل والمساعدة",icon:"i"}];
    return [["العمل",work],["الفريق",team],...(admin.length?[["الإدارة",admin]]:[]),["الدليل",guide]];
  };
  function navMarkup(){return `<div class="logo"><b>EVO<i>X</i>HUB</b></div>${navGroups().map(([group,items],i)=>`<section class="nav-group"><button class="nav-group-title" type="button" data-navgroup="${i}" aria-expanded="true"><span>${group}</span><span class="chevron">⌄</span></button><div class="nav-group-items">${items.map(item=>`<button type="button" data-v="${item.key}" class="${view===item.key?"on":""}" ${view===item.key?'aria-current="page"':""}><span>${item.icon}</span><span>${item.label}</span>${item.badge?`<b class="nav-badge">${item.badge}</b>`:""}</button>`).join("")}</div></section>`).join("")}<button class="nav-logout" type="button" data-v="logout">↪ <span>تسجيل الخروج</span></button>`;}
  function renderSidebar(){const side=document.getElementById("side");if(!side)return;side.innerHTML=navMarkup();side.querySelectorAll("[data-v]").forEach(button=>button.onclick=()=>{const route=button.dataset.v;if(route==="logout"){SB.auth.signOut().then(()=>location.reload());return;}navigate(route);});side.querySelectorAll("[data-navgroup]").forEach(button=>button.onclick=()=>{const panel=button.nextElementSibling,expanded=button.getAttribute("aria-expanded")==="true";button.setAttribute("aria-expanded",String(!expanded));panel.hidden=expanded;});}
  function renderMobile(){const bar=document.getElementById("mobileBar");if(!bar)return;const links=ADMIN?["x_room","x_evx","x_inq","o_jobs","x_acc"]:E.canAccounting()?["x_room","x_evx","x_inq","x_acc","x_help"]:["x_room","x_evx","x_inq","e_up","x_help"],labels={x_room:["◉","الرئيسية"],x_evx:["⬟","EVOX"],x_inq:["؟","استفسارات"],o_jobs:["▣","الأعمال"],e_up:["▣","مهامي"],x_acc:["ر","المحاسبة"],x_help:["i","الدليل"]};bar.innerHTML=links.map(key=>`<button type="button" data-v="${key}" class="${view===key?"on":""}"><span>${labels[key][0]}</span>${labels[key][1]}</button>`).join("");bar.querySelectorAll("[data-v]").forEach(button=>button.onclick=()=>navigate(button.dataset.v));}
  const canNavigate=route=>route==="x_acc"?E.canAccounting():route==="x_evx"?E.canBrandAccess("evx"):route==="x_reve"?E.canBrandAccess("reve"):route==="x_cc142"?E.canBrandAccess("cc142"): ["x_catalog","x_staff","x_webreq"].includes(route)?!!ADMIN:true;
  function navigate(route){if(!canNavigate(route))return;view=route;jobOpen=null;location.hash=route;document.getElementById("shellRoot")?.classList.remove("nav-open");document.getElementById("navToggle")?.setAttribute("aria-expanded","false");render();}
  function render(){if(!db)return;if(!canNavigate(view))view="x_room";renderSidebar();renderMobile();const app=document.getElementById("app"),title=document.getElementById("ttl"),top=document.getElementById("topAct");if(!app)return;if(E.pages.has(view)){const draw=E.pages.get(view);try{app.innerHTML=draw();title.textContent=app.querySelector(".v6-heading h2")?.childNodes[0]?.textContent?.trim()||"EVOXHUB";top.innerHTML="";E.bind(app);}catch(error){E.showError(app,error,render);}}else{if(ADMIN&&!(view in {o_dash:1,o_board:1,o_fin:1,o_clients:1,o_ops:1,o_proj:1,o_jobs:1,o_tpl:1,o_team:1,o_up:1,o_urgent:1,o_msgs:1,o_req:1,o_app:1,o_pay:1,o_ai:1,o_cal:1,o_ideas:1,o_audit:1,o_set:1}))view="o_dash";if(!ADMIN&&!(view in {e_dash:1,e_board:1,e_up:1,e_urgent:1,e_msgs:1,e_files:1,e_pay:1,e_req:1,e_money:1,e_cal:1,e_ideas:1}))view="e_dash";renderSidebar();renderMobile();legacyRender?.();}const brand=document.querySelector(".top-brand");if(brand){const key=view==="x_reve"?"reve":view==="x_cc142"?"cc142":view==="x_acc"?(V6.filters.accountBrand||"evx"):"evx";brand.innerHTML=key==="reve"?`<img src="${TIGER}" alt=""><span>ريڤ · REVE</span>`:key==="cc142"?"<span class=\"cc-mark\">CC<em>142</em></span>":"EVO<i>X</i>HUB";brand.setAttribute("aria-label",key==="reve"?"ريڤ · REVE":key==="cc142"?"CC142":"EVOXHUB");}const shell=document.getElementById("shellRoot");shell?.classList.toggle("nav-open",shell.classList.contains("nav-open"));}
  window.side=renderSidebar;window.render=render;window.EVX.navigate=navigate;
  E.onAction("navigate",(_,button)=>navigate(button.dataset.route));
  const legacyBoot=window.bootApp;
  window.bootApp=async()=>{await legacyBoot?.();if(!view||view.startsWith("o_")||view.startsWith("e_"))view="x_room";const route=location.hash.slice(1);if(route&&E.pages.has(route)&&canNavigate(route))view=route;await V6.refresh();render();V6.maybeTour?.();};
  window.addEventListener("hashchange",()=>{const route=location.hash.slice(1);if(E.pages.has(route)&&canNavigate(route)){view=route;render();}});
  document.getElementById("navToggle")?.addEventListener("click",()=>{const shell=document.getElementById("shellRoot"),open=shell.classList.toggle("nav-open");document.getElementById("navToggle").setAttribute("aria-expanded",String(open));});
  document.getElementById("navShade")?.addEventListener("click",()=>{document.getElementById("shellRoot")?.classList.remove("nav-open");document.getElementById("navToggle")?.setAttribute("aria-expanded","false");});
  window.V6=V6;
})();
