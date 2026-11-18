/**
 * Content YAML must be plain data: no anchors, aliases or merge keys (`<<`).
 * An alias can copy a value that is exempt at one path (e.g. an inspectable
 * target such as page.info) into player-facing text at another path, where
 * the linters would see only the alias, never the copied string.
 */
import { isAlias, isScalar, visit, type Document } from 'yaml';

export interface YamlStructureIssue {
  /** Character offset in the source. */
  offset: number;
  /** The offending token: *alias, &anchor or <<. */
  token: string;
  message: string;
}

export function yamlStructureIssues(doc: Document): YamlStructureIssue[] {
  const out: YamlStructureIssue[] = [];
  const at = (range: readonly number[] | null | undefined) => range?.[0] ?? 0;
  visit(doc, {
    Alias(_, node) {
      out.push({ offset: at(node.range), token: `*${node.source}`, message: `YAML alias *${node.source} is not allowed in content (write the value out)` });
    },
    Pair(_, pair) {
      if (isScalar(pair.key) && pair.key.value === '<<') {
        out.push({ offset: at(pair.key.range), token: '<<', message: 'YAML merge key << is not allowed in content (write the keys out)' });
      }
    },
    Node(_, node) {
      if (!isAlias(node) && 'anchor' in node && node.anchor) {
        out.push({ offset: at(node.range), token: `&${node.anchor}`, message: `YAML anchor &${node.anchor} is not allowed in content` });
      }
    },
  });
  return out;
}
