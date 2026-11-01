import { useState } from 'react';

import { surfaces } from '../../../modules/surfaces';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { HomeStage } from './home-stage';
import type { WidgetPreview } from './preview-data';
import { SurfaceCard } from './surface-card';
import { TilesStage } from './tiles-stage';

/**
 * Where 6pm lives outside the app on Android: the Home screen widgets and the Quick Settings
 * tiles, each with the buttons that ask Android to add it (the launcher's sheet, the system's
 * tile dialog) where the phone offers them, and the steps by hand where it does not.
 */
export function AndroidSurfaces({
  preview,
  stageWidth,
}: {
  readonly preview: WidgetPreview;
  readonly stageWidth: number;
}) {
  const { t } = useI18n();
  // The tiles already in Quick Settings: their button says so (a toast would sit under the sheet).
  const [inShade, setInShade] = useState<ReadonlySet<'scan' | 'add'>>(new Set());
  const pin = (kind: 'safe' | 'today') => () => {
    haptics.tap();
    void surfaces?.pinWidget?.(kind).catch(() => false);
  };
  const tile = (kind: 'scan' | 'add') => () => {
    haptics.tap();
    void surfaces
      ?.addTile?.(kind)
      .then((result) => {
        if (result === 'added' || result === 'already') {
          haptics.success();
          setInShade((shown) => new Set(shown).add(kind));
        }
      })
      .catch(() => undefined);
  };
  const canPin = surfaces?.canPinWidgets?.() === true;
  const canTile = surfaces?.canAddTiles?.() === true;
  return (
    <>
      <SurfaceCard
        index={1}
        icon="widgets"
        title={t('widgetsGuide.home.title')}
        what={t('widgetsGuide.home.what')}
        stepsTitle={t('widgetsGuide.howToAdd')}
        steps={[
          t('widgetsGuide.home.step1'),
          t('widgetsGuide.home.step2'),
          t('widgetsGuide.home.step3'),
        ]}
        actions={
          canPin
            ? [
                { label: t('widgetsGuide.home.addSafe'), onPress: pin('safe') },
                { label: t('widgetsGuide.home.addToday'), onPress: pin('today') },
              ]
            : []
        }
      >
        <HomeStage preview={preview} width={stageWidth} />
      </SurfaceCard>

      <SurfaceCard
        index={2}
        icon="tune"
        title={t('widgetsGuide.tiles.title')}
        what={t('widgetsGuide.tiles.what')}
        stepsTitle={t('widgetsGuide.howToAdd')}
        steps={[
          t('widgetsGuide.tiles.step1'),
          t('widgetsGuide.tiles.step2'),
          t('widgetsGuide.tiles.step3'),
        ]}
        actions={
          canTile
            ? [
                {
                  label: t(
                    inShade.has('scan')
                      ? 'widgetsGuide.tiles.scanIn'
                      : 'widgetsGuide.tiles.addScan',
                  ),
                  onPress: tile('scan'),
                },
                {
                  label: t(
                    inShade.has('add')
                      ? 'widgetsGuide.tiles.quickAddIn'
                      : 'widgetsGuide.tiles.addQuickAdd',
                  ),
                  onPress: tile('add'),
                },
              ]
            : []
        }
      >
        <TilesStage width={stageWidth} />
      </SurfaceCard>
    </>
  );
}
