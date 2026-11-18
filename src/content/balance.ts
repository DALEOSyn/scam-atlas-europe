/**
 * Runtime balance tables. balance.yaml is validated at build time
 * (scripts/lib/content.ts, balanceSchema covers every field the engine reads),
 * so the runtime trusts the shape and ships without Zod.
 */
import data from '../../content/balance.yaml';
import type { EngineBalance } from '../engine/scoring.ts';

export const balance = data as EngineBalance;