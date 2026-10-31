// Source and HTML checks only. This module never launches a browser.
import { marked } from "marked";
import { parseDocument } from "htmlparser2";

const elements = (node) => (node.children ?? []).filter((child) => child.type === "tag");
const text = (node) => node.type === "text" ? node.data : (node.children ?? []).map(text).join("");
const fail = (file, message) => { throw new Error(`${file}: ${message}`); };

export function validateProjectMarkdown(markdown, file = "project") {
	let fence;
	for (const [index, line] of markdown.split(/\r?\n/).entries()) {
		const match = line.match(/^[ \t]*(`{3,}|~{3,})(.*)$/);
		if (!match) continue;
		if (!fence) fence = { char: match[1][0], size: match[1].length, line: index + 1 };
		else if (match[1][0] === fence.char && match[1].length >= fence.size && !match[2].trim()) fence = undefined;
	}
	if (fence) fail(file, `unclosed code fence at line ${fence.line}`);

	const structure = { orderedLists: [], unorderedLists: 0, codeBlocks: [], figurePaths: [] };
	let nextListId = 0;
	let lastHeading = 1;
	function walk(tokens, depth = 0, listPath = []) {
		let previousOrdered;
		for (const token of tokens) {
			if (token.type === "space") continue;
			if (token.type === "heading") {
				if (!token.text.trim() || token.depth < 2 || token.depth > lastHeading + 1)
					fail(file, `invalid heading hierarchy: ${token.raw.trim()}`);
				lastHeading = token.depth;
			}
			if (token.type === "list") {
				const listId = nextListId++;
				if (token.ordered) {
					if (previousOrdered !== undefined)
						fail(file, "ordered list restarts in the same section; nest its code, images and child lists inside the item");
					for (const [index, item] of token.items.entries()) {
						const marker = item.raw.match(/^\s*(\d+)[.)]\s/);
						const expected = token.start + index;
						if (!marker || Number(marker[1]) !== expected)
							fail(file, `ordered list number must be ${expected}, not ${marker?.[1] ?? "missing"}`);
					}
					structure.orderedLists.push({ start: token.start, count: token.items.length, depth });
					previousOrdered = token.start + token.items.length - 1;
				} else {
					if (previousOrdered !== undefined)
						fail(file, "unordered list escaped an ordered item; indent child bullets to the item's content column");
					structure.unorderedLists++;
				}
				for (const [index, item] of token.items.entries()) walk(item.tokens, depth + 1, [...listPath, [listId, index]]);
			} else if (token.type === "code") {
				if (token.codeBlockStyle === "indented")
					fail(file, "indented text became a code block; use fenced code and check list indentation");
				structure.codeBlocks.push({ language: token.lang ?? "", text: token.text, listPath });
			} else {
				if (["heading", "paragraph", "text", "hr", "table"].includes(token.type)) previousOrdered = undefined;
				if (token.type === "blockquote") walk(token.tokens, depth, listPath);
				if (token.type === "html") {
					const findFigures = (node) => {
						if (node.name === "figure") structure.figurePaths.push(listPath);
						for (const child of node.children ?? []) findFigures(child);
					};
					findFigures(parseDocument(token.raw));
				}
			}
		}
	}
	walk(marked.lexer(markdown));
	return structure;
}

export function validateProjectHtml(html, expected, file = "project") {
	const structure = { orderedLists: [], unorderedLists: 0, codeBlocks: [], codePaths: [], figurePaths: [], figures: 0, images: [] };
	let nextListId = 0;
	const listIds = new WeakMap();
	function walk(node, listDepth = 0, listPath = []) {
		if (node.name === "li" && ["ol", "ul"].includes(node.parent?.name)) {
			listPath = [...listPath, [listIds.get(node.parent), elements(node.parent).indexOf(node)]];
		}
		if (node.type === "tag") {
			if (node.name === "ol" || node.name === "ul") {
				listIds.set(node, nextListId++);
				if (elements(node).some((child) => child.name !== "li") ||
					(node.children ?? []).some((child) => child.type === "text" && child.data.trim()))
					fail(file, "list has content outside li elements");
				if (node.name === "ol") {
					if (elements(node).some((child) => child.attribs.value !== undefined)) fail(file, "li value overrides ordered numbering");
					const start = Number(node.attribs.start ?? 1);
					if (!Number.isInteger(start) || start < 1) fail(file, "invalid ordered-list start");
					structure.orderedLists.push({ start, count: elements(node).length, depth: listDepth });
				} else structure.unorderedLists++;
			}
			if (node.name === "li" && !["ol", "ul"].includes(node.parent?.name)) fail(file, "orphan li element");
			if (node.name === "pre") {
				const child = elements(node);
				if (child.length !== 1 || child[0].name !== "code") fail(file, "code block is not pre > code");
				structure.codeBlocks.push(text(child[0]).replace(/\n$/, ""));
				structure.codePaths.push(listPath);
			}
			if (node.name === "figure") {
				const children = elements(node);
				if (children.filter((child) => child.name === "img").length !== 1 ||
					children.filter((child) => child.name === "figcaption" && text(child).trim()).length !== 1)
					fail(file, "figure needs exactly one image and one non-empty caption");
				structure.figures++;
				structure.figurePaths.push(listPath);
			}
			if (node.name === "figcaption" && node.parent?.name !== "figure") fail(file, "orphan image caption");
			if (node.name === "img") {
				if (!node.attribs.src) fail(file, "image is missing src");
				if (node.parent?.name === "figure" && !node.attribs.alt?.trim()) fail(file, "figure image is missing alt text");
				structure.images.push(node.attribs.src);
			}
		}
		const nextDepth = listDepth + (node.name === "ol" || node.name === "ul" ? 1 : 0);
		for (const child of node.children ?? []) walk(child, nextDepth, listPath);
	}
	walk(parseDocument(html));
	if (JSON.stringify(structure.orderedLists) !== JSON.stringify(expected.orderedLists) || structure.unorderedLists !== expected.unorderedLists)
		fail(file, "rendered list nesting or item counts differ from Markdown");
	if (structure.codeBlocks.length !== expected.codeBlocks.length ||
		structure.codeBlocks.some((code, index) => code !== expected.codeBlocks[index].text.replace(/\n$/, "")))
		fail(file, "rendered code content differs from Markdown");
	if (JSON.stringify(structure.codePaths) !== JSON.stringify(expected.codeBlocks.map((code) => code.listPath)))
		fail(file, "code block moved outside its original list item");
	if (JSON.stringify(structure.figurePaths) !== JSON.stringify(expected.figurePaths))
		fail(file, "figure moved outside its original list item");
	return structure;
}
