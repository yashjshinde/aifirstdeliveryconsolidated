# D365 CE Brownfield — GitHub Copilot Agent Template

This folder is a deployable template for the **D365 CE Brownfield analysis agent** for GitHub Copilot in VS Code.

The brownfield agent reverse-engineers an existing D365 CE solution — scanning components, cataloguing entities and plugins, and generating comprehensive documentation for a system you did not build.

## What's included

```
.github/
  agents/
    d365-ce-brownfield.agent.md                             ← Custom agent definition
  prompts/
    d365-ce-brownfield-prepare.prompt.md                    ← /d365-ce-brownfield-prepare
    d365-ce-brownfield-scan.prompt.md                       ← /d365-ce-brownfield-scan
    d365-ce-brownfield-document.prompt.md                   ← /d365-ce-brownfield-document
    d365-ce-brownfield-fdd.prompt.md                        ← /d365-ce-brownfield-fdd
    d365-ce-brownfield-tdd.prompt.md                        ← /d365-ce-brownfield-tdd
    d365-ce-brownfield-blueprint.prompt.md                  ← /d365-ce-brownfield-blueprint
    d365-ce-brownfield-generate.prompt.md                   ← /d365-ce-brownfield-generate
    d365-ce-brownfield-index.prompt.md                      ← /d365-ce-brownfield-index
  instructions/
    d365-ce-brownfield-constitution.instructions.md         ← Always-on rules (auto-injected)
constitution/                                               ← Brownfield analysis rules
doc-templates/                                              ← Documentation templates
input/                                                      ← Place source artefacts here
docs-generated/                                             ← All generated documentation
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project root (or merge)
2. **Copy the `constitution/` folder** from `templates/d365-ce-brownfield/constitution/`
3. **Copy the `doc-templates/` folder** from `templates/d365-ce-brownfield/doc-templates/`
4. Create `input/` and `docs-generated/` folders
5. Configure `constitution/10-project-configuration.md` with project name and publisher prefix

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker → select **D365 CE Brownfield Agent**
3. Type naturally, e.g.:
   - `Prepare the solution from C:\Downloads\MySolution`
   - `Scan the prepared input`
   - `Generate all documentation`

### Option B — Invoke a prompt directly

- `/d365-ce-brownfield-prepare` — normalise unstructured artefacts into `input/` layout
- `/d365-ce-brownfield-scan` — discover and catalogue all components
- `/d365-ce-brownfield-document` — generate component-level documentation by scope
- `/d365-ce-brownfield-fdd` — generate Functional Overview Document
- `/d365-ce-brownfield-tdd` — generate Technical Overview Document
- `/d365-ce-brownfield-blueprint` — generate Architecture Blueprint + Data Model + Dependency Map
- `/d365-ce-brownfield-generate` — run full documentation pipeline in one shot
- `/d365-ce-brownfield-index` — generate master navigation index

## Workflow

```
/d365-ce-brownfield-prepare {path}   → input/ (normalised artefacts)
/d365-ce-brownfield-scan             → docs-generated/component-inventory.md
/d365-ce-brownfield-document all     → docs-generated/functional/ + docs-generated/technical/
/d365-ce-brownfield-fdd              → docs-generated/functional/functional-overview.md
/d365-ce-brownfield-tdd              → docs-generated/technical/technical-overview.md
/d365-ce-brownfield-blueprint        → docs-generated/architecture/solution-blueprint.md + data-model.md
/d365-ce-brownfield-index            → docs-generated/00-index.md

-- OR shortcut --

/d365-ce-brownfield-generate         → Runs all steps above in one shot
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `/prepare`, `/scan`, `/generate` | `/d365-ce-brownfield-prepare` etc. (prefixed) |
| `constitution/CLAUDE.md` auto-loaded | Agent body + `.instructions.md` auto-injected for `docs-generated/**` |
| Evidence Over Assumption principle | Same — enforced via constitution |

## Notes

- The **Evidence Over Assumption** principle is a hard constraint: only document what exists in source files
- The **No Grouping rule** is zero tolerance: every component gets its own individual section
- Never modify files in `input/` — the agent reads them as read-only source material
- The constitution is auto-injected whenever you edit any file under `docs-generated/`
- `/generate` is the fastest route from a completed scan to fully documented solution
