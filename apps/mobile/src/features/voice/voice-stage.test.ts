import { describe, expect, it } from '@jest/globals';

import { lastRowOf, mainAction, micAction, missed, voiceStage } from './voice-stage';

describe('voiceStage', () => {
  it('is closed whatever the dictation did while the panel is shut', () => {
    expect(voiceStage(false, 'parsed')).toBe('closed');
    expect(voiceStage(false, 'unavailable')).toBe('closed');
  });

  it('follows the dictation while open', () => {
    expect(voiceStage(true, 'idle')).toBe('waiting');
    expect(voiceStage(true, 'listening')).toBe('listening');
    expect(voiceStage(true, 'finishing')).toBe('reading');
    expect(voiceStage(true, 'parsed')).toBe('heard');
    expect(voiceStage(true, 'noAmount')).toBe('noAmount');
    expect(voiceStage(true, 'nothing')).toBe('nothing');
    expect(voiceStage(true, 'denied')).toBe('denied');
  });
});

describe('the panel buttons', () => {
  it('starts from the keypad and tries again after a miss', () => {
    expect(micAction('closed')).toBe('start');
    expect(micAction('nothing')).toBe('start');
    expect(micAction('noAmount')).toBe('start');
  });

  it('stops while listening, from either button', () => {
    expect(micAction('listening')).toBe('stop');
    expect(mainAction('listening')).toBe('stop');
  });

  it('does nothing on the microphone while the words are read or settings are needed', () => {
    expect(micAction('reading')).toBe('none');
    expect(micAction('heard')).toBe('none');
    expect(micAction('denied')).toBe('none');
    expect(micAction('unavailable')).toBe('none');
  });

  it('keeps the spend from the keypad and cancels everywhere else', () => {
    expect(mainAction('closed')).toBe('keep');
    expect(mainAction('reading')).toBe('cancel');
    expect(mainAction('heard')).toBe('cancel');
    expect(mainAction('denied')).toBe('cancel');
  });
});

describe('Quick add’s last row', () => {
  it('is the microphone and Keep it from the keypad, and while the words are read', () => {
    expect(lastRowOf('closed')).toEqual({ lead: 'mic', action: 'keep' });
    expect(lastRowOf('reading')).toEqual({ lead: 'mic', action: 'keep' });
    expect(lastRowOf('heard')).toEqual({ lead: 'mic', action: 'keep' });
  });

  it('stops listening from the wide cells', () => {
    expect(lastRowOf('waiting')).toEqual({ lead: 'mic', action: 'stop' });
    expect(lastRowOf('listening')).toEqual({ lead: 'mic', action: 'stop' });
  });

  it('turns the microphone into the way back to the keypad once voice cannot go on', () => {
    expect(missed('nothing')).toBe(true);
    expect(missed('noAmount')).toBe(true);
    expect(missed('denied')).toBe(false);
    expect(lastRowOf('nothing')).toEqual({ lead: 'keypad', action: 'retry' });
    expect(lastRowOf('noAmount')).toEqual({ lead: 'keypad', action: 'retry' });
    expect(lastRowOf('denied')).toEqual({ lead: 'keypad', action: 'settings' });
    expect(lastRowOf('unavailable')).toEqual({ lead: 'keypad', action: 'keep' });
  });
});
