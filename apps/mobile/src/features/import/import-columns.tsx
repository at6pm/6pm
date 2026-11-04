import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { COLUMN_ROLES, fileAmount, type ColumnRole, type Sheet } from '@6pm/domain';
import { importInk, springs } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, families, mono } from '../../ui/type/fonts';
import { useCount } from './import-format';
import { ImportFoot, PillButton } from './import-parts';

const ICON: Readonly<Record<ColumnRole, SymbolName>> = {
  date: 'calendar_today',
  amount: 'payments',
  category: 'category',
  note: 'notes',
  inOut: 'swap_vert',
  skip: 'block',
};
const COLUMN_WIDTH = 92;
const PREVIEW_ROWS = 5;

const cellText = (value: string | number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

/** A header cell: what the column is, cycled by a tap with the pop spring and a light tap. */
function HeaderCell({
  head,
  role,
  onCycle,
}: {
  readonly head: string;
  readonly role: ColumnRole;
  readonly onCycle: () => void;
}) {
  const { t } = useI18n();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const skip = role === 'skip';
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={t('import.columns.header', {
        header: head,
        role: t(`import.role.${role}`),
      })}
      onPress={() => {
        haptics.tap();
        scale.value = withSequence(withTiming(0.92, { duration: 60 }), withSpring(1, springs.pop));
        onCycle();
      }}
      style={{
        width: COLUMN_WIDTH,
        borderRightWidth: 1,
        borderRightColor: importInk.tableRule,
        backgroundColor: skip ? importInk.tableHead : importInk.tableChosen,
        paddingVertical: 8,
        paddingHorizontal: 6,
        gap: 3,
      }}
    >
      <Text
        numberOfLines={1}
        style={{ ...mono(9, 600, 0.06), color: importInk.tableInk, opacity: 0.7 }}
      >
        {head}
      </Text>
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 3 }, style]}>
        <Symbol
          name={ICON[role]}
          size={13}
          color={skip ? importInk.tableSoft : importInk.tableInk}
        />
        <Text
          numberOfLines={1}
          style={{
            ...body(11.5, 700),
            color: skip ? importInk.tableSoft : importInk.tableInk,
            flexShrink: 1,
          }}
        >
          {t(`import.role.${role}`)}
        </Text>
      </Animated.View>
    </PressScale>
  );
}

/**
 * "Which column is which?": a file 6pm does not know, shown as a table. A tap on a header cycles
 * what it is (Date, Amount, Category, Note, In or out, Skip); Date and Amount are needed to read it.
 */
export function ImportColumns({
  sheet,
  header,
  roles: given,
  lines,
  onRead,
}: {
  readonly sheet: Sheet;
  readonly header: number;
  readonly roles: readonly ColumnRole[];
  readonly lines: number;
  readonly onRead: (roles: readonly ColumnRole[]) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const count = useCount();
  const head = sheet.rows[header] ?? [];
  const body5 = sheet.rows.slice(header + 1, header + 1 + PREVIEW_ROWS);
  const width = Math.max(head.length, ...body5.map((r) => r.length));
  const [roles, setRoles] = useState<ColumnRole[]>(() =>
    Array.from({ length: width }, (_, i) => given[i] ?? 'skip'),
  );
  // The server's reading arrives after the table opens: it fills the table once.
  useEffect(() => {
    setRoles(Array.from({ length: width }, (_, i) => given[i] ?? 'skip'));
  }, [given, width]);
  const has = (role: ColumnRole) => roles.includes(role);
  const ok = has('date') && has('amount');
  const amountAt = roles.indexOf('amount');
  const cycle = (i: number) =>
    setRoles((now) => {
      const next = now.slice();
      const at = COLUMN_ROLES.indexOf(next[i] ?? 'skip');
      next[i] = COLUMN_ROLES[(at + 1) % COLUMN_ROLES.length] ?? 'skip';
      return next;
    });
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 4, gap: 14 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 }}>
          {COLUMN_ROLES.slice(0, 4).map((role) => (
            <View
              key={role}
              style={{
                height: 30,
                paddingLeft: 6,
                paddingRight: 10,
                borderRadius: 99,
                backgroundColor: has(role) ? importInk.foundBg : palette.hair,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Symbol
                name={has(role) ? 'check_circle' : ICON[role]}
                size={16}
                color={has(role) ? importInk.foundInk : palette.inkSoft}
              />
              <Text
                style={{
                  ...body(12.5, 650),
                  color: has(role) ? importInk.foundInk : palette.inkSoft,
                }}
              >
                {t(`import.role.${role}`)}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={{
            marginHorizontal: 16,
            borderRadius: 16,
            backgroundColor: importInk.table,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={width * COLUMN_WIDTH > 370}
          >
            <View>
              <View style={{ flexDirection: 'row', backgroundColor: importInk.tableHead }}>
                {roles.map((role, i) => (
                  <HeaderCell
                    key={i}
                    head={cellText(head[i])}
                    role={role}
                    onCycle={() => cycle(i)}
                  />
                ))}
              </View>
              {body5.map((row, r) => (
                <View
                  key={r}
                  style={{
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderTopColor: importInk.tableRule,
                  }}
                >
                  {roles.map((_, i) => {
                    const value = cellText(row[i]);
                    const signed = i === amountAt ? fileAmount(row[i] ?? null) : null;
                    const colour =
                      signed === null
                        ? importInk.tableInk
                        : signed < 0
                          ? importInk.tableOut
                          : importInk.tableIn;
                    return (
                      <Text
                        key={i}
                        numberOfLines={1}
                        style={{
                          width: COLUMN_WIDTH,
                          padding: 6,
                          fontFamily: families.mono,
                          fontSize: 10,
                          color: colour,
                        }}
                      >
                        {value}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <Text
          style={{ paddingHorizontal: 16, ...body(13), lineHeight: 18.2, color: palette.inkSoft }}
        >
          {ok ? t('import.columns.ok') : t('import.columns.need')}
        </Text>
      </View>
      <ImportFoot>
        <PillButton
          enabled={ok}
          label={ok ? t('import.columns.read', { n: count(lines) }) : t('import.columns.find')}
          onPress={() => onRead(roles)}
        />
      </ImportFoot>
    </View>
  );
}
