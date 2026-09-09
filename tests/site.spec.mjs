import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .72) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    scrollTo({ top: 0, behavior: 'instant' });
  });
}

for (const width of [320, 375, 640, 768, 1024, 1440]) {
  test(`${width}px: complete resume content, local assets, and no overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
    const errors = [];
    const externalRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173')) externalRequests.push(request.url());
    });

    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveText('stringju');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.hero-name')).toHaveText('양현준');
    await expect(page.locator('.experience-item')).toHaveCount(4);
    await expect(page.locator('.stack-row')).toHaveCount(3);
    await expect(page.locator('.project')).toHaveCount(3);
    await expect(page.locator('.education-item')).toHaveCount(2);
    await expect(page.locator('.history-item')).toHaveCount(2);
    await expect(page.getByText('주식회사 커리어노트', { exact: true })).toBeAttached();
    await expect(page.getByRole('link', { name: 'Hugging Face', exact: true })).toBeAttached();

    await scrollThrough(page);
    await page.waitForTimeout(350);
    const metrics = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      viewport: innerHeight,
      characters: document.body.innerText.replace(/\s/g, '').length,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    expect(metrics.height).toBeGreaterThan(metrics.viewport);
    expect(metrics.characters).toBeGreaterThan(500);
    expect(metrics.overflow).toBe(false);
    expect(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBeTruthy();
    const undersized = await page.locator('a, button').evaluateAll((controls) => controls
      .filter((control) => {
        const style = getComputedStyle(control);
        const rect = control.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 43.5 || rect.height < 43.5);
      })
      .map((control) => ({ text: control.textContent.trim(), rect: control.getBoundingClientRect().toJSON() })));
    expect(undersized).toEqual([]);
    expect(errors).toEqual([]);
    expect(externalRequests).toEqual([]);

    if ([375, 1440].includes(width)) {
      await mkdir('artifacts/final', { recursive: true });
      await page.screenshot({ path: `artifacts/final/${width}-full.png`, fullPage: true });
      await writeFile(`artifacts/final/${width}-metrics.json`, JSON.stringify({ width, ...metrics }, null, 2));
      for (const id of ['home', 'about', 'experience', 'work', 'contact']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        await page.screenshot({ path: `artifacts/final/${width}-${id}.png` });
      }
    }
  });
}

test('stylesheets load with the intended dark visual system', async ({ page }) => {
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
  expect(parseFloat(state.h1Size)).toBeGreaterThanOrEqual(64);
  expect(parseFloat(state.h1Size)).toBeLessThanOrEqual(80);
  await expect(page.getByRole('navigation')).toHaveCount(0);
  expect(state.h1Color).toBe('rgb(248, 250, 252)');
  expect(state.fontFamily).toContain('Noto Sans KR');
});

test('desktop hero uses native-scroll motion and returns to its origin', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.hero')).toHaveClass(/is-pinned/);
  expect(await page.locator('.hero-stage').evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
  const atTop = await page.evaluate(() => ({
    moon: document.querySelector('.moon').style.transform,
    copy: document.querySelector('.hero-copy').style.opacity,
  }));
  const travel = await page.evaluate(() => document.querySelector('.hero').offsetHeight - document.querySelector('.hero-stage').offsetHeight);
  await page.evaluate((y) => scrollTo(0, y), Math.round(travel * .62));
  await page.waitForTimeout(180);
  const midway = await page.evaluate(() => ({
    moon: document.querySelector('.moon').style.transform,
    opacity: Number(document.querySelector('.hero-copy').style.opacity),
  }));
  expect(midway.moon).not.toBe(atTop.moon);
  expect(await page.locator('.moon').evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  expect(midway.opacity).toBeLessThan(.9);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(180);
  expect(await page.locator('.moon').evaluate((el) => el.style.transform)).toBe(atTop.moon);
});

test('timeline and project visual transforms respond to entry into the page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const initial = await page.evaluate(() => ({
    line: document.querySelector('.experience-line span').style.transform,
    project: document.querySelector('.project-object').style.transform,
  }));
  await page.locator('#experience').scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  const enteredExperience = await page.locator('.experience-line span').evaluate((el) => el.style.transform);
  expect(enteredExperience).not.toBe(initial.line);
  await page.locator('.project').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  const enteredProject = await page.locator('.project-object').first().evaluate((el) => el.style.transform);
  expect(enteredProject).not.toBe(initial.project);
  expect(enteredProject).toContain('scale(');
});

test('hero action works and all one-time reveals settle after a scroll pass', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.hero-link').click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('#about-title')).toBeInViewport();
  await scrollThrough(page);
  await page.waitForTimeout(400);
  expect(await page.locator('.reveal-left, .reveal-right, .reveal-entry, .reveal-stack, .reveal-project, .reveal-scale').evaluateAll((items) => items.every((item) => item.classList.contains('is-visible')))).toBeTruthy();
});

test('an initial deep link lands on the requested chapter after hero setup', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#work');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  const top = await page.locator('#work-title').evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(-2);
  expect(top).toBeLessThan(450);
});

test('reduced motion and JavaScript-disabled contexts retain the complete static document', async ({ browser, page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#experience');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#experience-title')).toBeInViewport();
  await expect(page.locator('.hero')).not.toHaveClass(/is-pinned/);
  expect(await page.locator('.moon').evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  expect(await page.locator('.hero-copy').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  expect(await page.locator('.reveal-left, .reveal-right, .reveal-entry, .reveal-stack, .reveal-project, .reveal-scale').evaluateAll((items) => items.every((item) => getComputedStyle(item).transform === 'none'))).toBeTruthy();

  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto('http://127.0.0.1:4173');
    await expect(staticPage.locator('h1')).toHaveText('stringju');
    await expect(staticPage.locator('.hero-name')).toHaveText('양현준');
    await expect(staticPage.locator('.experience-item')).toHaveCount(4);
    await expect(staticPage.locator('.project')).toHaveCount(3);
    expect(await staticPage.locator('.hero-stage').evaluate((el) => getComputedStyle(el).position)).not.toBe('sticky');
    expect(await staticPage.locator('.reveal-left, .reveal-right, .reveal-entry, .reveal-stack, .reveal-project, .reveal-scale').evaluateAll((items) => items.every((item) => getComputedStyle(item).transform === 'none'))).toBeTruthy();
    await staticPage.keyboard.press('Tab');
    await expect(staticPage.locator('.skip-link')).toBeFocused();
    await staticPage.keyboard.press('Enter');
    await expect(staticPage.locator('main')).toBeFocused();
    await staticPage.keyboard.press('Tab');
    await expect(staticPage.getByRole('link', { name: 'Nether 저장소 열기 (새 탭)', exact: true })).toBeFocused();
  } finally {
    await context.close();
  }
});

test('identity, sourced resume content, metadata, and destinations stay correct', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('stringju · 양현준');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'stringju · 양현준');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /양현준, stringju/);
  await expect(page.locator('.about-portrait img')).toHaveAttribute('alt', '양현준의 프로필 사진');
  expect(await readFile('assets/favicon.svg', 'utf8')).toContain('>s</text>');
  const text = await page.locator('body').innerText();
  for (const sourceText of ['커리어노트', '한봄고등학교', '시스템컨설턴트그룹', '마이다스아이티', 'Team LogCat', 'Survirun']) {
    expect(text).toContain(sourceText);
  }
  expect(text).not.toContain('주요 수상 실적');
  await expect(page.getByRole('link', { name: 'iam@2tle.io', exact: true })).toHaveAttribute('href', 'mailto:iam@2tle.io');
  await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/2tle');
  await expect(page.getByRole('link', { name: 'Hugging Face', exact: true })).toHaveAttribute('href', 'https://huggingface.co/2tle');
  await expect(page.getByRole('link', { name: 'Blog', exact: true })).toHaveAttribute('href', 'https://stringju.tistory.com');
});

test('public project and contact links open their named destinations', async ({ page, context }) => {
  await context.route('https://**', (route) => route.fulfill({ contentType: 'text/html', body: '<title>Linked destination</title>' }));
  await page.goto('/');
  const links = [
    ['Nether 저장소 열기 (새 탭)', 'https://github.com/2tle/Nether'],
    ['Macmagotchi 저장소 열기 (새 탭)', 'https://github.com/2tle/macmagotchi'],
    ['SurvirunAPI 저장소 열기 (새 탭)', 'https://github.com/2tle/SurvirunAPI'],
    ['GitHub', 'https://github.com/2tle'],
    ['Hugging Face', 'https://huggingface.co/2tle'],
    ['Blog', 'https://stringju.tistory.com/'],
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

test('failed local images and blocked storage do not remove content', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }); });
  await page.route('**/assets/images/**', (route) => route.abort());
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('stringju');
  await expect(page.locator('.hero-name')).toHaveText('양현준');
  await expect(page.locator('.about-portrait img')).toHaveCSS('aspect-ratio', '1 / 1');
  await expect(page.locator('.project-link')).toHaveCount(3);
  await expect(page.locator('.experience-item')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

for (const width of [375, 1440]) {
  test(`${width}px: WCAG A/AA audit and visible focus`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await scrollThrough(page);
    await page.waitForTimeout(450);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    const focusables = [page.locator('.hero-link'), page.locator('.project-link').first(), page.locator('.email-link')];
    for (const target of focusables) {
      await target.scrollIntoViewIfNeeded();
      await target.focus();
      await expect(target).toBeFocused();
      await expect(target).toHaveCSS('outline-style', 'solid');
    }
  });
}

for (const width of [320, 375, 1280]) {
  test(`${width}px: 200% text size reflows without clipping`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const clipped = await page.locator('h1, h2, h3, p, .experience-date, .record-date, .contact a').evaluateAll((elements) => elements
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.textContent));
    expect(clipped).toEqual([]);
  });
}

test('print keeps the resume readable without decorative imagery', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('h1')).toHaveCSS('color', 'rgb(15, 23, 42)');
  await expect(page.locator('.hero-summary')).toHaveCSS('color', 'rgb(15, 23, 42)');
  await expect(page.locator('.moon-scene')).toBeHidden();
});
