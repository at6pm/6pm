import {
  FilterMode,
  ImageFormat,
  makeImageFromView,
  MipmapMode,
  Skia,
  type SkCanvas,
  type SkImage,
} from '@shopify/react-native-skia';
import type { ComponentRef, RefObject } from 'react';
import { PixelRatio, type View } from 'react-native';

/**
 * A view as it is drawn on screen, at the screen's own density (3× on every iPhone 6pm runs on),
 * Skia canvases and blend modes included. iOS sizes the image by the view's frame, so the view
 * must carry no transform of its own: tilt or move a parent instead.
 */
export async function captureView(
  ref: RefObject<ComponentRef<typeof View> | null>,
): Promise<SkImage> {
  // Skia reads the native tag off whatever the ref holds; its type predates host-instance refs.
  const image = await makeImageFromView(ref as unknown as RefObject<number | null>);
  if (!image) throw new Error('The view could not be drawn');
  return image;
}

/** Draws into a fresh bitmap of `width` × `height` points at the screen's density. */
export function drawImage(
  width: number,
  height: number,
  draw: (canvas: SkCanvas, scale: number) => void,
): SkImage {
  const scale = PixelRatio.get();
  const surface = Skia.Surface.Make(Math.round(width * scale), Math.round(height * scale));
  if (!surface) throw new Error('No room to draw the image');
  draw(surface.getCanvas(), scale);
  surface.flush();
  return surface.makeImageSnapshot();
}

/** The captured image without its last `points` (a view's empty bottom padding). */
export function trimBottom(image: SkImage, points: number): SkImage {
  const scale = PixelRatio.get();
  const width = image.width() / scale;
  const height = image.height() / scale - points;
  return drawImage(width, height, (canvas) => {
    canvas.drawImage(image, 0, 0);
  });
}

/**
 * The image at exactly `width` × `height` pixels, whatever the screen's density: a card laid out
 * at 360 pt is shared at 1080 px on a 2× phone too. An image already that size comes back as is.
 */
export function atPixels(image: SkImage, width: number, height: number): SkImage {
  if (image.width() === width && image.height() === height) return image;
  const surface = Skia.Surface.Make(width, height);
  if (!surface) throw new Error('No room to draw the image');
  surface
    .getCanvas()
    .drawImageRectOptions(
      image,
      Skia.XYWHRect(0, 0, image.width(), image.height()),
      Skia.XYWHRect(0, 0, width, height),
      FilterMode.Linear,
      MipmapMode.Linear,
    );
  surface.flush();
  return surface.makeImageSnapshot();
}

export function encodePng(image: SkImage): Uint8Array {
  return image.encodeToBytes(ImageFormat.PNG, 100);
}
