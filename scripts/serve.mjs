import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const root = process.argv[2] === 'dist' ? resolve(projectRoot, 'dist') : projectRoot;
const port = Number(process.env.PORT || 4173);
// Public by default so LAN devices / port forwards can preview. The allowlist below
// serves only shipped site files, so binding publicly exposes no private content.
const host = /^[-.0-9a-zA-Z:]+$/.test(process.env.HOST || '') ? process.env.HOST : '0.0.0.0';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = path === '/' ? 'index.html' : path.slice(1);
    const file = resolve(root, relative);
    const publicFile = ['index.html', 'styles.css'].includes(relative) || relative.startsWith('assets/');
    if (!publicFile || !file.startsWith(root + sep) || relative.split('/').some((part) => part.startsWith('.'))) {
      response.writeHead(404); response.end('Not found'); return;
    }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404); response.end('Not found');
  }
});
server.listen(port, host, () => console.log(`stringju portfolio: http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port} (${root})${host === '0.0.0.0' ? ' [LAN/forwarded access enabled]' : ''}`));
