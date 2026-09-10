# PLAN.md

## 1. Brand & Voice
- Name: stringju · 양현준
- One-liner: 백엔드 개발과 인프라를 함께 공부하는 개발자의 계절 기록장.
- Voice: 포근한, 차분한, 꼼꼼한.
- Anti-patterns: 어린이용 UI처럼 가벼운 정보 위계, SaaS 카드 템플릿, 과한 유리 효과, 근거 없는 수치와 장식.

## 2. Visual System
- Baseline palette source: colors.csv row 11 `Portfolio/Personal`.
- Base: #FAFAFA, #09090B, #FFFFFF, #64748B, #E4E4E7, #18181B.
- Intentional user-asset exception: 계절 강조색은 제공된 네 배경에서 추출한 고정 토큰을 사용한다.
  - Spring: #A84E66 / #F6D6DE / #6E4148
  - Summer: #466B3B / #DDE8C8 / #315239
  - Fall: #B44C23 / #F6D39B / #70361F
  - Winter: #456789 / #DCE8F4 / #334C68
- Typography source: typography.csv row 23 `Korean Modern`, Noto Sans KR / Noto Sans KR. 기존 자가 호스팅 가변 글꼴을 유지한다.
- Dials: DESIGN_VARIANCE 8, MOTION_INTENSITY 5, VISUAL_DENSITY 5.

## 3. Stack
- Static HTML, CSS, vanilla JavaScript.
- Existing content generator and local assets remain.
- No new runtime dependency, CDN, or external image request.

## 4. Pages / Routes
- One page only: `/`.
- Hash destinations: `#about`, `#experience`, `#stack`, `#work`, `#journey`, `#contact`.

## 5. Sections
1. Hero room: current-season room fills the opening. A paper identity card sits off-center on desktop and below the artwork on mobile. Four season controls change image and UI accent.
2. About note: portrait polaroid plus three source-grounded statements. The character scene and real portrait connect without pretending they are the same medium.
3. Experience calendar: chronological records on a continuous binding rail.
4. Tool memos: three overlapping desk-note surfaces, each using the same content but a distinct paper composition.
5. Project shelf: repository marks become objects placed on broad project cards; information stays directly actionable.
6. Record cards: education and previous work as two differently weighted notebook inserts.
7. Contact postcard: one email action and three verified external destinations.

## 6. Animation Inventory
- Season change: 220ms opacity and scale crossfade, plus semantic `aria-live` status.
- Hero: one subtle scroll-linked background zoom on desktop only.
- Entries: 300ms opacity/transform with varied axes by information type.
- Experience binding: scroll-linked scaleY.
- Project object: one-time settle and restrained fine-pointer tilt.
- Reduced motion: all reveal transforms, parallax, particles, and crossfades resolve immediately.

## 7. Research Log
- Seasonal character portfolio search: visible room objects can carry personality, but primary destinations should remain explicit.
- Animal Crossing scrapbook search: seasonal lighting plus scrapbook materiality supports character ownership; excessive badges and alerts create noise.
- designmd, ui-layouts, 21st-dev, chrome-devtools MCP are unavailable in this environment. Existing Playwright screenshots provide the local baseline.

## 8. Risks & Mitigations
- Portrait crop hides scene details: desktop uses cover; narrow screens recompose to an image panel above the copy.
- Seasonal accents fail contrast: dark accent tokens are used for text and buttons; pale variants are decorative only.
- Large PNG cost: only the active scene is rendered, remaining images are prefetched after load.
- Persistent choice storage blocked: localStorage access is guarded; current month remains the fallback.
- Motion causes discomfort: reduced-motion removes all nonessential motion.
- Content generator overwrites markup: existing marker names and required class contracts remain.
