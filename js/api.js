(() => {
  const missingTable = error => !!error && (error.code === "42P01" || error.code === "PGRST205" || /could not find the table|schema cache/i.test(error.message || ""));
  const state = { services: "loading", inquiries: "loading", website_requests: "loading", ledger_entries: "loading" };
  const shapeDoc = row => ({ ...(row.data || {}), id: (row.path || "").split("/").pop(), _path: row.path });
  async function docsByColumn(column) {
    const { data, error } = await SB.from("docs").select("path,data").eq("col", column).limit(1000);
    if (error) throw error;
    return (data || []).map(shapeDoc);
  }
  async function docsByManagerInquiryScope() {
    const { data, error } = await SB.from("docs").select("path,data").or("col.eq.v6_inquiries,col.like.ws/%/inquiries").limit(1000);
    if (error) throw error;
    return (data || []).map(shapeDoc).filter(row => ADMIN || row.created_by === uid || row.assigned_to === uid || row._path?.startsWith(`ws/${uid}/`));
  }
  async function tableList(table, fallback) {
    const { data, error } = await SB.from(table).select("*").limit(1000);
    if (!error) { state[table] = "table"; return data || []; }
    if (missingTable(error) && fallback) {
      state[table] = "docs";
      if (fallback === "inquiries") return docsByManagerInquiryScope();
      if (fallback === "ledger") {
        const rows = [...await docsByColumn("acct"),...await docsByColumn("ledger")];
        const knownTypes = new Set(["invoice","payment_received","internal_expense","external_expense","project_fund_spend","salary","advance","legacy_expense","employee_share"]);
        return rows.map(row => {
          const isLegacy = row.schema_version !== 6;
          const rawType = row.entry_type || (row.type === "l_income" ? "payment_received" : row.type === "l_expense" ? "legacy_expense" : "");
          const validBrand = ["evx","reve","cc142"].includes(row.brand);
          return {...row, _legacy:isLegacy, entry_type:knownTypes.has(rawType)?rawType:"legacy_expense", brand:validBrand?row.brand:"evx", legacy_brand_unverified:!!row.legacy_brand_unverified||(isLegacy&&!validBrand), legacy_type_unverified:!!row.legacy_type_unverified||(isLegacy&&!knownTypes.has(rawType)), status:row.status||"paid", legacy_category:row.legacy_category||row.category||"", legacy_monthly:!!(row.legacy_monthly||row.monthly), note:row.note||"", date:row.date||new Date(row.at||Date.now()).toISOString().slice(0,10), amount:Number(row.amount)||0, job_id:row.job_id||row.job||null};
        });
      }
      return docsByColumn(fallback);
    }
    state[table] = "error";
    throw error;
  }
  async function tableInsert(table, row, fallback, fallbackPath) {
    const { data, error } = await SB.from(table).insert(row).select("*").single();
    if (!error) { state[table] = "table"; return data; }
    if (missingTable(error) && fallback) {
      state[table] = "docs";
      const path = `${fallbackPath || fallback}/${row.id || crypto.randomUUID()}`;
      await db.doc(path).set({...row, id:path.split("/").pop()});
      return {...row, id:path.split("/").pop(), _path:path};
    }
    throw error;
  }
  async function tableUpdate(table, rowId, patch, fallback) {
    const { data, error } = await SB.from(table).update({...patch, updated_at:new Date().toISOString()}).eq("id", rowId).select("*").single();
    if (!error) { state[table] = "table"; return data; }
    if (missingTable(error) && fallback) {
      state[table] = "docs"; let path="";
      if(fallback==="inquiries"){const rows=await docsByManagerInquiryScope();path=rows.find(row=>row.id===rowId)?._path||"";}
      else {const result=await SB.from("docs").select("path").eq("col",fallback).like("path","%/"+rowId).maybeSingle();if(result.error)throw result.error;path=result.data?.path||fallback+"/"+rowId;}
      if(!path){const collection=fallback==="inquiries"&&!ADMIN?"ws/"+uid+"/inquiries":"v6_inquiries";path=collection+"/"+rowId;}
      await db.doc(path).update(patch); return {id:rowId, ...patch, _path:path};
    }
    throw error;
  }
  async function serviceFile() {
    const response = await fetch("./data/services.json", {cache:"no-cache"});
    if (!response.ok) throw new Error("تعذّر تحميل كتالوج الخدمات المحلي.");
    return response.json();
  }
  const services = {
    async list({includeInactive=false}={}) {
      const query = SB.from("services").select("*").order("sort", {ascending:true});
      if (!includeInactive) query.eq("active", true);
      const {data,error}=await query;
      if (!error) {state.services="table"; return data||[];}
      if (missingTable(error)) {state.services="static"; const rows=await serviceFile(); return includeInactive?rows:rows.filter(row=>row.active);}
      state.services="error"; throw error;
    },
    async save(row) {
      const {error}=await SB.from("services").upsert({...row,updated_at:new Date().toISOString()},{onConflict:"id"});
      if(error){if(missingTable(error))state.services="migration";throw error;}
      state.services="table";return row;
    }
  };
  const inquiries = {
    async list() { return tableList("inquiries", "inquiries"); },
    async create(row) {
      const record={...row,id:row.id||crypto.randomUUID(),created_by:uid,created_at:new Date().toISOString(),status:row.status||"new",due:row.due||null};
      if(!ADMIN){record.assigned_to=record.assigned_to||uid;return tableInsert("inquiries",record,"inquiries",`ws/${uid}/inquiries`);}
      return tableInsert("inquiries",record,"inquiries","v6_inquiries");
    },
    async update(id,patch) { if(patch.due==="")patch.due=null;return tableUpdate("inquiries",id,patch,"inquiries"); }
  };
  const websiteRequests = {
    async list() { return tableList("website_requests",null); },
    async submit(row) {
      const {data,error}=await SB.rpc("submit_website_request",{
        p_name:row.name,p_whatsapp:row.whatsapp,p_service_id:row.service_id,p_brand:row.brand,
        p_governorate:row.governorate,p_note:row.note,p_consent:!!row.consent,p_website:row.website||""
      });
      if(error)throw error;return data;
    },
    async update(id,patch) { const {data,error}=await SB.from("website_requests").update(patch).eq("id",id).select("*").single();if(error)throw error;return data; }
  };
  const ledger = {
    async list() {
      if(window.EVX?.canAccounting?.()) return tableList("ledger_entries","ledger");
      const {data,error}=await SB.from("ledger_entries").select("*").eq("entry_type","employee_share").eq("employee_id",uid).order("date",{ascending:false}).limit(500);
      if(error){state.ledger_entries="error";throw error;}
      state.ledger_entries="table";return data||[];
    },
    async recordDeal(row) {
      if(!window.EVX?.canAccounting?.(row.brand))throw new Error("ليس لديك صلاحية المحاسبة لهذا القسم.");
      const {data,error}=await SB.rpc("v6_record_deal",{
        p_deal_id:row.deal_id,p_brand:row.brand,p_amount:row.amount,p_payment_status:row.payment_status,
        p_date:row.date,p_client_name:row.client_name||"",p_job_id:row.job_id||"",p_service_id:row.service_id||"",
        p_employee_id:row.employee_id,p_share_amount:row.share_amount,p_note:row.note||""
      });
      if(error){if(error.code==="PGRST202"||/schema cache/i.test(error.message||""))throw new Error("يلزم تطبيق تحديث قاعدة البيانات v6 لتسجيل الصفقة والحصة.");throw error;}return data;
    },
    async create(row) {
      if(!window.EVX?.canAccounting?.(row.brand))throw new Error("ليس لديك صلاحية المحاسبة لهذا القسم.");
      const record={...row,id:row.id||crypto.randomUUID(),schema_version:6,created_by:uid,created_at:new Date().toISOString()};
      return tableInsert("ledger_entries",record,"acct","acct");
    },
    async update(id,patch) {
      if(!window.EVX?.canAccounting?.(patch.brand))throw new Error("ليس لديك صلاحية المحاسبة لهذا القسم.");
      const {data,error}=await SB.from("ledger_entries").update({...patch,updated_at:new Date().toISOString()}).eq("id",id).select("*").single();
      if(missingTable(error)){const localRows=await docsByColumn("acct");if(!localRows.some(row=>row.id===id&&row.schema_version===6))throw new Error("السجل المالي القديم للقراءة فقط؛ راجعه بعد الترحيل.");return tableUpdate("ledger_entries",id,patch,"acct");}
      if(error)throw error;return data;
    }
  };
  const team = {
    async list() {
      const {data,error}=await SB.from("profiles").select("*").limit(500);
      if(!error)return data||[];
      return members.map(m=>({id:m.id,full_name:names[m.id]||m.name||"",phone:m.phone||"",job_title:m.job_title||m.jobTitle||"",role:m.role||(m.isAdmin?"deputy":"employee"),status:m.status||"active"}));
    },
    async setAccess(id, role, statusValue, jobTitle, businessRole, phone, teamName="", brandRoles={}) {
      if(!ADMIN)throw new Error("ليس لديك صلاحية إدارة الحسابات.");
      const member=members.find(item=>item.id===id);
      if(!user.isOwner()&&(id===uid||member?.isAdmin||member?.role==="owner"||member?.role==="deputy"||role==="deputy"))throw new Error("لا يستطيع المدير تعديل حسابه أو صلاحية المالك أو مدير آخر.");
      if(role==="owner")throw new Error("لا يمكن منح صلاحية المالك من هذه الشاشة.");
      const {error}=await SB.rpc("v6_set_staff_profile_access",{p_user_id:id,p_access_role:role,p_status:statusValue,p_job_title:jobTitle||"",p_business_role:businessRole||"emp",p_phone:phone||"",p_team_name:teamName||"",p_brand_roles:brandRoles||{}});
      if(error)throw error;
    }
  };
  async function uploadReceipt(file) {
    if(!file) return null;
    if(!(file.type.startsWith("image/") && file.type!=="image/svg+xml") && file.type!=="application/pdf")throw new Error("ارفع صورة عادية أو ملف PDF فقط.");
    if(file.size>10*1024*1024)throw new Error("حجم الإيصال أكبر من 10 ميغابايت.");
    let uploadFile=file;
    if(file.type.startsWith("image/") && file.type!=="image/svg+xml") {
      try {
        const bitmap=await createImageBitmap(file);const max=1800,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
        const canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
        canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.82));
        if(blob && blob.size<file.size)uploadFile=new File([blob],`${file.name.replace(/\.[^.]+$/,'')}.jpg`,{type:"image/jpeg"});
      } catch(error) { console.warn("Receipt image compression skipped",error); }
    }
    const safe=uploadFile.name.replace(/[^\w.\-]/g,"_");const key=`${PROFILE.id}/receipts/${crypto.randomUUID()}-${safe}`;
    const {error}=await SB.storage.from("receipts").upload(key,uploadFile,{contentType:uploadFile.type,upsert:false});
    if(error)throw error;return {path:key,name:uploadFile.name,size:uploadFile.size,type:uploadFile.type};
  }
  async function reportError(message,source) {
    try {
      const safe=String(message||"Client error").replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,"[email]").slice(0,500);
      await SB.from("client_errors").insert({user_id:PROFILE?.id||null,message:safe,source:String(source||"").slice(0,200),created_at:new Date().toISOString()});
    } catch(_) {}
  }
  window.EVX_API={state,services,inquiries,websiteRequests,ledger,team,uploadReceipt,reportError,missingTable};
  window.EVX=Object.assign(window.EVX||{},{api:window.EVX_API});
})();
