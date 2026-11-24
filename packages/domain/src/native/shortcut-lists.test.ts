import { describe, expect, it } from 'vitest';

import AE from '../../../../tools/scripts/bank-alert-shortcut/apps/AE.json';
import AU from '../../../../tools/scripts/bank-alert-shortcut/apps/AU.json';
import BD from '../../../../tools/scripts/bank-alert-shortcut/apps/BD.json';
import BR from '../../../../tools/scripts/bank-alert-shortcut/apps/BR.json';
import CA from '../../../../tools/scripts/bank-alert-shortcut/apps/CA.json';
import CH from '../../../../tools/scripts/bank-alert-shortcut/apps/CH.json';
import CN from '../../../../tools/scripts/bank-alert-shortcut/apps/CN.json';
import DE from '../../../../tools/scripts/bank-alert-shortcut/apps/DE.json';
import ES from '../../../../tools/scripts/bank-alert-shortcut/apps/ES.json';
import FR from '../../../../tools/scripts/bank-alert-shortcut/apps/FR.json';
import GB from '../../../../tools/scripts/bank-alert-shortcut/apps/GB.json';
import HK from '../../../../tools/scripts/bank-alert-shortcut/apps/HK.json';
import ID from '../../../../tools/scripts/bank-alert-shortcut/apps/ID.json';
import IE from '../../../../tools/scripts/bank-alert-shortcut/apps/IE.json';
import IN from '../../../../tools/scripts/bank-alert-shortcut/apps/IN.json';
import IT from '../../../../tools/scripts/bank-alert-shortcut/apps/IT.json';
import JP from '../../../../tools/scripts/bank-alert-shortcut/apps/JP.json';
import KE from '../../../../tools/scripts/bank-alert-shortcut/apps/KE.json';
import KH from '../../../../tools/scripts/bank-alert-shortcut/apps/KH.json';
import KR from '../../../../tools/scripts/bank-alert-shortcut/apps/KR.json';
import LA from '../../../../tools/scripts/bank-alert-shortcut/apps/LA.json';
import MX from '../../../../tools/scripts/bank-alert-shortcut/apps/MX.json';
import MY from '../../../../tools/scripts/bank-alert-shortcut/apps/MY.json';
import NG from '../../../../tools/scripts/bank-alert-shortcut/apps/NG.json';
import NL from '../../../../tools/scripts/bank-alert-shortcut/apps/NL.json';
import NZ from '../../../../tools/scripts/bank-alert-shortcut/apps/NZ.json';
import PH from '../../../../tools/scripts/bank-alert-shortcut/apps/PH.json';
import PK from '../../../../tools/scripts/bank-alert-shortcut/apps/PK.json';
import PL from '../../../../tools/scripts/bank-alert-shortcut/apps/PL.json';
import SA from '../../../../tools/scripts/bank-alert-shortcut/apps/SA.json';
import SE from '../../../../tools/scripts/bank-alert-shortcut/apps/SE.json';
import SG from '../../../../tools/scripts/bank-alert-shortcut/apps/SG.json';
import TH from '../../../../tools/scripts/bank-alert-shortcut/apps/TH.json';
import TR from '../../../../tools/scripts/bank-alert-shortcut/apps/TR.json';
import TW from '../../../../tools/scripts/bank-alert-shortcut/apps/TW.json';
import US from '../../../../tools/scripts/bank-alert-shortcut/apps/US.json';
import ZA from '../../../../tools/scripts/bank-alert-shortcut/apps/ZA.json';
import world from '../../../../tools/scripts/bank-alert-shortcut/apps/world.json';

import { alertSenderOf } from '../capture/alert-sender';
import { bankOfApp } from '../capture/bank-alert-senders';
import { banksOf, findBank, WORLD_BANKS } from '../vietqr/bank-catalogue';
import { WORLD_IOS_APPS } from '../vietqr/world-ios-apps';

// The app lists of the "Catch a bank alert" shortcut for each country, and for anywhere else.

interface ListedApp {
  readonly bundle: string;
  readonly name?: string;
  readonly team?: string;
  readonly bank?: string;
  readonly own?: boolean;
}

const LISTS: Readonly<Record<string, readonly ListedApp[]>> = {
  AE,
  AU,
  BD,
  BR,
  CA,
  CH,
  CN,
  DE,
  ES,
  FR,
  GB,
  HK,
  ID,
  IE,
  IN,
  IT,
  JP,
  KE,
  KH,
  KR,
  LA,
  MX,
  MY,
  NG,
  NL,
  NZ,
  PH,
  PK,
  PL,
  SA,
  SE,
  SG,
  TH,
  TR,
  TW,
  US,
  ZA,
};
const OWN = ['6pm', 'ai.sixpm.app'];
const banksIn = (list: readonly ListedApp[]) => list.filter((app) => app.own !== true);

describe('the shortcut’s app list for each country', () => {
  it('is there for every country 6pm has banks for, and for nowhere else', () => {
    const countries = new Set(WORLD_BANKS.flatMap((bank) => (bank.country ? [bank.country] : [])));
    expect(Object.keys(LISTS).sort()).toEqual([...countries].sort());
  });

  it('starts with 6pm itself, by its team, and stays about twenty long', () => {
    for (const [country, list] of Object.entries({ ...LISTS, world })) {
      expect(list[0], country).toEqual({
        bundle: 'ai.sixpm.app',
        name: '6pm',
        team: 'YFND2EEW8S',
        own: true,
      });
      expect(
        list.filter((app) => app.own === true),
        country,
      ).toHaveLength(1);
      expect(list.length, country).toBeLessThanOrEqual(22);
    }
  });

  it('is the picker’s list for that country, in its order, wherever the app is on the iPhone', () => {
    for (const [country, list] of Object.entries(LISTS)) {
      const picker = banksOf(country)
        .filter((bank) => WORLD_IOS_APPS.has(bank.id))
        .map((bank) => bank.id);
      expect(
        banksIn(list).map((app) => app.bank),
        country,
      ).toEqual(picker);
    }
  });

  it('lists each app by its iPhone bundle id, with a team id only where it is certain', () => {
    for (const list of [...Object.values(LISTS), world]) {
      for (const app of banksIn(list)) {
        const ios = WORLD_IOS_APPS.get(app.bank ?? '');
        expect(ios?.bundle, app.bank).toBe(app.bundle);
        expect(app.team ?? null, app.bank).toBe(ios?.team ?? null);
        // A name goes only beside a team id: alone, iOS swaps in the app with the nearest name.
        expect(app.name === undefined, app.bank).toBe(app.team === undefined);
      }
    }
  });
});

describe('every app on a shortcut', () => {
  const listed = [...Object.values(LISTS), world].flatMap(banksIn);

  it('is a bank or wallet 6pm knows', () => {
    expect(listed.filter((app) => findBank(app.bank ?? '') === null)).toEqual([]);
  });

  it('is known to the action by its bundle id, should the trigger pass that', () => {
    for (const app of listed) {
      const bank = bankOfApp(app.bundle);
      expect(bank && WORLD_IOS_APPS.get(bank.id)?.bundle, app.bundle).toBe(app.bundle);
      expect(alertSenderOf(app.bundle, OWN), app.bundle).toBe('bank');
    }
  });

  it('is known to the action by the name the trigger passes, wherever the list names one', () => {
    for (const app of listed.filter((entry) => entry.name !== undefined)) {
      expect(bankOfApp(app.name)?.id, app.name).toBe(app.bank);
      expect(alertSenderOf(app.name, OWN), app.name).toBe('bank');
    }
  });

  it('is known to the action by every name its iPhone may show', () => {
    for (const app of listed) {
      for (const name of WORLD_IOS_APPS.get(app.bank ?? '')?.names ?? []) {
        expect(alertSenderOf(name, OWN), name).toBe('bank');
      }
    }
  });
});

describe('the world’s apps by the name the iPhone shows', () => {
  it('are known in any script, and before a Vietnamese code their name starts with', () => {
    expect(bankOfApp('KB스타뱅킹')?.id).toBe('KR.KB');
    expect(bankOfApp('楽天ペイ')?.id).toBe('JP.RAKUTENPAY');
    expect(bankOfApp('เป๋าตัง')?.id).toBe('TH.PAOTANG');
    expect(bankOfApp('DBS digibank')?.id).toBe('SG.DBS');
    expect(bankOfApp('SCB EASY')?.id).toBe('TH.SCB');
    expect(bankOfApp('BofA')?.id).toBe('US.BOFA');
  });

  it('are known by the name their app starts with', () => {
    expect(bankOfApp('Chase Mobile')?.id).toBe('US.CHASE');
    expect(bankOfApp('Swedbank privat')?.id).toBe('SE.SWEDBANK');
  });

  it('leave a Vietnamese bank’s short code to it', () => {
    expect(bankOfApp('NAB')?.country).toBe('VN');
    expect(bankOfApp('DBS')?.country).toBe('VN');
    expect(bankOfApp('SCB')?.country).toBe('VN');
  });

  it('never take a chat or super-app', () => {
    for (const app of ['WeChat', 'Gojek', 'Grab', 'LINE', 'KakaoTalk', 'BiP', 'Zalo', 'Shopee']) {
      expect(alertSenderOf(app, OWN), app).toBe('other');
    }
  });
});
