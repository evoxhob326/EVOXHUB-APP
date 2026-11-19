
/* ===== Supabase adapter (يحل محل منصة Claude) ===== */
const SB=supabase.createClient('https://erjmcyshsdxdlhkrwqbh.supabase.co','sb_publishable_YnuXveVpNwqjVgARat4acA_1-ZmyPH9');
let PROFILE=null;const LIS={};
const colOf=p=>p.split('/').slice(0,-1).join('/');
async function fetchCol(c){const {data}=await SB.from('docs').select('path,data').eq('col',c);(LIS[c]||[]).forEach(cb=>cb({docs:(data||[]).map(r=>({id:r.path.split('/').pop(),data:()=>r.data}))}));}
const docRef=p=>({
  set:async d=>{const {error}=await SB.from('docs').upsert({path:p,col:colOf(p),data:d,updated_at:new Date().toISOString()});if(error)throw error;fetchCol(colOf(p))},
  update:async d=>{const {data:r}=await SB.from('docs').select('data').eq('path',p).maybeSingle();const {error}=await SB.from('docs').upsert({path:p,col:colOf(p),data:{...(r?r.data:{}),...d},updated_at:new Date().toISOString()});if(error)throw error;fetchCol(colOf(p))},
  delete:async()=>{const {error}=await SB.from('docs').delete().eq('path',p);if(error)throw error;fetchCol(colOf(p))}});
const DB={collection:c=>({doc:id=>docRef(c+'/'+id),onSnapshot:(cb,eb)=>{(LIS[c]=LIS[c]||[]).push(cb);fetchCol(c).catch(eb||(()=>{}));return()=>{LIS[c]=LIS[c].filter(x=>x!==cb)}}}),doc:p=>docRef(p)};
SB.channel('docs').on('postgres_changes',{event:'*',schema:'public',table:'docs'},pl=>{const p=(pl.new&&pl.new.path)||(pl.old&&pl.old.path);if(p&&LIS[colOf(p)])fetchCol(colOf(p))}).subscribe();
const USER={id:async()=>PROFILE.id,isOwner:()=>PROFILE.role==='owner',canEdit:()=>PROFILE.role==='deputy',me:async()=>({name:PROFILE.full_name}),
  profiles:async ids=>{const {data}=await SB.from('profiles').select('id,full_name').in('id',ids);const o={};(data||[]).forEach(r=>o[r.id]={name:r.full_name});return o}};
const ASSETS={upload:async f=>{const key=PROFILE.id+'/'+crypto.randomUUID()+'-'+f.name.replace(/[^\w.\-]/g,'_');const {error}=await SB.storage.from('files').upload(key,f);if(error)throw error;return{id:key,sizeBytes:f.size,contentType:f.type}}};
window.claude={use:async n=>({db:DB,user:USER,assets:ASSETS}[n]||null)};
document.addEventListener('click',async e=>{const a=e.target.closest('a[data-asset]');if(!a)return;e.preventDefault();const {data}=await SB.storage.from(a.dataset.bucket||'files').createSignedUrl(a.dataset.asset,300);if(data)window.open(data.signedUrl,'_blank')});
const G=document.getElementById('gate');
function gateLogin(mode){G.innerHTML=`<div class="login"><div class="card"><div class="lg"><b>EVO<i>X</i>HUB</b></div><p class="s">شريكك الموثوق للخدمات</p>
${mode==='up'?'<label>الاسم الكامل<input id="gn" required></label>':''}<label>البريد الإلكتروني *<input id="ge" type="email" dir="ltr" required></label><label>كلمة السر *<input id="gp" type="password" dir="ltr" required></label>
<p class="err" id="gr"></p><button class="b gold" style="width:100%;padding:11px" id="gb">${mode==='up'?'إنشاء الحساب':'دخول'}</button>
<p class="mute" style="text-align:center"><a href="#" id="gs">${mode==='up'?'عندك حساب؟ سجّل دخولك':'عضو جديد في الفريق؟ أنشئ حسابك'}</a></p></div><div class="teaser" id="teaser"></div><div class="links" id="links"></div></div>`;loadLinks();typeTeaser();
document.getElementById('gs').onclick=e=>{e.preventDefault();gateLogin(mode==='up'?'in':'up')};
document.getElementById('gb').onclick=async()=>{const em=ge.value.trim(),pw=gp.value;let r;
 if(mode==='up'){if(!gn.value.trim())return gr.textContent='اكتب اسمك';r=await SB.auth.signUp({email:em,password:pw,options:{data:{full_name:gn.value.trim()}}})}else r=await SB.auth.signInWithPassword({email:em,password:pw});
 if(r.error)return gr.textContent=mode==='up'?r.error.message:'بيانات الدخول غير صحيحة';start()}}
function gateMsg(t){G.innerHTML=`<div class="login"><div class="card"><div class="lg"><b>EVO<i>X</i>HUB</b></div><p class="s">${t}</p><button class="b" style="width:100%" onclick="SB.auth.signOut().then(()=>location.reload())">خروج</button></div></div>`}
async function pendPanel(){if(!PROFILE||!['owner','deputy'].includes(PROFILE.role))return;const {data}=await SB.from('profiles').select('*').eq('status','pending');const B=document.getElementById('pendBox');
B.innerHTML=(data||[]).length?`<div class="card"><b>طلبات انضمام (${data.length})</b>${data.map(p=>`<div class="row" style="margin-top:8px"><span class="grow">${(p.full_name||'').replace(/</g,'&lt;')}</span><button class="b sm pri" data-pa="${p.id}|active">قبول</button><button class="b sm" data-pa="${p.id}|disabled">رفض</button></div>`).join('')}</div>`:'';
B.querySelectorAll('[data-pa]').forEach(b=>b.onclick=async()=>{const[id,s]=b.dataset.pa.split('|');await SB.from('profiles').update({status:s}).eq('id',id);pendPanel()})}
async function start(){const {data:{session}}=await SB.auth.getSession();if(!session)return gateLogin('in');
const {data}=await SB.from('profiles').select('*').eq('id',session.user.id).single();PROFILE=data;
if(!PROFILE||PROFILE.status!=='active')return gateMsg('تم تسجيل حسابك، وبانتظار موافقة الإدارة');
G.innerHTML='';document.getElementById('shellRoot').style.display='';document.getElementById('rain').style.opacity=.2;await window.bootApp();pendPanel();if(!window.__pendTimer)window.__pendTimer=setInterval(pendPanel,60000)}
