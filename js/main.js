// Barra de progreso de lectura
const bar = document.getElementById('bar');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive: true });

// QR generativo (21x21) + validación con confeti
const qr = document.getElementById('qr');
const ok = document.getElementById('ok');
const N = 21, S = 8;
let seed = 2026;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const finder = (x, y) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
const ring = (x, y) => {
  const a = x > 13 ? x - 14 : x;
  const b = y > 13 ? y - 14 : y;
  return Math.max(Math.abs(a - 3), Math.abs(b - 3)) !== 2;
};

let k = 0;
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; x++) {
    const on = finder(x, y) ? ring(x, y) : rnd() > 0.52;
    if (!on) continue;
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', x * S);
    r.setAttribute('y', y * S);
    r.setAttribute('width', S);
    r.setAttribute('height', S);
    r.style.transformOrigin = `${x * S + S / 2}px ${y * S + S / 2}px`;
    r.style.animationDelay = (k++ * 7) + 'ms';
    qr.insertBefore(r, qr.querySelector('.scan'));
  }
}
qr.classList.add('on');

function triggerQR() {
  ok.classList.toggle('show');
  const colors = ['#ff5d73', '#ffd23f', '#0fa3b1', '#6d5bd0', '#fff'];
  const rect = qr.getBoundingClientRect();
  for (let i = 0; i < 42; i++) {
    const p = document.createElement('i');
    p.style.cssText = `position:fixed;z-index:30;pointer-events:none;width:9px;height:14px;border-radius:2px;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;background:${colors[i % 5]}`;
    document.body.appendChild(p);
    const a = Math.random() * Math.PI * 2;
    const d = 110 + Math.random() * 210;
    p.animate(
      [
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 150}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ],
      { duration: 1000 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)' }
    ).onfinish = () => p.remove();
  }
}
qr.addEventListener('click', triggerQR);
qr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerQR(); } });

// Flujo paso a paso del MVP
const st = [...document.querySelectorAll('.st')];
const sp = [...document.querySelectorAll('.sp')];
const prog = document.querySelector('.prog');
let cur = 0;

function go(i) {
  cur = Math.max(0, Math.min(st.length - 1, i));
  st.forEach((b, j) => {
    b.classList.toggle('act', j === cur);
    b.classList.toggle('done', j < cur);
  });
  sp.forEach((p, j) => p.classList.toggle('act', j === cur));
  prog.style.width = (cur / (st.length - 1) * 84) + '%';
  document.getElementById('prev').disabled = cur === 0;
  document.getElementById('next').disabled = cur === st.length - 1;
}
st.forEach((b, i) => b.addEventListener('click', () => go(i)));
document.getElementById('prev').onclick = () => go(cur - 1);
document.getElementById('next').onclick = () => go(cur + 1);
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') go(cur + 1);
  if (e.key === 'ArrowLeft') go(cur - 1);
});
go(0);

// Animación de barras de presupuesto y contadores KPI
const animObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    if (e.target.classList.contains('bars')) {
      e.target.classList.add('in-view');
    } else if (e.target.hasAttribute('data-count')) {
      const target = Number(e.target.dataset.count);
      const pre = e.target.dataset.pre || '';
      const suf = e.target.dataset.suf || '';
      const start = performance.now();
      const dur = 900;
      const tick = now => {
        const t = Math.min(1, (now - start) / dur);
        const val = Math.round(target * (1 - Math.pow(1 - t, 3)));
        e.target.textContent = `${pre}${val}${suf}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    animObserver.unobserve(e.target);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.bars, [data-count]').forEach(el => animObserver.observe(el));

// Visor de imágenes (lightbox) + inclinación 3D suave
const lb = document.createElement('div');
lb.id = 'lb';
lb.innerHTML = '<img alt="">';
document.body.appendChild(lb);

document.addEventListener('click', e => {
  const f = e.target.closest('.ph');
  if (f && f.querySelector('img') && !lb.classList.contains('on')) {
    lb.querySelector('img').src = f.querySelector('img').src;
    lb.classList.add('on');
  } else {
    lb.classList.remove('on');
  }
});
addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('on'); });

if (matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.ph').forEach(f => {
    f.addEventListener('mousemove', e => {
      const r = f.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      f.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });
    f.addEventListener('mouseleave', () => f.style.transform = '');
  });

  // Parallax suave en portada
  const cv = document.getElementById('portada');
  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cv.querySelector('.bg').style.transform = `translate(${x * -24}px,${y * -24}px) scale(1.05)`;
    cv.querySelector('.in').style.transform = `translate(${x * 8}px,${y * 8}px)`;
  });
}

// Aparición suave de figuras
const rv = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); }
}), { threshold: 0.2 });
document.querySelectorAll('.page > figure.ph').forEach(f => { f.classList.add('rv'); rv.observe(f); });

// Navegación lateral por puntos + sincronización con nav superior
const secs = [
  ['portada', 'Portada'], ['intro', 'Introducción'], ['bios', 'Equipo'],
  ['c1', 'Estrategia'], ['c2', 'Impacto y Flujo'], ['c3', 'Cifras y Gestión'],
  ['conclusion', 'Conclusión'], ['biblio', 'Bibliografía']
];
const dots = document.createElement('div');
dots.id = 'dots';
secs.forEach(([id, t]) => {
  const a = document.createElement('a');
  a.href = '#' + id;
  a.dataset.t = t;
  a.setAttribute('aria-label', t);
  dots.appendChild(a);
});
document.body.appendChild(dots);

const navLinks = document.querySelectorAll('#topnav a');
const dio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const href = '#' + e.target.id;
  dots.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === href));
  navLinks.forEach(a => a.classList.toggle('act', a.getAttribute('href') === href));
  e.target.classList.add('pg-in');
}), { threshold: 0.35 });
secs.forEach(([id]) => dio.observe(document.getElementById(id)));

// Botón volver arriba
const topBtn = document.createElement('button');
topBtn.id = 'top';
topBtn.textContent = '↑';
topBtn.setAttribute('aria-label', 'Volver arriba');
topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
document.body.appendChild(topBtn);
addEventListener('scroll', () => topBtn.classList.toggle('on', scrollY > 700), { passive: true });