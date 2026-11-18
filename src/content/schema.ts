/**
 * Content contract between the engine and `scenario-writer`.
 *
 * The engine knows nothing about specific scenarios: everything it renders is
 * described by YAML validated against these schemas, at build time (Vite
 * plugin), in `npm run content:validate` and in CI.
 *
 * Shape follows `templates/scenario.template.yaml`.
 */
import { z } from 'zod';

/** Lower-case kebab-case identifier, e.g. `berlin-03-parcel-customs`. */
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lower-case kebab-case (a-z, 0-9, -)');

/** snake_case identifier used for action ids, outcome keys and recovery steps. */
export const snakeId = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, 'must be snake_case (a-z, 0-9, _)');

export const DEVICES = [
  'email',
  'sms',
  'messenger',
  'call',
  'browser',
  'qr',
  'banking',
  'social',
] as const;
export const deviceSchema = z.enum(DEVICES);
export type Device = z.infer<typeof deviceSchema>;

/** QR codes may only resolve to an in-game route (Red Line 3). */
export const QR_PAYLOAD_RE = /^\/qr\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const qrSchema = z
  .object({
    payload: z.string().regex(QR_PAYLOAD_RE, 'QR payload must be an in-game route /qr/<id>'),
    caption: z.string().min(1).optional(),
  })
  .strict();

export const senderSchema = z
  .object({
    display: z.string().min(1),
    detail: z.string().min(1).optional(),
  })
  .strict();

export const messageSchema = z
  .object({
    sender: senderSchema,
    subject: z.string().min(1).optional(),
    body: z.string().min(1),
    qr: qrSchema.optional(),
    l10n_note: z.string().min(1).optional(),
  })
  .strict();

export const pressureSchema = z
  .object({
    timer_seconds: z.number().int().positive().optional(),
    levers: z.array(snakeId).default([]),
  })
  .strict();

export const inspectableSchema = z
  .object({
    target: z
      .string()
      .regex(/^[a-z_]+(?:\.[a-z_]+)*$/, 'target must be a dotted path such as sender.detail or link'),
    reveal: z.string().min(1),
    red_flag: z.boolean(),
  })
  .strict();

export const actionSchema = z
  .object({
    id: snakeId,
    label: z.string().min(1),
    outcome: snakeId,
    score: z.number().int(),
  })
  .strict();

export const outcomeSchema = z
  .object({
    narrative: z.string().min(1),
    recovery: z.array(snakeId).optional(),
  })
  .strict();

export const debriefSchema = z
  .object({
    red_flags: z.array(z.string().min(1)).default([]),
    habit: z.string().min(1),
    already_clicked: z.string().min(1).optional(),
    sources: z.array(slug).min(1, 'every scenario must cite at least one source (Red Line 6)'),
  })
  .strict();

export const scenarioSchema = z
  .object({
    id: slug,
    chapter: slug,
    pattern: slug,
    learning_objectives: z
      .array(z.string().regex(/^LO-\d{2}$/, 'learning objective ids look like LO-01'))
      .min(1),
    difficulty: z.number().int().min(1).max(5),
    is_fraud: z.boolean(),
    device: deviceSchema,
    /** Fictional brand ids (content/brands.yaml) that appear in this scenario. */
    brands: z.array(slug).default([]),
    pressure: pressureSchema.optional(),
    message: messageSchema,
    inspectables: z.array(inspectableSchema).default([]),
    actions: z.array(actionSchema).min(2, 'a scenario needs at least two choices'),
    outcomes: z.record(snakeId, outcomeSchema),
    debrief: debriefSchema,
  })
  .strict()
  .superRefine((s, ctx) => {
    const seen = new Set<string>();
    s.actions.forEach((a, i) => {
      if (seen.has(a.id)) {
        ctx.addIssue({ code: 'custom', path: ['actions', i, 'id'], message: `duplicate action id "${a.id}"` });
      }
      seen.add(a.id);
      if (!(a.outcome in s.outcomes)) {
        ctx.addIssue({
          code: 'custom',
          path: ['actions', i, 'outcome'],
          message: `outcome "${a.outcome}" is not defined under outcomes`,
        });
      }
    });
    const used = new Set(s.actions.map((a) => a.outcome));
    for (const key of Object.keys(s.outcomes)) {
      if (!used.has(key)) {
        ctx.addIssue({ code: 'custom', path: ['outcomes', key], message: `outcome "${key}" is never reached by any action` });
      }
    }
    if (!s.actions.some((a) => a.score > 0)) {
      ctx.addIssue({ code: 'custom', path: ['actions'], message: 'at least one action must score positively' });
    }
    // Red Line 4: fraud scenarios must debrief the tells and the recovery path.
    if (s.is_fraud) {
      if (s.debrief.red_flags.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['debrief', 'red_flags'], message: 'fraud scenarios must list red flags' });
      }
      if (!s.debrief.already_clicked) {
        ctx.addIssue({
          code: 'custom',
          path: ['debrief', 'already_clicked'],
          message: 'fraud scenarios must say what to do if you already fell for it',
        });
      }
    }
    if (s.device === 'qr' && !s.message.qr) {
      ctx.addIssue({ code: 'custom', path: ['message', 'qr'], message: 'qr scenarios need message.qr.payload' });
    }
  });
export type Scenario = z.infer<typeof scenarioSchema>;
export type Action = z.infer<typeof actionSchema>;
export type Outcome = z.infer<typeof outcomeSchema>;

export const brandSchema = z
  .object({
    id: slug,
    name: z.string().min(1),
    kind: z.enum(['bank', 'courier', 'marketplace', 'payment', 'telecom', 'utility', 'government', 'tech', 'retail', 'other']),
    /** Must be non-routable; red-line lint enforces .example/.test/.invalid. */
    domain: z.string().min(1).optional(),
    notes: z.string().optional(),
    /** Stub entries awaiting the ux-artist brand registry (T-1.6). */
    placeholder: z.boolean().default(false),
  })
  .strict();
export const brandsFileSchema = z.object({ brands: z.array(brandSchema) }).strict();
export type Brand = z.infer<typeof brandSchema>;

export const sourceSchema = z
  .object({
    id: slug,
    title: z.string().min(1),
    publisher: z.string().min(1).optional(),
    /** Public reference page; https only (no http:, javascript:, data: ...). */
    url: z
      .string()
      .refine(isHttpsUrl, 'url must be an absolute https:// URL')
      .optional(),
    accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'accessed must be YYYY-MM-DD').optional(),
    /** Placeholder ids reserved before fraud-researcher fills them in (T-1.3). */
    placeholder: z.boolean().default(false),
  })
  .strict()
  .superRefine((s, ctx) => {
    if (!s.placeholder) {
      for (const k of ['publisher', 'url', 'accessed'] as const) {
        if (!s[k]) ctx.addIssue({ code: 'custom', path: [k], message: `${k} is required for non-placeholder sources` });
      }
    }
  });
export function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname.length > 0 && !u.username && !u.password;
  } catch {
    return false;
  }
}

export const sourcesFileSchema = z.object({ sources: z.array(sourceSchema) }).strict();
export type Source = z.infer<typeof sourceSchema>;

/** content/i18n/<locale>/*.json: flat snake_case keys to non-empty ICU-style strings. */
export const i18nCatalogueSchema = z
  .record(
    z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/, 'message keys are snake_case, e.g. app_title'),
    z
      .string()
      .min(1)
      .refine((m) => /^(?:[^{}]|\{[a-zA-Z_][a-zA-Z0-9_]*\})*$/.test(m), 'only simple {name} placeholders are supported'),
  )
  .refine((r) => Object.keys(r).length > 0, 'catalogue is empty');
