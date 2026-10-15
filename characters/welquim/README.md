# Welquim profile mascot

The original two sprite sheets were supplied by the portfolio owner. The matching
downloaded PNGs are preserved as `directions-original.png` and
`reactions-original.png`. Do not replace these with the processed sheets.

`directions-transparent.png` and `reactions-transparent.png` were prepared with the
built-in imagegen tool using the prompts below. `scripts/prepare-mascot.py` packs the
portraits and floating symbols into evenly spaced transparent cells, saved as
`directions.png` and `reactions.png`. This fixes uneven source row spacing without
changing the portraits. Python tooling is needed only when rebuilding artwork.

The page-mascot skill's `mascot.py welquim --skip-generate` then aligns and verifies
both atlases. Results: 0.00 px body shift at 140 px, 83.1% palette match, 1.1% width
change. Both source grids have clear cell boundaries. The left and right frames
were inspected to confirm they face the corresponding cursor direction.

Published assets are `public/mascots/welquim-directions.webp`,
`public/mascots/welquim-reactions.webp`, and `public/mascots/welquim-avatar.webp`.
The last is the center direction frame for noninteractive profile appearances.

## Background extraction prompts

Directions (built-in imagegen, transparent background enabled):

> Use case: background-extraction. Edit the supplied 3 by 3 character direction sprite sheet for a website avatar. Remove ONLY the black background and make it true transparent alpha. Preserve the exact character identity, hairstyle, glasses, moustache, earrings, black shirt, illustration style, colors, nine poses and original grid positions. Nine separate head-and-shoulders portraits in a regular 3x3 grid: upper-left/up/upper-right, left/front/right, lower-left/down/lower-right. Do not change the poses or mirror directions. Retain all black hair, glasses, and shirt details. No backdrop, no painted checkerboard, no text, no cropping of hair or shoulders. Output the complete square sprite sheet.

Reactions (built-in imagegen, transparent background enabled):

> Use case: background-extraction. Edit the supplied 3 by 3 character reaction sprite sheet for a website avatar. Remove ONLY the black background and make it true transparent alpha. Preserve the exact character identity, hairstyle, glasses, moustache, earrings, black shirt, illustration style, colors, nine expressions and original grid positions. Keep all nine separate head-and-shoulders portraits in a regular 3x3 grid with original reactions: smile eyes closed, heart, sparkle / surprised, star eyes, blushing / sleepy with blue Zs, dizzy spiral eyes, delighted. Keep the floating heart, stars and Zs. Retain all black hair, glasses, and shirt details. No backdrop, no painted checkerboard, no text added, no cropping. Output the complete square sprite sheet.
