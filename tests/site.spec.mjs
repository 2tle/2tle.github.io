import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

async function scrollThrough(page) {
  await page.evaluate(() => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .8) {
      scrollTo({ top: y, behavior: 'instant' });
    }
    scrollTo({ top: 0, behavior: 'instant' });
  });
}

for (const width of [320, 375, 640, 768, 1024, 1440]) {
  test(`${width}px: concise content, local assets, no overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
    const errors = [];
    const externalRequests = [];
    const scripts = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173')) externalRequests.push(request.url());
      if (request.resourceType() === 'script') scripts.push(request.url());
    });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveText('stringju');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.name')).toHaveText('양현준');
    await expect(page.locator('.project')).toHaveCount(3);
    await expect(page.locator('.timeline li')).toHaveCount(5);
    await expect(page.locator('button, canvas')).toHaveCount(0);
    await scrollThrough(page);
    const metrics = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      characters: document.body.innerText.replace(/\s/g, '').length,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    expect(metrics.overflow).toBe(false);
    expect(metrics.characters).toBeLessThan(430);
    expect(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBeTruthy();
    expect(await page.locator('a').evaluateAll((links) => links.every((link) => {
      const { width, height } = link.getBoundingClientRect();
      return width >= 44 && height >= 44;
    }))).toBeTruthy();
    expect(errors).toEqual([]);
    expect(externalRequests).toEqual([]);
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toContain('/main.js');
    if ([375, 1440].includes(width)) {
      await mkdir('artifacts/scroll-repair', { recursive: true });
      await page.screenshot({ path: `artifacts/scroll-repair/after-${width}.png`, fullPage: true });
      await writeFile(`artifacts/scroll-repair/after-${width}-metrics.json`, JSON.stringify({ width, ...metrics }, null, 2));
      for (const id of ['home', 'work', 'journey', 'contact']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `artifacts/scroll-repair/${width}-${id}.png` });
      }
    }
  });
}

test('stylesheets load with correct type and the design is actually applied', async ({ page }) => {
  const cssResponses = [];
  page.on('response', (response) => { if (response.url().includes('.css')) cssResponses.push(response); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const response of cssResponses) {
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/css');
  }
  const state = await page.evaluate(() => ({
    sheets: [...document.styleSheets].map((sheet) => ({ href: sheet.href, rules: sheet.cssRules.length })),
    background: getComputedStyle(document.documentElement).backgroundColor,
    h1Size: getComputedStyle(document.querySelector('h1')).fontSize,
    h1Color: getComputedStyle(document.querySelector('h1')).color,
    fontFamily: getComputedStyle(document.body).fontFamily,
  }));
  expect(state.sheets.length).toBeGreaterThanOrEqual(2);
  expect(state.sheets.every((sheet) => sheet.rules > 0)).toBeTruthy();
  expect(state.background).toBe('rgb(11, 11, 16)');
  expect(parseFloat(state.h1Size)).toBeGreaterThan(100);
  expect(state.h1Color).toBe('rgb(248, 250, 252)');
  expect(state.fontFamily).toContain('Noto Sans KR');
});

test('desktop scroll zooms the moon and fades the copy, then restores on return', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.hero')).toHaveClass(/is-pinned/);
  expect(await page.locator('.hero-stage').evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
  const atTop = await page.evaluate(() => ({
    moon: document.querySelector('.moon').style.transform,
    copy: document.querySelector('.hero-copy').style.opacity,
  }));
  const travel = await page.evaluate(() => document.querySelector('.hero').offsetHeight - innerHeight);
  await page.evaluate((y) => scrollTo(0, y), Math.round(travel * .6));
  await page.waitForTimeout(150);
  const midway = await page.evaluate(() => ({
    moon: document.querySelector('.moon').style.transform,
    opacity: Number(document.querySelector('.hero-copy').style.opacity),
  }));
  expect(midway.moon).not.toBe(atTop.moon);
  expect(await page.locator('.moon').evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  expect(midway.opacity).toBeLessThan(.9);
  await page.evaluate((y) => scrollTo(0, y), travel + 200);
  await page.waitForTimeout(150);
  const entered = await page.evaluate(() => [...document.querySelectorAll('.project-object')].map((el) => ({ transform: el.style.transform, opacity: Number(el.style.opacity) })));
  await page.evaluate((y) => scrollTo(0, y), 0);
  await page.waitForTimeout(150);
  const returned = await page.evaluate(() => document.querySelector('.moon').style.transform);
  expect(returned).toBe(atTop.moon);
  expect(entered[0].opacity).toBeGreaterThan(midway.opacity - 1);
});

test('project visuals animate into place as they enter the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const first = page.locator('.project-object').first();
  const before = await first.evaluate((el) => ({ transform: el.style.transform, opacity: Number(el.style.opacity || 1) }));
  await page.locator('#work').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const after = await first.evaluate((el) => ({ transform: el.style.transform, opacity: Number(el.style.opacity || 1) }));
  expect(after.transform).not.toBe(before.transform);
  expect(after.opacity).toBeGreaterThan(before.opacity);
  expect(after.opacity).toBe(1);
});

test('deep link reaches the projects section despite the pinned hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#work');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  const top = await page.locator('#work-title').evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(450);
});

test('reduced motion keeps one static, complete page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#work');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#work-title')).toBeInViewport();
  await expect(page.locator('.hero')).not.toHaveClass(/is-pinned/);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(150);
  expect(await page.locator('.moon').evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  expect(await page.locator('.hero-copy').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  expect(await page.locator('.project-object').evaluateAll((items) => items.every((item) => getComputedStyle(item).opacity === '1'))).toBeTruthy();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('identity, metadata, favicon and verified URLs stay correct', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('stringju · 양현준');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'stringju · 양현준');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /양현준, stringju/);
  await expect(page.locator('.portrait')).toHaveAttribute('alt', '양현준의 프로필 사진');
  expect(await readFile('assets/favicon.svg', 'utf8')).toContain('>s</text>');
  const text = await page.locator('body').innerText();
  expect(text.replace('iam@2tle.io', '')).not.toMatch(/2tle|HYUNJUN|Hyunjun|호기심을 따라|가능성에|이야기는/);
  await expect(page.getByRole('link', { name: 'iam@2tle.io', exact: true })).toHaveAttribute('href', 'mailto:iam@2tle.io');
  await expect(page.getByRole('link', { name: 'GitHub (새 탭)', exact: true })).toHaveAttribute('href', 'https://github.com/2tle');
  await expect(page.getByRole('link', { name: 'Blog (새 탭)', exact: true })).toHaveAttribute('href', 'https://stringju.tistory.com');
  await expect(page.locator('.timeline-date')).toHaveText([
    '2024.02', '2023.02', '2022.12 ~ 2024.12', '2021.10 ~ 2022.12', '2021.03 ~ 2024.02',
  ]);
  await expect(page.locator('.project-visual img')).toHaveCount(3);
  for (const alt of await page.locator('.project-visual img').all()) await expect(alt).toHaveAttribute('alt', '');
});

test('each project row and social link opens its named destination', async ({ page, context }) => {
  // Exercise real link activation without relying on external services.
  await context.route('https://**', (route) => route.fulfill({ contentType: 'text/html', body: '<title>Linked destination</title>' }));
  await page.goto('/');
  const links = [
    ['Nether 저장소 (새 탭)', 'https://github.com/2tle/Nether'],
    ['Macmagotchi 저장소 (새 탭)', 'https://github.com/2tle/macmagotchi'],
    ['SurvirunAPI 저장소 (새 탭)', 'https://github.com/2tle/SurvirunAPI'],
    ['GitHub (새 탭)', 'https://github.com/2tle'],
    ['Blog (새 탭)', 'https://stringju.tistory.com/'],
  ];
  for (const [name, href] of links) {
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const popupPromise = page.waitForEvent('popup');
    await link.scrollIntoViewIfNeeded();
    await link.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(href);
    await popup.close();
  }
});

test('self-hosted font subset covers the Korean name', async () => {
  const css = await readFile('assets/fonts/fonts.css', 'utf8');
  const ranges = [...css.matchAll(/U\+([\da-f]+)(?:-([\da-f]+))?/gi)].map(([, start, end]) => [parseInt(start, 16), parseInt(end || start, 16)]);
  for (const character of '양현준') {
    expect(ranges.some(([start, end]) => character.codePointAt(0) >= start && character.codePointAt(0) <= end)).toBeTruthy();
  }
});

test('JavaScript disabled retains the complete page and native keyboard navigation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173');
    await expect(page.locator('h1')).toHaveText('stringju');
    await expect(page.locator('.name')).toHaveText('양현준');
    await expect(page.locator('.project')).toHaveCount(3);
    expect(await page.locator('.hero-stage').evaluate((el) => getComputedStyle(el).position)).not.toBe('sticky');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('main')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.project-link').first()).toBeFocused();
    await expect(page.getByRole('link', { name: 'iam@2tle.io', exact: true })).toHaveAttribute('href', 'mailto:iam@2tle.io');
  } finally { await context.close(); }
});

test('failed images and blocked storage do not affect identity or links', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }); });
  await page.route('**/assets/images/**', (route) => route.abort());
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('stringju');
  await expect(page.locator('.name')).toHaveText('양현준');
  await expect(page.locator('.portrait')).toHaveCSS('aspect-ratio', '1 / 1');
  await expect(page.locator('.project-link')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

for (const width of [375, 1440]) {
  test(`${width}px: axe WCAG A/AA and visible keyboard focus`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    for (const link of await page.locator('a').all()) {
      await link.scrollIntoViewIfNeeded();
      await page.keyboard.press('Tab');
      await expect(link).toBeFocused();
      await expect(link).toBeInViewport();
      await expect(link).toHaveCSS('outline-style', 'solid');
    }
  });
}

for (const width of [320, 375, 1280]) {
  test(`${width}px: 200% text size reflows without clipping`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const clipped = await page.locator('h1, h2, h3, p, .timeline-date, .contact a').evaluateAll((elements) => elements
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.textContent));
    expect(clipped).toEqual([]);
  });
}

test('print keeps readable dark-on-light content', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('h1')).toHaveCSS('color', 'rgb(15, 23, 42)');
  await expect(page.locator('.interests')).toHaveCSS('color', 'rgb(15, 23, 42)');
  await expect(page.locator('.moon-scene')).toBeHidden();
});
