# Brownfield Analysis Principles

## Core Principle: Evidence Over Assumption

Every statement in generated documentation must be traceable to a specific input artefact.

- **DO** say: "The plugin `AccountPreCreatePlugin` validates the `pub_taxcode` field before record creation."
- **DO NOT** say: "The system likely validates tax codes to ensure compliance."

If intent cannot be determined from artefacts, use: "Purpose unclear from available artefacts — `⚠ NEEDS REVIEW`."

## Inference Rules

Inference is permitted when evidence is indirect but clear:

| Observation | Permitted Inference |
|---|---|
| Flow name "Notify Manager on Lead Assignment" | Flow sends a notification when a lead is assigned |
| Plugin registered on `Update` message with filtering attribute `statuscode` | Plugin fires only when status changes |
| Entity named `pub_CustomerSurveyResponse` with lookup to `contact` | Survey responses are captured per contact |
| Web resource named `pub_account_form.js` | JS file runs on the Account form |

Always mark inferences with *(inferred)* in the documentation.

## Conflict Resolution

When source artefacts contradict each other:
1. Plugin source code vs. solution XML registration → **prefer source code** as ground truth for logic; use XML for step metadata
2. Provided document vs. observed artefacts → **document both**, note the discrepancy
3. Multiple versions of a file → **use the most recently modified** and note date

## Flagging Conventions

Use these markers consistently across all generated documentation:

| Marker | Meaning |
|---|---|
| `⚠ NEEDS REVIEW` | Could not be interpreted from available artefacts |
| `⚠ UPGRADE RISK` | Likely to break on D365 platform upgrade |
| `⚠ SECURITY RISK` | Potential security concern (hard-coded credential, Org-level delete, client-side secret) |
| `⚠ TECHNICAL DEBT` | Deprecated API, unsupported pattern, or known anti-pattern |
| `⚠ ORPHANED` | No references found from other components — candidate for removal |
| `⚠ CIRCULAR DEPENDENCY` | A depends on B which depends on A |
| `⚠ UNCLEAR PERSONA` | Security role with no determinable business purpose |
| *(inferred)* | Interpretation not explicit in artefacts — derived from context |
| *(from: filename)* | Content sourced from provided document |

## Scope Boundaries

- This agent documents what exists — it does not redesign, refactor, or recommend rewrites (except in the Architecture Findings section of `/blueprint`)
- Recommendations must be scoped to: "consider addressing", "review before upgrade", "flag for security review" — not prescriptive solutions
- Do not document standard OOB D365 CE behaviour unless it has been customised

## Completeness Over Brevity

A brownfield document is only useful if it is complete. Partial documentation creates a false sense of understanding.
- Every entity must have every custom field documented — no truncation
- Every plugin class must have every step documented
- If a section would be very long, use collapsed sub-documents rather than omitting content
