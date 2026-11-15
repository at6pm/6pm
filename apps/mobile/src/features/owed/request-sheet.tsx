import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';

import { parseAmount } from '@6pm/domain';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { accountReady } from '../../data/receiving-account';
import { requestActions } from '../../data/request-actions';
import { workOf } from '../../data/work-money';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { useToast } from '../../ui/toast/toast-host';
import { body } from '../../ui/type/fonts';
import { WorkStamp } from '../work/work-stamp';
import { Avatar, Slip } from './owed-parts';
import { useReceivingAccount } from './use-owed';

/**
 * "Ask to be paid": a strip made without a split, for a client and a job. Who, the job and the
 * amount; the WORK stamp is inked by default for someone with work on, one tap lifts it; a client
 * that is a shop or a company gets a square avatar. Making it opens the strip, its code in the note.
 */
export function RequestSheet() {
  const router = useRouter();
  const store = useMoneyStore();
  const snap = useMoney();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const toast = useToast();
  const { account } = useReceivingAccount();
  const workOn = workOf(snap) !== null;
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [typed, setTyped] = useState('');
  const [work, setWork] = useState(workOn);
  const [company, setCompany] = useState(false);
  const [busy, setBusy] = useState(false);
  const amount = useMemo(() => parseAmount(typed, money.currency) ?? 0, [typed, money.currency]);
  const ready = name.trim() !== '' && amount > 0 && !busy;

  const make = () => {
    if (!ready) {
      if (amount <= 0) toast(t('request.new.noAmount'));
      return;
    }
    haptics.tap();
    Keyboard.dismiss();
    setBusy(true);
    void requestActions(store)
      .ask({ name, job: job.trim() || null, amount, work, company })
      .then((row) => {
        if (!row) {
          setBusy(false);
          return;
        }
        haptics.success();
        if (money.currency.code !== 'VND') {
          router.back();
          return;
        }
        // The next sheet takes this one's place, so it is never presented while this one leaves.
        if (!accountReady(account ?? null)) {
          toast(t('owed.ask.noAccount'));
          router.replace('/receiving-account');
          return;
        }
        router.replace({ pathname: '/owed-ask', params: { key: '', line: row.id } });
      })
      .catch(() => setBusy(false));
  };

  const row = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    paddingVertical: 13,
  } as const;
  const input = {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    color: palette.ink,
    padding: 0,
  } as const;

  return (
    <SheetScreen
      title={t('request.new.title')}
      gap={18}
      fit
      footer={
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}>
          <PressScale
            scaleTo={0.97}
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready, busy }}
            onPress={make}
            style={{
              height: 56,
              borderRadius: 99,
              backgroundColor: palette.btnBg,
              opacity: ready ? 1 : 0.45,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Symbol name="qr_code_2" size={20} color={palette.btnFg} />
            <Text style={{ ...body(17, 650), color: palette.btnFg }}>{t('request.new.make')}</Text>
          </PressScale>
        </View>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, alignSelf: 'center' }}>
        <View style={{ alignItems: 'center', gap: 6, width: 64 }}>
          <Avatar name={name.trim() || null} size={40} square={company} />
          <Text numberOfLines={1} style={{ ...body(14, 650), color: palette.ink }}>
            {name.trim() || t('owed.someone')}
          </Text>
        </View>
        <View style={{ transform: [{ rotate: '-2deg' }] }}>
          <Slip
            big
            width={150}
            what={job.trim().toLocaleUpperCase() || ' '}
            amount={money.short(amount)}
            work={work}
          />
        </View>
      </View>

      <View
        style={{
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          overflow: 'hidden',
        }}
      >
        <View style={row}>
          <Text style={{ ...body(16), color: palette.inkSoft }}>{t('request.new.who')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('request.new.whoPlaceholder')}
            placeholderTextColor={palette.inkSoft}
            autoCapitalize="words"
            maxLength={40}
            returnKeyType="next"
            style={input}
          />
        </View>
        <View style={{ ...row, borderTopWidth: 0.5, borderTopColor: palette.hair }}>
          <Text style={{ ...body(16), color: palette.inkSoft }}>{t('request.new.job')}</Text>
          <TextInput
            value={job}
            onChangeText={setJob}
            placeholder={t('request.new.jobPlaceholder')}
            placeholderTextColor={palette.inkSoft}
            maxLength={60}
            returnKeyType="next"
            style={input}
          />
        </View>
        <View style={{ ...row, borderTopWidth: 0.5, borderTopColor: palette.hair }}>
          <Text style={{ ...body(16), color: palette.inkSoft }}>{t('request.new.amount')}</Text>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            placeholder={money.full(0)}
            placeholderTextColor={palette.inkSoft}
            keyboardType="numbers-and-punctuation"
            maxLength={20}
            returnKeyType="done"
            onSubmitEditing={make}
            style={{ ...input, fontVariant: ['tabular-nums'] }}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 }}>
        {workOn ? (
          <WorkStamp
            face={work ? 'always' : 'sometimes'}
            surface={palette.dark ? 'dark' : 'paper'}
            labels={{ inked: t('work.stamp'), offered: t('work.stampOffered') }}
            accessibilityLabel={t('work.stamp')}
            onPress={() => {
              haptics.tap();
              setWork((was) => !was);
            }}
          />
        ) : null}
        <View style={{ flex: 1 }} />
        <PressScale
          accessibilityRole="switch"
          accessibilityState={{ checked: company }}
          onPress={() => {
            haptics.tick();
            setCompany((was) => !was);
          }}
          style={{
            minHeight: 36,
            paddingHorizontal: 14,
            borderRadius: 99,
            backgroundColor: company ? palette.tabActive : palette.chipBg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Symbol name={company ? 'check' : 'add'} size={16} color={palette.ink} />
          <Text style={{ ...body(14, 600), color: palette.ink }}>{t('request.new.company')}</Text>
        </PressScale>
      </View>
    </SheetScreen>
  );
}
