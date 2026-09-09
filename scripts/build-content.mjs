// Generates the source-grounded portfolio sections from content/*.md.
// Run `npm run sync:content` after editing markdown; `npm run build` does this automatically.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// Blocks are fenced with `---` lines. Header fields sit above the closing fence;
// every non-empty line after it is a separate source detail.
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
    while (lines.length && lines[0].trim() !== '---') {
      const line = lines.shift().trim();
      if (line) bodyLines.push(line);
    }
    if (lines.length) lines.shift();
    if (Object.keys(meta).length || bodyLines.length) blocks.push({ meta, lines: bodyLines });
  }
  return blocks;
}

function requireFields(block, file, position, fields) {
  for (const field of fields) {
    if (!block.meta[field]) throw new Error(`${file} block ${position}: missing "${field}"`);
  }
}

function datetime(value) {
  return escapeHtml(String(value).replaceAll('.', '-'));
}

function period(date, dateEnd) {
  const end = dateEnd ? ` <span aria-hidden="true">·</span> <time datetime="${datetime(dateEnd)}">${escapeHtml(dateEnd)}</time>` : '';
  return `<time datetime="${datetime(date)}">${escapeHtml(date)}</time>${end}`;
}

function sourceLines(lines) {
  return `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
}

function renderExperience(entry, index) {
  const file = 'content/experience.md';
  const position = index + 1;
  const { meta: fields, lines } = entry;
  requireFields(entry, file, position, ['date', 'org', 'role']);
  if (!lines.length) throw new Error(`${file} block ${position}: missing source detail`);
  const orgDetail = fields.orgdetail ? `<span>${escapeHtml(fields.orgdetail)}</span>` : '';
  return `<li class="experience-item reveal-entry">
              <div class="experience-date">${period(fields.date, fields.dateend)}</div>
              <article>
                <p class="experience-org">${escapeHtml(fields.org)}${orgDetail}</p>
                <h3>${escapeHtml(fields.role)}</h3>
                ${sourceLines(lines)}
              </article>
            </li>`;
}

function renderSkill(skill, index) {
  const file = 'content/skills.md';
  const position = index + 1;
  const { meta: fields, lines } = skill;
  requireFields(skill, file, position, ['name']);
  if (!lines.length) throw new Error(`${file} block ${position}: missing skill list`);
  return `<li class="stack-row reveal-stack">
              <div class="stack-visual" aria-hidden="true"><span></span><span></span><span></span></div>
              <h3>${escapeHtml(fields.name)}</h3>
              <p>${escapeHtml(lines.join(' '))}</p>
            </li>`;
}

function renderProject(project, index) {
  const file = 'content/projects.md';
  const position = index + 1;
  const { meta: fields, lines } = project;
  requireFields(project, file, position, ['name', 'link']);
  if (!lines.length) throw new Error(`${file} block ${position}: missing description body`);
  if (!/^https:\/\//i.test(fields.link)) throw new Error(`${file} block ${position}: link must use HTTPS`);
  if (fields.image && (!/^assets\/images\/[\w/-]+\.(?:svg|webp|png|jpg)$/i.test(fields.image) || fields.image.includes('..'))) {
    throw new Error(`${file} block ${position}: image ${fields.image} must be a local assets/images file`);
  }
  const visual = fields.image ? `<div class="project-visual" aria-hidden="true"><div class="project-halo"></div><img class="project-object" src="./${escapeHtml(fields.image)}" alt="" width="420" height="420" loading="lazy"><div class="project-plinth"></div></div>` : '';
  const category = fields.category ? `<p class="project-category"><span aria-hidden="true">${String(position).padStart(2, '0')}</span>${escapeHtml(fields.category)}</p>` : '';
  const projectTools = fields.tools ? `<p class="project-tools">${escapeHtml(fields.tools)}</p>` : '';
  return `<li class="project">
              <article class="project-shell">
                ${visual}
                <div class="project-info reveal-project">
                  ${category}
                  <h3>${escapeHtml(fields.name)}</h3>
                  <p>${escapeHtml(lines.join(' '))}</p>
                  ${projectTools}
                  <a class="project-link" href="${escapeHtml(fields.link)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(fields.name)} 저장소 열기 (새 탭)">저장소 보기 <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            </li>`;
}

function renderEducation(entry, index) {
  const file = 'content/education.md';
  const position = index + 1;
  const { meta: fields, lines } = entry;
  requireFields(entry, file, position, ['date', 'org']);
  if (!lines.length) throw new Error(`${file} block ${position}: missing detail body`);
  return `<li class="education-item reveal-entry">
              <div class="record-date">${period(fields.date, fields.dateend)}</div>
              <div><h3>${escapeHtml(fields.org)}</h3><p>${escapeHtml(lines.join(' '))}</p></div>
            </li>`;
}

function renderHistory(entry, index) {
  const file = 'content/timeline.md';
  const position = index + 1;
  const { meta: fields, lines } = entry;
  requireFields(entry, file, position, ['date', 'org']);
  if (!lines.length) throw new Error(`${file} block ${position}: missing detail body`);
  return `<li class="history-item reveal-entry">
              <div><h3>${escapeHtml(fields.org)}</h3><p>${escapeHtml(lines.join(' '))}</p></div>
              <div class="record-date">${period(fields.date, fields.dateend)}</div>
            </li>`;
}

function replaceBlock(html, marker, items) {
  const pattern = new RegExp(`<!-- content:${marker}:start -->[\\s\\S]*?<!-- content:${marker}:end -->`);
  if (!pattern.test(html)) throw new Error(`index.html: missing content:${marker} markers`);
  return html.replace(pattern, () => `<!-- content:${marker}:start -->\n            ${items.join('\n            ')}\n            <!-- content:${marker}:end -->`);
}

export async function syncContent() {
  const files = ['experience', 'skills', 'projects', 'education', 'timeline'];
  const [experienceMarkdown, skillsMarkdown, projectsMarkdown, educationMarkdown, historyMarkdown, html] = await Promise.all([
    ...files.map((file) => readFile(resolve(root, 'content', `${file}.md`), 'utf8')),
    readFile(resolve(root, 'index.html'), 'utf8'),
  ]);
  const experience = parseBlocks(experienceMarkdown, 'content/experience.md');
  const skills = parseBlocks(skillsMarkdown, 'content/skills.md');
  const projects = parseBlocks(projectsMarkdown, 'content/projects.md');
  const education = parseBlocks(educationMarkdown, 'content/education.md');
  const history = parseBlocks(historyMarkdown, 'content/timeline.md');
  let next = replaceBlock(html, 'experience', experience.map(renderExperience));
  next = replaceBlock(next, 'skills', skills.map(renderSkill));
  next = replaceBlock(next, 'projects', projects.map(renderProject));
  next = replaceBlock(next, 'education', education.map(renderEducation));
  next = replaceBlock(next, 'history', history.map(renderHistory));
  const changed = next !== html;
  if (changed) await writeFile(resolve(root, 'index.html'), next);
  return { experience: experience.length, skills: skills.length, projects: projects.length, education: education.length, history: history.length, changed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await syncContent();
  console.log(`Content synced: ${result.experience} experience, ${result.skills} skill groups, ${result.projects} projects, ${result.education} education records, ${result.history} history records${result.changed ? '' : ' (unchanged)'}`);
}
