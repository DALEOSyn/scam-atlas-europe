/**
 * Runtime habit cards (content/habit_cards.yaml). Validated at build time
 * (scripts/lib/content.ts), so the runtime trusts the shape and ships without Zod.
 */
import data from '../../content/habit_cards.yaml';
import type { HabitCard } from './schema.ts';

const cards = (data as { cards: HabitCard[] }).cards;

export function habitCard(id: string | undefined): HabitCard | undefined {
  return id === undefined ? undefined : cards.find((c) => c.id === id);
}

/** Every habit card, in content order (the end screen lists the ones earned, CR-44(b)). */
export function allHabitCards(): readonly HabitCard[] {
  return cards;
}
