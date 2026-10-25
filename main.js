// BOLD v2: sideways walk on iPad and laptop, plain vertical page on phones.
document.documentElement.classList.add('js');

const track = document.getElementById('track');
const fill = document.getElementById('progress-fill');
const wide = window.matchMedia('(min-width: 768px) and (orientation: landscape)');
const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

const isSideways = () => wide.matches;

// Wheel scrolling glides: each notch moves a target, and the page eases towards it.
const glide = (() => {
  let target = 0, running = false;
  const max = () => track.scrollWidth - track.clientWidth;
  let last = null;
  const step = () => {
    if (!running) return;
    const now = track.scrollLeft;
    // Something else moved the page (trackpad, keys, a link): let it, and stop gliding
    if (last !== null && Math.abs(now - last) > 2) { running = false; target = now; return; }
    const d = target - now;
    if (Math.abs(d) < 1) { running = false; last = null; return; }
    track.scrollLeft = now + Math.sign(d) * Math.max(1, Math.abs(d) * 0.14);
    last = track.scrollLeft;
    requestAnimationFrame(step);
  };
  // If something else moves the page (keys, links, trackpad), start from where it is.
  track.addEventListener('scroll', () => { if (!running) target = track.scrollLeft; }, { passive: true });
  return {
    to(by) {
      if (!running) target = track.scrollLeft;
      target = Math.max(0, Math.min(max(), target + by));
      if (!running) { running = true; last = null; requestAnimationFrame(step); }
    },
    stop() { running = false; last = null; target = track.scrollLeft; },
  };
})();

// A mouse wheel moves the page sideways. Trackpads that already scroll sideways keep working.
track.addEventListener('wheel', (e) => {
  if (!isSideways() || e.ctrlKey) return;
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) { glide.stop(); return; }
  const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? track.clientWidth : 1;
  e.preventDefault();
  if (calm.matches) { track.scrollLeft += e.deltaY * unit; return; }
  glide.to(e.deltaY * unit);
}, { passive: false });

// Keyboard: the usual page keys move one screen sideways.
document.addEventListener('keydown', (e) => {
  if (!isSideways() || e.altKey || e.metaKey || e.ctrlKey) return;
  if (e.target.closest('input, textarea, select, button')) return;
  const step = track.clientWidth * 0.85;
  const moves = {
    PageDown: step, PageUp: -step, ArrowDown: 120, ArrowUp: -120,
    ArrowRight: 120, ArrowLeft: -120, Home: -track.scrollWidth, End: track.scrollWidth,
  };
  let by = moves[e.key];
  if (e.key === ' ') by = e.shiftKey ? -step : step;
  if (by === undefined) return;
  e.preventDefault();
  glide.stop();
  track.scrollBy({ left: by, behavior: calm.matches || Math.abs(by) < 200 ? 'auto' : 'smooth' });
});

// In-page links glide to their section in either direction.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  glide.stop();
  const behavior = calm.matches ? 'auto' : 'smooth';
  if (isSideways()) {
    const left = target.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left, behavior });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior });
  }
  history.replaceState(null, '', a.getAttribute('href'));
});

// Progress along the bottom edge.
function progress() {
  let p;
  if (isSideways()) {
    const max = track.scrollWidth - track.clientWidth;
    p = max > 0 ? track.scrollLeft / max : 0;
  } else {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    p = max > 0 ? window.scrollY / max : 0;
  }
  fill.style.transform = `scaleX(${p})`;
}
track.addEventListener('scroll', progress, { passive: true });
window.addEventListener('scroll', progress, { passive: true });
window.addEventListener('resize', progress);
wide.addEventListener('change', () => { track.scrollLeft = 0; progress(); });
progress();

// Work index: show one discipline at a time.
const chips = document.querySelectorAll('.chip');
const rows = document.querySelectorAll('.index-list li');
chips.forEach((chip) => chip.addEventListener('click', () => {
  const pick = chip.dataset.filter;
  chips.forEach((c) => {
    const on = c === chip;
    c.classList.toggle('is-on', on);
    c.setAttribute('aria-pressed', on);
  });
  rows.forEach((row) => row.classList.toggle('is-dim', pick !== 'all' && row.dataset.discipline !== pick));
}));

// Parts that arrive as they come onto the screen (driven by the scroll loop at the end).
const parts = [
  '.services-head > *', '.service', '.index > h2', '.filter', '.index-list li', '.wp-intro > *', '.wp-group h3', '.wp-tiles li',
  '.project-copy > *', '.tile', '.approach-head > *', '.approach-foot', '.principles article', '.contact-copy > *', '.foot',
].join(', ');
document.querySelectorAll('.panel:not(.hero)').forEach((panel) => {
  panel.querySelectorAll(parts).forEach((el) => {
    el.classList.add('rv');
  });
});

// Pictures fade in once loaded.
document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
  img.decoding = 'async';
  if (img.complete) img.classList.add('loaded');
  else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
});

// The nav marks the section in view.
const navLinks = [...document.querySelectorAll('.bar-nav a[href^="#"]')];
const watched = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
function markCurrent() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const here = watched.find((s) => {
    const r = s.getBoundingClientRect();
    return r.left <= cx && r.right >= cx && r.top <= cy && r.bottom >= cy;
  });
  navLinks.forEach((a) => a.setAttribute('aria-current', String(!!here && a.getAttribute('href') === `#${here.id}`)));
}
track.addEventListener('scroll', markCurrent, { passive: true });
window.addEventListener('scroll', markCurrent, { passive: true });
markCurrent();

// The sideways hint leaves after the first scroll.
const hint = document.querySelector('.hint');
const dropHint = () => {
  if (track.scrollLeft > 40 || window.scrollY > 40) hint && hint.classList.add('gone');
};
track.addEventListener('scroll', dropHint, { passive: true });
window.addEventListener('scroll', dropHint, { passive: true });

// Safety net: a big heading whose longest word is wider than its box shrinks until it fits.
function fitHeadings() {
  document.querySelectorAll('.panel h1, .panel h2, .panel h3, .ix-name').forEach((h) => {
    h.style.fontSize = '';
    let guard = 30;
    while (guard-- && h.scrollWidth > h.clientWidth + 1) {
      h.style.fontSize = `${parseFloat(getComputedStyle(h).fontSize) * 0.95}px`;
    }
  });
}
document.fonts.ready.then(fitHeadings);
window.addEventListener('resize', fitHeadings);

// Cursor from the old site, with a little lag so it trails the pointer
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.documentElement.classList.add('has-cursor');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x = 0, y = 0, cx = 0, cy = 0, running = false;
  const draw = () => {
    cx += (x - cx) * (still ? 1 : 0.25);
    cy += (y - cy) * (still ? 1 : 0.25);
    dot.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    running = Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1;
    if (running) requestAnimationFrame(draw);
  };
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    if (!dot.classList.contains('on')) { cx = x; cy = y; dot.classList.add('on'); }
    if (!running) { running = true; requestAnimationFrame(draw); }
    dot.classList.toggle('hover', !!e.target.closest('a, button, label, .tile, .wp-tiles li'));
  });
  document.documentElement.addEventListener('pointerleave', () => dot.classList.remove('on'));
})();

// ---------- Motion pass ----------
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Split big headings into words; fitHeadings still measures the heading as a whole
  const splitWords = (h) => {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    const label = h.textContent.trim();
    h.setAttribute('aria-label', label);
    h.innerHTML = label.split(/\s+/).map((w, i) => `<span class="w" aria-hidden="true" style="--w:${i}">${w}</span>`).join(' ');
  };
  const heads = document.querySelectorAll('.panel .display');
  heads.forEach(splitWords);
  document.fonts.ready.then(fitHeadings);

  // Footer word, letter by letter
  document.querySelectorAll('.foot-word').forEach((f) => {
    f.innerHTML = [...f.textContent].map((c, i) => `<span class="l" style="--l:${i}">${c}</span>`).join('');
  });


  // Hero picture: slight drift and zoom as you scroll away from it
  const heroImg = document.querySelector('.hero-figure img');
  if (heroImg) {
    let ticking = false;
    const drift = () => {
      ticking = false;
      const along = wide.matches ? track.scrollLeft : window.scrollY;
      const span = wide.matches ? window.innerWidth : window.innerHeight;
      const p = Math.min(along / span, 1);
      heroImg.style.transform = wide.matches
        ? `translateX(${p * 12}%) scale(${1 + p * 0.06})`
        : `translateY(${p * 10}%) scale(${1 + p * 0.06})`;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(drift); } };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

// ---------- Interactive motion ----------
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const dot = document.querySelector('.cursor');
  // "View" cursor over pictures that open a project
  addEventListener('pointerover', (e) => {
    if (dot) dot.classList.toggle('view', !!e.target.closest('.wp-tiles a'));
  });

  // Magnetic buttons
  document.querySelectorAll('.btn, .mail, .link').forEach((el) => {
    el.classList.add('magnet');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `translate(${dx * 14}px, ${dy * 10}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  // Tilt helper: rotate an element towards the pointer
  const tilt = (area, target, deg, shift) => {
    area.addEventListener('pointermove', (e) => {
      const r = area.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      target.style.rotate = `${-y} ${x} 0 ${deg * Math.hypot(x, y) * 2}deg`;
      if (shift && window.__nudge) window.__nudge(shift, -x * 12, -y * 12);
    });
    area.addEventListener('pointerleave', () => { target.style.rotate = ''; if (shift && window.__nudge) window.__nudge(shift, 0, 0); });
  };
  const heroFig = document.querySelector('.hero-figure');
  if (heroFig) tilt(heroFig, heroFig.querySelector('img'), 6);
  document.querySelectorAll('.wp-tiles a').forEach((a) => tilt(a, a, 8, a.querySelector('img')));

  // Light that follows the pointer across the colour fields
  document.querySelectorAll('.service').forEach((s) => s.addEventListener('pointermove', (e) => {
    const r = s.getBoundingClientRect();
    s.style.setProperty('--mx', `${e.clientX - r.left}px`);
    s.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  // Big numbers lean towards the pointer
  const rules = document.querySelector('.principles');
  if (rules) {
    rules.addEventListener('pointermove', (e) => {
      rules.querySelectorAll('.pr-num').forEach((n) => {
        const r = n.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
        if (window.__nudge) window.__nudge(n, dx * 30, dy * 20);
      });
    });
    rules.addEventListener('pointerleave', () => rules.querySelectorAll('.pr-num').forEach((n) => window.__nudge && window.__nudge(n, 0, 0)));
  }
}

// ---------- Scroll-scrubbed motion ----------
// Every animation follows the scroll position. Parts arrive as they come onto the screen (and go
// back if you scroll back), then drift at their own speed while they cross it. Positions are
// measured once and on resize, so scrolling never forces a layout read.
if (!calm.matches) {
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - (1 - t) ** 3;
  const drifts = [
    ['.panel .display', 0, 24], ['.services-head p, .wp-intro p, .project-copy p', 0, 14],
    ['.service h3', 0, -24], ['.service ul', 0, 14], ['.tile:nth-child(odd)', 0, 22], ['.tile:nth-child(even)', 0, -22],
    ['.wp-frame img', -16, 0], ['.pr-num', 0, -30],
  ];
  const items = new Map();
  const item = (el) => {
    if (!items.has(el)) items.set(el, { el, ax: 0, ay: 0, ix: 0, iy: 0, lead: 0, mid: 0, lag: 0 });
    return items.get(el);
  };
  document.querySelectorAll('.rv').forEach((el) => {
    const it = item(el);
    if (el.matches('.service')) it.wipe = true;
    else it.fade = true;
    if (!el.matches('.tile, .wp-tiles li, .service')) {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('rv'));
      it.lag = Math.min(sibs.indexOf(el), 4) * 0.12;
    }
  });
  document.querySelectorAll('.tile img, .wp-frame img').forEach((img) => { item(img).host = img.closest('.rv'); });
  document.querySelectorAll('.panel:not(.hero) .display').forEach((h) => { item(h).words = [...h.querySelectorAll('.w')]; });
  drifts.forEach(([sel, ax, ay]) => document.querySelectorAll(sel).forEach((el) => { const it = item(el); it.ax = ax; it.ay = ay; }));
  const list = [...items.values()];
  const footWord = document.querySelector('.foot-word');

  const measure = () => {
    const across = wide.matches;
    list.forEach((it) => { it.el.style.translate = ''; });
    list.forEach((it) => {
      const r = it.el.getBoundingClientRect();
      it.lead = across ? r.left + track.scrollLeft : r.top + window.scrollY;
      it.mid = it.lead + (across ? r.width : r.height) / 2;
    });
    if (footWord) {
      const r = footWord.getBoundingClientRect();
      footWord._mid = across ? r.left + track.scrollLeft + r.width / 2 : r.top + window.scrollY + r.height / 2;
    }
    frame();
  };
  // 0 before the part reaches the far edge of the screen, 1 once it has come a third of the way in
  const arrive = (lead, lag, pos, size) => ease(clamp((size * 0.95 - (lead - pos)) / (size * 0.35) - lag));
  const frame = () => {
    const across = wide.matches;
    const pos = across ? track.scrollLeft : window.scrollY;
    const size = across ? innerWidth : innerHeight;
    list.forEach((it) => {
      const host = it.host ? items.get(it.host) : it;
      const e = arrive(host.lead, host.lag, pos, size);
      const p = clamp((it.mid - pos - size / 2) / size, -1.2, 1.2);
      let tx = it.ix + (across ? -it.ax * p : 0);
      let ty = it.iy + it.ay * p;
      if (it.fade) { it.el.style.opacity = e.toFixed(3); ty += (1 - e) * 36; }
      if (it.wipe) it.el.style.clipPath = e >= 1 ? '' : `inset(${((1 - e) * 100).toFixed(2)}% 0 0 0)`;
      if (it.host) {
        it.el.style.clipPath = e >= 1 ? '' : `inset(${((1 - e) * 100).toFixed(2)}% 0 0 0)`;
        it.el.style.scale = e >= 1 ? '' : (1 + (1 - e) * 0.12).toFixed(3);
      }
      if (it.words) {
        const we = arrive(it.lead, 0, pos, size);
        const n = it.words.length;
        it.words.forEach((w, i) => {
          const k = clamp(we * (1 + n * 0.15) - i * 0.15);
          w.style.opacity = k.toFixed(3);
          w.style.translate = `0 ${((1 - k) * 0.5).toFixed(3)}em`;
          w.style.rotate = `${((1 - k) * 3).toFixed(2)}deg`;
        });
      }
      it.el.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
    });
    if (footWord) footWord.style.setProperty('--p', clamp((footWord._mid - pos - size / 2) / size, 0, 1.2).toFixed(3));
  };
  let queued = false;
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; frame(); }); } };
  track.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  document.fonts.ready.then(measure);
  document.documentElement.classList.add('scroll-motion');
  measure();
  // Pointer effects add their own offset on top of the scroll motion
  window.__nudge = (el, x, y) => { const it = items.get(el); if (it) { it.ix = x; it.iy = y; queue(); } };
}
