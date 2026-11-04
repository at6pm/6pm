/**
 * The app's one inbox importer, for screens that wait for something to arrive while they are open
 * (onboarding's first catch). Asking runs an import on the same queue the foreground import uses,
 * so two never run at once and every capture is named as usual; a request made while one is
 * already waiting to run joins it.
 */
let runner: (() => Promise<void>) | null = null;

/** Set by the importer while it is mounted. */
export function setInboxRunner(run: (() => Promise<void>) | null): void {
  runner = run;
}

/** Brings in what is waiting in the inbox now; resolves once that import has finished. */
export function requestInboxImport(): Promise<void> {
  return runner ? runner() : Promise.resolve();
}
