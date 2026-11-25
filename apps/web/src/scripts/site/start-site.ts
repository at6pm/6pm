import { liveLines } from '../../data/site/live-lines';
import { siteLangOf } from '../../data/site/langs';
import { startAsk } from './ask';
import { startCapture } from './capture';
import { startClock } from './clock';
import { startClose } from './close';
import { defineCompanion } from './companion';
import { startDuo } from './duo';
import { startDuoScreens } from './duo-screens';
import { startJoinForms } from './join-forms';
import { startMotion } from './motion';
import { startPricing } from './pricing';
import { startSky } from './sky';

/** Brings the home page to life: the sky, reveals, the clocks, the forms and every demo. */
export function startSite(): void {
  const root = document.querySelector<HTMLElement>('[data-site]');
  if (!root) return;
  const lang = siteLangOf(document.documentElement.lang) ?? 'en';
  const lines = liveLines[lang];

  defineCompanion();
  startSky(root);
  startMotion(root);
  startClock(root, lines);
  startJoinForms(root, lang, lines);
  startCapture(root);
  startClose(root);
  startAsk(root);
  startDuo(root);
  startDuoScreens(root);
  startPricing(root);
}
