import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * .8) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await sleep(65);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(400);
}

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`${width}px: readable sections, local assets, no overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
    const errors = [];
    const externalRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4173')) externalRequests.push(request.url()); });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.hero .button')).toBeInViewport();
    await scrollThrough(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    expect(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBeTruthy();
    expect(await page.locator('.reveal').evaluateAll((items) => items.every((item) => getComputedStyle(item).opacity === '1'))).toBeTruthy();
    expect(errors).toEqual([]);
    expect(externalRequests).toEqual([]);
    if ([375, 1440].includes(width)) {
      await mkdir('artifacts', { recursive: true });
      await page.screenshot({ path: `artifacts/${width}-full.png`, fullPage: true });
      await page.screenshot({ path: `artifacts/${width}-hero.png` });
      for (const id of ['about', 'work', 'journey', 'contact']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await page.screenshot({ path: `artifacts/${width}-${id}.png` });
      }
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `artifacts/${width}-footer.png` });
    }
  });
}

test('navigation by scroll cue reaches projects; markdown-driven content renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-header')).toHaveCount(0);
  await page.getByRole('link', { name: '프로젝트 보기' }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('#work-title')).toBeInViewport();
  for (const repo of ['Nether', 'macmagotchi', 'SurvirunAPI']) {
    await expect(page.locator(`.project-link[href="https://github.com/2tle/${repo}"]`)).toHaveCount(1);
  }
  await expect(page.locator('.project')).toHaveCount(3);
  await expect(page.locator('.timeline li')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'iam@2tle.io' })).toHaveAttribute('href', 'mailto:iam@2tle.io');
});

test('JavaScript disabled retains projects and biography', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await expect(page.locator('h1')).toBeVisible();
  await page.getByRole('link', { name: '프로젝트 보기' }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.getByRole('heading', { name: 'Nether', exact: true })).toBeVisible();
  await expect(page.locator('.copy-email')).toBeHidden();
  await context.close();
});

test('OS reduced motion removes sticky and reveals all content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#work');
  await expect(page.locator('html')).toHaveClass(/motion-reduced/);
  expect(await page.locator('.hero-stage').evaluate((el) => getComputedStyle(el).position)).toBe('relative');
  expect(await page.locator('.reveal').evaluateAll((items) => items.every((item) => getComputedStyle(item).opacity === '1'))).toBeTruthy();
  await expect(page.locator('.motion-toggle')).toBeDisabled();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.motion-toggle')).toBeEnabled();
});

test('motion toggle persists, scroll transforms run only when enabled', async ({ page }) => {
  await page.goto('/');
  const before = await page.locator('.moon-scene').evaluate((el) => el.style.transform);
  await page.evaluate(() => window.scrollTo({ top: 350, behavior: 'instant' }));
  await page.waitForTimeout(100);
  const after = await page.locator('.moon-scene').evaluate((el) => el.style.transform);
  expect(after).not.toBe(before);
  await page.locator('.motion-toggle').click();
  await expect(page.locator('html')).toHaveClass(/motion-reduced/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/motion-reduced/);
  expect(await page.locator('.moon-scene').evaluate((el) => el.style.transform)).toBe('');
  await page.locator('.motion-toggle').click();
  await expect(page.locator('html')).toHaveClass(/motion-enabled/);
});

test('clipboard success and denied fallback are announced', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value) => { window.copiedEmail = value; } } });
  });
  await page.goto('/');
  await page.locator('.copy-email').click();
  await expect(page.getByRole('status')).toHaveText('이메일 주소를 복사했습니다.');
  expect(await page.evaluate(() => window.copiedEmail)).toBe('iam@2tle.io');
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Denied'); }; });
  await page.locator('.copy-email').click();
  await expect(page.getByRole('status')).toContainText('직접 선택');
  await expect(page.locator('.copy-email')).toBeEnabled();
});

test('blocked storage and failed portrait do not break the document', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }); });
  await page.route('**/profile.jpg', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('.motion-toggle').click();
  await expect(page.locator('html')).toHaveClass(/motion-reduced/);
  await expect(page.locator('.portrait-frame')).toHaveCSS('aspect-ratio', '1 / 1');
});

for (const width of [375, 1440]) {
  test(`${width}px: axe WCAG A/AA and keyboard skip link`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await expect(page.locator('.skip-link')).toBeInViewport();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('200% text size retains content without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    const elements = [...document.querySelectorAll('h1,h2,h3,p,a,button,dt,dd,li,span,time')];
    const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, i) => { el.style.fontSize = `${sizes[i] * 2}px`; });
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});
