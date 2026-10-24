// BOLD v2: sideways walk on landscape iPad and laptop, plain vertical page on phones and upright iPads.
document.documentElement.classList.add('js');

const track = document.getElementById('track');
const fill = document.getElementById('progress-fill');
const wide = window.matchMedia('(min-width: 768px) and (min-height: 500px) and (orientation: landscape)');
const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

const isSideways = () => wide.matches;

// A mouse wheel moves the page sideways. Trackpads that already scroll sideways keep working.
track.addEventListener('wheel', (e) => {
  if (!isSideways() || e.ctrlKey) return;
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? track.clientWidth : 1;
  track.scrollLeft += e.deltaY * unit;
  e.preventDefault();
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
  track.scrollBy({ left: by, behavior: calm.matches || Math.abs(by) < 200 ? 'auto' : 'smooth' });
});

// In-page links glide to their section in either direction.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const behavior = calm.matches ? 'auto' : 'smooth';
  if (isSideways()) {
    const left = target.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left, behavior });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - 16;
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

// Sections arrive part by part as they come into view.
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    reveal.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.panel').forEach((panel) => {
  panel.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.setProperty('--i', i);
    reveal.observe(el);
  });
});

// The monument and the footer wordmark are fitted to the width, and capped by the room below the photo.
function fitWords() {
  document.querySelectorAll('.monument, .foot-word').forEach((el) => {
    el.style.fontSize = '100px';
    el.style.transform = '';
    const style = getComputedStyle(el);
    const room = el.parentElement.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const word = el.querySelector('.word') || el;
    let size = 100 * room / word.getBoundingClientRect().width * 0.99;
    if (el.classList.contains('monument') && isSideways()) {
      const band = el.parentElement.clientHeight * 0.5 - 90;
      size = Math.min(size, band / 0.74);
    }
    el.style.fontSize = `${size}px`;
    // Never let the monument run into the sentence above it.
    const row = el.classList.contains('monument') && el.parentElement.querySelector('.hero-row');
    if (row && isSideways()) {
      let guard = 40;
      while (guard-- && el.getBoundingClientRect().top < row.getBoundingClientRect().bottom + 8) {
        size *= 0.97;
        el.style.fontSize = `${size}px`;
      }
    }
  });
}
document.fonts.ready.then(fitWords);
window.addEventListener('resize', fitWords);
wide.addEventListener('change', fitWords);

// The monument settles a few percent as the first screen leaves.
const monument = document.querySelector('.monument');
track.addEventListener('scroll', () => {
  if (!isSideways() || calm.matches) return;
  const t = Math.min(1, track.scrollLeft / window.innerWidth);
  monument.style.transform = `scale(${1 - 0.06 * t})`;
}, { passive: true });

// Work index: point at a name to see its picture.
const names = document.querySelectorAll('.names a');
const frames = document.querySelectorAll('.preview > *');
const pick = (a) => {
  names.forEach((n) => n.classList.toggle('is-on', n === a));
  frames.forEach((f, i) => f.classList.toggle('is-on', i === Number(a.dataset.preview)));
};
names.forEach((a) => {
  a.addEventListener('mouseenter', () => pick(a));
  a.addEventListener('focus', () => pick(a));
});

// Services: point at a line to read what it covers.
const desc = document.querySelector('.svc-desc');
const lines = document.querySelectorAll('.svc li');
const show = (li) => {
  lines.forEach((l) => l.classList.toggle('is-on', l === li));
  desc.textContent = li.dataset.desc;
};
if (desc && lines.length) show(lines[0]);
lines.forEach((li) => {
  li.addEventListener('mouseenter', () => show(li));
  li.addEventListener('focus', () => show(li));
  li.addEventListener('click', () => show(li));
});
