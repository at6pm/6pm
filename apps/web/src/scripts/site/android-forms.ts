import type { SiteLang } from '../../data/site/copy';
import type { LiveLines } from '../../data/site/live-lines';
import { joinAndroidTest } from '../android-tester-request';

/** The design's check: something, an @, something, a dot, something. The list checks properly. */
const looksLikeEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email.trim());

/**
 * The two Android test signups, under the App Store badge at the top and at the bottom of the page.
 * Either one puts the Google account on the tester list; once it is there, both show what to do
 * next.
 */
export function startAndroidForms(root: HTMLElement, lang: SiteLang, lines: LiveLines): void {
  const blocks = [...root.querySelectorAll<HTMLElement>('[data-android]')];
  let sending = false;

  const say = (block: HTMLElement, line: string | null): void => {
    const note = block.querySelector<HTMLElement>('[data-android-note]');
    if (note) note.textContent = line ?? '';
    block
      .querySelector('[data-android-email]')
      ?.setAttribute('aria-invalid', String(line !== null));
  };

  const listed = (): void => {
    for (const block of blocks) {
      const form = block.querySelector<HTMLElement>('[data-android-form]');
      const sent = block.querySelector<HTMLElement>('[data-android-sent]');
      if (form) form.hidden = true;
      if (sent) sent.hidden = false;
      say(block, null);
    }
  };

  for (const block of blocks) {
    const form = block.querySelector<HTMLFormElement>('[data-android-form]');
    const input = block.querySelector<HTMLInputElement>('[data-android-email]');
    const button = form?.querySelector('button');
    if (!form || !input || !button) continue;
    input.addEventListener('input', () => say(block, null));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (sending) return;
      const email = input.value.trim();
      if (!looksLikeEmail(email)) {
        say(block, lines.notAnEmail);
        input.focus();
        return;
      }
      sending = true;
      button.setAttribute('aria-busy', 'true');
      void joinAndroidTest({ email, language: lang }).then((outcome) => {
        sending = false;
        button.removeAttribute('aria-busy');
        if (outcome.kind === 'listed') listed();
        else if (outcome.kind === 'invalid') say(block, lines.notAnEmail);
        else if (outcome.kind === 'busy') say(block, lines.busy);
        else say(block, lines.unreachable);
      });
    });
  }
}
