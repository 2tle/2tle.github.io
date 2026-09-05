# Redesign verification

## Result
- Build: passed, five local HTML asset references verified; root and dist HTML match.
- Playwright: 25/25 passed. Content tests use isolated temporary fixtures.
- Identity: stringju in h1, title, social metadata and favicon; 양현준 in the introduction and image alt. Self-hosted font covers all three Korean characters.
- Content: three projects, five experience entries. Repository, GitHub, Blog and mailto URLs retain the verified addresses. No client scripts, buttons, canvas or runtime network dependencies.
- Viewports: 320/375/640/768/1024/1440px without horizontal overflow. All three project names appear in the first viewport.
- Accessibility: axe WCAG 2.x A/AA reports no violations at 375/1440px; every link is keyboard reachable with visible focus and at least 44px dimensions. Skip link moves focus to main.
- Resilience: complete no-JavaScript page; static under normal and reduced motion; failed images and blocked storage do not break content or links. Text at 200% reflows at 320/375/1280px.
- Browser console and local HTTP: no errors. No external page-view requests.
- External navigation: click targets verified using intercepted destination responses, not live third-party uptime checks.

## Before / after
Measured by Chromium, with fonts ready, using identical viewport dimensions. Text counts exclude whitespace.

| Width | Before page height | After page height | Before text | After text |
|---|---:|---:|---:|---:|
| 1440px | 5820px | 1194px | 1175 | 269 |
| 375px | 5986px | 1289px | 1140 | 269 |

Desktop text reduced by 77.1%; page height by 79.5%. Mobile text reduced by 76.4%; page height by 78.5%.

## Visual review
- Reviewed `artifacts/redesign/after-1440.png` and `after-375.png` against the corresponding before captures.
- Profile now precedes the actual project links without a slogan, second biography or pinned blank space.
- Project names have a clear hierarchy above single-line factual descriptions. No decorative cards, repeated CTA labels or technology tags.
- Desktop uses a small heading rail; mobile stacks headings and places dates below experience details. No clipped names or crowded contact links.
- The retained moon is a quiet static background, not a full-screen scene. Photo and real name appear once.
- Section captures: `artifacts/redesign/{1440,375}-{home,work,journey,contact}.png`.
- Substitution/rationale checks: profile, sourced repository descriptions, experience and actual contact links each answer a concrete visitor question. Generic slogans and invitation copy were removed rather than replaced.

## Commands and scanner caveats
- `npm run build`: passed.
- `npm test`: 25 passed.
- `git diff --check`: passed.
- Installed `fix-ai-slop.mjs .`: zero blockers, zero warnings.
- Installed `analyze-layout.mjs .`: zero blockers, one warning about fewer than four text-size classes. This static-CSS page uses rem values rather than utility classes; rendered hierarchy is checked in the screenshots.
- `npm exec --yes -- impeccable detect .`: five static warnings, not a clean result. Four infer absent padding because they do not follow logical padding / padded link children; one resolves print foreground as a screen background. Browser tests verify section padding of at least 32px, project heading inset of at least 20px, dark screen colors and white print background. Axe contrast checks pass. No visual changes were made solely to satisfy these false positives.

## Fixes during validation
- Corrected an escaping-test expectation: a literal ampersand is correctly serialized as `&amp;` in HTML. Re-ran all tests successfully.
- Removed the old generator's ambiguous date shortening; ranges now show both complete years and months.

## Boundaries
No commit, push or deployment. GitHub account and email were not renamed. Unverified achievements and current enrollment remain omitted. Original image attribution remains in EVIDENCE.md and README.md.
