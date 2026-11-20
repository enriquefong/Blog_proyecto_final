const bar=document.getElementById('bar');
addEventListener('scroll',()=>{const h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});

// QR generativo (21x21) que se arma al cargar; al hacer clic se "valida"
const qr=document.getElementById('qr'),ok=document.getElementById('ok');
const N=21,S=8;let seed=2026;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const finder=(x,y)=>(x<7&&y<7)||(x>13&&y<7)||(x<7&&y>13);
const ring=(x,y)=>{const a=(x>13?x-14:x),b=(y>13?y-14:y);return Math.max(Math.abs(a-3),Math.abs(b-3))!==2};
let k=0;
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const on=finder(x,y)?ring(x,y):rnd()>.52;if(!on)continue;
  const r=document.createElementNS('http://www.w3.org/2000/svg','rect');
  r.setAttribute('x',x*S);r.setAttribute('y',y*S);r.setAttribute('width',S);r.setAttribute('height',S);
  r.style.transformOrigin=`${x*S+S/2}px ${y*S+S/2}px`;r.style.animationDelay=(k++*8)+'ms';
  qr.insertBefore(r,qr.querySelector('.scan'));
}
qr.classList.add('on');
qr.addEventListener('click',()=>ok.classList.toggle('show'));

// Zonas de actividad
const info={asistentes:'Registro y seguimiento de cada asistente, con su información lista para campañas y patrocinadores.',qr:'Cada entrada genera un código QR único; en la puerta se valida en segundos.',pagos:'Venta de tickets en línea con una pasarela de pago integrada a la plataforma.',dashboard:'Cifras del evento: ventas, asistencia y conversión de invitados a confirmados.'};
document.querySelectorAll('.zone').forEach(z=>z.addEventListener('click',()=>{
  document.querySelectorAll('.zone').forEach(o=>o.classList.remove('act'));z.classList.add('act');
  document.getElementById('zdesc').textContent=info[z.dataset.k]}));

// Barras animadas al entrar en pantalla
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.4});
document.querySelectorAll('.bars').forEach(b=>io.observe(b));

// Flujo paso a paso
const st=[...document.querySelectorAll('.st')],sp=[...document.querySelectorAll('.sp')],prog=document.querySelector('.prog');
let cur=0;
function go(i){cur=Math.max(0,Math.min(st.length-1,i));
  st.forEach((b,j)=>{b.classList.toggle('act',j===cur);b.classList.toggle('done',j<cur)});
  sp.forEach((p,j)=>p.classList.toggle('act',j===cur));
  prog.style.width=(cur/(st.length-1)*84)+'%';
  document.getElementById('prev').disabled=cur===0;document.getElementById('next').disabled=cur===st.length-1}
st.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
document.getElementById('prev').onclick=()=>go(cur-1);document.getElementById('next').onclick=()=>go(cur+1);
go(0);

// Visor de imágenes
const lb=document.createElement('div');lb.id='lb';lb.innerHTML='<img alt="">';document.body.appendChild(lb);
document.addEventListener('click',e=>{const f=e.target.closest('.ph');
  if(f&&f.querySelector('img')&&!lb.classList.contains('on')){lb.querySelector('img').src=f.querySelector('img').src;lb.classList.add('on')}else lb.classList.remove('on')});
addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('on')});

// Inclinación 3D suave en fotos (solo con puntero fino)
if(matchMedia('(pointer:fine)').matches)document.querySelectorAll('.ph').forEach(f=>{
  f.addEventListener('mousemove',e=>{const r=f.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    f.style.transform=`perspective(800px) rotateY(${x*6}deg) rotateX(${-y*6}deg)`});
  f.addEventListener('mouseleave',()=>f.style.transform='')});

// Aparición suave de fotos
const rv=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target)}}),{threshold:.2});
document.querySelectorAll('.page>.ph,.page>figure.ph').forEach(f=>{f.classList.add('rv');rv.observe(f)});


// ===== Mejoras UX =====
// Navegación lateral por puntos
const secs=[['portada','Portada'],['intro','Introducción'],['bios','Biografías'],['c1','Contenido 1'],['c2','Contenido 2'],['c3','Contenido 3'],['conclusion','Conclusión'],['biblio','Bibliografía']];
const dots=document.createElement('div');dots.id='dots';
secs.forEach(([id,t])=>{const a=document.createElement('a');a.href='#'+id;a.dataset.t=t;a.setAttribute('aria-label',t);dots.appendChild(a)});
document.body.appendChild(dots);
const dio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){
  dots.querySelectorAll('a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id));
  e.target.classList.add('pg-in')}}),{threshold:.35});
secs.forEach(([id])=>dio.observe(document.getElementById(id)));

// Botón volver arriba
const topBtn=document.createElement('button');topBtn.id='top';topBtn.textContent='↑';topBtn.setAttribute('aria-label','Volver arriba');
topBtn.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.appendChild(topBtn);
addEventListener('scroll',()=>topBtn.classList.toggle('on',scrollY>700),{passive:true});

// Portada con parallax según el mouse
const cv=document.getElementById('portada');
if(matchMedia('(pointer:fine)').matches)cv.addEventListener('mousemove',e=>{
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  cv.querySelector('.bg').style.transform=`translate(${x*-28}px,${y*-28}px) scale(1.06)`;
  cv.querySelector('.in').style.transform=`translate(${x*10}px,${y*10}px)`});

// Confeti al validar el QR
document.getElementById('qr').addEventListener('click',()=>{
  const c=['#ff5d73','#ffd23f','#0fa3b1','#6d5bd0','#fff'],r=document.getElementById('qr').getBoundingClientRect();
  for(let i=0;i<46;i++){const p=document.createElement('i');
    p.style.cssText=`position:fixed;z-index:30;pointer-events:none;width:9px;height:14px;border-radius:2px;left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;background:${c[i%5]}`;
    document.body.appendChild(p);
    const a=Math.random()*Math.PI*2,d=120+Math.random()*220;
    p.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+160}px) rotate(${Math.random()*720}deg)`,opacity:0}],{duration:1100+Math.random()*500,easing:'cubic-bezier(.2,.8,.3,1)'}).onfinish=()=>p.remove()}});

// Flechas del teclado en el flujo
addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1)});