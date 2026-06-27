# Complex CSS (parent-child, positioning, contrast)

The hardest, most bug-prone styling. Three specialists own it and run on every frontend task.

## Layout & parent-child ([[layout-architect]])
- Prefer Grid for 2D structure, Flex for 1D rows/columns; avoid deep nesting without reason.
- A child's size/position depends on its parent's display/sizing — make that dependency explicit.
- Add `min-width: 0` / `min-height: 0` on flex/grid children to stop overflow blowouts.
- Drive responsive behaviour with container queries / breakpoints, not magic numbers.

## Positioning & stacking ([[positioning-specialist]])
- Maintain a documented z-index scale (e.g. base 0, dropdown 1000, modal 2000, toast 3000).
- Know what creates a stacking context (transform, opacity < 1, position + z-index, filter).
- Render overlays/modals in a portal at the body root to escape `overflow: hidden` clipping.
- Use `position: sticky` carefully — it needs a scroll container and no overflow-hidden ancestor.

## Contrast & accessibility ([[contrast-specialist]])
- Meet WCAG AA: 4.5:1 for normal text, 3:1 for large text and UI/icons.
- Verify ratios in BOTH light and dark themes; check token-on-token colour pairs.
- Always provide a visible `:focus-visible` state — never remove outlines without a replacement.
