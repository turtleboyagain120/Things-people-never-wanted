# SVG Editing Tips

SVG files are text files. You can open them in a browser to view them, or open them in a code editor to change shapes and colors.

## Easy Color Swaps

Search for these colors:

- `#4df7ff` - cyan player glow
- `#ff2d55` - red enemy glow
- `#ff8a2a` - orange elite accent
- `#ffd166` - gold pickup/accent
- `#061116` - dark background
- `#303942` - concrete

Changing one color is the fastest way to make a new faction, pickup type, or alternate player skin.

## Beginner Edits

- Change `stroke-width` to make outlines thicker or thinner.
- Change `viewBox` only if you know the new canvas size you want.
- Change `opacity` to make effects softer or louder.
- Duplicate a `<path>` and offset it a little to create an afterimage.
- Remove the dark `<rect>` background if you want a transparent asset.

## Making Sprite Frames

To create basic animation frames:

1. Copy one player SVG.
2. Rename it, like `cyan-runner-jump-01.svg`.
3. Move one limb by changing its path numbers.
4. Repeat for a few more frames.
5. Keep the head, chest, and feet in similar positions so the animation does not wobble too much.

## Common Mistakes

- Too many tiny details can vanish when the asset is small.
- Too much glow can blur the silhouette.
- Thin dark weapons can disappear against the skyline.
- Effects look better when they are readable for a split second.

## Quick Test

Open the SVG at small size. If you can still tell what it is, the design is probably working.
