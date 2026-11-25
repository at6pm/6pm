import type { LiveLines } from './live-lines';

export const liveLinesZhHans: LiveLines = {
  clock: (time, left) => `你那里现在 ${time} · 距下次日结还有 ${left}`,
  closeNow: '六点了。结束今天吧。',
  duration: (h, m) => (h ? `${h} 小时 ${m} 分` : `${m} 分钟`),
  countdown: (d, h, m) => `距上线还有 ${d} 天 ${h} 小时 ${m} 分钟`,
  out: '现已上线',
  sent: '你已加入名单。六点见。',
  notAnEmail: '这看起来还不像一个邮箱地址。',
  busy: '这里尝试次数太多了。等一分钟再试吧。',
  unreachable: '连不上名单。检查一下网络再试试。',
};
