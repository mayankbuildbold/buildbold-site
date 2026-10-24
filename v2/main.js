// BOLD v2: sideways walk on iPad and laptop, plain vertical page on phones.
document.documentElement.classList.add('js');

const track = document.getElementById('track');
const fill = document.getElementById('progress-fill');
const wide = window.matchMedia('(min-width: 768px)');
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
