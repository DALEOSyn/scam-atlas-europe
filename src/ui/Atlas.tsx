/**
 * The Waymarker Atlas (STORY §1.3) and the story-scene replay list (STORY §4.1 "replayable from the
 * chapter menu"). An Atlas page = the city's If-then line (word for word, with its extra line) + links
 * to the chapter's habit cards. Pages come with finishing a city, never with a score: no tiers, counts
 * or "new" markers. The end screen reuses AtlasPages.
 */
import { useEffect, useRef } from 'preact/hooks';
import { habitCard } from '../content/habitCards.ts';
import type { AtlasPage } from '../engine/story.ts';
import { t } from '../i18n/index.ts';
import { Postcard } from './Postcard.tsx';
import styles from './Scene.module.css';
import { useDocumentTitle } from './documentTitle.ts';

export function AtlasPages({ pages, headingLevel = 2 }: { pages: readonly AtlasPage[]; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <ol class={styles.atlas}>
      {pages.map((p) => (
        <li key={p.city} class={styles.atlasPage} data-atlas-page={p.city}>
          <H>{p.name}</H>
          <Postcard ifThen={p.ifThen} city={p.name} />
          {p.cards.length > 0 ? (
            <>
              <p>{t('atlas_cards')}</p>
              <ul>
                {p.cards.map((id) => {
                  const card = habitCard(id);
                  return card ? (
                    <li key={id} data-habit-card={id}>
                      <strong>{card.title}</strong>: {card.habit}
                    </li>
                  ) : null;
                })}
              </ul>
            </>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function AtlasScreen({ pages, loading = false, backTo = 'title', onBack }: { pages: readonly AtlasPage[]; loading?: boolean; backTo?: 'title' | 'chapters'; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useDocumentTitle(t('atlas_title'));
  useEffect(() => heading.current?.focus(), []);
  return (
    <main class={styles.shell}>
      <section class={styles.scene} aria-labelledby="atlas-h">
        <h1 id="atlas-h" ref={heading} tabIndex={-1} class={styles.title}>
          {t('atlas_title')}
        </h1>
        <p>{t('atlas_intro')}</p>
        {loading ? <p role="status">{t('app_loading')}</p> : pages.length === 0 ? <p>{t('atlas_empty')}</p> : <AtlasPages pages={pages} />}
        <div class={styles.buttons}>
          <button type="button" class={styles.secondary} onClick={onBack}>
            {t(backTo === 'chapters' ? 'app_back_to_chapters' : 'atlas_back')}
          </button>
        </div>
      </section>
    </main>
  );
}

/**
 * "Story scenes: Berlin": scenes of one chapter the player has already seen, to watch again ("Watch: Arrival").
 * `scenes` is null while their titles load. `focus`: after a replayed scene, its "Watch:" button gets focus
 * back (review T-S3 item 16); otherwise the heading.
 */
export function SceneReplayList({
  city,
  scenes,
  focus,
  onPlay,
  onBack,
}: {
  city: string;
  scenes: readonly { id: string; label: string }[] | null;
  focus?: string | undefined;
  onPlay: (id: string) => void;
  onBack: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useDocumentTitle(t('replay_title', { city }));
  const list = useRef<HTMLUListElement>(null);
  const loaded = scenes !== null;
  useEffect(() => {
    const btn = focus && loaded ? [...(list.current?.querySelectorAll<HTMLElement>('[data-replay]') ?? [])].find((b) => b.dataset.replay === focus) : undefined;
    (btn ?? heading.current)?.focus();
  }, [loaded]);
  return (
    <main class={styles.shell}>
      <section class={styles.scene} aria-labelledby="replay-h">
        <h1 id="replay-h" ref={heading} tabIndex={-1} class={styles.title}>
          {t('replay_title', { city })}
        </h1>
        <p>{t('replay_intro')}</p>
        {scenes === null ? (
          <p role="status">{t('app_loading')}</p>
        ) : (
          <ul class={styles.options} ref={list}>
            {scenes.map((s) => (
              <li key={s.id}>
                <button type="button" class={styles.option} data-replay={s.id} onClick={() => onPlay(s.id)}>
                  {t('replay_play', { scene: s.label })}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div class={styles.buttons}>
          <button type="button" class={styles.secondary} onClick={onBack}>
            {t('replay_back')}
          </button>
        </div>
      </section>
    </main>
  );
}
