import type { Entry } from '../catalogue-types';
import type { enAskChat } from '../en-ask-chat';

// Small talk in the companion's voice; the safety lines are plain and keep Vietnam's numbers.
export const zhHansAskChat: { readonly [Key in keyof typeof enAskChat]: Entry } = {
  'ask.chat.greeting.soft': '嗨！想看看钱的情况，随时找我。',
  'ask.chat.greeting.cheeky': '嘿嘿。钱的事尽管问，你的数字都在我这儿。',
  'ask.chat.greeting.roast': '哦，是你啊。来问情况有多糟？',
  'ask.chat.greeting.plain': '你好。可以问我关于支出、账单或存钱罐的问题。',
  'ask.chat.thanks.soft': '不客气。今天也要好好照顾自己。',
  'ask.chat.thanks.cheeky': '不客气！按时日结就当付我工钱了。',
  'ask.chat.thanks.roast': '别谢我。谢谢那个你差点就守住的预算吧。',
  'ask.chat.thanks.plain': '不客气。',
  'ask.chat.offTopic.soft': '这个不归我管。不过钱的事？我随时奉陪。',
  'ask.chat.offTopic.cheeky': '这不归我管。不如问问我你的钱都去哪儿了 👀',
  'ask.chat.offTopic.roast': '我是预算，不是搜索引擎。问问你的支出吧。',
  'ask.chat.offTopic.plain': '我只能帮你处理 6pm 里和钱有关的事。',
  'ask.chat.identity':
    '我是你在 6pm 里的小伙伴。我给你的每个数字，都是在你的手机上根据你自己的支出算出来的。我是程序，不是真人。',
  'ask.chat.privacy':
    '我看不到你的银行账户。我只知道 6pm 里的内容，而这些都留在你的手机上。为了读懂一个问题，我们的服务器会看到这个问题，以及你的分类和存钱罐名称；为了写一句话，只会用到其中的几条信息。',
  'ask.chat.venting.soft': '听起来好沉重。你不是一个人在扛。',
  'ask.chat.venting.cheeky': '这把有点难。深呼吸：这只是个数字，不是判决书。',
  'ask.chat.venting.plain': '为钱发愁，是真实的压力。',
  'ask.chat.goingRight': '有一件事做得不错：',
  'ask.chat.freshStart': '明天会有全新的额度。',
  'ask.chat.roast.soft': '那就温柔地说一句：',
  'ask.chat.roast.cheeky': '好吧，是你自己要求的。',
  'ask.chat.roast.roast': '坐稳了。',
  'ask.chat.roast.plain': '最突出的一点：',
  'ask.chat.roastNothing.soft': '没什么好调侃的。你做得很好。',
  'ask.chat.roastNothing.cheeky': '我看过了。说实话？没什么可吐槽的。有点烦。',
  'ask.chat.roastNothing.roast': '本想吐槽你一番，结果你啥也没给我。过分。',
  'ask.chat.roastNothing.plain': '目前没有特别突出的地方。',
  'ask.chat.hype.soft': '你值得听到这句话：',
  'ask.chat.hype.cheeky': '夸夸模式开启：',
  'ask.chat.hype.roast': '行吧。该夸的还是要夸：',
  'ask.chat.hype.plain': '做得不错的一点：',
  'ask.chat.hypeNothing.soft': '你来了，还看了一眼。这就算数。',
  'ask.chat.hypeNothing.cheeky': '你主动打开了一个记账 App。传奇。',
  'ask.chat.hypeNothing.roast': '你来了，已经比大多数人强。勉强为你骄傲。',
  'ask.chat.hypeNothing.plain': '继续下去，积少成多。',
  'ask.chat.distress':
    '很抱歉你现在这么难受。你不必一个人扛：和你信任的人聊一聊，或者拨打 Ngày Mai 心理热线 096 306 1414（周三至周日，13:00 至 20:30）。如果你现在有危险，请拨打 115。',
  'ask.chat.investing':
    '我没法告诉你该投资什么、什么时候投；这需要持牌顾问。我可以告诉你每月能剩多少，或者存钱罐存得有多快。',
  'ask.chat.unsafe':
    '这个我不能帮你。如果手头紧，我可以告诉你到发薪日还剩多少，或者你的存钱罐能顶上多少。如果有非法放贷人在威胁你，请拨打 113 报警。',
};
