<!--
pcf.template.md — TDD SUB-PLATFORM PACK (PCF controls)
Assembled into _index.template.md by /tdd when project.config.yaml has pcf in scope.
Sections here populate §8 (PCF technical design) of the unified domain TDD.
-->

## §8 PCF technical design

### §8.1 Control catalogue

<!-- feature-id: {feature-slug} -->

| Namespace.ControlName | Type (Field / Dataset / Standard) | Target entity / form / view | Display name | feature-id |
|---|---|---|---|---|

### §8.2 Manifest (per control)

For each control, per [constitution/04-pcf-standards.md § Manifest](../../constitution/04-pcf-standards.md):

```xml
<manifest>
  <control namespace="..." constructor="..." version="1.0.0" display-name="...">
    <property name="..." ... />
    <resources>
      <code path="index.ts" />
      <css path="css/{control}.css" />
    </resources>
  </control>
</manifest>
```

### §8.3 Lifecycle (per control)

For each control:

```typescript
class {Control} implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  init(context, notifyOutputChanged, state, container): void {
    // bind inputs, create DOM, attach handlers
  }
  updateView(context: ComponentFramework.Context<IInputs>): void {
    // re-render on input change
  }
  getOutputs(): IOutputs {
    // return values flowing back to the form
  }
  destroy(): void {
    // cleanup
  }
}
```

### §8.4 Build + test harness

Per [constitution/04-pcf-standards.md § Test](../../constitution/04-pcf-standards.md):

| Control | Test command | Test framework | Coverage target | feature-id |
|---|---|---|---|---|

### §8.5 Solution layering

PCF controls land in the extension solution layer; never in base.

### §8.6 Open items

| Item | Owner | Resolution by | feature-id |
|---|---|---|---|
