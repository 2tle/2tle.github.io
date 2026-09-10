// All content is available before enhancement. The scenery follows native scrolling.
document.documentElement.classList.add('js');

const landscapeFrames = [...document.querySelectorAll('.landscape-frame')];
const progressFill = document.querySelector('.reading-progress span');
const experience = document.querySelector('.experience');
const experienceFill = document.querySelector('.experience-line span');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const projectScenes = [...document.querySelectorAll('.project')].map((element) => ({
  element,
  object: element.querySelector('.project-object'),
}));
const surfaces = [...document.querySelectorAll('.project, .stack-row')];
let activeSurface;
let frame = 0;
let pointer = { x: 0, y: 0 };

// Keep the previous scene visible until the incoming image has decoded successfully.
const readyFrames = new Set([landscapeFrames[0]]);
for (const image of landscapeFrames.slice(1)) {
  image.decode().then(() => {
    readyFrames.add(image);
    schedule();
  }).catch(() => { /* The preceding illustration remains the fallback. */ });
}

const clamp = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function resetSurface() {
  if (!activeSurface) return;
  activeSurface.classList.remove('is-lit');
  for (const property of ['--light-x', '--light-y', '--tilt-x', '--tilt-y']) {
    activeSurface.style.removeProperty(property);
  }
  activeSurface = undefined;
}

function resetMotion() {
  landscapeFrames.forEach((image, index) => { image.style.opacity = index === 0 ? '1' : '0'; });
  if (experienceFill) experienceFill.style.transform = '';
  for (const { object } of projectScenes) {
    if (object) object.style.transform = '';
  }
  resetSurface();
}

function readScrollState() {
  const viewport = innerHeight;
  const pageProgress = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - viewport));
  const experienceBounds = experience?.getBoundingClientRect();
  const experienceProgress = experienceBounds
    ? smooth((viewport * .75 - experienceBounds.top) / Math.max(1, experienceBounds.height * .72))
    : 0;
  const projects = projectScenes.map(({ element, object }) => {
    const bounds = element.getBoundingClientRect();
    return { element, object, progress: smooth((viewport * .92 - bounds.top) / Math.max(1, viewport * .8)) };
  });
  let light;
  if (activeSurface && finePointer.matches) {
    const bounds = activeSurface.getBoundingClientRect();
    light = {
      element: activeSurface,
      x: clamp((pointer.x - bounds.left) / Math.max(1, bounds.width)),
      y: clamp((pointer.y - bounds.top) / Math.max(1, bounds.height)),
    };
  }
  return { pageProgress, experienceProgress, projects, light };
}

function render() {
  frame = 0;
  const state = readScrollState();
  if (progressFill) progressFill.style.transform = `scaleX(${state.pageProgress.toFixed(5)})`;
  if (reducedMotion.matches) {
    resetMotion();
    return;
  }
  // Opaque lower layers prevent the canvas flashing through during each dissolve.
  landscapeFrames.forEach((image, index) => {
    const opacity = index === 0 ? 1 : readyFrames.has(image)
      ? smooth(state.pageProgress * 3 - (index - 1)) : 0;
    image.style.opacity = opacity.toFixed(5);
  });
  if (experienceFill) experienceFill.style.transform = `scaleY(${state.experienceProgress.toFixed(4)})`;
  for (const { object, progress } of state.projects) {
    if (!object) continue;
    object.style.transform = `translate3d(0, ${(24 * (1 - progress)).toFixed(2)}px, 0) scale(${(.92 + progress * .08).toFixed(4)})`;
  }
  if (state.light) {
    const { element, x, y } = state.light;
    element.style.setProperty('--light-x', `${(x * 100).toFixed(2)}%`);
    element.style.setProperty('--light-y', `${(y * 100).toFixed(2)}%`);
    element.style.setProperty('--tilt-x', `${((.5 - y) * 3).toFixed(2)}deg`);
    element.style.setProperty('--tilt-y', `${((x - .5) * 4).toFixed(2)}deg`);
    element.classList.add('is-lit');
  }
}

function schedule() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(render);
}

const revealItems = [...document.querySelectorAll('.reveal-left, .reveal-right, .reveal-entry, .reveal-stack, .reveal-project, .reveal-scale')];
let revealObserver;
const show = (element) => element.classList.add('is-visible');

function applyReveals() {
  revealObserver?.disconnect();
  revealObserver = undefined;
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(show);
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      show(entry.target);
      revealObserver.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  for (const element of revealItems) {
    if (element.getBoundingClientRect().top < innerHeight * .94) show(element);
    else revealObserver.observe(element);
  }
}

for (const surface of surfaces) {
  const light = document.createElement('span');
  light.className = 'surface-light';
  light.setAttribute('aria-hidden', 'true');
  surface.append(light);
  surface.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    if (activeSurface !== surface) {
      resetSurface();
      activeSurface = surface;
    }
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  }, { passive: true });
  surface.addEventListener('pointerleave', resetSurface);
  surface.addEventListener('pointercancel', resetSurface);
}

function settleInitialHash() {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (!target) return;
  const offset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const heading = target.querySelector('.section-heading h2');
  const anchor = heading || target;
  const top = Math.max(0, anchor.getBoundingClientRect().top + scrollY - offset);
  const previous = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  scrollTo(0, top);
  document.documentElement.style.scrollBehavior = previous;
}

addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
addEventListener('pageshow', schedule);
addEventListener('load', schedule, { once: true });
new ResizeObserver(schedule).observe(document.body);
addEventListener('blur', resetSurface);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(frame);
    frame = 0;
    resetSurface();
  } else schedule();
});
document.addEventListener('focusin', (event) => {
  event.target.closest('.reveal-left, .reveal-right, .reveal-entry, .reveal-stack, .reveal-project, .reveal-scale')?.classList.add('is-visible');
  schedule();
});
reducedMotion.addEventListener('change', () => {
  applyReveals();
  if (reducedMotion.matches) resetMotion();
  schedule();
});
finePointer.addEventListener('change', resetSurface);

applyReveals();
schedule();
if (location.hash) {
  [0, 120, 320].forEach((delay) => setTimeout(settleInitialHash, delay));
  document.fonts?.ready.then(() => setTimeout(settleInitialHash, 180));
}
