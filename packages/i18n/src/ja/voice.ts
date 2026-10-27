import type { Entry } from '../catalogue-types';
import type { enVoice } from '../en-voice';

export const jaVoice: { readonly [Key in keyof typeof enVoice]: Entry } = {
  'voice.listening': '聞いています',
  'voice.sayIt': '話す',
  'voice.nothingTap': 'うまく聞き取れませんでした。タップしてもう一度話してください。',
  'voice.noAmount': '金額が聞き取れませんでした。「4万5千」のように金額も言ってください。',
  'voice.unavailable': '音声入力には、このiPhoneで{language}の音声入力が使える必要があります',
  'voice.language.vi': 'ベトナム語',
  'voice.language.en': '英語',
  'voice.denied': '6pmのマイクまたは音声認識がオフになっています。',
  'voice.openSettings': '設定を開く',
  'voice.tapHint': '現金の支出を話す',
  'voice.promptTap': '友だちにメッセージするように話してね',
  'voice.reading': '内容を読み取り中',
  'voice.gotIt': 'わかりました',
  'voice.doneTalking': '話し終えた',
  'voice.cancel': 'キャンセル',
  'voice.heard': '「{said}」と聞こえました',
  'voice.micHint': '支出を話す',
  'voice.stopHint': '聞き取りを停止',
};
