# DESIGN.md · stringju seasonal rooms

## Direction

봄에서 겨울로 이어지는 네 장의 방 일러스트를 포트폴리오의 장면으로 사용한다. 각 챕터는 같은 레이아웃 문법을 공유하되, 배경 그림에서 직접 가져온 계절색으로 구분한다. 분위기는 포근하고 차분하며, 장식보다 이력과 프로젝트를 빠르게 읽는 흐름을 우선한다.

## Design dials

- Design variance: 6/10. 계절별 변주는 분명하게, 정보 구조는 안정적으로 유지한다.
- Motion intensity: 4/10. 한 번의 진입 모션과 가벼운 포인터 반응만 사용한다.
- Visual density: 3/10. 큰 풍경과 넉넉한 여백 사이에 핵심 정보만 배치한다.

## Seasonal color system

모든 팔레트는 해당 배경 이미지의 지배색을 기준으로 조정했으며, 본문과 보조문은 각 계절 표면에서 WCAG AA 대비를 확보한다.

| Season | Use | Surface | Ink | Muted | Accent | Rule |
| --- | --- | --- | --- | --- | --- | --- |
| Spring | Hero, Introducing | `#F6D8DC` | `#71384B` | `#895365` | `#993F58` | `rgba(113, 56, 75, .22)` |
| Summer | Experiences | `#DDE9CA` | `#1F472E` | `#486343` | `#3F693D` | `rgba(31, 71, 46, .22)` |
| Autumn | Projects | `#F6D09A` | `#6E301B` | `#874628` | `#993B1C` | `rgba(110, 48, 27, .22)` |
| Winter | Education, Contact | `#D9E7F4` | `#234C6B` | `#45647D` | `#38698F` | `rgba(35, 76, 107, .22)` |

- Reading progress: spring, summer, autumn, winter accents in four equal stops.
- Focus outline: the active chapter accent.
- No unrelated warm/cool gray or generic purple accent.

## Typography

- Family: locally hosted Pretendard variable font.
- Hero identity: 48–110px, weight 750, line height .95, tracking -.08em.
- Section titles: 38–86px, weight 720, line height 1.04, tracking -.07em.
- Project titles: 48–83px, weight 720.
- Reading text: 14–19px with 1.65–1.8 line height.
- Korean words keep natural syllable groups; long URLs and email addresses may wrap safely.

## Layout and surfaces

- Hero: exactly `100dvh` where supported, with the `stringju` wordmark centered on both axes. A restrained spring-colored radial veil keeps the wordmark readable without becoming a card.
- Every chapter begins with roughly half a viewport of scenery, then meets a solid seasonal surface with a subtle color-matched edge. Section titles sit fully inside that surface rather than straddling its boundary.
- Shared content width: up to 1200px with responsive page edges.
- Introducing: open text block with one closing rule.
- Experiences: two-column timeline on desktop, one connected reading column on mobile. Every entry uses the same local line-and-dot treatment.
- Projects: one continuous autumn surface contains every project. Alternating two-column rows are separated by restrained rules on desktop; mobile stacks each reduced-size icon and copy without crossing the surface boundary.
- Education: one full-width heading rule, then a reading column with matching top and item rules. When there are three records or fewer, it uses the full content width; otherwise it is capped at 720px. No one-off bordered card.
- Awards: the same winter record surface continues beneath Education. Six sourced records use a balanced two-column list on desktop and one column on mobile, with equal-width row rules. When three records or fewer are present, the list automatically becomes full-width single-column rows.
- Contact: winter scene with a single large email intent and restrained external links.
- Shape rule: content surfaces stay square/open; circles are reserved for visual halos, timeline points, and the back-to-top control.

## Motion and interaction

- Timing: hover 180ms; text reveals use 420–680ms with the Apple-like `cubic-bezier(.16, 1, .3, 1)`. The identity entrance is 700ms.
- Native document scrolling only. No scroll hijacking or pinned scenes.
- Section titles use a restrained vertical reveal with clip, blur release, and opacity. Record items use a smaller rise-and-focus transition with 80ms stagger steps. They reset only after fully leaving the viewport, then replay on re-entry from either scroll direction.
- Project marks may translate/scale on entry and tilt slightly under a fine pointer.
- Text links increase arrow gap on hover and move down 1px on active press.
- Reduced motion removes transforms, transitions, and reveal dependencies.

## Responsive, accessibility, and fallback

- At 800px and below, a fixed local seasonal canvas becomes visible behind 64svh-tall transparent scenery stages. Its images use `object-fit: cover` and `object-position: 50% 50%`, keeping the character centered and visible before each seasonal reading surface starts; the same scroll-driven seasonal dissolve and entry motion continue on mobile.
- All multi-column content becomes one column on mobile.
- Minimum page width: 320px. Interactive targets are at least 44px.
- Visible keyboard focus uses a 3px seasonal accent outline with 5px offset.
- No JavaScript: complete content and spring scene remain available.
- Decorative images are excluded from the accessibility tree.
- Print: white background, no scenery, no decorative progress or motion.
