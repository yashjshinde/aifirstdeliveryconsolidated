---
mode: agent
description: "Write ALM Work Item IDs back into ALL project documents for a domain feature. Updates work-items.yaml, plan.md, task cards, and spec.md Section 13. Triggers on: 'sync work items', 'write alm ids', 'wi-sync'."
---

Write ALM Work Item IDs back into ALL project documents for a domain feature.
Updates: work-items.yaml, plan.md, task cards, and spec.md Section 13 Traceability Matrix.

## Usage

```
/alm-wi-sync {domain} {feature}
```

## Steps

1. Read `constitution/10-alm-configuration.md` — load: organization, project, domain paths.
2. Locate the latest ALM response file: `{domain-path}/output/{feature}/alm/alm-response-*.json` (take most recent by filename timestamp).
   - If none found: stop with "No alm-response file found. Run /alm-wi-create-bulk {domain} {feature} first."
3. Read the response file. Build a map: `uid → alm-id`.
4. Read `{domain-path}/plans/{feature}/work-items.yaml`.

### Step A — Update work-items.yaml

For each entry in the uid → alm-id map:
- Find the item in work-items.yaml where `uid` matches.
- Set `alm-id: {alm-id}`.
- Track: updated count, not-found count.

Write the updated work-items.yaml.

### Step B — Update plan.md

Read `{domain-path}/plans/{feature}/plan.md`.

For each uid → alm-id pair, identify the item level from work-items.yaml:

- **Level 1 / 2 / 3 items:** Find the heading line containing the item's `id` (e.g., `## L1-001 —` or `### L2-001 —`). On the line(s) following it, replace:
  - `**ALM ID:** *(pending)*` → `**ALM ID:** {alm-id}`
  - If `**ALM ID:**` is not present, add the line after the heading.

- **Level 4 (Task) items:** Find the task row in the `##### Tasks` table where the first column matches the task ID. Replace `*(pending)*` in the ALM ID column with `{alm-id}`. Also update the matching row in the `# 2. Task Inventory` section if it exists.

Write the updated plan.md.

### Step C — Update task cards

For each Level 4 item with a matched alm-id:
- Locate the task card file at `{domain-path}/tasks/{feature}/{task-id}.md` (or scan `{domain-path}/tasks/{feature}/` for a file whose front matter `task-id` matches).
- In the YAML front matter, set `alm-id: {alm-id}`.
- Write the updated task card.

### Step D — Update spec.md Section 13 Traceability Matrix

Read `{domain-path}/specs/{feature}/spec.md`.

Build a FR → ALM IDs map from the updated work-items.yaml:
- For each work item where `alm-id` is set and `fr-refs` is non-empty:
  - For each FR ID in `fr-refs` (e.g., `FR-001`): add the `alm-id` to that FR's list.
- Result: `{ "FR-001": ["10001", "10002"], "FR-002": ["10003"], ... }`

Locate Section 13 in spec.md. The traceability matrix header looks like:
```
| FR ID | Requirement Title | ... |
```

Update the traceability matrix:
- If the header row does not contain an "ALM Work Item IDs" column, add it as the last column.
- For each FR row: find the FR ID in the first column, populate the ALM Work Item IDs cell with the comma-separated alm-ids from the map (e.g., `#10001, #10002`). If no alm-ids exist for this FR, leave the cell as `—`.
- Update the header separator row to add a `---` cell for the new column.

Write the updated spec.md.

**Note:** If `specs/{feature}/spec.md` does not exist (some domain structures differ), skip this step and note it in the sync report.

### Sync report

```
SYNC COMPLETE — {feature}
══════════════════════════════════════
Domain     : {domain}
Total UIDs : {N}

work-items.yaml   : {N} updated  {N} not found
plan.md           : {N} updated  {N} not found
Task cards        : {N} updated  {N} not found
spec.md Section 13: {N} FRs updated  {N} FRs with no linked items

Details:
  {uid}  →  #{alm-id}  ✓
  {uid}  →  NOT FOUND  ✗

Files written:
  {domain-path}/plans/{feature}/work-items.yaml
  {domain-path}/plans/{feature}/plan.md
  {domain-path}/tasks/{feature}/{task-id}.md  (N files)
  {domain-path}/specs/{feature}/spec.md
```
