# Fork Notes

This folder is intentionally separate from the game. Adding, deleting, or editing these SVGs should not affect gameplay unless a fork manually imports them.

## Safe Use

Safe things to do:

- use the SVGs in a README
- use them as concept art
- recolor them for new factions
- trace them into pixel art
- convert them into PNGs
- turn them into sprite sheets
- use them as icons in a menu

## If You Add Them To The Game

If a fork wants to load these assets in-game, do it carefully:

1. Keep the original files in `starter-art-bundle`.
2. Copy game-ready versions into an `assets` folder.
3. Use smaller optimized versions for gameplay.
4. Test performance after adding many SVGs.
5. Keep the canvas art readable at game speed.

## Performance Notes

SVGs are great for reference and UI, but many animated SVGs can be slower than simple canvas drawing or PNG sprite sheets. For gameplay, a fork may want to export PNG frames after the art is final.

## Naming Tips

Good file names are short and descriptive:

- `player-jump-01.svg`
- `enemy-red-run-03.svg`
- `pickup-shield-large.svg`
- `boss-core-hit.svg`

Avoid names like `final-final-new-real.svg` because nobody wins that fight.

## Keeping It Beginner Friendly

If you add more assets, include:

- a clear file name
- a short title inside the SVG
- a short description inside the SVG
- colors that match the style guide
- a README note if the asset has a special purpose
