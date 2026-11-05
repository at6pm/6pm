import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, { Easing, Keyframe, useReducedMotion } from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { SheetFrame } from '../../ui/navigation/sheet-frame';
import { requestDiaryTab } from '../today/diary-request';
import { ImportBox } from './import-box';
import { ImportBring } from './import-bring';
import { ImportColumns } from './import-columns';
import { ImportGuide } from './import-guide';
import { ImportLabels } from './import-labels';
import { ImportHeader } from './import-parts';
import { ImportOpening, ImportPassword } from './import-password';
import { useRemovedImports } from './import-undo';
import { pickImportFile, readImportFile } from './open-file';
import { useImportFlow, type ImportStep } from './use-import-flow';

const enter = Easing.bezier(...curves.enter);

/** A step arriving: it slides in 24 pt from the side it comes from and fades up, 380 ms. */
function stepIn(direction: 1 | -1) {
  return new Keyframe({
    0: { opacity: 0, transform: [{ translateX: 24 * direction }] },
    100: { opacity: 1, transform: [{ translateX: 0 }], easing: enter },
  }).duration(380);
}

const ORDER: Readonly<Record<ImportStep['kind'], number>> = {
  guide: 0,
  opening: 1,
  password: 1,
  columns: 2,
  box: 3,
  labels: 4,
  bring: 5,
};

/** The bring-in's sheet: one header and one step at a time. */
export function ImportFlowView({
  onboarding,
  uri,
  onClose,
}: {
  readonly onboarding: boolean;
  readonly uri: string | null;
  readonly onClose: () => void;
}) {
  const { t } = useI18n();
  const { today } = useMoney();
  const flow = useImportFlow();
  const reduceMotion = useReducedMotion();
  const [removed, markRemoved] = useRemovedImports();
  const { step, setStep, open } = flow;
  const last = useRef(step.kind);
  const direction: 1 | -1 = ORDER[step.kind] >= ORDER[last.current] ? 1 : -1;
  useEffect(() => {
    last.current = step.kind;
  }, [step.kind]);

  // A file shared into 6pm (or put there by a developer command) opens at once.
  const sharedOpened = useRef(false);
  useEffect(() => {
    if (uri === null || sharedOpened.current) return;
    sharedOpened.current = true;
    readImportFile(uri).then(open, () => setStep({ kind: 'guide', error: 'damaged' }));
  }, [open, setStep, uri]);

  const pick = () => {
    void pickImportFile().then(
      (file) => {
        if (file) open(file);
      },
      () => setStep({ kind: 'guide', error: 'damaged' }),
    );
  };
  const ext = flow.file?.name.toLowerCase().endsWith('.csv') ? 'CSV' : 'XLSX';
  const back = () => setStep({ kind: 'box' });

  const header = (() => {
    switch (step.kind) {
      case 'guide':
      case 'opening':
      case 'password':
        return <ImportHeader title={t('import.row.title')} left="cancel" onLeft={onClose} />;
      case 'columns':
        return <ImportHeader title={t('import.columns.title')} left="cancel" onLeft={onClose} />;
      case 'box':
        return (
          <ImportHeader
            title={t('import.box.title')}
            left="cancel"
            onLeft={onClose}
            right={t('import.box.step', { n: 1, total: 3 })}
          />
        );
      case 'labels':
        return (
          <ImportHeader
            title={t('import.labels.title')}
            left="back"
            onLeft={back}
            right={t('import.box.step', { n: 2, total: 3 })}
          />
        );
      case 'bring':
        return (
          <ImportHeader
            title={t('import.row.title')}
            left={flow.progress.state === 'busy' ? null : 'cancel'}
            onLeft={onClose}
            right={t('import.box.step', { n: 3, total: 3 })}
          />
        );
    }
  })();

  const body = (() => {
    switch (step.kind) {
      case 'guide':
        return (
          <ImportGuide error={step.error} onPick={pick} removed={removed} onRemoved={markRemoved} />
        );
      case 'opening':
        return <ImportOpening locked={step.locked} />;
      case 'password':
        return <ImportPassword wrong={step.wrong} onUnlock={flow.unlock} />;
      case 'columns':
        return flow.sheet && flow.plan ? (
          <ImportColumns
            sheet={flow.sheet}
            header={flow.plan.header}
            roles={step.roles}
            lines={flow.lines}
            onRead={flow.readColumns}
          />
        ) : null;
      case 'box':
        return flow.summary ? (
          <ImportBox
            summary={flow.summary}
            app={flow.app}
            ext={ext}
            onNext={() => setStep({ kind: 'labels' })}
          />
        ) : null;
      case 'labels':
        return flow.summary ? (
          <ImportLabels
            labels={flow.summary.labels}
            choices={flow.choices}
            categories={flow.categories}
            lines={flow.summary.rows.length}
            onChoose={flow.choose}
            onBringIn={() => void flow.start()}
          />
        ) : null;
      case 'bring':
        return flow.summary ? (
          <ImportBring
            rows={flow.summary.rows}
            progress={flow.progress}
            today={today}
            onboarding={onboarding}
            onDiary={() => {
              onClose();
              if (!onboarding) requestDiaryTab();
            }}
            onRetry={() => void flow.start()}
          />
        ) : null;
    }
  })();

  return (
    <SheetFrame header={header}>
      <Animated.View
        key={step.kind}
        {...(reduceMotion ? {} : { entering: stepIn(direction) })}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>{body}</View>
      </Animated.View>
    </SheetFrame>
  );
}
