/**
 * E2E harness (test only, never shipped): renders the scene player and the HUD with fixture data, so
 * Playwright can measure layout on stable fixture scenes and the HUD in states that are hard to reach in
 * play (the authored scenes in content/scenes are played by the production e2e).
 * Review T-S3 items 3 (listener beside the speaker), 4 (Next stays on screen) and 5 (HUD one row).
 *
 * `?view=scene&id=<fixture id>` plays a fixture scene; `?view=hud&coach=1|0` shows the HUD with the
 * coach-mark freeze on or off. Data comes from vite.harness.config.ts (fixtures parsed by sceneSchema).
 */
import { render } from 'preact';
import type { Scene } from '../../../src/content/schema.ts';
import type { RunnerView } from '../../../src/engine/runner.ts';
import { Hud } from '../../../src/ui/Hud.tsx';
import { ScenePlayer } from '../../../src/ui/ScenePlayer.tsx';
import '../../../src/styles/tokens.css';
import '../../../src/global.css';

declare const __HARNESS_SCENES__: Scene[];

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
  const scene = __HARNESS_SCENES__.find((s) => s.id === q.get('id')) ?? __HARNESS_SCENES__[0];
  if (!scene) return <p>No fixture scenes.</p>;
  return <ScenePlayer key={scene.id} scene={scene} heading={`Berlin · ${scene.id}`} chapterName="Berlin" onDone={(how) => document.body.setAttribute('data-done', how)} />;
}

const root = document.getElementById('app');
if (root) render(<Harness />, root);
