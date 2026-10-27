import type { Entry } from '../catalogue-types';
import type { enVoice } from '../en-voice';

export const zhHansVoice: { readonly [Key in keyof typeof enVoice]: Entry } = {
  'voice.listening': '正在听',
  'voice.sayIt': '说吧',
  'voice.nothingTap': '我没听清。点一下再说一遍。',
  'voice.noAmount': '没听到金额。把多少钱也说出来，比如“45k”。',
  'voice.unavailable': '语音需要这台 iPhone 支持{language}听写',
  'voice.language.vi': '越南语',
  'voice.language.en': '英语',
  'voice.denied': '6pm 没有麦克风或语音识别权限。',
  'voice.openSettings': '打开设置',
  'voice.tapHint': '说一笔现金支出',
  'voice.promptTap': '就像给朋友发消息那样说',
  'voice.reading': '正在理解',
  'voice.gotIt': '明白了',
  'voice.doneTalking': '说完了',
  'voice.cancel': '取消',
  'voice.heard': '听到了“{said}”',
  'voice.micHint': '说一笔支出',
  'voice.stopHint': '停止聆听',
};
