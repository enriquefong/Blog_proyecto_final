/* AFORO · Edición N.º 1 — interacciones */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Separador de miles con espacio no separable (formato «232 380»)
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const root = document.documentElement;
  const isBook = () => root.classList.contains('book-mode');

  /* ---------- Barra de progreso de lectura + botón arriba ---------- */
  // En modo revista el progreso combina la página actual y el desplazamiento dentro de ella.
  let activePage = null, pageIdx = 0, pageTotal = 1;
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
      const max = root.scrollHeight - root.clientHeight;
      const top = scrollY;
      const p = isBook() && activePage
        ? (pageIdx + (max > 0 ? top / max : 1)) / pageTotal
        : max > 0 ? top / max : 0;
      bar.style.transform = `scaleX(${p})`;
      topBtn.classList.toggle('on', top > 700);
      ticking = false;
    });
  };
  // En captura recibe tanto el scroll de la ventana como el de cada página.
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });

  /* ---------- Tiempo de lectura ---------- */
  // textContent (no innerText) para contar también las páginas que no están a la vista.
  const words = ($('main')?.textContent || '').split(/\s+/).filter(Boolean).length;
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
    ['conclusion', 'Conclusión'], ['biblio', 'Bibliografía'], ['fin', 'Contraportada']
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
  let lastActive = 'portada';
  const setActive = id => {
    lastActive = id;
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
    if (!e.isIntersecting || isBook()) return;
    setActive(e.target.id);
    e.target.classList.add('pg-in');
  }), { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach(([id]) => { const el = document.getElementById(id); if (el) secIO.observe(el); });

  /* =========================================================
     MODO REVISTA: cada sección es una hoja que se pasa en 3D
     ========================================================= */
  const book = $('#book');
  const N = secs.length;
  const label = i => i === 0 ? 'Portada' : i === N - 1 ? 'Contraportada' : `Pág. ${i}`;

  // Envuelve cada sección en una «hoja» con anverso (la página) y reverso.
  const leaves = secs.map(([id, t], i) => {
    const el = document.getElementById(id);
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    el.before(leaf);
    leaf.appendChild(el);
    const back = document.createElement('div');
    back.className = 'leaf-back';
    back.setAttribute('aria-hidden', 'true');
    back.innerHTML = `<span>AFORO</span><em>N.º 1 · ${t}</em><i>${i || ''}</i>`;
    const shade = document.createElement('i');
    shade.className = 'shade';
    leaf.append(back, shade);
    el.tabIndex = -1;
    if (el.classList.contains('page') && i % 2 === 0) el.classList.add('alt');
    // Llamada al pie de cada página: «Pasa la página»
    if (i > 0 && i < N - 1) {
      const a = document.createElement('a');
      a.className = 'turn-next';
      a.href = '#' + secs[i + 1][0];
      a.innerHTML = `<span>Pasa la página</span><b>${label(i + 1)} · ${secs[i + 1][1]}</b><i aria-hidden="true">→</i>`;
      el.appendChild(a);
    }
    return { id, t, el, leaf, shade };
  });
  pageTotal = N;

  // Esquinas que se levantan al pasar el cursor (clic = pasar página)
  const mkCorner = (cls, txt) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'corner ' + cls;
    b.setAttribute('aria-label', txt);
    b.title = txt;
    book.appendChild(b);
    return b;
  };
  const cPrev = mkCorner('prev', 'Página anterior');
  const cNext = mkCorner('next', 'Página siguiente');

  // Controles inferiores
  const pgPrev = $('#pg-prev'), pgNext = $('#pg-next'), pgSel = $('#pg-select'), pgCount = $('#pg-count');
  leaves.forEach((p, i) => pgSel.add(new Option(i === 0 || i === N - 1 ? p.t : `${i} · ${p.t}`, i)));

  let pg = 0, busy = false, queued = null;
  const DUR = 950;

  const afterTurn = (focus = false) => {
    const p = leaves[pg];
    activePage = p.el;
    pageIdx = pg;
    p.el.classList.add('pg-in');
    setActive(p.id);
    pgSel.value = pg;
    pgCount.textContent = pg === 0 || pg === N - 1 ? label(pg) : `${label(pg)} de ${N - 2}`;
    pgPrev.disabled = cPrev.hidden = pg === 0;
    pgNext.disabled = cNext.hidden = pg === N - 1;
    book.style.setProperty('--l', Math.min(pg, 10));
    book.style.setProperty('--r', Math.min(N - 1 - pg, 10));
    document.title = `${p.t} · AFORO · Edición N.º 1`;
    if (isBook()) history.replaceState(null, '', '#' + p.id);
    if (focus) p.el.focus({ preventScroll: true });
    onScroll();
  };

  const setStatic = (i, focus) => {
    pg = i;
    leaves.forEach((p, j) => {
      p.leaf.classList.toggle('cur', j === i);
      p.leaf.classList.remove('under', 'turning');
    });
    afterTurn(focus);
  };

  const ease = 'cubic-bezier(.45,.05,.3,1)';
  const turnTo = async (i, focus = false) => {
    i = Math.max(0, Math.min(N - 1, i));
    if (i === pg) return;
    if (busy) { queued = [i, focus]; return; }
    if (!isBook()) { leaves[i].el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    busy = true;
    const fwd = i > pg;
    const from = leaves[pg], to = leaves[i];
    // La página se ve completa (sin scroll interno): antes de girar se vuelve al inicio de la hoja.
    const bookTop = book.getBoundingClientRect().top + scrollY - $('#topnav').offsetHeight - 8;
    if (scrollY > bookTop) scrollTo({ top: Math.max(0, bookTop), behavior: 'instant' });

    if (reduce) {
      setStatic(i, focus);
    } else {
      // Durante el giro ambas hojas se recortan a la altura visible de la pantalla.
      const pagerH = $('#pager').offsetHeight;
      book.style.height = Math.max(320, innerHeight - book.getBoundingClientRect().top - pagerH - 12) + 'px';
      // Avanzar: la hoja actual gira sobre el lomo y deja ver la siguiente.
      // Retroceder: la hoja anterior vuelve desde el lado izquierdo y cubre la actual.
      const turner = fwd ? from : to, below = fwd ? to : from;
      turner.leaf.classList.add('turning');
      below.leaf.classList.add('under');
      from.leaf.classList.remove('cur');
      book.classList.add('is-turning');
      const k = [
        { transform: 'rotateY(0deg)' },
        { transform: 'rotateY(-60deg) skewY(-2deg)', offset: .35 },
        { transform: 'rotateY(-180deg)' }
      ];
      const opts = { duration: DUR, easing: ease, direction: fwd ? 'normal' : 'reverse' };
      const anim = turner.leaf.animate(k, opts);
      turner.shade.animate([{ opacity: 0 }, { opacity: .5, offset: .5 }, { opacity: .5 }], opts);
      below.shade.animate([{ opacity: .55 }, { opacity: 0 }], { ...opts, direction: fwd ? 'normal' : 'reverse' });
      // Si la pestaña queda en segundo plano el giro se congela: no bloquear la navegación.
      await Promise.race([anim.finished.catch(() => {}), new Promise(r => setTimeout(r, DUR + 400))]);
      turner.leaf.getAnimations().concat(turner.shade.getAnimations(), below.shade.getAnimations()).forEach(a => a.cancel());
      book.classList.remove('is-turning');
      book.style.height = '';
      setStatic(i, focus);
    }
    busy = false;
    if (queued) { const [q, f] = queued; queued = null; turnTo(q, f); }
  };

  const step = d => turnTo(pg + d);
  pgPrev.addEventListener('click', () => step(-1));
  pgNext.addEventListener('click', () => step(1));
  cPrev.addEventListener('click', () => step(-1));
  cNext.addEventListener('click', () => step(1));
  pgSel.addEventListener('change', () => turnTo(+pgSel.value));

  // Enlaces internos (sumario, menú, «pasa la página»…) pasan las hojas en vez de desplazar.
  const pageOf = id => {
    try { id = decodeURIComponent(id); } catch (_) {}
    return id ? leaves.findIndex(p => p.id === id || p.el.querySelector('#' + CSS.escape(id))) : -1;
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !isBook()) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const i = id ? pageOf(id) : -1;
    if (i < 0) return;
    e.preventDefault();
    turnTo(i, true);
  });
  addEventListener('hashchange', () => {
    const i = pageOf(location.hash.slice(1));
    if (isBook() && i >= 0) turnTo(i);
  });

  // Teclado: ← → pasan página (excepto dentro de controles que ya usan las flechas)
  addEventListener('keydown', e => {
    if (!isBook() || !lb.hidden || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest?.('input, textarea, select, [role="tab"], [contenteditable]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  // Deslizar con el dedo en pantallas táctiles
  let tx = null, ty = 0, tt = 0;
  book.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || e.target.closest('input, .gantt-fig, .tbl-wrap')) { tx = null; return; }
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now();
  }, { passive: true });
  book.addEventListener('touchend', e => {
    if (tx === null || !isBook()) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - tt < 800) step(dx < 0 ? 1 : -1);
    tx = null;
  }, { passive: true });

  // Cambio entre «vista revista» y «vista continua»
  const modeBtn = $('#mode');
  const setMode = (on, save = true) => {
    root.classList.toggle('book-mode', on);
    modeBtn.setAttribute('aria-pressed', on);
    $('span', modeBtn).textContent = on ? 'Vista continua' : 'Vista revista';
    if (save) { try { localStorage.setItem('aforo-mode', on ? 'book' : 'scroll'); } catch (_) {} }
    if (on) {
      setStatic(Math.max(0, leaves.findIndex(p => p.id === lastActive)));
      scrollTo(0, 0);
    } else {
      history.replaceState(null, '', location.pathname + location.search);
      leaves[pg].el.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    onScroll();
  };
  modeBtn.addEventListener('click', () => setMode(!isBook()));

  // Estado inicial: abre la página indicada en la URL (#c2, #bios…)
  const start = Math.max(0, pageOf(location.hash.slice(1)));
  if (isBook()) {
    lastActive = leaves[start].id;
    setMode(true, false);
    addEventListener('load', () => { if (isBook()) scrollTo(0, 0); });
  } else {
    modeBtn.setAttribute('aria-pressed', 'false');
    $('span', modeBtn).textContent = 'Vista revista';
    pg = start;
    onScroll();
  }

  // Pista de uso la primera vez
  let seen = false;
  try { seen = localStorage.getItem('aforo-hint') === '1'; localStorage.setItem('aforo-hint', '1'); } catch (_) {}
  if (!seen && isBook()) {
    const h = document.createElement('div');
    h.id = 'hint';
    h.setAttribute('role', 'status');
    h.innerHTML = '<b>Hojea la revista</b> Usa las flechas ← →, desliza el dedo o toca la esquina de la página.';
    document.body.appendChild(h);
    const bye = () => { h.classList.add('out'); setTimeout(() => h.remove(), 400); };
    setTimeout(bye, 5500);
    h.addEventListener('click', bye);
  }
})();
