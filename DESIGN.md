# 2tle visual system

## Direction
A quiet personal observatory. A large lunar crescent beside Korean display typography introduces 2tle; scroll moves closer to the person and then their actual work. Apple-inspired focus and pacing, not Apple branding or a copy of its components.

DESIGN_VARIANCE: 7 / MOTION_INTENSITY: 6 / VISUAL_DENSITY: 3.

## Palette
Source: omp-designer/data/ui-ux-pro-max/colors.csv, row 83, Space Tech / Aerospace.
- Primary/foreground/ring: #F8FAFC
- On primary/on secondary: #0F172A
- Secondary/muted foreground: #94A3B8
- Accent: #3B82F6; on accent: #FFFFFF (reserved, no small white button text on blue)
- Background: #0B0B10
- Card/card foreground: #1E1E23 / #F8FAFC
- Muted: #232328
- Border: #1E293B
- Destructive/on destructive: #EF4444 / #FFFFFF
- Dark only, no alternative theme. Alpha variants of these exact tokens are allowed for scrims, hairlines, sphere lighting and stars.
- Image internals (GitHub avatar, NASA texture, upstream project logos) are source assets and exempt from UI palette.

## Typography
Source: typography.csv row 23, Korean Modern. Heading and body: Noto Sans KR, self-hosted variable WOFF2, font-display swap. System sans-serif fallbacks.
- H1: clamp(42px, 5.5vw, 80px), 700, line-height 1.22, tracking -0.065em.
- H2: clamp(36px, 4.2vw, 60px), 650, line-height 1.25, tracking -0.055em.
- H3: 28~ 40px, 600, line-height 1.3, tracking -0.04em.
- Body: 16~ 20px, 400, line-height 1.8; width max 55ch.
- Caption: 12~ 14px, 400~ 500; only two section eyebrows (hero and work).
- 2tle wordmark: same typeface, 28px/700; large contact wordmark 120px capped responsively.

## Geometry
Base 4px. Spacing: 4/8/12/16/24/32/48/64/96/128.
Content max 1200px, desktop side inset 64px, mobile 24px (20px under 375px).
Desktop nav 72px, mobile 64px. All links/buttons min-height 44px.
Section padding desktop 128px, mobile 80px.
Cards and portrait 24px radius; buttons 999px; metadata text unboxed.
Hairlines: 1px foreground at 12% opacity. No card shadows; hero sphere ambient shadow uses background token.

## Sections
1. Hero: left-aligned name/headline/intro/one project CTA; oversized right moon and sparse stars. One 155svh sticky scene on desktop. Scrolling scales moon 1→1.16, offsets up to 10%, fades hero text only to .25; unpins into About. Mobile unpinned, moon backdrop below text, no scale.
2. About: real GitHub portrait left, identity and three interests right. No invented achievements. On mobile portrait compact and text stacked.
3. Work: one full-width featured Nether project, then two unequal-width Macmagotchi/Survirun cards. Authentic project logos, repo status, useful descriptions. Mobile single-column. No pretend product screenshots. Survirun uses a native API relationship diagram explicitly labeled as a functional diagram.
4. Journey: heading above a compact chronological experience list, dates and descriptions; no unsupported awards section. Mobile dates above entries.
5. Contact: wide friendly close, mail link and copy-email button, GitHub and blog links, minimal footer credits.

## Motion
Native CSS and requestAnimationFrame, no framework needed for a static portfolio.
- Scroll: only transform/opacity on the single hero scene; passive scroll listener schedules one frame, no perpetual animation loop.
- Content: 320ms opacity-only reveal, once per element; never hide content without JS initialization.
- Hover: 180ms ease-out transform, border-color; active: 100ms scale(.98).
- Reduced motion: disable pinning, parallax, reveal, smooth scroll; all content immediately visible.
- A visible motion toggle also disables animation; choice saved best-effort in localStorage.
- Canvas star field drawn only on resize, no twinkle loop or flashing.

## Accessibility and resilience
Semantic static HTML, one h1, skip link, focus outline, descriptive alt text, real anchors, aria-live copy feedback, expandable mobile menu with Escape/outside-click handling. No API needed at visit time. Copy failure exposes selectable email and mailto remains usable. Image failure leaves a stable layout and real text. Site works without JS, with reduced motion, and at 200% text zoom.
