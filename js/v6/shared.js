(() => {
  const pages = new Map();
  const actions = new Map();
  const theme = { petrol: "#0B3D3F", gold: "#C9A45C", reve: "#3D1316", cream: "#F5EBC8" };
  const copy = {
    ar: { loading: "جارٍ التحميل", unavailable: "تعذّر تحميل هذا القسم. أعد المحاولة، وإذا استمر الخطأ راجع الإدارة.", migration: "تحتاج هذه الوظيفة إلى ترحيل قاعدة البيانات v6. لم تُطبّق أي تغييرات على قاعدة البيانات الحية.", save: "حفظ", cancel: "إلغاء", close: "إغلاق", search: "بحث", all: "الكل", empty: "لا توجد سجلات بعد.", today: "اليوم", week: "هذا الأسبوع", month: "هذا الشهر", ownerOnly: "هذا القسم متاح للإدارة فقط." },
    en: { loading: "Loading", unavailable: "This section could not load. Try again, then contact management if it continues.", migration: "This feature needs the v6 database migration. No changes were applied to the live database.", save: "Save", cancel: "Cancel", close: "Close", search: "Search", all: "All", empty: "No records yet.", today: "Today", week: "This week", month: "This month", ownerOnly: "This section is for management only." }
  };
  const t = key => (copy[L] || copy.ar)[key] || copy.ar[key] || key;
  const text = (ar, en) => L === "en" && en ? en : ar;
  const esc = value => window.esc ? window.esc(value) : String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = value => `${new Intl.NumberFormat(L === "ar" ? "ar-OM" : "en-OM", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(Number(value) || 0)} ر.ع`;
  const date = (value, options={}) => value ? new Intl.DateTimeFormat(L === "ar" ? "ar-OM" : "en-GB", options).format(new Date(`${String(value).slice(0,10)}T12:00:00`)) : "—";
  const today = () => new Date().toLocaleDateString("en-CA");
  const id = () => crypto.randomUUID();
  const status = key => ({s_new:text("قيد الانتظار","Upcoming"),s_prog:text("قيد التنفيذ","In progress"),s_review:text("للمراجعة","In review"),s_done:text("منجزة","Completed"),new:text("جديد","New"),studying:text("قيد الدراسة","Under review"),accepted:text("مقبول","Accepted"),converted:text("تحوّل إلى شغل","Converted"),rejected:text("مرفوض","Declined"),pending:text("بانتظار الموافقة","Pending"),active:text("مفعّل","Active"),disabled:text("موقوف","Disabled"),paid:text("مدفوعة","Paid"),unpaid:text("غير مدفوعة","Unpaid")})[key] || key || "—";
  const tag = (label, cls="") => `<span class="tag ${cls}">${esc(label)}</span>`;
  const showError = (container, error, retry) => {
    const message = error && error.message ? error.message : t("unavailable");
    if (window.EVX?.api) EVX.api.reportError(message, location.pathname + location.hash);
    container.innerHTML = `<section class="card v6-error" role="alert"><b>${esc(text("تعذّر تحميل هذا القسم","This section could not load"))}</b><p>${esc(text("راجع اتصالك أو أعد المحاولة. لم تُحذف أي بيانات.","Check your connection or try again. No data was deleted."))}</p><button class="b" data-retry>${esc(text("إعادة المحاولة","Retry"))}</button></section>`;
    const button = container.querySelector("[data-retry]"); if (button) button.onclick = retry;
    console.error("EVOXHUB section error:", message);
  };
  const toast = (message, isError=false) => window.toast ? window.toast(message, !isError) : alert(message);
  const page = ({title, subtitle="", actions="", content="", section="general"}) => {
    const header = `<div class="v6-heading"><div><div class="eyebrow">${esc(section)}</div><h2>${esc(title)} <button class="help-dot" type="button" data-help="${esc(title)}" aria-label="${esc(text("مساعدة","Help"))}">؟</button></h2>${subtitle?`<p>${esc(subtitle)}</p>`:""}</div><div class="v6-actions">${actions}</div></div>`;
    return header + content;
  };
  const button = (label, id, kind="", attrs="") => `<button type="button" class="b ${kind}" data-action="${esc(id)}" ${attrs}>${label}</button>`;
  const empty = (title, description="") => `<div class="card v6-empty"><div class="empty-icon">◇</div><b>${esc(title)}</b>${description?`<p>${esc(description)}</p>`:""}</div>`;
  const dialog = (title, body, onSave, saveLabel=t("save")) => {
    const modal = document.getElementById("dlg"), form = document.getElementById("frm");
    document.getElementById("dlgT").textContent = title;
    form.innerHTML = `${body}<div class="row v6-dialog-actions"><button class="b pri" value="ok">${esc(saveLabel)}</button><button class="b" value="cancel" formnovalidate>${esc(t("cancel"))}</button></div>`;
    form.onsubmit = async event => {
      event.preventDefault();
      if (event.submitter?.value === "cancel") { modal.close(); return; }
      const button = form.querySelector('[value="ok"]');
      button.disabled = true;
      try { await onSave(new FormData(form), form); modal.close(); }
      catch (error) { button.disabled = false; toast(error.message || t("unavailable"), true); }
    };
    modal.showModal();
  };
  const onAction = (key, handler) => actions.set(key, handler);
  const bind = container => {
    container.querySelectorAll("[data-v6-action]").forEach(element => {
      const eventName=element.matches("select,input[type=file]")?"change":element.matches("input,textarea")?"input":"click";
      element.addEventListener(eventName,event=>{const handler=actions.get(element.dataset.v6Action);if(handler)handler(event,element);});
    });
    container.querySelectorAll("[data-help]").forEach(element => element.onclick = () => { const title=element.dataset.help; const body=(window.EVX_HELP||{})[view]||text("افتح القسم المناسب، استخدم البحث لتصفية السجلات، ثم احفظ التغييرات. الصلاحيات تحدد ما يظهر لكل مستخدم.","Open the relevant section, use search to filter records, then save changes. Permissions control what each user can see."); dialog(title,`<p>${esc(body)}</p>`,async()=>{} ,t("close")); });
    container.querySelectorAll("[data-tk]").forEach(element=>element.addEventListener("click",()=>{const[memberId,taskId]=element.dataset.tk.split("|");const task=(W[memberId]?.tasks||[]).find(item=>item.id===taskId);if(task&&(ADMIN||memberId===uid))taskForm({...task,_m:memberId});}));
  };
  const accountingBrands=()=>{if(ADMIN||roles[uid]==="acc")return ["evx","reve","cc142"];const scopes=PROFILE?.brand_roles||{};return ["evx","reve","cc142"].filter(key=>["accounting","manager"].includes(scopes[key]));};
  const canAccounting=brand=>{if(ADMIN||roles[uid]==="acc")return true;const scopes=PROFILE?.brand_roles||{};return brand?["accounting","manager"].includes(scopes[brand]):accountingBrands().length>0;};
  const canBrandAccess=brand=>!!ADMIN||roles[uid]==="acc"||["employee","accounting","manager"].includes(PROFILE?.brand_roles?.[brand])||(brand==="evx"&&roles[uid]==="pm");
  window.EVX = Object.assign(window.EVX || {}, { pages, actions, theme, t, text, esc, money, date, today, id, status, tag, showError, toast, page, button, empty, dialog, bind, onAction, canAccounting, accountingBrands, canBrandAccess, registerPage(key, render){pages.set(key, render);}, currentUser(){return {id:uid,admin:ADMIN,owner:!!user?.isOwner?.(),accounting:canAccounting()};} });
})();
