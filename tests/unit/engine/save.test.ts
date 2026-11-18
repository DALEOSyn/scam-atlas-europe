import { describe, expect, it } from 'vitest';
import { calmPreset, createStore, freshSave, isCalm, parseSave, SAVE_KEY, SAVE_VERSION, type StorageLike } from '../../../src/engine/save.ts';

function memory(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? (data[k] ?? null) : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      Reflect.deleteProperty(data, k);
    },
  };
}

const throwing: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

describe('save format (Red Line 7: localStorage only, versioned)', () => {
  it('round-trips through storage', () => {
    const store = createStore(memory());
    const s = freshSave();
    s.flags = ['kettle_hacked'];
    s.chapters.home = { finished: true, bestStamp: 'silver', bestRating: 81, position: 0, run: null };
    expect(store.save(s)).toBe(true);
    expect(store.load()).toEqual(s);
  });

  it('missing, corrupt or non-object data gives a fresh save', () => {
    expect(parseSave(null).status).toBe('fresh');
    expect(parseSave('{not json').save).toEqual(freshSave());
    expect(parseSave('[1,2]').status).toBe('fresh');
    expect(parseSave('"x"').status).toBe('fresh');
  });

  it('migrates an unversioned (v0) save and keeps its valid fields', () => {
    const r = parseSave(JSON.stringify({ flags: ['alex_met', 'Bad.Flag'], settings: { timerMode: 'extended' } }));
    expect(r.status).toBe('migrated');
    expect(r.save.version).toBe(SAVE_VERSION);
    expect(r.save.flags).toEqual(['alex_met']);
    expect(r.save.settings.timerMode).toBe('extended');
  });

  it('sanitises each field on its own: one bad field never loses the rest', () => {
    const raw = {
      version: 1,
      settings: { timerMode: 'turbo', pushers: 'yes', nickname: '  ' + 'x'.repeat(40) },
      chapters: {
        home: { finished: true, bestStamp: 'platinum', bestRating: 140, run: { index: -3, records: [{ id: 'home-01', points: 15, maxPoints: 15, scored: true }, { id: 'Bad Id' }] } },
        'Not A Slug': { finished: true },
      },
      arc: { vars: { alex_invested: 50, 'alex.bad': 1, flag: 'str' }, closes: 1, reportedAtSlot: 42 },
      habits: { 'LO-03': { scenarios: ['home-01', 'home-01'], hard: true }, nope: {} },
      callouts: { pressureAny: true },
    };
    const { save, status } = parseSave(JSON.stringify(raw));
    expect(status).toBe('ok');
    expect(save.settings).toMatchObject({ timerMode: 'standard', pushers: true, nickname: 'x'.repeat(24) });
    expect(Object.keys(save.chapters)).toEqual(['home']);
    expect(save.chapters.home).toMatchObject({ finished: true, bestStamp: null, bestRating: 100, run: { index: 0 } });
    expect(save.chapters.home?.run?.records.map((r) => r.id)).toEqual(['home-01']);
    expect(save.arc).toMatchObject({ vars: { alex_invested: 50 }, closes: 1, reportedAtSlot: null });
    expect(save.habits).toEqual({ 'LO-03': { scenarios: ['home-01'], hard: true } });
    expect(save.callouts).toEqual({ pressureAny: true, pressureGenuine: false });
  });

  it('a newer save is left untouched: the store goes read-only', () => {
    const newer = JSON.stringify({ version: SAVE_VERSION + 1, future: true });
    const mem = memory({ [SAVE_KEY]: newer });
    const store = createStore(mem);
    expect(store.load()).toEqual(freshSave());
    expect(store.readOnly).toBe(true);
    expect(store.save(freshSave())).toBe(false);
    expect(mem.data[SAVE_KEY]).toBe(newer);
  });

  it('works with no storage or storage that throws (private mode, quota)', () => {
    for (const store of [createStore(null), createStore(throwing)]) {
      expect(store.load()).toEqual(freshSave());
      expect(store.save(freshSave())).toBe(false);
      expect(store.reset()).toBe(false);
    }
  });

  it('Calm preset = timers off + pushy follow-ups off + call lines step through', () => {
    const calm = calmPreset(freshSave().settings);
    expect(calm).toMatchObject({ timerMode: 'off', pushers: false, callLines: 'step' });
    expect(isCalm(calm)).toBe(true);
    expect(isCalm(freshSave().settings)).toBe(false);
  });
});
