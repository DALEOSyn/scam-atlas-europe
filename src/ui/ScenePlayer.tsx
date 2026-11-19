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
 * - Nothing here scores or sets a flag. A choice shows the one shared reply; a flip is reported to the
 *   parent (onFlip) as soon as its panel is shown, whether or not the player taps "Flip" [P].
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { castMember } from '../content/cast.ts';
import type { Chapter, Scene, ScenePanel } from '../content/schema.ts';
import { fillStory, scenesAfter, visiblePanels, type IfThen, type StoryVars } from '../engine/story.ts';
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
  /** The heading ("Berlin · Arrival", "Between cities"): see sceneHeading(). */
  heading: string;
  /** The chapter's name ("Berlin") for postcards; empty for interludes. */
  chapterName?: string;
  /** The chapter run's flags (story-only variant flags pick panels). */
  flags?: ReadonlySet<string>;
  vars?: StoryVars;
  /** The postcard Teo reads on a flip_postcard panel; null hides that panel. */
  flip?: FlipPick | null;
  onFlip?: (city: string) => void;
  /**
   * Text of the content note to show before this sensitive scene (null: none). The app passes it for the
   * first sensitive scene of a chapter run and of every replay session (CR-28); the Help label changes on every sensitive scene.
   */
  contentNote?: string | null;
  onDone: (how: 'finished' | 'skipped') => void;
}

const SLOT_KEY: Record<Exclude<Scene['slot'], 'interlude' | 'beat'>, MessageKey> = {
  arrival: 'scene_slot_arrival',
  turn: 'scene_slot_turn',
  resolution: 'scene_slot_resolution',
};

type TitleChapter = Pick<Chapter, 'name' | 'scenes' | 'scenario_order'>;

/**
 * The part of a scene's title [P]: the scene's own `title`, else Arrival / Later / Before you go, and
 * "Story" for spec-placed beats ("Story 1", "Story 2" when a chapter has several). Null for interludes.
 */
export function scenePart(scene: Pick<Scene, 'id' | 'slot' | 'title'>, chapter: TitleChapter | null): string | null {
  if (scene.title) return scene.title;
  if (scene.slot === 'interlude') return null;
  if (scene.slot !== 'beat') return t(SLOT_KEY[scene.slot]);
  const placed = chapter ? [...chapter.scenario_order.am, ...chapter.scenario_order.pm].flatMap((id) => scenesAfter(chapter, id)) : [];
  const n = placed.indexOf(scene.id);
  return placed.length > 1 && n >= 0 ? t('scene_slot_beat_n', { n: n + 1 }) : t('scene_slot_beat');
}

/** "Berlin · Arrival"; interludes: their title or "Between cities". */
export function sceneHeading(scene: Pick<Scene, 'id' | 'slot' | 'title'>, chapter: TitleChapter | null): string {
  if (scene.slot === 'interlude') return scene.title ?? t('scene_interlude_place');
  return t('scene_title', { place: chapter?.name ?? '', part: scenePart(scene, chapter) ?? '' });
}

function prefersReducedMotion(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced') return true;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Generic help list (placeholder until the verified per-country list). Sensitive scenes put "talk to someone" first [P]. */
export function HelpList({ sensitive = false }: { sensitive?: boolean }) {
  const talk = <li key="talk">{t('help_talk')}</li>;
  return (
    <ul class={styles.helpList}>
      {sensitive ? talk : null}
      <li key="bank">{t('help_bank')}</li>
      <li key="police">{t('help_police')}</li>
      <li key="consumer">{t('help_consumer')}</li>
      <li key="platform">{t('help_platform')}</li>
      {sensitive ? null : talk}
    </ul>
  );
}

export function ScenePlayer({ scene, heading: title, chapterName = '', flags = new Set(), vars = { count: 0, lastCity: '' }, flip = null, onFlip, contentNote = null, onDone }: ScenePlayerProps) {
  const panels = visiblePanels(scene, flags).filter((p) => !p.flip_postcard || flip);
  const [view, setView] = useState<'note' | 'panels' | 'help'>(scene.sensitive && contentNote ? 'note' : 'panels');
  const [shown, setShown] = useState(1);
  const [helpFrom, setHelpFrom] = useState<'note' | 'panels'>('panels');
  const [picked, setPicked] = useState<Record<number, number>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const flipRecorded = useRef(false);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const replies = useRef<(HTMLParagraphElement | null)[]>([]);
  /** What gets focus after the next render: the heading, a panel, or a choice reply. */
  const focusNext = useRef<{ kind: 'heading' } | { kind: 'panel'; i: number } | { kind: 'reply'; i: number }>({ kind: 'heading' });

  const fill = (text: string) => fillStory(text, vars);
  const sensitive = scene.sensitive;

  // [P] A flip counts as soon as its panel is shown (the tap stays optional), so the rotation also works
  // for players who never tap.
  useEffect(() => {
    if (view !== 'panels' || flipRecorded.current || !flip) return;
    if (panels.slice(0, shown).some((p) => p.flip_postcard)) {
      flipRecorded.current = true;
      onFlip?.(flip.city);
    }
  }, [view, shown]);

  useLayoutEffect(() => {
    const f = focusNext.current;
    focusNext.current = { kind: 'heading' };
    if (f.kind === 'panel') {
      const el = items.current[f.i];
      if (!el) return;
      el.focus({ preventScroll: true });
      revealPanel(el, footerRef.current, prefersReducedMotion() ? 'auto' : 'smooth');
    } else if (f.kind === 'reply') replies.current[f.i]?.focus();
    else {
      heading.current?.focus();
      // CR-27 / CR-28 (T-S4b QA M1): on open the sticky footer must not cover the first panel's text.
      const first = items.current[0];
      if (view === 'panels' && shown === 1 && first) revealPanel(first, footerRef.current, 'auto');
    }
  }, [view, shown, picked]);

  // CR-27: bottom room = the footer's measured height (scroll padding and the panel list), so a scrolled-to
  // or focused panel is never under the sticky footer.
  const footerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = footerRef.current;
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    if (!el || !root) return undefined;
    const apply = () => {
      const fh = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty('--scene-footer-h', `${fh}px`);
      root.style.scrollPaddingBottom = `${fh}px`;
    };
    apply();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(apply) : null;
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      root.style.removeProperty('--scene-footer-h');
      root.style.scrollPaddingBottom = '';
    };
  }, [view]);

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
          <HelpList sensitive={sensitive} />
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
          <div>
            <p class={styles.kicker} aria-hidden="true">
              {t('scene_story_label')}
            </p>
            <h1 id="scene-h" ref={heading} tabIndex={-1} class={styles.title}>
              {/* Screen-reader parity with the visible kicker: "Story scene: Berlin · Arrival". */}
              <span class={styles.vh}>{t('scene_story_label')}: </span>
              {title}
            </h1>
          </div>
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
                      chapterName={chapterName}
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
        <div class={styles.footer} ref={footerRef}>
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

/** Room (px) kept between a revealed panel and the viewport top or the footer's top edge. */
const REVEAL_MARGIN = 8;

/**
 * CR-28 (T-S4b QA M1): scroll so the panel's figcaption (its text, postcard or flip card) ends above the
 * sticky footer's top edge. When the whole panel fits between the viewport top and the footer, it is shown
 * whole; when it is taller than that room, the caption end wins over the top of the art. Before this,
 * `scrollIntoView({ block: 'nearest' })` showed the art and left the caption under the footer.
 */
export function revealPanel(li: HTMLElement, footer: HTMLElement | null, behavior: ScrollBehavior): void {
  if (typeof window === 'undefined' || typeof window.scrollBy !== 'function') return;
  const cap = li.querySelector('figcaption') ?? li;
  const bottomEdge = (footer ? footer.getBoundingClientRect().top : window.innerHeight) - REVEAL_MARGIN;
  const top = li.getBoundingClientRect().top;
  const capEnd = cap.getBoundingClientRect().bottom;
  // Down by what the caption runs under the footer; else up to show the panel's top, as long as the
  // caption end still clears the footer.
  let dy = capEnd > bottomEdge ? capEnd - bottomEdge : 0;
  if (dy === 0 && top < REVEAL_MARGIN) dy = Math.max(top - REVEAL_MARGIN, capEnd - bottomEdge);
  if (Math.abs(dy) >= 1) window.scrollBy({ top: dy, behavior });
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
      {/* The listener stands on the other side from the speaker (ART_DIRECTION §7.1). */}
      {listenerSrc ? <img key={listenerSrc} class={`${styles.listener} ${p.flip ? styles.onLeft : ''}`} src={listenerSrc} alt="" data-art="listener" /> : null}
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
  chapterName,
  picked,
  onPick,
  replyRef,
}: {
  p: ScenePanel;
  fill: (s: string) => string;
  withRole: boolean;
  flip: FlipPick | null;
  chapterName: string;
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
      {/* The postcard's own heading reads "Postcard to Teo:"; no extra caption (review T-S3). */}
      {p.if_then ? <Postcard ifThen={p.if_then} city={chapterName} /> : null}
      {p.flip_postcard && flip ? (
        <>
          <p class={styles.narrationText}>{t('scene_flip_caption')}</p>
          <FlipCard ifThen={flip.ifThen} cityName={flip.cityName} />
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
