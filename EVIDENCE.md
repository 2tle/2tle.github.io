# Evidence ledger

| Claim | Source | Confidence | Allowed wording | Usage |
|---|---|---|---|---|
| stringju / 양현준 | User: "change 2tle to stringju. and fully name is 양현준. use this in introduction." | High, user-provided | stringju as display name; 양현준 in introduction and metadata | Profile / document title |
| GitHub account 2tle / avatar | https://api.github.com/users/2tle | High, previously retrieved public API | Keep verified GitHub URLs and avatar; not the site's display name | Profile image / links |
| Backend, native app and ML interests | https://github.com/2tle/2tle/blob/master/README.md | High, self-reported | 백엔드 · 네이티브 앱 · 머신러닝 | Profile |
| Sungkyunkwan CSE starts 2024.02 | Same profile README | High, self-reported | 2024.02 성균관대학교 컴퓨터공학과 입학; no unverified current enrollment | Timeline |
| Team LogCat Backend Developer 2022.12~2024.12 | Same profile README | High, self-reported | Team LogCat 백엔드 개발 | Timeline |
| MIDAS IT internship 2023.02.06~2023.02.24 | Same profile README | High, self-reported | MIDAS IT 동계 인턴십, 2023.02 | Timeline |
| Sunrin software 2021.03.02~2024.02.29 | Same profile README | High, self-reported | 선린인터넷고등학교 소프트웨어과 2021.03~2024.02 | Timeline |
| Survirun Android & backend 2021.10~2022.12 | Same profile README | High, self-reported | Android 앱과 백엔드 개발 | Project |
| Email and blog | Same profile README contact links | High, public contact | iam@2tle.io, stringju.tistory.com | Contact |
| Nether initial desktop scaffold, Rust/Iced | https://github.com/2tle/Nether/blob/main/README.md (read through GitHub README API) | High | 커스터마이징 가능한 터미널을 향한 초기 구현, Rust / Iced; do not claim mature release | Project |
| Macmagotchi menu bar virtual pet, SwiftUI/AppKit | https://api.github.com/repos/2tle/macmagotchi/readme | High | macOS 메뉴 막대의 작은 반려동물, Swift / SwiftUI / AppKit | Project |
| SurvirunAPI endpoints | https://api.github.com/repos/2tle/SurvirunAPI/readme | High | 운동·친구·목표 관리 REST API, Socket.io 실시간 운동 기능, JavaScript | Project |
| Project years 2026/2026/2021 | https://api.github.com/users/2tle/repos?per_page=100 | High, creation years only | 시작 연도 only; not completion or release dates | Omitted in simplified design |
| Awards, metrics, exact personal ownership | Missing | 0 | MUST NOT USE | Omitted |

## Assets
- `assets/images/profile.jpg`: https://avatars.githubusercontent.com/u/56637184?v=4&s=640, unmodified public avatar downloaded at user request.
- `assets/images/moon-texture.jpg`: https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg. NASA Scientific Visualization Studio, CGI Moon Kit https://svs.gsfc.nasa.gov/4720/. Credit NASA/Goddard Space Flight Center Scientific Visualization Studio, LRO/LROC. Used to render a decorative shaded sphere, not a scientific visualization.
- `assets/images/moon.webp`: locally projected and shaded from the NASA texture using scripts/render-moon.py.
- Nether and Macmagotchi logos: retained source assets from the public repositories, no longer displayed in the simplified project list.
- Noto Sans KR: SIL Open Font License, downloaded from Google Fonts and self-hosted. License included with font assets.

## Research limitations (original implementation)
- Image generation attempted; unavailable because pi-image-gen.defaultModel is unset. Used attributed NASA imagery instead.
- Design MCP discovery/browser tools (designmd, ui-layouts, 21st-dev, chrome-devtools) not exposed in this session. No claims of MCP research.
- Original reference fetched content: Apple AirPods Pro and NASA. The subtractive redesign is compared against local before/after screenshots in QA.md; no new external research is claimed.
