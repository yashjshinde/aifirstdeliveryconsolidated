# Estimation Rules

## 1. Requirement Level (L1–L5)

Requirement Level indicates confidence in the estimate for a given inventory row.
Set per requirement based on the source and completeness of the requirement at estimation time.

| Level | Name | When to Assign |
|---|---|---|
| L1 | Placeholder | ROM estimate, title-only requirement; directional only — must re-estimate after spec |
| L2 | Low Confidence | ROM estimate or incomplete FR; significant gaps or unresolved dependencies |
| L3 | Medium Confidence | Spec estimate with open questions; scope may shift |
| L4 | High Confidence | Spec estimate (no open questions) or plan estimate with minor assumptions |
| L5 | Fully Detailed | Plan estimate: full acceptance criteria, no open questions, design complete |

**Default levels by command:**

| Command | Default Level | Escalate to |
|---|---|---|
| `/estimate-rom` | L2 | L1 if requirement is title-only |
| `/estimate-spec` | L4 if no open questions | L3 if open questions; L2 if FR is incomplete |
| `/estimate-plan` | L5 if full ACs, no gaps | L4 if minor assumptions; L3 if linked FR had open questions |

---

## 2. Phase Multipliers (Overall Hours)

Applied by `/estimate-build` to derive Total Project Hours from Org Build & UT Hours.
Modify multipliers below to match your project's delivery model.

| Phase | Multiplier | Formula |
|---|---|---|
| Plan & Design | 0.20 | Org Build & UT Hrs × 0.20 |
| Test Creation | 0.25 | Org Build & UT Hrs × 0.25 |
| Test Execution | 0.35 | Org Build & UT Hrs × 0.35 |
| Dev Fix | 0.35 | Org Build & UT Hrs × 0.35 |
| Deployment | 0.15 | Org Build & UT Hrs × 0.15 |
| **Total Project** | **2.30** | **Org Build & UT Hrs × 2.30** |

> Total Project Hrs = Build + P&D + TC + TE + DF + Dep = Build × (1 + 0.20 + 0.25 + 0.35 + 0.35 + 0.15) = **Build × 2.30**

---

## 3. Brownfield Rate Adjustments

Applied when `brownfield.enabled: true` in `constitution/10-project-configuration.md`.
Classification is drawn from `impact-analysis.md` (spec/plan mode) or component inventory (ROM mode).

| Classification | Rate Adjustment | Rationale |
|---|---|---|
| NEW | Standard rate × 1.00 | No existing code; full build required |
| EXTEND | Standard rate × 0.60 | Existing base reduces build effort by ~40% |
| REPLACE | Standard rate × 1.15 | Existing code adds backward-compatibility overhead |
| REFERENCED | 0 hrs | Read-only dependency; no build required |
| CONFLICT | Excluded — document in Open Questions | Cannot estimate until conflict is resolved |

---

## 4. Smart Factor Addition Rules

When an estimate run encounters a requirement not covered by any factor in `constitution/20-factor-definitions.md`:

1. **Check first:** can the requirement be satisfied by combining existing factors? Prefer this over a new factor.
2. **If not:** write a proposed factor card to `estimates/{project}/proposed-factors.md`.
3. **Mark the row** as `[FACTOR PENDING]` in the Inventory column and continue estimating.
4. **At end of run:** if any proposed factors exist, print a HALT notice to run `/factors-review`.
5. **`/estimate-build` is blocked** until `factor-review.md` shows `status: FACTORS APPROVED`.

**Factor naming convention:** `{Platform/Technology} {Deliverable/Activity} {Stage}`
Examples: "Power Pages Portal Page C&UT", "Azure Service Bus Topic C&UT", "D365 Copilot Agent C&UT"

---

## 5. ROM Uncertainty Buffer

All ROM estimates must include this note in the Summary section:

> **ROM Uncertainty:** This estimate is ±40% due to unstructured input. Confidence refines after `/estimate-spec` (±20%) or `/estimate-plan` (±10%).

---

## 6. Diagram Standards

All diagrams in generated output and templates must use Mermaid syntax enclosed in a triple-backtick `mermaid` code fence. ASCII art and plain-text diagram representations are prohibited.

**Diagram types by use:**

| Use Case | Mermaid Type |
|---|---|
| Estimation workflow / phase flow | `graph LR` |
| Confidence distribution | `pie` |
| Rollup summary chart | `pie` |

**Standard classDef palette** (include in every diagram that uses coloured nodes):

```
classDef info fill:#93c5fd,color:#000,stroke:#3b82f6
classDef warning fill:#f59e0b,color:#000,stroke:#d97706
classDef ok fill:#22c55e,color:#000,stroke:#16a34a
classDef critical fill:#ef4444,color:#fff,stroke:#b91c1c
```

Apply `:::warning` to gate/blocked steps; `:::info` to inputs and outputs; `:::ok` to approved states.
