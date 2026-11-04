import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import type { PotRow } from '@6pm/domain';

import { useMoney } from '../../data/money-provider';
import { usePlanActions } from '../../data/plan-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { SheetFrame } from '../../ui/navigation/sheet-frame';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, families, leading, tabular, UNPADDED } from '../../ui/type/fonts';
import { useOfferUndo } from '../../ui/undo/undo-host';
import { useCompanionToast } from '../companion/use-companion-toast';
import { useRunAction } from '../companion/use-run-action';
import { AmountKeypadSheet } from '../quick-add/amount-keypad-sheet';
import { expectLanding } from './jar-flight';
import { jarLevel } from './jar';
import { useJarFormat } from './jar-words';
import { ChoiceChips, DraftJar, FillSegment, PresetTiles } from './new-jar-parts';
import { RollingText } from './rolling-text';
import { useNewJar, type AskedJar } from './use-new-jar';

type Keypad = 'target' | 'steady' | null;

/**
 * New jar (Pots canvas, B, third phone), and a jar's Edit: one sheet. A preset re-tints the jar
 * and swaps its name and target (tap either to change it), "By a date" splits the target over the
 * paydays to a month, "Each payday" puts in a steady amount; what goes in each payday rolls on
 * the odometer over today's line before and after. Start makes it and it flies onto the shelf.
 * Future you's Edit changes only its target.
 */
export function NewJarSheet({
  editing,
  asked,
}: {
  readonly editing: PotRow | null;
  readonly asked: AskedJar | null;
}) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const format = useJarFormat();
  const actions = usePlanActions();
  const run = useRunAction();
  const say = useCompanionToast();
  const offerUndo = useOfferUndo();
  const jar = useNewJar(editing, asked);
  const { draft } = jar;
  const [keypad, setKeypad] = useState<Keypad>(null);
  const [working, setWorking] = useState(false);
  const busy = useRef(false);
  const short = (n: number) => money.short(n);
  const fy = jar.futureYou;
  const snap = useMoney();
  const saved = editing ? (snap.potSaved[editing.id] ?? 0) : 0;
  // Once Start is pressed the numbers hold still while the sheet goes, though the jar now counts.
  const live = { each: jar.each, before: jar.before, after: jar.after };
  const held = useRef(live);
  if (!working) held.current = live;
  const shown = held.current;

  const save = async () => {
    if (busy.current || draft.name.trim() === '') return;
    busy.current = true;
    setWorking(true);
    let ok: boolean;
    if (editing) {
      ok = await run(() =>
        actions.updatePot(editing.id, {
          ...(fy ? {} : { name: draft.name, icon: draft.icon, hue: draft.hue }),
          goal: draft.target,
          // A rename never changes how a 2.1 goal fills; only choosing how it fills does.
          ...(fy || (editing.kind === 'goal' && !jar.fillTouched) ? {} : { fill: jar.fill }),
        }),
      );
    } else {
      expectLanding();
      ok = await run(() =>
        actions.createPot({
          name: draft.name,
          icon: draft.icon,
          hue: draft.hue,
          goal: draft.target,
          fill: jar.fill,
        }),
      );
      if (!ok) expectLanding(false);
    }
    if (!ok) {
      busy.current = false;
      setWorking(false);
      return;
    }
    if (editing) haptics.success();
    router.back();
    if (!editing) say('potMade');
  };
  const remove = async () => {
    if (!editing || fy || busy.current) return;
    busy.current = true;
    router.back();
    const ok = await run(() => actions.archivePot(editing.id));
    if (!ok) return;
    haptics.tap();
    offerUndo(t('pots.new.deleted', { name: editing.name }), t('pots.new.undo'), () => {
      void run(() => actions.restorePot(editing.id));
    });
  };

  const header = (
    <View style={{ paddingTop: 8, paddingHorizontal: 18, paddingBottom: 6, gap: 6 }}>
      <View
        style={{
          alignSelf: 'center',
          width: 36,
          height: 5,
          borderRadius: 9,
          backgroundColor: palette.inkSoft,
          opacity: 0.35,
        }}
      />
      <View style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <PressScale
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={8}
          style={{ position: 'absolute', left: 0, paddingVertical: 8 }}
        >
          <Text style={{ ...body(17), color: palette.inkSoft }}>{t('pots.new.cancel')}</Text>
        </PressScale>
        <Text style={{ ...body(17, 650), color: palette.ink }}>
          {editing ? t('pots.new.editTitle') : t('pots.new.title')}
        </Text>
      </View>
    </View>
  );

  const target =
    draft.target > 0
      ? t('pots.new.target', { amount: short(draft.target) })
      : t('pots.new.noTarget');
  const steadyIndex = jar.choices.indexOf(draft.steady);

  return (
    <SheetFrame header={header}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 16, paddingBottom: 20, gap: 16 }}
      >
        {fy ? null : (
          <PresetTiles
            presets={jar.presets}
            selected={draft.preset}
            nameOf={jar.presetName}
            onPick={jar.pick}
          />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 4 }}>
          <DraftJar
            hue={draft.hue}
            icon={draft.icon}
            futureYou={fy}
            level={editing ? jarLevel(saved, draft.target) : 0}
          />
          <View style={{ flex: 1, gap: 4 }}>
            {fy ? (
              <Text style={{ ...leading(display(30, 500), 30 * 1.05, true), color: palette.ink }}>
                {t('pots.futureYou')}
              </Text>
            ) : (
              <TextInput
                value={draft.name}
                onChangeText={(name) =>
                  jar.change({ name: name.slice(0, 40), preset: draft.preset })
                }
                placeholder={t('pots.new.name')}
                placeholderTextColor={palette.inkSoft}
                accessibilityLabel={t('pots.new.name')}
                returnKeyType="done"
                maxLength={40}
                style={{
                  padding: 0,
                  fontFamily: families.display,
                  ...UNPADDED,
                  fontSize: 30,
                  fontWeight: '500',
                  color: palette.ink,
                }}
              />
            )}
            <PressScale
              accessibilityRole="button"
              onPress={() => {
                haptics.tap();
                setKeypad('target');
              }}
              style={{ alignSelf: 'flex-start' }}
            >
              <Text style={{ ...display(22, 500), ...tabular, color: palette.inkSoft }}>
                {target}
              </Text>
            </PressScale>
            {draft.target > 0 && (fy || draft.mode === 'steady') ? (
              <PressScale
                accessibilityRole="button"
                onPress={() => {
                  haptics.tick();
                  jar.change({ target: 0 });
                }}
                style={{
                  alignSelf: 'flex-start',
                  height: 28,
                  paddingHorizontal: 10,
                  borderRadius: 99,
                  backgroundColor: palette.chipBg,
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                <Text style={{ ...body(12.5, 650), color: palette.ink }}>
                  {t('pots.new.noTarget')}
                </Text>
              </PressScale>
            ) : null}
          </View>
        </View>
        {fy ? null : (
          <>
            <FillSegment
              options={[
                { id: 'date', icon: 'calendar_month', label: t('pots.new.byDate') },
                { id: 'steady', icon: 'autorenew', label: t('pots.new.eachPayday') },
              ]}
              selected={draft.mode}
              onSelect={(id) => jar.setFill({ mode: id === 'date' ? 'date' : 'steady' })}
            />
            <View
              style={{
                borderRadius: 22,
                backgroundColor: palette.cell,
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 12,
              }}
            >
              {draft.mode === 'date' ? (
                <ChoiceChips
                  chips={jar.months.map((m) => ({ id: m, label: format.chip(m) }))}
                  selected={draft.month}
                  onSelect={(month) => jar.setFill({ month })}
                />
              ) : (
                <ChoiceChips
                  chips={jar.choices.map((c) => ({ id: String(c), label: short(c) }))}
                  selected={steadyIndex >= 0 ? String(draft.steady) : null}
                  onSelect={(c) => jar.setFill({ steady: Number(c) })}
                />
              )}
              <PressScale
                accessibilityRole="button"
                disabled={draft.mode === 'date'}
                onPress={() => {
                  haptics.tap();
                  setKeypad('steady');
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}
              >
                <RollingText
                  text={short(shown.each)}
                  style={{ ...display(34, 500), color: palette.ink }}
                  lineHeight={36}
                />
                <Text style={{ ...body(14, 600), color: palette.inkSoft }}>
                  {t('pots.new.each')}
                </Text>
              </PressScale>
            </View>
          </>
        )}
        {fy ? null : (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6 }}
          >
            <Symbol name="wb_twilight" size={19} color={palette.inkSoft} />
            <Text style={{ ...body(14), flex: 1, color: palette.inkSoft }}>
              {t('pots.new.eachDay')}
            </Text>
            <Text style={{ ...body(14), ...tabular, color: palette.inkSoft }}>
              <Text style={{ opacity: 0.6 }}>{short(shown.before)} →</Text>{' '}
              <Text style={{ ...body(14, 700), color: palette.ink }}>{short(shown.after)}</Text>
            </Text>
          </View>
        )}
        {editing && !fy ? (
          <PressScale
            accessibilityRole="button"
            onPress={() => void remove()}
            style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ ...body(16, 600), color: palette.inkSoft }}>{t('pots.new.delete')}</Text>
          </PressScale>
        ) : null}
      </ScrollView>
      <View style={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 34 }}>
        <PressScale
          accessibilityRole="button"
          scaleTo={0.97}
          disabled={working || draft.name.trim() === ''}
          onPress={() => void save()}
          style={{
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
            opacity: draft.name.trim() === '' ? 0.4 : 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>
            {editing ? t('pots.new.save') : t('pots.new.start')}
          </Text>
        </PressScale>
      </View>
      {keypad ? (
        <AmountKeypadSheet
          title={keypad === 'target' ? t('pots.new.targetTitle') : t('pots.new.amountTitle')}
          decimals={money.currency.minorDigits > 0}
          onAmount={(amount) =>
            keypad === 'target' ? jar.change({ target: amount }) : jar.setFill({ steady: amount })
          }
          onClose={() => setKeypad(null)}
        />
      ) : null}
    </SheetFrame>
  );
}
