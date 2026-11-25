import type { LiveLines } from './live-lines';

export const liveLinesJa: LiveLines = {
  clock: (time, left) => `いまの時刻 ${time} · 次の締めまで${left}`,
  closeNow: '6時です。今日を締めよう。',
  duration: (h, m) => (h ? `${h}時間${m}分` : `${m}分`),
  countdown: (d, h, m) => `公開まであと${d}日${h}時間${m}分`,
  out: '配信中',
  sent: '登録しました。6時にまた会いましょう。',
  notAnEmail: 'メールアドレスの形になっていないようです。',
  busy: '試行回数が多すぎます。1分ほど待ってから、もう一度お試しください。',
  unreachable: 'リストにつながりませんでした。通信状況を確認して、もう一度お試しください。',
};
