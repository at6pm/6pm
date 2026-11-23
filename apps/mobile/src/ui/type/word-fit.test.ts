import { describe, expect, it } from '@jest/globals';

import {
  breaksMidWord,
  keepCountersWithNumbers,
  keepHangulWords,
  scaleTextStyle,
  wordFitScale,
  wordsToMeasure,
} from './word-fit';

describe('breaksMidWord', () => {
  it('finds a word iOS cut in two', () => {
    expect(breaksMidWord(['Thán', 'g 10'])).toBe(true);
    expect(breaksMidWord(['4.190.00', '0đ'])).toBe(true);
    expect(breaksMidWord(['Benachrichtigu', 'ngen'])).toBe(true);
  });

  it('accepts breaks between words', () => {
    expect(breaksMidWord(['Bạn khép lại ', 'Tháng 9'])).toBe(false);
    expect(breaksMidWord(['Hôm nay bắt\n', 'được 4 khoản'])).toBe(false);
    expect(breaksMidWord(['well-', 'spent'])).toBe(false);
    expect(breaksMidWord(['One line'])).toBe(false);
    expect(breaksMidWord([])).toBe(false);
  });

  it('accepts breaks inside scripts written without spaces', () => {
    expect(breaksMidWord(['今日は使', 'えるお金'])).toBe(false);
    expect(breaksMidWord(['วันนี้ใช้', 'ได้'])).toBe(false);
    expect(breaksMidWord(['오늘 쓸', '수 있는 돈'])).toBe(false);
  });

  it('reads letters with combining marks as part of the word', () => {
    expect(breaksMidWord(['nghiê', '̀ng'])).toBe(true);
  });
});

describe('wordsToMeasure', () => {
  it('puts each word on its own line', () => {
    expect(wordsToMeasure('Bạn khép lại Tháng 9')).toBe('Bạn\nkhép\nlại\nTháng\n9');
  });

  it('keeps words joined by a no-break space together', () => {
    expect(wordsToMeasure('Tháng 10 đã qua')).toBe('Tháng 10\nđã\nqua');
    expect(wordsToMeasure('12 345 €')).toBe('12 345\n€');
  });

  it('splits after a hyphen or a dash', () => {
    expect(wordsToMeasure('well-spent 5–9')).toBe('well-\nspent\n5–\n9');
  });

  it('leaves out runs of scripts that break anywhere', () => {
    expect(wordsToMeasure('6pmの日記')).toBe('6pm');
    expect(wordsToMeasure('今日は')).toBe('');
  });

  it('measures nothing for an empty or blank text', () => {
    expect(wordsToMeasure('')).toBe('');
    expect(wordsToMeasure('  \n ')).toBe('');
  });
});

describe('wordFitScale', () => {
  it('shrinks just enough for the widest word to fit', () => {
    expect(wordFitScale(150, 200, 0.5)).toBe(0.75);
  });

  it('never grows the text', () => {
    expect(wordFitScale(300, 200, 0.5)).toBe(1);
  });

  it('stops at the smallest scale', () => {
    expect(wordFitScale(50, 200, 0.5)).toBe(0.5);
  });

  it('leaves the text alone until both widths are known', () => {
    expect(wordFitScale(0, 200, 0.5)).toBe(1);
    expect(wordFitScale(150, 0, 0.5)).toBe(1);
  });
});

describe('scaleTextStyle', () => {
  it('scales the size, line, tracking and vertical room together', () => {
    expect(
      scaleTextStyle(
        {
          fontSize: 40,
          lineHeight: 40.8,
          letterSpacing: -0.4,
          paddingTop: 7,
          marginTop: -2,
          marginBottom: -2,
          color: '#000',
        },
        0.5,
      ),
    ).toEqual({
      fontSize: 20,
      lineHeight: 20.4,
      letterSpacing: -0.2,
      paddingTop: 3.5,
      marginTop: -1,
      marginBottom: -1,
      color: '#000',
    });
  });

  it('returns the same style at full size', () => {
    const style = { fontSize: 30 };
    expect(scaleTextStyle(style, 1)).toBe(style);
  });
});

describe('keepHangulWords', () => {
  const J = '\u2060';

  it('joins the characters of a Korean word, and a particle to the word before it', () => {
    expect(keepHangulWords('받아 적어요')).toBe(`받${J}아 적${J}어${J}요`);
    expect(keepHangulWords('6pm이 받아')).toBe(`6pm${J}이 받${J}아`);
  });

  it('leaves the spaces between words to break at', () => {
    expect(keepHangulWords('은행이 알리면').split(' ')).toHaveLength(2);
  });

  it('leaves text with no Hangul as it is', () => {
    expect(keepHangulWords('Your bank and wallet alerts')).toBe('Your bank and wallet alerts');
    expect(keepHangulWords('今日は5件キャッチ')).toBe('今日は5件キャッチ');
  });
});

describe('keepCountersWithNumbers', () => {
  const J = '\u2060';

  it('joins a number to the Japanese or Chinese counter after it', () => {
    expect(keepCountersWithNumbers('給料日までの1日あたり')).toBe(`給料日までの1${J}日あたり`);
    expect(keepCountersWithNumbers('今天记下5笔')).toBe(`今天记下5${J}笔`);
  });

  it('leaves a number before a space, a Latin word or nothing as it is', () => {
    expect(keepCountersWithNumbers('5 things caught')).toBe('5 things caught');
    expect(keepCountersWithNumbers('¥3,850')).toBe('¥3,850');
  });
});
