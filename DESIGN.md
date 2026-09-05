# stringju visual system

## Direction
A compact personal page, not a promotional landing page. Profile, actual projects, dated experience, contact. Remove slogans, repeated introductions, ornamental labels, oversized cards and scroll scenes. Keep the existing dark space identity as one quiet, static moon.

DESIGN_VARIANCE: 4 / MOTION_INTENSITY: 1 / VISUAL_DENSITY: 3.

## Palette
Retain colors.csv row 83, Space Tech / Aerospace, verified in the installed omp-designer data.
- Background: #0B0B10; foreground / primary / ring: #F8FAFC.
- Secondary / muted foreground: #94A3B8; on primary / on secondary: #0F172A.
- Accent: #3B82F6; on accent: #FFFFFF.
- Card / card foreground: #1E1E23 / #F8FAFC; muted: #232328.
- Border: #1E293B; destructive / on destructive: #EF4444 / #FFFFFF.
- Hairlines: foreground at 12% opacity. No card surfaces, shadows or gradient text. Unused semantic colors remain reserved, not an excuse to add UI.
- Imported profile and NASA moon retain original image colors. Their provenance remains in EVIDENCE.md.

## Typography
Retain typography.csv row 23, Korean Modern: self-hosted Noto Sans KR for headings and body, variable WOFF2, font-display swap.
- H1: 48px desktop / 40px mobile; weight 650; line-height 1.15; tracking -.055em.
- Real name: 18px; weight 400; line-height 1.6.
- Section headings: 14px; weight 500; line-height 1.6.
- Project names: 22px desktop / 20px mobile; weight 550; line-height 1.4.
- Experience names and descriptions: 16px; line-height 1.6.
- Interest line and project descriptions: 16px; line-height 1.7.
- Dates / contact links: 14px; line-height 1.6. Dates use tabular numerals.
- No uppercase eyebrows, marketing headlines, clamped prose or truncation.

## Geometry
- Base spacing: 4px; scale 4/8/12/16/24/32/40/48/56/64/80.
- Content width: 800px maximum; 32px side insets, 24px at 640px and below, 20px at 360px and below.
- Intro: 80px top, 56px bottom; 72px square portrait with 12px radius, 24px identity gap.
- Content sections: 40px vertical padding; 112px heading rail + 40px gap + remaining content.
- Project rows: 20px vertical padding and one 1px divider; no box or pill. Entire row is the repository link.
- Experience rows: 24px gap, organization and role left, date right. No per-row borders or category tags.
- Footer: 24px top, 48px bottom, one divider. Email, GitHub, Blog only.
- Under 640px: intro starts at 48px; section heading above content with a 16px gap; dates below each experience; contact links wrap naturally.
- Portrait radius 12px; focus outline radius 4px; all content rows square. No elevated surfaces.

## Imagery and motion
Reuse the actual GitHub photo. A small, low-opacity lunar image sits in the upper-right background; no orbit lines, captions, canvas stars, parallax, sticky panels, entrance effects or motion controls. No new generated assets are needed for a subtractive redesign.
- Motion: none, including scroll behavior. Hover and focus use an immediate underline / outline, not movement.
- All content is visible immediately, regardless of JavaScript or reduced-motion settings.

## Accessibility and resilience
Static semantic HTML with one h1, meaningful h2/h3 hierarchy, a keyboard skip link, visible focus, and correctly named external links. Every link has a 44px minimum target. Retain verified URLs; do not infer new accounts from the new display name. Profile has explicit dimensions and descriptive alt text; decorative moon has empty alt and no accessibility-tree presence. No runtime JavaScript, API, CDN or storage dependency. Support 320px layouts, 200% text enlargement, and print.
