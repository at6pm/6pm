import type { Entry } from '../catalogue-types';
import type { enInsights } from '../en-insights';

// The companion says 我 for itself and 你 for the user, like a friend texting. The daily line is
// 额度; a pot is 存钱罐; the close is 日结. Roast teases the habit, never the person.
export const zhHansInsights: { readonly [Key in keyof typeof enInsights]: Entry } = {
  'insight.compare.muchMore': '多了不少',
  'insight.compare.more': '多了一些',
  'insight.compare.about': '差不多',
  'insight.compare.less': '少了一些',
  'insight.compare.muchLess': '少了不少',

  'insight.todayOver.soft.1': '今天超了 {over}。没关系，明天还有 {tomorrow}。',
  'insight.todayOver.soft.2': '今天花得多了点，超了 {over}。计划会自己调整：明天是 {tomorrow}。',
  'insight.todayOver.cheeky.1': '今天超了 {over}。明天 {tomorrow}，又是崭新的一天。',
  'insight.todayOver.cheeky.2': '今天越线 {over}。剧情反转而已，明天还有 {tomorrow}。',
  'insight.todayOver.roast.1': '超了 {over}。额度已经尽力了。明天 {tomorrow}，手下留情哦。',
  'insight.todayOver.roast.2': '额度说不行，今天偏要多花 {over}。明天 {tomorrow}，第二回合。',
  'insight.todayOver.plain': '今天超出额度 {over}。明天的额度是 {tomorrow}。',

  'insight.todayUnder.soft.1': '目前花了 {spent}，还有 {safe} 可以花。稳稳的。',
  'insight.todayUnder.soft.2': '今天还有 {safe} 的空间。你做得很好。',
  'insight.todayUnder.cheeky.1': '今天还剩 {safe}。花得漂亮，或者存着，你说了算。',
  'insight.todayUnder.cheeky.2': '已花 {spent}，还剩 {safe}。丝滑。',
  'insight.todayUnder.roast.1': '才花了 {spent}？钱包都懵了，好的那种懵。还有 {safe} 可以花。',
  'insight.todayUnder.roast.2': '还有 {safe} 可以花。有点可疑啊。继续保持。',
  'insight.todayUnder.plain': '今天已花 {spent}，还可以花 {safe}。',

  'insight.noSpendYet.soft.1': '还没花钱。今天的 {line} 都还是你的。',
  'insight.noSpendYet.soft.2': '一张白纸：今天有 {line}。',
  'insight.noSpendYet.cheeky.1': '今天 {line}，一分没动。暂时。',
  'insight.noSpendYet.cheeky.2': '今天 {line} 满格，原封未动。目前而已。',
  'insight.noSpendYet.roast.1': '还没花钱。{line} 正等着看你下一步。',
  'insight.noSpendYet.roast.2': '{line} 就这么放着，一分没花。可疑。继续。',
  'insight.noSpendYet.plain': '还没有支出。今天的额度是 {line}。',

  'insight.waitingTonight.soft.1': {
    other: '{count} 笔支出（{amount}）等着今晚过一遍。一分钟搞定。',
  },
  'insight.waitingTonight.soft.2': {
    other: '今晚要过一遍 {count} 笔支出，共 {amount}。',
  },
  'insight.waitingTonight.cheeky.1': {
    other: '{count} 笔支出（{amount}）正等着今晚的判决。',
  },
  'insight.waitingTonight.cheeky.2': {
    other: '今晚日结：{count} 笔，{amount}。轻松。',
  },
  'insight.waitingTonight.roast.1': {
    other: '{count} 笔支出，{amount}，在等你。它们不会自己结掉，一分钟就够。',
  },
  'insight.waitingTonight.roast.2': {
    other: '{count} 笔支出，{amount}，等你说一句“对，是我花的”。',
  },
  'insight.waitingTonight.plain': {
    other: '{count} 笔支出（{amount}）等待今晚日结。',
  },

  'insight.paydaySoon.soft.1': {
    other: '还有 {count} 天发薪。快到了。',
  },
  'insight.paydaySoon.soft.2': {
    other: '离发薪日 {payday} 还有 {count} 天。坚持住。',
  },
  'insight.paydaySoon.cheeky.1': {
    other: '{count} 天后发薪。我已经闻到味儿了。',
  },
  'insight.paydaySoon.cheeky.2': {
    other: '再睡 {count} 觉就发薪了。',
  },
  'insight.paydaySoon.roast.1': {
    other: '还有 {count} 天发薪。守住防线。',
  },
  'insight.paydaySoon.roast.2': {
    other: '{payday} 发薪。在那之前，钱包拉链拉好。',
  },
  'insight.paydaySoon.plain': {
    other: '距发薪日还有 {count} 天（{payday}）。',
  },

  'insight.billDueToday.soft.1': '{bill}（{amount}）今天到期。',
  'insight.billDueToday.soft.2': '提醒一下：{bill}，{amount}，今天到期。',
  'insight.billDueToday.cheeky.1': '{bill} 今天要来收它的 {amount}。',
  'insight.billDueToday.cheeky.2': '今日嘉宾：{bill}，{amount}。',
  'insight.billDueToday.roast.1': '{bill} 今天到期。它可不等人。',
  'insight.billDueToday.roast.2': '今天给 {bill} 交 {amount}。别已读不回。',
  'insight.billDueToday.plain': '{bill}（{amount}）今天到期。',

  'insight.billDue.soft.1': {
    other: '{bill}（{amount}）{count} 天后到期。',
  },
  'insight.billDue.soft.2': {
    other: '提醒：{bill}，{amount}，{count} 天后。',
  },
  'insight.billDue.cheeky.1': {
    other: '{bill} 还有 {count} 天就要来收 {amount}。',
  },
  'insight.billDue.cheeky.2': {
    other: '{count} 天后：{bill}，{amount}。记一下。',
  },
  'insight.billDue.roast.1': {
    other: '{bill} 还有 {count} 天要收 {amount}。它每次都这样。',
  },
  'insight.billDue.roast.2': {
    other: '{count} 天后给 {bill} 交 {amount}。别装作很意外。',
  },
  'insight.billDue.plain': {
    other: '{bill}（{amount}）{count} 天后到期。',
  },

  'insight.categoryPaceUp.soft.1': '{category} 本周期已花 {now}，和上次同期相比{compare}。',
  'insight.categoryPaceUp.soft.2': '{category} 跑得有点快：目前 {now}，上个周期是 {before}。',
  'insight.categoryPaceUp.cheeky.1': '{category}：已经 {now} 了。上个周期这时才 {before}。嗯……',
  'insight.categoryPaceUp.cheeky.2': '{category} 最近很活跃：{now}，上次 {before}。',
  'insight.categoryPaceUp.roast.1':
    '{category} 到 {now} 了。上个周期：{before}。我看见了。安静一周就能拉平。',
  'insight.categoryPaceUp.roast.2':
    '{category} 已经花了 {now}，上次是 {before}。随口一说，带着爱。',
  'insight.categoryPaceUp.plain': '{category}：本周期 {now}，上个周期同期 {before}。',

  'insight.categoryPaceDown.soft.1': '{category} 降到了 {now}，上个周期是 {before}。真好。',
  'insight.categoryPaceDown.soft.2': '{category} 和上个周期相比{compare}：{now}，上次 {before}。',
  'insight.categoryPaceDown.cheeky.1': '{category}：{now}，比上次的 {before} 少。可以啊你。',
  'insight.categoryPaceDown.cheeky.2': '{category} 减肥成功：{now}，上次 {before}。',
  'insight.categoryPaceDown.roast.1': '{category} 才 {now}？上次可是 {before}。就保持这个版本吧。',
  'insight.categoryPaceDown.roast.2': '{category} 花了 {now}，从 {before} 降下来。成长了。',
  'insight.categoryPaceDown.plain': '{category}：本周期 {now}，上个周期同期 {before}。',

  'insight.repeatMerchant.soft.1': '这周去了 {merchant} 共 {visits} 次。他们一定很爱你。',
  'insight.repeatMerchant.soft.2': '周一以来去 {merchant} 已有 {visits} 次，共 {amount}。',
  'insight.repeatMerchant.cheeky.1': '又是 {merchant}？周一到现在第 {visits} 次了。',
  'insight.repeatMerchant.cheeky.2': '你和 {merchant}：这周约会 {visits} 次，{amount}。',
  'insight.repeatMerchant.roast.1': '{merchant}，第 {visits} 次光临。店员认识你了吗？',
  'insight.repeatMerchant.roast.2':
    '这周在 {merchant} 花了 {amount}。{visits} 次。这是一种生活方式。',
  'insight.repeatMerchant.plain': '{merchant}：本周 {visits} 次，{amount}。',

  'insight.firstTimeMerchant.soft.1': '第一次去 {merchant}。希望体验不错。',
  'insight.firstTimeMerchant.soft.2': '新地方：{merchant}，{amount}。',
  'insight.firstTimeMerchant.cheeky.1': '{merchant}？新店。挺敢尝鲜。',
  'insight.firstTimeMerchant.cheeky.2': '哦，{merchant}。这家没见过。',
  'insight.firstTimeMerchant.roast.1': '{merchant}。新地方，老钱包。',
  'insight.firstTimeMerchant.roast.2': '第一次去 {merchant}。别养成习惯。或者，养也行。',
  'insight.firstTimeMerchant.plain': '首次在 {merchant} 消费：{amount}。',

  'insight.biggestSpend.soft.1': '本周最大一笔：{merchant}，{amount}。',
  'insight.biggestSpend.soft.2': '{merchant}，{amount}：本周最大一笔。计划兜得住。',
  'insight.biggestSpend.cheeky.1': '本周头条：{merchant}，{amount}。',
  'insight.biggestSpend.cheeky.2': '在 {merchant} 花了 {amount}。看来是犒劳自己。',
  'insight.biggestSpend.roast.1': '在 {merchant} 花了 {amount}。本周主角。',
  'insight.biggestSpend.roast.2': '{merchant} 这周拿走了 {amount}。值吗？别回答。计划兜得住。',
  'insight.biggestSpend.plain': '本周最大支出：{merchant}，{amount}。',

  'insight.underStreak.soft.1': '连续 {days} 天没超额度。稳稳的你。',
  'insight.underStreak.soft.2': '连着 {days} 天，平平稳稳。',
  'insight.underStreak.cheeky.1': '{days} 天没超额度。连胜时代。',
  'insight.underStreak.cheeky.2': '连续 {days} 天没超额度。别立flag。',
  'insight.underStreak.roast.1': '{days} 天没超额度。我准备好的段子，全浪费了。',
  'insight.underStreak.roast.2': '连续 {days} 天了。我的段子快用完了。',
  'insight.underStreak.plain': '连续 {days} 天日结时未超出额度。',

  'insight.closeStreak.soft.1': '连续日结 {days} 天。这就是仪式感。',
  'insight.closeStreak.soft.2': '连续 {days} 天日结。谢谢你每天都来。',
  'insight.closeStreak.cheeky.1': '连续 {days} 次日结。习惯已解锁。',
  'insight.closeStreak.cheeky.2': '连胜：{days}。今晚继续加一。',
  'insight.closeStreak.roast.1': '连续 {days} 天。连胜很适合你，别断了。',
  'insight.closeStreak.roast.2': '已连续日结 {days} 次。这时候可别断。',
  'insight.closeStreak.plain': '已连续日结 {days} 天。',

  'insight.weekSpare.soft.1': {
    other: '本周 {count} 天没超额度：{spare} 顺延到后面的日子。',
  },
  'insight.weekSpare.soft.2': {
    other: '本周省下 {spare}，留给后面的日子。',
  },
  'insight.weekSpare.cheeky.1': {
    other: '{count} 个好日子省下 {spare}。未来的日子说谢谢。',
  },
  'insight.weekSpare.cheeky.2': {
    other: '本周领先 {spare}。丝滑。',
  },
  'insight.weekSpare.roast.1': {
    other: '{count} 天没超，省下 {spare}。别一口气花光。',
  },
  'insight.weekSpare.roast.2': {
    other: '本周多出 {spare}。准了。',
  },
  'insight.weekSpare.plain': {
    other: '本周已日结的日子共结余 {spare}。',
  },

  'insight.weekOver.soft.1': '本周超了 {over}。接下来的日子会少一点，没关系。',
  'insight.weekOver.soft.2': '本周超了 {over}。我们慢慢抹平。',
  'insight.weekOver.cheeky.1': '本周超了 {over}。这个月剩下的日子会自动调整。',
  'insight.weekOver.cheeky.2': '目前超了 {over}。只是剧情转折，不是结局。',
  'insight.weekOver.roast.1': '本周：超了 {over}。下周安静点，这个月扛得住。',
  'insight.weekOver.roast.2': '超了 {over}。这周忘了吧，这个月慢慢补。',
  'insight.weekOver.plain': '本周已日结的日子共超出额度 {over}。',

  'insight.potMilestone.soft.1': '{pot} 已超过 {percent}%。看它慢慢长大。',
  'insight.potMilestone.soft.2': '{pot} 已完成 {percent}%。',
  'insight.potMilestone.cheeky.1': '{pot}：{percent}%了。要成了。',
  'insight.potMilestone.cheeky.2': '{pot} 完成 {percent}%。继续投喂。',
  'insight.potMilestone.roast.1': '{pot} 到 {percent}%了。存钱罐在赢。让它赢。',
  'insight.potMilestone.roast.2': '{pot} 已到 {percent}%。别去掏它。',
  'insight.potMilestone.plain': '{pot} 已超过目标的 {percent}%。',

  'insight.potFull.soft.1': '{pot} 存满了。是你做到的。',
  'insight.potFull.soft.2': '{pot}：完成。好好享受吧，真心的。',
  'insight.potFull.cheeky.1': '{pot} 存满啦！撒花，小声点。',
  'insight.potFull.cheeky.2': '{pot}，满到冒尖。',
  'insight.potFull.roast.1': '{pot} 存满了。我准备了段子，结果你用不上。',
  'insight.potFull.roast.2': '存钱罐满了：{pot}。现在把它花在本来的用途上吧。',
  'insight.potFull.plain': '{pot} 已达成目标。',

  'insight.workToClaim.soft.1': {
    other: '{count} 笔工作支出（{amount}）待报销。',
  },
  'insight.workToClaim.soft.2': {
    other: '{amount} 工作支出，共 {count} 笔，等着报销。',
  },
  'insight.workToClaim.cheeky.1': {
    other: '公司欠你 {amount}，攒了 {count} 张小票。',
  },
  'insight.workToClaim.cheeky.2': {
    other: '{count} 笔工作支出，{amount}。去要回来。',
  },
  'insight.workToClaim.roast.1': {
    other: '公司欠你 {amount}。{count} 笔了。别不好意思。',
  },
  'insight.workToClaim.roast.2': {
    other: '你在用 {amount} 给公司垫钱。快去报销。',
  },
  'insight.workToClaim.plain': {
    other: '{count} 笔工作支出（{amount}）待报销。',
  },
};
