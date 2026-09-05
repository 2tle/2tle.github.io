# Scroll repair verification

## Diagnosis of the reported "CSS 전부 깨짐"
- Chromium compared `https://2tle.github.io/` and the local build at 1440px. Both served the same `styles.css` hash `913f340bcffa`, applied Noto Sans KR at 48px h1, and produced an identical 1194px document with zero failed requests (`artifacts/scroll-repair/audit.json`, `before-live.png`).
- No broken stylesheet or cache fault was reproduced in this environment. The actual problem confirmed was design direction: the previous revision had removed the Apple-style scroll presentation the user asked to keep. This repair restores it. If broken rendering is still visible on the user's device after this deploy, the new `?v=` asset hashing removes stale-CSS mixing as a cause.
- Build now rewrites local CSS/JS references with 12-char content hashes, so deployments can no longer pair old CSS with new markup. The server allowlist and build copy include `main.js` again.

## Result
- Build: passed; script syntax check, 10 local references with query strings verified, root and dist HTML identical.
- Playwright: 31/31 passed (site + isolated content-generator fixtures).
- Hero: full-viewport moon scene; desktop pins for 180svh while the moon scales to 1.72 and the copy fades, restoring at the top (verified by reading actual transforms and opacity mid-scroll). Deep links to `#work` land on the heading despite the pinned runway.
- Projects: one featured split card plus two support cards with authentic repository logos and a simple self-made API mark; visuals scale/settle into place as they enter the viewport.
- Motion rules: transforms/opacity only, native scroll never intercepted, no loops; reduced motion removes pinning and all inline transforms; JS failure leaves the full static page.
- Responsive: 320/375/640/768/1024/1440px without horizontal overflow; body text stays under 430 visible characters, preserving the earlier copy reduction.
- Accessibility: axe WCAG 2.x A/AA clean at 375/1440px; keyboard pass reaches every link with visible focus; skip link, 44px targets, `:focus-within` forces faded hero copy visible.
- Resilience: failed images and blocked storage do not break layout; 200% text reflows at 320/375/1280px; print renders dark-on-light without decoration.
- Console and HTTP: no errors; no external page-view requests; single local `main.js`.
- Visual review: `artifacts/scroll-repair/after-1440.png`, `after-375.png`, section crops, and the draft mid-scroll capture (`draft-1440-mid.png`) show the intended zoom moment. A full-page capture shows the pinned runway as a gap by nature; real scrolling keeps the hero on screen through it (confirmed by the scroll-choreography test).

## Commands
- `npm run build`: pass.
- `npm test`: 31 pass.
- `git diff --check`: pass.
- `fix-ai-slop.mjs .`: clean, 0 blockers/warnings.
- `analyze-layout.mjs .`: 0 blockers; one heuristic warning about text-size classes. This static-CSS page uses rem sizes rather than utility classes; hierarchy verified in screenshots.
- A read-only reviewer subagent was requested but failed on an external usage limit; the parent performed the same review with browser probes and screenshots instead.

## Fixes during validation
- Corrected three faulty test assumptions (background is on `:root`, viewport height must be read in-page, DOM-order focus after `main` is the first project link).
- Generator rejects non-local or unsafe `image` paths and validates HTTPS links; errors include the offending value.

## Boundaries
No commit, push or deployment. GitHub account and email unchanged. Unverified achievements and current enrollment remain omitted. NASA attribution retained in README and EVIDENCE.md.
