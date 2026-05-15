---
mode: agent
description: "Create a single Azure DevOps Test Plan. Triggers on: 'create test plan', 'new test plan', 'test-create-plan'."
---

Create a single Azure DevOps Test Plan.

## Usage

```
/alm-test-create-plan {name}
```

## Steps

1. Read `constitution/10-alm-configuration.md` — load: area-path, iteration-path.
2. Call MCP tool `ado_create_test_plan`:
   - `name`: {name}
   - `area_path`: from constitution
   - `iteration`: from constitution

3. Print:

```
CREATED — Test Plan
════════════════════
Plan ID : {id}
Name    : {name}
Root Suite ID: {rootSuiteId}

Next step: Run /alm-test-create-suite {id} {suite-name} to add test suites.
```
