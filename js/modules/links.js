
/* Continuous canvas rain removed to reduce background CPU usage. */
/* روابط وعبارات */
async function loadLinks(){const L=document.getElementById("links");if(!L)return;const {data}=await SB.from("docs").select("data").eq("path","settings/links").maybeSingle();const d=(data&&data.data)||{};
const it=[[d.ig,"📸","انستقرام"],[d.map,"📍","موقعنا"],[d.wa&&("https://wa.me/"+String(d.wa).replace(/\D/g,"")),"💬","واتساب"],[d.card,"🪪","البطاقة الرقمية"]].filter(a=>a[0]);
L.innerHTML=it.map(([u,i,n])=>`<a href="${u.replace(/"/g,"")}" target="_blank" rel="noopener" title="${n}">${i}</a>`).join("")}
const TEASERS=["فريق واحد… وهدف واحد: <b>EVOXHUB</b> أقوى كل يوم","كل مهمة تنجزها اليوم <b>خطوة</b> للأمام","هنا تبدأ الشغلة… وهنا <b>تكتمل</b>","شريكك الموثوق للخدمات — <b>بإيديكم</b>"];
let ti=0;function typeTeaser(){const el=document.getElementById("teaser");if(!el)return;el.style.opacity=0;setTimeout(()=>{el.innerHTML=TEASERS[ti%TEASERS.length];el.style.transition="opacity .8s";el.style.opacity=1;ti++},300)}
setInterval(typeTeaser,4500);
