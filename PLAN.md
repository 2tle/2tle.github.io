# Restore the scroll experience

## Diagnosis
The latest request explicitly preserves Apple-style scroll presentation. The prior revision incorrectly treated fewer words as a reason to remove the presentation itself.

Live `https://2tle.github.io/` and local source were inspected in Chromium at 1440px. Both load the same CSS hash `913f340bcffa`, use Noto Sans KR, display the h1 at 48px, and render a 1194px document. No failed stylesheet requests were observed. The user's reported broken appearance is not reproduced as a stylesheet 404 in this environment; the wrong compact layout is confirmed. Do not claim an unverified cache fault.

Evidence: `artifacts/scroll-repair/audit.json`, `before-live.png`, `before-local.png`.

## Implementation
1. Keep the approved short content and stringju / 양현준 identity.
2. Restore an immersive lunar hero: large name and image, one project link, desktop sticky zoom/fade scene driven by native scrolling. No old slogan, scroll instructions or English captions.
3. Use one featured project and two supporting visual projects. Authentic existing logos identify the repositories. A simple native API connection mark represents the backend, not a fabricated UI. Each project retains just its name, short description and link.
4. Keep a concise experience list and contact close. No extra sections.
5. Add small progressive JS for scroll animation. Normal document flow works without it; mobile keeps subtle movement without pinning; reduced motion is static.
6. Restore JS to the build and server allowlist. Version stylesheet/script URLs from their file hashes and validate URL query handling so deployments do not pair old CSS with new markup.

## Research / tools
- Existing design skills and their reduced-motion, factual-copy, screenshot-review and animation guidance were consulted.
- Apple AirPods Pro reference fetched again: large isolated product visuals and concise headings establish focus; no Apple copy, claims or assets are reused.
- Local/live screenshot comparison is the primary control for this repair.
- No designmd, ui-layouts, 21st-dev, search_tool_bm25 or chrome-devtools tools are exposed. Use installed Playwright for real browser inspection rather than claim unavailable MCP research.
- Existing NASA moon, GitHub photo and repository logos are the correct real assets. No new bitmap generation is needed.

## Verification
- Build checks script syntax, local assets and query-string versions; root/dist content remains identical and sync is idempotent.
- Browser checks CSS HTTP status/MIME, nonzero CSS rules and computed type/layout on root and dist.
- Capture hero at start/middle/end, work visual entry/settled states, full-page desktop/mobile, and compact no-JS fallback. Check actual transforms differ, not just presence of a class.
- Test scrolling back, deep links, keyboard focus, 200% text enlargement, narrow/short viewports, reduced-motion changes, missing assets and no runtime external requests.
- Keep short-copy regression coverage, but remove the incorrect test demanding all projects in the first viewport and a page shorter than 1600px.
- Request a read-only code/accessibility review after the implementation. Parent remains the only writer.
- No deployment, commit, push or archived-folder modifications.
