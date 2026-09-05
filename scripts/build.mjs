import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { syncContent } from './build-content.mjs';

const root = resolve(import.meta.dirname, '..');
const synced = await syncContent();
console.log(`Content: ${synced.projects} projects, ${synced.timeline} timeline entries from content/*.md.`, synced.changed ? '(updated index.html)' : '(unchanged)');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map((match) => match[1]);
for (const asset of assets) await stat(resolve(root, asset));
await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(resolve(root, 'dist'), { recursive: true });
for (const file of ['index.html', 'styles.css', 'assets', '.nojekyll']) {
  await cp(resolve(root, file), resolve(root, 'dist', file), { recursive: true });
}
console.log(`Build passed: ${assets.length} local references checked. Static site written to dist/.`);
