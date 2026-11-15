import { useEffect, useState } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { captureRowReportText, eventsOfRow, type SpendRow } from '@6pm/domain';

import type { Joined, Split, WitnessLine } from '../../data/capture-answers';
import { deviceCaptureLog, sendRowReport } from '../../data/device-capture-log';
import { useMoney, useMoneyActions } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { easeInOut } from '../../ui/motion/curves';
import { useToast } from '../../ui/toast/toast-host';
import type { useOfferUndo } from '../../ui/undo/undo-host';
import { useRunAction } from '../companion/use-run-action';
import { useSpendLabels } from '../today/use-spend-rows';
import { RulePrompt } from './rule-prompt';
import { SourceTrail } from './source-trail';
import { witnessLabel } from './witness-label';

/** The trail moves as the offer comes and goes, instead of jumping. */
const reflow = LinearTransition.duration(200).easing(easeInOut);

/**
 * Where a spend came from, and what the person can say about it: "Same as your 50k at 10:30?"
 * on a caught payment that looks like one they typed; on a merged row, who saw it ("Seen by MB
 * alert 10:31 · Shopee receipt 10:34") and "These are two"; on any row, "This is wrong", which
 * hands the row's sightings to the share sheet and nowhere else.
 */
export function CaptureTrail({
  spend,
  offerUndo,
  onGone,
}: {
  readonly spend: SpendRow;
  readonly offerUndo: ReturnType<typeof useOfferUndo>;
  /** The spend joined the one the person typed and is gone: close the sheet. */
  readonly onGone: () => void;
}) {
  const { t } = useI18n();
  const { today } = useMoney();
  const actions = useMoneyActions();
  const run = useRunAction();
  const toast = useToast();
  const money = useMoneyFormat();
  const labels = useSpendLabels();
  // Read again whenever the row changes: a merge, a split, a join.
  const [witnesses, setWitnesses] = useState<readonly WitnessLine[]>([]);
  const [twin, setTwin] = useState<SpendRow | null>(null);
  const [sending, setSending] = useState(false);
  const { id, updatedAt } = spend;
  useEffect(() => {
    let live = true;
    Promise.all([actions.witnesses(id), actions.typedTwin(id)])
      .then(([lines, typed]) => {
        if (!live) return;
        setWitnesses(lines);
        setTwin(typed);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [actions, id, updatedAt]);

  const merged = witnesses.length > 1;
  const lines = merged
    ? [
        t('details.seenBy', {
          list: witnesses.map((w) => witnessLabel(w, t, labels.time(w.at))).join(' · '),
        }),
        ...witnesses.flatMap((w) =>
          w.detail && w.source === 'email' ? [`${labels.time(w.at)} · ${w.detail}`] : [],
        ),
      ]
    : [
        spend.detail,
        t('details.added', {
          time: labels.time(spend.createdAt),
          source: labels.source(spend.source),
        }),
      ].filter((line): line is string => Boolean(line));

  const split = () => {
    haptics.tap();
    let done: Split | null = null;
    void run(async () => {
      done = await actions.splitApart(id);
    }).then(() => {
      if (!done) return;
      const split = done;
      offerUndo(t('details.splitUndo'), t('undo.action'), () => {
        void run(() => actions.undoSplitApart(split));
      });
    });
  };

  const report = () => {
    if (sending) return;
    haptics.tick();
    setSending(true);
    (async () => {
      const found = await actions.captureReport(id);
      if (!found) return;
      const log = await deviceCaptureLog.read().catch(() => null);
      const text = captureRowReportText(
        {
          row: found.row,
          sightings: found.sightings.map((sighting) => ({ ...sighting })),
          events: log ? eventsOfRow(log.events, found.ids) : [],
        },
        new Date(),
      );
      await sendRowReport(today, text);
    })()
      .catch(() => toast(t('details.reportFailed')))
      .finally(() => setSending(false));
  };

  const same = (typed: SpendRow) => {
    setTwin(null);
    let joined: Joined | null = null;
    void run(async () => {
      joined = await actions.sameAsTyped(id, typed.id);
    }).then(() => {
      if (!joined) return;
      const done = joined;
      offerUndo(t('twin.undo', { name: typed.merchant }), t('undo.action'), () => {
        void run(() => actions.undoSameAsTyped(done));
      });
      onGone();
    });
  };

  return (
    <Animated.View layout={reflow} style={{ gap: 12 }}>
      {twin ? (
        <RulePrompt
          text={t('twin.ask', { amount: money.short(twin.amount), time: labels.time(twin.at) })}
          once={t('twin.no')}
          always={t('twin.same')}
          onOnce={() => {
            setTwin(null);
            void run(() => actions.notSameAsTyped(id, twin.id));
          }}
          onAlways={() => same(twin)}
        />
      ) : null}
      <SourceTrail
        title={t('details.sourceTrail')}
        lines={lines}
        actions={[
          ...(merged ? [{ label: t('details.theseAreTwo'), onPress: split }] : []),
          { label: t('details.thisIsWrong'), onPress: report },
        ]}
      />
    </Animated.View>
  );
}
