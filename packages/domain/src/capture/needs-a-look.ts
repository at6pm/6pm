/** The parts of a saved spend that say whether 6pm is unsure of it. */
export interface NeedsALookInput {
  /** In the home currency; 0 when the capture could not read or price it. */
  readonly amount: number;
  /** A spend in another currency; a rate of 0 means it is still waiting for one. */
  readonly foreignAmount: {
    readonly currency: string;
    readonly amount: number;
    readonly rate: number;
  } | null;
  /** The receipt printed no currency and the one saved was guessed. */
  readonly currencyGuessed?: boolean | undefined;
}

/**
 * A capture the person should look at before trusting it: its home amount is missing, its
 * foreign amount has no rate yet, or its currency was a guess.
 */
export function needsALook(spend: NeedsALookInput): boolean {
  if (!Number.isFinite(spend.amount) || spend.amount <= 0) return true;
  const foreign = spend.foreignAmount;
  if (foreign !== null && (!Number.isFinite(foreign.rate) || foreign.rate <= 0)) return true;
  return spend.currencyGuessed === true;
}

/**
 * Whether a spend can be confirmed as it is: only with an amount in the home currency. One saved
 * at 0 (an amount no source could read, or a charge abroad still waiting for its rate) stays
 * waiting under Needs a look until it is typed or priced, so a 0 is never counted as a spend.
 */
export function canKeep(spend: { readonly amount: number }): boolean {
  return Number.isFinite(spend.amount) && spend.amount > 0;
}
