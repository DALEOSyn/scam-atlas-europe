/**
 * Runtime cast (content/cast.yaml projected to id, name, role and arc_character by
 * scripts/lib/yaml-module.ts; review notes never reach the bundle). Used for scene speaker labels.
 */
import data from '../../content/cast.yaml';

export interface CastEntry {
  id: string;
  name: string;
  role: string;
  arc_character: boolean;
}

const cast = data as CastEntry[];

export function castMember(id: string | undefined): CastEntry | undefined {
  return id === undefined ? undefined : cast.find((c) => c.id === id);
}
