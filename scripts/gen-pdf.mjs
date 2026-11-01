import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseDocument, DomUtils as dom } from "htmlparser2";
import { chromium } from "@playwright/test";

const root = resolve(import.meta.dirname, "..");
const byClass = (node, name) => dom.getElementsByClassName(name, node)[0];
function required(node, name) {
	const element = byClass(node, name);
	if (!element)
		throw new Error(`PDF: missing .${name}; run npm run build first.`);
	return element;
}
const serialize = (node) => dom.getOuterHTML(node);

// ponytail: reuse validated build output, not a second Markdown/metadata parser.
export async function renderPortfolio(directory = resolve(root, "dist")) {
	const homePath = resolve(directory, "index.html");
	const home = parseDocument(await readFile(homePath, "utf8"));
	const name = required(home, "introduction-name");
	name.name = "h1";
	const email = required(home, "email-link");
	const contacts = required(home, "contact-links");
	const experience = required(home, "experience-list");
	const cards = dom.getElementsByClassName("project-card", home);
	const projects = [];
	const contents = [];
	for (const [index, card] of cards.entries()) {
		const pagePath = resolve(directory, card.attribs.href);
		const detail = parseDocument(await readFile(pagePath, "utf8"));
		const intro = required(detail, "detail-intro");
		const heading = dom.getElementsByTagName("h1", intro)[0];
		if (!heading) throw new Error(`PDF: missing project title in ${pagePath}`);
		const id = `project-${index + 1}`;
		contents.push(`<li><a href="#${id}">${dom.getInnerHTML(heading)}</a></li>`);
		heading.name = "h2";
		const body = required(detail, "markdown-body");
		for (const node of dom.findAll(
			(node) => /^h[1-6]$/.test(node.name),
			[body],
		)) {
			node.name = `h${Math.min(6, Number(node.name[1]) + 1)}`;
		}
		const visual = byClass(detail, "detail-visual");
		for (const image of dom.getElementsByTagName("img", detail)) {
			const url = new URL(image.attribs.src, pathToFileURL(pagePath));
			if (url.protocol !== "file:")
				throw new Error(`PDF images must be local: ${url}`);
			image.attribs.src = url.href;
			image.attribs.loading = "eager";
		}
		projects.push(`<section class="pdf-project" id="${id}">
			<div class="project-heading">${serialize(intro)}${visual ? serialize(visual) : ""}</div>
			${serialize(body)}</section>`);
	}
	const fonts = pathToFileURL(
		resolve(directory, "assets/fonts/fonts.css"),
	).href;
	const css = await readFile(
		resolve(root, "scripts/portfolio-pdf.css"),
		"utf8",
	);
	return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<title>Portfolio</title>
<link rel="stylesheet" href="${fonts}"><style>${css}</style></head>
<body><main>
<section class="overview">
<header class="identity"><p class="document-label">Portfolio</p>${serialize(name)}
<div class="contacts">${serialize(email)}${serialize(contacts)}</div></header>
<section aria-labelledby="experience-title"><h2 id="experience-title">Experiences</h2>${serialize(experience)}</section>
<nav class="contents" aria-labelledby="projects-title"><h2 id="projects-title">Projects</h2>
<ol>${contents.join("\n")}</ol></nav>
</section>
${projects.join("\n")}
</main></body></html>`;
}

export async function generatePdf(
	output = resolve(root, "artifacts/pdf/portfolio.pdf"),
) {
	if (!/\.pdf$/i.test(output))
		throw new Error("출력 경로는 .pdf로 끝나야 합니다.");
	const pdfPath = resolve(output);
	const htmlPath = pdfPath.replace(/\.pdf$/i, ".html");
	const temporary = `${pdfPath}.tmp`;
	await mkdir(dirname(pdfPath), { recursive: true });
	await writeFile(htmlPath, await renderPortfolio());
	let browser;
	try {
		browser = await chromium.launch({
			args: ["--allow-file-access-from-files"],
		});
		const page = await browser.newPage();
		// External links remain clickable in the PDF; rendering never needs the network.
		await page.route(/^https?:\/\//, (route) => route.abort());
		await page.emulateMedia({ media: "print" });
		await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
		await page.evaluate(async () => {
			const fonts = await document.fonts.load(
				'400 10pt "Pretendard"',
				"양현준",
			);
			await document.fonts.ready;
			if (!fonts.length || fonts.some((font) => font.status !== "loaded")) {
				throw new Error("PDF font failed to load: Pretendard");
			}
			await Promise.all(
				[...document.images].map(async (image) => {
					try {
						await image.decode();
					} catch {
						throw new Error(`PDF image failed to load: ${image.src}`);
					}
				}),
			);
		});
		await page.pdf({
			path: temporary,
			format: "A4",
			preferCSSPageSize: true,
			printBackground: true,
			tagged: true,
			outline: true,
			displayHeaderFooter: true,
			headerTemplate: "<span></span>",
			footerTemplate:
				'<div style="font-family: sans-serif; font-size: 8px; color: #685953; width: 100%; text-align: center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
		});
		await rename(temporary, pdfPath);
		console.log(`PDF: ${pdfPath}\nPrint HTML: ${htmlPath}`);
	} finally {
		await browser?.close();
		await rm(temporary, { force: true });
	}
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	try {
		if (process.argv.length > 3)
			throw new Error("사용법: npm run gen-pdf -- [출력.pdf]");
		await generatePdf(process.argv[2]);
	} catch (error) {
		console.error(error.message);
		if (error.message.includes("Executable doesn't exist")) {
			console.error(
				"최초 1회 npx playwright install chromium을 실행하세요. Linux에서는 --with-deps를 추가하세요.",
			);
		}
		process.exitCode = 1;
	}
}
