# stringju visual system

## Direction

A Korean portfolio with the pacing and visual depth of a product introduction. The moon, real portrait, and repository identifiers carry the imagery. Titles stay compact, and there is no top navigation bar.

The factual record remains the priority: no invented outcomes, skill ratings, testimonials, or application screenshots. Visual richness comes from light, depth, spacing, and small interactions.

## Typography and layout

- Self-hosted Noto Sans KR for headings and body; system sans fallbacks cover other glyphs.
- Desktop identity: `clamp(3rem, 5.6vw, 5rem)`, maximum 80px.
- Desktop section headings: `clamp(1.9rem, 3.2vw, 2.75rem)`, maximum 44px.
- Project names: maximum 44px, with a smaller mobile scale.
- Body and descriptions: 15–17px; dates 13px; short English category labels 11–12px.
- Desktop content width: 1120px. Project showcases can extend to 1360px.
- Side insets: 40px desktop, 28px tablet, 20px mobile.
- Section spacing: `clamp(88px, 10vw, 144px)`.
- Split sections and the three technology cards become a single column below 768px.
- The experience introduction moves above its timeline below 1024px so tablet descriptions retain a comfortable line length.

## Color and surfaces

- Page canvas: `#0B0B10`.
- Main text: `#F8FAFC`; secondary text: `#94A3B8`.
- Link and interaction accent: `#82B5FF`, with a dark foreground for selected text.
- Fine dividers: `#1E293B`; surface edges: white at 10% opacity.
- The experience rail sits on a softly lit charcoal panel.
- Technology groups use blue, lavender, and teal highlights.
- Project lighting follows each identifier: indigo for Nether, warm amber for Macmagotchi, teal for SurvirunAPI.
- Surface radii: 24–32px. Contact and hero links use pill shapes; small directional controls are circular.
- Repository logo artwork remains unchanged. The first two image frames have rounded corners.

## Sections

1. **Opening:** a large local moon, thin orbit, sparse stars, short identity text, and one action into the record. The lower caption contains a small scroll progress line.
2. **About:** real portrait beside three short statements. A restrained gradient accents the second heading line.
3. **Experience:** chronological date rail with source-supported roles and responsibilities. All dots align with the rail after entry.
4. **Tools:** three discipline cards, each with a CSS illustration made from translucent layers. No proficiency scores.
5. **Projects:** separate lit showcases with the real project mark, category, description, tools, and repository link. Category and tools are optional fields in `content/projects.md`.
6. **Records:** compact education and earlier-work lists.
7. **Contact:** centered email, secondary destination pills, a quiet orbital background, and a keyboard-accessible return-to-top link.

## Motion and interaction

- The desktop hero is the only pinned scene. Its native-scroll runway is 164svh on screens at least 900px wide and 650px high, provided its text fits.
- Moon scale, orbit rotation, star displacement, and the caption line follow native scroll. No scroll interception.
- Text entry transforms run once and resolve fully to the original layout. Initial offsets apply only to elements without `.is-visible`.
- Technology cards enter vertically with a 60ms stagger. They never slide horizontally into adjacent cards.
- Project icons settle from 86% to 100% scale. Progress is measured from the untransformed card to avoid feedback and drift.
- On a fine hover-capable pointer, highlights follow the cursor and the project visual tilts by at most a few degrees. Technology layers separate slightly.
- Pointer effects reset on leave, cancellation, window blur, a hidden document, or a change in motion/pointer preferences.
- One requestAnimationFrame is scheduled in response to input; there is no continuous idle loop. Geometry is read before styles are written.
- Touch input does not activate hover effects. Mobile uses normal vertical document flow.

## Accessibility and fallbacks

- All factual content and destinations work without JavaScript.
- One H1, labelled sections, a skip link, and logical heading order.
- Controls have at least a 44px target and a visible keyboard focus outline.
- Return-to-top focuses the opening so the next Tab reaches its primary action.
- Reduced motion removes pinning, transforms, and pointer light.
- Forced-colors mode restores solid heading text and hides optional lighting layers.
- Print removes decorative layers and uses white technology panels with dark text.
- Existing photographs keep meaningful alt text; scene decoration is hidden from assistive technology.

## Verification

`npm test` covers source escaping, content generation, responsive layouts, motion stability, hover cleanup, touch and keyboard interaction, short landscape screens, 200% text, deep links, missing images, JavaScript-disabled browsing, reduced motion, high contrast, print, and axe WCAG A/AA checks.

Screenshots for mobile, tablet, desktop, and landscape are written to the ignored `artifacts/final/` directory for visual review.
