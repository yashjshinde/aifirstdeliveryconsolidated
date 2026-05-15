<!--
Scaffolding starter for agents/{agent}/templates/test-plan/suite.template.md.
Per-suite file. Holds all test cases for that suite inline regardless of count.
File path convention: test-plan/suites/NN-{slug}.md
-->
---
suite-id: S{NN}
parent-feature: {feature-slug}
schema-version: test-suite.v1
---

# Test Suite S{NN} â€” {Suite Name}

## Description

Scope of this suite. What it covers, what it deliberately doesn't.

## Common setup

Pre-conditions that apply to every test case in this suite (env setup, data prep, user roles configured).

## Common teardown

Post-conditions / cleanup steps that apply to every test case.

---

## Test cases

### S{NN}-TC-001 â€” {test case title}

**Description:** One-line summary.

**Preconditions:**
- ...

**Test data:**
- ...

**Steps:**

| # | Action | Expected | Data |
|---|---|---|---|
| 1 | ... | ... | ... |
| 2 | ... | ... | ... |

**Priority:** 1 (per `project.config.yaml alm.priorityMap.critical`)
**Test type:** Functional / Negative / Security / Multilingual / Performance / Accessibility / E2E / Regression
**Automated:** Y / N
**Owner:** {role or person}
**Tags:** [tag1, tag2]

**Traceability:** Covers FR-01, FR-02 (AC-01.1, AC-02.3)

---

### S{NN}-TC-002 â€” ...

(Repeat structure for each TC in the suite.)

