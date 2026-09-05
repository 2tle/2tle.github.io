// Generates concise project showcases and experience entries from content/*.md.
// Run `npm run sync:content` after editing markdown; `npm run build` does this automatically.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// Blocks are fenced with `---` lines:
//   ---\nkey: value lines\n---\ndescription text\n---\nkey: value...\n---\ndescription...
// The description body runs until the next `---` (or end of file).
function parseBlocks(markdown, file) {
  const lines = markdown.split(/\r?\n/);
  if (lines[0]?.trim() === '---') lines.shift();
  const blocks = [];
  while (lines.length) {
    const meta = {};
    while (lines.length && lines[0].trim() !== '---') {
      const line = lines.shift();
      if (line.trim() === '') continue;
      const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
      if (!match) throw new Error(`${file}: expected "key: value" inside a fenced header, got "${line}"`);
      meta[match[1].toLowerCase()] = match[2].trim();
    }
    if (!lines.length) throw new Error(`${file}: unterminated header (missing closing "---")`);
    lines.shift();
    const bodyLines = [];
    while (lines.length && lines[0].trim() !== '---') bodyLines.push(lines.shift());
    if (lines.length) lines.shift();
    if (Object.keys(meta).length || bodyLines.join('').trim()) blocks.push({ meta, body: bodyLines.join(' ').trim() });
  }
  return blocks;
}

function requireFields(block, file, position, fields) {
  for (const field of fields) {
    if (!block.meta[field]) throw new Error(`${file} block ${position}: missing "${field}"`);
  }
}

function renderProject(project, index) {
  const file = 'content/projects.md';
  const position = index + 1;
  const { meta: fields, body } = project;
  requireFields(project, file, position, ['name', 'link']);
  if (!body) throw new Error(`${file} block ${position}: missing description body`);
  if (!/^https:\/\//i.test(fields.link)) throw new Error(`${file} block ${position}: link must use HTTPS`);
  if (fields.image && (!/^assets\/images\/[\w/-]+\.(?:svg|webp|png|jpg)$/i.test(fields.image) || fields.image.includes('..'))) {
    throw new Error(`${file} block ${position}: image ${fields.image} must be a local assets/images file`);
  }
  const visual = fields.image ? `
            <div class="project-visual" aria-hidden="true"><img class="project-object" src="./${escapeHtml(fields.image)}" alt="" width="320" height="320" loading="lazy"></div>` : '';
  return `<li class="project">
          <a class="project-link" href="${escapeHtml(fields.link)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(fields.name)} 저장소 (새 탭)">${visual}
            <div class="project-info">
              <div><h3>${escapeHtml(fields.name)}</h3><p>${escapeHtml(body)}</p></div>
              <span class="project-arrow" aria-hidden="true">↗</span>
            </div>
          </a>
        </li>`;
}

function renderTimeline(entry, index) {
  const file = 'content/timeline.md';
  const position = index + 1;
  const fields = entry.meta;
  requireFields(entry, file, position, ['date', 'org']);
  if (!entry.body) throw new Error(`${file} block ${position}: missing detail body`);
  const datetime = (value) => escapeHtml(value.replaceAll('.', '-'));
  const end = fields.dateend ? ` ~ <time datetime="${datetime(fields.dateend)}">${escapeHtml(fields.dateend)}</time>` : '';
  return `<li>
          <div><h3>${escapeHtml(fields.org)}</h3><p>${escapeHtml(entry.body)}</p></div>
          <div class="timeline-date"><time datetime="${datetime(fields.date)}">${escapeHtml(fields.date)}</time>${end}</div>
        </li>`;
}

function replaceBlock(html, marker, items) {
  const pattern = new RegExp(`<!-- content:${marker}:start -->[\\s\\S]*?<!-- content:${marker}:end -->`);
  if (!pattern.test(html)) throw new Error(`index.html: missing content:${marker} markers`);
  return html.replace(pattern, () => `<!-- content:${marker}:start -->\n        ${items.join('\n        ')}\n        <!-- content:${marker}:end -->`);
}

export async function syncContent() {
  const [projectsMarkdown, timelineMarkdown, html] = await Promise.all([
    readFile(resolve(root, 'content/projects.md'), 'utf8'),
    readFile(resolve(root, 'content/timeline.md'), 'utf8'),
    readFile(resolve(root, 'index.html'), 'utf8'),
  ]);
  const projects = parseBlocks(projectsMarkdown, 'content/projects.md');
  const timeline = parseBlocks(timelineMarkdown, 'content/timeline.md');
  let next = replaceBlock(html, 'projects', projects.map(renderProject));
  next = replaceBlock(next, 'timeline', timeline.map(renderTimeline));
  const changed = next !== html;
  if (changed) await writeFile(resolve(root, 'index.html'), next);
  return { projects: projects.length, timeline: timeline.length, changed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await syncContent();
  console.log(`Content synced: ${result.projects} projects, ${result.timeline} timeline entries${result.changed ? '' : ' (unchanged)'}`);
}
