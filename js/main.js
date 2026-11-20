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
