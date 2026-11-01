import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument, DomUtils as dom } from "htmlparser2";
import { renderPortfolio, generatePdf } from "../gen-pdf.mjs";
import {
	validateProjectMarkdown,
	validateProjectHtml,
} from "../validate-project-format.mjs";

const root = resolve(import.meta.dirname, "../..");
const byClass = (node, name) => dom.getElementsByClassName(name, node)[0];

test("PDF HTML preserves experience and every ordered project, story, figure and local asset", async () => {
	const homePath = resolve(root, "dist/index.html");
	const before = await readFile(homePath, "utf8");
	const home = parseDocument(before);
	const doc = parseDocument(await renderPortfolio());
	assert.equal(dom.getElementsByTagName("h1", doc).length, 1);
	assert.equal(
		dom.textContent(byClass(doc, "introduction-name")),
		dom.textContent(byClass(home, "introduction-name")),
	);
	assert.equal(
		dom.getOuterHTML(byClass(doc, "experience-list")),
		dom.getOuterHTML(byClass(home, "experience-list")),
	);
	assert.equal(
		dom.getOuterHTML(byClass(doc, "contacts")).includes("mailto:"),
		true,
	);
	for (const excluded of [
		"introduction",
		"education-list",
		"awards-list",
		"hero-art",
		"back-link",
	]) {
		assert.equal(byClass(doc, excluded), undefined, excluded);
	}
	const cards = dom.getElementsByClassName("project-card", home);
	const sections = dom.getElementsByClassName("pdf-project", doc);
	assert.equal(sections.length, cards.length);
	const toc = dom.getElementsByTagName("a", byClass(doc, "contents"));
	assert.equal(toc.length, cards.length);
	for (const [index, section] of sections.entries()) {
		assert.equal(toc[index].attribs.href, `#${section.attribs.id}`);
		const path = resolve(root, "dist", cards[index].attribs.href);
		const original = await readFile(path, "utf8");
		const detail = parseDocument(original);
		const body = byClass(section, "markdown-body");
		const originalBody = byClass(detail, "markdown-body");
		assert.equal(dom.textContent(body), dom.textContent(originalBody));
		assert.equal(
			dom.textContent(byClass(section, "detail-intro")),
			dom.textContent(byClass(detail, "detail-intro")),
		);
		const sourcePath = cards[index].attribs.href
			.replace("./projects/", "content/projects/")
			.replace(/\.html$/, ".md");
		const source = (await readFile(resolve(root, sourcePath), "utf8")).replace(
			/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,
			"",
		);
		validateProjectHtml(
			dom.getOuterHTML(body),
			validateProjectMarkdown(source),
			sourcePath,
		);
		const links = (node) =>
			dom.getElementsByTagName("a", node).map((a) => a.attribs.href);
		assert.deepEqual(links(section), [
			...links(byClass(detail, "detail-intro")),
			...links(originalBody),
		]);
		for (const image of dom.getElementsByTagName("img", section)) {
			assert.equal(image.attribs.loading, "eager");
			assert.ok(image.attribs.src.startsWith("file:"));
			await stat(fileURLToPath(image.attribs.src));
		}
		assert.equal(await readFile(path, "utf8"), original);
	}
	await stat(
		fileURLToPath(dom.getElementsByTagName("link", doc)[0].attribs.href),
	);
	assert.equal(await readFile(homePath, "utf8"), before);
});

test("invalid output paths fail before launching a browser or writing files", async () => {
	await assert.rejects(generatePdf("portfolio.html"), /\.pdf/);
});
