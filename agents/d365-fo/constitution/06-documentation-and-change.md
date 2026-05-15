---
agent: d365-fo
sub-domain: doc-and-change
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
status: "structure-ported; full verbatim body queued as bk-026"
---

# F&O Documentation + Change Control

> Mandatory artefacts per object category + change control + non-negotiable principles. PORTED structure per R16; full content in bk-026.

## Mandatory artefacts per object category

For each object the agent produces, the following artefacts are REQUIRED:

| Object category | FDD section | TDD section | Test case(s) | Other |
|---|---|---|---|---|
| Data Entity (DEN-NNN) | * Entity model + DMF project | * Entity class + staging mapping | DMF import positive + negative | Data package XML |
| Extension (EXT-NNN) | * Extension overview | * CoC method walkthrough + pseudocode | Per-method positive + negative | - |
| Operation / Batch (OPR-NNN) | * Batch overview + frequency | * Class + idempotency + failure path | Run-to-completion + resume-on-failure | Job parameter doc |
| Integration (INT-NNN) | * Endpoint contract | * Service class + auth + Key Vault refs | Inbound + outbound contract tests | OpenAPI spec |
| Security (SEC-NNN) | * Privilege matrix | * Role/duty/privilege definitions | Positive + negative access tests | - |
| Workflow (WFL-NNN) | * Process diagram | * Workflow class + branching | Per-branch test | - |
| Business Document (BDC-NNN) | * Template + sample output | * Print mgmt setup + ER refs | Generated-output sample | Sample data |

The `*` marker is the **mandatory section marker** - downstream commands like `/tdd` refuse to advance if `*`-marked sections are empty or contain `<TBD>`.

## Change control

- Every change to an existing object documented in the per-feature TDD §12 Issues / Open Items
- Breaking changes (renames, deletions, type changes) flagged BLOCKER in the review checklist
- Backward-compatibility considerations explicit per change

## Non-negotiable principles

- **No silent modification** of base F&O objects (Principle 1 in [01-architectural-principles.md](01-architectural-principles.md))
- **No hard-coded credentials** anywhere (Key Vault references only per [05-development-and-alm.md](05-development-and-alm.md))
- **No undocumented extensions** - every `_Extension` class has a TDD section explaining what it changes and why
- **Quality Checklist** mandatory at end of every TDD (self-review enforcement per [00-charter.md](00-charter.md))

## Source attribution

Full mandatory-artefact catalogue PORTED from predecessor's `05-documentation-and-change.md` per R16. Queued as bk-026.
