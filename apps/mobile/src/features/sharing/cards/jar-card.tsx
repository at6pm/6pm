import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { cycleMonth, isFutureYouPot } from '@6pm/domain';

import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { isSymbolName, Symbol } from '../../../ui/icons/symbol';
import { usePlanFormat } from '../../plan/plan-format';
import { jarName } from '../../pots/jar-name';
import { CardArt } from './card-art';
import { defineCard, type CardLayoutProps } from './card-definition';
import {
  CardCompanion,
  CardGround,
  CardMark,
  InkedAmount,
  kicker,
  ON_CARD,
  Rule,
  title,
} from './card-parts';
import { CARD_WIDTH, cardHeight } from './card-size';
import { jarBoxes } from './jar-art';

export interface JarCardData {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly hue: number;
  readonly month: string;
  readonly target: string;
  /** The companion's line; null in serious mode. */
  readonly line: string | null;
}

/** A full jar: the jar asked for, while it holds its target. */
function useJarCard(of: string | undefined): JarCardData | null {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const format = usePlanFormat(snap.today);
  return useMemo(() => {
    const pot = snap.pots.find((p) => p.id === of);
    if (!pot) return null;
    const name = jarName(pot, t);
    const persona = snap.plan?.persona ?? 'cheeky';
    // Companion keys are composed from the event and persona; each takes the same placeholders.
    const lineFor = t as unknown as (
      key: string,
      params: Record<string, string | number>,
    ) => string;
    return {
      id: pot.id,
      name,
      icon: isFutureYouPot(pot) ? 'savings' : pot.icon,
      hue: pot.hue,
      month: format.monthLong(cycleMonth(snap.cycle)),
      target: money.short(pot.goal > 0 ? pot.goal : (snap.potSaved[pot.id] ?? 0)),
      line: snap.plan?.serious ? null : lineFor(`companion.jarCard.${persona}`, { jar: name }),
    };
  }, [snap, of, t, money, format]);
}

function JarLayout({ data, format, amounts, inks, serious }: CardLayoutProps<JarCardData>) {
  const { t } = useI18n();
  const story = format === 'story';
  const height = cardHeight(format);
  const w = story ? 150 : 104;
  const h = story ? 250 : 160;
  const jar = inks.jar(1, data.hue);
  const boxes = useMemo(() => jarBoxes(inks, jar, { x: 0, y: 0, w, h }, 0.92), [inks, jar, w, h]);
  const row = { ...kicker(inks, 11.5, 0, 600), color: inks.ink };
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={height}>
      <View style={{ flex: 1, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 18, gap: 14 }}>
        <Text {...ON_CARD} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
          {t('shareCards.jar.kicker', { month: data.month }).toLocaleUpperCase()}
        </Text>
        <Text
          {...ON_CARD}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={title(inks, inks.titleSize, 0.98)}
        >
          {t('shareCards.jar.title', { jar: data.name })}
        </Text>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: w, height: h }}>
            <CardArt boxes={boxes} width={w} height={h} style={{ position: 'absolute' }} />
            {jar.glyph !== null && isSymbolName(data.icon) ? (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Symbol name={data.icon} size={story ? 48 : 34} fill={1} color={jar.glyph} />
              </View>
            ) : null}
          </View>
        </View>
        <View style={{ gap: 5, paddingTop: 10 }}>
          <Rule rule={inks.rule} style={{ position: 'absolute', left: 0, right: 0, top: 0 }} />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text {...ON_CARD} style={row}>
              {t('shareCards.jar.target').toLocaleUpperCase()}
            </Text>
            <InkedAmount text={data.target} shown={amounts} ink={inks.ink} style={row} />
          </View>
        </View>
        {story && data.line && !serious ? <CardCompanion line={data.line} inks={inks} /> : null}
        <CardMark inks={inks} path="jar" />
      </View>
    </CardGround>
  );
}

export const jarShareCard = defineCard<JarCardData>({
  path: 'jar',
  useData: useJarCard,
  hasAmounts: () => true,
  fileKey: (d) => d.id,
  Layout: JarLayout,
});
