import type { Scenario } from '../../../src/content/schema.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { startScenario, step, type RunnerContext, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import type { EngineBalance } from '../../../src/engine/scoring.ts';
import type { TimerMode } from '../../../src/engine/timer.ts';
import { rawFraud, scenario } from '../../content/fixtures.ts';
import { loadBalanceFile } from '../helpers.ts';

export type Raw = Record<string, unknown>;
export const B: EngineBalance = loadBalanceFile();

export function ctx(over: Partial<RunnerContext> & { timerMode?: TimerMode; pushers?: boolean } = {}): RunnerContext {
  const { timerMode = 'standard', pushers = true, ...rest } = over;
  return { balance: B, slot: 1, settings: { timerMode, pushers }, stress: 10, ...rest };
}

/** Run events in order from the start. */
export function run(s: Scenario, c: RunnerContext, events: RunnerEvent[]): RunnerState {
  return events.reduce((st, ev) => settle(s, c, step(s, c, st, ev)), startScenario(s, c));
}

/**
 * The player presses Continue on the FINAL consequence step (after the last beat), as the UI does.
 * Consequences between boss beats stay explicit ({ type: 'continue' }) in the tests.
 */
export function settle(s: Scenario, c: RunnerContext, st: RunnerState): RunnerState {
  const last = st.phase === 'consequence' && st.schedule.length <= st.groups.length;
  return last ? step(s, c, st, { type: 'continue' }) : st;
}

export function play(s: Scenario, c: RunnerContext, events: RunnerEvent[]) {
  const st = run(s, c, events);
  return { st, r: resultOf(s, B, st) };
}

export const act = (actionId: string): RunnerEvent => ({ type: 'act', actionId });
export const check = (target: string, beatId = 'start'): RunnerEvent => ({ type: 'check', beatId, target });
export const tag = (target: string, beatId = 'start', on = true): RunnerEvent => ({ type: 'tag', beatId, target, on });
export const tick = (dt: number): RunnerEvent => ({ type: 'tick', dt });

/**
 * A 3-beat boss: beat 1 = the fraud SMS (+ fee page), beat 2 = an email at +30 s,
 * beat 3 = a call at +30 s with a "What now?" extra. 4 red flags, 3 decoys.
 */
export function boss(over: Raw = {}): Scenario {
  const f = rawFraud('boss1');
  return scenario({
    ...f,
    role: 'boss',
    difficulty: 3,
    pressure: { timer: true, levers: [] },
    inspectables: [
      { target: 'sender.detail', reveal: 'Looks like the courier.', red_flag: false },
      { target: 'link', reveal: 'Not trundle.example.', red_flag: true },
      { target: 'reference', reveal: 'A tracking number.', red_flag: false },
    ],
    beats: [
      ...(f.beats as Raw[]),
      {
        id: 'invoice',
        arrives_after: 30,
        device: 'email',
        message: {
          sender: { display: 'Trundle Customs', detail: 'billing@trundle-customs.example' },
          subject: 'Invoice',
          body: 'Pay the customs invoice at trundle-customs.example/pay today.',
          request: 'pay',
        },
        inspectables: [
          { target: 'sender.detail', reveal: 'Not a Trundle address.', red_flag: true },
          { target: 'link', reveal: 'Not trundle.example.', red_flag: true },
        ],
        actions: [
          { id: 'pay_invoice', label: 'Pay the invoice', kind: 'pay', outcome: 'stolen', pressure_target: true },
          { id: 'check_app_2', label: 'Check in the Trundle app', kind: 'verify_in_app', outcome: 'fine' },
          { id: 'report_2', label: 'Report the email', kind: 'report', outcome: 'reported' },
        ],
      },
      {
        id: 'support_call',
        arrives_after: 30,
        device: 'call',
        message: {
          sender: { display: 'Larchwick Bank', detail: '+49 30 •••• 1000' },
          transcript: [{ speaker: 'caller', text: 'Read me the code to stop the payment.' }],
          request: 'share_code',
        },
        banner: { device: 'sms', message: { sender: { display: 'Larchwick' }, body: 'Code 4471 approves a payment of EUR 900.', request: 'none' } },
        inspectables: [
          { target: 'caller_id', reveal: 'Caller ID can be faked.', red_flag: false },
        ],
        actions: [
          { id: 'hang_up', label: 'Hang up', kind: 'hang_up', outcome: 'hung_up' },
          { id: 'read_code', label: 'Read out the code', kind: 'share_code', outcome: 'stolen', pressure_target: true },
        ],
        what_now: {
          call_back_label: 'Call the number on your card',
          extra: [{ id: 'call_this_number', label: 'Call back this number', kind: 'call_number_in_message', note: "You can't tell whose line that number really is." }],
        },
      },
    ],
    outcomes: { ...(f.outcomes as Raw), hung_up: { narrative: 'The line goes quiet.' } },
    ...over,
  });
}
