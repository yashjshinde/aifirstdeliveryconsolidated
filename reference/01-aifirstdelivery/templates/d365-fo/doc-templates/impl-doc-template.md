# Implementation Record — {Object-ID}: {Object Name}

## Document Control

| Field | Value |
|---|---|
| Object-ID | {Object-ID} |
| Requirement | {requirement-name} |
| Implemented By | Claude Code (/implement) |
| Date | {YYYY-MM-DD} |
| Status | {COMPLETE \| PARTIAL \| BLOCKED} |

---

## Table of Contents

- [Object Details](#object-details)
- [Implementation Summary](#implementation-summary)
- [Artefacts Created](#artefacts-created)
- [Configuration Steps](#configuration-steps)
- [Build Status](#build-status)
- [Deviations from TDD](#deviations-from-tdd)
- [Manual Steps Required Before Testing](#manual-steps-required-before-testing)
- [Test Evidence](#test-evidence)
- [Linked Artefacts](#linked-artefacts)

---

## Object Details

| Field | Value |
|---|---|
| Object-ID | `{e.g., EXT-001}` |
| Object Name | `{technical name}` |
| Object Category | `{Extensions / Data Entities / Integrations / Security Roles / Workflows / …}` |
| Object Type | `{Form Extension / New Class / Table Extension / …}` |
| Module | `{module code, e.g., AR / PO / WHS}` |
| Requirement | `{requirement-name}` |
| FDD Reference | `{FDD section, e.g., Section 9}` |
| TDD Reference | `{TDD section, e.g., Section 5.6.1}` |
| Complexity | `{Very Simple / Simple / Medium / Complex / Very Complex}` |
| T-Shirt | `{XS / S / M / L / XL}` |
| Implemented By | `<TBD>` |
| Implementation Date | `{YYYY-MM-DD}` |

---

## Implementation Summary

_What was built or configured. One paragraph per major decision or design choice made during implementation._

`<TBD>`

---

## Artefacts Created

| Path | Type | Description |
|---|---|---|
| `output/{req}/src/{ObjectType}/{ObjectName}.xpp` | X++ Source | `<what this file contains>` |

---

## Configuration Steps

_For non-code objects (Very Simple / Configuration-only). List each manual step in sequence._

| Step | Action | D365 Screen / Location | Expected Result |
|---|---|---|---|
| 1 | `<TBD>` | `<TBD>` | `<TBD>` |

---

## Build Status

| Check | Result | Notes |
|---|---|---|
| X++ compilation | PASS / FAIL / N/A | `<compiler output or N/A>` |
| No code warnings | PASS / FAIL / N/A | `<any warnings>` |
| Label references valid | PASS / FAIL / N/A | |
| AVA naming convention | PASS / FAIL / N/A | |
| No prohibited patterns | PASS / FAIL / N/A | `<list if any found>` |

---

## Deviations from TDD

_List any difference between what the TDD specified and what was actually implemented. "None" is the expected and preferred entry._

| TDD Specification | Actual Implementation | Reason |
|---|---|---|
| None | None | — |

---

## Manual Steps Required Before Testing

_Steps that must be completed by a developer or sys admin before the object can be tested in the environment._

| Step | Description | Who | Notes |
|---|---|---|---|
| 1 | Deploy X++ code to DEV environment | Developer | Via Visual Studio → Deploy |
| 2 | `<TBD>` | `<TBD>` | |

---

## Test Evidence

_Acceptance criteria sign-off. One row per acceptance criterion from the FDD._

| AC-ID | Description | Evidence | Status |
|---|---|---|---|
| AC-001 | `<criterion from FDD>` | `<test steps or screenshots>` | PASS / FAIL / PARTIAL |

---

## Linked Artefacts

| Artefact | Path |
|---|---|
| FDD | `docs/{req}/fdd.md` |
| TDD | `docs/{req}/tdd.md` |
| Plan | `plans/{req}/plan.md#{Object-ID}` |
| ALM Work Item | `alm-id: {null or ID}` |
