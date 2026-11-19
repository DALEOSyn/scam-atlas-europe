/**
 * E2E harness (test only, never shipped): renders the scene player and the HUD with fixture data, so
 * Playwright can measure layout on stable fixture scenes and the HUD in states that are hard to reach in
 * play (the authored scenes in content/scenes are played by the production e2e).
 * Review T-S3 items 3 (listener beside the speaker), 4 (Next stays on screen) and 5 (HUD one row).
 *
 * `?view=scene&id=<fixture id>` plays a fixture scene; `?view=real&id=<scene id>` an authored scene (CR-28); `?view=hud&coach=1|0` shows the HUD with the
 * coach-mark freeze on or off. Data comes from vite.harness.config.ts (fixtures parsed by sceneSchema).
 */
import { render } from 'preact';
import { balance } from '../../../src/content/balance.ts';
import type { Scenario, Scene } from '../../../src/content/schema.ts';
import { resultOf } from '../../../src/engine/result.ts';
import type { RunnerContext, RunnerView } from '../../../src/engine/runner.ts';
import { AnnouncerProvider } from '../../../src/ui/Announcer.tsx';
import { ScenarioView } from '../../../src/ui/ScenarioView.tsx';
import { Hud } from '../../../src/ui/Hud.tsx';
import { ScenePlayer } from '../../../src/ui/ScenePlayer.tsx';
import '../../../src/styles/tokens.css';
import '../../../src/global.css';

declare const __HARNESS_SCENES__: Scene[];
declare const __HARNESS_REAL_SCENES__: Scene[];
declare const __HARNESS_SCENARIOS__: Scenario[];

/** A fixed postcard for flip panels, so every authored panel is laid out (CR-28). */
const FLIP = { city: 'home', cityName: 'Home', ifThen: { cue: 'If a message rushes you to act,', action: 'then I stop and check it another way.' } };

function hudView(coach: boolean): RunnerView {
  const view: Pick<RunnerView, 'timer' | 'stress' | 'pause'> = {
    timer: { remaining: 42, length: 60, expiries: 0, frozen: coach, coachMark: coach },
    stress: { value: 30, state: 'tense' },
    pause: { open: false, available: true, cooldownLeft: 0 },
  };
  // The HUD reads only timer, stress and pause; the rest of RunnerView is not needed here.
  return view as RunnerView;
}

function Harness() {
  const q = new URLSearchParams(location.search);
  if (q.get('view') === 'hud') {
    const noop = () => undefined;
    return (
      <Hud
        view={hudView(q.get('coach') === '1')}
        progress={{ index: 3, total: 8 }}
        chip={null}
        timersOff={false}
        onPause={noop}
        menu={{ checkMode: false, onCheckMode: noop, callLines: 'auto', onCallLines: noop, onTimeLeft: noop, onQuit: noop, onOpen: noop }}
      />
    );
  }
  if (q.get('view') === 'scenario') {
    // CR-30 … CR-35 fixture scenarios in the real ScenarioView. Timers off unless ?timer=standard; slot 4.
    // On done, the result lands on <body data-done='{"stars":…,"points":…}'> for the e2e to read.
    const s = __HARNESS_SCENARIOS__.find((x) => x.id === q.get('id'));
    if (!s) return <p>No such scenario.</p>;
    const timerMode = q.get('timer') === 'standard' ? 'standard' : 'off';
    const ctx: RunnerContext = { balance, slot: 4, settings: { timerMode, pushers: true }, stress: 10 };
    return (
      <AnnouncerProvider minInterval={15}>
        <ScenarioView
          scenario={s}
          ctx={ctx}
          coachMarks={q.get('coach') === '1' ? [] : ['payee_check']}
          onDone={(st) => {
            const r = resultOf(s, balance, st);
            document.body.setAttribute('data-done', JSON.stringify({ stars: r.stars, points: r.points, beats: r.beats.map((b) => b.stars) }));
          }}
        />
      </AnnouncerProvider>
    );
  }
  if (q.get('view') === 'real') {
    const real = __HARNESS_REAL_SCENES__.find((s) => s.id === q.get('id'));
    if (!real) return <p>No such scene.</p>;
    const city = real.chapter === 'interludes' ? '' : real.chapter.charAt(0).toUpperCase() + real.chapter.slice(1);
    return <ScenePlayer key={real.id} scene={real} heading={city ? `${city} · ${real.slot}` : 'Between cities'} chapterName={city} flip={FLIP} vars={{ count: 3, lastCity: 'Amsterdam' }} onDone={(how) => document.body.setAttribute('data-done', how)} />;
  }
  const scene = __HARNESS_SCENES__.find((s) => s.id === q.get('id')) ?? __HARNESS_SCENES__[0];
  if (!scene) return <p>No fixture scenes.</p>;
  return <ScenePlayer key={scene.id} scene={scene} heading={`Berlin · ${scene.id}`} chapterName="Berlin" onDone={(how) => document.body.setAttribute('data-done', how)} />;
}

const root = document.getElementById('app');
if (root) render(<Harness />, root);
