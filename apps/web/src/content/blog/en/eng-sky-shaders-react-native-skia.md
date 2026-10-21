---
title: "Sky shaders at 120fps in React Native with Skia"
description: "How 6pm draws a time-of-day sky in one Skia canvas: baked blur gradients, a halftone shader, noise grain, rain tiles and tilt-driven living scenes."
slug: eng-sky-shaders-react-native-skia
lang: en
pubDate: 2026-10-21
tags: [engineering, react native, skia, shaders, reanimated]
related: [eng-native-feel-expo-reanimated, eng-widgets-controls-live-activities-expo, eng-why-we-open-sourced-our-money-app]
cta: "Read the sky code on GitHub, or watch it change through the day in the beta."
hero: [today]
---

# Sky shaders at 120fps in React Native with Skia

6pm's sky is one React Native Skia canvas drawn behind the Today screen: a time-of-day gradient, drifting blooms, sun, halftone, grain, rain and three "living scenes". It stays cheap by baking anything expensive once (blurs, noise, rain), keeping per-frame work to gradients and textures, and stepping slow motion at 30 Hz while scrolling still moves every frame.

The code is in `apps/mobile/src/ui/sky` in the [6pm repo](https://github.com/at6pm/6pm). Versions: `@shopify/react-native-skia` 2.13.1, `react-native-reanimated` 4.7.0, Expo 58, React Native 0.88.

## Where it started: a sky made of CSS

6pm's design is an HTML prototype. Its sky is a stack of absolutely positioned divs: a three-stop linear gradient, three radial "blooms" softened with `filter: blur()`, a sun with rings and a flare, an SVG `feTurbulence` grain tile with `mix-blend-mode: overlay`, a halftone made of a tiled `radial-gradient`, light leaks, a vignette, and per-theme extras. Every colour is computed for the minute of the day, and changes ease over one second.

CSS layer stacks don't port to views. Stacking a dozen full-screen blurred, blended views would melt the GPU and still not blend the way the browser does. Our technical decisions doc puts it in one line:

> Sky and atmosphere: `@shopify/react-native-skia`: gradients, blurred blooms, grain/halftone/rain as runtime shaders. 60/120 fps full-screen effects; CSS layer stacks do not port to views.

The shipped code is more conservative than "everything is a shader". Here is what actually runs.

## Colours: run the prototype's own logic

Before drawing anything, the colours have to match. Instead of re-implementing the prototype's palette maths, `tools/design/extract-prototype-logic.ts` extracts the prototype's look functions into a generated module, and `@6pm/theme` runs them with the chosen look injected as state:

```ts
// packages/theme/src/look-engine.ts
/** The colour tokens of one frame. */
export function paletteFor(input: FrameInput): Palette {
  return select(input.look, input.config).palette(input.hour, input.serious, input.look);
}
```

<!-- media: sky-day-clip -->

The design's oklch tints are converted to sRGB hex in code, which renders identically to the browser references. Same function, same numbers, no "close enough".

## One canvas, one array of numbers

`Sky` (`sky.tsx`) is a single `<Canvas>` with layers in prototype order:

```tsx
<Canvas style={StyleSheet.absoluteFill}>
  <Group transform={shrink}>
    <SkyGradient frame={frame} width={width} height={height} />
    <LivingBackdrop {...scene} />
    <AtmBoxes raw={current.atm.back} {...boxes} />
    {shown.blooms && <SkyBlooms {...props} />}
    {/* sun, flare, moon, bokeh, halftone, leak, weather, scenes, vignette */}
    {shown.grain && <SkyGrain {...props} />}
    <WeatherTop {...scene} />
  </Group>
</Canvas>
```

<!-- media: diagram-sky -->

The interesting part is `frame`. Everything on the sky that changes with the hour (gradient stops, bloom colours, sun opacity, halftone ink, grain strength) is packed into one flat `number[]`, with colours taking four slots (`sky-slots.ts`). A new hour is then a single UI-thread tween of that array, the equivalent of CSS's `transition: 1s`:

```ts
// apps/mobile/src/ui/sky/use-switched-tween.ts (trimmed)
useAnimatedReaction(
  () => (flag.value ? onValues.value : offValues.value),
  (target, previous) => {
    if (previous === null) {
      shared.value = target;
      return;
    }
    shared.value = reduced.value ? target : withTiming(target, TRANSITION);
  },
);
```

Two prepared states (sun shown on Today, hidden on other tabs) live on the UI thread, so a tab switch tweens the sky without a single React render. Each layer reads its slots with `useDerivedValue`, and Skia picks up shared values directly as props.

Layers whose strength is zero for the current look and hour are unmounted (`useShown` keeps one for an extra second so it can fade out), so a frame only pays for what is visible.

## Blooms: bake the blur into the gradient

The prototype's blooms are radial gradients blurred with `filter: blur()`. A live Gaussian blur on three full-screen layers every frame is exactly what we wanted to avoid.

The observation that makes it free: blurring a radially symmetric shape keeps it radially symmetric. So the blurred result is itself a radial gradient, and we can compute its alpha profile once, ahead of time:

```ts
// apps/mobile/src/ui/sky/blur-profile.ts (trimmed)
// In polar form the 2-D Gaussian blur of a radial f is the Hankel-type integral
// g(r) = ∫ f(ρ)·(ρ/σ²)·exp(−(r−ρ)²/2σ²)·[e^(−x)·I₀(x)] dρ with x = rρ/σ² (Simpson's rule).
const blurredAt = (r: number) => {
  let sum = 0;
  for (let i = 0; i <= STEPS; i++) {
    const rho = i * h;
    const weight = i === 0 || i === STEPS ? 1 : i % 2 === 1 ? 4 : 2;
    const kernel =
      (rho / s2) * Math.exp(-((r - rho) ** 2) / (2 * s2)) * scaledBesselI0((r * rho) / s2);
    sum += weight * alpha(rho) * kernel;
  }
  return (sum * h) / 3;
};
```

`scaledBesselI0` is the exponentially scaled modified Bessel function, from the Abramowitz and Stegun polynomial approximations, so it doesn't overflow for large arguments. The profile is sampled as 32 stops out to `support + 3.5σ` and memoised per look. At draw time a bloom is a plain `<RadialGradient>` whose colours come from the frame array and whose position drifts with the clock. All three blooms composite in one full-screen pass, then blend onto the sky (screen after dark, multiply by day) like the prototype's bloom container. It has unit tests (`blur-profile.test.ts`).

The base gradient itself is drawn with `dither`, because a night sky spans only a dozen 8-bit steps over the whole screen and bands without it.

## Halftone: a real runtime shader

The halftone band is a tiled `radial-gradient(circle, dot 0.9px, transparent 1.5px)` under a linear mask. This is a natural fit for a runtime effect, written in SkSL:

```ts
// apps/mobile/src/ui/sky/sky-halftone.tsx
const HALFTONE = Skia.RuntimeEffect.Make(`
uniform float4 ink;
uniform float cell;
uniform float height;

half4 main(float2 p) {
  float2 q = mod(p, cell) - 0.5 * cell;
  float coverage = clamp((1.5 - length(q)) / 0.6, 0.0, 1.0);
  float y = p.y / height;
  float mask = y < 0.45 ? y / 0.45 : (y < 0.6 ? 1.0 : (1.0 - y) / 0.4);
  float a = ink.a * coverage * clamp(mask, 0.0, 1.0);
  return half4(ink.rgb * a, a);
}
`);
```

The `ink` uniform comes straight from the frame array through `useDerivedValue`, so the dots change colour with the hour on the UI thread. Note the premultiplied return: Skia expects premultiplied colour from a shader.

The other runtime effects live in `scenes/boxes/box-fill.tsx`: one repeats a child shader on a grid (CSS `background-repeat`), and one applies an SVG `feColorMatrix` to noise in straight (unpremultiplied) colour, which is how two looks get their speckle and brush textures.

## Grain: same noise as the browser, drawn once

The prototype's grain is an SVG `feTurbulence` tile. Skia's `FractalNoise` is the same algorithm, so with the same frequency, octaves, seed and stitch size it produces the same grain. The subtle part is stitching: SVG's filter region overhangs the 180 pt tile by 10% on each side, so the stitch size is 216, not 180. And `feTurbulence` runs in linearRGB, hence `LinearToSRGBGamma`:

```tsx
// apps/mobile/src/ui/sky/sky-grain.tsx (trimmed)
const TILE = 180;
const STITCH = 216;

useTexture(
  <Group transform={[{ scale }]}>
    <Rect x={0} y={0} width={TILE} height={TILE}>
      <FractalNoise freqX={0.85} freqY={0.85} octaves={2} seed={0}
                    tileWidth={STITCH} tileHeight={STITCH} />
      <LinearToSRGBGamma />
    </Rect>
  </Group>,
  { width: Math.round(TILE * scale), height: Math.round(TILE * scale) },
  [scale],
);
```

So grain is not computed per frame at all: the tile is rendered once at the screen's pixel density and repeated with an `ImageShader`. The prototype's stepped `grain` animation jumps between three offsets every 0.8 s, and the canvas only redraws when the step changes:

```tsx
// Only a new step moves the grain: the canvas stays idle between steps when nothing else moves.
useAnimatedReaction(
  () => grainStep(time.value),
  (step, previous) => {
    if (step !== previous) stepAt.value = time.value;
  },
);
```

## Rain: bake the strokes, slide the texture

Rain in the prototype is a tilted, oversized layer with an SVG stroke tile, one sharp and fast, one bigger, blurred and slower. Stroking and blurring a screenful of lines every frame on the CPU is not an option. So each layer's tile is painted once into an offscreen `Skia.Surface`, blur included, and drawn as a repeating image:

```ts
// apps/mobile/src/ui/sky/scenes/weather/rain-bake.ts (trimmed)
const surface = Skia.Surface.Make(pixels[0], pixels[1]);
const canvas = surface.getCanvas();
for (const group of strokeGroups(tile)) {
  const path = Skia.Path.Make();
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      for (const s of group.strokes) {
        path.moveTo(dx * tile.width + s.x, dy * tile.height + s.y);
        path.lineTo(dx * tile.width + s.x, dy * tile.height + s.y + s.length);
      }
    }
  }
  // ... stroke paint, plus a blur mask filter for the soft layer
  canvas.drawPath(path, paint);
}
surface.flush();
const baked = { image: surface.makeImageSnapshot(), pixels };
```

The 3×3 loop paints each stroke in the neighbouring cells too, so strokes and blur that cross an edge wrap around and the tile repeats without a seam. Baked tiles are cached by tile, size, blur and scale. Per frame, the only work is a transform: the layer is rotated about the screen centre and its offset slides down, looping.

## The living scenes

Three premium looks have scenes that respond to the phone itself:

- **Long Exposure** adds a warm radial band across the horizon on top of its sky gradient, and its star trails are rings masked by conic gradients whose arc grows with an "exposure" value (`calc(var(--exp, 1) * 18.3deg + 0.4deg)` in the prototype's CSS, parsed into `k × exp + c` in `box-css.ts` and evaluated in a worklet).
- **Paper Diorama** is layers of cut-paper hills. Each layer casts a drop shadow from the union of its pieces (`PathOp`), so overlapping hills shade once, and the shadow shifts with tilt.
- **Lantern River** hangs two catenary wires of 25 bulbs each, with five silk lanterns swinging from each wire, over a river cut into 2 pt lines that ripple.

The motion comes from `useAnimatedSensor(SensorType.GRAVITY)`. A small worklet converts gravity into the browser's `deviceorientation` angles the prototype was written against, eases the tilt in, tracks stillness, and drives a damped pendulum:

```ts
// apps/mobile/src/ui/sky/scenes/boxes/scene-motion.tsx (trimmed)
const gamma = (Math.asin(Math.max(-1, Math.min(1, g.x / n))) * 180) / Math.PI;
const beta = (Math.atan2(-g.y, -g.z) * 180) / Math.PI;
const tx = clamp1(gamma / 28);
const ty = clamp1((beta - 45) / 28);
s.cx += (tx - s.cx) * 0.09;
// stillness builds while the phone is held still and any movement spends it
motion.exp.value += (0.12 + 0.88 * s.still - motion.exp.value) * 0.12;
s.pendV += (-s.cx * 22 - motion.pend.value) * 0.016;
s.pendV *= 0.965;
motion.pend.value += s.pendV;
```

Hold the phone still and the long exposure "develops"; tilt it and the lanterns swing. The driver is only mounted for a premium look with its "sense" switch on, outside serious mode and outside previews.

## About that 120

The honest version of the title: the canvas can redraw at the display's full rate, and does when you scroll (the sun, flare, halftone and bokeh move with the list at their own parallax rates, every frame). But the slow motion does not need 120 updates a second, so the sky's clock deliberately steps:

```ts
// apps/mobile/src/ui/sky/sky.tsx
/** The sky's slow drifts step 30 times a second; falling rain needs 60 to read as a fall. */
const DRIFT_STEP_MS = 1000 / 30;
const RAIN_STEP_MS = 1000 / 60;
```

`useSkyClock` accumulates frame time on the UI thread and only advances when a step is due, so every layer driven by `time` is recomputed and redrawn only on a step. Drifts, pulses and twinkles look the same at 30 steps a second, and when nothing is scrolling most display frames draw nothing new.

The clock is also gated. `useGatedFrameCallback` really stops the frame callback (`setActive(false)`) when the screen isn't showing: another tab, a full-screen takeover, or the app in the background. Nothing wakes the UI thread for a sky nobody can see. Under Reduce Motion the clock stays at zero, which freezes every drift, twinkle and grain step on its first frame.

## FAQ

### Can React Native Skia run custom shaders?

Yes. `Skia.RuntimeEffect.Make` compiles SkSL, and a `<Shader>` with uniforms from a Reanimated `useDerivedValue` updates on the UI thread without React renders.

### How do you get a cheap Gaussian blur in Skia on mobile?

Avoid a live blur where you can. For a radially symmetric shape, compute the blurred radial profile once and draw it as gradient stops; for textures like rain, paint the blur into an offscreen surface once and repeat the image.

### Does an animated background drain the battery?

It costs more than a static one, so 6pm steps slow motion at 30 Hz, stops the frame callback whenever the sky isn't visible, and freezes it under Reduce Motion. We have not published battery measurements.

## Try it

The sky is open source under Apache 2.0: [github.com/at6pm/6pm](https://github.com/at6pm/6pm) (start at `apps/mobile/src/ui/sky/sky.tsx`). Watch it shift through the day in the public beta on TestFlight: [testflight.apple.com/join/a8UrvT5P](https://testflight.apple.com/join/a8UrvT5P). 6pm arrives on the App Store on Friday 6 November 2026 at 18:00 ICT (6:00 a.m. Eastern). More at [at6pm.app](https://at6pm.app).
