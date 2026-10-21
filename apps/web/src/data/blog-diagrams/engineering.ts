/**
 * Diagrams for the engineering series, which is written in English only. Each one draws what its
 * article describes in code: the names are the code's own.
 */
import { W, arrow, box, route, text, type Diagram } from './draw';

const L = 16;
const R = W - 16;
const inner = R - L;

/** A VietQR payload, read as TLV, and what 6pm does with it. */
export function vietqr(): Diagram {
  const rows = [
    ['00', '02', '01', 'payload format'],
    ['01', '02', '12', 'dynamic: a one-off amount'],
    ['38', '57', '…A000000727…', 'NAPAS: BIN, account, service'],
    ['53', '03', '704', 'currency: VND'],
    ['54', '05', '55000', 'amount'],
    ['58', '02', 'VN', 'country'],
    ['62', '..', '08 Banh mi', 'purpose of the transfer'],
    ['63', '04', 'ABCD', 'CRC-16 checksum'],
  ] as const;
  const parts: string[] = [
    text(L, 22, 'ID', { cls: 'mono', size: 10.5 }),
    text(L + 34, 22, 'LEN', { cls: 'mono', size: 10.5 }),
    text(L + 74, 22, 'VALUE', { cls: 'mono', size: 10.5 }),
    text(R, 22, 'MEANING', { cls: 'mono', size: 10.5, anchor: 'end' }),
  ];
  rows.forEach(([id, len, value, meaning], i) => {
    const y = 32 + i * 30;
    const money = id === '54';
    parts.push(box(L, y, inner, 26, money ? 'accent' : 'card', 8));
    parts.push(text(L + 10, y + 17, id, { cls: money ? 'on' : 'num', size: 12 }));
    parts.push(text(L + 40, y + 17, len, { cls: money ? 'on' : 'faint', size: 12 }));
    parts.push(text(L + 74, y + 17, value, { cls: money ? 'on' : 'num', size: 12 }));
    parts.push(
      text(R - 10, y + 17, meaning, { cls: money ? 'on' : 'faint', size: 11.5, anchor: 'end' }),
    );
  });
  const flow = ['Scan', 'Parse on the phone', 'Bank app, filled in', 'Did it go through?'];
  const fw = (inner - 3 * 10) / 4;
  const fy = 32 + rows.length * 30 + 24;
  flow.forEach((step, i) => {
    const x = L + i * (fw + 10);
    parts.push(box(x, fy, fw, 48, i === 3 ? 'accent' : 'card', 12));
    const words = step.split(' ');
    const lines =
      words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : [step];
    parts.push(
      text(x + fw / 2, fy + (lines.length > 1 ? 21 : 29), lines, {
        cls: i === 3 ? 'on' : 'strong',
        anchor: 'middle',
        size: 11.5,
      }),
    );
    if (i < 3) parts.push(arrow(x + fw + 1, fy + 24, x + fw + 9, fy + 24));
  });
  return {
    text: {
      title: 'A VietQR payload, read as ID, length and value',
      desc: 'A VietQR transfer is a flat string of data objects: 00 payload format, 01 dynamic or static, 38 the NAPAS account template with bank BIN, account and service code, 53 currency 704 for đồng, 54 the amount, 58 country VN, 62 additional data with the purpose, and 63 a CRC-16 checksum. 6pm scans it, parses it on the phone, opens the bank app filled in, and asks on return whether it went through.',
      caption:
        'Every field is ID, length, value. Only the amount and the account matter for paying.',
    },
    height: fy + 64,
    body: parts.join(''),
  };
}

/** One capture session, three outputs, one card. */
export function camera(): Diagram {
  const columns = [
    [['Metadata output'], ['QR code,', 'read at once'], ['VietQR parser,', 'or named abroad']],
    [
      ['Video frames,', 'every 100 ms'],
      ['Vision finds', 'the document'],
      ['Held still 0.9 s,', 'or the shutter'],
    ],
    [['Photo output'], ['Full-res photo'], ['Cut out, squared,', 'OCR, parser']],
  ] as const;
  const parts: string[] = [box(L, 16, inner, 40, 'card', 14)];
  parts.push(
    text(W / 2, 41, 'ScanCameraSession · one AVCaptureSession', {
      cls: 'strong',
      anchor: 'middle',
      size: 13,
    }),
  );
  const cw = (inner - 2 * 10) / 3;
  columns.forEach((column, c) => {
    const x = L + c * (cw + 10);
    parts.push(arrow(x + cw / 2, 58, x + cw / 2, 76));
    column.forEach((lines, r) => {
      const y = 78 + r * 74;
      parts.push(box(x, y, cw, 54, r === 0 ? 'soft' : 'card', 12));
      parts.push(
        text(x + cw / 2, y + (lines.length > 1 ? 23 : 32), lines, {
          cls: r === 0 ? 'mono' : 'label',
          anchor: 'middle',
          size: r === 0 ? 10.5 : 12,
        }),
      );
      if (r < 2) parts.push(arrow(x + cw / 2, y + 56, x + cw / 2, y + 72));
    });
    parts.push(arrow(x + cw / 2, 78 + 2 * 74 + 56, W / 2 + (c - 1) * 40, 318));
  });
  parts.push(box(L, 320, inner, 50, 'accent', 25));
  parts.push(
    text(W / 2, 350, 'A card: shop, total, category · Save', {
      cls: 'on',
      anchor: 'middle',
      size: 14,
    }),
  );
  parts.push(
    text(W / 2, 392, 'Not sure of the total? One closer look on the server.', {
      cls: 'faint',
      anchor: 'middle',
      size: 11.5,
    }),
  );
  return {
    text: {
      title: 'One camera session, three outputs',
      desc: 'ScanCameraSession runs one AVCaptureSession. Its metadata output reads QR codes at once and hands them to the VietQR parser or names a foreign code. Its video frames, looked at every 100 ms, let Vision find the receipt; once it is held still for 0.9 s, or the shutter is pressed, the photo output takes a full-resolution photo that is cut out, squared up, read with OCR and parsed. Both end in one card with the shop, total and category. When the phone is not sure of the total, the server takes one closer look.',
      caption: 'QR codes and receipts from one session, read on the phone.',
    },
    height: 404,
    body: parts.join(''),
  };
}

/** The app, the App Group container and the extensions around it. */
export function widgets(): Diagram {
  const parts: string[] = [box(L, 16, inner, 58, 'accent', 16)];
  parts.push(text(L + 16, 40, 'The app (Expo, React Native)', { cls: 'on', size: 14 }));
  parts.push(text(L + 16, 60, 'SQLCipher database · TypeScript domain', { cls: 'on', size: 12 }));
  const cw = (inner - 12) / 2;
  const fy = 118;
  const folders = [
    ['surfaces/', 'what extensions show', 'written by the app'],
    ['inbox/', 'one JSON file per capture', 'imported, then deleted'],
  ] as const;
  parts.push(
    text(W / 2, fy - 12, 'APP GROUP CONTAINER', { cls: 'mono', anchor: 'middle', size: 9.5 }),
  );
  folders.forEach(([name, what, how], i) => {
    const x = L + i * (cw + 12);
    parts.push(box(x, fy, cw, 74, 'card', 14));
    parts.push(text(x + 14, fy + 24, name, { cls: 'num', size: 13 }));
    parts.push(text(x + 14, fy + 44, what, { cls: 'label', size: 11.5 }));
    parts.push(text(x + 14, fy + 62, how, { cls: 'faint', size: 11 }));
  });
  parts.push(arrow(L + cw / 2, 76, L + cw / 2, fy - 2));
  parts.push(arrow(L + cw + 12 + cw / 2, fy - 2, L + cw + 12 + cw / 2, 76));
  const ey = fy + 116;
  const left = ['Widgets · 4 families', 'Live Activity · JSON state', 'Controls · Scan, Quick add'];
  const right = ['App Intents · “Log in 6pm”', 'Share extension · Vision'];
  left.forEach((name, i) => {
    parts.push(box(L, ey + i * 46, cw, 38, 'soft', 12));
    parts.push(text(L + 12, ey + i * 46 + 24, name, { size: 11.5 }));
  });
  right.forEach((name, i) => {
    const x = L + cw + 12;
    parts.push(box(x, ey + i * 46, cw, 38, 'soft', 12));
    parts.push(text(x + 12, ey + i * 46 + 24, name, { size: 11.5 }));
  });
  parts.push(arrow(L + cw / 2, fy + 76, L + cw / 2, ey - 2));
  parts.push(arrow(L + cw + 12 + cw / 2, ey - 2, L + cw + 12 + cw / 2, fy + 76));
  parts.push(
    text(W / 2, ey + 3 * 46 + 16, 'Extensions never open the database.', {
      cls: 'faint',
      anchor: 'middle',
      size: 12,
    }),
  );
  return {
    text: {
      title: 'The app, the App Group container and the extensions',
      desc: 'The app owns the SQLCipher database and the TypeScript domain. It writes what extensions show into the App Group’s surfaces folder, which the widgets, the Live Activity and the controls read. The App Intents and Share extensions write each capture as one JSON file into the inbox folder, which the app imports and deletes. Extensions never open the database.',
      caption:
        'Files in a shared folder are the whole contract between the app and its extensions.',
    },
    height: ey + 3 * 46 + 30,
    body: parts.join(''),
  };
}

/** Where a swipe runs: the UI thread every frame, the JS thread once. */
export function threads(): Diagram {
  const lanes = [
    {
      label: 'UI THREAD · EVERY FRAME',
      boxes: [
        ['Finger', 'Gesture Handler'],
        ['Worklet', 'spring, projection'],
        ['Frame', 'drawn, no waiting'],
      ],
    },
    {
      label: 'JS THREAD · ONCE, ON RELEASE',
      boxes: [
        ['Verdict', 'keep, edit, not mine'],
        ['State', 'the spend is saved'],
        ['Haptic', 'and the next card'],
      ],
    },
  ] as const;
  const bw = (inner - 2 * 18) / 3;
  const parts: string[] = [];
  lanes.forEach((lane, l) => {
    const y = 16 + l * 150;
    parts.push(box(L - 6, y, inner + 12, 118, l === 0 ? 'soft' : 'card', 18));
    parts.push(
      text(l === 0 ? L + 6 : R + 2, y + 24, lane.label, {
        cls: 'mono',
        size: 10.5,
        anchor: l === 0 ? 'start' : 'end',
      }),
    );
    lane.boxes.forEach(([head, sub], i) => {
      const x = L + i * (bw + 18);
      parts.push(box(x, y + 40, bw, 58, l === 0 && i === 1 ? 'accent' : 'card', 12));
      const on = l === 0 && i === 1;
      parts.push(
        text(x + bw / 2, y + 64, head, { cls: on ? 'on' : 'strong', anchor: 'middle', size: 13 }),
      );
      parts.push(
        text(x + bw / 2, y + 83, sub, { cls: on ? 'on' : 'faint', anchor: 'middle', size: 10.5 }),
      );
      if (i < 2) parts.push(arrow(x + bw + 2, y + 69, x + bw + 16, y + 69));
    });
  });
  const wx = L + bw + 18 + bw / 2;
  parts.push(
    route([
      [wx, 116],
      [wx, 140],
      [L + bw / 2, 140],
      [L + bw / 2, 204],
    ]),
  );
  return {
    text: {
      title: 'Where a swipe runs',
      desc: 'On the UI thread, every frame: the finger is tracked by Gesture Handler, a worklet runs the spring and projects where the finger was heading, and the frame is drawn without waiting. On the JS thread, once, on release: the verdict (keep, edit or not mine) is recorded, the spend is saved, and a haptic plays with the next card.',
      caption: 'The gesture never waits on JavaScript; JavaScript hears about it once.',
    },
    height: 16 + 2 * 150 - 14,
    body: parts.join(''),
  };
}

/** From the clock to the canvas. */
export function sky(): Diagram {
  const steps = [
    ['The minute and the look', 'Golden Hour, 18:07'],
    ['palette()', 'the prototype’s own colour logic, in TypeScript'],
    ['One flat number[]', 'stops, blooms, sun, ink, grain · a colour is 4 slots'],
    ['One UI-thread tween', 'withTiming on the whole array when the hour turns'],
    ['One Skia <Canvas>', 'gradient · blooms · halftone shader · grain · rain'],
  ] as const;
  const parts: string[] = [];
  steps.forEach(([head, sub], i) => {
    const y = 16 + i * 74;
    const last = i === steps.length - 1;
    parts.push(box(L, y, inner, 54, last ? 'accent' : 'card', 16));
    parts.push(
      text(L + 16, y + 23, head, {
        cls: last ? 'on' : i === 1 || i === 2 ? 'num' : 'strong',
        size: 13.5,
      }),
    );
    parts.push(text(L + 16, y + 42, sub, { cls: last ? 'on' : 'faint', size: 11.5 }));
    if (!last) parts.push(arrow(W / 2, y + 56, W / 2, y + 72));
  });
  return {
    text: {
      title: 'From the clock to the canvas',
      desc: 'The minute and the look go into palette(), the prototype’s colour logic ported to TypeScript. It fills one flat array of numbers: gradient stops, blooms, sun, halftone ink and grain, four slots per colour. When the hour turns, one UI-thread tween moves the whole array, and one Skia canvas draws the gradient, blooms, a halftone shader, grain and rain from it.',
      caption: 'A new hour is one tween of one array; React does not render.',
    },
    height: 16 + steps.length * 74 - 4,
    body: parts.join(''),
  };
}

/** What stays on the phone, what leaves it, and what the server keeps. */
export function privacy(): Diagram {
  const groups = [
    {
      head: 'Stays on the phone',
      tone: 'accent' as const,
      lines: [
        'Every spend, the plan, every closed day',
        'SQLCipher, key in the Keychain, this device only',
        'The maths behind every number, Ask included',
        'VietQR codes and most receipts, read here',
      ],
    },
    {
      head: 'Leaves only when you use it',
      tone: 'card' as const,
      lines: [
        'Ask questions, unsure receipt photos → Anthropic',
        'Forwarded emails → read, sealed, deleted on fetch',
        'Your voice, while you hold the mic → transcriber',
        'Backup (Max) → sealed on the phone first',
      ],
    },
    {
      head: 'The server keeps',
      tone: 'soft' as const,
      lines: ['A hashed device token, the app language,', 'first and last seen. No account.'],
    },
  ];
  const parts: string[] = [];
  let y = 16;
  for (const group of groups) {
    const h = 40 + group.lines.length * 20;
    const on = group.tone === 'accent';
    parts.push(box(L, y, inner, h, group.tone, 16));
    parts.push(text(L + 16, y + 26, group.head, { cls: on ? 'on' : 'strong', size: 14 }));
    parts.push(text(L + 16, y + 48, group.lines, { cls: on ? 'on' : 'faint', size: 11.5 }));
    y += h + 14;
  }
  return {
    text: {
      title: 'What stays on the phone, and what leaves it',
      desc: 'On the phone: every spend, the plan and closed days, in a SQLCipher database whose key stays in this device’s Keychain, plus the maths behind every number and the reading of VietQR codes and most receipts. Leaving only when used: Ask questions and receipt photos the phone could not read with confidence to Anthropic, forwarded emails that are read, sealed and deleted once fetched, voice while the microphone is held, and a backup sealed on the phone first. The server keeps a hashed device token, the app language and first and last seen times.',
      caption: 'The privacy policy, drawn. The code that backs each line is open.',
    },
    height: y,
    body: parts.join(''),
  };
}
