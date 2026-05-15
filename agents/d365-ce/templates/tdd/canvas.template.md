<!--
canvas.template.md — TDD SUB-PLATFORM PACK (Canvas apps)
Assembled into _index.template.md by /tdd when project.config.yaml has canvas in scope.
Sections here populate §6 (Canvas technical design) of the unified domain TDD.
-->

## §6 Canvas technical design

### §6.1 App catalogue

<!-- feature-id: {feature-slug} -->

| App name | Display name | Type (Canvas / Component library) | Target form factor | feature-id |
|---|---|---|---|---|

### §6.2 Screens

For each Canvas app, per screen:

| App | Screen name | Purpose | OnVisible logic summary | feature-id |
|---|---|---|---|---|

### §6.3 Controls + Power Fx formulas

| App | Screen | Control name | Type | Key Power Fx formula | feature-id |
|---|---|---|---|---|---|

### §6.4 Data sources / connectors

| App | Connector | Auth mode | Connection-reference name | feature-id |
|---|---|---|---|---|

### §6.5 Components

For canvas components / component libraries (per [constitution/02-canvas-app-standards.md § Components](../../constitution/02-canvas-app-standards.md)):

| Component library | Component name | Input properties | Output properties | feature-id |
|---|---|---|---|---|

### §6.6 Theming

Custom theme variables, brand alignment, accessibility (contrast ratio, screen reader behaviour).

### §6.7 Pseudocode for non-trivial Power Fx

```
// Example: paginated server-call pattern
ClearCollect(MyData,
  Filter(
    Records, IsBlank(SearchText) || StartsWith(Name, SearchText)
  ));
```

### §6.8 Open items

| Item | Owner | Resolution by | feature-id |
|---|---|---|---|
