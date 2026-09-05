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
  test(`${width}px: compact content, local assets, no overflow`, async ({ page }) => {
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
    await expect(page.getByRole('heading', { name: 'SurvirunAPI', exact: true })).toBeInViewport();
    await expect(page.locator('.project')).toHaveCount(3);
    await expect(page.locator('.timeline li')).toHaveCount(5);
    await expect(page.locator('button, script, canvas')).toHaveCount(0);
    await scrollThrough(page);
    const metrics = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      characters: document.body.innerText.replace(/\s/g, '').length,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    expect(metrics.overflow).toBe(false);
    expect(metrics.height).toBeLessThan(1600);
    expect(metrics.characters).toBeLessThan(430);
    expect(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBeTruthy();
    expect(await page.locator('a').evaluateAll((links) => links.every((link) => {
      const { width, height } = link.getBoundingClientRect();
      return width >= 44 && height >= 44;
    }))).toBeTruthy();
    expect(errors).toEqual([]);
    expect(externalRequests).toEqual([]);
    expect(scripts).toEqual([]);
    if ([375, 1440].includes(width)) {
      await mkdir('artifacts/redesign', { recursive: true });
      await page.screenshot({ path: `artifacts/redesign/after-${width}.png`, fullPage: true });
      await writeFile(`artifacts/redesign/after-${width}-metrics.json`, JSON.stringify({ width, ...metrics }, null, 2));
      for (const id of ['home', 'work', 'journey', 'contact']) {
        await page.locator(`#${id}`).screenshot({ path: `artifacts/redesign/${width}-${id}.png` });
      }
    }
  });
}

test('new identity in metadata, introduction and favicon; verified URLs unchanged', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('stringju · 양현준');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'stringju · 양현준');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /양현준, stringju/);
  await expect(page.locator('.portrait')).toHaveAttribute('alt', '양현준의 프로필 사진');
  const text = await page.locator('body').innerText();
  expect(text.replace('iam@2tle.io', '')).not.toMatch(/2tle|HYUNJUN|Hyunjun|호기심을 따라|가능성에|이야기는/);
  expect(await readFile('assets/favicon.svg', 'utf8')).toContain('>s</text>');
  await expect(page.getByRole('link', { name: 'iam@2tle.io', exact: true })).toHaveAttribute('href', 'mailto:iam@2tle.io');
  await expect(page.getByRole('link', { name: 'GitHub (새 탭)', exact: true })).toHaveAttribute('href', 'https://github.com/2tle');
  await expect(page.getByRole('link', { name: 'Blog (새 탭)', exact: true })).toHaveAttribute('href', 'https://stringju.tistory.com');
  await expect(page.locator('.project').first()).toContainText('초기 개발');
  await expect(page.locator('.timeline-date')).toHaveText([
    '2024.02', '2023.02', '2022.12 ~ 2024.12', '2021.10 ~ 2022.12', '2021.03 ~ 2024.02',
  ]);
});

test('self-hosted font subset covers the new Korean name', async () => {
  const css = await readFile('assets/fonts/fonts.css', 'utf8');
  const ranges = [...css.matchAll(/U\+([\da-f]+)(?:-([\da-f]+))?/gi)].map(([, start, end]) => [parseInt(start, 16), parseInt(end || start, 16)]);
  for (const character of '양현준') {
    expect(ranges.some(([start, end]) => character.codePointAt(0) >= start && character.codePointAt(0) <= end)).toBeTruthy();
  }
});

test('rendered spacing and screen/print colors respect the design tokens', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(11, 11, 16)');
  await expect(page.locator('h1')).toHaveCSS('color', 'rgb(248, 250, 252)');
  await expect(page.locator('.interests')).toHaveCSS('color', 'rgb(148, 163, 184)');
  for (const section of await page.locator('.content-section').all()) {
    expect(await section.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))).toBeGreaterThanOrEqual(32);
  }
  for (const project of await page.locator('.project + .project').all()) {
    expect(await project.evaluate((el) => el.querySelector('h3').getBoundingClientRect().top - el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(20);
  }
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('h1')).toHaveCSS('color', 'rgb(15, 23, 42)');
  await expect(page.locator('.interests')).toHaveCSS('color', 'rgb(15, 23, 42)');
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
    await link.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(href);
    await popup.close();
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

test('normal and reduced motion are static with all content immediately visible', async ({ page }) => {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/#work');
    await expect(page.locator('#work-title')).toBeInViewport();
    expect(await page.locator('main, .project, .timeline li').evaluateAll((items) => items.every((item) => getComputedStyle(item).opacity === '1'))).toBeTruthy();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    const before = await page.locator('.moon').evaluate((el) => getComputedStyle(el).transform);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    expect(await page.locator('.moon').evaluate((el) => getComputedStyle(el).transform)).toBe(before);
    expect(await page.locator('html').evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe('auto');
  }
});

test('failed images and blocked storage do not affect identity or links', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }); });
  await page.route('**/assets/images/**', (route) => route.abort());
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
