import type { Device, Message, Scenario } from '../../content/schema.ts';
import type { ActionView, PusherMessageView, RunnerView } from '../../engine/runner.ts';

export interface CallStage {
  beatId: string;
  answered: boolean;
  /** Transcript lines shown so far. */
  shown: number;
  /** Call ended (hang-up, "What now?"). */
  ended: boolean;
  step: boolean;
}

export interface DeviceProps {
  beatId: string;
  device: Device;
  message: Message;
  banner: { device: Device; message: Message } | null;
  scenario: Pick<Scenario, 'brands' | 'role'>;
  /** Earlier beats of this beat group (thread history), oldest first. Not checkable. */
  thread: { id: string; device: Device; message: Message }[];
  /** Follow-ups from the sender (ordinary bubbles in chats, notifications elsewhere). */
  pushers: PusherMessageView[];
  actions: ActionView[];
  /** The tray is live (playing phase). */
  canAct: boolean;
  onAct: (actionId: string) => void;
  onTranslation: (open: boolean) => void;
  alwaysTranslate: boolean;
  call: CallStage | null;
  onAnswer: () => void;
  onDecline: (() => void) | null;
  onNextLine: () => void;
  /** Coach marks already shown in this game (save.coachMarks). */
  coachMarks: readonly string[];
  /**
   * A coach mark opened or closed: the timer is frozen while it is open (freeze reason coach_mark).
   * `gotIt` is true only when the player pressed "Got it": only then is the mark recorded as seen.
   */
  onCoachMark: (id: string, open: boolean, gotIt?: boolean) => void;
  /** CR-27: checkable targets of this beat whose inspectable has `context: quoted` (quote block in chats). */
  quoted?: readonly string[];
  /** The payee-check result is on screen (true) or still "Checking…" (false), per beat (CR-23). */
  onNameCheck?: (beatId: string, ready: boolean) => void;
  /** CR-31: the on-call bar over a banking beat reached by following a call into the bank app. */
  onCall?: RunnerView['onCall'] | undefined;
  /** Heading text and ref (focus target on arrival). */
  heading: string;
  headingRef: { current: HTMLHeadingElement | null };
}
