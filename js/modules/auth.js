
const GICO='<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const RED=location.origin+location.pathname;
gateLogin=function(mode){const up=mode==='up';const registerUrl=location.pathname+'?mode=register';G.innerHTML=`<div class="login"><div class="card login-card">
 <header class="login-brand"><img class="login-tiger" src="${TIGER}" alt="نمر EVOXHUB"><div><div class="lg"><b>EVO<i>X</i>HUB</b></div><p class="s">شريكك الموثوق للخدمات</p></div></header>
 <div class="auth-switch" role="group" aria-label="اختيار تسجيل الدخول أو إنشاء حساب"><button type="button" id="loginMode" class="${up?'':'active'}">تسجيل الدخول</button><button type="button" id="registerMode" class="${up?'active':''}">إنشاء حساب</button></div>
 <p class="auth-intro">${up?'انضم إلى فريق EVOXHUB وأرسل طلبك للإدارة.':'أهلًا بك، سجّل دخولك إلى مساحة عمل الفريق.'}</p>
 <form id="authForm" novalidate>${up?'<label>الاسم الكامل *<input id="gn" autocomplete="name" required></label><label>رقم الهاتف *<input id="gph" type="tel" autocomplete="tel" dir="ltr" required placeholder="9xxxxxxx"></label>':''}
 <label>البريد الإلكتروني *<input id="ge" type="email" autocomplete="email" dir="ltr" required></label>
 <label>كلمة السر *<input id="gp" type="password" autocomplete="${up?'new-password':'current-password'}" dir="ltr" required></label>
 <p class="err" id="gr" role="status" aria-live="polite"></p>
 <button type="submit" class="b gold auth-submit" id="gb">${up?'إنشاء الحساب':'تسجيل الدخول'}</button></form>
 <div class="auth-divider"><span>أو</span></div>
 <button type="button" class="b auth-google" id="gG">${GICO}<span>${up?'التسجيل في الفريق بحساب Google':'الدخول بحساب Google'}</span></button>
 <p class="auth-team-note">${up?'سيبقى طلب الانضمام بانتظار موافقة الإدارة.':'مخصص لموظفي EVOXHUB المسجلين.'}</p>
 </div><div class="teaser" id="teaser"></div><div class="links" id="links"></div><a class="login-request-link" href="./request.html">لست من فريق العمل؟ أرسل استفسارك عن خدمة</a></div>`;
 loadLinks();typeTeaser();const msg=(t,ok)=>{gr.style.color=ok?'var(--ok)':'';gr.textContent=t};
 document.getElementById('loginMode').onclick=()=>{history.replaceState(null,'',location.pathname);gateLogin('in')};
 document.getElementById('registerMode').onclick=()=>{history.replaceState(null,'',registerUrl);gateLogin('up')};
 document.getElementById('authForm').onsubmit=e=>e.preventDefault();
 gb.onclick=()=>{};
 gG.onclick=async()=>{if(up&&(!gn.value.trim()||!gph.value.trim()))return msg('اكتب اسمك ورقم هاتفك أولًا');if(up)try{localStorage.setItem('evx_pending',JSON.stringify({n:gn.value.trim(),p:gph.value.trim()}))}catch(e){}
  const {error}=await SB.auth.signInWithOAuth({provider:'google',options:{redirectTo:RED}});if(error)msg('تعذر الدخول بحساب Google؛ تحقق من تفعيله في إعدادات المشروع ثم جرّب مرة أخرى.')};
 const emailVal=()=>ge.value.trim(),passwordVal=()=>gp.value;
 if(up)gb.onclick=async()=>{
  const em=emailVal(),pw=passwordVal(),name=gn.value.trim(),phone=gph.value.trim();
  if(!name||!phone)return msg('الاسم ورقم الهاتف مطلوبان');
  if(!em||!pw)return msg('البريد الإلكتروني وكلمة السر مطلوبان');
  try{localStorage.setItem('evx_pending',JSON.stringify({n:name,p:phone}))}catch(e){}
  const {data,error}=await SB.auth.signUp({email:em,password:pw,options:{emailRedirectTo:RED,data:{full_name:name,phone}}});
  if(error){localStorage.removeItem('evx_pending');return msg(error.message)}
  if(data.session){start();return}
  msg('تم إنشاء الحساب. افحص بريدك لتأكيده ثم سجّل الدخول بكلمة السر.',1)
 };
 else gb.onclick=async()=>{
  const em=emailVal(),pw=passwordVal();
  if(!em)return msg('اكتب بريدك الإلكتروني');
  if(!pw)return msg('كلمة السر مطلوبة');
  const {error}=await SB.auth.signInWithPassword({email:em,password:pw});
  if(error)return msg('بيانات الدخول غير صحيحة');
  start()
 };
};
let __booted=false;const _start=start;start=async function(){if(__booted&&document.getElementById('shellRoot').style.display!=='none')return;__booted=true;
 try{const {data:{session}}=await SB.auth.getSession();const pd=JSON.parse(localStorage.getItem('evx_pending')||'null');if(session&&pd){await SB.rpc('set_my_contact',{n:pd.n,p:pd.p});localStorage.removeItem('evx_pending')}}catch(e){}
 __booted=false;return _start()};
SB.auth.onAuthStateChange((ev)=>{if(ev==='SIGNED_IN'&&document.getElementById('shellRoot').style.display==='none'&&!document.getElementById('gb'))return;if(ev==='SIGNED_IN'&&document.getElementById('gb'))start()});
