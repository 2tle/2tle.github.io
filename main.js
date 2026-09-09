// Progressive enhancement: every fact and destination remains available without this file.
document.documentElement.classList.add('js');

const hero = document.querySelector('.hero');
const heroCopy = document.querySelector('.hero-copy');
const heroStage = document.querySelector('.hero-stage');
const moon = document.querySelector('.moon');
const experience = document.querySelector('.experience');
const experienceFill = document.querySelector('.experience-line span');
const projectScenes = [...document.querySelectorAll('.project')].map((element) => ({
  element,
  object: element.querySelector('.project-object'),
}));
const surfaces = [...document.querySelectorAll('.project, .stack-row, .about-portrait')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktopScene = matchMedia('(min-width: 900px) and (min-height: 650px)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let frame = 0;
let activeSurface;
let pointer = { x: 0, y: 0 };

const clamp = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function resetMotion() {
  moon.style.transform = '';
  heroCopy.style.transform = '';
  heroCopy.style.opacity = '';
  experienceFill.style.transform = '';
  heroStage.style.removeProperty('--hero-progress');
  for (const { element, object } of projectScenes) {
    if (object) object.style.transform = '';
    element.style.removeProperty('--scene-progress');
  }
  resetSurface();
}

function resetSurface() {
  if (!activeSurface) return;
  activeSurface.classList.remove('is-lit');
  for (const property of ['--light-x', '--light-y', '--tilt-x', '--tilt-y']) {
    activeSurface.style.removeProperty(property);
  }
  activeSurface = undefined;
}

function readScrollState() {
  const viewport = innerHeight;
  const heroBounds = hero.getBoundingClientRect();
  const pinned = hero.classList.contains('is-pinned');
  const travel = hero.offsetHeight - heroStage.offsetHeight;
  const heroProgress = pinned ? clamp(-heroBounds.top / Math.max(1, travel)) : 0;
  const experienceBounds = experience.getBoundingClientRect();
  const experienceProgress = smooth((viewport * .72 - experienceBounds.top) / Math.max(1, experienceBounds.height * .72));
  const projects = projectScenes.map(({ element, object }) => {
    // Measure the untransformed card: measuring the animated image creates a feedback loop.
    const bounds = element.getBoundingClientRect();
    const focus = element.matches(':focus-within');
    return { element, object, progress: focus ? 1 : smooth((viewport * .94 - bounds.top) / Math.max(1, viewport * .85)) };
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
  return { pinned, heroProgress, experienceProgress, projects, light };
}

function render() {
  frame = 0;
  if (reducedMotion.matches) {
    resetMotion();
    return;
  }

  // Read all geometry before a single style write, preventing layout read/write interleaving.
  const state = readScrollState();
  heroStage.style.setProperty('--hero-progress', state.heroProgress.toFixed(4));

  if (state.pinned) {
    const scale = 1 + state.heroProgress * .52;
    moon.style.transform = `translate3d(${state.heroProgress * 4}%, ${-state.heroProgress * 5}%, 0) scale(${scale}) rotate(${-state.heroProgress * 3}deg)`;
    heroCopy.style.transform = `translate3d(0, ${-state.heroProgress * 58}px, 0)`;
    heroCopy.style.opacity = String(1 - smooth((state.heroProgress - .28) / .6));
  } else {
    moon.style.transform = '';
    heroCopy.style.transform = '';
    heroCopy.style.opacity = '';
  }

  experienceFill.style.transform = `scaleY(${state.experienceProgress})`;
  for (const { element, object, progress } of state.projects) {
    element.style.setProperty('--scene-progress', progress.toFixed(4));
    if (!object) continue;
    const scale = .86 + progress * .14;
    const distance = 40 * (1 - progress);
    object.style.transform = `translate3d(0, ${distance}px, 0) scale(${scale})`;
  }
  if (state.light) {
    const { element, x, y } = state.light;
    element.style.setProperty('--light-x', `${(x * 100).toFixed(2)}%`);
    element.style.setProperty('--light-y', `${(y * 100).toFixed(2)}%`);
    element.style.setProperty('--tilt-x', `${((.5 - y) * 5).toFixed(2)}deg`);
    element.style.setProperty('--tilt-y', `${((x - .5) * 7).toFixed(2)}deg`);
    element.classList.add('is-lit');
  }
}

function schedule() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(render);
}

function configureScene() {
  // Preserve normal flow when large text or a short viewport would clip hero content.
  const fits = heroCopy.scrollHeight + 232 <= innerHeight;
  const shouldPin = !reducedMotion.matches && desktopScene.matches && fits;
  hero.classList.toggle('is-pinned', shouldPin);
  if (!shouldPin) {
    moon.style.transform = '';
    heroCopy.style.transform = '';
    heroCopy.style.opacity = '';
    heroStage.style.removeProperty('--hero-progress');
  }
  schedule();
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
      if (entry.isIntersecting) {
        show(entry.target);
        revealObserver.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  for (const element of revealItems) {
    if (element.getBoundingClientRect().top < innerHeight * .9) show(element);
    else revealObserver.observe(element);
  }
}

addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', configureScene, { passive: true });
addEventListener('pageshow', configureScene);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(frame);
    frame = 0;
    resetSurface();
  } else {
    configureScene();
  }
});
document.addEventListener('focusin', (event) => {
  event.target.closest('.reveal-left, .reveal-right, .reveal-entry, .reveal-stack, .reveal-project, .reveal-scale')?.classList.add('is-visible');
  schedule();
});
reducedMotion.addEventListener('change', () => {
  configureScene();
  applyReveals();
});
desktopScene.addEventListener('change', configureScene);

if ('ResizeObserver' in window) new ResizeObserver(configureScene).observe(heroCopy);
document.fonts?.ready.then(configureScene);
configureScene();
applyReveals();

// Decorative pointer light is event-driven: no permanent animation loop or touch listeners.
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
finePointer.addEventListener('change', resetSurface);
addEventListener('blur', resetSurface);

// Pinning changes document height after native hash restoration; settle on the intended record.
function settleInitialHash() {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (!target) return;
  const root = document.documentElement;
  const offset = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  const top = Math.max(0, target.getBoundingClientRect().top + scrollY - offset);
  // A deep link should land immediately, unlike an intentional in-page click.
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  scrollTo(0, top);
  root.style.scrollBehavior = previousBehavior;
}
if (location.hash) {
  // Browsers may restore the hash before the sticky runway has its final height.
  [0, 80, 260, 640].forEach((delay) => setTimeout(settleInitialHash, delay));
  addEventListener('load', () => setTimeout(settleInitialHash, 80), { once: true });
  document.fonts?.ready.then(() => setTimeout(settleInitialHash, 260));
}
