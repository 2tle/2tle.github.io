# stringju visual system

## Direction
Apple-inspired scroll presentation with concise Korean copy. Large imagery, large type, one deliberate pinned camera move, then quietly animated project visuals. Not a compact directory and not a copy-heavy landing page.

DESIGN_VARIANCE: 6 / MOTION_INTENSITY: 6 / VISUAL_DENSITY: 2.

## Source palette and type
Retain colors.csv row 83 (Space Tech / Aerospace) and typography.csv row 23 (Korean Modern).
- Background: #0B0B10; foreground / primary / ring: #F8FAFC.
- Secondary / muted foreground: #94A3B8; on primary / secondary: #0F172A.
- Accent: #3B82F6; on accent: #FFFFFF.
- Card / card foreground: #1E1E23 / #F8FAFC; muted: #232328.
- Border: #1E293B; destructive / on destructive: #EF4444 / #FFFFFF.
- Hairlines: foreground at 12% opacity. Scrims are alpha variants of background. Authentic photos and upstream logos retain their own asset colors.
- Noto Sans KR, self-hosted variable WOFF2 with font-display swap. No remote font requests.

## Typography
- Hero: clamp(80px, 12vw, 176px), 650, line-height 1.08, tracking -.06em. Mobile clamp(60px, 15vw, 88px).
- Real name: 20px, 500, line-height 1.5; interests 16px, 400, line-height 1.7.
- Section headings: clamp(40px, 5vw, 64px), 600, line-height 1.2, tracking -.05em.
- Project names: 40px, featured 64px; mobile 32px. Weight 550, line-height 1.2.
- Project descriptions: 18px desktop / 16px mobile, line-height 1.7. One factual sentence fragment each.
- Timeline organization: 18px, 500; detail 16px; dates 14px tabular numerals, line-height 1.6.
- Contact email: clamp(28px, 4vw, 48px); social links 14px.
- Do not add eyebrows, slogans, feature tags, numbered project labels, invitation text or repeated repository-button labels.

## Layout
- Content width 1200px, side inset 64px desktop / 32px tablet / 24px mobile / 20px under 360px.
- Hero: full initial viewport, moon large on the right and identity on the left. Name, small real portrait, real name, interests, one direct project anchor. No extra nav bar.
- Desktop hero with motion: 180svh scroll runway, 100svh sticky stage. Stage overflow is clipped internally, never on the sticky ancestor. No empty spacer outside this scene.
- Hero fallback: regular flow with min-height max(700px, 100svh); no fixed text-height constraint. Mobile identity at the top, moon lower-right.
- Work: 96px vertical spacing; one full-width featured project followed by two equal support projects, gap 24px. Large authentic project logos, no fabricated screenshots. Featured link is a split composition; support links put the visual above copy. Mobile is one column.
- Cards: 24px radius, flat surface, no shadows. Portrait 16px radius; project logos 24px radius; the arrow target is circular. These are documented roles, not random radii.
- Experience: heading left and compact dated list right. 32px between rows, no per-row card boxes. Mobile heading and dates stack.
- Contact: one hairline, email and social links. No repeated brand or invitation paragraph.

## Motion contract
All animations are transforms and opacity. Never intercept wheel/touch, change scroll speed, or auto-scroll through scenes.
- Hero desktop: normalized native scroll progress 0→1 over the sticky runway. Moon scales 1→1.72, travels left 14% and up 4%, rotates up to -6deg. Identity moves up 72px and fades as the moon takes focus. A focused hero link forces its copy visible.
- Hero mobile: no pin. Moon scales only 1→1.12 with at most 24px translation; identity never fades. Large visual motion stays on desktop.
- Project visual: scroll-linked scale .84→1 and translateY 48→0px as it enters. Mobile .94→1 and 20→0px. Copy and link targets always stay visible and static.
- Hover: arrow translate(2px,-2px), 180ms ease-out; press 100ms scale(.98).
- No entrance delay, reveal-observer hidden content, perpetual loop, blur animation, motion toggle or decorative counters.
- requestAnimationFrame is scheduled only for scroll/resize/font/layout changes. Read geometry before writing styles; keep distant scenes at stable final states.
- Reduced motion: remove pin and runway, clear inline transforms/opacity, disable hover movement. Same fallback for missing JS. Print removes decorative visuals and animation.
- Disable pin when the viewport is short or enlarged text cannot fit. Re-evaluate after fonts, resize and content-size changes. Pause frame work when the document is hidden.

## Accessibility and asset delivery
Static semantic content, single h1, visible focus, 44px targets, real image alt text and empty alt on decoration. Main skip link and direct project navigation. Retain verified account/mail URLs. No runtime external API or CDN. Build verifies referenced paths including query strings, versions CSS/JS with content hashes to avoid stale cross-release assets, and emits matching root/dist HTML. Test CSS MIME and computed styles, not just screenshot dimensions.
