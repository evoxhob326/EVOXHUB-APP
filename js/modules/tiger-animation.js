(function(){
const img=new Image();img.src=TIGER;setTimeout(()=>{const s=document.getElementById('splash');if(s&&!s.dataset.animated){s.dataset.fallbackDone='1';s.style.animation='sp .7s ease forwards'}},1800);
const HIP=92,LEGS=[[50,70,0],[150,85,Math.PI],[245,80,Math.PI/2],[355,80,Math.PI*1.5]];
// نمر بأربع أرجل مستقلة (مشية قطرية متوازنة) + فك يفتح
function drawTiger(c,t,x,y,s,jaw=0,moving=1){const W=img.width,H=img.height;c.save();c.translate(x,y);c.scale(s,s);
 const bob=moving?Math.abs(Math.sin(t))*-2.5:0;
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(W*.53,H+1,W*.4,6,0,0,7);c.fill();
 for(const [sx,sw,ph] of LEGS){const a=moving?Math.sin(t+ph)*.26:0,lift=moving?Math.max(0,Math.cos(t+ph))*-4:0;
  c.save();c.translate(sx+sw/2,HIP+bob);c.rotate(a);c.translate(0,lift*Math.abs(Math.sin(a))*3);
  c.drawImage(img,sx,HIP,sw,H-HIP,-sw/2,0,sw,H-HIP);c.restore()}
 c.save();c.translate(0,bob);
 const J=[[398,49],[W,47],[W,70],[402,68]],poly=()=>{c.beginPath();J.forEach(([a,b],k)=>k?c.lineTo(a,b):c.moveTo(a,b));c.closePath()};
 c.drawImage(img,0,HIP,50,H-HIP,0,HIP,50,H-HIP);
 c.save();c.beginPath();c.rect(0,0,W,HIP+14);if(jaw>0){J.slice().reverse().forEach(([a,b],k)=>k?c.lineTo(a,b):c.moveTo(a,b));c.closePath()}c.clip('evenodd');c.drawImage(img,0,0,W,HIP+14,0,0,W,HIP+14);c.restore();
 if(jaw>0){c.fillStyle='#2a0b0d';c.beginPath();c.moveTo(399,50);c.lineTo(W-2,48);c.lineTo(W-4,48+20*jaw);c.closePath();c.fill();
  c.fillStyle='#F5EBC8';for(let k=0;k<3;k++){c.beginPath();c.moveTo(420+k*8,48);c.lineTo(423+k*8,48+5*jaw);c.lineTo(426+k*8,48);c.fill()}
  c.save();c.translate(399,50);c.rotate(.42*jaw);c.translate(-399,-50);poly();c.clip();c.drawImage(img,0,0);c.restore()}
 c.restore();c.restore()}
window.drawTiger=drawTiger;
img.onload=()=>splash();
// شاشة التحميل: شعار ريڤ ← النمر يمشي ويقف ← يفتح فمه ← تخرج EVOXHUB
function splash(){const sp=document.getElementById('splash');if(!sp||sp.dataset.fallbackDone)return;sp.dataset.animated='1';sp.style.animation='none';void sp.offsetWidth;sp.style.animation='sp 2.4s ease forwards';sp.style.background='#3D1316';sp.innerHTML='';
 const cv=document.createElement('canvas');sp.appendChild(cv);const D=Math.min(devicePixelRatio||1,1.5),Wd=innerWidth,Hd=innerHeight;cv.width=Wd*D;cv.height=Hd*D;const c=cv.getContext('2d');c.scale(D,D);
 const s=Math.min(1.1,Wd*.6/img.width),tw=img.width*s,th=img.height*s,cx=Wd/2-tw/2,cy=Hd/2-th*.85,mx=cx+438*s,my=cy+56*s;
 const t=document.createElement('canvas');t.width=Wd;t.height=Hd;const tc=t.getContext('2d');const fs=Math.min(96,Wd/7.5),ty=Hd/2+th*.55;
 tc.font=`800 ${fs}px Tajawal, sans-serif`;tc.textBaseline='middle';const parts=['EVO','X','HUB'],ws=parts.map(p=>tc.measureText(p).width);let px=Wd/2-ws.reduce((a,b)=>a+b)/2;
 parts.forEach((p,i)=>{tc.fillStyle=i==1?'#C9A45C':'#fff';tc.fillText(p,px,ty);px+=ws[i]});
 const td=tc.getImageData(0,0,Wd,Hd).data,P=[];for(let y=0;y<Hd;y+=4)for(let x=0;x<Wd;x+=4){const k=(y*Wd+x)*4;if(td[k+3]>140)P.push({tx:x,ty:y,col:`rgb(${td[k]},${td[k+1]},${td[k+2]})`,dl:Math.random()*.8,sw:(Math.random()-.5)*120})}
 const T0=performance.now(),ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,lerp=(a,b,u)=>a+(b-a)*u;let lastFrame=0;
 (function f(n){if(n-lastFrame<1000/30){if((n-T0)/1000<2.4)requestAnimationFrame(f);return}lastFrame=n;const T=(n-T0)/1000;c.clearRect(0,0,Wd,Hd);
  // انتقال الخلفية من عنابي ريڤ إلى بترولي إيفو
  const bg=Math.max(0,Math.min(1,(T-1.15)/.6));c.fillStyle=`rgb(${lerp(61,11,bg)|0},${lerp(19,61,bg)|0},${lerp(22,63,bg)|0})`;c.fillRect(0,0,Wd,Hd);
  // كلمة reve تحت النمر
  const ra=T<.2?T/.2:T>1.7?Math.max(0,1-(T-1.7)/.3):1;c.globalAlpha=ra;c.fillStyle='#F5EBC8';c.font=`italic ${fs*1.25}px Georgia`;c.textAlign='center';c.textBaseline='middle';c.fillText('reve',Wd/2,ty);c.globalAlpha=1;
  // مشهد قصير: يمشي النمر، يفتح فمه، ثم يظهر شعار EVOXHUB
  const wk=Math.min(1,T/.85),ox=(1-ease(wk))*-Wd*.55,jaw=T<.9?0:T<1.1?ease((T-.9)/.2):T<1.65?1:Math.max(0,1-(T-1.65)/.25);
  c.globalAlpha=T>1.65?Math.max(0,1-(T-1.65)/.4):1;drawTiger(c,T*5.2,cx+ox,cy,s,jaw,T<1.8);c.globalAlpha=1;
  // EVOXHUB تخرج من الفم
  if(T>.95){const k=T-.95;for(const p of P){const u=Math.max(0,Math.min(1,(k-p.dl)/.6));if(!u)continue;const e=ease(u),bx=lerp(mx,p.tx,e),by=lerp(my,p.ty,e)+Math.sin(u*Math.PI)*p.sw*.5;
   c.fillStyle=u<.7?'#C9A45C':p.col;c.fillRect(bx,by,2.3,2.3)}
   if(k>1.1){c.globalAlpha=Math.min(1,(k-1.1)/.25);c.drawImage(t,0,0);c.globalAlpha=1}}
  if(T<2.4)requestAnimationFrame(f)})(T0)}
})();
