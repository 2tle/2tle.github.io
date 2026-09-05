// Generates the project grid and timeline inside index.html from content/*.md.
// Run `npm run sync:content` after editing markdown; `npm run build` does this automatically.
import { readFile, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

async function ensureFile(path) {
  try { await access(resolve(root, path), constants.F_OK); }
  catch { throw new Error(`Content references missing file: ${path}`); }
}

function techList(project, name) {
  const items = (project.tech || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  if (!items.length) return '';
  const tags = items.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('');
  return `<ul class="tech-tags" aria-label="${escapeHtml(name)} 기술">${tags}</ul>`;
}

function renderProject(project, index) {
  const file = 'content/projects.md';
  const position = index + 1;
  const { meta: fields, body } = project;
  requireFields(project, file, position, ['name', 'kind', 'year', 'headline', 'link', 'art']);
  if (!body) throw new Error(`${file} block ${position}: missing description body`);
  const meta = `<div class="project-meta"><span>${String(index + 1).padStart(2, '0')} / ${escapeHtml(fields.kind)}</span><span>${escapeHtml(fields.year)} 시작</span></div>`;
  const content = `
          <div class="project-content">
            <h3>${escapeHtml(fields.name)}</h3>
            <p class="project-headline">${escapeHtml(fields.headline)}</p>
            <p class="project-description">${escapeHtml(body)}</p>
            ${techList(fields, fields.name)}
            <a class="project-link" href="${escapeHtml(fields.link)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(fields.name)} 저장소 보기 (새 탭)">저장소 보기 <span aria-hidden="true">↗</span></a>
          </div>`;
  if (fields.art === 'orbit') {
    requireFields(project, file, position, ['logo', 'caption']);
    return `<article class="project project-featured reveal">${content.replace('<div class="project-content">', `<div class="project-content">\n            ${meta}`)}
          <div class="project-art nether-art" aria-hidden="true">
            <div class="art-ring"></div><div class="art-ring art-ring-outer"></div>
            <img src="./${escapeHtml(fields.logo)}" alt="" width="220" height="220" loading="lazy">
            <span>${escapeHtml(fields.caption)}</span>
          </div>
        </article>`;
  }
  if (fields.art === 'pixel') {
    requireFields(project, file, position, ['logo', 'caption']);
    return `<article class="project project-pet reveal">${meta}
          <div class="pet-art" aria-hidden="true"><img src="./${escapeHtml(fields.logo)}" alt="" width="128" height="128" loading="lazy"><span>${escapeHtml(fields.caption)}</span></div>${content}
        </article>`;
  }
  if (fields.art === 'diagram') {
    requireFields(project, file, position, ['diagram-top', 'diagram-center', 'diagram-branches', 'aria']);
    const branches = fields['diagram-branches'].split(',').map((label) => `<span>${escapeHtml(label.trim())}</span>`).join('');
    return `<article class="project project-api reveal">${meta}
          <div class="api-art" role="img" aria-label="${escapeHtml(fields.aria)}">
            <div class="api-node">${escapeHtml(fields['diagram-top'])}</div><div class="api-connector"></div><div class="api-center">${escapeHtml(fields['diagram-center'])}</div><div class="api-branches">${branches}</div>
          </div>${content}
        </article>`;
  }
  throw new Error(`${file} block ${position}: unknown art "${fields.art}" (orbit, pixel, diagram)`);
}

function renderTimeline(entry, index) {
  const file = 'content/timeline.md';
  const position = index + 1;
  const fields = entry.meta;
  requireFields(entry, file, position, ['date', 'category', 'org']);
  if (!entry.body) throw new Error(`${file} block ${position}: missing detail body`);
  const datetime = (value) => escapeHtml(value.replaceAll('.', '-'));
  let end = '';
  if (fields.dateend) {
    let short = fields.dateend;
    for (let length = fields.dateend.length; length > 0; length--) {
      if (fields.date.startsWith(fields.dateend.slice(0, length))) { short = fields.dateend.slice(length); break; }
    }
    end = `~<time datetime="${datetime(fields.dateend)}">${escapeHtml(short)}</time>`;
  }
  return `<li class="reveal"><div class="timeline-date"><span><time datetime="${datetime(fields.date)}">${escapeHtml(fields.date)}</time>${end}</span><span>${escapeHtml(fields.category)}</span></div><div class="timeline-detail"><h3>${escapeHtml(fields.org)}</h3><p>${escapeHtml(entry.body)}</p></div></li>`;
}

function replaceBlock(html, marker, items, indent) {
  const pattern = new RegExp(`(<!-- content:${marker}:start -->)[\\s\\S]*?(<!-- content:${marker}:end -->)`);
  if (!pattern.test(html)) throw new Error(`index.html: missing content:${marker} markers`);
  return html.replace(pattern, `$1\n${indent}${items.join(`\n${indent}`)}\n      $2`);
}

export async function syncContent() {
  const [projectsMarkdown, timelineMarkdown, html] = await Promise.all([
    readFile(resolve(root, 'content/projects.md'), 'utf8'),
    readFile(resolve(root, 'content/timeline.md'), 'utf8'),
    readFile(resolve(root, 'index.html'), 'utf8'),
  ]);
  const projects = parseBlocks(projectsMarkdown, 'content/projects.md');
  const timeline = parseBlocks(timelineMarkdown, 'content/timeline.md');
  for (const project of projects) if (project.meta.logo) await ensureFile(project.meta.logo);
  const projectsHtml = projects.map(renderProject);
  const timelineHtml = timeline.map(renderTimeline);
  let next = html.replace(/<!-- content:projects:start -->[\s\S]*?<!-- content:projects:end -->/, () =>
    `<!-- content:projects:start -->\n        ${projectsHtml.join('\n        ')}\n      <!-- content:projects:end -->`);
  next = next.replace(/<!-- content:timeline:start -->[\s\S]*?<!-- content:timeline:end -->/, () =>
    `<!-- content:timeline:start -->\n        ${timelineHtml.join('\n        ')}\n      <!-- content:timeline:end -->`);
  const changed = next !== html;
  if (changed) await writeFile(resolve(root, 'index.html'), next);
  return { projects: projects.length, timeline: timeline.length, changed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await syncContent();
  console.log(`Content synced: ${result.projects} projects, ${result.timeline} timeline entries${result.changed ? '' : ' (unchanged)'}`);
}
