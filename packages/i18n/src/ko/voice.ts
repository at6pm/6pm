import type { Entry } from '../catalogue-types';
import type { enVoice } from '../en-voice';

// Short, friendly prompts; the spoken example is the amount as people say it, “45k”.
export const koVoice: { readonly [Key in keyof typeof enVoice]: Entry } = {
  'voice.listening': '듣는 중',
  'voice.sayIt': '말하기',
  'voice.nothingTap': '잘 못 들었어요. 탭하고 다시 말해 주세요.',
  'voice.noAmount': '금액이 안 들렸어요. “45k”처럼 얼마인지도 말해 주세요.',
  'voice.unavailable': '음성 입력에는 이 iPhone의 {language} 받아쓰기가 필요해요',
  'voice.language.vi': '베트남어',
  'voice.language.en': '영어',
  'voice.denied': '6pm의 마이크 또는 음성 인식 접근이 꺼져 있어요.',
  'voice.openSettings': '설정 열기',
  'voice.tapHint': '현금 지출 말하기',
  'voice.promptTap': '친구한테 문자 보내듯 말해 보세요',
  'voice.reading': '이해하는 중',
  'voice.gotIt': '알겠어요',
  'voice.doneTalking': '다 말했어요',
  'voice.cancel': '취소',
  'voice.heard': '들은 말: “{said}”',
  'voice.micHint': '지출 말하기',
  'voice.stopHint': '그만 듣기',
};
