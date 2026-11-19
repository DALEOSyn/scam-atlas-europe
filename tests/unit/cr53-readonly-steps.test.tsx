// @vitest-environment jsdom
/**
 * CR-53 (R25(4)): a fall on the finale's recovery-agency test shows "Your steps" read-only right after the arc
 * damage control: recovery_note first, the outcome's helpful steps, feedback on the harmful steps the arc damage
 * control did not offer (Brussels: pay_recovery_service). No second scored pick; arc points for the step are 0;
 * the debrief's already-clicked advice is still shown.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { join, resolve } from 'node:path';
import { readYaml } from '../../scripts/lib/content.ts';
import { chapterSchema, scenarioSchema, type Scenario } from '../../src/content/schema.ts';
import { recoveryStepFeedback, recoveryStepLabel } from '../../src/content/recoverySteps.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { beginChapter, commitScenario } from '../../src/engine/game.ts';
import { READ_ONLY_RECOVERY, readOnlySteps, recoveryIsReadOnly } from '../../src/engine/recovery.ts';
import { resultOf } from '../../src/engine/result.ts';
import { step, viewOf } from '../../src/engine/runner.ts';
import { freshSave } from '../../src/engine/save.ts';
import { t } from '../../src/i18n/index.ts';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { DamageControl } from '../../src/ui/ScenarioView.tsx';
import { rawFraud, ROOT, scenario } from '../content/fixtures.ts';
import { act, B, ctx, run } from './engine/helpers.ts';

afterEach(cleanup);

const none = { pressureAny: false, pressureGenuine: false };
const content = (city: string, id: string): Scenario => scenarioSchema.parse(readYaml(resolve(ROOT, 'content', 'scenarios', city, `${id}.yaml`)));
const fixture = (file: string): Scenario => scenarioSchema.parse(readYaml(join(ROOT, 'tests', 'fixtures', 'finale', 'scenarios', file)));
const brussels = chapterSchema.parse(readYaml(resolve(ROOT, 'content', 'chapters', 'brussels.yaml')));
const offer = content('brussels', 'brussels-arc-recovery-offer');
const arcDcSteps = (brussels.arc_finale?.damage_control ?? []).map((x) => x.step);
const payAction = offer.actions.find((a) => a.outcome === 'release_fee_paid')?.id ?? '';

/** Play the fall up to "Your steps". */
function toSteps(s: Scenario, actionId: string) {
  const c = ctx({ timerMode: 'off' });
  const st = run(s, c, [act(actionId)]);
  return { c, st, view: viewOf(s, c, st) };
}

describe('CR-53: engine', () => {
  it('only the recovery-agency test is read-only', () => {
    expect(recoveryIsReadOnly(offer)).toBe(true);
    expect(recoveryIsReadOnly(content('brussels', 'brussels-arc-close'))).toBe(false);
    expect(recoveryIsReadOnly({ finale: undefined })).toBe(false);
  });
  it('a fall reaches "Your steps" read-only, in authored order (stop steps first, not shuffled)', () => {
    expect(payAction).not.toBe('');
    const { st, view } = toSteps(offer, payAction);
    expect(st.phase).toBe('damage_control');
    expect(view.recovery?.readOnly).toBe(true);
    expect(view.recovery?.options.map((o) => o.step)).toEqual(offer.outcomes.release_fee_paid?.recovery?.map((x) => x.step));
    expect(view.recovery?.note).toBe(offer.outcomes.release_fee_paid?.recovery_note);
  });
  it('whatever is sent, nothing is scored: arc points for the step are 0', () => {
    const { c, st } = toSteps(offer, payAction);
    const done = step(offer, c, st, { type: 'recovery', picks: ['stop_paying', 'call_bank_known_number', 'tell_trusted_adult'] });
    expect(done.phase).toBe('done');
    expect(done.recovery?.result).toEqual(READ_ONLY_RECOVERY);
    const r = resultOf(offer, B, done);
    expect(r.fell).toBe(true);
    expect(r.points).toBe(0);
    const ch = { city: 'brussels', scenario_order: brussels.scenario_order };
    const before = beginChapter(freshSave(), 'brussels', ch);
    expect(commitScenario(before, B, ch, offer, done, r).arc.points).toBe(before.arc.points);
  });
  it('ordinary damage control is unchanged (picks, scored)', () => {
    const s = scenario(rawFraud());
    const c = ctx({ timerMode: 'off' });
    const st = run(s, c, [act('tap_link'), act('enter_card')]);
    expect(st.phase).toBe('damage_control');
    const v = viewOf(s, c, st).recovery;
    expect(v?.readOnly).toBeUndefined();
    const helpful = (v?.options ?? []).filter((o) => o.category !== 'harmful').slice(0, 3).map((o) => o.step);
    const done = step(s, c, st, { type: 'recovery', picks: helpful });
    expect(done.recovery?.result?.points).toBe(9);
  });
  it('the fixture recovery test (finale: recovery_offer) is read-only too', () => {
    expect(recoveryIsReadOnly(fixture('fx-finale-arc-recovery.yaml'))).toBe(true);
  });
  it('readOnlySteps: helpful steps, then harmful steps the arc damage control did not offer (Brussels: pay_recovery_service)', () => {
    const options = offer.outcomes.release_fee_paid?.recovery ?? [];
    const { helps, harmful } = readOnlySteps(options, arcDcSteps);
    expect(helps.map((o) => o.step)).toEqual(['stop_paying', 'call_bank_known_number', 'tell_trusted_adult', 'report_firm_to_regulator']);
    expect(harmful.map((o) => o.step)).toEqual(['pay_recovery_service']);
    expect(readOnlySteps(options).harmful.map((o) => o.step)).toEqual(['pay_recovery_service', 'pay_last_fee']);
  });
});

describe('CR-53: the read-only "Your steps" screen', () => {
  it('note first, helpful steps, the harmful step with its feedback; no picks; Continue sends nothing', () => {
    const { view } = toSteps(offer, payAction);
    let sent: string[] | null = null;
    const { container } = render(<DamageControl view={view.recovery as NonNullable<typeof view.recovery>} offered={arcDcSteps} onDone={(p) => (sent = p)} />);
    const heading = screen.getByRole('heading', { name: t('damage_feedback_title') });
    expect(document.activeElement).toBe(heading);
    const note = container.querySelector('[data-recovery-note]') as HTMLElement;
    expect(note.textContent).toBe(offer.outcomes.release_fee_paid?.recovery_note);
    const first = container.querySelector('[data-step]') as HTMLElement;
    expect(note.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING, 'recovery_note first').toBeTruthy();
    expect([...container.querySelectorAll('[data-step]')].map((e) => e.getAttribute('data-step'))).toEqual([
      'stop_paying',
      'call_bank_known_number',
      'tell_trusted_adult',
      'report_firm_to_regulator',
      'pay_recovery_service',
    ]);
    const harmful = container.querySelector('[data-step="pay_recovery_service"]') as HTMLElement;
    expect(harmful.textContent).toContain(t('damage_doesnt_help'));
    expect(harmful.textContent).toContain(recoveryStepLabel('pay_recovery_service'));
    expect(harmful.textContent).toContain(recoveryStepFeedback('pay_recovery_service') ?? '');
    expect(container.querySelector('[data-step="stop_paying"]')?.textContent).toContain(t('damage_helps'));
    expect(container.querySelectorAll('button[aria-pressed]')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: t('damage_done') })).toBeNull();
    expect(container.textContent).not.toContain(t('damage_prompt'));
    fireEvent.click(screen.getByRole('button', { name: t('app_continue') }));
    expect(sent).toEqual([]);
  });
  it('the debrief after it still shows the already-clicked advice', () => {
    const { c, st } = toSteps(offer, payAction);
    const done = step(offer, c, st, { type: 'recovery', picks: [] });
    const data = debriefOf(offer, done, resultOf(offer, B, done), none);
    render(<DebriefView data={data} onContinue={() => undefined} />);
    expect(document.getElementById('debrief-more')?.textContent).toContain(offer.debrief.already_clicked?.paid ?? 'missing');
  });
});
