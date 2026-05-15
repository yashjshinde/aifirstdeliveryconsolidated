<!--
power-automate.template.md — TDD SUB-PLATFORM PACK (Power Automate cloud + desktop)
Assembled into _index.template.md by /tdd when project.config.yaml has powerAutomate in scope.
Sections here populate §9 (Power Automate technical design) of the unified domain TDD.
-->

## §9 Power Automate technical design

### §9.1 Cloud flow catalogue

<!-- feature-id: {feature-slug} -->

| Flow name | Trigger type (Automated / Instant / Scheduled) | Trigger source | Owner connection | Run-only users | feature-id |
|---|---|---|---|---|---|

### §9.2 Connection references

| Connection reference | Connector | Auth | Used by flows | feature-id |
|---|---|---|---|---|

### §9.3 Child flows

Child-flow pattern per [constitution/05-power-automate-standards.md § Child flows](../../constitution/05-power-automate-standards.md):

| Parent flow | Child flow | Input schema | Output schema | feature-id |
|---|---|---|---|---|

### §9.4 Error handling

Standardised "Catch failure" scope on every parent flow:

```
Try scope:
  ... main logic ...
Catch scope (configure run-after = has failed/timeout):
  - Log to Dataverse "flow-run-log" entity
  - Notify Teams channel via webhook (when severity = HIGH)
  - Set flow output Status = "Failed"
```

### §9.5 Trigger filters (efficiency)

For Dataverse triggers, set trigger conditions to filter at the connector level:

| Flow | Trigger condition expression | Filter purpose | feature-id |
|---|---|---|---|

### §9.6 Desktop flows (RPA)

| Flow name | Target machine group | Triggers | Steps summary | feature-id |
|---|---|---|---|---|

### §9.7 Environment variables consumed

| Variable name | Data type | Default | Consumers | feature-id |
|---|---|---|---|---|

### §9.8 Open items

| Item | Owner | Resolution by | feature-id |
|---|---|---|---|
