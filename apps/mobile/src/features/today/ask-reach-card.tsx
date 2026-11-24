import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { z } from 'zod';

import { addDays } from '@6pm/domain';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import type { SqlDatabase } from '../../data/table';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading } from '../../ui/type/fonts';
import { HEADING_BREAKS, headingWords } from '../../ui/type/word-fit-text';

/** The question, asked again from Today. */
export const REACH_ROUTE = '/reach' as Href;

/** Kept on the phone: how often the card was put away, and the day it last was. */
const KEY = 'askReach';
const stateSchema = z.object({ times: z.number().int().nonnegative(), on: z.string() });
type AskState = z.infer<typeof stateSchema>;
/** Put away once, it comes back a week later; put away twice, it lives only in Plan › edit. */
const BACK_AFTER_DAYS = 7;

async function readAsk(db: SqlDatabase): Promise<AskState | null> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    KEY,
  ]);
  const raw = rows[0]?.value;
  if (raw === undefined) return null;
  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * The card for people already counting on "It varies": shown from the first open after the
 * update until they answer; put away, it comes back once a week later. Until they answer, their
 * number is counted exactly as it was.
 */
export function useAskReach(): { readonly shown: boolean; readonly putAway: () => void } {
  const { plan, today } = useMoney();
  const { db } = useMoneyStore();
  const asked = plan !== null && plan.payday.kind === 'varies' && plan.incomes === undefined;
  const [state, setState] = useState<AskState | null | undefined>(undefined);
  useEffect(() => {
    if (!asked) return;
    let live = true;
    void readAsk(db).then((s) => {
      if (live) setState(s);
    });
    return () => {
      live = false;
    };
  }, [asked, db]);
  const putAway = useCallback(() => {
    const next = { times: (state?.times ?? 0) + 1, on: today };
    setState(next);
    void db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
      KEY,
      JSON.stringify(next),
    ]);
  }, [db, state, today]);
  const due = (s: AskState | null): boolean =>
    s === null || (s.times === 1 && today >= addDays(s.on, BACK_AFTER_DAYS));
  return { shown: asked && state !== undefined && due(state), putAway };
}

/** "How does money reach you? Until you answer, nothing changes. Answer." */
export function AskReachCard({ onPutAway }: { readonly onPutAway: () => void }) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      style={{
        borderRadius: 24,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        padding: 16,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: palette.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="payments" size={22} color={palette.ink} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            {...HEADING_BREAKS}
            style={{ ...leading(display(19, 500), 23), color: palette.ink }}
          >
            {headingWords(t('onboarding.reach.title'))}
          </Text>
          <Text style={{ ...body(13, 500), color: palette.inkSoft }}>{t('income.ask.sub')}</Text>
        </View>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={t('income.until.cancel')}
          hitSlop={10}
          onPress={() => {
            haptics.tick();
            onPutAway();
          }}
          style={{ alignSelf: 'flex-start' }}
        >
          <Symbol name="close" size={18} color={palette.inkSoft} />
        </PressScale>
      </View>
      <PressScale
        scaleTo={0.97}
        accessibilityRole="button"
        onPress={() => {
          haptics.tap();
          router.push(REACH_ROUTE);
        }}
        style={{
          height: 48,
          borderRadius: 99,
          backgroundColor: palette.btnBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(15.5, 650), color: palette.btnFg }}>{t('income.ask.answer')}</Text>
      </PressScale>
    </Animated.View>
  );
}
