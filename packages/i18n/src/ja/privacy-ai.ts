import type { Entry } from '../catalogue-types';
import type { enPrivacyAi } from '../en-privacy-ai';

export const jaPrivacyAi: { readonly [Key in keyof typeof enPrivacyAi]: Entry } = {
  'privacy.ai.title': '6pmはどこで考える？',
  'privacy.ai.sub':
    '質問への答えや相棒のひとことを、どこで作るか。「設定」でいつでも変更できます。',
  'privacy.ai.server.title': '6pmのサーバーで、Claudeと',
  'privacy.ai.server.text':
    'いちばん的確な答えと、ベトナム語もきちんと聞き取る音声入力。スマホから出るのは質問かいくつかの事実だけで、支出の一覧は出ません。',
  'privacy.ai.server.tag': 'おすすめ',
  'privacy.ai.device.title': 'このiPhoneの中だけで',
  'privacy.ai.device.text':
    'AIのためにスマホから出るものはありません。モデルはWi‑Fiで一度だけダウンロードします。',
  'privacy.ai.device.unavailable': 'このiPhoneには、専用モデルを動かすだけのメモリがありません。',
  'privacy.ai.models': 'モデル',
  'privacy.model.fast': 'いちばん速くて軽い',
  'privacy.model.words': '言葉づかいが一番',
  'privacy.model.reading': '質問に一番強い',
  'privacy.model.size': '{size} GB',
  'privacy.model.download': 'ダウンロード',
  'privacy.model.downloading': '{percent}%',
  'privacy.model.verifying': '確認中',
  'privacy.model.ready': '準備完了',
  'privacy.model.failed': 'もう一度',
  'privacy.model.delete': '削除',
  'privacy.model.later': 'ダウンロード中もそのまま使えます。',
  'settings.ai': 'AI',
  'settings.ai.server': '6pmのサーバー',
  'settings.ai.device': 'このiPhone',
  'privacy.leaves.title': 'スマホから出るもの',
  'privacy.leaves.server.ask': '質問と、それを読むためのカテゴリ名・貯金箱名',
  'privacy.leaves.server.lines': '相棒のひとことに使う、いくつかの事実',
  'privacy.leaves.server.receipts': 'スマホで読み取れなかったレシートの写真',
  'privacy.leaves.server.voice': '話している間の音声（文字にするため）',
  'privacy.leaves.device.none': 'AIのためには何も出ません。すべてこのiPhoneの中で処理します。',
  'privacy.leaves.device.network':
    '為替レート（日付のみ）、アプリのアップデート、購入にはインターネットを使います。',
  'privacy.leaves.device.emails': 'このモードではレシートメールはオフになります。',
};
