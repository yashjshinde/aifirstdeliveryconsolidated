# Running AI First Delivery Agents in GitHub Copilot

**Concrete example — writing a D365 CE spec:**

```powershell
# 1. Run this in the repo root
.\scripts\copilot-run.ps1 d365-ce spec customer-loyalty-points

# Output:
#   Generating prompt: [d365-ce] /spec customer-loyalty-points
#   Prompt ready  (42 KB)
#   File:         .tmp\copilot-prompt.md
#   Clipboard:    Copied to clipboard
#
#   Next steps:
#     1. Open Copilot Chat    Ctrl+Alt+I
#     2. Switch to Agent mode click the * icon
#     3. Paste                Ctrl+V
#     4. Press Enter and follow Copilot's prompts
```

```
# 2. In Copilot Chat Agent mode — paste, then Copilot asks:
"What is the feature name and requirement?"

# 3. You reply:
Feature: customer-loyalty-points
Requirement: Add a loyalty points system to D365 CE. Customers earn points on purchases.
Points can be redeemed for discounts. Agents need a balance dashboard per customer.

# 4. Copilot writes the file:
✓ Created specs/customer-loyalty-points/spec.md
```

---

## Three ways to run a command

| Method | How | Best for |
|---|---|---|
| **1. Script** | Run `copilot-run.ps1` in terminal → paste into Copilot Chat | Most reliable — full constitution embedded in prompt |
| **2. VS Code Task** | `Ctrl+Shift+P` → Run Task → pick → paste | Same as script, GUI instead of terminal |
| **3. Direct Copilot Chat** | Ask Copilot to `@workspace`-read constitution + command files | No Node.js required |

---

## Method 1 — Script

Works everywhere. The prompt is completely self-contained — no external file references.

```powershell
# Windows PowerShell — from repo root
.\scripts\copilot-run.ps1 d365-ce    spec     customer-loyalty-points
.\scripts\copilot-run.ps1 d365-ce    review   customer-loyalty-points
.\scripts\copilot-run.ps1 d365-ce    plan     customer-loyalty-points
.\scripts\copilot-run.ps1 d365-fo    fdd      vendor-invoice-automation
.\scripts\copilot-run.ps1 integration spec    erp-customer-sync
.\scripts\copilot-run.ps1 power-apps  spec    customer-portal
.\scripts\copilot-run.ps1 data-migration spec sftp-to-dv-accounts
```

```bash
# Mac / Linux / Git Bash
./scripts/copilot-run.sh d365-ce spec customer-loyalty-points
```

The script auto-installs runner dependencies on first run. Node.js must be on your PATH.

**Then paste into Copilot:**

1. Open Copilot Chat — `Ctrl+Alt+I` or **View → Chat**
2. Switch to **Agent mode** — click the `★` icon (not Ask or Edit)
3. Paste — `Ctrl+V`
4. Press Enter

---

## Method 2 — VS Code Task

Same outcome as the script. No terminal needed.

1. Press `Ctrl+Shift+P` → type `Tasks: Run Task` → Enter
2. Pick a task:
   - **"Copilot: Generate Prompt (pick domain + command)"** — interactive picker for any domain/command
   - Or pick any specific pre-built task (e.g. "Copilot: D365 CE — /spec")
3. Enter the feature name when prompted
4. Prompt is generated and **copied to clipboard automatically**
5. Open Copilot Chat (`Ctrl+Alt+I`) → Agent mode (`★`) → paste → Enter

All 99 commands across all 8 domains are pre-configured in `.vscode/tasks.json`.

---

## Method 3 — Direct Copilot Chat (no script, no Node.js)

Copilot reads the template files directly using `@workspace` references. No clipboard step needed —
Copilot acts on the instruction immediately.

Open Copilot Chat in **Agent mode** and type:

```
I want to run the /spec command for the d365-ce domain. Feature: my-feature.
Read @workspace templates/d365-ce/constitution/CLAUDE.md — those are the agent rules.
Read @workspace templates/d365-ce/.claude/commands/spec.md — follow it exactly.
Write output to specs/my-feature/spec.md using the createFile tool.
```

For subsequent steps, include existing context files:

```
Run /review for d365-ce. Feature: my-feature.
Read @workspace templates/d365-ce/constitution/CLAUDE.md
Read @workspace templates/d365-ce/.claude/commands/review.md
Read @workspace specs/my-feature/spec.md — this is the spec to review.
Write output to specs/my-feature/review.md.
```

The `.github/copilot-instructions.md` file in this repo is automatically loaded by VS Code Copilot
as a workspace system prompt — it contains the full step-by-step instructions Copilot follows for
Method 3 without you needing to type them.

---

## Available domain + command combinations

| Domain | Commands |
|---|---|
| `d365-ce` | spec, spec-alm, review, impact, split-spec, fdd, testplan, plan, clarify, tdd, blueprint, task, validate, implement, document, extract, alm |
| `d365-ce-brownfield` | scan, index, fdd, tdd, blueprint, document |
| `d365-fo` | fdd, fdd-review, split-spec, tdd, tdd-review, testplan, plan, plan-review, blueprint, implement, document, extract, alm |
| `integration` | spec, spec-alm, review, impact, split-spec, fdd, mapping, pipeline, testplan, plan, clarify, tdd, blueprint, task, validate, implement, document, extract, alm |
| `power-apps` | spec, spec-alm, review, impact, split-spec, fdd, testplan, plan, clarify, tdd, blueprint, task, validate, implement, document, extract, alm |
| `data-migration` | spec, spec-alm, review, impact, split-spec, mapping, pipeline, testplan, plan, clarify, tdd, blueprint, task, validate, implement, document, extract, alm |
| `solution-architect` | solution-blueprint, solution-review |
| `solution-estimate` | estimate-rom, estimate-spec, estimate-plan, estimate-build, estimate-rollup, factors-review |

---

## Workflow order

Follow this sequence — each command gates the next. Replace `{f}` with your feature name.

| Step | Command | What Copilot writes | Gate check |
|---|---|---|---|
| 1 | `copilot-run.ps1 d365-ce spec {f}` | `specs/{f}/spec.md` | None — first step |
| 2 | `copilot-run.ps1 d365-ce review {f}` | `specs/{f}/review.md` | None |
| ✋ | **Check gate** | Open `review.md`, confirm `status: APPROVED` | Required before step 3 |
| 3 | `copilot-run.ps1 d365-ce plan {f}` | `plans/{f}/plan.md` + `work-items.yaml` | APPROVED |
| 4 | `copilot-run.ps1 d365-ce clarify {f}` | `plans/{f}/clarify.md` | None |
| ✋ | **Check gate** | Open `clarify.md`, confirm `status: TASK-READY` | Required before step 5 |
| 5 | `copilot-run.ps1 d365-ce task {f}` | `tasks/{f}/NN-{name}.md` | TASK-READY |

**How to check a gate:** Open the gate file and look for the status field:
```yaml
status: APPROVED       ← green to continue
status: NEEDS REWORK   ← fix issues first, re-run the previous command
```

If the gate is not met, paste the gate file into Copilot Chat and ask it to fix the issues.
Do not run the next command until the status is correct.

**Each Copilot session is stateless.** The script (Methods 1 & 2) automatically loads existing
context files into the prompt. For Method 3, include the relevant context files in your `@workspace`
references manually.

---

## Limitations vs Claude Code

| | Claude Code | GitHub Copilot |
|---|---|---|
| **MCP/ADO tools** | Full `ado_*` tool suite | Not available — generate files only |
| **Gate enforcement** | Hard stop at gate | Advisory — you check gate status manually |
| **Session continuity** | Remembers prior steps | Stateless — context loaded per call |
| **Constitution loading** | Automatic at session open | Embedded by script (M1/M2) or `@workspace` (M3) |
| **File write speed** | Instant, parallel | Sequential via `createFile` tool |

Output quality is equivalent — the same constitution and command instructions drive generation.

---

## Troubleshooting

**Copilot ignores constitution rules**
→ Use Method 1 or 2 — the script embeds all rules directly in the prompt. Copilot cannot ignore them.

**Copilot abbreviates the output**
→ Say: "Do not abbreviate. Generate the complete document with all required sections."

**Copilot writes to the wrong file path**
→ Say: "Write to exactly `specs/{feature}/spec.md`. Use the `createFile` tool."

**Gate not met**
→ Paste the gate file content into Copilot Chat and ask it to fix the issues before continuing.

**Script says "node not found"**
→ Install Node.js (LTS) from nodejs.org and restart your terminal.

**Script says "runner failed"**
→ Run `cd tools/runner && npm install` manually, then retry the script.

**Method 3 — Copilot reads wrong file version**
→ Use `@workspace` with the exact path: `templates/{domain}/constitution/CLAUDE.md`.
   If Copilot still drifts, switch to Method 1 or 2 for that command.
