# DESIGN.md - stringju visual system

## Brand

- Name: stringju
- Voice: calm, precise, curious
- Art direction: a dark orbital field where the existing moon opens the portfolio, then gives way to a factual developer record. The cinematic entrance is earned by an existing personal visual, not by a generic technology glow.
- Anti-patterns: generic SaaS grids, purple gradients, fake dashboards, inflated achievements, decorative counters, multiple competing pinned scenes, and copy that could belong to any developer.
- Dials: `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 7`, `VISUAL_DENSITY: 4`.

## Color system

Source row: `colors.csv` No. 83, Space Tech / Aerospace.

- Primary: `#F8FAFC` for bright controls and high-priority text
- On Primary: `#0F172A`
- Secondary: `#94A3B8` for secondary controls
- On Secondary: `#0F172A`
- Accent: `#3B82F6` for links, active states, and the progress cue
- On Accent: `#FFFFFF`
- Background: `#0B0B10` for the page canvas
- Foreground: `#F8FAFC` for primary text
- Card: `#1E1E23` for rare elevated planes only
- Card Foreground: `#F8FAFC`
- Muted: `#232328` for section shifts and low-emphasis surfaces
- Muted Foreground: `#94A3B8`
- Border: `#1E293B` for dividers and form outlines
- Destructive: `#EF4444`
- On Destructive: `#FFFFFF`
- Ring: `#F8FAFC`

Dark mode: dark-first only. The source palette is already dark. Transparent scrims use alpha versions of `#0B0B10` or `#F8FAFC`; no additional opaque colors are introduced. Authentic local image and logo colors are exempt inside image files.

## Typography

Source row: `typography.csv` No. 23, Korean Modern.

- Heading font: Noto Sans KR
- Body font: Noto Sans KR
- Display: 650, `clamp(5rem, 14vw, 12.5rem)`, tracking `-0.075em`, leading `0.9`
- H1: display role only, one instance
- H2: 650, `clamp(2.75rem, 6vw, 5.5rem)`, tracking `-0.065em`, leading `1.02`
- H3: 620, `clamp(1.5rem, 2.2vw, 2.25rem)`, tracking `-0.04em`, leading `1.18`
- Body: 400, 16px desktop and mobile minimum, line-height `1.7`
- Small: 500, 12px minimum, line-height `1.5`
- Date/meta: 500, 13px, tabular numerals
- Mono is intentionally not used. The resume is read as a human record, not a terminal simulation.
- Self-hosted Noto Sans KR remains the only remote-free loaded font. System sans fallbacks cover unlisted glyphs.
- Type scale ratio: 1.25. Body text max line length: 36ch.

## Spacing and grid

- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160
- Content max-width: 1200px
- Desktop side inset: 40px. Tablet: 28px. Mobile: 20px.
- Sections: `padding-block: clamp(96px, 14vw, 192px)` except the hero.
- Grid: 12 columns at 1024px and up. Semantic breakpoints: 640px, 768px, 1024px, 1280px, 1536px.
- Multi-column sections stack below 768px. The work section keeps full-width visual bands at all widths.

## Shape, borders, elevation

- Radius rule: surfaces use 20px; controls use 12px; circular portrait remains circular; text links have no container.
- Level 0: no shadow, dividers or negative space separate content.
- Level 1: `0 20px 60px rgb(11 11 16 / 28%)` only for menu and portrait frame.
- No generic floating cards. Project bands and the mobile menu are the only elevated surfaces.

## Motion

- Entrance: 280ms, `cubic-bezier(.22, 1, .36, 1)`, opacity and transform only.
- Exit: 180ms, `ease-in`, opacity and transform only.
- Hover: 160ms, `cubic-bezier(.22, 1, .36, 1)`, color, underline offset, and transform only.
- Active: 100ms, `ease-out`, `scale(.98)`.
- Stagger: 70ms maximum between related entries.
- Hero narrative: desktop screens at least 900px wide and 650px high receive one 180svh native-scroll runway. The moon scales and shifts upward as the identity copy gives the next chapter space. This is the single dramatic moment.
- Career timeline: individual entries reveal via clip/translate on first entry. The vertical line fills as a reading-progress cue, not as a second pin.
- Stack: word strips slide a small distance from alternating sides when they enter view. No infinite marquee.
- Project visuals: object scale settles as each real project identifier enters view. Each motion shows that a new project chapter has been reached.
- Reduced motion: remove pinning, all JS transforms, all reveal delays, and all opacity transitions. Content begins fully visible.
- Mobile: no pinning and no large parallax. The hero is normal document flow and all content remains readable while scrolling.

## Component patterns

- Navigation: no persistent top navigation. The hero's small anchor leads naturally into the record below, preserving an uncluttered opening.
- Hero: full viewport orbit visual with a restrained heading, name, concise role line, and a small anchor to the record below.
- About: asymmetric profile photo and source-grounded statement set, divided by a fine line. No card wrapper.
- Experience: chronological editorial list. A date rail, organization, role, and at most two responsibilities per entry. No rating, metric, or decorative badge.
- Stack: three typographic bands grouped by discipline, based on the public Notion technology list. The labels state scope, never mastery.
- Projects: three full-bleed showcase bands with real local repository identifiers, a sourced one-line description, and one GitHub link each.
- Education: two side-by-side factual records that become a vertical list on mobile.
- Contact: one clear email action with GitHub, Hugging Face, and Blog destinations as secondary links.

## Image style

- Hero: existing NASA-derived moon asset at large scale, locally served.
- About: existing real profile photograph, square-cropped with an accessible alt.
- Projects: local repository identifiers on a sparse dark field. No mock application windows.
- No generated imagery is required because the page already has real, source-grounded visuals.

## Accessibility

- WCAG AA contrast minimum: 4.5:1 for body copy, 3:1 for large display type.
- Focus indicator: 2px `#F8FAFC` outline plus 4px offset on every keyboard-focusable control.
- Minimum control size: 44px by 44px.
- Semantic landmarks: skip link, header, main, labelled sections, footer.
- One H1 and logical H2/H3 hierarchy.
- Every visual either has meaningful alt text or `alt=""` when decorative.
- No user task depends on animation or JavaScript.
