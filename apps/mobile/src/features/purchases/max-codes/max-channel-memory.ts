import { z } from 'zod';

import {
  MAX_CHANNELS,
  maxChannelAt,
  maxCodeFromReferrer,
  parseMaxCode,
  type MaxChannel,
} from '@6pm/domain';

/** The one small file the memory lives in, read and written whole. */
export interface MaxChannelFile {
  read(): Promise<string | null>;
  write(text: string): Promise<void>;
  remove(): Promise<void>;
}

const keptSchema = z.object({
  /** Google Play's install referrer was read once already (Android); it never changes after. */
  referrerChecked: z.boolean(),
  /** The last code link, or redemption, and when; null when there was none. */
  kept: z.object({ channel: z.enum(MAX_CHANNELS), at: z.string().min(1) }).nullable(),
  /** The code that link carried, for the store's redemption; null when it carried none. */
  code: z.string().nullable(),
});
type Kept = z.infer<typeof keptSchema>;

const NOTHING: Kept = { referrerChecked: false, kept: null, code: null };

/**
 * Which place sent this phone to a Max code, kept on the phone only: the channel's name, when,
 * and the code its link carried. No person, no device id and no purchase is in it, and it never
 * leaves the phone by itself (the funnel counts read the channel when Max is bought).
 */
export function createMaxChannelMemory(file: MaxChannelFile, clock: () => Date = () => new Date()) {
  const load = async (): Promise<Kept> => {
    try {
      const text = await file.read();
      if (text === null) return NOTHING;
      const parsed = keptSchema.safeParse(JSON.parse(text));
      return parsed.success ? parsed.data : NOTHING;
    } catch {
      return NOTHING;
    }
  };
  const save = (kept: Kept) => file.write(JSON.stringify(kept));

  return {
    /** The channel a purchase made now came from, if a code link or redemption was recent. */
    async channel(): Promise<MaxChannel | null> {
      return maxChannelAt((await load()).kept, clock());
    },

    /** The code the last code link carried while it still counts; null otherwise. */
    async code(): Promise<string | null> {
      const kept = await load();
      return maxChannelAt(kept.kept, clock()) === null ? null : kept.code;
    },

    /**
     * Keeps a code link's channel, and its code when it carried one. A redemption with no link
     * before it keeps `other`, but never over a link still counting: that link is where it came
     * from.
     */
    async remember(channel: MaxChannel, code: string | null = null): Promise<void> {
      const kept = await load();
      const now = clock();
      if (channel === 'other' && maxChannelAt(kept.kept, now) !== null) return;
      await save({
        referrerChecked: kept.referrerChecked,
        kept: { channel, at: now.toISOString() },
        code: channel === 'other' ? null : parseMaxCode(code),
      });
    },

    /**
     * Reads Google Play's install referrer once in the life of the install: an install that came
     * from a code link keeps its channel and code as if the link had opened the app.
     */
    async checkReferrer(readReferrer: () => Promise<string | null>): Promise<void> {
      const kept = await load();
      if (kept.referrerChecked) return;
      let referrer: string | null;
      try {
        referrer = await readReferrer();
      } catch {
        // Play could not be asked (no Play services, or it was busy): ask again next launch.
        return;
      }
      const arrival = maxCodeFromReferrer(referrer);
      await save(
        arrival === null || kept.kept !== null
          ? { ...kept, referrerChecked: true }
          : {
              referrerChecked: true,
              kept: { channel: arrival.channel, at: clock().toISOString() },
              code: arrival.code,
            },
      );
    },

    /** Deletes it, with everything else, when the person deletes their data. */
    forget: () => file.remove(),
  };
}

export type MaxChannelMemory = ReturnType<typeof createMaxChannelMemory>;
