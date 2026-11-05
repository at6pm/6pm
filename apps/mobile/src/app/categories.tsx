import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';
import { LayoutAnimationConfig } from 'react-native-reanimated';

import { type CategoryRow, type MerchantRuleRow } from '@6pm/domain';

import {
  tallyByCategory,
  useCategoryActions,
  type DeletedCategory,
} from '../data/category-actions';
import { useMoney } from '../data/money-provider';
import { CategoryRowFace, ListSection, NewCategoryRow } from '../features/categories/category-list';
import { useDeletedCategories } from '../features/categories/category-undo';
import { NoRules, RuleListRow } from '../features/categories/rule-list';
import { SortableCategories } from '../features/categories/sortable-categories';
import { useI18n } from '../i18n/i18n';
import { useMoneyFormat } from '../money/use-money-format';
import { haptics } from '../ui/haptics';
import { SheetScreen } from '../ui/navigation/sheet-screen';
import { useTheme } from '../ui/theme/theme';
import { body } from '../ui/type/fonts';
import { UndoHost, useOfferUndo } from '../ui/undo/undo-host';

/** Just above the home indicator: a sheet has no tab bar to clear. */
const UNDO_LIFT = 50;

/** Inside a sheet the app's own undo bar is covered, so Categories brings one of its own. */
export default function Categories() {
  return (
    <UndoHost lift={UNDO_LIFT}>
      <CategoriesSheet />
    </UndoHost>
  );
}

/**
 * Categories & rules: every category with this month's tally, in the person's order (hold and
 * drag to change it, swipe to delete), the editor to make or change one, and the merchants 6pm
 * has learned to file, each one forgettable.
 */
function CategoriesSheet() {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const offerUndo = useOfferUndo();
  const [dragging, setDragging] = useState(false);
  const money = useMoneyFormat();
  const snap = useMoney();
  const actions = useCategoryActions();
  const router = useRouter();
  const [rules, setRules] = useState<readonly MerchantRuleRow[]>([]);
  const { categories } = snap;
  const tallies = useMemo(() => tallyByCategory(snap.cycleSpends), [snap.cycleSpends]);

  useEffect(() => {
    let live = true;
    void actions.readRules().then((next) => {
      if (live) setRules(next);
    });
    return () => {
      live = false;
    };
  }, [actions, categories]);

  // The editor floats over this sheet on its own route; `new` makes a category.
  const edit = useCallback(
    (id: string | null) => router.push({ pathname: '/category/[id]', params: { id: id ?? 'new' } }),
    [router],
  );

  const offer = useCallback(
    (deleted: DeletedCategory) => {
      const text =
        deleted.standing > 0
          ? t('categories.moved', { count: deleted.standing, name: deleted.to.name })
          : t('undo.deleted', { name: deleted.category.name });
      offerUndo(text, t('undo.action'), () => {
        haptics.tap();
        void actions.restoreCategory(deleted);
      });
    },
    [actions, offerUndo, t],
  );
  useDeletedCategories(offer);

  const remove = useCallback(
    (id: string) => {
      void actions.deleteCategory(id, language).then((deleted) => {
        if (deleted) offer(deleted);
      });
    },
    [actions, language, offer],
  );

  const reorder = useCallback(
    (ids: readonly string[]) => void actions.reorderCategories(ids),
    [actions],
  );

  const subOf = useCallback(
    (category: CategoryRow) => {
      const tally = tallies.get(category.id);
      return tally
        ? t('categories.tally', { count: tally.count, amount: money.short(tally.total) })
        : t('categories.tallyNone');
    },
    [money, t, tallies],
  );

  const forget = (merchantKey: string) => {
    haptics.tap();
    void actions.removeRule(merchantKey).then(() => {
      setRules((current) => current.filter((r) => r.merchantKey !== merchantKey));
    });
  };

  const shownRules = rules.flatMap((rule) => {
    const category = categories.find((c) => c.id === rule.categoryId);
    return category ? [{ rule, category }] : [];
  });
  return (
    <SheetScreen title={t('categories.title')} gap={24} scrollEnabled={!dragging}>
      <Text
        style={{
          ...body(15),
          lineHeight: 15 * 1.45,
          color: palette.inkSoft,
          paddingHorizontal: 6,
        }}
      >
        {t('categories.intro')}
      </Text>
      <LayoutAnimationConfig skipEntering>
        <ListSection
          title={t('categories.yours')}
          note={t('categories.count', { count: categories.length })}
        >
          <SortableCategories
            categories={categories}
            labelOf={(category) => `${category.name}, ${subOf(category)}`}
            renderFace={(category, first) => (
              <CategoryRowFace
                category={category}
                sub={subOf(category)}
                notDailyLabel={t('categories.notDaily')}
                first={first}
              />
            )}
            labels={{
              delete: t('categories.delete'),
              moveUp: t('categories.moveUp'),
              moveDown: t('categories.moveDown'),
              hint: t('categories.dragHint'),
            }}
            onOpen={edit}
            onDelete={remove}
            onReorder={reorder}
            onDragging={setDragging}
          />
          <NewCategoryRow label={t('categories.new')} onPress={() => edit(null)} />
        </ListSection>
      </LayoutAnimationConfig>
      <ListSection
        title={t('categories.learned')}
        note={shownRules.length ? t('categories.rulesCount', { count: shownRules.length }) : ''}
        footer={t('categories.rulesNote')}
      >
        {shownRules.map(({ rule, category }, i) => (
          <RuleListRow
            key={rule.merchantKey}
            merchant={rule.merchant}
            category={category}
            sub={
              rule.learnedTimes > 0
                ? t('categories.rule.learned', { count: rule.learnedTimes })
                : t('categories.rule.set')
            }
            removeLabel={t('categories.rule.remove', { merchant: rule.merchant })}
            first={i === 0}
            onRemove={() => forget(rule.merchantKey)}
          />
        ))}
        {shownRules.length === 0 ? <NoRules text={t('categories.noRules')} /> : null}
      </ListSection>
    </SheetScreen>
  );
}
