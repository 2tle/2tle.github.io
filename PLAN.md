# Implementation plan

## Brand & voice
2tle / Hyunjun Yang. A personal introduction for potential peers and collaborators. Calm, concrete Korean. No awards or performance statistics without evidence.

## Visual system
colors.csv row 83 (Space Tech / Aerospace), typography.csv row 23 (Korean Modern). Exact contract in DESIGN.md. Native static HTML/CSS/JS chosen over React to retain branch-based GitHub Pages deployment and avoid unnecessary runtime dependencies.

## Route and sections
`/`: lunar hero → portrait/about → Nether, Macmagotchi, SurvirunAPI → sourced education/experience → contact. Project links go to actual public repositories. No fabricated demos or résumé download.

## Animation inventory
One sticky desktop hero scene, restrained opacity reveals, 180ms hover feedback, reading-progress indicator, motion toggle. Mobile and reduced-motion use normal document flow. No wheel interception.

## Reference study / MCP research log
- Available tools inspected: no search_tool_bm25, designmd, ui-layouts, 21st-dev or chrome-devtools exposed. MCP slots unavailable; no fabricated queries/results.
- https://www.apple.com/airpods-pro/ fetched: individual product imagery paired with focused text, distinct sections for different capabilities, direct calls to action. Apply one dominant idea per section; do not reproduce product claims or trade dress.
- https://www.nasa.gov/ fetched: extraction limited. https://svs.gsfc.nasa.gov/4720/ fetched directly for factual imagery and provenance. Use real lunar surface texture, not random decorative blobs.
- Image generation attempted and failed because no default model is configured. Fallback: local NASA texture projection plus genuine GitHub portrait and project assets.

## Risks and mitigation
- Incorrect personal claims: EVIDENCE.md records public README and API sources; omit unverifiable claims.
- API failure: profile and project data are checked-in snapshots, no runtime fetch.
- Heavy space animation: pre-rendered shaded moon, static canvas stars, scroll-driven transforms only.
- Mobile pinning/overflow: no sticky scene on mobile, responsive type, one-column projects.
- JS failure/reduced motion: all source HTML visible by default; enhancement opt-in.
- GitHub Pages: static root index.html works without build, optional build produces dist with only public assets.
- Existing work: do not read/reuse .old_donotuse contents or modify pre-existing deleted sunrinlife_build file.

## Skills consulted
AI-SLOP.md; PRODUCT.md ,  Brief Capture; tasteskill: Anti-Slop Frontend Skill; DESIGN.md ,  Visual System Specification; ui-ux-pro-max (Design Intelligence Database); Reference Study ,  Learn from Real Design; Copywriting ,  Sound Human; Scroll Choreography ,  Tell a Story with Scroll; Next.js Animations; Visual Critique ,  See What You Built; Design Review; Image generation; designer-master workflow.
