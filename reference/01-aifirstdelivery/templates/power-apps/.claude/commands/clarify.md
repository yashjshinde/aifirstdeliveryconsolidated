Review a Power Platform technical plan for task-readiness.

## Steps

1. Read all files in `constitution/`.
2. Identify the feature. If not specified, ask.
3. Read `plans/{feature-name}/plan.md`.
4. Evaluate each task against `Prompts/clarify/readiness-rubric.md`.
5. Generate report using `plans/_clarify-template.md`.
6. Write to `plans/{feature-name}/clarify.md`.
7. Print verdict: `TASK-READY`, `PARTIALLY READY`, or `NOT READY`.

## Power Apps-Specific Checks

For each task also verify:
- For **Canvas App**: is the screen name and data source specified? Is delegation risk assessed?
- For **Flow**: is the trigger, connector, and connection reference identified?
- For **Model-Driven**: is the form/view name and entity specified?
- For **Copilot Topic**: are trigger phrases and the Power Automate action named?
- For **Schema**: is the table, column, type, and required/optional state defined?
- For **Security Role**: is the exact privilege level (User/BU/Org) stated per table?

## Rules

- **AI Notes:** In the generated clarify report, at the end of each BLOCKER and QUESTION finding entry, append `> **AI Notes** — {1–2 sentences: key ambiguity identified, the assumption a developer would make if unresolved, or rationale for the readiness verdict on this task}`. Write only what is non-obvious.