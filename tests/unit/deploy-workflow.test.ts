import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { ROOT } from './helpers.ts';

interface Step { uses?: string; run?: string; env?: Record<string, string> }
interface Job { needs?: string | string[]; permissions?: Record<string, string>; concurrency?: unknown; environment?: { name: string }; steps: Step[] }
interface Workflow { on: Record<string, unknown>; permissions?: Record<string, string>; jobs: Record<string, Job> }

const load = (f: string) => {
  const text = readFileSync(resolve(ROOT, '.github/workflows', f), 'utf8');
  return { text, wf: parse(text) as Workflow };
};
const needs = (j: Job) => (Array.isArray(j.needs) ? j.needs : j.needs ? [j.needs] : []);

/** T-4.9: guard rails for the Pages deploy, so a later edit cannot quietly drop the gate or the pins. */
describe('.github/workflows/deploy.yml', () => {
  const { wf } = load('deploy.yml');

  it('runs only by hand (workflow_dispatch; no push, schedule or other trigger)', () => {
    expect(Object.keys(wf.on)).toEqual(['workflow_dispatch']);
  });

  it('every job except the gate depends on it, directly or through another job', () => {
    const reaches = (name: string): boolean => name === 'gate' || needs(wf.jobs[name] as Job).some(reaches);
    for (const name of Object.keys(wf.jobs)) if (name !== 'gate') expect(needs(wf.jobs[name] as Job).some(reaches), name).toBe(true);
    expect(wf.jobs['gate']?.steps.some((s) => s.run === 'node scripts/g4-gate.ts docs/DECISIONS.md')).toBe(true);
  });

  it('only the deploy job gets pages and id-token write; it uses the github-pages environment and a concurrency group', () => {
    expect(wf.permissions).toEqual({ contents: 'read' });
    for (const [name, job] of Object.entries(wf.jobs)) if (name !== 'deploy') expect(job.permissions, name).toBeUndefined();
    const deploy = wf.jobs['deploy'] as Job;
    expect(deploy.permissions).toEqual({ pages: 'write', 'id-token': 'write' });
    expect(deploy.environment?.name).toBe('github-pages');
    expect(deploy.concurrency).toBeTruthy();
    expect(needs(deploy).sort()).toEqual(['build', 'e2e']);
  });

  it('builds for the Pages subpath and uploads the tested build', () => {
    const steps = (wf.jobs['build'] as Job).steps;
    const build = steps.findIndex((s) => s.run === 'npm run build');
    expect(steps[build]?.env?.['VITE_BASE']).toBe('/scam-atlas-europe/');
    const bundle = steps.findIndex((s) => s.run === 'npm run test:bundle');
    const upload = steps.findIndex((s) => s.uses?.startsWith('actions/upload-pages-artifact@'));
    expect(build).toBeGreaterThan(-1);
    expect(bundle).toBeGreaterThan(build);
    expect(upload).toBeGreaterThan(bundle);
  });
});

describe('workflows pin every action by full commit SHA with a version comment', () => {
  for (const f of ['ci.yml', 'deploy.yml']) {
    it(f, () => {
      const lines = load(f).text.split('\n').filter((l) => /^\s*(?:-\s+)?uses:/.test(l));
      expect(lines.length).toBeGreaterThan(0);
      for (const l of lines) expect(l, l).toMatch(/uses: [\w.-]+\/[\w.-]+@[0-9a-f]{40} # v\d+\.\d+\.\d+$/);
    });
  }
});
