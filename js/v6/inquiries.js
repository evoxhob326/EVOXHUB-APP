(() => {
  const V6=window.V6=window.V6||{data:{services:[],inquiries:[],requests:[],ledger:[]},errors:{},filters:{}};const E=window.EVX;
  const feasible={undecided:"لم يُحدّد",yes:"نعم",partial:"جزئيًا",no:"لا"};
  const brandNames={evx:"EVOXHUB",reve:"ريڤ · REVE",cc142:"CC142"};
  const serviceFor=id=>V6.data.services.find(item=>item.id===id);
  const escValue=value=>E.esc(value||"");
  function inquiryForm(row=null){
    if(!ADMIN&&!row)row={brand:"evx",assigned_to:uid};
    if(!ADMIN&&row&&row.assigned_to!==uid&&row.created_by!==uid)return E.toast("لا تملك صلاحية فتح هذا الاستفسار.",true);
    const current=row||{brand:"evx",status:"new",feasibility:"undecided",assigned_to:uid};
    const chosenService=serviceFor(current.service_id);
    const brand=current.brand||chosenService?.brand||"evx";
    const services=V6.data.services.filter(item=>item.active&&item.brand===brand);
    const docs=Array.isArray(current.required_docs)?current.required_docs.join("\n"):current.required_docs||chosenService?.default_docs?.join("\n")||"";
    const people=ADMIN?members.filter(member=>member.status!=="disabled"):[{id:uid}];
    const states=ADMIN?[["new","جديد"],["studying","قيد الدراسة"],["accepted","مقبول"],["rejected","مرفوض"],["converted","تحوّل إلى شغل"]]:[["new","جديد"],["studying","قيد الدراسة"]];
    if(current.status&&!states.some(([key])=>key===current.status))states.push([current.status,E.status(current.status)]);
    const body=`<div class="v6-form-grid"><label>اسم العميل<input name="client_name" required value="${escValue(current.client_name||current.client)}"></label><label>رقم الهاتف / واتساب<input name="phone" type="tel" dir="ltr" required value="${escValue(current.phone)}"></label><label>القسم<select name="brand" required>${Object.entries(brandNames).map(([key,name])=>`<option value="${key}" ${key===brand?"selected":""}>${name}</option>`).join("")}</select></label><label>الخدمة من الكتالوج<select name="service_id" required>${services.map(item=>`<option value="${item.id}" ${item.id===current.service_id?"selected":""}>${escValue(item.name_ar)}</option>`).join("")}</select></label><label class="full">ماذا يطلب العميل؟<textarea name="request" required>${escValue(current.request||current.details)}</textarea></label><label>إمكانية التنفيذ<select name="feasibility">${Object.entries(feasible).map(([key,label])=>`<option value="${key}" ${key===(current.feasibility||"undecided")?"selected":""}>${label}</option>`).join("")}</select></label><label>سبب التقييم<input name="feasibility_reason" value="${escValue(current.feasibility_reason)}"></label><label class="full">المطلوب أو المستندات<textarea name="required_docs" data-docs>${escValue(docs)}</textarea><small class="v6-muted" data-doc-hint>${chosenService?.needs_verification?"⚠ تحتاج الخدمة إلى تحقق قبل تأكيد المتطلبات.":"راجع المتطلبات مع العميل قبل البدء."}</small></label><label>الموارد اللازمة<textarea name="resources">${escValue(current.resources)}</textarea></label><label>الهدف من العمل<textarea name="goal">${escValue(current.goal)}</textarea></label><label>تقدير أتعاب الخدمة (ر.ع)<input type="number" min="0" step="0.001" name="estimated_fee" value="${escValue(current.estimated_fee)}"></label><label>الرسوم الحكومية منفصلة<input name="government_fee_note" value="${escValue(current.government_fee_note)}" placeholder="تُحدّد من الجهة المختصة"></label><label>الموعد المطلوب<input type="date" name="due" value="${escValue(current.due)}"></label><label>المسؤول<select name="assigned_to" ${ADMIN?"":"disabled"}>${people.map(person=>`<option value="${person.id}" ${(person.id===(current.assigned_to||current.created_by))?"selected":""}>${escValue(nm(person.id))}</option>`).join("")}</select>${!ADMIN?`<input type="hidden" name="assigned_to" value="${uid}">`:""}</label><label>الحالة<select name="status" ${ADMIN?"":"disabled"}>${states.map(([key,label])=>`<option value="${key}" ${key===(current.status||"new")?"selected":""}>${label}</option>`).join("")}</select>${!ADMIN?`<input type="hidden" name="status" value="${current.status||"new"}">`:""}</label></div><div class="v6-note">لا تُضاف الرسوم الحكومية إلى أتعاب الخدمة. الأسعار تقديرية وتُحدّد لكل طلب.</div>`;
    E.dialog(current.id?"تعديل الاستفسار":"استفسار عميل جديد",body,async form=>{
      const data=Object.fromEntries(form.entries());
      data.service_name=serviceFor(data.service_id)?.name_ar||"";data.brand=data.brand||brand;
      data.required_docs=data.required_docs.split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
      data.estimated_fee=data.estimated_fee===""?null:Number(data.estimated_fee);
      data.assigned_to=data.assigned_to||uid;
      if(current.id)await E.api.inquiries.update(current.id,data);else await E.api.inquiries.create(data);
      await V6.refresh();E.toast("حُفظ الاستفسار.");render();
    });
    const form=document.getElementById("frm");
    form.querySelector('[name="brand"]').onchange=event=>{
      const options=V6.data.services.filter(item=>item.active&&item.brand===event.target.value);
      const select=form.querySelector('[name="service_id"]');select.innerHTML=options.map(item=>`<option value="${item.id}">${escValue(item.name_ar)}</option>`).join("");
      if(options[0])fillDocs(options[0]);
    };
    form.querySelector('[name="service_id"]').onchange=event=>{const item=serviceFor(event.target.value);if(item)fillDocs(item);};
    function fillDocs(item){form.querySelector('[data-docs]').value=(item.default_docs||[]).join("\n");form.querySelector('[data-doc-hint]').textContent=item.needs_verification?"⚠ تحتاج الخدمة إلى تحقق قبل تأكيد المتطلبات.":(item.default_docs?.length?"أُدرجت المستندات المقترحة من الكتالوج.":"لا توجد مستندات افتراضية في الكتالوج؛ حدّد المطلوب بعد مراجعة العميل.");}
  }
  function feasibilityTag(value){const labels={undecided:"لم يُحدّد",yes:"نعم",partial:"جزئيًا",no:"لا"};return`<span class="v6-feasibility ${value===`yes`?"yes":value===`partial`?"partial":value===`no`?"no":""}">${labels[value]||labels.undecided}</span>`;}
  function renderInquiries(){
    const rows=(V6.data.inquiries||[]).filter(item=>!V6.filters.inquiryBrand||V6.filters.inquiryBrand==="all"||item.brand===V6.filters.inquiryBrand).filter(item=>{const query=(V6.filters.inquirySearch||"").toLowerCase();return !query||[item.client_name,item.phone,item.service_name,item.request].join(" ").toLowerCase().includes(query);}).sort((a,b)=>String(b.created_at||b.at||"").localeCompare(String(a.created_at||a.at||"")));
    const body=rows.length?`<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>العميل</th><th>القسم / الخدمة</th><th>إمكانية التنفيذ</th><th>المسؤول</th><th>الموعد</th><th>الحالة</th><th>الإجراءات</th></tr></thead><tbody>${rows.map(row=>{const service=serviceFor(row.service_id);return`<tr><td><b>${escValue(row.client_name||row.client||"—")}</b><div class="v6-muted" dir="ltr">${escValue(row.phone)}</div></td><td>${brandNames[row.brand]||"EVOXHUB"}<div class="v6-muted">${escValue(row.service_name||service?.name_ar||"—")}</div></td><td>${feasibilityTag(row.feasibility)}</td><td>${escValue(nm(row.assigned_to||row.created_by))}</td><td>${escValue(row.due||"—")}</td><td>${E.tag(E.status(row.status))}</td><td><div class="v6-row-actions"><button class="b sm" data-v6-action="inquiry-edit" data-id="${row.id}">فتح</button>${ADMIN&&row.status!=="converted"&&row.status!=="rejected"?`<button class="b sm pri" data-v6-action="inquiry-convert" data-id="${row.id}">تحويل إلى شغل</button>`:""}${ADMIN?`<button class="b sm" data-v6-action="inquiry-quote" data-id="${row.id}">عرض سعر</button>`:""}${row.phone?`<a class="b sm wa" target="_blank" rel="noopener" href="https://wa.me/${String(row.phone).replace(/\D/g,"")}?text=${encodeURIComponent(`مرحبًا ${row.client_name||""}، بخصوص استفسارك عن ${row.service_name||service?.name_ar||"الخدمة"}.`)}">واتساب</a>`:""}</div></td></tr>`}).join("")}</tbody></table></div>`:E.empty("لا توجد استفسارات بعد.","سجّل استفسار العميل وحدّد إمكانية التنفيذ والمتطلبات والهدف.");
    return E.page({title:"استفسارات العملاء",section:"العملاء",subtitle:"قيّم الطلب، حدّد المطلوب والموارد، ثم حوّله إلى شغل أو عرض سعر.",actions:`<button class="b pri" data-v6-action="inquiry-new">+ استفسار جديد</button>`,content:`<div class="v6-filter"><select aria-label="تصفية حسب القسم" data-v6-action="inquiry-brand"><option value="all">كل الأقسام</option><option value="evx" ${V6.filters.inquiryBrand==="evx"?"selected":""}>EVOXHUB</option><option value="reve" ${V6.filters.inquiryBrand==="reve"?"selected":""}>REVE</option><option value="cc142" ${V6.filters.inquiryBrand==="cc142"?"selected":""}>CC142</option></select><input type="search" placeholder="ابحث باسم العميل أو الخدمة" value="${escValue(V6.filters.inquirySearch)}" data-v6-action="inquiry-search"></div>${V6.errors.inquiries?`<div class="v6-warning">${E.esc(E.t("migration"))}</div>`:""}${body}`});
  }
  E.registerPage("x_inq",renderInquiries);
  E.onAction("inquiry-new",()=>inquiryForm());
  E.onAction("inquiry-edit",(_,button)=>{const row=V6.data.inquiries.find(item=>item.id===button.dataset.id);if(row)inquiryForm(row);});
  E.onAction("inquiry-brand",(_,select)=>{V6.filters.inquiryBrand=select.value;render();});
  E.onAction("inquiry-search",(_,input)=>{V6.filters.inquirySearch=input.value;const cursor=input.selectionStart;render();const next=document.querySelector('[data-v6-action="inquiry-search"]');next?.focus();next?.setSelectionRange(cursor,cursor);});
  E.onAction("inquiry-quote",(_,button)=>{
    if(!ADMIN)return E.toast("عرض السعر متاح للإدارة.",true);
    const row=V6.data.inquiries.find(item=>item.id===button.dataset.id);if(!row||!window.Q)return;
    Q.edit(null,row.brand||"evx");Q.cur.client=row.client_name||row.client||"";Q.cur.phone=row.phone||"";const service=serviceFor(row.service_id);Q.cur.items=[{svc:service?.name_ar||row.service_name||"",desc:row.request||row.details||"",qty:1,fee:row.estimated_fee||""}];Q.rows();document.getElementById("qc").value=Q.cur.client;document.getElementById("qph").value=Q.cur.phone;
  });
  E.onAction("inquiry-convert",async(_,button)=>{
    if(!ADMIN)return E.toast("تحويل الاستفسار متاح للإدارة.",true);
    const row=V6.data.inquiries.find(item=>item.id===button.dataset.id);if(!row||row.status==="converted")return;
    const service=serviceFor(row.service_id),jobId=`v6-${row.id}`,division=(row.brand||service?.brand)==="reve"?"d_mc":"d_bs";const owner=row.assigned_to||row.created_by||uid;
    const details=[row.request,row.resources?`الموارد: ${row.resources}`:"",row.goal?`الهدف: ${row.goal}`:"",Array.isArray(row.required_docs)?`المطلوب: ${row.required_docs.join("، ")}`:""].filter(Boolean).join("\n");
    await db.doc(`jobs/${jobId}`).set({title:row.service_name||service?.name_ar||row.client_name||"عمل جديد",client:row.client_name||row.client||"",clientId:row.client_id||"",service:row.service_name||service?.name_ar||"",service_id:row.service_id||null,brand:row.brand||service?.brand||"evx",division,status:"j_new",due:row.due||E.today(),value:Number(row.estimated_fee)||0,details,source_inquiry_id:row.id,at:Date.now()});
    await db.doc(`${ws(owner,"tasks")}/first-${row.id}`).set({title:`بدء العمل: ${row.service_name||service?.name_ar||"الطلب"}`,details,goal:row.goal||"",due:row.due||E.today(),status:"s_new",priority:"p_m",progress:0,job:jobId,service_id:row.service_id||null,division,at:Date.now()});
    await E.api.inquiries.update(row.id,{status:"converted",job_id:jobId,converted_at:new Date().toISOString()});
    await V6.refresh();E.toast("تحوّل الاستفسار إلى شغل ومهمة أولى.");render();
  });
})();
