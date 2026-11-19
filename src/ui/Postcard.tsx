/**
 * Postcards to Teo (STORY §1.3, §3.12, §4.4; ART_DIRECTION §7.5). A CSS card, so its text can grow:
 * the back carries "Postcard to Teo:" and the If-then line word for word, with any extra line under it;
 * the front is a crop of the city backdrop. "Turn over" swaps faces: a flat 2D squash in full motion,
 * an instant swap with reduced motion (the duration token is 0 there). Score-neutral: no tier, seal or count.
 *
 * FlipCard is "flip the postcard" (STORY §3.12): the cue on one side, the then-half on the other. "Flip",
 * no right or wrong; the flip is recorded when the card is shown, the tap is optional [P]. The face sits in
 * a live region that stays mounted, so the new side is announced; only the inner face is re-keyed.
 */
import { useState } from 'preact/hooks';
import type { IfThen } from '../engine/story.ts';
import { t } from '../i18n/index.ts';
import styles from './Scene.module.css';

export function artUrl(path: string): string {
  return `${import.meta.env.BASE_URL}art/${path}`;
}

/** The back of a postcard: heading, the If-then line word for word, the extra line under it. */
function Back({ ifThen }: { ifThen: IfThen }) {
  return (
    <>
      <span class={styles.stamp} aria-hidden="true" />
      <p class={styles.postcardHeading}>{t('postcard_back_heading')}</p>
      <p class={styles.postcardLine} data-if-then="">
        {ifThen.cue} {ifThen.action}
      </p>
      {ifThen.extra ? <p class={styles.postcardExtra}>{ifThen.extra}</p> : null}
    </>
  );
}

/**
 * The place on a postcard front, from the backdrop id (ART_DIRECTION §9.9 "Postcard front: the Berlin
 * courtyard."): `berlin-courtyard` in Berlin → "the Berlin courtyard"; `home-kitchen` → "the home kitchen".
 */
export function backdropPlace(backdrop: string, cityName: string): string {
  const [head = '', ...rest] = backdrop.split('-');
  const place = rest.join(' ');
  if (!place) return `the ${cityName || head}`;
  const city = cityName && head.toLowerCase() === cityName.toLowerCase().replace(/\s+/g, '') ? cityName : head;
  return `the ${city} ${place}`;
}

/** `city`: the chapter's name ("Berlin"), never a speaker. */
export function Postcard({ ifThen, city, backdrop, start = 'back' }: { ifThen: IfThen; city: string; backdrop?: string | undefined; start?: 'front' | 'back' }) {
  const [side, setSide] = useState<'front' | 'back'>(backdrop ? start : 'back');
  const [turns, setTurns] = useState(0);
  return (
    <div class={styles.postcard} data-postcard={city} data-side={side}>
      <div aria-live="polite">
        <div class={styles.postcardFace} key={turns} data-turned={turns > 0 ? '' : undefined}>
          {side === 'front' && backdrop ? <img class={styles.postcardFront} src={artUrl(`backdrops/${backdrop}.svg`)} alt={t('postcard_front_alt', { place: backdropPlace(backdrop, city) })} /> : <Back ifThen={ifThen} />}
        </div>
      </div>
      {backdrop ? (
        <button
          type="button"
          class={styles.small}
          onClick={() => {
            setSide((s) => (s === 'front' ? 'back' : 'front'));
            setTurns((n) => n + 1);
          }}
        >
          {t('postcard_turn_over')}
        </button>
      ) : null}
    </div>
  );
}

/** The flip is recorded by the scene player when this card is shown [P]; the tap only turns it. */
export function FlipCard({ ifThen, cityName }: { ifThen: IfThen; cityName: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div class={styles.postcard} data-flip-card="" data-side={flipped ? 'back' : 'front'}>
      <div aria-live="polite">
        <div class={styles.postcardFace} key={flipped ? 'b' : 'f'} data-turned={flipped ? '' : undefined}>
          <span class={styles.stamp} aria-hidden="true" />
          <p class={styles.postcardHeading}>{t('scene_flip_from', { city: cityName })}</p>
          <p class={styles.postcardLine}>{flipped ? `${ifThen.cue} ${ifThen.action}` : `${ifThen.cue.replace(/,\s*$/, '')}…`}</p>
        </div>
      </div>
      <button
        type="button"
        class={styles.small}
        data-flip=""
        aria-pressed={flipped}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* CR-28 (T-S4b QA S6): the button carries its state, pressed and "Flip back" once turned. */}
        {t(flipped ? 'scene_flip_back' : 'scene_flip_button')}
      </button>
    </div>
  );
}
