/**
 * Scene player (S3; STORY §4, §5; ART_DIRECTION §7, §9, §10). Story scenes between scenarios: arrival,
 * turn, resolution, spec-placed beats and travel interludes.
 *
 * - Panels are revealed one at a time by the player, never automatically; earlier panels stay above.
 *   Next moves focus to the new panel's list item (ART_DIRECTION §9 structure: section → ol → li →
 *   figure with one image description and a figcaption holding the speaker label, line and choice).
 * - Skip (same place on every scene) ends the scene; the Help link opens "Where to report and get help"
 *   inside the player and returns to the same panel. On sensitive scenes the link reads "Need to talk?".
 * - A sensitive scene opens on its content note with a way out: show it, skip it, or get help.
 * - Art is plain <img> with a fragment id (`cast/<id>.svg#x-<expression>`); each image mounts with its final
 *   src (keyed by src), so engines that ignore fragment-only src changes still show the right face.
 * - Reduced motion: no fade, instant scroll, instant postcard flip (duration tokens are 0).
 * - Nothing here scores or sets a flag. A choice shows the one shared reply; a flip is recorded by the parent.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { castMember } from '../content/cast.ts';
import type { Scene, ScenePanel } from '../content/schema.ts';
import { fillStory, visiblePanels, type IfThen, type StoryVars } from '../engine/story.ts';
import { t, type MessageKey } from '../i18n/index.ts';
import { artUrl, FlipCard, Postcard } from './Postcard.tsx';
import styles from './Scene.module.css';

export interface FlipPick {
  city: string;
  cityName: string;
  ifThen: IfThen;
}

export interface ScenePlayerProps {
  scene: Scene;
  /** Chapter name for the heading ("Berlin · Arrival"); null for interludes. */
  place: string | null;
  /** The chapter run's flags (story-only variant flags pick panels). */
  flags?: ReadonlySet<string>;
  vars?: StoryVars;
  /** The postcard Teo reads on a flip_postcard panel; null hides that panel. */
  flip?: FlipPick | null;
  onFlip?: (city: string) => void;
  /** Text of the content note shown before a sensitive scene (null: none). Not shown on replay. */
  contentNote?: string | null;
  onDone: (how: 'finished' | 'skipped') => void;
}

const SLOT_KEY: Record<Scene['slot'], MessageKey> = {
  arrival: 'scene_slot_arrival',
  turn: 'scene_slot_turn',
  beat: 'scene_slot_beat',
  resolution: 'scene_slot_resolution',
  interlude: 'scene_slot_interlude',
};

function prefersReducedMotion(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced') return true;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function HelpList() {
  return (
    <ul class={styles.helpList}>
      <li>{t('help_bank')}</li>
      <li>{t('help_police')}</li>
      <li>{t('help_consumer')}</li>
      <li>{t('help_platform')}</li>
      <li>{t('help_talk')}</li>
    </ul>
  );
}

export function ScenePlayer({ scene, place, flags = new Set(), vars = { count: 0, lastCity: '' }, flip = null, onFlip, contentNote = null, onDone }: ScenePlayerProps) {
  const panels = visiblePanels(scene, flags).filter((p) => !p.flip_postcard || flip);
  const [view, setView] = useState<'note' | 'panels' | 'help'>(scene.sensitive && contentNote ? 'note' : 'panels');
  const [shown, setShown] = useState(1);
  const [helpFrom, setHelpFrom] = useState<'note' | 'panels'>('panels');
  const [picked, setPicked] = useState<Record<number, number>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const replies = useRef<(HTMLParagraphElement | null)[]>([]);
  /** What gets focus after the next render: the heading, a panel, or a choice reply. */
  const focusNext = useRef<{ kind: 'heading' } | { kind: 'panel'; i: number } | { kind: 'reply'; i: number }>({ kind: 'heading' });

  const fill = (text: string) => fillStory(text, vars);
  const title = t('scene_title', { place: place ?? t('scene_interlude_place'), part: t(SLOT_KEY[scene.slot]) });
  const sensitive = scene.sensitive;

  useLayoutEffect(() => {
    const f = focusNext.current;
    focusNext.current = { kind: 'heading' };
    if (f.kind === 'panel') {
      const el = items.current[f.i];
      if (!el) return;
      el.focus();
      if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    } else if (f.kind === 'reply') replies.current[f.i]?.focus();
    else heading.current?.focus();
  }, [view, shown, picked]);

  // A scene with no visible panel (all variants off, or only a flip without a postcard) ends at once.
  useEffect(() => {
    if (panels.length === 0) onDone('finished');
  }, []);
  if (panels.length === 0) return null;

  const helpLabel = t(sensitive ? 'scene_help_sensitive' : 'scene_help');
  const chrome = (
    <div class={styles.chrome}>
      <button type="button" class={sensitive ? `${styles.help} ${styles.helpStrong}` : styles.help} data-scene="help"
        onClick={() => {
          setHelpFrom(view === 'note' ? 'note' : 'panels');
          setView('help');
        }}
      >
        {helpLabel}
      </button>
      {view !== 'note' ? (
        <button type="button" class={styles.skip} data-scene="skip" onClick={() => onDone('skipped')}>
          {t('scene_skip')}
        </button>
      ) : null}
    </div>
  );

  if (view === 'note') {
    return (
      <main class={styles.shell} data-scene-id={scene.id}>
        <section class={styles.scene} aria-labelledby="scene-note-h">
          <header class={styles.head}>
            <h1 id="scene-note-h" ref={heading} tabIndex={-1} class={styles.title}>
              {t('scene_note_title')}
            </h1>
            {chrome}
          </header>
          <p class={styles.note} data-content-note="">
            {contentNote}
          </p>
          <div class={styles.buttons}>
            <button type="button" class={styles.primary} onClick={() => setView('panels')}>
              {t('scene_note_show')}
            </button>
            <button type="button" class={styles.secondary} onClick={() => onDone('skipped')}>
              {t('scene_note_skip')}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (view === 'help') {
    return (
      <main class={styles.shell} data-scene-id={scene.id}>
        <section class={styles.scene} aria-labelledby="scene-help-h">
          <h1 id="scene-help-h" ref={heading} tabIndex={-1} class={styles.title}>
            {t('help_title')}
          </h1>
          <p>{t('help_intro')}</p>
          <HelpList />
          <div class={styles.buttons}>
            <button
              type="button"
              class={styles.primary}
              onClick={() => {
                // Back where the player was: the content note, or the same panel (focus on it).
                if (helpFrom === 'panels') focusNext.current = { kind: 'panel', i: shown - 1 };
                setView(helpFrom);
              }}
            >
              {t('help_back')}
            </button>
          </div>
        </section>
      </main>
    );
  }

  const last = shown >= panels.length;
  const roleShown = new Set<string>();
  return (
    <main class={styles.shell} data-scene-id={scene.id}>
      <section class={styles.scene} aria-labelledby="scene-h">
        <header class={styles.head}>
          <h1 id="scene-h" ref={heading} tabIndex={-1} class={styles.title}>
            <span class={styles.kicker}>{t('scene_story_label')}</span> {title}
          </h1>
          {chrome}
        </header>
        <ol class={styles.panels}>
          {panels.slice(0, shown).map((p, i) => {
            const firstOfSpeaker = p.speaker && p.speaker !== 'you' && !roleShown.has(p.speaker);
            if (p.speaker) roleShown.add(p.speaker);
            return (
              <li
                key={i}
                class={styles.panel}
                tabIndex={-1}
                ref={(el) => {
                  items.current[i] = el;
                }}
                data-panel={i + 1}
              >
                <span class={styles.vh}>{t('scene_panel_of', { n: i + 1, total: panels.length })}</span>
                <figure class={styles.figure}>
                  <PanelArt p={p} />
                  <figcaption class={captionClass(p)}>
                    <PanelText
                      p={p}
                      fill={fill}
                      withRole={!!firstOfSpeaker}
                      flip={flip}
                      onFlip={onFlip}
                      picked={picked[i]}
                      replyRef={(el) => {
                        replies.current[i] = el;
                      }}
                      onPick={(o) => {
                        focusNext.current = { kind: 'reply', i };
                        setPicked((x) => ({ ...x, [i]: o }));
                      }}
                    />
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ol>
        <div class={styles.footer}>
          <button
            type="button"
            class={styles.primary}
            data-scene="next"
            onClick={() => {
              if (last) return onDone('finished');
              focusNext.current = { kind: 'panel', i: shown };
              setShown((n) => Math.min(panels.length, n + 1));
            }}
          >
            {t(last ? 'scene_continue' : 'scene_next')}
          </button>
        </div>
      </section>
    </main>
  );
}

function captionClass(p: ScenePanel): string {
  if (p.speaker === 'you') return `${styles.caption} ${styles.you}`;
  if (!p.speaker) return `${styles.caption} ${styles.narration}`;
  return styles.caption ?? '';
}

/** One description for the whole picture (role="img"); every layer inside is decorative. */
function PanelArt({ p }: { p: ScenePanel }) {
  const drawn = p.speaker && p.speaker !== 'you' ? p.speaker : null;
  const speakerSrc = drawn ? artUrl(`cast/${drawn}.svg#x-${p.expression ?? 'calm'}`) : null;
  const listenerSrc = p.with ? artUrl(`cast/${p.with.id}.svg#x-${p.with.expression}`) : null;
  const figures = (
    <>
      {listenerSrc ? <img key={listenerSrc} class={`${styles.listener} ${p.flip ? '' : styles.onRight}`} src={listenerSrc} alt="" data-art="listener" /> : null}
      {speakerSrc ? <img key={speakerSrc} class={`${styles.speaker} ${p.flip ? styles.onRight : ''}`} src={speakerSrc} alt="" data-art="speaker" /> : null}
    </>
  );
  return (
    <div class={styles.art} role="img" aria-label={p.alt} data-crop={p.crop}>
      {p.backdrop && !p.video ? <img class={styles.backdrop} src={artUrl(`backdrops/${p.backdrop}.svg`)} alt="" data-art="backdrop" /> : <span class={styles.wall} aria-hidden="true" />}
      <span class={styles.dusk} aria-hidden="true" />
      {p.video ? <span class={styles.video}>{figures}</span> : figures}
    </div>
  );
}

function PanelText({
  p,
  fill,
  withRole,
  flip,
  onFlip,
  picked,
  onPick,
  replyRef,
}: {
  p: ScenePanel;
  fill: (s: string) => string;
  withRole: boolean;
  flip: FlipPick | null;
  onFlip: ((city: string) => void) | undefined;
  picked: number | undefined;
  onPick: (option: number) => void;
  replyRef: (el: HTMLParagraphElement | null) => void;
}) {
  const member = p.speaker && p.speaker !== 'you' ? castMember(p.speaker) : undefined;
  const label = p.speaker === 'you' ? t('scene_you') : member?.name ?? null;
  return (
    <>
      {label ? (
        <p class={styles.speakerLabel}>
          <strong>{label}</strong>
          {withRole && member ? <span class={styles.role}> · {member.role}</span> : null}
        </p>
      ) : null}
      {p.video ? <p class={styles.muted}>{t('scene_video')}</p> : null}
      {p.line || p.local ? (
        <p class={styles.line}>
          {p.line ? fill(p.line) : null}
          {p.local ? (
            <>
              {' '}
              <span lang={p.local.lang}>{p.local.text}</span> <span class={styles.translation}>({p.local.translation})</span>
            </>
          ) : null}
        </p>
      ) : null}
      {p.caption ? <p class={styles.narrationText}>{fill(p.caption)}</p> : null}
      {p.if_then ? (
        <>
          <p class={styles.narrationText}>{t('scene_postcard_caption')}</p>
          <Postcard ifThen={p.if_then} city={member?.name ?? ''} />
        </>
      ) : null}
      {p.flip_postcard && flip ? (
        <>
          <p class={styles.narrationText}>{t('scene_flip_caption')}</p>
          <FlipCard ifThen={flip.ifThen} cityName={flip.cityName} onFlip={() => onFlip?.(flip.city)} />
        </>
      ) : null}
      {p.choice ? (
        <div class={styles.choice}>
          <p class={styles.line}>{fill(p.choice.prompt)}</p>
          {picked === undefined ? (
            <ul class={styles.options}>
              {p.choice.options.map((o, k) => (
                <li key={k}>
                  <button type="button" class={styles.option} onClick={() => onPick(k)}>
                    {o}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p class={styles.youSaid}>{t('scene_choice_you', { option: p.choice.options[picked] ?? '' })}</p>
              <p class={styles.line} tabIndex={-1} ref={replyRef} data-reply="">
                {label ? <strong>{label}: </strong> : null}
                {fill(p.choice.reply)}
              </p>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
