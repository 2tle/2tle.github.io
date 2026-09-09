// Progressive enhancement: every fact and destination remains available without this file.
document.documentElement.classList.add('js');

const hero = document.querySelector('.hero');
const heroCopy = document.querySelector('.hero-copy');
const moon = document.querySelector('.moon');
const experience = document.querySelector('.experience');
const experienceFill = document.querySelector('.experience-line span');
const projectObjects = [...document.querySelectorAll('.project-object')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktopScene = matchMedia('(min-width: 900px) and (min-height: 650px)');
const nav = document.querySelector('.nav');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
let frame = 0;

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
  for (const object of projectObjects) object.style.transform = '';
}

function readScrollState() {
  const viewport = innerHeight;
  const heroBounds = hero.getBoundingClientRect();
  const pinned = hero.classList.contains('is-pinned');
  const travel = hero.offsetHeight - hero.querySelector('.hero-stage').offsetHeight;
  const heroProgress = pinned ? clamp(-heroBounds.top / Math.max(1, travel)) : 0;
  const experienceBounds = experience.getBoundingClientRect();
  const experienceProgress = smooth((viewport * .72 - experienceBounds.top) / Math.max(1, experienceBounds.height * .72));
  const projects = projectObjects.map((object) => {
    const bounds = object.getBoundingClientRect();
    const focus = object.closest('.project')?.matches(':focus-within');
    return { object, progress: focus ? 1 : smooth((viewport * .92 - bounds.top) / Math.max(1, viewport * .72)) };
  });
  return { pinned, heroProgress, experienceProgress, projects };
}

function render() {
  frame = 0;
  if (reducedMotion.matches) {
    resetMotion();
    return;
  }

  // Read all geometry before a single style write, preventing layout read/write interleaving.
  const state = readScrollState();

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
  for (const { object, progress } of state.projects) {
    const scale = .86 + progress * .14;
    const distance = 40 * (1 - progress);
    object.style.transform = `translate3d(0, ${distance}px, 0) scale(${scale})`;
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

function setMenu(open, returnFocus = false) {
  if (!menuToggle || !nav) return;
  nav.classList.toggle('is-menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  if (returnFocus) menuToggle.focus();
}

menuToggle?.addEventListener('click', () => setMenu(!nav.classList.contains('is-menu-open')));
navLinks?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('is-menu-open')) setMenu(false, true);
});
document.addEventListener('click', (event) => {
  if (nav?.classList.contains('is-menu-open') && !nav.contains(event.target)) setMenu(false);
});

addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', () => { configureScene(); setMenu(false); }, { passive: true });
addEventListener('pageshow', configureScene);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(frame);
    frame = 0;
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
