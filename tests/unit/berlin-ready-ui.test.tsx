// @vitest-environment jsdom
/** T-2.8 Berlin readiness, UI side (QA B1, M1–M8, m1–m8, L2) with fixtures only (no Berlin content here). */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act as flush, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact';
import { App, chapterRows, resumeChapter, TimingScreen } from '../../src/app.tsx';
import type { Chapter, Scenario } from '../../src/content/schema.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { resultOf } from '../../src/engine/result.ts';
import { freshSave, createStore, type StorageLike } from '../../src/engine/save.ts';
import { EMPTY_QUEUE, enqueue, flushAll, nextAnnouncement } from '../../src/ui/announcer.ts';
import { ChapterDone } from '../../src/ui/ChapterDone.tsx';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { DeviceView, spokenText } from '../../src/ui/devices/Device.tsx';
import type { DeviceProps } from '../../src/ui/devices/types.ts';
import { ScenarioView } from '../../src/ui/ScenarioView.tsx';
import { rawFraud, rawGenuine, scenario } from '../content/fixtures.ts';
import { t } from '../../src/i18n/index.ts';
import { act, B, boss, ctx, run, type Raw } from './engine/helpers.ts';

afterEach(cleanup);
const none = { pressureAny: false, pressureGenuine: false };

function memory(): StorageLike {
  const data = new Map<string, string>();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

function deviceProps(over: Partial<DeviceProps>): DeviceProps {
  const s = scenario(rawFraud());
  return {
    beatId: 'start',
    device: s.device,
    message: s.message,
    banner: null,
    scenario: s,
    thread: [],
    pushers: [],
    actions: [],
    canAct: true,
    onAct: () => undefined,
    onTranslation: () => undefined,
    alwaysTranslate: false,
    call: null,
    onAnswer: () => undefined,
    onDecline: null,
    onNextLine: () => undefined,
    heading: 'Heading',
    headingRef: { current: null },
    ...over,
  };
}

describe('M1: banners carry lang and the Translate toggle', () => {
  it('a German code text in a call banner', () => {
    const call = boss().beats.find((b) => b.id === 'support_call');
    if (!call) throw new Error('fixture');
    const banner = { device: 'sms' as const, message: { ...(call.banner?.message ?? { request: 'none' as const }), body: 'Ihr Code: 4471. Geben Sie ihn niemandem.', lang: 'de', translation: 'Your code: 4471. Give it to no one.' } };
    const { container } = render(<DeviceView {...deviceProps({ device: 'call', message: call.message, banner, call: { beatId: 'support_call', answered: true, shown: 1, ended: false, step: false } })} />);
    const body = container.querySelector('[role="group"] [lang="de"]');
    expect(body?.textContent).toContain('Ihr Code');
    // No checkable in a banner (ruling QA L1): the ask is the request checkable.
    expect(container.querySelector('[role="group"] [data-check]')).toBeNull();
    fireEvent.click(within(container.querySelector('[role="group"]') as HTMLElement).getByRole('button', { name: 'Translate' }));
    expect(container.textContent).toContain('Your code: 4471.');
  });
});

describe('M2: pushers show their own sender and channel; a caller follow-up is a call line', () => {
  const pusher = (over: Partial<DeviceProps['pushers'][number]>): DeviceProps['pushers'][number] => ({ index: 0, text: 'x', at: 1, beatId: 'start', device: 'sms', sender: 'TRUNDLE', ...over });
  it('an SMS follow-up on the email beat is "Text message · TRUNDLE"', () => {
    const inv = boss().beats.find((b) => b.id === 'invoice');
    if (!inv) throw new Error('fixture');
    const { container } = render(<DeviceView {...deviceProps({ device: 'email', message: inv.message, pushers: [pusher({ text: 'TRUNDLE: pay today.' })] })} />);
    expect(container.querySelector('[data-pusher="sms"]')?.textContent).toMatch(/^Text message · TRUNDLE/);
  });
  it('the caller\'s "Are you still there?" is a transcript line, not a text message', () => {
    const call = boss().beats.find((b) => b.id === 'support_call');
    if (!call) throw new Error('fixture');
    const { container } = render(
      <DeviceView
        {...deviceProps({ device: 'call', message: call.message, call: { beatId: 'support_call', answered: true, shown: 1, ended: false, step: false }, pushers: [pusher({ device: 'call', sender: 'Larchwick Bank', text: 'Caller: "Are you still there?"' })] })}
      />,
    );
    const line = container.querySelector('li[data-pusher="call"]');
    expect(line?.textContent).toBe(`${t('call_caller')} Are you still there?`);
    expect(container.textContent).not.toContain('Text message');
    expect(spokenText('Caller: “Hello?”')).toBe('Hello?');
  });
});

describe('ruling QA L5: earlier texts in the thread', () => {
  it('render muted under "Earlier", with no checkable and no link control', () => {
    const raw = rawFraud();
    (raw.message as Raw).earlier = [{ when: 'Yesterday', body: 'Trundle: track it at trundle.example/t/1' }];
    const s = scenario(raw);
    const { container } = render(<DeviceView {...deviceProps({ message: s.message })} />);
    const earlier = container.querySelector('[data-earlier]');
    expect(container.textContent).toContain('Earlier');
    expect(earlier?.textContent).toContain('Yesterday');
    expect(earlier?.querySelector('button, a')).toBeNull();
  });
});

describe('m5: the announcer', () => {
  it('flushes everything when a scenario ends', () => {
    let q = enqueue(EMPTY_QUEUE, 4, 'Stress: Tense');
    q = enqueue(q, 5, 'New message.');
    expect(flushAll(q).pending).toEqual([]);
  });
  it('an interrupt keeps its own slot: never coalesced into "2 new messages", and announced first', () => {
    let q = enqueue(EMPTY_QUEUE, 5, 'New message: pay', (n) => `${n} new messages.`);
    q = enqueue(q, 5, 'New notification: Chat message from Jonas.', undefined, 'interrupt');
    q = enqueue(q, 5, 'New message: now', (n) => `${n} new messages.`);
    const first = nextAnnouncement(q, 100, 15);
    expect(first.say).toBe('New notification: Chat message from Jonas.');
    expect(nextAnnouncement(first.queue, 200, 15).say).toBe('2 new messages.');
  });
});

/** A fraud SMS with Jonas (German, translated) arriving at 2 s. */
function withJonas(): Scenario {
  const raw = rawFraud();
  return scenario({
    ...raw,
    interrupts: [
      {
        id: 'jonas',
        at_seconds: 2,
        is_fraud: false,
        device: 'messenger',
        message: { sender: { display: 'Jonas', detail: 'Saved contact' }, body: 'Dein Paket ist bei mir.', lang: 'de', translation: 'Your parcel is with me.', request: 'reply' },
        actions: [
          { id: 'thanks', label: 'Reply: thanks', kind: 'proceed', outcome: 'jonas_thanked', pressure_target: true },
          { id: 'report_jonas', label: 'Report the message', kind: 'report', outcome: 'jonas_reported' },
        ],
      },
    ],
    outcomes: { ...(raw.outcomes as Raw), jonas_thanked: { narrative: 'Jonas: see you later.' }, jonas_reported: { narrative: 'Jonas laughs it off.' } },
  });
}

describe('M1/M3/M4: interrupts', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] });
  });
  afterEach(() => vi.useRealTimers());

  it('banner with View, lang + Translate on the body, focus back on the message after answering, outcome in the consequence step', async () => {
    const s = withJonas();
    render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off', pushers: false })} onDone={() => undefined} />);
    await flush(async () => {
      vi.advanceTimersByTime(3000);
    });
    const banner = document.querySelector('[data-interrupt-banner="jonas"]') as HTMLElement;
    expect(banner).toBeTruthy();
    expect(document.activeElement?.id).toBe('device-heading');
    fireEvent.click(within(banner).getByRole('button', { name: 'View the message from Jonas' }));
    expect(document.activeElement?.id).toBe('interrupt-jonas-h');
    const item = document.querySelector('[data-interrupt="jonas"]') as HTMLElement;
    expect(item.querySelector('[lang="de"]')?.textContent).toContain('Dein Paket');
    expect(within(item).getByRole('button', { name: 'Translate' })).toBeTruthy();
    await flush(async () => {
      fireEvent.click(within(item).getByRole('button', { name: 'Reply: thanks' }));
    });
    // QA M4: focus goes back to the message, never to <body>.
    expect(document.activeElement?.id).toBe('device-heading');
    await flush(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Report it' }));
    });
    const panel = screen.getByRole('heading', { level: 3, name: 'What happened' }).parentElement as HTMLElement;
    expect(panel.textContent).toContain('Reported.');
    expect(panel.textContent).toContain('Jonas: see you later.');
  });

  it('Settings from the menu: a modal dialog; changes go to the save', async () => {
    const s = scenario(rawFraud());
    const onSettings = vi.fn();
    render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off' })} onDone={() => undefined} settings={freshSave().settings} onSettings={onSettings} />);
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    await flush(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    });
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(document.activeElement?.id).toBe('settings-h');
    expect(document.querySelector('main')?.hasAttribute('inert')).toBe(true);
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Always show translations' }));
    expect(onSettings).toHaveBeenLastCalledWith(expect.objectContaining({ alwaysTranslate: true }));
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Timers off' }));
    expect(onSettings).toHaveBeenLastCalledWith(expect.objectContaining({ timerMode: 'off' }));
    fireEvent.click(within(dialog).getByRole('button', { name: /Calm preset/ }));
    expect(onSettings).toHaveBeenLastCalledWith(expect.objectContaining({ timerMode: 'off', pushers: false, callLines: 'step' }));
    await flush(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog', { name: 'Settings' })).toBeNull();
  });
});

describe('m7: Extended is pre-selected under reduced motion', () => {
  it('the timing screen is one choice with the device default checked', () => {
    render(<TimingScreen preselect="extended" onChoose={() => undefined} />);
    expect((screen.getByRole('radio', { name: /Extended timer/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('radio', { name: 'Standard timer' }) as HTMLInputElement).checked).toBe(false);
  });
});

describe('B1: chapters, Start continues the next unfinished unlocked chapter', () => {
  const ch = (slot: number, city: string, name: string, am: string[], pm: string[] = []): Chapter => ({
    slot,
    city,
    name,
    status: 'draft',
    patterns: ['smishing-parcel-fee'],
    callbacks: [],
    lo_focus: ['LO-01'],
    scenario_order: { am, pm },
    intro: 'x',
  });
  const chapters = [ch(0, 'home', 'Home', ['h1']), ch(1, 'testcity', 'Testcity', ['t1'], ['t2'])];

  it('resume picks the run in progress, else the first unlocked chapter not finished', () => {
    const save = freshSave();
    expect(resumeChapter(chapters, save)?.city).toBe('home');
    const homeDone = { ...save, chapters: { home: { finished: true, bestStamp: 'gold' as const, bestRating: 100, position: 0, run: null } } };
    expect(resumeChapter(chapters, homeDone)?.city).toBe('testcity');
    expect(chapterRows(chapters, save).map((r) => [r.city, r.locked])).toEqual([
      ['home', false],
      ['testcity', true],
    ]);
    const all = { ...homeDone, chapters: { ...homeDone.chapters, testcity: { finished: true, bestStamp: 'bronze' as const, bestRating: 50, position: 1, run: null } } };
    expect(resumeChapter(chapters, all)).toBeNull();
  });

  it('a finished Home: Start plays the next chapter; the list replays Home; the stop screen follows the morning', async () => {
    const byId: Record<string, Scenario> = {
      h1: scenario(rawGenuine('h1', { chapter: 'home' })),
      t1: scenario(rawGenuine('t1')),
      t2: scenario(rawGenuine('t2')),
    };
    const store = createStore(memory());
    const s0 = freshSave();
    store.save({ ...s0, chapters: { home: { finished: true, bestStamp: 'gold', bestRating: 100, position: 0, run: null } } });
    render(<App store={store} chapters={chapters} load={async (_c, id) => byId[id]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Chapters' }));
    const list = screen.getByRole('list');
    expect(within(list).getByRole('button', { name: 'Replay Home' })).toBeTruthy();
    expect(within(list).getByRole('button', { name: 'Play Testcity' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Back to the start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => screen.getByRole('button', { name: 'Check in the app first' }));
    expect(screen.getByRole('img', { name: /1 of 2/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Check in the app first' }));
    await waitFor(() => screen.getByRole('heading', { level: 3, name: 'What happened' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => screen.getByRole('heading', { level: 1, name: /This was genuine/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    // M8: half-day stop after the morning block.
    await waitFor(() => screen.getByRole('heading', { level: 1, name: 'Good place to take a break' }));
    expect(screen.getByText('1 message left today. Your progress is saved.')).toBeTruthy();
    expect(screen.getByText('Morning done: 1 of 2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Keep going' }));
    await waitFor(() => screen.getByRole('img', { name: /2 of 2/ }));
  });
});

describe('Chapter end and arc debrief', () => {
  it('the stamp carries the city name', () => {
    const summary = { points: 1, max: 1, rating: 100, spotted: 0, spottedShown: 0, correctShown: 0, correctTags: 0, wrongTags: 0, redFlags: 0, genuineReported: 0, doubleChecks: 0, offFocusDoubleChecks: 0, stamp: 'gold' as const, nextTier: null };
    render(<ChapterDone summary={summary} city="Berlin" onBack={() => undefined} />);
    expect(screen.getByText('Passport stamp: Berlin, gold')).toBeTruthy();
  });

  it('m4: no "Clicked the link" heading on an arc; "Tell me now" sits behind a confirmation', async () => {
    const s = scenario(rawFraud());
    const st = run(s, ctx(), [act('open_app')]);
    const base = debriefOf(s, st, resultOf(s, B, st), none);
    const data = { ...base, variant: 'arc' as const, layer2: { ...base.layer2, alreadyClicked: { clicked: 'Chatting is fine. Tell someone you trust.' } } };
    const tell = vi.fn();
    render(<DebriefView data={data} onContinue={() => undefined} onAgain={() => undefined} onTellMeNow={tell} />);
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(document.body.textContent).not.toContain('Clicked the link');
    expect(screen.getByText('Replied, moved to another app or kept a secret')).toBeTruthy();
    await flush(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Tell me now' }));
    });
    expect(screen.getByText('This reveals the Alex storyline. Continue?')).toBeTruthy();
    expect(document.activeElement?.textContent).toBe('Not now');
    expect(tell).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Yes, tell me' }));
    expect(tell).toHaveBeenCalledOnce();
  });
});
