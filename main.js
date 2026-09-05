const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 767px)');
const shortViewport = window.matchMedia('(max-height: 700px)');
const hero = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');
const moon = document.querySelector('.moon-scene');
let userReduced = false;
let frame = 0;
let revealObserver;
try { userReduced = localStorage.getItem('2tle-reduced-motion') === 'true'; } catch { /* Storage is optional. */ }

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
function renderScroll() {
  frame = 0;
  const animate = root.classList.contains('motion-enabled') && !mobile.matches && !shortViewport.matches;
  if (!animate) {
    moon.style.transform = '';
    heroContent.style.transform = '';
    heroContent.style.opacity = '';
    return;
  }
  const rect = hero.getBoundingClientRect();
  const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
  const amount = clamp(-rect.top / travel);
  moon.style.transform = `translate3d(${-amount * 3}%, ${-amount * 8}%, 0) scale(${1 + amount * .16})`;
  heroContent.style.transform = `translate3d(0, ${-amount * 40}px, 0)`;
  heroContent.style.opacity = String(1 - amount * .75);
}
function scheduleScroll() { if (!frame) frame = requestAnimationFrame(renderScroll); }

function applyMotion() {
  const off = reducedMotion.matches || userReduced;
  root.classList.toggle('motion-enabled', !off);
  root.classList.toggle('motion-reduced', off);
  const motionButton = document.querySelector('.motion-toggle');
  motionButton.setAttribute('aria-pressed', String(off));
  motionButton.disabled = reducedMotion.matches;
  motionButton.querySelector('.motion-label').textContent =
    reducedMotion.matches ? '시스템 모션 감소' : off ? '모션 켜기' : '모션 줄이기';
  revealObserver?.disconnect();
  const items = document.querySelectorAll('.reveal');
  if (off || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
  } else {
    revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0, rootMargin: '0px 0px 40px 0px' });
    items.forEach((item) => {
      // A deep link, restored scroll position or keyboard focus must not hide content.
      if (item.getBoundingClientRect().top < window.innerHeight) item.classList.add('is-visible');
      if (!item.classList.contains('is-visible')) revealObserver.observe(item);
    });
  }
  scheduleScroll();
}
const motionButton = document.querySelector('.motion-toggle');
motionButton.hidden = false;
motionButton.addEventListener('click', () => {
  userReduced = !userReduced;
  try { localStorage.setItem('2tle-reduced-motion', String(userReduced)); } catch { /* In-memory toggle still works. */ }
  applyMotion();
});
reducedMotion.addEventListener('change', applyMotion);
applyMotion();

// Keyboard focus must never land on, or arrive from, hidden reveal content.
document.addEventListener('focusin', (event) => {
  event.target.closest('.reveal')?.classList.add('is-visible');
});

const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('.copy-status');
copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  copyButton.disabled = true;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(copyButton.dataset.email);
    copyStatus.textContent = '이메일 주소를 복사했습니다.';
  } catch {
    copyStatus.textContent = '복사하지 못했습니다. 주소를 직접 선택하거나 메일 링크를 눌러 주세요.';
  } finally {
    copyButton.disabled = false;
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();

// A deterministic, static sky: no animation loop, flicker, tracking or network requests.
const canvas = document.querySelector('.stars');
function drawStars() {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.scale(ratio, ratio);
  let seed = 56637184;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const count = Math.min(260, Math.floor(width * height / 4400));
  for (let i = 0; i < count; i++) {
    const x = random() * width;
    const y = random() * height;
    const radius = random() > .95 ? 1.15 : random() * .65 + .2;
    ctx.fillStyle = `rgb(248 250 252 / ${.15 + random() * .55})`;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
}
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => { drawStars(); scheduleScroll(); }, 120);
}, { passive: true });
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('pageshow', scheduleScroll);
window.addEventListener('load', scheduleScroll, { once: true });
drawStars();
