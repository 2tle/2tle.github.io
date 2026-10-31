// Generates the source-grounded portfolio sections from content/*.md.
// Run `npm run sync:content` after editing markdown; `npm run build` does this automatically.
import {
	mkdir,
	readdir,
	readFile,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import { marked } from "marked";
import { validateProjectMarkdown, validateProjectHtml } from "./validate-project-format.mjs";
import sanitizeHtml from "sanitize-html";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const escapeHtml = (value) =>
	String(value).replace(
		/[&<>"']/g,
		(char) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
				char
			],
	);

// Blocks are fenced with `---` lines. Header fields sit above the closing fence;
// every non-empty line after it is a separate source detail.
function parseBlocks(markdown, file) {
	const lines = markdown.split(/\r?\n/);
	if (lines[0]?.trim() === "---") lines.shift();
	const blocks = [];
	while (lines.length) {
		const meta = {};
		while (lines.length && lines[0].trim() !== "---") {
			const line = lines.shift();
			if (line.trim() === "") continue;
			const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
			if (!match)
				throw new Error(
					`${file}: expected "key: value" inside a fenced header, got "${line}"`,
				);
			const key = match[1].toLowerCase();
			const value = match[2].trim();
			meta[key] =
				key === "link" ? value.replace(/^<(https:\/\/[^>]+)>$/i, "$1") : value;
		}
		if (!lines.length)
			throw new Error(`${file}: unterminated header (missing closing "---")`);
		lines.shift();
		const bodyLines = [];
		while (lines.length && lines[0].trim() !== "---") {
			const line = lines.shift().trim();
			if (line) bodyLines.push(line);
		}
		if (lines.length) lines.shift();
		if (Object.keys(meta).length || bodyLines.length)
			blocks.push({ meta, lines: bodyLines });
	}
	return blocks;
}

function requireFields(block, file, position, fields) {
	for (const field of fields) {
		if (!block.meta[field])
			throw new Error(`${file} block ${position}: missing "${field}"`);
	}
}

function datetime(value) {
	return escapeHtml(String(value).replaceAll(".", "-"));
}

function period(date, dateEnd) {
	const end = dateEnd
		? ` <span aria-hidden="true">·</span> <time datetime="${datetime(dateEnd)}">${escapeHtml(dateEnd)}</time>`
		: "";
	return `<time datetime="${datetime(date)}">${escapeHtml(date)}</time>${end}`;
}

function sourceLines(lines, file, position) {
	return `<ul>${lines
		.map((line) => {
			const link = line.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/i);
			if (!link) {
				if (line.startsWith("["))
					throw new Error(
						`${file} block ${position}: detail link must be [text](https://url)`,
					);
				return `<li>${escapeHtml(line)}</li>`;
			}
			if (!URL.canParse(link[2])) {
				throw new Error(
					`${file} block ${position}: detail link must use HTTPS`,
				);
			}
			return `<li><a class="experience-detail-link" href="${escapeHtml(link[2])}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(link[1])} (새 탭)">${escapeHtml(link[1])} <span aria-hidden="true">↗</span></a></li>`;
		})
		.join("")}</ul>`;
}

function renderExperience(entry, index) {
	const file = "content/experience.md";
	const position = index + 1;
	const { meta: fields, lines } = entry;
	requireFields(entry, file, position, ["date", "org", "role"]);
	if (!lines.length)
		throw new Error(`${file} block ${position}: missing source detail`);
	if (fields.link && !/^https:\/\//i.test(fields.link))
		throw new Error(`${file} block ${position}: link must use HTTPS`);
	const orgDetail = fields.orgdetail
		? `<span>${escapeHtml(fields.orgdetail)}</span>`
		: "";
	const linkIcon =
		'<span class="experience-link-icon" aria-hidden="true">↗</span>';
	const heading = fields.link
		? `<a class="experience-link" href="${escapeHtml(fields.link)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(fields.org)} 자세히 보기 (새 탭)">${escapeHtml(fields.role)}${linkIcon}</a>`
		: escapeHtml(fields.role);
	return `<li class="experience-item reveal-entry">
              <div class="experience-date">${period(fields.date, fields.dateend)}</div>
              <article><p class="experience-org">${escapeHtml(fields.org)}${orgDetail}</p>
                <h3>${heading}</h3>
                ${sourceLines(lines, file, position)}</article>
            </li>`;
}

async function readProjects() {
	const directory = resolve(root, "content/projects");
	const entries = await readdir(directory).catch((error) => {
		if (error.code !== "ENOENT") throw error;
		return [];
	});
	const files = entries.filter((file) => file.endsWith(".md"));
	const projects = await Promise.all(
		files.map(async (file) => {
			const slug = file.slice(0, -3);
			if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
				throw new Error(
					`${file}: filename must use lowercase letters, numbers and hyphens`,
				);
			const markdown = await readFile(resolve(directory, file), "utf8");
			const match = markdown.match(
				/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/,
			);
			if (!match) throw new Error(`${file}: missing fenced metadata header`);
			const entry = parseBlocks(`---\n${match[1]}\n---\n`, file)[0] ?? {
				meta: {},
			};
			requireFields(entry, file, 1, ["name", "summary", "link"]);
			const fields = entry.meta;
			if (!match[2].trim()) throw new Error(`${file}: missing Markdown body`);
			if (!/^https:\/\//i.test(fields.link) || !URL.canParse(fields.link))
				throw new Error(`${file}: link must use HTTPS`);
			if (fields.image) {
				if (
					!/^assets\/images\/[\w/-]+\.(?:svg|webp|png|jpg)$/i.test(
						fields.image,
					) ||
					fields.image.includes("..")
				)
					throw new Error(`${file}: image must be a local assets/images file`);
				await stat(resolve(root, fields.image));
			}
			if (
				fields.imagescale &&
				(!/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(fields.imagescale) ||
					Number(fields.imagescale) === 0)
			)
				throw new Error(
					`${file}: imageScale must be greater than 0 and no more than 1`,
				);
			if (fields.hidelink && !["true", "false"].includes(fields.hidelink))
				throw new Error(`${file}: hideLink must be true or false`);
			if (fields.imagelayout && fields.imagelayout !== "wide")
				throw new Error(`${file}: imageLayout must be wide`);
			if (fields.order && !/^\d+$/.test(fields.order))
				throw new Error(`${file}: order must be a non-negative integer`);
			const structure = validateProjectMarkdown(match[2], file);
			// ponytail: a standard parser plus sanitizer, not a home-grown Markdown dialect.
			const body = sanitizeHtml(marked.parse(match[2]), {
				allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
				allowedAttributes: {
					...sanitizeHtml.defaults.allowedAttributes,
					img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
					code: ["class"],
				},
				allowedSchemes: ["https", "mailto"],
				allowProtocolRelative: false,
			});
			validateProjectHtml(body, structure, file);
			return { slug, fields, body };
		}),
	);
	return projects.sort(
		(a, b) =>
			Number(a.fields.order ?? 100) - Number(b.fields.order ?? 100) ||
			a.slug.localeCompare(b.slug, "en"),
	);
}

function projectImage(fields, prefix, className) {
	if (!fields.image) return "";
	const scale = fields.imagescale
		? ` style="--project-image-scale:${escapeHtml(fields.imagescale)}"`
		: "";
	return `<img class="${className}${fields.imagelayout === "wide" ? " project-image-wide" : ""}"${scale} src="${prefix}${escapeHtml(fields.image)}" alt="" width="420" height="420" loading="lazy">`;
}

function renderProjectPeriods(fields) {
	const entries = [
		["개발 기간", fields.developmentperiod],
		["운영 기간", fields.operationperiod],
	].filter(([, value]) => value);
	if (!entries.length) return "";
	return `<dl class="project-periods">${entries.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
}

function renderProject({ slug, fields }, index) {
	const periods = renderProjectPeriods(fields);
	return `<li class="project">
              <article><a class="project-card" href="./projects/${slug}.html" aria-label="${escapeHtml(fields.name)} 프로젝트 보기">
                <div class="project-visual" aria-hidden="true"><span class="project-number">${String(index + 1).padStart(2, "0")}</span>${projectImage(fields, "./", "project-object")}</div>
                <div class="project-info">
                  ${fields.category ? `<p class="project-category">${escapeHtml(fields.category)}</p>` : ""}
                  <h3>${escapeHtml(fields.name)}<span aria-hidden="true">↗</span></h3>
                  <p class="project-summary">${escapeHtml(fields.summary)}</p>
                  ${fields.tools ? `<p class="project-tools">${escapeHtml(fields.tools)}</p>` : ""}${periods ? `
                  ${periods}` : ""}
                </div>
              </a></article>
            </li>`;
}

function renderProjectPage({ fields, body }, html) {
	const periods = renderProjectPeriods(fields);
	const title = `${escapeHtml(fields.name)} · stringju`;
	const head = html
		.match(/<head>[\s\S]*?<\/head>/)[0]
		.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`)
		.replace(
			/(<meta (?:name="description"|property="og:description") content=")[^"]*("\s*\/>)/g,
			(_, start, end) => `${start}${escapeHtml(fields.summary)}${end}`,
		)
		.replace(
			/(<meta property="og:title" content=")[^"]*("\s*\/>)/,
			(_, start, end) => `${start}${title}${end}`,
		)
		.replace(/\s*<link rel="preload"[^>]*>/g, "")
		.replaceAll('href="./', 'href="../');
	return `<!doctype html>
<html lang="ko">
${head}
<body>
  <a class="skip-link" href="#main">본문으로 건너뛰기</a>
  <header class="site-header detail-header container">
    <a class="wordmark" href="../index.html" aria-label="stringju 처음으로">stringju<span aria-hidden="true">.</span></a>
    <a class="back-link" href="../index.html#work"><span aria-hidden="true">←</span> 프로젝트 목록</a>
  </header>
  <main class="detail-main" id="main" tabindex="-1">
    <header class="detail-intro">
      ${fields.category ? `<p class="project-category">${escapeHtml(fields.category)}</p>` : ""}
      <h1>${escapeHtml(fields.name)}</h1>
      <p class="project-summary">${escapeHtml(fields.summary)}</p>
${periods ? `      ${periods}
` : ""}      <div class="detail-meta">
        ${fields.tools ? `<p class="project-tools">${escapeHtml(fields.tools)}</p>` : ""}
        ${fields.hidelink === "true" ? "" : `<a class="repository-link" href="${escapeHtml(fields.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(fields.linklabel || "저장소 보기")} <span aria-hidden="true">↗</span></a>`}
      </div>
    </header>
    ${fields.image ? `<div class="detail-visual" aria-hidden="true">${projectImage(fields, "../", "detail-object")}</div>` : ""}
    <article class="markdown-body" aria-label="프로젝트 상세">${body}</article>
    <div class="detail-bottom"><a class="back-link" href="../index.html#work"><span aria-hidden="true">←</span> 프로젝트 목록</a></div>
  </main>
</body>
</html>
`;
}

function renderEducation(entry, index) {
	const file = "content/education.md";
	const position = index + 1;
	const { meta: fields, lines } = entry;
	requireFields(entry, file, position, ["date", "org"]);
	if (!lines.length)
		throw new Error(`${file} block ${position}: missing detail body`);
	return `<li class="education-item reveal-entry">
              <div class="record-date">${period(fields.date, fields.dateend)}</div>
              <div><h3>${escapeHtml(fields.org)}</h3><p>${escapeHtml(lines.join(" "))}</p></div>
            </li>`;
}

function renderAward(entry, index) {
	const file = "content/awards.md";
	const position = index + 1;
	const { meta: fields } = entry;
	requireFields(entry, file, position, ["date", "title", "result"]);
	if (fields.link && !/^https:\/\//i.test(fields.link))
		throw new Error(`${file} block ${position}: link must use HTTPS`);
	const linkIcon = '<span class="award-link-icon" aria-hidden="true">↗</span>';
	const content = `<div class="award-copy"><h3>${escapeHtml(fields.title)}${fields.link ? linkIcon : ""}</h3><p>${escapeHtml(fields.result)}</p></div>`;
	const item = fields.link
		? `<a class="award-link" href="${escapeHtml(fields.link)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(fields.title)} 자세히 보기 (새 탭)">${content}</a>`
		: content;
	return `<li class="award-item reveal-entry">
              <div class="award-date"><time datetime="${datetime(fields.date)}">${escapeHtml(fields.date)}</time></div>
              ${item}
            </li>`;
}

function renderIntroducing(entry) {
	const file = "content/introducing.md";
	const { meta: fields, lines } = entry;
	requireFields(entry, file, 1, ["name", "handle"]);
	if (!lines.length) throw new Error(`${file}: missing introduction body`);
	return `<p class="introduction-name">${escapeHtml(fields.name)} <span>${escapeHtml(fields.handle)}</span></p>
            <p>${escapeHtml(lines.join(" "))}</p>`;
}

function replaceBlock(html, marker, items) {
	const pattern = new RegExp(
		`<!-- content:${marker}:start -->[\\s\\S]*?<!-- content:${marker}:end -->`,
	);
	if (!pattern.test(html))
		throw new Error(`index.html: missing content:${marker} markers`);
	return html.replace(
		pattern,
		() =>
			`<!-- content:${marker}:start -->\n            ${items.join("\n            ")}\n            <!-- content:${marker}:end -->`,
	);
}

export async function syncContent() {
	const files = ["experience", "education", "awards"];
	const [
		experienceMarkdown,
		educationMarkdown,
		awardsMarkdown,
		introducingMarkdown,
		html,
	] = await Promise.all([
		...files.map((file) =>
			readFile(resolve(root, "content", `${file}.md`), "utf8"),
		),
		readFile(resolve(root, "content", "introducing.md"), "utf8"),
		readFile(resolve(root, "index.html"), "utf8"),
	]);
	const experience = parseBlocks(experienceMarkdown, "content/experience.md");
	const projects = await readProjects();
	const education = parseBlocks(educationMarkdown, "content/education.md");
	const awards = parseBlocks(awardsMarkdown, "content/awards.md");
	const introducing = parseBlocks(
		introducingMarkdown,
		"content/introducing.md",
	);
	if (introducing.length !== 1)
		throw new Error("content/introducing.md: expected exactly one block");
	let next = replaceBlock(html, "introducing", [
		renderIntroducing(introducing[0]),
	]);
	next = replaceBlock(next, "experience", experience.map(renderExperience));
	next = replaceBlock(
		next,
		"projects",
		projects.length
			? projects.map(renderProject)
			: ['<li class="project-empty">공개할 프로젝트를 준비하고 있습니다.</li>'],
	);
	next = replaceBlock(next, "education", education.map(renderEducation));
	next = replaceBlock(next, "awards", awards.map(renderAward));
	let changed = next !== html;
	if (changed) await writeFile(resolve(root, "index.html"), next);
	const output = resolve(root, "projects");
	await mkdir(output, { recursive: true });
	const pages = new Set();
	for (const project of projects) {
		const filename = `${project.slug}.html`;
		pages.add(filename);
		const path = resolve(output, filename);
		const page = renderProjectPage(project, next);
		const previous = await readFile(path, "utf8").catch((error) => {
			if (error.code !== "ENOENT") throw error;
			return "";
		});
		if (page !== previous) {
			await writeFile(path, page);
			changed = true;
		}
	}
	// Only generated HTML is removed; source Markdown and assets are never touched.
	for (const filename of await readdir(output)) {
		if (filename.endsWith(".html") && !pages.has(filename)) {
			await rm(resolve(output, filename));
			changed = true;
		}
	}
	return {
		introducing: introducing.length,
		experience: experience.length,
		projects: projects.length,
		education: education.length,
		awards: awards.length,
		changed,
	};
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	const result = await syncContent();
	console.log(
		`Content synced: ${result.introducing} introducing, ${result.experience} experience, ${result.projects} projects, ${result.education} education, ${result.awards} awards${result.changed ? "" : " (unchanged)"}`,
	);
}
