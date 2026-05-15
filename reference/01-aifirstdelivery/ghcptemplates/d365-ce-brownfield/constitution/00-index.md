# D365 CE Brownfield — Constitution Index

Every agent command MUST read all files in this folder before generating any output.
These rules define how to analyse artefacts, what to document, and how to write the output.

## Files

| File | Covers |
|---|---|
| `00-architectural-principles.md` | How to approach brownfield analysis; inference rules; what to flag vs. what to document |
| `01-input-file-types.md` | How to interpret each input file type: solution XML, C# plugins, JavaScript, PCF TypeScript, Power Automate JSON, Azure Functions, Logic Apps, Word/PDF docs |
| `02-analysis-rules.md` | Rules for extracting meaning from code: plugin triggers, JS events, data flows, dependency detection; mandatory source-reading steps per component type |
| `03-documentation-standards.md` | Tone, completeness, table formats, heading hierarchy, gap flagging, traceability; minimum content standards per component type; no-grouping rule |
| `04-integration-analysis.md` | How to read and document Azure Functions and Logic App definitions |
| `07-quality-rules.md` | **Quality enforcement** — prohibited patterns, self-check checklists, evidence chain requirements, documentation vs inventory distinction |
| `10-project-configuration.md` | Solution name, publisher prefix, environment details, ALM tool settings |

## How to Use

At the start of every command:
> "Read all files in constitution/ before proceeding. Every rule is a hard constraint.
>  If source artefacts conflict with each other, document both interpretations and flag for review.
>  Never invent behaviour — only document what is evidenced in the provided input files."

## Critical Quality Constraint

> `07-quality-rules.md` defines zero-tolerance rules that override any instinct to group, summarise, or abbreviate.
> When in doubt: document the individual component. Grouping is never acceptable.
