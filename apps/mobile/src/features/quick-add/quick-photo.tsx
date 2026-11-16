import {
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Image } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves, durations, photoInk, quickAddInk } from '@6pm/theme';

import { keepPhotoAt } from '../../data/device-photo-files';
import { useMoneyActions } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { PhotoClip } from '../../ui/photo/photo-clip';
import { PressScale } from '../../ui/primitives/press-scale';
import { useToast } from '../../ui/toast/toast-host';
import {
  CameraOff,
  dropWaitingPhoto,
  photoActions,
  photoInto,
  waitingPhotoUri,
} from '../details/photo-sources';
import { PhotoViewer, type PrintFrame } from '../details/photo-viewer';

/** The print behind the ticket's top-right corner: 58 × 74, turned 8°, its top 40 pt above the edge. */
const PRINT_WIDTH = 58;
const PRINT_HEIGHT = 74;
const TURN = 8;
/** The print's top shows this far above the ticket's torn edge. */
const PRINT_RISE = 40;
/**
 * How far the ticket moves down to give the print's top its room: the sheet's body starts 14 pt
 * above the ticket and clips what rises past it, so the print's 40 pt and its turn need 28 more.
 */
const PRINT_ROOM = 28;

/**
 * The photo clipped on before its spend exists. It waits in the caches; Keep it hands it to the
 * spend (`keepWith`), and Quick add closed without keeping lets it go.
 */
export function useWaitingPhoto(saving: RefObject<boolean>) {
  const { t } = useI18n();
  const toast = useToast();
  const actions = useMoneyActions();
  const [photo, setPhoto] = useState<string | null>(null);
  const waiting = useRef<string | null>(null);
  waiting.current = photo;
  useEffect(
    () => () => {
      if (waiting.current !== null && !saving.current) dropWaitingPhoto(waiting.current);
    },
    [saving],
  );
  const failed = (error: unknown) =>
    toast(t(error instanceof CameraOff ? 'photo.cameraOff' : 'photo.failed'));
  return {
    photo,
    pick: (key: string) => {
      const uri = waitingPhotoUri();
      photoInto(key === 'camera' ? 'camera' : 'photos', uri)
        .then((got) => {
          if (!got) return;
          if (waiting.current !== null) dropWaitingPhoto(waiting.current);
          setPhoto(uri);
        })
        .catch(failed);
    },
    /** Takes the photo off again before Keep it. */
    drop: () => {
      if (waiting.current !== null) dropWaitingPhoto(waiting.current);
      setPhoto(null);
    },
    keepWith: (spendId: string) => {
      const from = waiting.current;
      if (from === null) return;
      void actions
        .attachPhoto(spendId, (to) => keepPhotoAt(from, to).then(() => true))
        .catch(failed)
        .finally(() => dropWaitingPhoto(from));
    },
  };
}

const drop = {
  duration: durations.photoDrop,
  easing: Easing.bezier(...curves.photoClip),
  reduceMotion: ReduceMotion.System,
};

/**
 * The ticket with a photo clipped behind its top-right corner. Attached, the print drops in from
 * above the sheet, swings to +8° and slides behind the ticket's edge while the ticket makes room
 * for its top; the clip lands last with a light tap. Tapped, the print opens large, where it can
 * be replaced or taken off. It never covers the ticket's header.
 */
export function TicketWithPrint({
  photo,
  onPick,
  onDrop,
  title,
  subtitle,
  children,
}: {
  /** The photo clipped on so far (a `file://` URI), or null. */
  readonly photo: string | null;
  readonly onPick: (key: string) => void;
  readonly onDrop: () => void;
  /** The full view's header: what the ticket says so far. */
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
}) {
  const { t } = useI18n();
  const print = useRef<ComponentRef<typeof Animated.View>>(null);
  const [viewing, setViewing] = useState<PrintFrame | null>(null);
  const landed = useSharedValue(photo === null ? 0 : 1);
  const room = useSharedValue(photo === null ? 0 : 1);
  const shown = useRef(photo);
  useEffect(() => {
    if (photo === shown.current) return;
    shown.current = photo;
    room.set(withTiming(photo === null ? 0 : 1, drop));
    if (photo === null) {
      landed.set(0);
      return;
    }
    landed.set(0);
    landed.set(withTiming(1, drop));
    const felt = setTimeout(() => haptics.tap(), durations.photoDrop);
    return () => clearTimeout(felt);
  }, [photo, landed, room]);

  const roomStyle = useAnimatedStyle(() => ({ marginTop: PRINT_ROOM * room.get() }));
  const fallIn = useAnimatedStyle(() => {
    const p = landed.get();
    return {
      opacity: Math.min(1, p * 1.6),
      transform: [{ translateY: (1 - p) * -90 }, { rotate: `${TURN - (1 - p) * 12}deg` }],
    };
  });
  const clipIn = useAnimatedStyle(() => ({ opacity: Math.max(0, landed.get() * 2 - 1) }));

  const openViewer = () => {
    haptics.tap();
    print.current?.measureInWindow((x, y, width, height) =>
      setViewing({ x, y, width, height, rotate: TURN }),
    );
  };

  return (
    <Animated.View style={roomStyle}>
      {photo !== null ? (
        <Animated.View
          ref={print}
          collapsable={false}
          style={[
            {
              position: 'absolute',
              right: 20,
              top: -PRINT_RISE,
              width: PRINT_WIDTH,
              height: PRINT_HEIGHT,
              opacity: viewing ? 0 : 1,
            },
            fallIn,
          ]}
        >
          <PressScale
            accessibilityRole="imagebutton"
            accessibilityLabel={t('photo.open')}
            scaleTo={0.96}
            onPress={openViewer}
            style={{
              flex: 1,
              borderWidth: 3,
              borderBottomWidth: 9,
              borderColor: photoInk.frame,
              backgroundColor: photoInk.frame,
              boxShadow: quickAddInk.printShadow,
              overflow: 'hidden',
            }}
          >
            <Image source={{ uri: photo }} resizeMode="cover" style={{ flex: 1 }} />
          </PressScale>
        </Animated.View>
      ) : null}
      {children}
      {photo !== null && !viewing ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', right: 38, top: -PRINT_RISE + 6 }, clipIn]}
        >
          <PhotoClip size={26} rotate={TURN} />
        </Animated.View>
      ) : null}
      {viewing && photo ? (
        <PhotoViewer
          uri={photo}
          from={viewing}
          title={title}
          subtitle={subtitle}
          replaceActions={photoActions({ camera: t('photo.take'), photos: t('photo.choose') })}
          onReplace={onPick}
          onRemove={() => {
            setViewing(null);
            onDrop();
          }}
          onClosed={() => setViewing(null)}
        />
      ) : null}
    </Animated.View>
  );
}
