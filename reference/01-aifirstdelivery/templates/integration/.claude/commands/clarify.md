Review an integration technical plan for task-readiness.

## Steps

1. Read all files in `constitution/`.
2. Identify the feature. If not specified, ask.
3. Read `plans/{feature-name}/plan.md`.
4. Evaluate each task against `Prompts/clarify/readiness-rubric.md`.
5. Generate report using `plans/_clarify-template.md`.
6. Write to `plans/{feature-name}/clarify.md`.
7. Print verdict: `TASK-READY`, `PARTIALLY READY`, or `NOT READY`.

## Integration-Specific Checks

For each task, also verify:
- Are all Azure resource names defined?
- Is the message schema defined (for Service Bus tasks)?
- Is the retry policy specified (for all outbound calls)?
- Is the Managed Identity role assignment explicitly listed?
- Are environment-specific parameters identified (for Bicep tasks)?
- Is the error handling approach stated (DLQ / alert / retry)?

## Rules

- **AI Notes:** In the generated clarify report, at the end of each BLOCKER and QUESTION finding entry, append `> **AI Notes** — {1–2 sentences: key ambiguity identified, the assumption a developer would make if unresolved, or rationale for the readiness verdict on this task}`. Write only what is non-obvious.