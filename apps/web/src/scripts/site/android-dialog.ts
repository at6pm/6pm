/**
 * The page's one Android dialog, opened by the Android button beside either App Store badge. It is
 * modal: Esc (the browser's own cancel) and a tap on the backdrop close it, as does its close
 * button, and focus goes back to the button that opened it.
 */
export function startAndroidDialog(root: HTMLElement): void {
  const dialog = root.querySelector<HTMLDialogElement>('[data-android-dialog]');
  if (!dialog) return;
  let opener: HTMLElement | null = null;

  for (const button of root.querySelectorAll<HTMLElement>('[data-android-open]')) {
    button.addEventListener('click', () => {
      opener = button;
      dialog.showModal();
    });
  }

  dialog.querySelector('[data-android-close]')?.addEventListener('click', () => dialog.close());

  // A click whose target is the dialog itself landed on the backdrop: the card fills the box.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    opener?.focus();
    opener = null;
  });
}
