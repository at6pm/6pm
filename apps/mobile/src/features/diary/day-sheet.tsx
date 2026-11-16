import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
  LinearTransition,
} from 'react-native-reanimated';

import type { LocalDate } from '@6pm/domain';

import { notDailyOf, readDayRecords, useStoreQuery } from '../../data/diary-queries';
import { useMoneyActions, useMoneySelector } from '../../data/money-provider';
import type { MoneySnapshot, MoneyStore } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { easeInOut } from '../../ui/motion/curves';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { useTheme } from '../../ui/theme/theme';
import { body, mono, tabular } from '../../ui/type/fonts';
import { useOfferUndo } from '../../ui/undo/undo-host';
import { useRunAction } from '../companion/use-run-action';
import { SpendRow } from '../today/spend-row';
import { useFromJarLabel, useSpendLabels } from '../today/use-spend-rows';
import { dayRecordsOf, dayRowViews } from './day-records';
import { useDiaryDates } from './diary-dates';
import { jarLinesOf } from './jar-lines';

/** The card closing up as a row leaves it, as Today's list does. */
const rowLayout = LinearTransition.duration(200).easing(easeInOut);
const cardLayout = LinearTransition.springify().damping(22).stiffness(240);
const rowExit = FadeOut.duration(150);
const lineEnter = FadeIn.duration(200);
const totalIn = FadeIn.duration(200);
/** The jar lines sit under the rows' text: 16 pt inset, a 38 pt tile, a 12 pt gap. */
const TEXT_INSET = 66;

const categoriesOf = (snap: MoneySnapshot) => snap.categories;

/**
 * A filed day, opened from its Diary receipt: the date and total as the receipt prints them, then
 * every record of the day as Today lists its own. A tap opens a record's Details, where its
 * amount, category and name change and it can be deleted; a left swipe deletes it with an undo.
 * Payments voided since show struck through and do nothing. Nothing is added to a past day here.
 */
export function DaySheet({ day }: { readonly day: LocalDate }) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const dates = useDiaryDates();
  const labels = useSpendLabels();
  const fromJar = useFromJarLabel();
  const categories = useMoneySelector(categoriesOf);
  const actions = useMoneyActions();
  const run = useRunAction();
  const offerUndo = useOfferUndo();
  // Follows every write, so an edit in Details or a delete here shows as the sheet comes back.
  const read = useCallback((store: MoneyStore) => readDayRecords(store, day), [day]);
  const data = useStoreQuery(read);
  const notDaily = useMemo(() => notDailyOf({ categories }), [categories]);

  const records = data ? dayRecordsOf(data, notDaily) : null;
  const views =
    data && records
      ? dayRowViews(records, data.givenBack, categories, labels, {
          back: (d) => t('moneyIn.diary.back', { date: dates.dayMonth(d).toLocaleUpperCase() }),
          voided: (why) => t(why === 'failed' ? 'diary.voided.failed' : 'diary.voided.reversal'),
        })
      : null;
  const jarLines = records ? jarLinesOf(records.kept, notDaily, fromJar) : [];

  const open = (id: string) => router.push(`/spend/${id}`);
  const remove = (id: string) => {
    const name = records?.records.find((s) => s.id === id)?.merchant ?? '';
    void run(() => actions.setStatus(id, 'deleted')).then((saved) => {
      if (!saved) return;
      offerUndo(
        t('undo.deleted', { name }),
        t('undo.action'),
        () => void run(() => actions.undo(id)),
      );
    });
  };
  const confirm = (id: string) => void run(() => actions.setStatus(id, 'kept'));

  return (
    <SheetScreen title={t('diary.day.title')} gap={10} fit>
      {records && views && data ? (
        // Rows fade in only when they come later, never as the sheet opens.
        <LayoutAnimationConfig skipEntering>
          <View style={{ paddingHorizontal: 6, gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...mono(12, 600, 0.12), color: palette.inkSoft }}>
                {dates.stamp(day)}
              </Text>
              {data.closed ? (
                <Text style={{ ...mono(12, 600, 0.12), color: palette.inkSoft, opacity: 0.55 }}>
                  {t('diary.receipt.no', { no: data.no })}
                </Text>
              ) : null}
            </View>
            <View
              accessible
              accessibilityLabel={`${t('close.receipt.total')} ${money.full(records.total)}`}
              style={{ flexDirection: 'row', alignItems: 'baseline' }}
            >
              <Text style={{ ...mono(14, 600, 0.12), color: palette.ink, flex: 1 }}>
                {t('close.receipt.total')}
              </Text>
              <Animated.Text
                key={records.total}
                entering={totalIn}
                style={{ ...mono(14, 600), ...tabular, color: palette.ink }}
              >
                {money.full(records.total)}
              </Animated.Text>
            </View>
          </View>
          <Animated.View
            layout={cardLayout}
            style={{
              borderRadius: 26,
              backgroundColor: palette.cell,
              boxShadow: palette.cardShadow,
              overflow: 'hidden',
            }}
          >
            {views.rows.length === 0 && views.voided.length === 0 ? (
              <Animated.Text
                entering={lineEnter}
                style={{ ...body(15), lineHeight: 21.75, color: palette.inkSoft, padding: 18 }}
              >
                {t('diary.day.empty')}
              </Animated.Text>
            ) : null}
            {views.rows.map((row) => (
              <Animated.View key={row.id} layout={rowLayout} exiting={rowExit}>
                <SpendRow
                  row={row}
                  confirmLabel={t('today.row.confirm')}
                  deleteLabel={t('today.row.delete')}
                  editLabel={t('details.edit')}
                  photoLabel={t('photo.kept')}
                  onConfirm={confirm}
                  onDelete={remove}
                  onOpen={open}
                />
              </Animated.View>
            ))}
            {/* Under every spend: the lines add up to what the day counted, as on the receipt. */}
            {jarLines.map((line) => (
              <Animated.View
                key={`jar-${line.potId}`}
                layout={rowLayout}
                entering={lineEnter}
                exiting={rowExit}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginLeft: TEXT_INSET,
                  paddingRight: 16,
                  paddingVertical: 12,
                  borderTopWidth: 0.5,
                  borderTopColor: palette.hair,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ ...body(15, 500), color: palette.inkSoft, flex: 1, minWidth: 0 }}
                >
                  {line.label}
                </Text>
                <Text style={{ ...body(16, 600), ...tabular, color: palette.inkSoft }}>
                  {`−${money.full(line.amount)}`}
                </Text>
              </Animated.View>
            ))}
            {views.voided.map((row) => (
              <Animated.View key={`voided-${row.id}`} layout={rowLayout} exiting={rowExit}>
                <SpendRow
                  still
                  row={row}
                  confirmLabel={t('today.row.confirm')}
                  deleteLabel={t('today.row.delete')}
                  editLabel={t('details.edit')}
                  photoLabel={t('photo.kept')}
                  onConfirm={confirm}
                  onDelete={remove}
                  onOpen={open}
                />
              </Animated.View>
            ))}
          </Animated.View>
          {views.rows.length > 0 ? (
            <Animated.Text
              layout={rowLayout}
              style={{ ...body(13), color: palette.inkSoft, textAlign: 'center', paddingTop: 4 }}
            >
              {t('diary.day.hint')}
            </Animated.Text>
          ) : null}
        </LayoutAnimationConfig>
      ) : null}
    </SheetScreen>
  );
}
