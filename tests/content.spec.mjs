import { test, expect } from '@playwright/test';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const run = promisify(execFile);

async function fixture(check) {
  const root = await mkdtemp(join(tmpdir(), 'stringju-content-'));
  try {
    await mkdir(join(root, 'scripts'));
    await cp('scripts/build-content.mjs', join(root, 'scripts/build-content.mjs'));
    await cp('content', join(root, 'content'), { recursive: true });
    await cp('index.html', join(root, 'index.html'));
    await check(root, () => run(process.execPath, [join(root, 'scripts/build-content.mjs')]));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('content sync is idempotent and the built page matches source', async () => {
  await fixture(async (root, sync) => {
    const before = await readFile(join(root, 'index.html'), 'utf8');
    await sync();
    expect(await readFile(join(root, 'index.html'), 'utf8')).toBe(before);
    await sync();
    expect(await readFile(join(root, 'index.html'), 'utf8')).toBe(before);
    expect(await readFile('dist/index.html', 'utf8')).toBe(await readFile('index.html', 'utf8'));
    expect(before).toMatch(/<script src="\.\/main\.js\?v=[0-9a-f]+" defer><\/script>/);
    for (const marker of ['experience', 'projects', 'education']) {
      expect(before).toContain(`<!-- content:${marker}:start -->`);
      expect(before).toContain(`<!-- content:${marker}:end -->`);
    }
  });
});

test('source content renders the verified resume chapters', async () => {
  const html = await readFile('index.html', 'utf8');
  for (const text of ['주식회사 커리어노트', '한봄고등학교', '시스템컨설턴트그룹', '마이다스아이티', 'Hugging Face', 'Introducing']) {
    expect(html).toContain(text);
  }
  expect((html.match(/class="experience-item/g) || []).length).toBe(4);
  expect((html.match(/class="project"/g) || []).length).toBe(3);
  expect((html.match(/class="education-item/g) || []).length).toBe(2);
  expect(html).not.toContain('주요 수상 실적');
});

for (const marker of ['experience', 'projects', 'education']) {
  test(`missing ${marker} marker fails without rewriting the page`, async () => {
    await fixture(async (root, sync) => {
      const path = join(root, 'index.html');
      const html = (await readFile(path, 'utf8')).replace(`<!-- content:${marker}:end -->`, '');
      await writeFile(path, html);
      await expect(sync()).rejects.toThrow(`missing content:${marker} markers`);
      expect(await readFile(path, 'utf8')).toBe(html);
    });
  });
}

test('project content is escaped and can omit its local visual', async () => {
  await fixture(async (root, sync) => {
    await writeFile(join(root, 'content/projects.md'), '---\nname: A & B <tool>\ncategory: Desktop <script>\ntools: Rust & "Iced"\nlink: https://example.com/?a=1&b=2\n---\nLiteral $& text <script>alert(1)</script>\n');
    await sync();
    const html = await readFile(join(root, 'index.html'), 'utf8');
    expect(html).toContain('A &amp; B &lt;tool&gt;');
    expect(html).toContain('https://example.com/?a=1&amp;b=2');
    expect(html).toContain('Literal $&amp; text &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('Desktop &lt;script&gt;');
    expect(html).toContain('Rust &amp; &quot;Iced&quot;');
    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('project-visual');
  });
});

for (const [header, body, error] of [
  ['name: Test', 'Description', 'missing "link"'],
  ['name: Test\nlink: https://example.com', '', 'missing description body'],
  ['name: Test\nlink: javascript:alert(1)', 'Description', 'link must use HTTPS'],
  ['name: Test\nlink: https://example.com\nimage: ../secrets/logo.png', 'Description', 'image ../secrets/logo.png must be a local assets/images file'],
  ['name: Test\nlink: https://example.com\nimage: https://cdn.example.com/logo.png', 'Description', 'image https://cdn.example.com/logo.png must be a local assets/images file'],
]) {
  test(`invalid project: ${error}`, async () => {
    await fixture(async (root, sync) => {
      await writeFile(join(root, 'content/projects.md'), `---\n${header}\n---\n${body}\n`);
      await expect(sync()).rejects.toThrow(error);
    });
  });
}

test('experience entries require a dated organization, role, and detail', async () => {
  await fixture(async (root, sync) => {
    await writeFile(join(root, 'content/experience.md'), '---\ndate: 2025.01\norg: Test\n---\nDetail\n');
    await expect(sync()).rejects.toThrow('missing "role"');
  });
});
