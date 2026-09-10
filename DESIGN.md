# DESIGN.md · stringju seasonal room

## Brand
- Name: stringju · 양현준
- Art direction: 자캐가 쉬고 있는 계절 방에서 펼쳐 보는 개발 기록장.
- Voice: 포근한, 차분한, 꼼꼼한.
- Avoid: 유아용 장난감 같은 정보 위계, 검은 우주 배경, SaaS 카드 반복, 과한 유리 효과, 근거 없는 장식 문구.

## Color System
Base source: colors.csv row 11 `Portfolio/Personal`.
- Primary ink: #18181B
- On primary: #FFFFFF
- Secondary ink: #3F3F46
- Accent base: #2563EB, reserved for forced fallback only
- Background paper: #FAFAFA
- Foreground: #09090B
- Card: #FFFFFF
- Card foreground: #09090B
- Muted: #E8ECF0
- Muted foreground: #64748B
- Border: #E4E4E7
- Destructive: #DC2626
- On destructive: #FFFFFF
- Ring: #18181B

User-asset seasonal exception:
- Spring primary #A84E66, soft #F6D6DE, ink #6E4148, RGB 168 78 102
- Summer primary #466B3B, soft #DDE8C8, ink #315239, RGB 70 107 59
- Fall primary #B44C23, soft #F6D39B, ink #70361F, RGB 180 76 35
- Winter primary #456789, soft #DCE8F4, ink #334C68, RGB 69 103 137
- Warm paper shadow: rgba of active seasonal RGB only.
- Rule: seasonal colors change together with the user-provided background. No component invents another accent.

## Typography
Source: typography.csv row 23 `Korean Modern`.
- Heading and body: Noto Sans KR, self-hosted variable font.
- Display: 700, clamp(48px, 6.8vw, 96px), tracking -0.07em, leading 0.94.
- H1: 700, clamp(42px, 5vw, 72px), tracking -0.065em, leading 1.0.
- H2: 700, clamp(30px, 4vw, 52px), tracking -0.055em, leading 1.14.
- H3: 650, 18 to 28px, tracking -0.035em, leading 1.3.
- Body: 400 to 500, 16 to 18px, tracking -0.01em, leading 1.7.
- Caption: 650, 12 to 13px, tracking 0.06em, leading 1.5.
- Maximum body line: 62ch.

## Spacing and Grid
- Base unit: 4px.
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 112, 144.
- Main paper width: min(1180px, viewport minus 40px), mobile viewport minus 20px.
- Reading width: 1080px.
- Section padding: clamp(72px, 10vw, 136px).
- Breakpoints: 640px, 768px, 1024px, 1280px.

## Radius and Material
- Main notebook: 32px desktop, 24px mobile.
- Cards and images: 24px desktop, 18px mobile.
- Buttons: 999px.
- Small notes: 14px.
- Borders: 1px solid seasonal ink at 14 to 20% opacity.
- Shadow 1: 0 10px 30px rgba(active-season, .12).
- Shadow 2: 0 28px 80px rgba(active-season, .20).
- Material rule: one continuous paper canvas, sparse note overlays, no page-wide glass card system.

## Motion
- Entrance: 300ms cubic-bezier(.22, 1, .36, 1), opacity/transform, 16 to 24px.
- Exit: 180ms ease-in, opacity.
- Hover: 160ms ease-out, transform or color.
- Press: 100ms ease-out, scale(.98).
- Stagger: 70ms.
- Season change: 220ms ease-out.
- Scroll: native only. No hijacking or pinned section.
- Reduced motion: no transforms, transitions, particles, or scroll-linked effects.

## Component Patterns
- Hero: full-bleed seasonal room with an offset opaque paper identity card. Mobile becomes image above paper copy.
- Season controls: four 44px controls, explicit labels, aria-pressed state.
- About: real portrait polaroid paired with a large note.
- Experience: continuous calendar binding, not separate cards.
- Skills: three offset memos; vertical mobile stack.
- Projects: broad desk-object showcases with one visual and one factual description.
- Contact: postcard composition with a single email intent.

## Image Style
- Hero sources: `background/spring.png`, `summer.png`, `fall.png`, `winter.png`, user-provided illustrations.
- Hero crop: cover on desktop; dedicated upper image panel on mobile.
- Profile: square photograph, no color filter, paper mat.
- Project marks: existing local SVG assets, unchanged.
- Decorative artwork uses CSS only for tape, punched holes, binding line, and small seasonal particles.

## Accessibility
- WCAG 2.2 AA target.
- Interactive text uses dark seasonal primary or primary ink on light paper.
- Visible 3px focus outline.
- Minimum target 44×44px.
- One H1 and logical landmarks.
- Active season is conveyed by text, aria-pressed, and status, not color alone.
- JavaScript-free fallback shows spring and all factual content.
- Reduced-motion and forced-colors fallbacks are explicit.
