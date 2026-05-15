---
agent: d365-ce
sub-platform: testing
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Testing Standards for d365-ce

> Per-artifact testing approach across the 5 sub-platforms.

## Mandatory test categories (per design/06-templates.md)

Enforced by `doc_lint` (`coverage-report.md` auto-generated on every `/test-plan` run):

- **Functional** — always required
- **Negative** — always required

Per `project.config.yaml unitTestPolicy.*`:

- **Security** — typically required when there's any custom security model
- **Multilingual** — required when `multilingual.crm` or `multilingual.portal` is true
- **Performance** — optional in v1
- **Accessibility** — required for any UI artifact (forms, Canvas, Pages, PCF)
- **E2E** — optional in v1; recommended for cross-sub-platform journeys

## Testing approach per artifact type

| Artifact | Framework | Coverage target |
|---|---|---|
| **Plugin** | FakeXrmEasy | Every public method; every `Execute` branch; per-message tests |
| **JavaScript web resource** | Jest + Xrm shim | Every handler function (OnLoad / OnSave / OnChange / control-level) |
| **PCF control** | Jest + PCF test harness | Every lifecycle method; every public property setter; render-output assertion |
| **Canvas app** | Test Studio (Power Fx) | Happy-path navigation per screen; error state per external call |
| **Power Pages** | Manual + Liquid template render tests | Table permission enforcement per role (positive + negative); auth flows |
| **Power Automate flow** | Test mode in Test environment + synthetic triggers | Trigger conditions met; happy-path data shape; error path |
| **Business Rule** | Manual via the CE designer + form-load JS assertions | When form-side: covered by JS Jest tests |
| **BPF** | Manual + form-load JS state assertions | Stage advancement per scenario |
| **Classic workflow** | Manual via the Workflow designer + system job inspection | Per-trigger; sync vs async paths |

## Test plan layout

Per [design/06-templates.md](../../../design/06-templates.md) test-plan section — `/test-plan` produces a folder, not a single file:

```
projects/{p}/d365-ce/features/{f}/test-plan/
  index.md
  suites/
    01-functional-happy-path.md
    02-functional-negative.md
    03-security.md          (when unitTestPolicy security: required)
    04-multilingual.md      (when multilingual.* applies)
    05-accessibility.md     (for UI features)
  coverage-report.md        AUTO-GENERATED
  traceability.yaml         machine-readable for ALM sync
```

## Test case ID convention

Per-suite numbering: `S{NN}-TC-{NNN}` (e.g., `S01-TC-001`). Suite prefix avoids ripple renumbering when suites are added.

## Self-service test data

- Use the `tools/scaffold/` (when extended) or per-project seed scripts to generate test data into a Dev / Test environment.
- Never check real customer data into the repo. Use synthesised data with realistic shape.

## Pre-`/validate` gate

The `/validate` command refuses to advance to TASK_VALIDATED unless:
- `coverage-report.md` has 0 BLOCKERs (Functional + Negative coverage gaps)
- All task cards have a corresponding test case (traced via `traceability.yaml`)
- `unitTestPolicy` requirements are met per artifact type

Override: `/validate --force-skip-gate` (logged loudly; surfaces in `/status` per [design/04-workflow-gates.md](../../../design/04-workflow-gates.md)).
