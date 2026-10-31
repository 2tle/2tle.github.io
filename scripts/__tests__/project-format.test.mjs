import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { marked } from "marked";
import { parseDocument } from "htmlparser2";
import { validateProjectMarkdown, validateProjectHtml } from "../validate-project-format.mjs";

const root = resolve(import.meta.dirname, "../..");
const bodyOf = (source) => source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
const children = (node) => (node.children ?? []).filter((child) => child.type === "tag");
function all(node, name) { return [...(node.name === name ? [node] : []), ...(node.children ?? []).flatMap((child) => all(child, name))]; }
const parse = (source) => {
	const structure = validateProjectMarkdown(source);
	return validateProjectHtml(marked.parse(source), structure);
};

test("contiguous numbered items and nested bullets keep one ordered list", () => {
	const result = parse("## 기록\n\n1. 첫째\n   - 하위 항목\n2. 둘째\n   - 하위 항목\n");
	assert.deepEqual(result.orderedLists, [{ start: 1, count: 2, depth: 0 }]);
});
test("repeated source numbers fail instead of silently accepting 1, 1, 1", () => {
	assert.throws(() => parse("## 기록\n\n1. 첫째\n1. 둘째\n"), /number must be 2/);
});
test("original underindented child-bullet failure is rejected", () => {
	assert.throws(() => parse("## 기록\n\n1. 첫째\n  - 하위 항목\n1. 둘째\n  - 하위 항목\n"), /escaped an ordered item/);
});
test("code outside a list cannot silently restart a numbered sequence", () => {
	assert.throws(() => parse("## 기록\n\n1. 첫째\n\n```js\nrun();\n```\n\n1. 둘째\n"), /restarts/);
});
test("code and a figure inside numbered items retain their original content", () => {
	const result = parse('## 기록\n\n1. 첫째\n\n   ```js\n   const value = "<item>";\n   ```\n\n2. 둘째\n\n   <figure><img src="../assets/images/api-mark.svg" alt="구조"><figcaption>구조</figcaption></figure>\n');
	assert.deepEqual(result.orderedLists, [{ start: 1, count: 2, depth: 0 }]);
	assert.equal(result.codeBlocks[0], 'const value = "<item>";');
	assert.equal(result.figures, 1);
});
test("a real section heading allows a new numbered list to start at one", () => {
	assert.equal(parse("## 첫 목록\n\n1. 하나\n2. 둘\n\n## 다음 목록\n\n1. 새 항목\n").orderedLists.length, 2);
});
test("nested deployment steps stay numbered from one through five", () => {
	assert.deepEqual(parse("## 배포\n\n- 배포 과정\n  1. 빌드\n  2. 이미지 생성\n  3. push\n  4. 접속\n  5. pull\n").orderedLists, [{ start: 1, count: 5, depth: 1 }]);
});
test("unclosed code fences fail", () => {
	assert.throws(() => parse("## 기록\n\n```js\nrun();"), /unclosed code fence/);
});
test("accidentally indented prose cannot become a code block", () => {
	assert.throws(() => parse("## 기록\n\n    - 잘못 들여쓴 항목\n"), /indented text became a code block/);
});
test("skipped heading levels fail", () => {
	assert.throws(() => parse("## 기록\n\n#### 건너뛴 제목\n"), /heading hierarchy/);
});
test("a figure requires a caption and alt text", () => {
	assert.throws(() => parse('<figure><img src="image.png" alt="그림"></figure>'), /caption/);
	assert.throws(() => parse('<figure><img src="image.png"><figcaption>그림</figcaption></figure>'), /alt text/);
});
test("HTML item-count and code changes are detected", () => {
	const expected = validateProjectMarkdown("## 기록\n\n1. 하나\n2. 둘\n");
	assert.throws(() => validateProjectHtml("<ol><li>하나</li></ol>", expected), /item counts/);
	const code = validateProjectMarkdown("## 기록\n\n```js\nrun();\n```\n");
	assert.throws(() => validateProjectHtml("<pre><code>changed();\n</code></pre>", code), /code content/);
});

test("every real project and its dist copy pass structural and local-asset checks", async () => {
	const files = (await readdir(resolve(root, "content/projects"))).filter((file) => file.endsWith(".md"));
	assert.equal(files.length, 5);
	let images = 0, figures = 0;
	for (const file of files) {
		const source = await readFile(resolve(root, "content/projects", file), "utf8");
		const expected = validateProjectMarkdown(bodyOf(source), file);
		const slug = file.replace(/\.md$/, "");
		const html = await readFile(resolve(root, "projects", `${slug}.html`), "utf8");
		const article = html.match(/<article class="markdown-body"[^>]*>([\s\S]*?)<\/article>/);
		assert.ok(article, `${slug}: missing story`);
		const result = validateProjectHtml(article[1], expected, file);
		assert.equal(html, await readFile(resolve(root, "dist/projects", `${slug}.html`), "utf8"));
		for (const image of all(parseDocument(html), "img")) {
			const src = image.attribs.src;
			assert.ok(src.startsWith("../assets/images/"), `${slug}: image must be local`);
			await stat(resolve(root, "projects", src));
			images++;
		}
		figures += result.figures;
	}
	assert.equal(images, 16); // Five covers, ten Notion figures and the architecture diagram.
	assert.equal(figures, 11);
});
test("S-TOP implementation choices and development steps are two intact 1–2 lists", async () => {
	const source = bodyOf(await readFile(resolve(root, "content/projects/s-top.md"), "utf8"));
	assert.deepEqual(validateProjectMarkdown(source).orderedLists, [
		{ start: 1, count: 2, depth: 0 }, { start: 1, count: 2, depth: 0 },
	]);
	const doc = parseDocument(marked.parse(source));
	const lists = all(doc, "ol");
	assert.ok(children(lists[0]).every((item) => children(item).some((node) => node.name === "ul")));
	assert.ok(children(lists[1]).every((item) => children(item).some((node) => node.name === "ul")));
});
test("dolpin keeps code in crawler step 1, the figure in step 2 and five nested deployment steps", async () => {
	const source = bodyOf(await readFile(resolve(root, "content/projects/dolpin.md"), "utf8"));
	assert.deepEqual(validateProjectMarkdown(source).orderedLists, [
		{ start: 1, count: 2, depth: 0 }, { start: 1, count: 2, depth: 0 }, { start: 1, count: 5, depth: 1 },
	]);
	const lists = all(parseDocument(marked.parse(source)), "ol");
	const steps = children(lists[1]);
	assert.equal(all(steps[0], "pre").length, 1);
	assert.equal(all(steps[1], "figure").length, 1);
	assert.equal(lists[2].parent.name, "li");
});

test("increasing markers do not hide a list split by an outside code block", () => {
	assert.throws(() => parse("## 기록\n\n1. 첫째\n\n```js\nrun();\n```\n\n2. 둘째\n"), /restarts/);
});
test("a code block moved out of its item fails even when list counts and code text match", () => {
	const expected = validateProjectMarkdown("## 기록\n\n1. 첫째\n\n   ```js\n   run();\n   ```\n\n2. 둘째\n");
	assert.throws(() => validateProjectHtml("<ol><li>첫째</li><li>둘째</li></ol><pre><code>run();\n</code></pre>", expected), /code block moved/);
});
test("a figure moved out of its item fails even when list and image counts match", () => {
	const figure = '<figure><img src="../assets/images/api-mark.svg" alt="구조"><figcaption>구조</figcaption></figure>';
	const expected = validateProjectMarkdown(`## 기록\n\n1. 첫째\n\n   ${figure}\n\n2. 둘째\n`);
	assert.throws(() => validateProjectHtml(`<ol><li>첫째</li><li>둘째</li></ol>${figure}`, expected), /figure moved/);
});

test("exhibition architecture is a local PNG with matching dimensions and a caption", async () => {
 const png = await readFile(resolve(root, "assets/images/projects/exhibition-backend/architecture.png"));
 assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
 assert.ok(png.readUInt32BE(16) > 0);
 assert.ok(png.readUInt32BE(20) > 0);
 const html = await readFile(resolve(root, "projects/exhibition-backend.html"), "utf8");
 const figures = all(parseDocument(html), "figure");
 assert.equal(figures.length, 1);
 const image = all(figures[0], "img")[0];
 assert.ok(image.attribs.src.endsWith("exhibition-backend/architecture.png"));
 assert.equal(Number(image.attribs.width), png.readUInt32BE(16));
 assert.equal(Number(image.attribs.height), png.readUInt32BE(20));
 assert.equal(all(figures[0], "figcaption").length, 1);
});
