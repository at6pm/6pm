import type { Entry } from '../catalogue-types';
import type { enInsightsHabits } from '../en-insights-habits';

// Same voice as the other companion lines: lead with the number, tease the habit, end with a way
// forward. 节奏 is the cycle's pace; 平均节奏 an even pace.
export const zhHansInsightsHabits: { readonly [Key in keyof typeof enInsightsHabits]: Entry } = {
  'insight.noSpendDay.soft.1': '一分钱都没花的一天：{kept} 原封不动。',
  'insight.noSpendDay.soft.2': '零支出的一天。守住了 {kept}，安安静静，真好。',
  'insight.noSpendDay.cheeky.1': '零支出，{kept} 没动。钱包今天放假。',
  'insight.noSpendDay.cheeky.2': '整整一天，一分没花。{kept} 向你道谢。',
  'insight.noSpendDay.roast.1': '一分没花，{kept} 没动。这是谁？能多待几天吗？',
  'insight.noSpendDay.roast.2': '一笔都没花，守住 {kept}。商家们会挺过去的。',
  'insight.noSpendDay.plain': '上一个日结日没有支出；当天额度保留了 {kept}。',

  'insight.noSpendStreak.soft.1': '连续 {days} 天安安静静：{kept} 原封不动。',
  'insight.noSpendStreak.soft.2': '{days} 天没有支出。{kept} 一直陪着你。',
  'insight.noSpendStreak.cheeky.1': '{days} 天，零支出。钱包开始起疑了。',
  'insight.noSpendStreak.cheeky.2': '连续 {days} 天零支出。{kept} 正在好好休息。',
  'insight.noSpendStreak.roast.1': '{days} 天一笔没花。你常去的咖啡店开始担心你了。',
  'insight.noSpendStreak.roast.2': '{days} 天零支出，{kept} 没动。别搞得这么吓人。',
  'insight.noSpendStreak.plain': '连续 {days} 个日结日没有支出；保留了 {kept}。',

  'insight.backUnder.soft.1': '超了一天之后，又回到额度内了：还剩 {spare}。做得好。',
  'insight.backUnder.soft.2': '超一天，再省一天，剩下 {spare}。这就是节奏。',
  'insight.backUnder.cheeky.1': '逆袭剧情：回到额度内，还剩 {spare}。',
  'insight.backUnder.cheeky.2': '昨天超，今天省下 {spare}。平衡。',
  'insight.backUnder.roast.1': '刚超完一天，就省下 {spare}。道歉收到了。',
  'insight.backUnder.roast.2': '回到额度内，还剩 {spare}。等的就是这波回归。',
  'insight.backUnder.plain': '超出一天后回到额度内，结余 {spare}。',

  'insight.logGap.soft.1': '{since} 之后就没记过账。是清闲，还是太忙？',
  'insight.logGap.soft.2': '已经 {days} 天没记支出了。有什么要补上吗？',
  'insight.logGap.cheeky.1': '{since} 之后什么都没记。修行模式，还是忙晕了？',
  'insight.logGap.cheeky.2': '{days} 天，什么都没记。钱包去度假了？',
  'insight.logGap.roast.1': '{since} 之后一笔都没有。是真没花，还是没记下来？',
  'insight.logGap.roast.2': '沉默了 {days} 天。一杯咖啡也算数，补上就扯平了。',
  'insight.logGap.plain': '{since} 之后没有记录任何支出。',

  'insight.weekendHeavy.soft.1':
    '最近周末一天大约花 {weekend}，工作日 {weekday}。周六之前可以想一想。',
  'insight.weekendHeavy.soft.2': '周末一天 {weekend}，工作日一天 {weekday}。慢慢来。',
  'insight.weekendHeavy.cheeky.1': '工作日：一天 {weekday}。周末：{weekend}。周六对你另有安排。',
  'insight.weekendHeavy.cheeky.2':
    '周末平均一天 {weekend}，工作日 {weekday}。周末要来了，准备好了吗？',
  'insight.weekendHeavy.roast.1': '工作日 {weekday}，周末一天 {weekend}。周末一直在赢；打个平手？',
  'insight.weekendHeavy.roast.2': '周末：一天 {weekend}。工作日：{weekday}。这个周末，再战一局？',
  'insight.weekendHeavy.plain': '过去四周：周末平均每天 {weekend}，工作日每天 {weekday}。',

  'insight.recordDay.soft.1': '今天 {amount}，是 {days} 天里花得最多的一天。没关系，明天重新开始。',
  'insight.recordDay.soft.2': '今天的 {amount} 是 {days} 天以来最多的。计划会为它调整。',
  'insight.recordDay.cheeky.1': '今天 {amount}。创了新高，只不过不是我们想要的那张图。明天重来。',
  'insight.recordDay.cheeky.2': '新纪录：{amount}，{days} 天里最多。别再来一次了。',
  'insight.recordDay.roast.1': '今天 {amount}，{days} 天里最多。够勇。明天来个小点的返场。',
  'insight.recordDay.roast.2': '一天花了 {amount}，{days} 天纪录。裱起来，然后歇歇。',
  'insight.recordDay.plain': '今天的 {amount} 是过去 {days} 天中单日支出最多的。',

  'insight.likelySubscription.soft.1': '{merchant} 每月扣款约 {amount}。设为固定账单吗？',
  'insight.likelySubscription.soft.2':
    '连续 {months} 个月给 {merchant} 付 {amount}。要设为账单吗？',
  'insight.likelySubscription.cheeky.1':
    '又是 {merchant}，{amount}，准时得像闹钟。订阅，我看见你了。设为账单？',
  'insight.likelySubscription.cheeky.2':
    '{merchant} 已经 {months} 个月，每次 {amount}。还在用吗？加到账单里吧。',
  'insight.likelySubscription.roast.1':
    '{merchant}：{amount}，连续 {months} 个月。是还在用，还是只在付钱？',
  'insight.likelySubscription.roast.2':
    '每月给 {merchant} 付 {amount}。还要吗？要就设为账单，不要就退订。',
  'insight.likelySubscription.plain':
    '{merchant} 已连续 {months} 个月每月扣款约 {amount}，可以设为固定账单。',

  'insight.lateNight.soft.1': '深夜在 {merchant} 花了 {amount}。希望有帮到你。',
  'insight.lateNight.soft.2': '{merchant}，{amount}，天黑以后。睡个好觉。',
  'insight.lateNight.cheeky.1': '{merchant}，{amount}，早过了睡觉时间。夜猫子购物。',
  'insight.lateNight.cheeky.2': '深夜 {merchant}，{amount}。经典。',
  'insight.lateNight.roast.1': '凌晨在 {merchant} 花了 {amount}。大决定还是白天做比较好。',
  'insight.lateNight.roast.2': '夜里的 {merchant}，{amount}。下次购物车先放一晚再说。',
  'insight.lateNight.plain': '一笔深夜支出：{merchant}，{amount}。',

  'insight.cycleHalfway.soft.1': '周期过半：用了 {percent}%，还剩 {left}。',
  'insight.cycleHalfway.soft.2': '周期过了一半，还有 {left} 可自由花。你一直在记，这才是最难的。',
  'insight.cycleHalfway.cheeky.1': '中场休息。比分：用了 {percent}%，还有 {left} 可以玩。',
  'insight.cycleHalfway.cheeky.2': '走到一半了。下半场还有 {left}。',
  'insight.cycleHalfway.roast.1': '中场：用了 {percent}%。下半场 {left}，好好踢。',
  'insight.cycleHalfway.roast.2': '过半，用掉 {percent}%，还剩 {left}。胜负看下半场。',
  'insight.cycleHalfway.plain': '周期已过半：已用 {percent}%，剩余 {left}。',

  'insight.firstWeekPaceUp.soft.1':
    '第一周用掉了周期的 {percent}%；平均节奏是 {even}%。后面几周能慢慢拉平。',
  'insight.firstWeekPaceUp.soft.2': '忙碌的第一周：用了周期 {percent}%的钱。平稳几天就能拉回来。',
  'insight.firstWeekPaceUp.cheeky.1':
    '第一周：用掉 {percent}%，平均节奏是 {even}%。开局很猛。可能猛过头了。',
  'insight.firstWeekPaceUp.cheeky.2': '第一周花了 {percent}%。平均应该是 {even}%。悠着点。',
  'insight.firstWeekPaceUp.roast.1':
    '第一周吃掉了周期的 {percent}%。平均是 {even}%。其他几周想跟你聊聊。',
  'insight.firstWeekPaceUp.roast.2': '一周 {percent}%，平均才 {even}%。冲刺完了，接下来慢跑。',
  'insight.firstWeekPaceUp.plain': '第一周用掉了周期资金的 {percent}%；平均节奏为 {even}%。',

  'insight.firstWeekPaceDown.soft.1':
    '第一周只用了周期的 {percent}%；平均节奏是 {even}%。开了个好头。',
  'insight.firstWeekPaceDown.soft.2': '温和的第一周：用了 {percent}%，和平均节奏相比{compare}。',
  'insight.firstWeekPaceDown.cheeky.1': '第一周：才 {percent}%，低于平均的 {even}%。开局丝滑。',
  'insight.firstWeekPaceDown.cheeky.2': '第一周：{percent}%。平均是 {even}%。厉害了。',
  'insight.firstWeekPaceDown.roast.1':
    '第一周用了 {percent}%，低于平均的 {even}%。好得有点可疑。保持住。',
  'insight.firstWeekPaceDown.roast.2': '第一周 {percent}%，平均是 {even}%。无可挑剔。',
  'insight.firstWeekPaceDown.plain': '第一周用掉了周期资金的 {percent}%；平均节奏为 {even}%。',

  'insight.paceSpare.soft.1': '照这个节奏，到发薪日（{payday}）大约还能剩 {spare}。',
  'insight.paceSpare.soft.2': '保持下去，到 {payday} 还能剩 {spare} 左右。',
  'insight.paceSpare.cheeky.1': '{payday} 预计结余：{spare}。别在脑子里先花掉。',
  'insight.paceSpare.cheeky.2': '照这样，到 {payday} 能剩 {spare}。不错。',
  'insight.paceSpare.roast.1': '照这个节奏，{payday} 能剩 {spare}。钱还没出现，先别花。',
  'insight.paceSpare.roast.2': '预报：{payday} 剩 {spare}。让预报保持准确。',
  'insight.paceSpare.plain': '按目前的节奏，发薪日（{payday}）大约剩余 {spare}。',

  'insight.paceShort.soft.1':
    '照这个节奏，{runsOut} 前后会有点紧，早于发薪日（{payday}）。少花几天就好。',
  'insight.paceShort.soft.2':
    '提醒一下：照这样，{runsOut} 左右会不够。少花一点会有帮助，时间还来得及。',
  'insight.paceShort.cheeky.1':
    '这条路线 {runsOut} 左右就没油了；发薪日是 {payday}。要不要换条路？',
  'insight.paceShort.cheeky.2':
    '照这个节奏，钱在 {runsOut} 左右见底。发薪日是 {payday}。接下来温柔点。',
  'insight.paceShort.roast.1':
    '这个节奏 {runsOut} 左右就见底，发薪日却是 {payday}。安静几天，就能稳稳落地。',
  'insight.paceShort.roast.2':
    '{runsOut}：照这个节奏钱花完的日子。{payday}：发薪日。一起把这个缺口补上。',
  'insight.paceShort.plain': '按目前的节奏，钱将在 {runsOut} 左右用完，早于发薪日（{payday}）。',
};
