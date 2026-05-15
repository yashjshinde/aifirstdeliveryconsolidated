# Reference Material — Spec-Driven Development Consolidated Solution

This folder bundles all reference material cited in the master plan `00-spec-driven-development-humble-muffin.md`. Port this entire folder + the spec to wherever you'll author the detailed design and implementation.

## Folder structure

```
reference/
├── README.md                                    # This file — index of what's where
├── 00-spec-driven-development-humble-muffin.md  # MASTER PLAN — the spec (33 revisions, R1–R33)
├── 01-aifirstdelivery/                          # Reference repo from c:\Users\amit.mudgal\source\repos\aifirstdelivery
├── 02-sw-project/                               # SW project — D365 Form Generation Prompt + SW Phoenix FDD
├── 03-dynamics365-aisolution/                   # Estimation template + examples
└── 04-factor-catalogues/                        # Excel factor rate catalogues (ICICI + Internal Project SI)
```

## 00 — Master Plan (the spec)

| File | Size | Description |
|---|---|---|
| `00-spec-driven-development-humble-muffin.md` | ~3300 lines | Full design — 8 agents, MCP server, project layout, workflow gates, ALM model, brownfield model, aggregators, publish pipeline, chat UI, critical files list, revision history R1–R33 |

Start here. Every reference below is cited by revision number in §26 Revision History.

## 01 — aifirstdelivery (predecessor repo)

`templates/` and `ghcptemplates/` for 9 + 10 agents. Used as PORT source for:

| Folder | Used by | Revision |
|---|---|---|
| `templates/d365-fo/` (constitution + doc-templates + Prompts/fdd-review + Prompts/tdd-review) | d365-fo agent — constitution and templates ported VERBATIM | **R16** |
| `templates/d365-ce-brownfield/` and `ghcptemplates/d365-ce-brownfield/` (11 constitution + 8 prompts + 7 templates) | brownfield agent — full port | **R20** |
| `templates/d365-ce-brownfield/` (constitution rules: Evidence Over Assumption, No Grouping, zero-tolerance gates) | Brownfield validators in MCP | **R20** |
| `templates/solution-estimate/` and `ghcptemplates/solution-estimate/` (6 constitution + 3 worksheets) | solution-estimate agent — 4 advanced features ported (brownfield multipliers, confidence bands, proposed-factors gate, confidence pie) | **R32** |
| `templates/d365-ce/` (6 templates: fdd / impl-doc / test-case-suite / test-plan) | d365-ce agent — deferred port; will use SW Phoenix shape as primary, this as secondary reference | future |
| `templates/integration/` (6 templates) | integration agent — deferred port | future |
| `templates/reporting/` (5 templates) | reporting agent — deferred port | future |
| `templates/data-migration/` (3 specialty templates) | integration agent (data-migration is content within integration per Q2 closure) | future |
| `templates/power-apps/` (6 templates) | d365-ce agent — Canvas/Pages/PCF/PA sub-platform packs | R17 deferred |
| `templates/solution-architect/` (Blueprint template) | solution-architect agent | future |
| `tools/alm-agent/` | alm agent | future |

**Pruned from copy:** `.git/`, `.vscode/`, all `node_modules/`, `bin/`, `obj/`, `dist/` folders (build outputs).

**Net size:** ~10 MB / ~1100 files (down from 120 MB / 7700 files raw).

## 02 — SW project files

Two files from a Sherwin-Williams D365 CE rollout — both project-tested and battle-validated.

| File | Used by | Revision |
|---|---|---|
| `D365_Form_Generation_Prompt.md` | d365-ce `fdd-helpers/form-mockup-generator.prompt.md` (per-entity HTML mockup) | **R17** |
| Same file | solution-architect `helpers/form-mockup-generator.prompt.md` (cross-agent solution prototype) | **R33** |
| `Sherwin_Williams_Phoenix_FDD_v1.0_Generated.md` | d365-ce `fdd/_index.template.md` shape (12-section CE FDD: Intro → Process → Scenarios → UI (Forms / Validation / BPF / Views / Mockups) → Reports → Security → Entity Model → Reference Data → Migration/Integration/Testing/Deployment stubs → Appendices) | **R17** |
| Same file | d365-ce `fdd/model-driven.template.md` content basis (§4 + §7 contents abstracted) | **R17, R19** |

R19 lists 15 content-shape gap fixes vs. this SW base (A1–A15: dup §4.2, Out-of-Scope, Open-Questions roll-up, Cross-Agent Dependencies, NFR mapping, OOB-first decision log, Multilingual, Glossary, drop §9-12 stubs → Handoffs section, beef up Security + Entity Model, add Process Definitions / Power Automate / Plugins / Templates sub-sections, sub-platform packs).

## 03 — Dynamics365AISolution (only the 4 files cited by R23)

Trimmed to only the load-bearing files. Everything else (sample plugin code, Azure Function code, project docs, work products, obsolete artifacts, repo plumbing) was removed because it isn't cited anywhere in the design plan.

| File | Used by | Revision |
|---|---|---|
| `MasterTemplate/estimation-instructions.md` (15 KB) | solution-estimate agent — PORTED VERBATIM as authoring contract (factor definitions §1.1, factor rates §1.2, output structures §2.1–2.3, execution steps §3, 7 key rules §4) | **R23** |
| `Estimation/Estimation-BusinessReqDetail.md` (35 KB) | solution-estimate — reference inventory output shape (14 cols template baseline; we extended to 20 via R24+R25+R32) | **R23** reference |
| `Estimation/Estimation-ModuleBuildHrs.md` (12 KB) | solution-estimate — reference per-module factor rollup (template baseline) | **R23** reference |
| `Estimation/Estimation-ModuleOverallHrs.md` (4 KB) | solution-estimate — reference project deliverable (5-phase ×2.30 baseline; we replaced with 7-phase ×2.76 via R26) | **R23** reference |

**Net size:** 66 KB / 4 files (down from 265 MB raw source folder; then 3.5 MB after first prune; now ~0.07 MB after design-only cleanup).

## 04 — Factor Catalogues (Excel)

Tool-canonical effort-rate catalogue for the solution-estimate agent. Extracted via PowerShell unzip + XML parse; the Excel itself is preserved here for re-extraction or further iteration.

| File | Used by | Revision |
|---|---|---|
| `Internal Project - Internal Project -  SI Effort Data.xlsx` | solution-estimate — **95-factor SI catalogue** (current authoritative) + 8 reintroduced from R23 reference = 103 total | **R27** (active) |

> The **ICICI Bank Effort Data.xlsx** that was originally bundled with R25 has been **removed** — superseded by the Internal Project SI Excel above. R25's structural contribution (5-level VS/S/M/C/VC complexity model) is permanent in the design; R25's data contribution (11 ICICI-specific factor rates) is fully replaced by R27. See §26 R25 in the master plan for the post-supersession note.

## Quick-reference: which port did what

| Revision | Source(s) used | What got ported |
|---|---|---|
| **R16** | 01-aifirstdelivery/templates/d365-fo/ | d365-fo constitution (8 files) + templates + review checklists |
| **R17** | 02-sw-project/D365_Form_Generation_Prompt.md + Sherwin_Williams_Phoenix_FDD_v1.0_Generated.md | d365-ce FDD shape + form-mockup-generator helper (multi-file sub-platform pattern) |
| **R19** | Same SW FDD | 15 content-shape additions identified (A1–A15) |
| **R20** | 01-aifirstdelivery/templates/d365-ce-brownfield/ | brownfield agent — full constitution + 8 commands + 7 templates ported; auto-mode self-healing added |
| **R21** | (extends R20) | Pattern + binding architecture for full ~140+ artifact taxonomy |
| **R23** | 03-dynamics365-aisolution/MasterTemplate/estimation-instructions.md | solution-estimate — 19-factor reference template (later superseded) |
| **R25** | (ICICI Bank Effort Data.xlsx — no longer bundled; was historical-only) | solution-estimate — introduced 5-level complexity (VS/S/M/C/VC). Structural decision permanent; the 11 ICICI factor rates were superseded by R27. |
| **R26** | (user-specified) | 7 phase multipliers: Plan 0.07 / Analyze 0.21 / Design 0.38 / Test Prep 0.25 / Test Exe 0.35 / Test/Dev Fix 0.35 / Deploy 0.15 (total ×2.76) |
| **R27** | 04-factor-catalogues/Internal Project SI Effort Data.xlsx | solution-estimate — 95-factor SI catalogue (canonical) |
| **R28** | 03-dynamics365-aisolution/MasterTemplate/estimation-instructions.md | 8 factors reintroduced (Azure Function, Integration generic, Master Data Prep, Model Driven App Changes, PCF, Excel Report, ExperLogix, Hierarchy Security) — total 103 active factors |
| **R32** | 01-aifirstdelivery/templates/solution-estimate/ | 4 advanced features: brownfield multipliers (NEW/EXTEND/REPLACE/REFERENCED), Confidence Band header, Confidence Distribution pie, Proposed-Factors gate output |
| **R33** | 02-sw-project/D365_Form_Generation_Prompt.md | solution-architect /solution-prototype command — clickable HTML solution prototype helper |

## How to port

1. Copy this entire `reference/` folder to your target machine
2. Copy `00-spec-driven-development-humble-muffin.md` to the same location (or use the in-folder copy)
3. On the target machine, point your agents at `reference/` for all citations
4. When the design says "PORTED from `c:\Users\amit.mudgal\source\repos\…`" — substitute the corresponding `reference/01-aifirstdelivery/…` path on the target

## What's NOT here (and why)

- **Generated artifacts** (build outputs, node_modules, dist, bin, obj) — re-buildable, no design value
- **Git history** (`.git/` folders) — adds GB without design value; clone repos fresh if needed
- **`.vs/`, `.vscode/`** — IDE config, not portable across machines
- **Tests folders** (`*.Tests/`) — runtime test code, not design reference
- **Existing MCP server implementation** (`Dynamics365AISolution/mcp-server/`) — we're designing our own per the plan
- **Existing `lightweight-reactapp` and `aifirstdelivery/tools/mcp-server/`** — same; reference architecture, not directly portable

---

**Total reference folder size:** ~14 MB across 4 numbered subfolders + master plan + this README.
