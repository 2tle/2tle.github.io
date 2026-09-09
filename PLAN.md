# Implementation plan - grounded resume experience

## 1. Brand and voice

**Design read:** a Korean developer portfolio for recruiters and collaborators, using an Apple product-page-like cinematic language without turning a resume into a product advertisement.

- Name: stringju, 양현준
- Voice: calm, exact, curious
- Primary visitor question sequence: who is this person, what work has been done, what tools appear in that work, what projects can be inspected, how can I contact them.
- Anti-patterns: generic developer hero text, a wall of equal cards, fake metrics, progress bars, unverified awards, and decoration-only motion.

## 2. Visual system

- Palette: `colors.csv` No. 83, Space Tech / Aerospace. Exact tokens are documented in `DESIGN.md`.
- Typography: `typography.csv` No. 23, Korean Modern. Exact heading and body font: Noto Sans KR.
- Dials: `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 7`, `VISUAL_DENSITY: 4`.
- The existing moon and portrait are retained because they identify this specific site and provide a real visual foundation. Blue is a navigation and interaction cue, not a glow effect.

## 3. Stack

- GitHub Pages-compatible static HTML, CSS, and progressive JavaScript.
- No additional dependency. Existing local fonts, image assets, build script, Playwright, and axe tests remain in use.
- Native CSS and requestAnimationFrame power scroll-linked transforms. No scroll hijacking, canvas, fake UI previews, or runtime external requests.

## 4. Route

- `/` only. A single Korean portfolio page.

## 5. Sections

1. **Hero**: establishes the identity with the existing moon as a single focal object. Desktop native-scroll runway moves the view from name to record.
2. **About**: establishes working style through the Notion-source self-description. Asymmetric portrait and text, no card.
3. **Experience**: makes the timeline scannable through date rail, role, and source-supported responsibilities. Entries are offset in rhythm rather than rendered as tiles.
4. **Stack**: turns the source tech list into three discipline bands. This answers technical context without unsupported proficiency ratings.
5. **Projects**: presents the actual linked repositories as isolated showcase bands. Each visual is an existing local project identifier, not a mock screen.
6. **Education and earlier work**: closes the factual record with compact school and prior-work entries.
7. **Contact**: offers the verified direct email, GitHub, Hugging Face, and Blog destinations.

The layout family changes with every consecutive section: pinned image stage, asymmetric split, editorial timeline, typographic bands, product showcase, record split, then contact close.

## 6. Animation inventory

- Load: hero children appear once with a short, staggered opacity/transform entrance.
- Scroll story: desktop hero is the only pinned scene. Moon zoom and copy departure tell the transition from identity to record.
- Experience: entries clip and translate into place once. The line progress gives positional context.
- Stack: alternate strips translate in a small amount to distinguish disciplines.
- Projects: real project marks settle from a smaller scale as each project is reached.
- Interactive feedback: focused/hovered links underline or shift by a few pixels; press uses `scale(.98)`.
- Reduced-motion and mobile fallback: everything is visible, vertical, and unpinned.

## 7. MCP research log

- `search_tool_bm25("21st-dev ui-layouts chrome-devtools designmd")`: unavailable in this environment. No result was fabricated.
- `designmd("dark cinematic tech")`: unavailable, retry `designmd("cinematic")`: unavailable.
- `ui-layouts("horizontal scroll")`: unavailable, retry `ui-layouts("editorial timeline")`: unavailable.
- `21st-dev("particle field")`: unavailable, retry `21st-dev("scroll story")`: unavailable.
- `chrome-devtools`: unavailable. Playwright was used instead for browser screenshots and will be used for validation.
- `web_search`: Notion discovery query had no usable provider result. The user-provided public Notion page was rendered with Playwright and its page blocks were inspected directly.

## 8. Reference study

- Apple AirPods Pro 3: one large isolated object, concise copy, and a vertically recomposed mobile hero. Screenshot evidence in `artifacts/reference-study/`.
- Apple MacBook Pro: dark visual field, image-led hero, and section pacing through scale and whitespace. Screenshot evidence in `artifacts/reference-study/`.
- Applied principle: use the real moon, portrait, and project identifiers as isolated visual subjects. Avoid Apple content, commerce UI, copied artwork, and copied language.

## 9. Risks and mitigations

- **Source uncertainty**: database row queries on the Notion page were rate-limited. Award rows and uncaptured database projects are omitted.
- **Fact drift**: every visible external claim must appear in `EVIDENCE.md`; dates and responsibilities are copied or safely condensed.
- **Too much motion**: one dramatic pinned scene only. All other movement is small, one-time, transform/opacity based, and reduced-motion safe.
- **Mobile readability**: all split layouts stack under 768px; desktop pinning is disabled under 900px or short heights.
- **Performance**: local assets only, passive scroll listener, one animation frame per browser frame, geometry read before style writes.
- **AI-slop risk**: no ungrounded slogans or metrics, no repeated cards, no template section order, and each section has a factual reading purpose.

