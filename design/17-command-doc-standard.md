---
title: Command Documentation Standard
status: live
adr-refs: []
last-reviewed: 2026-05-15
owner: design
---

# Command Documentation Standard

> Every agent command body (`agents/{agent}/.claude/commands/{cmd}.md`) MUST conform to the structure defined here. The standard exists in response to DEFECT-002 (2026-05-15): the user couldn't discover the `--export` flag on `/estimate` even though it was technically documented — proving that "the option is documented somewhere in the body" is not sufficient; **discoverability** is the requirement.

## Why a standard

A user opening a command file for the first time should be able to:

1. **Within 5 seconds**, see EVERY flag the command accepts (no scrolling, no parsing prose).
2. **Within 10 seconds**, see a copy-paste-ready example for the most common scenario.
3. **Within 30 seconds**, navigate to the workflow they want to execute.
4. **Without leaving the file**, see every dependency (inputs, outputs, schemas, related commands).

A command body that fails any of these tests is broken regardless of how technically accurate its prose is.

## Required structure (in order)

Every command body MUST have these sections in this order:

```
---
description: <one-line; appears in chatmode / picker lists>
agent: <agent-slug>
phase: <DEFINE | DESIGN | BUILD | ALM | SCAN | etc.>
gates: [...]  # gates this command flips (empty array if none)
---

# /{command-name}

> <one-paragraph what-it-does. Cite the governing ADR if any.>

## Quick reference

| Flag | Required? | Default | Purpose |
|---|---|---|---|
| `--flag-1` | yes/no | <default> | <one-line> |
| ... | ... | ... | ... |

## Usage

```
/{command} [--flag-1 <value>] [--flag-2] [--flag-3 a|b|c]
```

<one-paragraph plain-English summary of usage>

## Examples

### Most common scenario

```
/{command}
```

<one-line what-this-does>

### Scenario 2 — <descriptive name>

```
/{command} --flag-1 value
```

<one-line what-this-does>

### Scenario 3 — <descriptive name>

```
/{command} --flag-1 value --flag-2 --flag-3 a
```

<one-line what-this-does>

## Common workflows

### Workflow A — <name>

1. Step 1 (which command + key flag)
2. Step 2 (...)
3. Step 3 (...)

### Workflow B — <name>

(...)

## Inputs

- ...

## Execution flow

1. ...

## Outputs

- ...

## Hard rules / validation

- ...

## See also

- Constitution: [...]
- Related commands: [...]
- Schemas: [...]
- Design: [...]
- ADRs: [...]
```

## Rules

### R1 — Flag quick-reference table is mandatory and above-the-fold

A `## Quick reference` section MUST appear immediately after the opening blockquote (the file's `> one-paragraph what-it-does`). It MUST be a table with one row per flag, columns: `Flag | Required? | Default | Purpose`. NO flag may be documented only in prose below this section without also appearing in the table.

**Rationale (per DEFECT-002):** the user's report was specifically that they couldn't find a flag that existed deep in the file. The quick-reference table is the visual primitive that prevents this.

### R2 — At least 3 examples; the first is always bare invocation (or the simplest)

A `## Examples` section MUST contain at least 3 sub-sections, each labelled with a scenario name. Each example MUST be a copy-paste-ready code block of the actual invocation. The FIRST example is the most common scenario.

**Rationale:** users learn commands by pattern-matching against examples, not by parsing flag grammar. Three examples is the empirical floor — one is not enough, two is too few to cover the variation space.

### R3 — Common workflows section narrates end-to-end sequences

A `## Common workflows` section MUST describe at least 2 workflows. Each workflow is a numbered sequence of steps where each step names a command + key flag. Workflows are the customer-facing user journeys (e.g., "First estimate from RFP", "Refresh after domain agents run", "Export for QA review").

**Rationale:** flags solve "how do I invoke this command?" Workflows solve "what's the right sequence of commands for my goal?" — a different question.

### R4 — Every flag in Usage section uses the literal syntax `--flag-name <value>`

The `## Usage` section's code block MUST list every flag using the literal CLI syntax. Optional flags wrapped in `[]`. Choice flags written as `--flag a|b|c`.

**Rationale:** the usage code block is the canonical reference. Discrepancies between Usage syntax and the Quick reference table are bugs.

### R5 — No flag may be introduced in the Execution flow without first appearing in Quick reference + Usage

If `/estimate --preserve-manual-overrides` appears anywhere in the body, it MUST be in the Quick reference table AND in the Usage syntax. No "by the way" flags discovered only by reading execution-flow prose.

### R6 — Cross-references are at the bottom, in a uniform shape

`## See also` MUST be the last section. It MUST have these sub-categories where applicable: Constitution / Related commands / Schemas / Design / ADRs. Each link is one line.

### R7 — One-paragraph what-it-does at the top

The blockquote immediately under the H1 MUST be one paragraph that:
- Explains what the command does in plain English
- Cites the governing ADR (when any)
- Mentions any major caveat (e.g., "destructive — requires `--confirm`")

### R8 — Examples MUST come BEFORE Execution flow

The reader who is not interested in the implementation reads stop at the Examples section. They should not have to read execution-flow detail to find a working invocation.

### R9 — Hard rules section lists machine-enforced constraints

If the command enforces hard validation rules (e.g., "fail the write if X"), they MUST be listed in a `## Hard rules / validation` section so users know what will trigger refusal before they try.

### R10 — Outputs are itemised, with paths

The `## Outputs` section MUST list every file the command writes, with its full path (relative to project root). Conditional outputs are flagged: `(only when --flag is set)`.

## Anti-patterns (do not do)

- **Burying flags inside prose paragraphs.** "The agent walks the hierarchy unless `--input` is passed" — this counts as "documented" only if `--input` is also in Quick reference and Usage syntax.
- **One example only.** The user reads one example and assumes that's the only invocation. Always provide variation.
- **Missing the most common scenario.** The first example MUST be the most-common usage; not the most-feature-rich.
- **Linking out for flag definitions.** "See [the design doc](...)" for a flag's behaviour is unacceptable. Each flag's behaviour belongs in the Quick reference row.
- **"Optional" without specifying default.** Every optional flag MUST state its default behaviour.

## Applying the standard

### To a NEW command body

Author against the structure from the start. Use the template skeleton in this file as the starting point. Run the [self-check](#self-check) before commit.

### To an EXISTING command body

1. Audit against the rules above — does it have every section in order?
2. List flags discovered ONLY by reading execution flow (not in Quick reference or Usage) — these are bugs to fix.
3. Count examples — < 3 means add at least one more.
4. Verify the first example is the most common scenario, not the most feature-rich.
5. Refactor in place — DO NOT add a "v2" file; the original path is canonical.
6. Bump a revision note in frontmatter (`doc-revision: <date>; reason: <one-line>`).

### Self-check

Before committing a command body, answer each:

- [ ] Does the Quick reference table list every flag with type and default?
- [ ] Are there >= 3 examples?
- [ ] Is the first example the most common scenario (typically bare invocation)?
- [ ] Is every flag in the Usage syntax also in the Quick reference?
- [ ] Are flags introduced in execution flow ALSO in Quick reference?
- [ ] Does the Common workflows section cover the 2-3 most common journeys?
- [ ] Are outputs listed with paths?
- [ ] Is `See also` at the bottom in the prescribed shape?

Any "no" is a fix-before-commit.

## Worked example

The canonical worked example post-DEFECT-002 is [`agents/solution-estimate/.claude/commands/estimate.md`](../agents/solution-estimate/.claude/commands/estimate.md) — rebuilt against this standard 2026-05-15 in implementation log entry `2026-05-15-008`.

Before/after comparison:

- **Before:** `--export` flag mentioned in line 22 of a flag table embedded in a "Usage" section, with the table itself buried below an info-dense paragraph; user reading the file top-down didn't reach line 22.
- **After:** `--export` appears in Quick reference (above-the-fold table immediately under the opening blockquote), in Usage (line 1 of the Usage code block), and as the third Example ("Export for spreadsheet review"). Three independent discovery paths.

## Audit findings (2026-05-15)

The 2026-05-15 audit covered all commands across all 8 agents. Findings (per implementation log entry `2026-05-15-008`):

| Agent | Command bodies audited | Bodies needing rebuild against this standard |
|---|---:|---|
| solution-estimate | 1 | 1 (`/estimate` — rebuilt 2026-05-15) |
| solution-architect | 3 | 3 (`/solution-blueprint`, `/solution-review`, `/solution-prototype` — queued under bk-029) |
| d365-ce | 17 | 17 (queued under bk-029) |
| d365-fo | 19 | 19 (queued under bk-029) |
| integration | 17 | 17 (queued under bk-029) |
| reporting | 17 | 17 (queued under bk-029) |
| brownfield | 9 | 9 (queued under bk-029) |
| alm | 6 | 6 (queued under bk-029) |
| **Total** | **89** | **89 (1 done; 88 queued)** |

The "queued" 88 are all functional — they document the command's contract correctly per the original standard. The rebuild is a **discoverability uplift**, not a correctness fix. Backlog item `bk-029` tracks this work; one agent's command set is the unit-of-rebuild (per agent, all commands together).

## See also

- [14-readme-conventions.md](14-readme-conventions.md) — companion standard for READMEs (What / How / Details)
- [07-doc-rules.md](07-doc-rules.md) — cross-cutting doc-lint rules
- Worked example: [`agents/solution-estimate/.claude/commands/estimate.md`](../agents/solution-estimate/.claude/commands/estimate.md)
- Implementation log: [`2026-05-15-006`](../implementation.md) (DEFECT-002 intake), `2026-05-15-008` (resolution)
