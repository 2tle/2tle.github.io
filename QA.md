# Scroll repair verification

## Diagnosis of the reported "CSS 전부 깨짐"
- Chromium compared `https://2tle.github.io/` and the local build at 1440px. Both served the same `styles.css` hash `913f340bcffa`, applied Noto Sans KR at 48px h1, and produced an identical 1194px document with zero failed requests (`artifacts/scroll-repair/audit.json`).
- No broken stylesheet or cache fault was reproduced. The real issue was design direction: the previous revision had removed the presentation the user asked to keep. `?v=` asset hashing now removes stale-CSS mixing as a cause for future deploys, and `main.js` is back in the build and server allowlist.

## Apple product-page grammar (latest revision)
- Fixed frosted navigation (52px, blur, three anchors) with 44px-wide link targets.
- Hero: the moon is the product. Centered oversized wordmark over a giant crescent, centered real portrait, 양현준, interests, one accent anchor. Verified live at 1440/375px that the copy stays visible (`hero-live-*.png`); full-page captures can hide it through sticky stitching, which is an artifact.
- Desktop: hero pins for 180svh; the moon scales to 1.65 and rotates while the copy fades, restoring at the top (verified by reading actual transforms). Deep links and nav anchors land correctly.
- Projects: three full-bleed Apple-style showcase bands with alternating tinted backgrounds, authentic logos at up to 420px, names up to 72px, one factual line each, accent CTAs (저장소 보기 ›).
- Motion: 800ms staggered load entrance; scroll-linked project visual scale/settle; transform-only text reveals (28px rise) so contrast never drops mid-transition; reduced motion removes pinning, reveals and inline transforms; JS failure leaves the full static page.
- Print renders dark-on-light without decoration, using only palette colors.

## Result
- Build: passed; script syntax check, 10 versioned references verified, root/dist HTML identical.
- Playwright: 32/32 passed twice consecutively (site + isolated content-generator fixtures).
- Accessibility: axe WCAG 2.x A/AA clean at 375/1440px after entrances settle; keyboard pass reaches every link with visible focus; skip link, 44px targets, `:focus-within` forces faded hero copy visible.
- Copy guard: visible non-whitespace text remains ~307 characters, preserving the earlier reduction.
- Viewports: 320/375/640/768/1024/1440px without horizontal overflow; 200% text reflows at 320/375/1280px.
- Console and HTTP: no errors; no external page-view requests; single local `main.js`.
- Substitution/rationale: profile, real repositories, dated experience and contact each answer a visitor question; no slogans were reintroduced.

## Commands
- `npm run build`: pass. `npm test`: 32 pass (twice). `git diff --check`: pass.
- `fix-ai-slop.mjs .`: clean, 0 blockers/warnings.
- `analyze-layout.mjs .`: 0 blockers, 5 warnings, all heuristic misreads: 800ms is the documented load-entrance stagger (animate skill allows custom timing for cinematic entrances); 100ms is the canonical active-press scale; "counters" do not exist on the page; text-size classes are rem-based CSS rather than utility classes, with hierarchy verified in screenshots.
- A read-only reviewer subagent failed earlier on an external usage limit; the parent performed the review with browser probes and screenshots.

## Fixes during validation
- Nav links initially narrower than 44px (padding fix); sub-pixel 43.9997px social-link heights handled with a 43.5px measurement threshold.
- Mid-transition opacity reveals failed axe contrast → switched text reveals to transform-only; axe now runs after entrances settle.
- 200% text zoom at 320px overflowed the email link → viewport-scaled email size plus `overflow-wrap: anywhere`.
- Removed an off-palette print accent color flagged by the palette scanner.
- Test corrections: background is on `:root`, viewport height must be read in-page, DOM-order focus after `main`, and reveal checks must scroll with real rendered frames.

## Boundaries
No commit, push or deployment. GitHub account and email unchanged. Unverified achievements and current enrollment remain omitted. NASA attribution retained in README and EVIDENCE.md.
