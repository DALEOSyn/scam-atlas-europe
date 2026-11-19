// @vitest-environment jsdom
/** DebriefView output for rulings L1 and L2 (T-2.7), on the real home-06 boss. */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/preact';
import { scenarioSchema } from '../../src/content/schema.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { act, check, ctx, play, tag } from './engine/helpers.ts';
import { readYaml } from './helpers.ts';

afterEach(cleanup);
const none = { pressureAny: false, pressureGenuine: false };
const s = scenarioSchema.parse(readYaml('content/scenarios/home/home-06-boss-new-portal.yaml'));

describe('DebriefView, rulings L1 and L2', () => {
  it('★★★ displayed after "Leave it there": the Next time pointer in layer 1, the beat line with stars in layer 2', () => {
    const { st, r } = play(s, ctx({ slot: 0 }), [
      act('open_desk_bookmark'), { type: 'continue' },
      check('image', 'kettle_it_chat'), tag('image', 'kettle_it_chat'), act('ask_adaeze_chat'), { type: 'continue' },
      check('caller_id', 'it_call'), tag('caller_id', 'it_call'),
      act('hang_up_it_call'), { type: 'what_now', choice: 'done' },
    ]);
    const { container } = render(<DebriefView data={debriefOf(s, st, r, none)} onContinue={() => undefined} onAgain={() => undefined} />);
    const layer1 = container.querySelector('section[aria-labelledby="debrief-h1"]') as HTMLElement;
    expect(within(layer1).getByText('Next time: report, or call a known number.')).toBeTruthy();
    expect(layer1.textContent).not.toMatch(/You chose|You hung up|That is the habit that works/);
    expect(screen.getByText('Call from Waymarker IT (2 of 3 stars): You hung up and left it there.')).toBeTruthy();
    expect(screen.getByText(/Caller ID: You marked this\. Fair instinct, but a real call shows the same name, so it can't tell you which this is\./)).toBeTruthy();
    expect(screen.getByText(/Image: You marked this\. Fair instinct, but a real message shows the same logo/)).toBeTruthy();
  });
});
