# 6pm v2: design system

The prototype is the spec: `design/prototype/6pm App.dc.html` (+ onboarding v2, surfaces and states, coming soon, wheel). Rendered references live in `design/renders/` (`app/NN-<state>.png`, `onboarding/NN-<step>.png`, `boards/*.png`) at 2× of a 402×874 pt iPhone. Regenerate with the capture scripts in `tools/design/`.

## Principles

1. **Pixel-exact.** Sizes, radii, spacing and type sizes are read from the prototype markup (pt = CSS px at 402 wide). If a value is unclear, measure the render, never guess.
2. **Colour-exact.** Every colour comes from `@6pm/theme`. Sky colours are interpolated per minute exactly like `palette()`; oklch values are converted in code. No hand-picked hex in screens.
3. **Native motion.** UI-thread animation only, gesture-driven where the prototype is draggable, springs with the prototype's overshoot. Every state change animates; nothing pops.
4. **Intentional.** Each element exists for the daily number or the close. Undesigned states reuse existing components and are logged in `docs/undesigned-states.md`.

## Type roles

| Role | Font | Notes |
|---|---|---|
| Display (hero number, headings) | Per look (`dispFont`): Bricolage Grotesque for Golden Hour and serious mode, SF Pro for Basic | Tight tracking as in the prototype |
| Interface (labels, rows, buttons) | Per look (`uiFont`): SF Pro (system) for Basic, Golden Hour and serious mode; the look's own text face for the rest | Be Vietnam Pro on Android where a look keeps the system face |
| Labels, kickers, receipts, stamps | IBM Plex Mono | Uppercase, letter-spaced |
| Diary handwriting | Patrick Hand | |

## Tokens per frame

`@6pm/theme` derives, for (look, variant, hour, serious): `sky` gradient stops, `skyDeep`, `pageBg`, `ink`, `inkSoft`, `glass`, `glassShadow`, `sheet`, `sheetSolid`, `cell`, `cardShadow`, `hair`, `chipBg`, `tabActive`, `btnBg/Fg`, `bubbleBg/Fg`, `accent`, `dispFont`, `dark`. Category tiles: `oklch(0.9 0.07 h) → oklch(0.78 0.12 h)` at 155°, glyph `oklch(0.34 0.09 h)`.

## Motion vocabulary (prototype keyframes → app)

| Prototype | App |
|---|---|
| screenIn, sheetUp, rise, reveal | native stack / form sheets + Reanimated entering (spring, overshoot) |
| slideInR / slideInL | tab pager follows the finger; release springs |
| stampIn | CLOSED stamp: scale 2.4 → 0.94 → 1, rotate −14° → −7°, opacity to .92 |
| slotPrint | receipt prints downward from a slot |
| odometer | per-digit rolling column, 1000 + 80·pos ms |
| bubbleIn, pop, confetti, dot | companion bubble, badges, Max welcome, typing |

## Sheet heights

A sheet is as tall as what it holds, header, body and pinned footer together, standing on the bottom edge with its colour under the home indicator; it never leaves empty sheet under its last section. It grows to the full sheet (its top on the safe area, 62 pt down) only when it needs to, and from there its body scrolls under a pinned footer. When what it holds grows or shrinks, its top edge follows with the sheet curve (`cubic-bezier(.2,.9,.2,1)`, 450 ms). Settings, Categories, Banks, Import, the capture and widget guides, the money diary, the category and shared-pot editors and Max are always long and stay the full native sheet. On an iPhone the fitted sheet is drawn by the app (iOS floats a shorter native sheet as an inset card); on Android it is the native sheet fitted to its content, and on iPad the page sheet.

## Haptics

Selection: wheel ticks, tab scrub, threshold crossings. Light impact: keep/edit/not-mine, FAB long-press, sheet dismiss, undo. Success: close done, reveal settle, purchase done.
