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
    await expect(page.locator('.chapter-strip')).toHaveCount(0);
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

    if ([375, 768, 1440].includes(width)) {
      await mkdir('artifacts/final', { recursive: true });
      await page.screenshot({ path: `artifacts/final/${width}-full.png`, fullPage: true });
      await writeFile(`artifacts/final/${width}-metrics.json`, JSON.stringify({ width, ...metrics }, null, 2));
      for (const id of ['home', 'experience', 'stack', 'work', 'contact']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        await page.screenshot({ path: `artifacts/final/${width}-${id}.png` });
      }
    }
  });
}

test('seasonal room scenes are used as each chapter background', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-season-button]')).toHaveCount(0);
  await expect(page.locator('.chapter-strip')).toHaveCount(0);
  await expect(page.locator('.project-category')).toHaveCount(0);
  await expect(page.locator('.landscape-frame')).toHaveCount(4);
  await expect(page.locator('.landscape-frame').first()).toHaveAttribute('src', './background/spring2.png');
  await expect(page.locator('.landscape')).toBeHidden();
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 253, 250)');
  await expect(page.locator('.landscape-frame').first()).toHaveCSS('opacity', '1');
  expect(await page.locator('.hero').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('spring2.png');
  expect(await page.locator('#experience').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('summer.png');
  expect(await page.locator('#work').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('fall.png');
  expect(await page.locator('#journey').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('winter.png');
});

test('all four scenes dissolve continuously with scroll and reverse to the opening', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await Promise.all([...document.querySelectorAll('.landscape-frame')].map(image => image.decode()));
    document.documentElement.style.scrollBehavior = 'auto';
  });
  const opacity = () => page.locator('.landscape-frame').evaluateAll(images => images.map(image => Number(getComputedStyle(image).opacity)));
  for (const [position, expected] of [
    [0, [1, 0, 0, 0]],
    [1 / 6, [1, .5, 0, 0]],
    [1 / 3, [1, 1, 0, 0]],
    [1 / 2, [1, 1, .5, 0]],
    [2 / 3, [1, 1, 1, 0]],
    [5 / 6, [1, 1, 1, .5]],
    [1, [1, 1, 1, 1]],
    [0, [1, 0, 0, 0]],
  ]) {
    await page.evaluate(p => scrollTo(0, p * (document.documentElement.scrollHeight - innerHeight)), position);
    await expect.poll(async () => (await opacity()).every((value, index) => Math.abs(value - expected[index]) < .01)).toBe(true);
  }
});

test('an unavailable incoming scene keeps the preceding image visible', async ({ page }) => {
  await page.route('**/background/summer.png', route => route.abort());
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 3);
  });
  await expect(page.locator('.landscape-frame').nth(0)).toHaveCSS('opacity', '1');
  await expect(page.locator('.landscape-frame').nth(1)).toHaveCSS('opacity', '0');
  await expect(page.locator('.experience-item')).toHaveCount(4);
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

test('project motion remains stable at a fixed scroll position', async ({ page }) => {
  await page.goto('/');
  const project = page.locator('.project').first();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await project.evaluate((el) => scrollTo(0, el.offsetTop - innerHeight * .6));
  await page.waitForTimeout(400);
  const before = await project.locator('.project-object').getAttribute('style');
  await page.evaluate(async () => {
    for (let i = 0; i < 12; i++) {
      dispatchEvent(new Event('scroll'));
      await new Promise(requestAnimationFrame);
    }
  });
  expect(await project.locator('.project-object').getAttribute('style')).toBe(before);
});

test('pointer lighting resets on leave and when reduced motion is enabled', async ({ page }) => {
  await page.goto('/');
  const project = page.locator('.project').first();
  await project.scrollIntoViewIfNeeded();
  const bounds = await project.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * .7, bounds.y + bounds.height * .3);
  await expect(project).toHaveClass(/is-lit/);
  const first = await project.evaluate((el) => el.style.getPropertyValue('--light-x'));
  await page.mouse.move(bounds.x + bounds.width * .3, bounds.y + bounds.height * .7);
  await expect.poll(() => project.evaluate((el) => el.style.getPropertyValue('--light-x'))).not.toBe(first);
  await page.mouse.move(0, 0);
  await expect(project).not.toHaveClass(/is-lit/);
  expect(await project.evaluate((el) => el.style.getPropertyValue('--tilt-x'))).toBe('');
  await page.mouse.move(bounds.x + bounds.width * .5, bounds.y + bounds.height * .5);
  await expect(project).toHaveClass(/is-lit/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(project).not.toHaveClass(/is-lit/);
  await expect(project.locator('.project-visual')).toHaveCSS('transform', 'none');
  await expect(project.locator('.surface-light')).toBeHidden();
});

test('touch input does not activate pointer effects and the footer returns to the opening', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173');
    const project = page.locator('.project').first();
    await project.scrollIntoViewIfNeeded();
    await project.locator('.project-visual').tap();
    await expect(project).not.toHaveClass(/is-lit/);
    await page.getByRole('link', { name: 'Back to top' }).click();
    await expect(page).toHaveURL(/#home$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('h1')).toBeInViewport();
  } finally {
    await context.close();
  }
});

test('back to top restores a useful keyboard starting point', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Back to top' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#home')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.project-link').first()).toBeFocused();
});

test('a short landscape viewport keeps the opening in normal document flow', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.hero')).not.toHaveClass(/is-pinned/);
  await expect(page.locator('h1')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await mkdir('artifacts/final', { recursive: true });
  await page.screenshot({ path: 'artifacts/final/844-landscape.png', animations: 'disabled' });
});

test('all one-time reveals settle after a scroll pass', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
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
  await expect(page.locator('.landscape-frame').nth(0)).toHaveCSS('opacity', '1');
  await expect(page.locator('.landscape-frame').nth(1)).toHaveCSS('opacity', '0');
  expect(await page.locator('.hero-copy').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  expect(await page.locator('.reveal-left, .reveal-right, .reveal-entry, .reveal-stack, .reveal-project, .reveal-scale').evaluateAll((items) => items.every((item) => getComputedStyle(item).transform === 'none'))).toBeTruthy();

  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto('http://127.0.0.1:4173');
    await expect(staticPage.locator('h1')).toHaveText('stringju');
    await expect(staticPage.locator('.experience-item')).toHaveCount(4);
    await expect(staticPage.locator('.project')).toHaveCount(3);
    expect(await staticPage.locator('.reveal-left, .reveal-right, .reveal-entry, .reveal-stack, .reveal-project, .reveal-scale').evaluateAll((items) => items.every((item) => !item.classList.contains('is-visible')))).toBeTruthy();
    await staticPage.keyboard.press('Tab');
    await expect(staticPage.locator('.skip-link')).toBeFocused();
    await staticPage.keyboard.press('Enter');
    await expect(staticPage.locator('main')).toBeFocused();
    await staticPage.keyboard.press('Tab');
    await expect(staticPage.locator('.project-link').first()).toBeFocused();
  } finally {
    await context.close();
  }
});

test('identity, sourced resume content, metadata, and destinations stay correct', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('stringju · 양현준');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'stringju · 양현준');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /양현준, stringju/);
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
  await page.route('**/background/**', (route) => route.abort());
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('stringju');
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
    const focusables = [page.locator('.project-link').first(), page.locator('.email-link'), page.locator('.back-to-top')];
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
  await expect(page.locator('h1')).toHaveCSS('color', 'rgb(24, 24, 27)');
  await expect(page.locator('.landscape')).toBeHidden();
  for (const card of await page.locator('.stack-row').all()) {
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  }
  await expect(page.locator('.stack-visual').first()).toBeHidden();
});

test('system high contrast keeps the primary heading readable', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCSS('background-image', 'none');
  await expect(page.locator('.surface-light').first()).toBeHidden();
});
