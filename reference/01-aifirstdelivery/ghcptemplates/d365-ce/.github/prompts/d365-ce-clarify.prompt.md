---
mode: agent
description: "Review a D365 CE technical plan and assess readiness for task generation. Use when the user wants to check if a plan is ready before generating task cards. Triggers on: 'clarify plan', 'plan ready', 'check plan', 'task ready'."
---

Review a technical plan and assess its readiness for task generation.

## Steps

1. Read all files in `constitution/`.
2. Identify the feature. If not specified, ask.
3. Read `plans/{feature-name}/plan.md`.
4. Evaluate each high-level task against the readiness rubric at `Prompts/clarify/readiness-rubric.md`.
5. Generate the clarify report using `plans/_clarify-template.md`.
6. Write the output to `plans/{feature-name}/clarify.md`.
7. Print a one-line verdict: `TASK-READY`, `PARTIALLY READY`, or `NOT READY`.

## What to Evaluate

For each high-level task, check:
- Is the component type clear? (Plugin / PCF / Flow / Schema / Config)
- Are the exact D365 CE artefacts identified? (entity name, message, form name, etc.)
- Are task dependencies explicitly stated?
- Is there any ambiguity that would cause a developer to make an assumption?
- Does the task reference a specific functional requirement?
- Are there any tasks that should be split (XL complexity)?

## Status Rules

- `TASK-READY` — every task passes all rubric checks.
- `PARTIALLY READY` — some tasks have QUESTION-level gaps; can proceed with those tasks flagged.
- `NOT READY` — one or more tasks have BLOCKER-level ambiguity; must be resolved first.

The `/d365-ce-task` command will skip tasks flagged as NOT READY and warn the user.

## Rules

- **AI Notes:** In the generated clarify report, at the end of each BLOCKER and QUESTION finding entry, append `> **AI Notes** — {1–2 sentences: key ambiguity identified, the assumption a developer would make if unresolved, or rationale for the readiness verdict on this task}`. Write only what is non-obvious.