Enhance structured ALM work items (L1/L2/L3) from your ALM tool into a Data Migration specification.
Use this command when migration requirements already exist as work items in Azure DevOps, Jira, or a similar tool
and the L1/L2/L3 hierarchy must be preserved. The plan command (structured mode) will map Tasks directly
to your existing work items — it will NOT recreate the L1/L2/L3 hierarchy.

## Usage

```
/spec-alm {migration-id}
```

## Pre-condition Check

1. Read `constitution/10-alm-configuration.md`.
2. Check `requirement-intake`. If it is not `structured`, stop:
   ```
   INTAKE MODE: UNSTRUCTURED
   ════════════════════════════════════════════
   constitution/10-alm-configuration.md has:
     requirement-intake: unstructured

   Use /spec for plain-language requirements.
   To switch modes, set requirement-intake: structured in
   constitution/10-alm-configuration.md.
   ```

2b. Read `l3-intake` from `constitution/10-alm-configuration.md`.
    - If absent, treat as `required` (default).
    - If `required`: every L2 in the input must have at least one L3 item. After parsing (step 5), stop if any L2 has no L3:
      ```
      L3 INTAKE INCOMPLETE
      ════════════════════════════════════════════
      l3-intake: required but {L2-ALM-ID} "{L2 Title}" has no L3 items.

      Options:
        1. Provide L3 (User Story) items for all L2 branches in the input.
        2. Set l3-intake: optional in constitution/10-alm-configuration.md
           to allow /plan to generate missing L3 stories.
      ```
    - If `optional`: L3 may be absent or partially provided — continue. `/plan` will generate L3 stories for any L2 with no coverage.

## Input Format

The user provides their ALM work items in one of these formats:

| Format | Example |
|---|---|
| Pasted table | `ALM ID \| Level \| Type \| Title \| Description \| AcceptanceCriteria` |
| Indented list | `EP-001 Feature title > FT-001 Epic title > US-001 Story title` |
| CSV export | Azure DevOps, Jira, ServiceNow, or similar export |
| Plain hierarchy | `L1: {title} / L2: {title} / L3: {title}` with optional IDs |
| wi-export JSON | `output/wi-export-{id}-{date}.json` — produced by the ALM agent `/wi-export` command |

> **Note:** `description` and `acceptanceCriteria` fields from ADO may contain raw HTML. The normalisation step (4b) handles this automatically.

If ALM IDs are not provided in the input, assign placeholders: `{L1-TYPE}-NNN`.

## Steps

3. Read ALL files in `constitution/` — treat every rule as a hard constraint.
4. Read the ALM hierarchy configuration from `constitution/10-alm-configuration.md`:
   - L1 type name and prefix (e.g., Epic / EP)
   - L2 type name and prefix (e.g., Feature / FT)
   - L3 type name and prefix (e.g., User Story / US)
   - `migration.direction` — determines which analysis sections to generate
4b. **Normalise HTML in description and acceptanceCriteria fields** — ADO stores rich-text fields as HTML.
    Before parsing, convert HTML to plain text:
    - Decode HTML entities: `&lt;` → `<`, `&gt;` → `>`, `&amp;` → `&`, `&nbsp;` / `&#160;` → space
    - For table cells (`<td>` / `<th>`): preserve content with ` | ` between cells and a newline between rows
    - For list items (`<li>`): prefix each with `- `
    - Strip all remaining HTML tags
    - Collapse multiple consecutive spaces and blank lines; trim leading/trailing whitespace
    Apply this normalisation to every `description` and `acceptanceCriteria` field before using the content in steps 5–7.
5. Parse the provided work items:
   - Identify all L1, L2, L3 items with their ALM IDs, titles, descriptions, and acceptance criteria
   - Build the parent-child tree: L1 → L2 → L3
   - Preserve ALM IDs exactly as provided — they will be referenced by `/plan`
   - **If `l3-intake: optional`:** For any L2 with no L3 items in the input, record it as a pending L2: set `source: pending` in the `alm-ids` YAML front matter and write `pending` as the Source column value in the Traceability Matrix. Do not stop — `/plan` will decompose it into L3 stories.
   - **If `l3-intake: required`:** Apply the L3 completeness check from step 2b now.
6. Determine `{migration-id}` slug from the L1 title: lowercase, hyphen-separated.
7. For each L3 item, enhance the description:
   - Generate MR-NNN migration requirements inferred from the story description
     (sequential across the entire spec — not reset per L2 or L3)
   - **Acceptance Criteria:** If the ALM item provides acceptance criteria, preserve them verbatim first, then add further Given/When/Then scenarios (minimum total 2: one positive, one failure scenario). If no AC is provided in the ALM item, generate from the story description.
   - Identify Migration Impact: ADF pipelines, SQL tables, Dataverse entities, SFTP files affected
   - Identify Data Mapping requirements (source fields → target fields) if derivable from the story
   - Flag Non-Functional Considerations (volume, latency, retry, encryption)
   - Flag Constitution Risks if any requirement conflicts with a constitution rule

   **If `l3-intake: optional` and a L2 has no L3 items (pending):**
   - Do NOT generate MR-NNN from the L2 description — MRs for this branch will be produced by `/plan`
   - Write a pending placeholder block in §6 under the L2 heading:
     ```
     ##### *(Pending) {L3-Type}: to be defined during planning*
     **ALM ID:** *(pending)*
     **Status:** No L3 items were provided for this L2 branch.
     `/plan` will decompose {L2-ALM-ID} into {L3-Type} stories and generate Tasks.
     ```

8. Generate the spec using `specs/_template-structured.md` as the authoritative structure.
   - Populate the `alm-ids` front matter with every L1/L2/L3 ALM ID and title
   - For each L3 entry in `alm-ids`, tag it with `source: alm`
   - **If `l3-intake: optional`:** also set `l3-intake: optional` in the front matter; for each pending L2 add a placeholder entry under `alm-ids.L3` with `id: "(pending)"`, `source: pending`, and `parent-l2: {L2-ALM-ID}`
   - **If `l3-intake: required`:** set `l3-intake: required` in the front matter (or omit — it defaults to required)
   - Preserve the original work item title and description verbatim before each enhancement
   - Set `intake: structured` in the YAML front matter
   - Set `direction` from `constitution/10-alm-configuration.md`
   - In the ALM Traceability Matrix, add a `Source` column — `alm` for provided L3s, `pending` for gaps
9. Write to `specs/{migration-id}/spec.md`.
10. Print summary:
    ```
    SPEC-ALM COMPLETE — {migration-id}
    ════════════════════════════════════
    Intake mode  : structured (L3: {required|optional})
    Direction    : {direction}
    {L1-Type}    : {n}  (IDs: {list})
    {L2-Type}    : {n}  (IDs: {list})
    {L3-Type}    : {n} from ALM{, {n} pending — to be created by /plan}
    MR-NNN       : {n} migration requirements generated
    Open Qs      : {n}
    Output       : specs/{migration-id}/spec.md

    Next step: /review {migration-id}
    ```

## What the Spec Must Preserve

- Every L1/L2/L3 ALM ID must appear in the spec exactly as provided
- The hierarchy (L1 → L2 → L3) is reflected in the heading levels of the requirements section
- The original title and description of each work item appear verbatim before the enhancement
- Where acceptance criteria are provided in the ALM item, they are preserved verbatim before any generated AC
- MR-NNN numbering is sequential across the entire spec — never reset per L2 or L3
- Every ALM-provided L3 (`source: alm`) must map to at least one MR-NNN in the ALM Traceability section — pending placeholders (`source: pending`) are exempt; MR-NNN will be generated by `/plan`

## What the Spec Must Add Per L3

| Element | What to generate |
|---|---|
| MR-NNN requirements | Migration requirements inferred from the story — minimum 1 per L3 |
| Acceptance Criteria | ALM-provided AC preserved verbatim first; generated Given/When/Then to reach minimum 2 (success + failure) per L3 |
| Migration Impact | ADF pipelines, SQL tables, Dataverse entities, SFTP files affected |
| Data Mapping Hints | Source→target field mappings if stated or derivable |
| Non-Functional | Volume, latency, retry, encryption specifics |
| Constitution Risks | Any requirement that conflicts with a constitution rule |

## Rules

- Do NOT invent requirements — only enhance what was stated or directly inferrable from the ALM items
- Do NOT create new L1 or L2 IDs — preserve the ALM IDs exactly as provided
- **If `l3-intake: required`:** Do NOT create new L3 IDs — preserve all L3 ALM IDs exactly as provided
- **If `l3-intake: optional`:** Do NOT create new L3 IDs in `/spec-alm` — mark any missing L3 as pending: set `source: pending` in the YAML `alm-ids` front matter and `pending` in the Traceability Matrix Source column; `/plan` will generate them
- Do NOT reorganise the hierarchy — the L1/L2/L3 structure from the ALM tool is the authority
- Spec is functional only — no ADF JSON, no SQL DDL, no technical implementation detail
- Flag `intake: structured` in the YAML front matter — `/plan` reads this to determine mode
- Flag `l3-intake: required` or `l3-intake: optional` in the YAML front matter — `/plan` reads this to know whether to generate L3 stories for pending branches
- **AI Notes:** At the end of each major section and at the end of each individual FR block, append `> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or constitution risk flagged}`. Write only what is non-obvious — never summarise the section content.
