<!--
canvas.template.md - SUB-PLATFORM PACK
Assembled into _index.template.md by /fdd when project.config.yaml has canvas in scope.
Body content per [constitution/02-canvas-app-standards.md].
-->

## §4 UI / Functional design — Canvas sub-platform

### §4.C.1 Canvas app inventory

<!-- feature-id: {feature-slug} -->

| App Name | Purpose | Primary Persona | Screens (count) | feature-id |
|---|---|---|---|---|

### §4.C.2 Screens per app

For each Canvas app:
- Screen list with one-line purpose per screen
- Navigation flow (Mermaid flowchart showing screen-to-screen transitions)
- Per-screen Power Fx complexity hint (Simple / Medium / Complex)

### §4.C.3 Connectors used

| Connector | Premium? | Auth model | Rate limits | feature-id |
|---|---|---|---|---|

### §4.C.4 Components from the library

| Component | Library | Inputs | Outputs | feature-id |
|---|---|---|---|---|

### §4.C.5 Environment variables consumed

| EnvVar | Type | Purpose | feature-id |
|---|---|---|---|

### §4.C.6 Delegation considerations

When `StartsWith` / `Filter` exceeds the delegation limit on a data source, document the chosen mitigation (Top N + paging, server-side query via connector, custom connector) per feature.

| Source | Operation | Delegation status | Mitigation | feature-id |
|---|---|---|---|---|

## §6 Security additions (Canvas-specific)

### §6.C.1 App share roles

| App | Shared with (AAD groups / roles) | Privilege (User / Co-owner) | feature-id |
|---|---|---|---|

### §6.C.2 Connection reference role mappings

| Connection Ref | Role | Action | feature-id |
|---|---|---|---|
