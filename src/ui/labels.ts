/** Labels for checkable elements ("what it is", UI_SPEC §4.6) and the What-now built-ins. */
import type { WhatNowBuiltin } from '../engine/runner.ts';
import { t, type MessageKey } from '../i18n/index.ts';

const ELEMENT_KEYS: Record<string, MessageKey> = {
  'sender.detail': 'element_sender',
  caller_id: 'element_caller_id',
  link: 'element_link',
  attachment: 'element_attachment',
  reference: 'element_reference',
  phone_number: 'element_phone_number',
  'qr.destination': 'element_qr',
  'qr.mount': 'element_qr_mount',
  'page.address': 'element_page_address',
  'page.info': 'element_page_info',
  'payee.name_check': 'element_name_check',
  'payee.name': 'element_payee_name_plain',
  'payee.iban': 'element_payee_iban',
  'prompt.service': 'element_prompt_service',
  'prompt.where': 'element_prompt_where',
  'prompt.device': 'element_prompt_device',
  'prompt.when': 'element_prompt_when',
  'prompt.number': 'element_prompt_number',
  letterhead: 'element_letterhead',
  image: 'element_image',
  video: 'element_video',
  voice: 'element_voice',
  claim: 'element_claim',
  request: 'element_request',
};

export function elementLabel(target: string, device?: string): string {
  const base = target.replace(/#(\d)$/, '');
  const n = /#(\d)$/.exec(target)?.[1];
  // The ask (ruling QA L1): "What the caller asks" on a call, "What the message asks" elsewhere.
  const label = t(
    base === 'request' && device === 'call' ? 'element_request_call' : base === 'claim' && device === 'call' ? 'element_claim_call' : (ELEMENT_KEYS[base] ?? 'element_other'),
  );
  return n ? `${label} ${n}` : label;
}

/** Identifiers are shown in the monospace face in Check cards (UI_SPEC §1.5). */
export function isIdentifier(target: string): boolean {
  return /^(?:sender\.detail|caller_id|link|reference|phone_number|qr\.destination|page\.address|payee\.iban|prompt\.number)(?:#\d)?$/.test(target);
}

/** Targets whose "It really goes to" row shows the host anatomy with the owner part boxed. */
export function isAddress(target: string): boolean {
  return /^(?:link(?:#\d)?|page\.address|qr\.destination)$/.test(target);
}

export const WHAT_NOW_KEYS: Record<WhatNowBuiltin, MessageKey> = {
  call_back_known: 'what_now_call_back_known',
  report: 'what_now_report',
  done: 'what_now_done',
};

/** The timer-expiry line (consequence caption and layer 2 "What happened"); genuine: with the message's own deadline. */
export function deadlineText(line: 'fake' | 'fake_fell' | 'genuine', honestDeadline?: string | null): string {
  if (line === 'genuine') return honestDeadline ? t('deadline_genuine', { deadline: honestDeadline }) : t('deadline_genuine_plain');
  return t(line === 'fake' ? 'deadline_fake' : 'deadline_fake_fell');
}
