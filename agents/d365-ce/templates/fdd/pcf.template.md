<!--
pcf.template.md - SUB-PLATFORM PACK
Body content per [constitution/04-pcf-standards.md].
-->

## §4 UI / Functional design — PCF sub-platform

### §4.PCF.1 Control inventory

<!-- feature-id: {feature-slug} -->

| Control Name | Namespace | Type (Field / Dataset) | Bound Entity | Bound Field | feature-id |
|---|---|---|---|---|---|

### §4.PCF.2 Per-control manifest summary

For each control:

- **Manifest** (path to `ControlManifest.Input.xml`)
- **Bound properties** (typed; table: Name | Type | Required | Default)
- **Input properties** (configuration; same table shape)
- **Output properties** (when control supports two-way binding)
- **Lifecycle behaviour** (init / updateView / getOutputs / destroy summary in one line each)
- **External dependencies** (npm packages with justification)
- **Bundle size** (target: < 250 KB)

### §4.PCF.3 Form binding

| Form (Entity / Form Name) | PCF Control | Field bound | feature-id |
|---|---|---|---|

### §4.PCF.4 Accessibility

| Control | Keyboard nav? | Screen-reader labels? | WCAG 2.1 AA pass? | feature-id |
|---|---|---|---|---|

## §7 Entity Model impact (when a PCF binds to a specific entity / field)

Per-bound-attribute coverage notes — does the PCF's data interaction require additional fields, computed columns, or relationship paths beyond what the entity already exposes? Documented here.
