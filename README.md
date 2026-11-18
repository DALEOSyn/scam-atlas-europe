# Scam Atlas: Europe — agent kit

Starter kit for building an interactive, entertaining game that teaches people to recognise social engineering and cyber fraud across Europe, built by a team of reusable Claude Code agents.

## What's in here
| Path | What it is |
|---|---|
| `CLAUDE.md` | Project rules every agent follows, including the safety **Red Lines** and the proposed tech stack |
| `.claude/agents/*.md` | 9 reusable agent definitions (producer, game-designer, fraud-researcher, scenario-writer, ux-artist, frontend-engineer, qa-playtester, sceptic-reviewer, localizer) |
| `docs/TEAM.md` | Roles, hand-off chains, review rules, briefing template |
| `docs/PLAN.md` | Game concept, chapter map, phases with exit criteria, how to run it autonomously, risks |
| `docs/DECISIONS.md` | Gates G0–G5 where Roman decides; G0 questions are ready now |
| `docs/STATUS.md` | Live tracker the producer updates every session |
| `docs/PERSONAS.md` | Playtest personas |
| `templates/scenario.template.yaml` | Worked example of the scenario data format |

## How to start
1. Answer the G0 questions in `docs/DECISIONS.md`.
2. Create the GitHub repo and copy this folder in (the agents are reusable: `.claude/agents/` works in any repo).
3. In that repo run `claude --agent producer` and say *"Run one work session."* (The producer must be the main session, since subagents can't spawn subagents.)
