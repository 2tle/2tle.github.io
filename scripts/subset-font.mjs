// Optional maintenance tool. Published pages never call Google Fonts.
// Regenerate after changing Korean copy: node scripts/subset-font.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const input = await readFile(resolve(root, 'index.html'), 'utf8');
const text = [...new Set([...input].filter((char) => /[\uAC00-\uD7A3\u3131-\u3163\u2190-\u21FF\u2700-\u27BF]/.test(char)))].join('') + Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32)).join('') + '©·–◌';
const url = new URL('https://fonts.googleapis.com/css2');
url.searchParams.set('family', 'Noto Sans KR:wght@100..900');
url.searchParams.set('display', 'swap');
url.searchParams.set('text', text);
const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' } });
if (!response.ok) throw new Error(`Font CSS: ${response.status}`);
const css = await response.text();
const sources = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((match) => match[1]))];
if (!sources.length) throw new Error('No font URL found');
await mkdir(resolve(root, 'assets/fonts'), { recursive: true });
let localCss = css;
for (const [index, source] of sources.entries()) {
  const fontResponse = await fetch(source);
  if (!fontResponse.ok) throw new Error(`Font file: ${fontResponse.status}`);
  const bytes = Buffer.from(await fontResponse.arrayBuffer());
  const signature = bytes.subarray(0, 4).toString();
  const format = signature === 'wOF2' ? 'woff2' : signature === 'wOFF' ? 'woff' : 'ttf';
  const filename = `noto-sans-kr-${index}.${format}`;
  await writeFile(resolve(root, 'assets/fonts', filename), bytes);
  localCss = localCss.replaceAll(source, `./${filename}`);
  console.log(`Self-hosted ${filename}: ${bytes.length} bytes; ${text.length} glyphs requested.`);
}
await writeFile(resolve(root, 'assets/fonts/fonts.css'), localCss);
