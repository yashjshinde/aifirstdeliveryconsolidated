---
agent: solution-estimate
version: 1.0.0
last-reviewed: 2026-05-15
owner: aggregator
adr-refs: [ADR-0012]
---

# Requirement Level Taxonomy (L1-L5) and Classification Heuristic

> Per [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md). Every requirement row in `Estimation-BusinessReqDetail.md` carries a single `Requirement Level` value drawn from the five-level business-process taxonomy below. This file defines the taxonomy, the classification heuristic, and the ambiguity-handling rules.
>
> **Naming convention note (post-ADR-0012):** The labels `L1 / L2 / L3 / L4 / L5` refer **only** to the business-process taxonomy in this file. The internal estimation-hierarchy (Project / Module / Capability / Feature / Inventory Factor) is documented in [04-categorization-rules.md](04-categorization-rules.md) and uses the **named** labels — never `L1-L5`. The two schemes are orthogonal and both appear on every inventory row.

## The five levels

| Level | Name | Description | Example |
|---|---|---|---|
| **L1** | Category / Enterprise View | Highest-level value chain map. Groups major end-to-end business domains or operational functions. | Supply Chain Management, Human Resources, Finance, Customer Engagement |
| **L2** | Process Group | Breaks L1 categories into major workflows or distinct end-to-end process cycles. | Procure-to-Pay, Order-to-Cash, Recruit-to-Retire, Case-to-Resolution |
| **L3** | Process / Sub-Process | Specific processes within an L2 group, including handoffs, decisions, and cross-functional interactions. | Select Supplier, Create Purchase Order, Process Invoice, Triage Case |
| **L4** | Activity | Individual activities or steps required to complete the L3 process. Identifies roles, applications, and business rules. | Evaluate Suppliers, Obtain Approvals, Enter Contract Data in ERP, Assign Case Owner |
| **L5** | Task / Work Instruction | Most granular operational steps. Dictates exactly how a specific system screen is used or how an action is performed. | Click "Create Vendor", Fill in Tax ID, Submit Form, Click "Resolve Case" button |

## Why this taxonomy

Industry-standard business-process decomposition (APQC PCF, eTOM, MIT Process Handbook all use a 4-5-level scheme aligned with this one). Stakeholders use the L1-L5 axis to:

- Filter inventory by process depth ("show me only L3 process-level requirements that drive cross-functional handoffs")
- Roll up effort by level ("how much of total project effort is L5 task-level vs L3 process-level?")
- Compare scope coverage across modules ("is Sales mostly L3 and L4, while Service is mostly L4 and L5?")
- Identify gaps ("we have many L5 task requirements but no L3 process narrative — process design is incomplete")

## Classification heuristic (per requirement row)

The agent picks ONE level per requirement during `/estimate` ingestion. Heuristic:

### Step 1 — Look for an explicit level marker

When the requirement source explicitly tags the level (e.g., requirement frontmatter `requirement-level: L3`, or an RFP table column `Level: L3`), **accept it verbatim**. No further inference.

### Step 2 — Apply lexical / structural signals

When no explicit marker is present, apply these signals in order; the **first match wins**:

| Signal | Indicates |
|---|---|
| Requirement title mentions a business **category / enterprise function** (single noun phrase, broad scope) | **L1** |
| Requirement title mentions an **end-to-end process cycle** ("Order-to-Cash", "Hire-to-Retire", "Lead-to-Cash", "Issue-to-Resolution") | **L2** |
| Requirement title is a **process verb phrase** describing a multi-step end-to-end flow ("Create Purchase Order", "Onboard Employee", "Process Refund") | **L3** |
| Requirement title is an **activity verb phrase** describing a single step within a larger process ("Approve Invoice", "Validate Address", "Notify Manager") | **L4** |
| Requirement title is a **task / UI-action / work-instruction** ("Click Save", "Enter Tax ID", "Mark complete", "Open ticket form") | **L5** |
| Requirement title is **system-feature-level** ("Implement audit log", "Add custom field X to Account form", "Plugin to enforce uniqueness") | **L4** (system features map to activities — they enable activities, not full processes) |
| Requirement is **purely non-functional** (response time, throughput, encryption) | **Default L3** (NFRs constrain processes, not individual tasks; emit a Typed Gap `REQUIREMENT-LEVEL-NFR-DEFAULT` so reviewer can override) |

### Step 3 — Use estimation-hierarchy context when lexical signals are weak

If the lexical signals don't resolve, fall back to the row's Estimation Hierarchy (per [04-categorization-rules.md](04-categorization-rules.md)) for context:

- Estimation Hierarchy `Project` (top of the path) → tends to imply L1 (a top-level scope requirement)
- Estimation Hierarchy `Module` → tends to imply L2
- Estimation Hierarchy `Capability` → tends to imply L3
- Estimation Hierarchy `Feature` → tends to imply L4
- Estimation Hierarchy `Factor` (single artefact-of-implementation) → tends to imply L5

But this is a tendency, not a rule — the business-process axis is orthogonal. A single Inventory Factor (Estimation Hierarchy = Factor) can cover an L4 activity or an L5 task; the Factor is "what we build", the Requirement Level is "what business unit of work it enables."

### Step 4 — Ambiguity handling

If after Steps 1-3 the agent cannot pick one level with confidence:

- Emit the row with the **best-guess level** + add a **Typed Gap** of category `REQUIREMENT-LEVEL-INFERENCE` (per [04-categorization-rules.md § Cross-cutting / cross-module rows](04-categorization-rules.md) — same gap-log mechanism).
- The Open Questions column gets a one-liner: `Requirement Level inferred as Lx; review and confirm or override.`
- Reviewer can override by setting the requirement source's explicit marker and re-running `/estimate` (incremental default preserves manual overrides where Req IDs match).

## Worked examples

| Requirement title | Hint | Level |
|---|---|---|
| "Implement Customer Service module" | broad category | **L1** |
| "Build the Case-to-Resolution process end-to-end" | end-to-end process cycle | **L2** |
| "Triage an inbound case" | process verb, multi-step | **L3** |
| "Assign case owner based on routing rules" | single activity within Triage | **L4** |
| "Click Save to commit the assignment" | UI task instruction | **L5** |
| "Implement audit logging across all CE entities" | system feature, enables compliance activities | **L4** |
| "P95 case-form load time < 500 ms" | non-functional | **L3** (default with `REQUIREMENT-LEVEL-NFR-DEFAULT` gap) |
| "Build SLA management for premium customers" | process group | **L2** |
| "Send escalation email when SLA breaches" | single activity | **L4** |

## Single-column on every output surface

Per [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md):

- **Markdown** (`Estimation-BusinessReqDetail.md`): one column labelled `Requirement Level` with one value (e.g., `L3`) per row.
- **XLSX export**: one column labelled `Requirement Level`. **Never split into 5 columns**.
- **CSV export**: one column `Requirement Level`.
- **JSON export**: one field `requirementLevel: "L3"` per row.

The user's specific instruction (DEFECT-001, 2026-05-15): "I do not need separate columns L1 to L5, I need the above column itself."

## Distribution summary (stakeholder deliverable)

`Estimation-ModuleOverallHrs.md § 4.5 Requirement Level Distribution` rolls this column up project-wide:

- Table: Level / Description / Requirement Count / Inventory Rows / Build Hrs / Project Hrs (×2.76) / % of Total Hrs
- Mermaid pie chart titled "Requirement Level Distribution" (count per level)
- One-line narrative summary on top: "63% of requirements are L3 (Process), 22% L4 (Activity), 8% L5 (Task), 5% L2 (Process Group), 2% L1 (Category)" (illustrative)

This answers the stakeholder question "where in the process taxonomy is the bulk of the project work?"

## Override path

Per-project override of the heuristic (e.g., when a customer uses a different process-decomposition vocabulary):

- Drop `projects/{p}/_aggregator/estimation/requirement-levels-override.md` with project-specific examples + alternate signals.
- The agent merges canonical (this file) + override at run time; override wins.

## See also

- [ADR-0012 — Requirement Level taxonomy](../../../design/adr/0012-requirement-level-taxonomy.md)
- [04-categorization-rules.md](04-categorization-rules.md) — the orthogonal Estimation Hierarchy (Project / Module / Capability / Feature / Factor)
- [01-template-alignment.md § Output 1](01-template-alignment.md) — the 21-column inventory shape (was 20 pre-ADR-0012)
- Implementation log: [`2026-05-15-006`](../../../implementation.md) (DEFECT-001 intake), `2026-05-15-007` (resolution)
