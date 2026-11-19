(() => {
  const SB=window.supabase?.createClient?.("https://erjmcyshsdxdlhkrwqbh.supabase.co","sb_publishable_YnuXveVpNwqjVgARat4acA_1-ZmyPH9")||null;
  const form=document.getElementById("serviceRequest"),message=document.getElementById("requestMessage"),serviceSelect=form.elements.service_id,brandSelect=form.elements.brand,priceInfo=document.getElementById("servicePrice");
  let catalog=[];
  const price=value=>value===null||value===undefined||value===""?"":new Intl.NumberFormat("ar-OM",{maximumFractionDigits:3}).format(Number(value)||0)+" ر.ع";
  function updatePrice(){
    const service=catalog.find(item=>item.id===serviceSelect.value);
    if(!service){priceInfo.textContent="";priceInfo.hidden=true;return;}
    const parts=[];
    if(service.price_sedan!==null&&service.price_sedan!==undefined&&service.price_sedan!=="")parts.push("صالون: "+price(service.price_sedan));
    if(service.price_4wd!==null&&service.price_4wd!==undefined&&service.price_4wd!=="")parts.push("فورويل: "+price(service.price_4wd));
    if(service.price_flat!==null&&service.price_flat!==undefined&&service.price_flat!=="")parts.push(price(service.price_flat));
    if(service.price_note)parts.push(service.price_note);
    priceInfo.textContent=parts.join(" · ");
    priceInfo.hidden=!parts.length;
  }
  async function loadCatalog(){
    message.textContent="جارٍ تحميل قائمة الخدمات…";
    const response=await fetch("./data/services.json",{cache:"no-cache"});if(!response.ok)throw new Error("تعذّر تحميل قائمة الخدمات.");catalog=(await response.json()).filter(item=>item.active);updateServices();message.textContent="";
    if(SB){try{const {data,error}=await SB.from("services").select("id,brand,domain,name_ar,active,sort,price_sedan,price_4wd,price_flat,price_note").eq("active",true).order("sort");if(!error){catalog=data||[];updateServices();if(!catalog.length)message.textContent="لا توجد خدمات مفعّلة في الوقت الحالي.";}}catch(error){console.warn("Live catalog unavailable; using bundled catalog.",error.message);}}
  }
  function updateServices(){const list=catalog.filter(item=>item.brand===brandSelect.value);serviceSelect.replaceChildren(new Option("اختر الخدمة",""),...list.map(item=>new Option(item.name_ar,item.id)));updatePrice();}
  brandSelect.addEventListener("change",updateServices);
  serviceSelect.addEventListener("change",updatePrice);
  form.addEventListener("submit",async event=>{
    event.preventDefault();message.textContent="";const values=Object.fromEntries(new FormData(form).entries());
    if(!form.reportValidity())return;
    const service=catalog.find(item=>item.id===values.service_id);if(!service){message.textContent="اختر خدمة من القائمة.";return;}
    const button=form.querySelector('[type="submit"]');button.disabled=true;message.textContent="جارٍ إرسال الطلب…";
    try{
      if(!SB)throw new Error("اتصال قاعدة البيانات غير متاح.");
      const {data,error}=await SB.rpc("submit_website_request",{p_name:values.name.trim(),p_whatsapp:values.whatsapp.trim(),p_service_id:service.id,p_brand:service.brand,p_governorate:values.governorate.trim(),p_note:values.note.trim(),p_consent:values.consent==="on",p_website:values.website||""});
      if(error)throw error;if(data?.rate_limited)throw new Error("تم تجاوز الحد المؤقت للطلبات.");message.textContent=`وصل استفسارك${data?.request_no?` رقم ${data.request_no}`:""}. ستتواصل معك الإدارة لمراجعة المطلوب والتكلفة قبل بدء العمل.`;form.reset();brandSelect.value="evx";updateServices();
    }catch(error){message.textContent="تعذّر إرسال الطلب الآن. حاول مرة أخرى بعد قليل.";console.error("website request submit failed",error.message);}
    finally{button.disabled=false;}
  });
  loadCatalog().catch(error=>{serviceSelect.innerHTML='<option value="">تعذّر تحميل الخدمات</option>';message.textContent="قائمة الخدمات غير متاحة حاليًا.";console.error("service catalog failed",error.message);});
})();
