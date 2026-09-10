// Progressive enhancement: season controls and motion are optional; the record stays complete without JavaScript.
document.documentElement.classList.add('js');

const seasons = {
  spring: {
    label: '봄',
    image: './background/spring.png',
    theme: '#F6D6DE',
    room: '벚꽃이 핀 봄날, 음악을 들으며 강아지와 쉬고 있는 캐릭터의 방',
  },
  summer: {
    label: '여름',
    image: './background/summer.png',
    theme: '#DDE8C8',
    room: '푸른 나무와 여름 하늘이 보이는 창가에서 강아지와 쉬고 있는 캐릭터의 방',
  },
  fall: {
    label: '가을',
    image: './background/fall.png',
    theme: '#F6D39B',
    room: '주황빛 단풍이 보이는 가을 창가에서 강아지와 쉬고 있는 캐릭터의 방',
  },
  winter: {
    label: '겨울',
    image: './background/winter.png',
    theme: '#DCE8F4',
    room: '눈 내리는 겨울 도시를 바라보며 강아지와 쉬고 있는 캐릭터의 방',
  },
};

const seasonKeys = Object.keys(seasons);
const month = new Date().getMonth();
const calendarSeason = month >= 2 && month <= 4 ? 'spring' : month >= 5 && month <= 7 ? 'summer' : month >= 8 && month <= 10 ? 'fall' : 'winter';
const hero = document.querySelector('.hero');
const seasonRoom = document.querySelector('.season-room');
const seasonStatus = document.querySelector('.season-status');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const seasonButtons = [...document.querySelectorAll('[data-season-button]')];
const particles = document.querySelector('.season-particles');
const experience = document.querySelector('.experience');
const experienceFill = document.querySelector('.experience-line span');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktopScene = matchMedia('(min-width: 768px)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const projectScenes = [...document.querySelectorAll('.project')].map((element) => ({
  element,
  object: element.querySelector('.project-object'),
}));
const surfaces = [...document.querySelectorAll('.project, .stack-row')];
let activeSeason = calendarSeason;
let activeSurface;
let frame = 0;
let transitionTimer = 0;
let pointer = { x: 0, y: 0 };

try {
  const saved = localStorage.getItem('stringju-season');
  if (saved && seasons[saved]) activeSeason = saved;
} catch {
  // Storage may be unavailable in private or restricted contexts; the calendar fallback is enough.
}

function buildParticles() {
  if (!particles) return;
  particles.replaceChildren();
  for (let index = 0; index < 11; index += 1) {
    const particle = document.createElement('i');
    particle.style.setProperty('--x', `${7 + ((index * 31) % 88)}%`);
    particle.style.setProperty('--size', `${5 + (index % 4) * 2}px`);
    particle.style.setProperty('--duration', `${10 + (index % 5) * 2.4}s`);
    particle.style.setProperty('--delay', `${-index * 1.7}s`);
    particle.style.setProperty('--drift', `${(index % 2 ? 1 : -1) * (28 + index * 5)}px`);
    particles.append(particle);
  }
}

function applySeason(key, { persist = false, animate = false } = {}) {
  if (!seasons[key]) return;
  const changed = key !== activeSeason;
  activeSeason = key;
  if (animate && changed && !reducedMotion.matches) {
    document.body.classList.add('season-changing');
    clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => document.body.classList.remove('season-changing'), 240);
  }
  document.body.dataset.season = key;
  const season = seasons[key];
  if (seasonRoom) seasonRoom.setAttribute('aria-label', season.room);
  if (themeMeta) themeMeta.content = season.theme;
  if (seasonStatus) seasonStatus.innerHTML = `<span aria-hidden="true"></span><b>${season.label}의 방</b>`;
  for (const button of seasonButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.seasonButton === key));
  }
  if (persist) {
    try { localStorage.setItem('stringju-season', key); } catch { /* Keep the selected season for this page view only. */ }
  }
}

for (const button of seasonButtons) {
  button.addEventListener('click', () => applySeason(button.dataset.seasonButton, { persist: true, animate: true }));
  button.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const current = seasonKeys.indexOf(button.dataset.seasonButton);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = seasonKeys[(current + direction + seasonKeys.length) % seasonKeys.length];
    const nextButton = seasonButtons.find((item) => item.dataset.seasonButton === next);
    nextButton?.focus();
    applySeason(next, { persist: true, animate: true });
  });
}

applySeason(activeSeason);
buildParticles();

addEventListener('load', () => {
  for (const key of seasonKeys) {
    if (key === activeSeason) continue;
    const image = new Image();
    image.decoding = 'async';
    image.src = seasons[key].image;
  }
}, { once: true });

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
  hero?.style.removeProperty('--scroll-progress');
  seasonRoom?.style.removeProperty('--room-scale');
  if (experienceFill) experienceFill.style.transform = '';
  for (const { object } of projectScenes) {
    if (object) object.style.transform = '';
  }
  resetSurface();
}

function readScrollState() {
  const viewport = innerHeight;
  const heroBounds = hero?.getBoundingClientRect();
  const heroProgress = heroBounds ? clamp(-heroBounds.top / Math.max(1, heroBounds.height)) : 0;
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
  return { heroProgress, experienceProgress, projects, light };
}

function render() {
  frame = 0;
  if (reducedMotion.matches) {
    resetMotion();
    return;
  }
  const state = readScrollState();
  hero?.style.setProperty('--scroll-progress', String(Math.max(.08, state.heroProgress)));
  if (desktopScene.matches) seasonRoom?.style.setProperty('--room-scale', String(1 + state.heroProgress * .035));
  else seasonRoom?.style.removeProperty('--room-scale');
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
  const top = Math.max(0, target.getBoundingClientRect().top + scrollY - offset);
  const previous = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  scrollTo(0, top);
  document.documentElement.style.scrollBehavior = previous;
}

addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
addEventListener('pageshow', schedule);
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
  else schedule();
});
desktopScene.addEventListener('change', schedule);
finePointer.addEventListener('change', resetSurface);

applyReveals();
schedule();
if (location.hash) {
  [0, 120, 320].forEach((delay) => setTimeout(settleInitialHash, delay));
  document.fonts?.ready.then(() => setTimeout(settleInitialHash, 180));
}
