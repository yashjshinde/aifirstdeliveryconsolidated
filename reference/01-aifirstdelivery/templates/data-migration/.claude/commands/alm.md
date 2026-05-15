Synchronise work items and test plans between the agent's local files and Azure DevOps.

## Usage

```
/alm extract {migration-id}
/alm sync {migration-id} {uid} {alm-id}
/alm sync-all {migration-id}
/alm get {migration-id} {alm-id}
/alm push-tests {migration-id}
```

---

## /alm extract {migration-id}

Extract work item data for a migration and prepare it for ADO import.

### Steps

1. Read `constitution/10-alm-configuration.md`.
2. Read `plans/{migration-id}/work-items.yaml`.
3. Produce `output/{migration-id}/alm/extract-{timestamp}.json`:

```json
{
  "migration": "{migration-id}",
  "generatedAt": "{timestamp}",
  "adoProject": "{project}",
  "areaPath": "{area_path}",
  "items": [
    {
      "uid": "E001",
      "type": "Epic",
      "title": "...",
      "tags": "...",
      "alm_id": null
    }
  ]
}
```

4. Print:

```
ALM EXTRACT — {migration-id}
════════════════════════════════════════
File   : output/{migration-id}/alm/extract-{timestamp}.json
Items  : {N} (E:{N} F:{N} US:{N} T:{N})

Import this file into Azure DevOps, then use:
  /alm sync {migration-id} {uid} {alm-id}   ← single item
  /alm sync-all {migration-id}              ← bulk (requires alm-mapping.csv)
```

---

## /alm sync {migration-id} {uid} {alm-id}

Update a single work item's `alm_id` in `work-items.yaml` and the corresponding task card.

### Steps

1. Read `plans/{migration-id}/work-items.yaml`.
2. Find the item with `uid: {uid}`.
3. Set `alm_id: {alm-id}`.
4. Write updated `work-items.yaml`.
5. If `tasks/{migration-id}/` contains a card with `**ID:** {uid}`, update `**ALM ID:**` field.
6. Print confirmation.

---

## /alm sync-all {migration-id}

Bulk sync from a CSV mapping file.

### Steps

1. Read `output/{migration-id}/alm/alm-mapping.csv` (format: `uid,alm_id`).
2. For each row, apply the same logic as `/alm sync`.
3. Print summary: `{N} items synced, {N} not found`.

---

## /alm get {migration-id} {alm-id}

Fetch a work item from ADO and save the response.

### Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call MCP tool `ado_get_work_item`:
   - `id`: {alm-id}
3. Save response to `output/{migration-id}/alm/get-{alm-id}-{date}.json`.
4. Print: Title, State, Type, Area Path, Iteration Path, Story Points.

---

## /alm push-tests {migration-id}

Create test plan and test cases in ADO from the test plan document.

### Steps

1. Read `constitution/10-alm-configuration.md`.
2. Read `docs-generated/{migration-id}/test-plan-and-strategy.md`.
3. Call `ado_create_test_plan`:
   - `name`: `{migration-id} — Test Plan`
   - `area_path`: {area_path}
   - `iteration`: {iteration_path}

4. For each suite section, call `ado_create_test_suite`:
   - `plan_id`: {plan-id from step 3}
   - `name`: {suite name}
   - `suite_type`: StaticTestSuite

5. For each test case, call `ado_create_test_case`:
   - `title`: {TC title}
   - `steps`: {steps formatted as HTML}
   - `area_path`: {area_path}

6. Call `ado_add_test_case_to_suite` for each case.

7. Update `docs-generated/{migration-id}/test-plan-and-strategy.md`:
   - Replace `**Plan ALM ID:** *(pending)*` → `**Plan ALM ID:** #{plan-id}`
   - Replace suite `**Suite ALM ID:** *(pending)*` → `**Suite ALM ID:** #{suite-id}`
   - Replace test case `ALM ID: *(pending)*` → `ALM ID: #{tc-id}`

8. Print:

```
ALM TEST PUSH COMPLETE — {migration-id}
════════════════════════════════════════
Plan ID    : #{plan-id}
Suites     : {N} created
Test Cases : {N} created
Failed     : {N}

test-plan-and-strategy.md updated with ALM IDs.
```
