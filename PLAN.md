# Subtractive redesign

## Brief and design read
Existing Korean personal portfolio for peers and collaborators. The user wants substantially less text and fewer elements, not a new marketing narrative. Display name: stringju. Introduction: 양현준. Existing dark space identity and real photo remain; the reading path becomes short and direct. Proceed without another approval round.

## Changes
1. Rename visible identity, metadata and favicon before refining layout. Keep verified GitHub and email URLs unchanged.
2. Merge hero and biography into one compact profile: username, real name, one interest line, photo.
3. Replace three oversized project cards with repository links and one factual description each. Remove numbered labels, years, taglines, tech tags, illustrations and repeated repository CTA text.
4. Keep the five verified experience entries as a compact list. Remove category labels, introductory prose and visible sourcing boilerplate. Use complete, unambiguous month ranges.
5. Reduce contact to email / GitHub / Blog. Remove invitation copy, copy control, duplicate branding and motion toggle.
6. Remove client JavaScript, scroll pinning, reveal observers and canvas stars. Keep only one static background moon. Preserve provenance in EVIDENCE.md.
7. Simplify Markdown fields and the HTML generator together so a build cannot reintroduce deleted content. Refresh the Korean font subset to cover 양현준.

## Visual and stack
DESIGN.md is the contract. Retain colors.csv row 83 (Space Tech / Aerospace) and typography.csv row 23 (Korean Modern, Noto Sans KR), both verified in installed data. Dials: 4 / 1 / 3. Static HTML/CSS, existing Node content build, no new dependencies or routes.

## Audit and research
- Control: current rendered site, captured in artifacts/redesign/before-1440.png and before-375.png.
- Before dimensions: 5820px at desktop 1440px; 5986px at mobile 375px. Visible non-whitespace text: 1175 / 1140 characters respectively.
- Existing page delays real work behind a full-screen slogan, a pinned gap, a second introduction and a project introduction. Project cards repeat titles, taglines, descriptions, tags and CTA labels.
- Existing Apple/NASA reference provenance remains in EVIDENCE.md. This revision uses the actual previous page as the pairwise control; no new reference claims.
- search_tool_bm25, designmd, ui-layouts, 21st-dev and chrome-devtools are not exposed. No queries or browser-MCP research are claimed. Local Playwright is available for rendered audit and tests.
- All installed design skills consulted: designer-master; AI-SLOP.md; PRODUCT.md (Brief Capture); tasteskill; DESIGN.md (Visual System Specification); ui-ux-pro-max; Reference Study; Copywriting; Scroll Choreography; Next.js Animations; Visual Critique; Design Review. Generic landing-page prescriptions that add imagery, copy, sections or motion are intentionally inapplicable to this reduction brief.

## Verification and risks
- Check root and dist builds match, content sync is idempotent, and missing markers/fields fail rather than silently leaving stale content.
- Test at 320/375/640/768/1024/1440px, reduced motion, no JavaScript, failed imagery, keyboard navigation, links, 200% text enlargement and axe A/AA.
- Capture desktop/mobile full pages and section crops, compare reading length and text to the control.
- Keep factual qualification on Nether's early implementation. Do not imply current enrollment or invent changed contact accounts.
- Ensure the Korean font includes the new real name; nothing is fetched at page-view time.
- No commits, pushes, deployments, edits to archived directories or unrelated cleanup.
