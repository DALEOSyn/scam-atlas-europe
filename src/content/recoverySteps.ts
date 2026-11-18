/**
 * Runtime damage-control step labels (content/recovery_steps.yaml). Validated
 * at build time; categories come from each scenario outcome (CR-07).
 */
import data from '../../content/recovery_steps.yaml';

const steps = (data as { steps: { id: string; label: string }[] }).steps;

export function recoveryStepLabel(id: string): string {
  return steps.find((s) => s.id === id)?.label ?? id.replace(/_/g, ' ');
}
