# AI First Delivery — GitHub Copilot Instructions

This repository contains AI-assisted delivery agent templates for Microsoft technology domains.
Each agent takes a requirement from plain-language description through spec → design → tasks → code
using a gate-controlled workflow.

---

## Quick Start — Three ways to run a command

### Method 1 — Script (recommended, works everywhere)

Run the helper script from the repo root. It generates a complete prompt and copies it to clipboard:

```powershell
# Windows PowerShell
.\scripts\copilot-run.ps1 d365-ce spec my-feature
.\scripts\copilot-run.ps1 d365-ce review my-feature
.\scripts\copilot-run.ps1 data-migration spec sftp-to-dv-accounts
```

```bash
# Mac / Linux / Git Bash
./scripts/copilot-run.sh d365-ce spec my-feature
```

Then: open Copilot Chat → switch to **Agent mode** (★ icon) → paste → Enter.

### Method 2 — VS Code Task (GUI, no terminal needed)

1. Press `Ctrl+Shift+P` → type **Run Task** → Enter
2. Pick **"Copilot: Generate Prompt (pick domain + command)"** or a specific domain task
3. Select domain, select command, type feature name
4. Prompt is generated and copied to clipboard — paste into Copilot Chat Agent mode

### Method 3 — Copilot Chat directly (any version)

Open Copilot Chat in **Agent mode** and say exactly:

```
I want to run the /spec command for the d365-ce domain. Feature: my-feature.
Read @workspace templates/d365-ce/constitution/CLAUDE.md — those are the agent rules.
Read @workspace templates/d365-ce/.claude/commands/spec.md — follow it exactly.
Write output to specs/my-feature/spec.md using the createFile tool.
```

---

## Workflow overview

Each domain follows the same gate-controlled flow. You MUST complete each step before the next:

```
/spec    → specs/{f}/spec.md            (write requirements)
/review  → specs/{f}/review.md          ← APPROVED gate (required before /plan, /fdd, /mapping)
/plan    → plans/{f}/plan.md            (technical breakdown — needs APPROVED)
/clarify → plans/{f}/clarify.md         ← TASK-READY gate (required before /task, /tdd)
/task    → tasks/{f}/NN-{name}.md       (dev-ready task cards — needs TASK-READY)
/validate → updates task card status    ← READY TO IMPLEMENT gate
/implement → output/{f}/src/            (generated code — needs READY TO IMPLEMENT)
```

**Gate check rule:** Before running any command, check the gate file for the previous step. If the
status is not APPROVED / TASK-READY / READY TO IMPLEMENT, tell the user what needs to be fixed first.

---

## Domain reference

| Domain | Key commands | First file written |
|---|---|---|
| D365 CE (`d365-ce`) | spec, review, plan, fdd, tdd, blueprint, task, validate, implement | `specs/{f}/spec.md` |
| D365 F&O (`d365-fo`) | fdd, fdd-review, plan, tdd, blueprint, task, validate | `docs/{f}/fdd.md` |
| Integration (`integration`) | spec, review, mapping, pipeline, plan, task | `specs/{f}/spec.md` |
| Power Apps (`power-apps`) | spec, review, plan, blueprint, task | `specs/{f}/spec.md` |
| Data Migration (`data-migration`) | spec, review, plan, task | `specs/{f}/spec.md` |
| Solution Architect (`solution-architect`) | solution-blueprint | `docs/{f}/solution-blueprint.md` |
| Solution Estimate (`solution-estimate`) | estimate-rom | `estimates/{f}/estimate.md` |

---

## How to run a command in Copilot Chat (Method 3 full instructions)

When the user asks to run any command, follow this exact sequence:

**Step 1 — Read constitution (always first)**
```
Read @workspace templates/{domain}/constitution/CLAUDE.md
Read @workspace templates/{domain}/constitution/00-index.md
```
Then read each constitution file listed in 00-index.md. Treat every rule as a hard constraint.

**Step 2 — Read the command file**
```
Read @workspace templates/{domain}/.claude/commands/{command}.md
```
Follow its steps exactly, in order.

**Step 3 — Load existing context**
If a feature name is given, check for and read these files if they exist:
- `specs/{feature}/spec.md`
- `specs/{feature}/review.md`
- `plans/{feature}/plan.md`
- `plans/{feature}/clarify.md`

**Step 4 — Check gate**
If the command has a pre-condition gate (e.g. /plan requires APPROVED), read the gate file and
confirm the status. If not met, stop and tell the user what is blocking.

**Step 5 — Generate output**
Use `createFile` to write all output files. Use `editFiles` to update existing files.
Never skip a section. Never abbreviate output. Generate the complete document.

---

## Rules that always apply

- Read ALL constitution files before generating any output — constitution overrides everything.
- Never invent requirements — only document what was stated or is directly inferrable.
- Never hardcode credentials — all secrets must reference Azure Key Vault.
- Skip ADO/MCP tool calls — Copilot cannot call `ado_*` tools; generate files only.
- Do not re-number existing FR-NNN / MR-NNN numbers without explicit instruction.
- Every functional requirement: number FR-001, FR-002, … sequentially (never reset per module).
- Every AI decision, inference, or assumption: append `> **AI Notes** — {one sentence}` at end of section.

---

## Common command patterns

### Run /spec (first step, any domain)
```
Run /spec for [domain]. Feature: [name].
Requirement: [paste requirement text here]
Write output to specs/[name]/spec.md.
```

### Run /review (after spec is written)
```
Run /review for [domain]. Feature: [name].
Read the existing spec at specs/[name]/spec.md.
Write review output to specs/[name]/review.md.
Set status APPROVED only if zero BLOCKERs and zero REQUIREDs.
```

### Run /plan (after APPROVED review)
```
Run /plan for [domain]. Feature: [name].
Check specs/[name]/review.md — confirm status is APPROVED before proceeding.
Write plan to plans/[name]/plan.md and plans/[name]/work-items.yaml.
```

### Run /task (after TASK-READY clarify)
```
Run /task for [domain]. Feature: [name].
Check plans/[name]/clarify.md — confirm status is TASK-READY before proceeding.
Write one file per task to tasks/[name]/.
```
