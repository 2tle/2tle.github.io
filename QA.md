# QA review record

## Review 2/3 result (final)

- BUILD: pass (`npm run build`, 9 local references verified)
- TESTS: 15/15 Playwright pass
- CONSOLE: clean (no pageerror, no 4xx/5xx)
- EXTERNAL REQUESTS: none at visit time
- A11Y: axe WCAG 2.x A/AA clean at 375px and 1440px; skip link verified by keyboard
- OVERFLOW: none at 320/375/768/1024/1440px; 200% text zoom clean
- NO-JS: nav, bio, projects readable; mailto works; copy button hidden
- REDUCED MOTION: pinning disabled, reveals visible, toggle disabled and labeled 시스템 모션 감소
- DETERMINISTIC SCAN: clean after replacing date-range dashes with `~`
- SUBSTITUTION TEST: pass (GitHub portrait, real repos, personal timeline, NASA moon; not interchangeable)
- RATIONALE TEST: pass (each section serves one information job: who → interests → proof → path → contact)
- LAYOUT SCRIPT: 1 warning "less than 4 text size classes" is a heuristic miss on clamp() fluid type; sizes are documented in DESIGN.md
- ANTI-OVERCORRECTION: pass (dark space theme is user-specified, palette from CSV row 83, no cream/serif counter-cliché)

## Issues found and fixed

1. Skip link was permanently visible and obscured the wordmark (axe target-size). Fixed with focus-revealed transform.
2. Mobile moon texture reduced scroll-cue contrast. Fixed with a bottom gradient scrim inside the hero stage.
3. Em-dash/en-dash date ranges in HTML and docs. Replaced with `~`.

## Remaining

- Awards and metrics remain omitted pending user data (EVIDENCE.md confidence 0).
- Reference visual inspection via browser MCP was unavailable; Apple/NASA references studied from fetched content.
- Image generation unavailable (no default model configured); NASA CGI Moon Kit used with credit instead.
