/** Fixtures for the Amsterdam / Paris engine change requests (CR-17 … CR-26). */
import { rawFraud, rawGenuine } from '../../content/fixtures.ts';
import type { Raw } from './helpers.ts';

export const beatOf = (raw: Raw, id: string): Raw => (raw.beats as Raw[]).find((b) => b.id === id) as Raw;

export const PAYEE = { name: 'R. ••••', iban: 'NL00 TEST 0000 0000 00', name_check: 'mismatch', amount: '€84.00' };

/** A standard scenario: a chat asks for money, start_transfer opens the bank app (Amsterdam 2-3 shape). */
export function rawTransfer(id = 't1', isFraud = true, over: Raw = {}): Raw {
  const base = isFraud ? rawFraud(id) : rawGenuine(id, { stakes: 'high' });
  return {
    ...base,
    device: 'messenger',
    brands: [],
    message: {
      sender: { display: 'Noor', detail: '+31 6 •• •• •• 17', new_contact: true },
      body: 'Phone fell in the canal! Pay €84 into my new account today please. I will pay you back tomorrow.',
      request: 'pay',
      references: ['Rent share'],
      ask: { text: 'Pay €84 into my new account today please.' },
      claims: [{ text: 'I will pay you back tomorrow.' }],
    },
    inspectables: [
      { target: 'sender.detail', reveal: 'Not in your contacts: a new number.', red_flag: isFraud },
      { target: 'request', reveal: 'Money to an account that is not hers.', red_flag: isFraud, type: 'request' },
      { target: 'reference', reveal: 'A note.', red_flag: false },
    ],
    actions: [
      { id: 'start_transfer', label: 'Pay it in the Larchwick app', kind: 'start_transfer', next_beat: 'bank', pressure_target: true },
      { id: 'call_noor', label: 'Call Noor on her saved number', kind: 'call_back_known', outcome: 'fine' },
      { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
      { id: 'ignore_it', label: 'Ignore it', kind: 'ignore', outcome: 'left' },
    ],
    beats: [
      {
        id: 'bank',
        device: 'banking',
        message: { payee: { ...PAYEE }, request: 'pay' },
        inspectables: [
          { target: 'payee.name_check', reveal: 'The bank says the name does not match.', red_flag: isFraud },
          { target: 'payee.iban', reveal: 'An account number.', red_flag: false },
        ],
        actions: [
          { id: 'pay_anyway', label: 'Pay anyway', kind: 'pay', outcome: isFraud ? 'stolen' : 'fine', pressure_target: true },
          { id: 'cancel_call', label: 'Cancel and call Noor', kind: 'call_back_known', outcome: 'fine' },
          { id: 'cancel_report', label: 'Cancel and report it', kind: 'report', outcome: 'reported' },
          { id: 'cancel', label: 'Cancel', kind: 'ignore', outcome: 'left' },
        ],
      },
    ],
    outcomes: isFraud
      ? (base.outcomes as Raw)
      : { fine: { narrative: 'Paid.' }, reported: { narrative: 'Reported.' }, left: { narrative: 'Nothing happens.' } },
    debrief: { ...(base.debrief as Raw), already_clicked: { paid: 'Call your bank now.' } },
    ...over,
  };
}

/** A boss whose scheduled beat 1 chains to one banking sub-beat; beat 2 (a call) is covered by beat 1 (Paris 3-9 shape). */
export function rawBoss(over: Raw = {}): Raw {
  const f = rawFraud('pboss');
  return {
    ...f,
    role: 'boss',
    difficulty: 3,
    brands: [],
    pressure: { timer: true, levers: [] },
    device: 'email',
    message: {
      sender: { display: 'Solène Arbogast', detail: 'solene@trundle.example' },
      subject: 'Projet Lys',
      body: "The deposit must leave before 19:00. Send it yourself tonight, I can't approve from the plane.",
      request: 'pay',
      references: ['Projet Lys'],
      ask: { text: "Send it yourself tonight, I can't approve from the plane." },
      payee: { name: 'Morvenac SAS', iban: 'FR00 TEST 0000 0000 0000 000' },
    },
    inspectables: [
      { target: 'sender.detail', reveal: 'Her real address.', red_flag: false },
      { target: 'request', reveal: 'Skips the sign-off.', red_flag: true, type: 'request' },
      { target: 'reference', reveal: 'A project name.', red_flag: false },
    ],
    actions: [
      { id: 'set_up', label: 'Set up the transfer in Larchwick Pro', kind: 'start_transfer', next_beat: 'boss_transfer', pressure_target: true },
      { id: 'call_solene', label: 'Call Solène on the directory number', kind: 'call_back_known', outcome: 'fine' },
      { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
      { id: 'leave_it', label: 'Leave it for now', kind: 'ignore', outcome: 'left' },
    ],
    beats: [
      {
        id: 'boss_transfer',
        device: 'banking',
        message: { payee: { name: 'Morvenac SAS', iban: 'FR00 TEST 0000 0000 0000 000', name_check: 'match', amount: '€38,500.00' }, account: { nickname: 'Ruchelune · current account' }, request: 'pay' },
        inspectables: [{ target: 'payee.name_check', reveal: 'The name matches the account. That only shows whose account it is.', red_flag: false }],
        actions: [
          { id: 'send_alone', label: 'Send it now, signing off alone', kind: 'pay', outcome: 'stolen', pressure_target: true },
          { id: 'sign_off', label: 'Send it to Solène for her sign-off', kind: 'ask_someone', outcome: 'fine' },
          { id: 'cancel_report', label: 'Cancel and report it', kind: 'report', outcome: 'reported' },
          { id: 'cancel', label: 'Cancel', kind: 'ignore', outcome: 'left' },
        ],
      },
      {
        id: 'lawyer_call',
        arrives_after: 45,
        covered_by: ['start'],
        device: 'call',
        message: {
          sender: { display: '+33 1 •• •• •• 07', detail: '+33 1 •• •• •• 07' },
          transcript: [{ speaker: 'caller', text: 'I confirm everything. Please send it now and keep it confidential.' }],
          request: 'none',
          references: ['Cabinet Ostrelle'],
          phone_numbers: ['01 •• •• •• 07'],
        },
        inspectables: [{ target: 'caller_id', reveal: 'A number on screen proves nothing.', red_flag: false }],
        actions: [
          { id: 'report_call', label: 'Report the call', kind: 'report', outcome: 'reported' },
          { id: 'ignore_call', label: 'Ignore it', kind: 'ignore', outcome: 'left' },
        ],
      },
    ],
    ...over,
  };
}

