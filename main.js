// Progressive scroll choreography. Content and links never depend on this file.
const hero = document.querySelector('.hero');
const stage = document.querySelector('.hero-stage');
const copy = document.querySelector('.hero-copy');
const moon = document.querySelector('.moon');
const visuals = [...document.querySelectorAll('.project-visual')].map((element) => ({
  element,
  object: element.querySelector('.project-object'),
}));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 900px) and (min-height: 650px)');
let frame = 0;

const clamp = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };

function reset() {
  moon.style.transform = '';
  copy.style.transform = '';
  copy.style.opacity = '';
  for (const { object } of visuals) {
    object.style.transform = '';
    object.style.opacity = '';
  }
}

function render() {
  frame = 0;
  if (reducedMotion.matches) { reset(); return; }

  // Read layout together before applying any transforms.
  const viewport = innerHeight;
  const bounds = hero.getBoundingClientRect();
  const pinned = hero.classList.contains('is-pinned');
  const travel = hero.offsetHeight - stage.offsetHeight;
  const progress = pinned ? clamp(-bounds.top / Math.max(1, travel)) : clamp(-bounds.top / Math.max(1, bounds.height));
  const entries = visuals.map(({ element, object }) => ({
    object,
    top: element.getBoundingClientRect().top,
    focused: element.closest('a').matches(':focus-within'),
  }));

  if (pinned) {
    moon.style.transform = `translate3d(${-14 * progress}%, ${-4 * progress}%, 0) scale(${1 + .72 * progress}) rotate(${-6 * progress}deg)`;
    copy.style.transform = `translate3d(0, ${-72 * progress}px, 0)`;
    copy.style.opacity = String(1 - smooth((progress - .12) / .84));
  } else {
    moon.style.transform = `translate3d(0, ${-24 * progress}px, 0) scale(${1 + .12 * progress})`;
    copy.style.transform = '';
    copy.style.opacity = '';
  }

  for (const { object, top, focused } of entries) {
    const reveal = focused ? 1 : smooth((viewport - top) / (viewport * .72));
    const amount = desktop.matches ? .16 : .06;
    const distance = desktop.matches ? 48 : 20;
    object.style.transform = `translate3d(0, ${distance * (1 - reveal)}px, 0) scale(${1 - amount * (1 - reveal)})`;
    object.style.opacity = String(.55 + .45 * reveal);
  }
}

function schedule() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(render);
}

function configure() {
  // Large text, short viewports and mobile keep normal flow, not clipped pinning.
  const fits = copy.scrollHeight + 192 <= innerHeight;
  hero.classList.toggle('is-pinned', !reducedMotion.matches && desktop.matches && fits);
  schedule();
}

addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', configure, { passive: true });
addEventListener('pageshow', configure);
reducedMotion.addEventListener('change', configure);
desktop.addEventListener('change', configure);
document.addEventListener('focusin', schedule);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
  else configure();
});
if ('ResizeObserver' in window) new ResizeObserver(configure).observe(copy);
document.fonts?.ready.then(configure);
configure();

// Initial native anchors may be resolved before progressive pinning changes height.
if (/^#(?:main|work|journey|contact)$/.test(location.hash)) {
  requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
}
