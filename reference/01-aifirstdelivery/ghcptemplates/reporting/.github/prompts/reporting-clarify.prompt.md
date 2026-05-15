---
mode: agent
description: "Review a Reporting plan for task readiness. Triggers on: 'clarify', 'plan review'."
---

Review a technical plan and assess its readiness for task generation.

## Usage

```
/reporting-clarify {feature-name}
```

## Steps

1. Read all files in `constitution/`.
2. Read `plans/{feature-name}/plan.md`.
3. Evaluate each task against the readiness rubric below.
4. Write the output to `plans/{feature-name}/clarify.md`.
5. Print a one-line verdict: `TASK-READY`, `PARTIALLY READY`, or `NOT READY`.

## What to Evaluate

For each Level-4 task in the plan, check:
- Is the component type clear? (Dataset / DataModel / Measure / RLS / Report-Interactive / Report-Paginated / Report-SSRS / Dataflow / Configuration / Deployment / Testing)
- Are the exact artefacts identified? (PBIX name, dataset name, measure name, RDL name, workspace)
- For **Measure** tasks: is the business definition, display format, and rounding rule clear enough to write DAX without guessing?
- For **RLS** tasks: is the filter logic clearly described, and is a named test user identified for each role?
- For **Report** tasks: is the page list, visual inventory, canvas size, and data source clearly specified?
- For **SSRS** tasks: is the stored procedure name and parameter set defined?
- For **Dataflow** tasks: is the source, transformation logic, and downstream dataset dependency stated?
- For **Configuration** tasks: is the configuration target explicit? (workspace setup / sensitivity label / gateway config / refresh schedule / deployment pipeline)
- Are task dependencies explicitly stated (specific task IDs, not vague references)?
- Is there any ambiguity that would cause a BI developer to make an assumption?
- Does the task reference a specific FR-NNN?
- Are there any tasks that should be split (XL complexity)?

**Brownfield-specific checks (when `brownfield.enabled: true`):**
- Is the `brownfield-action` (NEW / EXTEND / REPLACE / REFERENCED) clearly stated for each task?
- For EXTEND tasks: are REUSED fields and net-new fields explicitly distinguished?
- For REPLACE tasks: is the specific artefact being superseded named?
- For CONFLICT tasks: is the resolution approach stated (spec amendment / supervised migration / parallel implementation)?

**Mandatory paired test task checks:**
- For every **Measure** task: is a paired data-accuracy test task present in the plan?
- For every **RLS** task: is a paired RLS validation test task present (covering happy path, exclusion, and empty-state scenarios)?
- For every **Report-Interactive** or **Report-SSRS** task: is a paired visual/render test task present?
- If any mandatory paired test task is missing, raise as BLOCKER.

## Status Rules

- `TASK-READY` — every task passes all rubric checks.
- `PARTIALLY READY` — some tasks have QUESTION-level gaps; can proceed with those tasks flagged.
- `NOT READY` — one or more tasks have BLOCKER-level ambiguity; must be resolved first.

## Clarify Report (`plans/{feature-name}/clarify.md`)

```markdown
---
feature: {feature-name}
clarify-date: {YYYY-MM-DD}
status: TASK-READY | PARTIALLY READY | NOT READY
blockers: {N}
questions: {N}
---

# Clarify Report — {feature-name}

## Verdict: {TASK-READY | PARTIALLY READY | NOT READY}

## BLOCKERs ({N})
{Task ID} — {Description of blocking ambiguity}

## Questions ({N})
{Task ID} — {Question that can be deferred}

## Ready Tasks
{List of task IDs that are fully ready for /reporting-task generation}

## Next Step
{If TASK-READY: "Run /reporting-task {feature-name} to generate task cards"}
{If PARTIALLY READY: "Run /reporting-task {feature-name} — tasks with QUESTION flags will be included with warnings"}
{If NOT READY: "Resolve BLOCKERs in plan.md then re-run /reporting-clarify {feature-name}"}
```

## Rules

- **AI Notes:** In the generated clarify report, at the end of each BLOCKER and QUESTION finding entry, append `> **AI Notes** — {1–2 sentences: key ambiguity identified, the assumption a developer would make if unresolved, or rationale for the readiness verdict on this task}`. Write only what is non-obvious.