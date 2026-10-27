import type { Entry } from '../catalogue-types';
import type { enAskChat } from '../en-ask-chat';

// The companion's casual voice for small talk; the serious topics are plain です・ます.
export const jaAskChat: { readonly [Key in keyof typeof enAskChat]: Entry } = {
  'ask.chat.greeting.soft': 'こんにちは！お金のこと、確かめたくなったらいつでもここにいるよ。',
  'ask.chat.greeting.cheeky': 'やあやあ。お金っぽいことなら何でも聞いて。数字はそろってるよ。',
  'ask.chat.greeting.roast': 'おっと、来たね。どれくらいヤバいか聞きに来た？',
  'ask.chat.greeting.plain': 'こんにちは。支出、固定費、貯金箱について聞いてください。',
  'ask.chat.thanks.soft': 'どういたしまして。今日も自分を大事にね。',
  'ask.chat.thanks.cheeky': 'どういたしまして！お礼は時間どおりの締めで受け付けてます。',
  'ask.chat.thanks.roast': 'お礼ならいいよ。守りかけた予算に言ってあげて。',
  'ask.chat.thanks.plain': 'どういたしまして。',
  'ask.chat.offTopic.soft': 'それは専門外なんだ。でもお金のことなら、何でも付き合うよ。',
  'ask.chat.offTopic.cheeky': 'それは担当外。代わりに、お金がどこへ消えたか聞いてみて 👀',
  'ask.chat.offTopic.roast': 'こっちは家計簿、検索エンジンじゃないよ。支出のことを聞いて。',
  'ask.chat.offTopic.plain': 'お手伝いできるのは、6pmの中のお金のことだけです。',
  'ask.chat.identity':
    '6pmの相棒です。お伝えする数字はすべて、あなた自身の支出からスマホの中で計算しています。人ではなく、プログラムです。',
  'ask.chat.privacy':
    'あなたの銀行口座は見えません。わかるのは6pmの中にあるものだけで、それはスマホから出ません。質問を読むときはサーバーが質問とカテゴリ名・貯金箱名を見て、ひとことを作るときはそこに入るいくつかの事実だけを見ます。',
  'ask.chat.venting.soft': 'それは重たいね。ひとりで抱えなくていいよ。',
  'ask.chat.venting.cheeky': 'しんどいね。深呼吸。これはただの数字で、判決じゃないよ。',
  'ask.chat.venting.plain': 'お金のストレスは、誰にでもあるものです。',
  'ask.chat.goingRight': 'うまくいっていること：',
  'ask.chat.freshStart': '明日は新しいラインで始まります。',
  'ask.chat.roast.soft': 'じゃあ、やさしめにひとつ：',
  'ask.chat.roast.cheeky': 'オッケー、リクエストにお応えして。',
  'ask.chat.roast.roast': '覚悟してね。',
  'ask.chat.roast.plain': '目立っていること：',
  'ask.chat.roastNothing.soft': 'からかうところはないよ。うまくやってるね。',
  'ask.chat.roastNothing.cheeky': '探してみた。正直？ツッコむところがない。くやしい。',
  'ask.chat.roastNothing.roast': 'いじる気満々だったのに、ネタがゼロ。ひどいよ。',
  'ask.chat.roastNothing.plain': '今のところ目立つことはありません。',
  'ask.chat.hype.soft': 'これは聞いてほしいな：',
  'ask.chat.hype.cheeky': '褒めちぎりモード、オン：',
  'ask.chat.hype.roast': 'しかたない。認めるところは認めよう：',
  'ask.chat.hype.plain': 'うまくいっていること：',
  'ask.chat.hypeNothing.soft': 'ちゃんと来て、確かめた。それだけで十分だよ。',
  'ask.chat.hypeNothing.cheeky': '自分から家計簿アプリを開いた。それだけでレジェンド。',
  'ask.chat.hypeNothing.roast': 'ここに来ただけ、たいていの人よりマシ。ちょっとだけ誇らしい。',
  'ask.chat.hypeNothing.plain': 'この調子で続けましょう。積み重なっていきます。',
  'ask.chat.distress':
    'そんな気持ちを抱えているなんて、本当につらいですね。ひとりで抱えこまないでください。信頼できる人に話すか、Ngày Maiのホットライン 096 306 1414（水曜〜日曜、13時〜20時30分）に電話してください。今まさに危険な状態なら、115に電話してください。',
  'ask.chat.investing':
    '何にいつ投資すべきかはお答えできません。それには資格のあるアドバイザーが必要です。毎月どれだけ余裕があるか、貯金箱がどれくらいの速さで貯まっているかなら、お見せできます。',
  'ask.chat.unsafe':
    'それはお手伝いできません。お金が厳しいなら、給料日までの残りや、貯金箱でまかなえる額をお見せできます。違法な貸金業者に脅されているなら、警察（113）に電話してください。',
};
