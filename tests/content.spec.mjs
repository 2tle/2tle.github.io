import { test, expect } from "@playwright/test";
import {
	cp,
	mkdir,
	mkdtemp,
	readFile,
	readdir,
	rm,
	writeFile,
} from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join, resolve } from "node:path";

const run = promisify(execFile);
const projectCount = (await readdir("content/projects")).filter((file) =>
	file.endsWith(".md"),
).length;
// Keep fixtures under node_modules so copied build scripts resolve the real parsers.
async function fixture(check) {
	const root = await mkdtemp(resolve("node_modules/.portfolio-test-"));
	try {
		await mkdir(join(root, "scripts"));
		for (const file of [
			"scripts/build-content.mjs",
			"scripts/validate-project-format.mjs",
			"scripts/build.mjs",
			"index.html",
			"styles.css",
			".nojekyll",
			"CNAME",
		]) {
			await cp(file, join(root, file));
		}
		for (const directory of ["content", "assets", "background/simple"]) {
			await cp(directory, join(root, directory), { recursive: true });
		}
		await check(root, () =>
			run(process.execPath, [join(root, "scripts/build-content.mjs")]),
		);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
}

const project = (extra = "", body = "## 구현\n\nMarkdown 본문입니다.") =>
	`---\nname: New project\nsummary: 새 프로젝트 소개\nlink: https://example.com/project\n${extra}\n---\n${body}\n`;

async function addProject(root, text = project()) {
	await writeFile(join(root, "content/projects/new-project.md"), text);
}

test("sync is idempotent and the build includes every discovered detail page", async () => {
	await fixture(async (root, sync) => {
		const before = await readFile(join(root, "index.html"), "utf8");
		await sync();
		expect(await readFile(join(root, "index.html"), "utf8")).toBe(before);
		const pages = await readdir(join(root, "projects"));
		expect(pages).toHaveLength(projectCount);
		const snapshots = await Promise.all(
			pages.map((file) => readFile(join(root, "projects", file), "utf8")),
		);
		await sync();
		expect(
			await Promise.all(
				pages.map((file) => readFile(join(root, "projects", file), "utf8")),
			),
		).toEqual(snapshots);
		await run(process.execPath, [join(root, "scripts/build.mjs")]);
		expect(await readFile(join(root, "dist/index.html"), "utf8")).toBe(
			await readFile(join(root, "index.html"), "utf8"),
		);
		for (const file of pages) {
			expect(await readFile(join(root, "dist/projects", file), "utf8")).toBe(
				await readFile(join(root, "projects", file), "utf8"),
			);
		}
		expect(await readFile(join(root, "dist/CNAME"), "utf8")).toBe(
			await readFile("CNAME", "utf8"),
		);
		const html = await readFile(join(root, "dist/index.html"), "utf8");
		expect(html.slice(html.indexOf("<footer"))).toContain('href="./assets/portfolio.pdf"');
		expect(html).toContain("PDF 포트폴리오 보기");
		const pdf = await readFile(join(root, "dist/assets/portfolio.pdf"));
		expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
		expect(pdf).toEqual(await readFile("assets/portfolio.pdf"));
	});
});

test("adding, editing and deleting a Markdown file updates the gallery and detail pages", async () => {
	await fixture(async (root, sync) => {
		await addProject(root, project("order: 0\ncategory: Backend\ntools: Java"));
		await sync();
		let html = await readFile(join(root, "index.html"), "utf8");
		expect(html.match(/class="project"/g) || []).toHaveLength(projectCount + 1);
		expect(html.indexOf("./projects/new-project.html")).toBeLessThan(
			html.indexOf("./projects/kubernetes.html"),
		);
		const detail = join(root, "projects/new-project.html");
		expect(await readFile(detail, "utf8")).toContain("<h2>구현</h2>");
		await addProject(root, project("", "## 변경된 기록\n\n새로운 설명"));
		await sync();
		expect(await readFile(detail, "utf8")).toContain("<h2>변경된 기록</h2>");
		await rm(join(root, "content/projects/new-project.md"));
		await sync();
		html = await readFile(join(root, "index.html"), "utf8");
		expect(html).not.toContain("new-project.html");
		await expect(readFile(detail)).rejects.toMatchObject({ code: "ENOENT" });
	});
});

test("same-order files sort by slug and an empty directory produces a useful empty state", async () => {
	await fixture(async (root, sync) => {
		await rm(join(root, "content/projects"), { recursive: true });
		await mkdir(join(root, "content/projects"));
		await writeFile(join(root, "content/projects/z-last.md"), project());
		await writeFile(join(root, "content/projects/a-first.md"), project());
		await sync();
		const html = await readFile(join(root, "index.html"), "utf8");
		expect(html.indexOf("a-first.html")).toBeLessThan(
			html.indexOf("z-last.html"),
		);
		await rm(join(root, "content/projects/a-first.md"));
		await rm(join(root, "content/projects/z-last.md"));
		await sync();
		expect(await readFile(join(root, "index.html"), "utf8")).toContain(
			"공개할 프로젝트를 준비하고 있습니다.",
		);
		expect(await readdir(join(root, "projects"))).toEqual([]);
	});
});

test("a checkout without a projects directory still builds the empty state", async () => {
	await fixture(async (root, sync) => {
		await sync();
		await rm(join(root, "content/projects"), { recursive: true });
		await run(process.execPath, [join(root, "scripts/build.mjs")]);
		expect(await readFile(join(root, "dist/index.html"), "utf8")).toContain(
			"공개할 프로젝트를 준비하고 있습니다.",
		);
		expect(await readdir(join(root, "dist/projects"))).toEqual([]);
	});
});

test("Markdown supports lists, code, tables, images and safe links without executing HTML", async () => {
	await fixture(async (root, sync) => {
		await addProject(
			root,
			project(
				"category: Backend & tools",
				`## 상세

- **강조**

\`\`\`js
const value = "<script>";
\`\`\`

| 기술 | 목적 |
| --- | --- |
| Java | API |

[기록](https://example.com/?a=1&b=2)

![표식](../assets/images/api-mark.svg)

<script>alert(1)</script><img src="x" onerror="alert(1)">

[위험](javascript:alert%281%29)

<a href="//unsafe.example">unsafe</a>`,
			),
		);
		await sync();
		const html = await readFile(
			join(root, "projects/new-project.html"),
			"utf8",
		);
		for (const expected of [
			"<h2>상세</h2>",
			"<strong>강조</strong>",
			'<code class="language-js">',
			"<table>",
			"<td>Java</td>",
			'src="../assets/images/api-mark.svg"',
			'href="https://example.com/?a=1&amp;b=2"',
		]) {
			expect(html).toContain(expected);
		}
		for (const unsafe of [
			"<script>",
			"onerror",
			'href="javascript:',
			'href="//unsafe.example"',
		]) {
			expect(html).not.toContain(unsafe);
		}
	});
});

test("metadata is escaped, special replacement strings survive and an image is optional", async () => {
	await fixture(async (root, sync) => {
		await addProject(
			root,
			project("category: Desktop <script>\ntools: Rust & Iced")
				.replace("New project", () => "A & B <tool> $&")
				.replace("새 프로젝트 소개", 'Literal <script> & "summary"'),
		);
		await sync();
		const html = await readFile(
			join(root, "projects/new-project.html"),
			"utf8",
		);
		expect(html).toContain("<h1>A &amp; B &lt;tool&gt; $&amp;</h1>");
		expect(html).toContain(
			"<title>A &amp; B &lt;tool&gt; $&amp; · stringju</title>",
		);
		expect(html).toContain("Desktop &lt;script&gt;");
		expect(html).toContain("Literal &lt;script&gt; &amp; &quot;summary&quot;");
		expect(html).not.toContain('class="detail-visual"');
		expect(html).toContain('href="../styles.css?v=');
	});
});

for (const [index, [text, error]] of [
	[project().replace("name: New project\n", ""), 'missing "name"'],
	[project().replace("summary: 새 프로젝트 소개\n", ""), 'missing "summary"'],
	[
		project().replace("link: https://example.com/project\n", ""),
		'missing "link"',
	],
	[project("", ""), "missing Markdown body"],
	[
		project().replace("https://example.com/project", "javascript:alert(1)"),
		"link must use HTTPS",
	],
	[
		project().replace("https://example.com/project", "https://"),
		"link must use HTTPS",
	],
	[
		project("image: ../secrets/logo.png"),
		"image must be a local assets/images file",
	],
	[
		project("image: https://example.com/image.png"),
		"image must be a local assets/images file",
	],
	[project("image: assets/images/missing.png"), "ENOENT"],
	[
		project("imageScale: 2"),
		"imageScale must be greater than 0 and no more than 1",
	],
	[project("order: first"), "order must be a non-negative integer"],
	["No metadata", "missing fenced metadata header"],
].entries()) {
	test(`invalid project ${index + 1} fails without rewriting the gallery: ${error}`, async () => {
		await fixture(async (root, sync) => {
			const before = await readFile(join(root, "index.html"), "utf8");
			await addProject(root, text);
			await expect(sync()).rejects.toThrow(error);
			expect(await readFile(join(root, "index.html"), "utf8")).toBe(before);
		});
	});
}

test("unsafe filenames are rejected", async () => {
	await fixture(async (root, sync) => {
		await writeFile(join(root, "content/projects/Invalid Name.md"), project());
		await expect(sync()).rejects.toThrow("filename must use lowercase letters");
	});
});

for (const marker of [
	"introducing",
	"experience",
	"projects",
	"education",
	"awards",
]) {
	test(`missing ${marker} marker fails without rewriting the page`, async () => {
		await fixture(async (root, sync) => {
			const path = join(root, "index.html");
			const html = (await readFile(path, "utf8")).replace(
				`<!-- content:${marker}:end -->`,
				"",
			);
			await writeFile(path, html);
			await expect(sync()).rejects.toThrow(`missing content:${marker} markers`);
			expect(await readFile(path, "utf8")).toBe(html);
		});
	});
}

test("resume source counts and independently linked experience details remain intact", async () => {
	await fixture(async (root, sync) => {
		const html = await readFile(join(root, "index.html"), "utf8");
		expect(html.match(/class="experience-item/g) || []).toHaveLength(4);
		expect(html.match(/class="education-item/g) || []).toHaveLength(2);
		expect(html.match(/class="award-item/g) || []).toHaveLength(3);
		await writeFile(
			join(root, "content/experience.md"),
			"---\ndate: 2025.01\norg: Test\nrole: Engineer\nlink: https://example.com/team\n---\n[Built <service>](https://example.com/work?a=1&b=2)\nUnlinked detail\n",
		);
		await sync();
		const next = await readFile(join(root, "index.html"), "utf8");
		expect(next).toContain('href="https://example.com/work?a=1&amp;b=2"');
		expect(next).toContain("Built &lt;service&gt;");
		expect(next).toContain("<li>Unlinked detail</li>");
		await writeFile(
			join(root, "content/experience.md"),
			"---\ndate: 2025.01\norg: Test\nrole: Engineer\n---\n[Bad](javascript:alert(1))\n",
		);
		await expect(sync()).rejects.toThrow(
			"detail link must be [text](https://url)",
		);
	});
});

test("custom project link labels are escaped and default labels stay intact", async () => {
 await fixture(async (root, sync) => {
 await addProject(root, project('linkLabel: 기록 <script> & 보기'));
 await sync();
 const detail = await readFile(join(root, "projects/new-project.html"), "utf8");
 expect(detail).toContain('기록 &lt;script&gt; &amp; 보기 <span');
 await addProject(root);
 await sync();
 expect(await readFile(join(root, "projects/new-project.html"), "utf8")).toContain('>저장소 보기 <span');
 });
});

test("local image figures keep captions and allow an internal-only detail header", async () => {
 await fixture(async (root, sync) => {
 await addProject(root, project("hideLink: true\nimageLayout: wide\nimage: assets/images/api-mark.svg", '<figure><img src="../assets/images/api-mark.svg" alt="구조도" width="800" height="400" loading="lazy" decoding="async"><figcaption>서비스 구조</figcaption></figure>'));
 await sync();
 const html = await readFile(join(root, "projects/new-project.html"), "utf8");
 expect(html).not.toContain('class="repository-link"');
 expect(html).toContain('project-image-wide');
 expect(html).toContain('<figcaption>서비스 구조</figcaption>');
 expect(html).toContain('loading="lazy" decoding="async"');
 });
});

test("development and operation periods render as escaped metadata outside the story", async () => {
 await fixture(async (root, sync) => {
 await addProject(root, project("developmentPeriod: 2023 ~ 2024\noperationPeriod: 2024 <script> & 이후"));
 await sync();
 const detail = await readFile(join(root, "projects/new-project.html"), "utf8");
 const home = await readFile(join(root, "index.html"), "utf8");
 for (const html of [detail, home]) {
 expect(html).toContain('<dt>개발 기간</dt><dd>2023 ~ 2024</dd>');
 expect(html).toContain('<dt>운영 기간</dt><dd>2024 &lt;script&gt; &amp; 이후</dd>');
 }
 expect(detail.indexOf('class="project-periods"')).toBeLessThan(detail.indexOf('class="markdown-body"'));
 await addProject(root);
 await sync();
 expect(await readFile(join(root, "projects/new-project.html"), "utf8")).not.toContain('class="project-periods"');
 });
});
