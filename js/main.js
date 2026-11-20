/* AFORO · Edición N.º 1 — interacciones */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Separador de miles con espacio no separable (formato «232 380»)
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* ---------- Barra de progreso de lectura + botón arriba ---------- */
  const bar = $('#bar');
  const topBtn = document.createElement('button');
  topBtn.id = 'top';
  topBtn.type = 'button';
  topBtn.textContent = '↑';
  topBtn.setAttribute('aria-label', 'Volver arriba');
  topBtn.onclick = () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  document.body.appendChild(topBtn);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
      topBtn.classList.toggle('on', scrollY > 700);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Tiempo de lectura ---------- */
  const words = ($('main')?.innerText || '').split(/\s+/).filter(Boolean).length;
  const rt = $('#rt');
  if (rt) rt.textContent = `${Math.max(1, Math.round(words / 200))} min`;

  /* ---------- QR generativo + validación de la entrada ---------- */
  const qr = $('#qr');
  const ok = $('#ok');
  const ticket = $('#ticket');
  const tState = $('#t-state');
  if (qr) {
    const N = 21, S = 156 / 21;
    let seed = 2026;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const finder = (x, y) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const ring = (x, y) => {
      const a = x > 13 ? x - 14 : x, b = y > 13 ? y - 14 : y;
      return Math.max(Math.abs(a - 3), Math.abs(b - 3)) !== 2;
    };
    qr.setAttribute('viewBox', '0 0 156 156');
    const scan = $('.scan', qr);
    scan.setAttribute('x2', 156);
    let k = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const on = finder(x, y) ? ring(x, y) : rnd() > 0.52;
      if (!on) continue;
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', (x * S).toFixed(2));
      r.setAttribute('y', (y * S).toFixed(2));
      r.setAttribute('width', (S + .2).toFixed(2));
      r.setAttribute('height', (S + .2).toFixed(2));
      r.style.transformOrigin = `${x * S + S / 2}px ${y * S + S / 2}px`;
      r.style.animationDelay = (k++ * 6) + 'ms';
      qr.insertBefore(r, scan);
    }
    qr.classList.add('on');

    let valid = false;
    const confetti = () => {
      if (reduce) return;
      const colors = ['#ff5d73', '#ffd23f', '#0fa3b1', '#6d5bd0', '#ffffff'];
      const rect = qr.getBoundingClientRect();
      for (let i = 0; i < 46; i++) {
        const p = document.createElement('i');
        p.style.cssText = `position:fixed;z-index:35;pointer-events:none;width:9px;height:14px;border-radius:2px;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;background:${colors[i % 5]}`;
        document.body.appendChild(p);
        const a = Math.random() * Math.PI * 2, d = 110 + Math.random() * 220;
        p.animate([
          { transform: 'translate(0,0) rotate(0)', opacity: 1 },
          { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 150}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], { duration: 1000 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => p.remove();
      }
    };
    const toggleQR = () => {
      valid = !valid;
      ticket.classList.toggle('valid', valid);
      tState.textContent = valid ? 'Validada' : 'Pendiente';
      ok.textContent = valid ? '✓ Entrada válida · Bienvenido a AFORO' : '';
      if (valid) confetti();
    };
    qr.addEventListener('click', toggleQR);
    qr.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleQR(); }
    });
  }

  /* ---------- Cadena del evento: fragmentado vs. integrado ---------- */
  const chain = $('#chain');
  const chainNote = $('#chain-note');
  const notes = {
    frag: 'Seis eslabones, seis herramientas que no se comunican entre sí.',
    uni: 'Una sola plataforma: los datos fluyen de un eslabón al siguiente sin trabajo manual.'
  };
  $$('.sw').forEach(b => b.addEventListener('click', () => {
    const mode = b.dataset.mode;
    $$('.sw').forEach(x => {
      x.classList.toggle('act', x === b);
      x.setAttribute('aria-pressed', x === b);
    });
    chain.className = 'chain ' + mode;
    chainNote.textContent = notes[mode];
  }));

  /* ---------- Ciclo construir–medir–aprender ---------- */
  const tip = $('#bml-tip');
  const bmlDefault = tip?.textContent;
  $$('.bml-n').forEach(n => {
    const show = () => {
      $$('.bml-n').forEach(x => x.classList.toggle('on', x === n));
      tip.textContent = n.dataset.tip;
    };
    n.addEventListener('mouseenter', show);
    n.addEventListener('focus', show);
    n.addEventListener('click', show);
  });
  $('.bml svg')?.addEventListener('mouseleave', () => {
    if (document.activeElement?.classList?.contains('bml-n')) return;
    $$('.bml-n').forEach(x => x.classList.remove('on'));
    tip.textContent = bmlDefault;
  });

  /* ---------- Flujo paso a paso del MVP (pestañas accesibles) ---------- */
  const tabs = $$('.st');
  const panels = $$('.sp');
  const prog = $('.prog');
  const prev = $('#prev'), next = $('#next'), count = $('#flow-count');
  let cur = 0;
  const go = (i, focus = false) => {
    cur = Math.max(0, Math.min(tabs.length - 1, i));
    tabs.forEach((t, j) => {
      const sel = j === cur;
      t.setAttribute('aria-selected', sel);
      t.tabIndex = sel ? 0 : -1;
      t.classList.toggle('done', j < cur);
    });
    panels.forEach((p, j) => { p.hidden = j !== cur; });
    prog.style.width = (cur / (tabs.length - 1) * 75) + '%';
    prev.disabled = cur === 0;
    next.disabled = cur === tabs.length - 1;
    count.textContent = `Paso ${cur + 1} de ${tabs.length}`;
    if (focus) tabs[cur].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => go(i));
    t.addEventListener('keydown', e => {
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (e.key in map) { e.preventDefault(); go(map[e.key], true); }
    });
  });
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  if (tabs.length) go(0);

  /* ---------- Simulador de ahorro ---------- */
  const ev = $('#ev'), hr = $('#hr'), rate = $('#rate');
  const calc = () => {
    const e = +ev.value, h = +hr.value, r = +rate.value;
    $('#o-ev').textContent = e;
    $('#o-hr').textContent = h;
    $('#o-rate').textContent = r;
    const saved = e * h * 0.4;
    $('#r-h').textContent = fmt(saved);
    $('#r-d').textContent = fmt(saved / 8);
    $('#r-usd').textContent = '$' + fmt(saved * r);
  };
  if (ev) { [ev, hr, rate].forEach(i => i.addEventListener('input', calc)); calc(); }

  /* ---------- Gráfico de anillo del presupuesto ---------- */
  const donut = $('#donut');
  const legend = $$('#legend li');
  if (donut && legend.length) {
    const R = 70, C = 2 * Math.PI * R;
    const total = legend.reduce((s, li) => s + +li.dataset.v, 0);
    const dVal = $('#d-val'), dLab = $('#d-lab');
    let offset = 0;
    const segs = legend.map(li => {
      li.style.setProperty('--c', li.dataset.c);
      const len = (+li.dataset.v / total) * C;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', 100); c.setAttribute('cy', 100); c.setAttribute('r', R);
      c.setAttribute('class', 'seg');
      c.setAttribute('stroke', li.dataset.c);
      c.setAttribute('stroke-dasharray', `0 ${C}`);
      c.setAttribute('stroke-dashoffset', -offset);
      c.dataset.len = Math.max(len - 1.5, 1);
      offset += len;
      donut.appendChild(c);
      return c;
    });
    const draw = () => segs.forEach(s => s.setAttribute('stroke-dasharray', `${s.dataset.len} ${C}`));
    const focusSeg = i => {
      donut.classList.toggle('focus', i >= 0);
      segs.forEach((s, j) => s.classList.toggle('on', j === i));
      legend.forEach((li, j) => li.classList.toggle('on', j === i));
      if (i >= 0) {
        dVal.textContent = legend[i].querySelector('b').textContent;
        dLab.textContent = legend[i].querySelector('span').textContent + ' · ' + legend[i].querySelector('em').textContent;
      } else {
        dVal.textContent = '$' + fmt(total);
        dLab.textContent = 'total anual';
      }
    };
    legend.forEach((li, i) => {
      li.addEventListener('mouseenter', () => focusSeg(i));
      li.addEventListener('focus', () => focusSeg(i));
      li.addEventListener('mouseleave', () => focusSeg(-1));
      li.addEventListener('blur', () => focusSeg(-1));
      segs[i].addEventListener('mouseenter', () => focusSeg(i));
      segs[i].addEventListener('mouseleave', () => focusSeg(-1));
    });
    const io = new IntersectionObserver(es => {
      if (es[0].isIntersecting) { draw(); io.disconnect(); }
    }, { threshold: .4 });
    reduce ? draw() : io.observe(donut);
  }

  /* ---------- Filtro de riesgos ---------- */
  $$('.f').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.f;
    $$('.f').forEach(x => {
      x.classList.toggle('act', x === b);
      x.setAttribute('aria-pressed', x === b);
    });
    $$('#risks tbody tr').forEach(tr => tr.classList.toggle('out', f !== 'all' && tr.dataset.l !== f));
  }));

  /* ---------- Test de lectura ---------- */
  const qzs = $$('.qz');
  const score = $('#score');
  const updateScore = () => {
    const answered = qzs.filter(q => q.dataset.done);
    const right = answered.filter(q => q.dataset.done === 'ok').length;
    if (answered.length < qzs.length) {
      score.textContent = `Respondidas: ${answered.length} de ${qzs.length}.`;
    } else {
      const msg = right === qzs.length ? '¡Lectura perfecta!' : right >= 2 ? '¡Muy bien!' : 'Vale la pena repasar la edición.';
      score.textContent = `Resultado: ${right} de ${qzs.length}. ${msg}`;
    }
  };
  qzs.forEach(q => {
    const btns = $$('button', q);
    btns.forEach(b => b.addEventListener('click', () => {
      const good = b.dataset.a === q.dataset.ok;
      q.dataset.done = good ? 'ok' : 'ko';
      btns.forEach(x => {
        x.disabled = true;
        if (x.dataset.a === q.dataset.ok) x.classList.add('right');
      });
      if (!good) b.classList.add('wrong');
      updateScore();
    }));
  });
  $('#qreset')?.addEventListener('click', () => {
    qzs.forEach(q => {
      delete q.dataset.done;
      $$('button', q).forEach(x => { x.disabled = false; x.classList.remove('right', 'wrong'); });
    });
    score.textContent = 'Responde las tres preguntas.';
  });

  /* ---------- Contadores KPI, Gantt y aparición de figuras ---------- */
  const animIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.hasAttribute('data-count')) {
      const target = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
      const start = performance.now(), dur = 1000;
      const tick = now => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = `${pre}${Math.round(target * (1 - Math.pow(1 - t, 3)))}${suf}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      if (!reduce) requestAnimationFrame(tick);
    } else {
      el.classList.add(el.classList.contains('gantt') ? 'in-view' : 'in');
    }
    animIO.unobserve(el);
  }), { threshold: .3 });
  $$('[data-count], .gantt').forEach(el => animIO.observe(el));
  if (!reduce) $$('.page > figure.ph, .blk > figure.ph').forEach(f => { f.classList.add('rv'); animIO.observe(f); });

  /* ---------- Visor de imágenes (lightbox) ---------- */
  const lb = $('#lb');
  const lbImg = $('img', lb), lbCap = $('.lb-cap', lb);
  let lastFocus = null;
  const markImg = img => img.closest('.ph')?.classList.add('has-img');
  $$('.ph img').forEach(img => {
    if (img.complete && img.naturalWidth) markImg(img);
    else img.addEventListener('load', () => markImg(img), { once: true });
  });
  const openLb = ph => {
    const img = $('img', ph);
    if (!img) return;
    lastFocus = document.activeElement;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    const cap = ph.querySelector('figcaption') || ph.closest('figure.flow')?.querySelector(':scope > figcaption');
    lbCap.textContent = cap ? cap.textContent.trim() : img.alt;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lb-x', lb).focus();
  };
  const closeLb = () => {
    if (lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };
  document.addEventListener('click', e => {
    if (!lb.hidden) { closeLb(); return; }
    const ph = e.target.closest('.ph.has-img');
    if (ph) openLb(ph);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* ---------- Parallax suave en portada ---------- */
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    const cv = $('#portada');
    const bg = $('.bg', cv), inner = $('.in', cv);
    cv.addEventListener('mousemove', e => {
      const r = cv.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      bg.style.transform = `translate(${x * -24}px,${y * -24}px) scale(1.05)`;
      inner.style.transform = `translate(${x * 8}px,${y * 8}px)`;
    });
    cv.addEventListener('mouseleave', () => { bg.style.transform = ''; inner.style.transform = ''; });
  }

  /* ---------- Navegación lateral por puntos + sección activa ---------- */
  const secs = [
    ['portada', 'Portada'], ['sumario', 'Sumario'], ['intro', 'Introducción'], ['bios', 'Equipo'],
    ['c1', 'Estrategia'], ['c2', 'Impacto'], ['c3', 'Cifras'],
    ['conclusion', 'Conclusión'], ['biblio', 'Bibliografía']
  ];
  const dots = document.createElement('nav');
  dots.id = 'dots';
  dots.setAttribute('aria-label', 'Secciones');
  secs.forEach(([id, t]) => {
    const a = document.createElement('a');
    a.href = '#' + id;
    a.dataset.t = t;
    a.setAttribute('aria-label', t);
    dots.appendChild(a);
  });
  document.body.appendChild(dots);

  const navLinks = $$('#topnav .links a');
  const setActive = id => {
    const href = '#' + id;
    $$('a', dots).forEach(a => a.classList.toggle('on', a.getAttribute('href') === href));
    navLinks.forEach(a => {
      const on = a.getAttribute('href') === href;
      a.classList.toggle('act', on);
      if (on) {
        a.setAttribute('aria-current', 'true');
        const box = a.parentElement;
        box.scrollTo({ left: a.offsetLeft - box.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
      } else a.removeAttribute('aria-current');
    });
  };
  // Una franja central del viewport detecta la sección activa, sin importar su altura.
  const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    setActive(e.target.id);
    e.target.classList.add('pg-in');
  }), { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach(([id]) => { const el = document.getElementById(id); if (el) secIO.observe(el); });
})();
