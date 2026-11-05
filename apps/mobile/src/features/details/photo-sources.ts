import { Camera } from 'expo-camera';
import { File, Paths } from 'expo-file-system';
import { Linking } from 'react-native';

import { scanCamera } from '../../../modules/scan-camera';
import type { MenuAction } from '../../ui/primitives/action-menu';

/** Where a spend's photo comes from: the camera, or a picture already in Photos. */
export type PhotoSource = 'camera' | 'photos';

/** Whether this phone has a camera to take the photo with (the simulator has none). */
export function canTakePhoto(): boolean {
  return scanCamera?.canTakePhoto() ?? false;
}

/** The menu's lines: "Take a photo" only where there is a camera. */
export function photoActions(labels: {
  readonly camera: string;
  readonly photos: string;
}): MenuAction[] {
  return [
    ...(canTakePhoto()
      ? [{ key: 'camera', label: labels.camera, systemImage: 'camera' } as const]
      : []),
    { key: 'photos', label: labels.photos, systemImage: 'photo.on.rectangle' },
  ];
}

/** The camera was turned off for 6pm in Settings: the photo cannot be taken until it is back. */
export class CameraOff extends Error {
  constructor() {
    super('The camera is off for 6pm');
    this.name = 'CameraOff';
  }
}

/**
 * Puts the picture at `uri` at its kept size, from the system camera or the Photos picker; false
 * when none was taken or picked. The camera asks the same permission Scan does, once; Photos
 * needs none (its picker runs outside 6pm and hands over only the picture chosen).
 */
export async function photoInto(source: PhotoSource, uri: string): Promise<boolean> {
  const native = scanCamera;
  if (!native) return false;
  if (source === 'photos') return (await native.pickPhoto(uri)) !== null;
  const permission = await Camera.getCameraPermissionsAsync();
  const granted = permission.granted || (await Camera.requestCameraPermissionsAsync()).granted;
  if (!granted) throw new CameraOff();
  return (await native.takePhoto(uri)) !== null;
}

/**
 * Where a photo clipped on before its spend exists (Quick add) waits: the caches, a new name each
 * time so the image shown is never an earlier one.
 */
export function waitingPhotoUri(now: number = Date.now()): string {
  return new File(Paths.cache, `waiting-photo-${now.toString(36)}.jpg`).uri;
}

/** Lets a waiting photo go once it is kept with its spend, or was never used. */
export function dropWaitingPhoto(uri: string): void {
  const file = new File(uri);
  if (file.exists) file.delete();
}

/** Opens 6pm's page in Settings, where the camera is turned back on. */
export function openCameraSettings(): void {
  void Linking.openSettings();
}
