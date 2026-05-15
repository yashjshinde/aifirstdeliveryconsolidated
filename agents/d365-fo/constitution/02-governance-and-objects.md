---
agent: d365-fo
sub-domain: governance
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
status: "structure-ported; full verbatim body queued as bk-026"
---

# F&O Governance + Objects

## RACI per object change

For every F&O object change, the RACI is explicit:

| Role | Responsible for |
|---|---|
| Solution Architect | Architecture decision; layer/scope; cross-module fit |
| Tech Lead | TDD authoring; technical sign-off; design review |
| Developer | Implementation; unit tests; code review participation |
| BA | Spec authoring; user acceptance criteria; UAT participation |
| QA Lead | Test plan authoring; test execution; defect triage |
| F&O Functional Consultant | Module configuration; security role assignments |

Documented per feature in the spec / plan; references work-items.yaml.

## Object category framework

Each F&O artefact maps to a category that determines the complexity classification:

| Category | Object types | Object-ID prefix |
|---|---|---|
| Extensions | Table / form / class CoC extensions, EDT extensions | EXT-NNN |
| Business Documents | Print management, Word / Excel templates | BDC-NNN |
| Operations | Batch jobs, recurring data jobs | OPR-NNN |
| Integration | Service classes, business events, data entities for INT | INT-NNN |
| Data Entities | Data entities (for DMF / OData) | DEN-NNN |
| Security | Roles, duties, privileges, security keys | SEC-NNN |
| Workflows | F&O workflow framework | WFL-NNN |

## Complexity classification

Per artefact, the complexity hint sized in `solution-estimate`:

| Level | F&O hint |
|---|---|
| Simple | Single artefact; no cross-module touch; OOB-extending |
| Medium | Multiple artefacts in one module; uses framework features |
| Complex | Cross-module touch; async/batch; integration |
| Very Complex | Cross-system orchestration; performance-sensitive; security-critical |

## Source attribution

Full RACI matrix + complexity-classification table verbatim from the predecessor's d365-fo `02-governance-and-objects.md` per R16; queued as **bk-026**.
