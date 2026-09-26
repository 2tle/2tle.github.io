# DESIGN.md · stringju simple seasons

## Direction

`background/simple/`의 자캐와 강아지 일러스트 네 장을 계절별 고정 배경으로 사용한다. 각 그림을 화면 중앙에 크게 놓고 충분히 감상한 뒤 이력·프로젝트를 읽도록 장면과 본문을 분리한다. 기존 방 풍경과 유리 질감은 사용하지 않는다.

## Design dials

- Variance 6/10: 그림과 비대칭 글 배치로 구분한다.
- Motion 3/10: 섹션 진입과 계절 전환만 부드럽게, reduced motion에서는 즉시 전환한다.
- Density 3/10: 한 줄기 기록과 열린 여백을 유지한다.

## Palette

| Role | Color |
| --- | --- |
| Background | `#FFFFFF` |
| Ink | `#493B36` |
| Muted text | `#685953` |
| Rule | `#DED5CE` |
| Spring surface / accent | `#F8ECEA` / `#9E6B75` |
| Summer surface / accent | `#EEF3E7` / `#557659` |
| Autumn surface / accent | `#F8EFE4` / `#9C684A` |
| Winter surface / accent | `#EEF1F6` / `#65789C` |

## Type and layout

- Local Pretendard, no external request. Identity 60–132px, section headings 40–88px, body 14–20px.
- Desktop: 화면 중앙에 최대 1280px 크기의 고정 일러스트. 첫 화면에서는 간결한 워드마크를 그림 위 여백에 두고, 각 챕터는 104svh의 그림 장면 다음 전폭 계절색 읽기 면으로 이어진다.
- Mobile ≤800px: 그림을 화면보다 넓게 키우고, 104svh의 장면 뒤에 전폭 본문을 둔다. Projects는 작은 아이콘과 글로 된 행, 날짜는 480px 아래에서 세로로 배치한다.
- Surfaces have square edges. Project icon tiles are lightly rounded, timeline dots and back-to-top are circular.

## Interaction and access

- Scroll-triggered background dissolve at the start of Experiences, Projects and Education; no scroll hijacking.
- Visible 3px focus outline, 44px links, reduced motion, no-JavaScript reading, print without scenery.
- Intro and resume facts remain sourced from `content/*.md`; generated content markers are untouched.
