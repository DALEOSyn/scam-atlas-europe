import type { Device, Message, Scenario } from '../../content/schema.ts';
import type { ActionView, PusherMessageView } from '../../engine/runner.ts';

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
  /** A coach mark opened or closed: the timer is frozen while it is open (freeze reason coach_mark). */
  onCoachMark: (id: string, open: boolean) => void;
  /** Heading text and ref (focus target on arrival). */
  heading: string;
  headingRef: { current: HTMLHeadingElement | null };
}
