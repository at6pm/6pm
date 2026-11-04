import { z } from 'zod';

import { IMPORT_TARGETS } from '../import/category-words';
import { COLUMN_ROLES } from '../import/columns';

/**
 * `POST /v1/import/map`: help reading an export file the phone does not know. The phone sends only
 * what says nothing about the person: each column's header and the shapes of its values (every
 * digit a `d`, every word a `w`, short repeated words such as "Thành công" kept), and the names of
 * the file's categories that its own words could not place. Never an amount, a date, a note, a
 * shop or a name. The answer pre-fills "Which column is which?" and "Label the boxes", which the
 * person confirms.
 */

export const IMPORT_MAP_MAX_COLUMNS = 30;
export const IMPORT_MAP_MAX_LABELS = 60;
const HEADER_MAX = 60;
const SHAPE_MAX = 40;
const LABEL_MAX = 40;

export const importMapRequestSchema = z
  .object({
    columns: z
      .array(
        z.object({
          header: z.string().max(HEADER_MAX),
          shapes: z.array(z.string().max(SHAPE_MAX)).max(5),
        }),
      )
      .max(IMPORT_MAP_MAX_COLUMNS)
      .optional(),
    labels: z
      .array(z.string().trim().min(1).max(LABEL_MAX))
      .max(IMPORT_MAP_MAX_LABELS)
      .refine((labels) => new Set(labels).size === labels.length, { message: 'labels repeat' })
      .optional(),
  })
  .refine((r) => (r.columns?.length ?? 0) > 0 || (r.labels?.length ?? 0) > 0, {
    message: 'nothing to map',
  });
export type ImportMapRequest = z.input<typeof importMapRequestSchema>;

export const importMapResponseSchema = z.object({
  /** One role per column sent, or null when there were none or the model was not sure. */
  columns: z.array(z.enum(COLUMN_ROLES)).nullable(),
  /** Where each label sent goes; a label left out is the person's to pick. */
  labels: z.record(z.string(), z.enum(IMPORT_TARGETS)),
});
export type ImportMapResponse = z.infer<typeof importMapResponseSchema>;
