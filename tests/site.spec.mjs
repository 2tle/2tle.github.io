import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readdir } from "node:fs/promises";

const screenshotDirectory =
	process.env.PORTFOLIO_SCREENSHOT_DIR || "artifacts/final";

const projectCount = (await readdir("content/projects")).filter((file) =>
	file.endsWith(".md"),
).length;

async function scrollThrough(page) {
	await page.evaluate(async () => {
		for (
			let y = 0;
			y < document.documentElement.scrollHeight;
			y += innerHeight * 0.8
		) {
			scrollTo({ top: y, behavior: "instant" });
			await new Promise((resolve) => setTimeout(resolve, 40));
		}
		scrollTo({ top: 0, behavior: "instant" });
	});
}

for (const width of [320, 375, 640, 768, 1024, 1440]) {
	test(`${width}px: complete portfolio, local assets, readable controls and no overflow`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
		const errors = [];
		const external = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") errors.push(message.text());
		});
		page.on("response", (response) => {
			if (response.status() >= 400)
				errors.push(`${response.status()} ${response.url()}`);
		});
		page.on("request", (request) => {
			if (!request.url().startsWith("http://127.0.0.1:4173"))
				external.push(request.url());
		});
		await page.goto("/");
		await page.evaluate(() => document.fonts.ready);
		await expect(page.locator("h1")).toHaveText("stringju.");
		await expect(page.locator("h1")).toHaveCount(1);
		await expect(page.locator(".project")).toHaveCount(projectCount);
		await expect(page.locator(".experience-item")).toHaveCount(4);
		await expect(page.locator(".education-item")).toHaveCount(2);
		await expect(page.locator(".award-item")).toHaveCount(3);
		await expect(page.locator(".hero .button")).toBeInViewport();
		expect(
			await page.locator("#work").evaluate((work) => work.offsetTop),
		).toBeLessThan(1000);
		for (const [slug, period] of [
			["exhibition-backend", "2026.01 ~"],
			["kubernetes", "2026.06 ~"],
			["pi-provider", "2026.08"],
			["s-top", "2024"],
			["dolpin", "2023 ~ 2024"],
		]) {
			const dates = page.locator(
				`.project-card[href="./projects/${slug}.html"] .project-periods`,
			);
			await expect(dates).toBeVisible();
			await expect(dates).toContainText(`개발 기간${period}`);
		}
		await scrollThrough(page);
		await expect
			.poll(() =>
				page
					.locator("img")
					.evaluateAll((images) =>
						images.every(
							(image) =>
								getComputedStyle(image).display === "none" ||
								(image.complete && image.naturalWidth > 0),
						),
					),
			)
			.toBe(true);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= innerWidth,
			),
		).toBe(true);
		const undersized = await page.locator("a, button").evaluateAll((controls) =>
			controls
				.filter((control) => {
					const style = getComputedStyle(control);
					const rect = control.getBoundingClientRect();
					return (
						style.display !== "none" &&
						style.visibility !== "hidden" &&
						(rect.width < 43.5 || rect.height < 43.5)
					);
				})
				.map((control) => control.textContent.trim()),
		);
		expect(undersized).toEqual([]);
		expect(errors).toEqual([]);
		expect(external).toEqual([]);
		if ([375, 768, 1440].includes(width)) {
			await mkdir(screenshotDirectory, { recursive: true });
			await page.screenshot({
				path: `${screenshotDirectory}/${width}-full.png`,
				fullPage: true,
			});
			for (const id of [
				"home",
				"work",
				"introducing",
				"experience",
				"contact",
			]) {
				await page.locator(`#${id}`).scrollIntoViewIfNeeded();
				await page.screenshot({
					path: `${screenshotDirectory}/${width}-${id}.png`,
				});
			}
		}
	});
}

test("gallery links lead to generated Markdown details and back to the project list", async ({
	page,
}) => {
	await page.goto("/");
	const destinations = await page
		.locator(".project-card")
		.evaluateAll((links) =>
			links.map((link) => ({
				href: link.getAttribute("href"),
				title: link.querySelector("h3").childNodes[0].textContent,
				periods: [...link.querySelectorAll(".project-periods > div")].map(
					(entry) => entry.textContent,
				),
			})),
		);
	for (const { href, title, periods } of destinations) {
		await page.locator(`.project-card[href="${href}"]`).click();
		await expect(page.locator("h1")).toHaveText(title);
		await expect(page).toHaveTitle(`${title} · stringju`);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
			"content",
			`${title} · stringju`,
		);
		await expect(
			page.locator(".detail-intro .project-periods > div"),
		).toHaveText(periods);
		await expect(page.locator(".markdown-body h2").first()).toBeVisible();
		await expect(page.locator(".markdown-body")).toContainText("프로젝트 소개");
		await expect(page.locator(".markdown-body")).not.toContainText(
			/공개 저장소에서 확인|사용 기술/,
		);
		if (/\/(s-top|dolpin)\.html$/.test(href)) {
			await expect(page.locator(".repository-link")).toHaveCount(0);
		} else {
			await expect(page.locator(".repository-link")).toHaveAttribute(
				"href",
				/^https:\/\/github.com\//,
			);
			await expect(page.locator(".repository-link")).toHaveAttribute(
				"rel",
				"noopener noreferrer",
			);
		}
		await page.locator(".detail-header .back-link").click();
		await expect(page).toHaveURL(/index\.html#work$/);
		await expect(page.locator("#work-title")).toBeInViewport();
	}
});

for (const width of [375, 1440]) {
	test(`${width}px: direct detail URL loads local assets without overflow and passes axe`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 });
		const failures = [];
		page.on("response", (response) => {
			if (response.status() >= 400) failures.push(response.url());
		});
		await page.goto("/projects/kubernetes.html");
		await page.evaluate(() => document.fonts.ready);
		await scrollThrough(page);
		await expect
			.poll(() =>
				page
					.locator("img")
					.evaluateAll((images) =>
						images.every((image) => image.complete && image.naturalWidth > 0),
					),
			)
			.toBe(true);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= innerWidth,
			),
		).toBe(true);
		expect(failures).toEqual([]);
		const audit = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
			.analyze();
		expect(audit.violations).toEqual([]);
		await mkdir(screenshotDirectory, { recursive: true });
		await page.screenshot({
			path: `${screenshotDirectory}/${width}-detail.png`,
			fullPage: true,
		});
	});
}

test("project button and initial deep links reach the requested section", async ({
	page,
}) => {
	await page.goto("/");
	await page.locator(".hero .button").click();
	await expect(page).toHaveURL(/#work$/);
	await expect(page.locator("#work-title")).toBeInViewport();
	for (const id of ["work", "introducing", "experience", "contact"]) {
		await page.goto(`/#${id}`);
		await expect(page.locator(`#${id} h2`).first()).toBeInViewport();
	}
});

test("JavaScript-disabled and reduced-motion contexts retain the entire portfolio", async ({
	browser,
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/#experience");
	await expect(page.locator("#experience-title")).toBeInViewport();
	await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 375, height: 812 },
	});
	try {
		const staticPage = await context.newPage();
		await staticPage.goto("http://127.0.0.1:4173");
		await expect(staticPage.locator("script")).toHaveCount(0);
		await expect(staticPage.locator(".project-card")).toHaveCount(projectCount);
		await staticPage.keyboard.press("Tab");
		await expect(staticPage.locator(".skip-link")).toBeFocused();
		await staticPage.keyboard.press("Enter");
		await expect(staticPage.locator("main")).toBeFocused();
		await staticPage.locator(".project-card").first().click();
		await expect(staticPage.locator("h1")).toHaveText("전시회 백엔드");
		await expect(staticPage.locator(".markdown-body")).toContainText(
			"멀티테넌시",
		);
	} finally {
		await context.close();
	}
});

test("home keeps essential headings without promotional filler", async ({
	page,
}) => {
	await page.goto("/");
	await expect(
		page.locator(
			".site-header, .site-nav, .hero-label, .footer-bottom, .back-to-top",
		),
	).toHaveCount(0);
	await expect(page.locator(".hero")).not.toContainText("양현준");
	await expect(page.locator("#work-title")).toHaveText("프로젝트.");
	await expect(page.locator("#contact-title")).toHaveText("연락처");
	await expect(
		page.locator(".work .section-heading > p, .contact-copy > p"),
	).toHaveCount(0);
	await expect(page.locator("#education-title")).toHaveText("학력");
	await expect(page.locator("main > section").nth(2)).toHaveAttribute(
		"id",
		"introducing",
	);
	await expect(page.locator(".introduction")).toContainText(
		"AI와 함께 새로운 기술을 직접 적용해보며 문제를 해결하는 것을 좋아합니다.",
	);
});

test("identity, resume sources and contact destinations remain correct", async ({
	page,
}) => {
	await page.goto("/");
	await expect(page).toHaveTitle("stringju · 양현준");
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		"content",
		/양현준, stringju/,
	);
	for (const text of [
		"주식회사 커리어노트",
		"한봄고등학교",
		"시스템컨설턴트그룹",
		"마이다스아이티",
		"ICT AWARD KOREA",
		"KOSA-MIDAS Young Talent Challenge",
	]) {
		await expect(page.locator("body")).toContainText(text);
	}
	for (const [name, href] of [
		["iam@2tle.io", "mailto:iam@2tle.io"],
		["GitHub", "https://github.com/2tle"],
		["Hugging Face", "https://huggingface.co/2tle"],
		["Blog", "https://stringju.tistory.com"],
	]) {
		await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute(
			"href",
			href,
		);
	}
});

for (const width of [375, 1440]) {
	test(`${width}px: WCAG A/AA audit and keyboard focus`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto("/");
		await scrollThrough(page);
		const audit = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
			.analyze();
		expect(audit.violations).toEqual([]);
		for (const target of [
			page.locator(".project-card").first(),
			page.locator(".email-link"),
		]) {
			await target.focus();
			await expect(target).toBeFocused();
			await expect(target).toHaveCSS("outline-style", "solid");
		}
	});
}

for (const width of [320, 375, 1280]) {
	test(`${width}px: 200% text reflows on home and detail`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		for (const path of ["/", "/projects/pi-provider.html"]) {
			await page.goto(path);
			await page.evaluate(() => {
				document.documentElement.style.fontSize = "200%";
			});
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= innerWidth,
				),
			).toBe(true);
			const clipped = await page
				.locator("h1, h2, h3, p")
				.evaluateAll((elements) =>
					elements
						.filter((el) => el.scrollWidth > el.clientWidth + 1)
						.map((el) => el.textContent),
				);
			expect(clipped).toEqual([]);
		}
	});
}

test("missing images do not remove project content or links", async ({
	page,
}) => {
	await page.route("**/assets/images/**", (route) => route.abort());
	await page.route("**/background/**", (route) => route.abort());
	await page.goto("/");
	await expect(page.locator(".project-card")).toHaveCount(projectCount);
	await page.locator(".project-card").first().click();
	await expect(page.locator("h1")).toHaveText("전시회 백엔드");
	await expect(page.locator(".repository-link")).toBeVisible();
});

test("unknown project URLs and private source paths return 404", async ({
	request,
}) => {
	for (const path of [
		"/projects/not-found.html",
		"/content/projects/kubernetes.md",
		"/package.json",
	]) {
		expect((await request.get(path)).status()).toBe(404);
	}
});

test("short landscape, print and system high contrast remain usable", async ({
	page,
}) => {
	await page.setViewportSize({ width: 844, height: 390 });
	await page.goto("/");
	await expect(page.locator("h1")).toBeInViewport();
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true);
	await page.emulateMedia({ media: "print" });
	await expect(page.locator(".hero-art")).toBeHidden();
	await expect(page.locator(".project-card").first()).toBeVisible();
	await expect(page.locator("html")).toHaveCSS(
		"background-color",
		"rgb(255, 255, 255)",
	);
	await page.emulateMedia({ media: "screen", forcedColors: "active" });
	await expect(page.locator("h1")).toBeVisible();
	await expect(page.locator(".button")).toHaveCSS("border-top-style", "solid");
});

test("only the five selected projects are shown in the requested order", async ({
	page,
	request,
}) => {
	await page.goto("/");
	await expect(page.locator(".project h3")).toHaveText([
		"전시회 백엔드↗",
		"Kubernetes One Repo↗",
		"pi-provider-manager↗",
		"S-TOP↗",
		"돌핀 (dolpin)↗",
	]);
	for (const slug of ["macmagotchi", "nether"])
		expect((await request.get(`/projects/${slug}.html`)).status()).toBe(404);
	for (const slug of ["s-top", "dolpin"]) {
		await page.goto(`/projects/${slug}.html`);
		await expect(page.locator(".repository-link")).toHaveCount(0);
		await expect(page.locator('a[href*="notion.site"]')).toHaveCount(0);
	}
});
