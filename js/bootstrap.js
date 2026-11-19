(() => {
  const startApp=()=>{start().catch(error=>{console.error("EVOXHUB startup failed:",error);const gate=document.getElementById("gate");if(gate)gate.textContent="تعذّر تشغيل الموقع الآن. أعد تحميل الصفحة أو تواصل مع الإدارة.";});};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startApp,{once:true});else startApp();
})();
