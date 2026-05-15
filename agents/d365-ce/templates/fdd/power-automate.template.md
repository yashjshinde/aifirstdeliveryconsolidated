<!--
power-automate.template.md - SUB-PLATFORM PACK
Body content per [constitution/05-power-automate-standards.md].

NOTE: CE-bound flows ALSO appear in model-driven.template.md §4.7 (per R19 A5).
This sub-platform pack covers STANDALONE Power Automate flows (not triggered by Dataverse).
-->

## §4 UI / Functional design — Power Automate sub-platform (standalone flows)

### §4.PA.1 Flow inventory (standalone)

<!-- feature-id: {feature-slug} -->

| Flow Name | Trigger Type (Recurrence / HTTP / Manual) | Solution Layer | feature-id |
|---|---|---|---|

### §4.PA.2 Per-flow detail

For each flow:

- **Trigger** (recurrence cadence + timezone; HTTP method + auth; manual schema)
- **Key actions** (high-level; not every action — that lives in TDD)
- **Variables initialised**
- **Error path** (exception child flow + retry policy)
- **Idempotency note** (is the flow re-runnable safely?)
- **Concurrency** (limit; whether `Apply to each` is parallel or sequential)
- **Cross-flow dependencies** (child flows called)

### §4.PA.3 Child flows used

| Child Flow Name | Called By | Purpose | feature-id |
|---|---|---|---|

### §4.PA.4 Connection references

| Connection Ref | Connector | Used in flows | feature-id |
|---|---|---|---|

### §4.PA.5 Environment variables consumed

| EnvVar | Type | Used in flows | feature-id |
|---|---|---|---|

### §4.PA.6 Boundary check with integration agent

If a standalone flow grows into a multi-step orchestration with custom-connector calls or external-API dependencies, evaluate moving it to a Logic App (Standard) in the integration agent's domain (per `constitution/05-power-automate-standards.md` boundary rules). Document the decision per feature in §4.PA.6:

| Flow | Stayed in Power Automate? | Reason | Handoff to integration? | feature-id |
|---|---|---|---|---|
