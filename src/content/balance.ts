/**
 * Runtime star table. balance.yaml is validated at build time
 * (scripts/lib/content.ts), so the runtime trusts the shape and ships without Zod.
 */
import data from '../../content/balance.yaml';
import type { ScoringTable } from '../engine/scoring.ts';

export const scoring = data as ScoringTable;
