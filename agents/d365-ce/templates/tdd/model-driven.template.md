<!--
model-driven.template.md — TDD SUB-PLATFORM PACK
Assembled into _index.template.md by /tdd per ADR-0005 when project.config.yaml has modelDriven in scope.
Sections filled here populate §5 (Model-driven technical design) of the unified domain TDD.
-->

## §5 Model-driven technical design

### §5.1 Entity model (schema, alternate keys, plugin registrations)

For each entity introduced or extended:

<!-- feature-id: {feature-slug} -->

| Schema name | Logical name | Primary attribute | Alternate keys | Audit | Duplicate-detection | feature-id |
|---|---|---|---|---|---|---|

### §5.2 Columns (per entity, per feature)

| Entity | Schema name | Display name | Type | Required | Default | Calculated/Rollup formula | feature-id |
|---|---|---|---|---|---|---|---|

### §5.3 Relationships

| From entity | To entity | Type (1:N / N:1 / N:N) | Cascading | feature-id |
|---|---|---|---|---|

### §5.4 Plugin registrations

| Plugin class | Message | Primary entity | Stage | Mode (sync/async) | Filtering attributes | Pre-image / Post-image | feature-id |
|---|---|---|---|---|---|---|---|

#### §5.4.1 Plugin pseudocode

For each plugin class (per [constitution/01-model-driven-standards.md § Plugins](../../constitution/01-model-driven-standards.md)):

```
class {PluginClass} : IPlugin {
  Execute(IServiceProvider sp) {
    target = sp.GetTarget<Entity>()
    preImage = sp.GetPreImage()
    // 1. Validate input (typed exceptions per §4.2)
    // 2. Apply business rule
    // 3. Update related records (idempotent — re-entrancy guarded)
  }
}
```

### §5.5 JavaScript web resources

| Web resource name | Entity binding | Events bound | Functions | feature-id |
|---|---|---|---|---|

#### §5.5.1 JS pseudocode

For each web resource function:

```
function {fnName}(formContext) {
  // Pre-conditions
  // Main logic (calls Xrm.WebApi for data ops)
  // Error handling per §4.2
}
```

### §5.6 Custom Workflow Activities

| Activity class | Inputs | Outputs | feature-id |
|---|---|---|---|

### §5.7 Business rules (form-side, declarative)

Cross-reference [§4.6.2 of FDD](../fdd/model-driven.template.md#§462-business-rules-form-side); TDD captures the implementation-level scope.

| Entity | Form | Rule name | Implementation (BR/JS/Plugin) | feature-id |
|---|---|---|---|---|

### §5.8 BPF (Business Process Flow) configuration

| BPF name | Primary entity | Stages | Stage entries | Branching logic | feature-id |
|---|---|---|---|---|---|

### §5.9 Views

| Entity | View name | Type | Visible columns | Fetch XML reference | feature-id |
|---|---|---|---|---|---|

### §5.10 Security

| Role name | Privilege deltas | FLS Profiles | Hierarchy security | feature-id |
|---|---|---|---|---|

### §5.11 Solution metadata

| Solution name | Layer (base/extension) | Components added | Publisher prefix | feature-id |
|---|---|---|---|---|

### §5.12 Open items

`<TBD>` placeholders left in this pack — surfaced into the FDD §1.5 Open Questions roll-up.

| Item | Owner | Resolution by | feature-id |
|---|---|---|---|
