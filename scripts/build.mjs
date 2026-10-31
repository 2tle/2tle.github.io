import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { syncContent } from "./build-content.mjs";

const root = resolve(import.meta.dirname, "..");
const original = await readFile(resolve(root, "index.html"), "utf8");
let html = original;
for (const file of ["styles.css", "assets/fonts/fonts.css"]) {
	const bytes = await readFile(resolve(root, file));
	const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
	const escaped = file.replaceAll(".", "\\.");
	html = html.replace(
		new RegExp(`(["'])\\./${escaped}(?:\\?[^"']*)?\\1`, "g"),
		`"./${file}?v=${hash}"`,
	);
}
if (html !== original) await writeFile(resolve(root, "index.html"), html);
const synced = await syncContent();
console.log(
	`Content: ${synced.projects} project pages, ${synced.experience} experience, ${synced.education} education, ${synced.awards} awards.`,
);
html = await readFile(resolve(root, "index.html"), "utf8");
const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map(
	(match) => match[1].split("?")[0],
);
for (const asset of assets) await stat(resolve(root, asset));
await rm(resolve(root, "dist"), { recursive: true, force: true });
await mkdir(resolve(root, "dist"), { recursive: true });
for (const file of [
	"index.html",
	"styles.css",
	"projects",
	"assets",
	".nojekyll",
	"CNAME",
]) {
	await cp(resolve(root, file), resolve(root, "dist", file), {
		recursive: true,
	});
}
await mkdir(resolve(root, "dist/background/simple"), { recursive: true });
for (const file of ["spring.webp", "summer.webp", "fall.webp", "winter.webp"]) {
	await cp(
		resolve(root, "background/simple", file),
		resolve(root, "dist/background/simple", file),
	);
}
console.log(
	`Build passed: ${assets.length} local references checked. Static site written to dist/.`,
);
