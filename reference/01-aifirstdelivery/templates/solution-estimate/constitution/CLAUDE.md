# Solution Estimate Agent

Factor-based estimation for Microsoft technology delivery projects.
Produces ROM, structured, and detailed estimates at any stage of the delivery lifecycle.

## Full Workflow

```mermaid
graph LR
  ROM["Phase 1 — ROM\n/estimate-rom\n→ rom-estimate.md"]:::info
  Spec["Phase 2 — Structured\n/estimate-spec\n→ {feature}-spec-estimate.md"]:::info
  Plan["Phase 3 — Detailed\n/estimate-plan\n→ {feature}-plan-estimate.md"]:::info
  Factors["Factor Review\n/factors-review\n→ factor-review.md\n[FACTORS APPROVED gate]"]:::warning
  Build["Phase 4 — Build Deliverable\n/estimate-build\n→ business-req-detail.md\n→ module-build-hrs.md\n→ module-overall-hrs.md"]
  Rollup["Phase 5 — Rollup (optional)\n/estimate-rollup\n→ rollup-summary.md"]
  ROM -->|"feeds"| Build
  Spec -->|"supersedes ROM"| Build
  Plan -->|"supersedes Spec"| Build
  ROM -.->|"new factors?"| Factors
  Spec -.->|"new factors?"| Factors
  Plan -.->|"new factors?"| Factors
  Factors -->|"FACTORS APPROVED"| Build
  Build --> Rollup
  classDef info fill:#93c5fd,color:#000,stroke:#3b82f6
  classDef warning fill:#f59e0b,color:#000,stroke:#d97706
```

> Brownfield mode applies automatically to rom/spec/plan when `brownfield.enabled: true`.
> All estimate commands read brownfield docs / impact-analysis.md and adjust rates per classification.

## Command Reference

| Command | Pre-condition | Output |
|---|---|---|
| `/estimate-rom {project} {input}` | None | `estimates/{p}/rom-estimate.md` |
| `/estimate-spec {project} {feature}` | Spec APPROVED in domain agent | `estimates/{p}/{f}-spec-estimate.md` |
| `/estimate-plan {project} {feature}` | TASK-READY or PLAN APPROVED in domain agent | `estimates/{p}/{f}-plan-estimate.md` |
| `/factors-review {project}` | `proposed-factors.md` exists | `estimates/{p}/factor-review.md` (sets FACTORS APPROVED) |
| `/estimate-build {project}` | At least one estimate exists; FACTORS APPROVED if new factors | 3 formal output files |
| `/estimate-rollup {project}` | `estimate-build` complete | `estimates/{p}/rollup-summary.md` |

## Gates

| Gate | Set by | Blocks |
|---|---|---|
| FACTORS APPROVED | `/factors-review` | `/estimate-build` will not run if `proposed-factors.md` exists and this gate is not set |

## Rules

- Always read all files in `constitution/` before generating any output.
- All output paths (`estimates/`) are relative to this template's root directory — never relative to the location of the input requirements file, regardless of where the source requirements come from.
- Always read `20-factor-definitions.md` and `21-factor-rates.md` before assigning any factor or hour value.
- If a requirement needs a factor not in `20-factor-definitions.md`: write `proposed-factors.md` and halt. Continue other rows.
- Factor **counts** in inventory are always whole integers. **Hours** = Count × Rate from `21-factor-rates.md`.
- Requirement Level is always set per the L1–L5 scale in `22-estimation-rules.md`.
- Phase multipliers are always sourced from `22-estimation-rules.md` — never hardcode them.
- Brownfield adjustments apply only when `brownfield.enabled: true` in `10-project-configuration.md`.
- Do not generate the formal 3-part deliverable during rom/spec/plan runs — that is `/estimate-build`'s job.
