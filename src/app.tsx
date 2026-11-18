import { useState } from 'preact/hooks';
import type { Scenario } from './content/schema.ts';
import { listScenarios } from './content/scenarios.ts';
import type { Resolution } from './engine/outcome.ts';
import { t } from './i18n/index.ts';
import { DebriefView, ScenarioView } from './ui/ScenarioView.tsx';
import styles from './app.module.css';

type Screen =
  | { kind: 'title' }
  | { kind: 'loading' }
  | { kind: 'playing'; scenario: Scenario }
  | { kind: 'debrief'; scenario: Scenario; result: Resolution };

export interface AppProps {
  /** Injected in tests; defaults to the first scenario of the tutorial chapter. */
  loadFirst?: () => Promise<Scenario>;
}

const defaultLoadFirst = async (): Promise<Scenario> => {
  const refs = listScenarios();
  const first = refs.find((r) => r.chapter === 'home') ?? refs[0];
  if (!first) throw new Error('no scenarios bundled');
  return first.load();
};

export function App({ loadFirst = defaultLoadFirst }: AppProps) {
  const [screen, setScreen] = useState<Screen>({ kind: 'title' });

  const start = async () => {
    setScreen({ kind: 'loading' });
    setScreen({ kind: 'playing', scenario: await loadFirst() });
  };

  return (
    <main class={styles.shell}>
      <header>
        <h1 class={styles.title}>{t('app.title')}</h1>
        {screen.kind === 'title' ? <p class={styles.tagline}>{t('app.tagline')}</p> : null}
      </header>
      {screen.kind === 'title' ? (
        <button type="button" class={styles.start} onClick={() => void start()}>
          {t('app.start')}
        </button>
      ) : null}
      {screen.kind === 'loading' ? <p role="status">{t('app.loading')}</p> : null}
      {screen.kind === 'playing' ? (
        <ScenarioView
          scenario={screen.scenario}
          onDone={(result) => setScreen({ kind: 'debrief', scenario: screen.scenario, result })}
        />
      ) : null}
      {screen.kind === 'debrief' ? (
        <DebriefView
          scenario={screen.scenario}
          result={screen.result}
          onAgain={() => setScreen({ kind: 'playing', scenario: screen.scenario })}
        />
      ) : null}
    </main>
  );
}
