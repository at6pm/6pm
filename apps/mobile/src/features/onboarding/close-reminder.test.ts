import { describe, expect, it } from '@jest/globals';

import { FIRST_CATCH_ID } from '../reminders/notification-schedule';
import {
  CLOSE_REMINDER_PREFIX,
  presentationWhileOpen,
  TEST_ALERT_ID_PREFIX,
} from './close-reminder';

const loud = () => false;
const quiet = () => true;

describe('a notification that arrives while 6pm is open', () => {
  it('shows a test alert as a banner with its sound, whatever else is quiet', () => {
    for (const hush of [loud, quiet]) {
      expect(presentationWhileOpen(`${TEST_ALERT_ID_PREFIX}K7M29QXR`, hush)).toEqual({
        banner: true,
        list: true,
        sound: true,
        say: false,
      });
    }
  });

  it('has the companion say a close reminder instead of showing its banner', () => {
    const id = `${CLOSE_REMINDER_PREFIX}2026-11-23`;
    expect(presentationWhileOpen(id, loud)).toEqual({
      banner: false,
      list: true,
      sound: false,
      say: true,
    });
    expect(presentationWhileOpen(id, quiet)).toEqual({
      banner: false,
      list: false,
      sound: false,
      say: false,
    });
  });

  it('keeps the first catch off the screen and shows any other as usual', () => {
    expect(presentationWhileOpen(FIRST_CATCH_ID, loud)).toMatchObject({
      banner: false,
      say: false,
    });
    expect(presentationWhileOpen('payday:2026-11-30', quiet)).toEqual({
      banner: true,
      list: true,
      sound: true,
      say: false,
    });
  });
});
