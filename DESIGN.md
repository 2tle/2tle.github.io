# DESIGN.md · stringju continuous landscape

## Direction

네 장의 기존 방 일러스트가 스크롤에 따라 한 자리에서 서서히 겹쳐진다. 계절별 테마와 선택 버튼은 사용하지 않는다. 소개부터 연락처까지 같은 풍경, 색, 타이포그래피를 유지한다.

## Visual system

- Canvas: warm ivory #F7F3ED.
- Main text: #292B27. Secondary text: #60645B.
- Accent: muted olive #596947, consistent throughout the page.
- Rules: olive ink at 22% opacity.
- Identity: Georgia serif, 80–138px desktop, 76–118px mobile.
- Korean copy: locally hosted Noto Sans KR.
- Section titles: 28–42px desktop, 26–37px mobile, weight 550.
- Reading text: 14–17px with 1.8–2 line height.
- No notebook outlines, tape, memo cards, or separate seasonal palettes.

## Layout and artwork

- One fixed landscape canvas covers the viewport, behind all content.
- Four local images share the same crop. `spring2.png` remains the opaque base; summer, fall, and winter progressively dissolve over it.
- Native document scroll progress determines image opacity using smoothstep. No timers, scroll hijacking, or section pinning.
- Incoming images must finish decoding before appearing. Failed images leave the preceding image visible.
- Desktop: every chapter uses the full viewport width. Content expands to a 1240px product-story grid, while the scene remains visible beneath a light ivory veil.
- Experience: a two-column timeline. Skills: three large panels. Projects: alternating full-width feature scenes with oversized marks and descriptions.
- Contact: a full-screen final panel with a single large email intent.
- Mobile, at 700px and below: large stages become a single vertical reading flow; the scene stays behind a higher-opacity ivory veil.

## Motion and accessibility

- Native scrolling only. Image opacity is updated once per animation frame on scroll/resize.
- Short one-time content entrance; subtle pointer response on project marks.
- Reduced motion: static spring scene, no transforms or animated transitions.
- No JavaScript: spring scene and the complete document remain available.
- Images are decorative and excluded from accessibility navigation.
- Minimum 44px link targets and visible focus outlines.
- Forced colors: decorative scenery is hidden and system text colors are respected.
- Print: plain white reading surface with artwork and navigation removed.
