import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { certificateOf, isTakings, workYearCsv } from '@6pm/domain';
import { requestInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { useToast } from '../../ui/toast/toast-host';
import { body, mono } from '../../ui/type/fonts';
import { shareCsv } from '../export/share-csv';
import { useWorkYear } from './use-work-year';

const SHOWN = 5;
const short = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

/**
 * 8c, for whoever files: the list as it will open in a spreadsheet, printed as a slip first so
 * the person sees what they hand over. Two CSV files (income, then costs), UTF-8 with a byte order
 * mark, amounts as whole numbers; the share sheet takes them, and nothing is uploaded. 6pm files
 * nothing and issues no invoices.
 */
export function YearFilesSheet() {
  const snap = useMoney();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const toast = useToast();
  const { year, rows, jobs } = useWorkYear();
  const [busy, setBusy] = useState(false);
  const income = useMemo(() => rows.filter(isTakings), [rows]);
  const categories = useMemo(
    () => new Map(snap.categories.map((c) => [c.id, c.name] as const)),
    [snap.categories],
  );
  const fileName = t('yearFiles.incomeFile', { year });

  const share = () => {
    if (busy) return;
    haptics.tap();
    setBusy(true);
    const files = workYearCsv(
      rows,
      year,
      {
        income: {
          date: t('yearFiles.csv.date'),
          from: t('yearFiles.csv.from'),
          job: t('yearFiles.csv.job'),
          billed: t('yearFiles.csv.billed'),
          heldBack: t('yearFiles.csv.heldBack'),
          landed: t('yearFiles.csv.landed'),
          certificate: t('yearFiles.csv.certificate'),
        },
        costs: {
          date: t('yearFiles.csv.date'),
          to: t('yearFiles.csv.to'),
          category: t('yearFiles.csv.category'),
          amount: t('yearFiles.csv.amount'),
          note: t('yearFiles.csv.note'),
        },
      },
      { jobs, categories },
    );
    // One file, then the other: the share sheet takes one file at a time.
    shareCsv(fileName, files.income)
      .then(() => shareCsv(t('yearFiles.costsFile', { year }), files.costs))
      .catch(() => toast(t('sharing.failed')))
      .finally(() => setBusy(false));
  };

  const cell = { ...mono(9, 400), color: requestInk.paperInk } as const;
  const head = { ...mono(8.5, 600, 0.08), color: requestInk.paperSoft } as const;
  return (
    <SheetScreen
      title={t('yearFiles.title')}
      gap={14}
      fit
      footer={
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}>
          <PressScale
            scaleTo={0.97}
            accessibilityRole="button"
            accessibilityState={{ busy }}
            onPress={share}
            style={{
              height: 56,
              borderRadius: 99,
              backgroundColor: palette.btnBg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Symbol name="ios_share" size={20} color={palette.btnFg} />
            <Text style={{ ...body(17, 650), color: palette.btnFg }}>{t('yearFiles.share')}</Text>
          </PressScale>
        </View>
      }
    >
      <View style={{ marginHorizontal: 4 }}>
        <View style={{ transform: [{ scaleY: -1 }] }}>
          <PaperEdge color={requestInk.paper} shadow={false} />
        </View>
        <View
          style={{
            backgroundColor: requestInk.paper,
            paddingHorizontal: 10,
            paddingTop: 8,
            paddingBottom: 10,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...mono(9.5, 400, 0.12), color: requestInk.paperSoft }}>
              {fileName.toUpperCase()}
            </Text>
            <Text style={{ ...mono(9.5, 400, 0.12), color: requestInk.paperSoft }}>
              {t('yearFiles.rows', { count: income.length })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Text style={{ ...head, width: 34 }}>{t('yearFiles.col.date')}</Text>
            <Text style={{ ...head, flex: 1.2 }}>{t('yearFiles.col.from')}</Text>
            <Text style={{ ...head, flex: 1 }}>{t('yearFiles.col.job')}</Text>
            <Text style={{ ...head, width: 64, textAlign: 'right' }}>
              {t('yearFiles.col.billed')}
            </Text>
            <Text style={{ ...head, width: 52, textAlign: 'right' }}>
              {t('yearFiles.col.held')}
            </Text>
            <Text style={{ ...head, width: 34, textAlign: 'right' }}>
              {t('yearFiles.col.cert')}
            </Text>
          </View>
          {income.slice(0, SHOWN).map((row) => {
            const mark = certificateOf(row);
            const held = row.heldBack ?? 0;
            return (
              <View key={row.id} style={{ gap: 4 }}>
                <DashedRule color={requestInk.paperRule} />
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Text style={{ ...cell, width: 34 }}>{short(row.day)}</Text>
                  <Text numberOfLines={1} style={{ ...cell, flex: 1.2 }}>
                    {row.merchant}
                  </Text>
                  <Text numberOfLines={1} style={{ ...cell, flex: 1 }}>
                    {jobs.get(row.id) ?? row.note ?? ''}
                  </Text>
                  <Text style={{ ...cell, width: 64, textAlign: 'right' }}>
                    {money.number(row.amount + held)}
                  </Text>
                  <Text style={{ ...cell, width: 52, textAlign: 'right' }}>
                    {money.number(held)}
                  </Text>
                  <Text style={{ ...cell, width: 34, textAlign: 'right' }}>
                    {mark.kind === 'arrived' && mark.on
                      ? short(mark.on)
                      : mark.kind === 'waiting'
                        ? '–'
                        : ''}
                  </Text>
                </View>
              </View>
            );
          })}
          {income.length > SHOWN ? (
            <Text style={{ ...mono(9, 400, 0.08), color: requestInk.paperSoft, paddingTop: 2 }}>
              {t('yearFiles.more', { count: income.length - SHOWN })}
            </Text>
          ) : null}
        </View>
        <PaperEdge color={requestInk.paper} shadow={false} />
      </View>
      <Text
        style={{ ...body(13.5), lineHeight: 19.5, color: palette.inkSoft, paddingHorizontal: 4 }}
      >
        {t('yearFiles.sub')}
      </Text>
      <Text style={{ ...body(13.5), color: palette.inkSoft, paddingHorizontal: 4 }}>
        {t('yearFiles.nothing')}
      </Text>
    </SheetScreen>
  );
}
