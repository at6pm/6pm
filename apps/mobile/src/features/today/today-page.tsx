import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedRef,
} from 'react-native-reanimated';

import { clockOf, hourOf, type DailyNumber } from '@6pm/domain';
import { inSentence, localeOf } from '@6pm/i18n';

import { useMoney, useMoneyActions } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useClock } from '../../ui/theme/clock';
import { useOfferUndo } from '../../ui/undo/undo-host';
import { useTheme } from '../../ui/theme/theme';
import { useRunAction } from '../companion/use-run-action';
import { useParkedClose } from '../close/close-session';
import { useHomePageShown } from '../home/home-page';
import { useHomePageScroll, useHomeScroll } from '../home/home-scroll';
import { PullDetector, useOverscrollPull } from '../home/overscroll-pull';
import { CompanionGreeting } from './companion-greeting';
import { requestDiaryDay } from './diary-request';
import { AlertsPausedCard } from './alerts-paused-card';
import { FirstCatchCard } from './first-catch-card';
import { PullToAdd, usePullToAdd } from './pull-to-add';
import { TodayHero } from './today-hero';
import { TodayList } from './today-list';
import { spreadYesterdayOf, todayView, type WeekDay } from './today-view';
import { useSpendLabels } from './use-spend-rows';
import { TonightCard } from './tonight-card';
import { useOpenAsk, useOpenSpend } from '../duo/spread-pane';
import { useTryingOn } from '../looks/look-settings-provider';
import { JarShelf } from '../pots/shelf';
import { YearOnToday } from '../sharing/year-on-today';
import { OwedRow } from '../owed/owed-row';
import { NewYearOfferCard } from '../pots/new-year-offer-card';
import { useNewYear } from '../pots/use-new-year';
import { HoaMai } from './hoa-mai';
import { AskReachCard, useAskReach } from './ask-reach-card';
import { useIncomeToday } from './income-today';
import { workTodayOf } from '../work/work-today';
import { requestWorkDiary } from '../work/work-diary-request';
import { GOT_PAID, MoneyCameInCard } from './money-came-in-card';
import { useFirstCatchRating } from '../rating/use-first-catch-rating';

/**
 * Today: the hero over the sky, then the sheet that holds the companion, tonight's card, the week
 * and the list. As the page scrolls the hero drifts at half speed, shrinks a touch toward its
 * bottom edge and fades out by 300 pt, as in the prototype. While a look is tried on the sheet
 * fades away (`App:155`), so the sky and the number are seen in the look above the Looks sheet.
 */
export function TodayPage({
  day,
  scrollRef,
  onSettings,
  onQuickAdd,
  onOpenDiary,
}: {
  readonly day: DailyNumber;
  readonly scrollRef: AnimatedRef<Animated.ScrollView>;
  readonly onSettings: () => void;
  readonly onQuickAdd: () => void;
  /** Switches the home surface to the Diary tab; the day to show is already requested. */
  readonly onOpenDiary?: () => void;
}) {
  const { palette, serious } = useTheme();
  const router = useRouter();
  const openSpend = useOpenSpend();
  const openAsk = useOpenAsk();
  const { closeHour, dayDate } = useClock();
  const snap = useMoney();
  const actions = useMoneyActions();
  const run = useRunAction();
  const offerUndo = useOfferUndo();
  const { t, language } = useI18n();
  const parked = useParkedClose(snap.today);
  const season = useNewYear();
  const { pulling, leave } = usePullToAdd(onQuickAdd);
  const onScroll = useHomePageScroll('today', pulling);
  const overscroll = useOverscrollPull('today', pulling);
  const shown = useHomePageShown();
  const view = todayView(snap, closeHour, day.spent, useSpendLabels());
  const income = useIncomeToday(snap, day);
  // A seller's work today: its rows fold into one, which opens the Diary on Work.
  const work = workTodayOf(snap);
  const ask = useAskReach();
  const spreadYesterday = spreadYesterdayOf(snap);
  // The first spend caught by itself, seen here, is the moment the store's rating prompt asks.
  useFirstCatchRating();
  // While the tonight card holds the day's state (due at six, late, paused), the companion speaks
  // from its tile and the bubble steps aside: the bubble never restates the card.
  const cardSpeaks =
    !serious &&
    view.moment !== 'closed' &&
    (parked !== null || view.moment === 'due' || view.moment === 'open' || view.moment === 'late');
  const monthName = inSentence(
    new Intl.DateTimeFormat(localeOf(language), { month: 'long' }).format(dayDate),
    language,
  );
  const showDiary = (target: string) => {
    requestDiaryDay(target);
    onOpenDiary?.();
  };
  const openWeekDay = (w: WeekDay) => {
    if (w.closed) showDiary(w.day);
    else if (w.isToday) router.push('/close');
    else if (w.missed) router.push(`/missed-day?day=${w.day}` as Href);
  };
  const { y } = useHomeScroll();
  const parallax = useAnimatedStyle(() => ({
    transformOrigin: '50% 100%',
    opacity: Math.max(0, Math.min(1, 1 - y.value / 300)),
    transform: [{ translateY: y.value * 0.5 }, { scale: 1 - Math.min(y.value, 320) / 3200 }],
  }));

  const trying = useTryingOn();
  const sheetShown = useSharedValue(trying ? 0 : 1);
  useEffect(() => {
    // Out quickly, so it has gone before the look's sky lands over it; back in at ease.
    sheetShown.set(
      withTiming(trying ? 0 : 1, {
        duration: trying ? 150 : 300,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [trying, sheetShown]);
  const sheetFade = useAnimatedStyle(() => ({ opacity: sheetShown.get() }));

  return (
    <View style={{ flex: 1 }}>
      <PullDetector gesture={overscroll.gesture}>
        <Animated.ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          scrollsToTop={shown}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          style={overscroll.style}
        >
          <Animated.View style={parallax}>
            <TodayHero
              day={day}
              onSettings={onSettings}
              onQuickAdd={onQuickAdd}
              empty={income.empty}
              under={income.under}
            />
          </Animated.View>
          <Animated.View
            style={[
              {
                minHeight: 540,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                backgroundColor: palette.sheet,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
                // The companion's greeting keeps its own room under it.
                paddingTop: snap.plan ? 20 : 92,
                paddingHorizontal: 16,
                paddingBottom: 128,
                gap: 28,
              },
              sheetFade,
            ]}
          >
            <HoaMai />
            {snap.plan && !cardSpeaks ? (
              <CompanionGreeting
                day={day}
                plan={snap.plan}
                spread={spreadYesterday}
                event={
                  view.moment === 'closed'
                    ? 'closedIdle'
                    : parked
                      ? 'paused'
                      : view.moment === 'late'
                        ? 'late'
                        : // Before anything has landed there is no number to be past.
                          income.empty === null && day.overspent && day.spent > 0
                          ? 'pastPlan'
                          : income.empty === null && day.safe < 0
                            ? 'replan'
                            : season.day?.kind === 'countdown'
                              ? 'seasonCountdown'
                              : season.day?.kind === 'holiday'
                                ? 'seasonHoliday'
                                : 'idle'
                }
                festival={season.festival}
                say={income.say ?? (ask.shown ? t('companion.income.askReach') : null)}
                onPress={() => openAsk()}
              />
            ) : null}
            {income.gotPaid ? (
              <MoneyCameInCard
                bg={palette.cell}
                ink={palette.ink}
                inkSoft={palette.inkSoft}
                shadow={palette.cardShadow}
                onGotPaid={() => router.push(GOT_PAID)}
              />
            ) : null}
            <AlertsPausedCard />
            <FirstCatchCard />
            <NewYearOfferCard />
            <TonightCard
              moment={view.moment}
              closeAt={snap.plan?.closeAt ?? '18:00'}
              toConfirm={view.queue.length}
              day={day}
              week={view.week}
              closedThisMonth={view.closedThisMonth}
              daysThisMonth={view.daysThisMonth}
              paused={parked === null ? null : parked.state.step === 'cards' ? 'cards' : 'later'}
              closedStamp={view.closedAt === null ? null : clockOf(hourOf(new Date(view.closedAt)))}
              monthName={monthName}
              companion={cardSpeaks}
              onClose={() => router.push('/close')}
              onOpenDay={openWeekDay}
              onOpenReceipt={() => showDiary(snap.today)}
            />
            <YearOnToday />
            {ask.shown ? <AskReachCard onPutAway={ask.putAway} /> : null}
            <JarShelf />
            <OwedRow />
            <TodayList
              rows={work === null ? view.rows : view.rows.filter((r) => !work.hidden.has(r.id))}
              work={
                work?.costs
                  ? {
                      ...work.costs,
                      onOpen: () => {
                        requestWorkDiary();
                        onOpenDiary?.();
                      },
                    }
                  : null
              }
              waiting={view.queue.length}
              spentLabel={view.spentLabel}
              onOpenInbox={() => router.push('/inbox')}
              onOpenSpend={openSpend}
              onConfirm={(id) => void run(() => actions.setStatus(id, 'kept'))}
              onDelete={(id) => {
                const name = snap.cycleSpends.find((s) => s.id === id)?.merchant ?? '';
                void run(() => actions.setStatus(id, 'deleted')).then((saved) => {
                  if (saved) {
                    offerUndo(
                      t('undo.deleted', { name }),
                      t('undo.action'),
                      () => void run(() => actions.undo(id)),
                    );
                  }
                });
              }}
            />
          </Animated.View>
        </Animated.ScrollView>
      </PullDetector>
      <PullToAdd
        pull={pulling.pull}
        leave={leave}
        heading={t('quick.ticket', { no: String(snap.cycleSpends.length + 1).padStart(3, '0') })}
        pullLabel={t('today.pull.add')}
        releaseLabel={t('today.pull.release')}
      />
    </View>
  );
}
