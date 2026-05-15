# Project Configuration

## Brownfield Baseline

Configures whether this solution blueprint incorporates documentation from an existing system
documented by the `d365-ce-brownfield` agent.

```ini
[brownfield]
enabled:   false
docs-path: ../d365-ce-brownfield/docs-generated
```

| Setting | Default | Description |
|---|---|---|
| `enabled` | `false` | Set to `true` to read brownfield docs before synthesis |
| `docs-path` | `../d365-ce-brownfield/docs-generated` | Relative path (from this template folder) to the brownfield agent's `docs-generated/` output |

### What changes when `enabled: true`

| Command | Brownfield behaviour |
|---|---|
| `/solution-blueprint` | Reads brownfield architecture docs as an As-Is Baseline input layer; incorporates existing components in Section 0 (Baseline Sources), Section 3.2 (Logical Architecture differentiates existing vs new), Section 4.2 (notes existing Dataverse entities to avoid re-documenting), and Section 8 (adds backward compatibility risks) |
| `/solution-review` | Checks that Section 0 includes a Brownfield Baseline subsection and that Section 8 contains at least one backward compatibility risk entry |

### Brownfield documents read (in order)

| File | Used for |
|---|---|
| `component-inventory.md` | Existing component types and counts — feeds Section 0 Baseline Sources table |
| `entity-catalogue.md` | Existing Dataverse entities — deduplication baseline for Section 4.2 Data Architecture |
| `technical-overview.md` | Existing technical architecture — context for Section 3 Logical Architecture |
| `solution-blueprint.md` | Existing architecture docs — as-is topology for Section 3.2 diagram |
| `dependency-map.md` | Existing component dependencies — informs cross-template dependency synthesis in Section 5.3 |
| `integration-topology.md` | Existing integration topology — baseline for Integration Architecture (Section 5) |

All files are optional — skip silently if absent.
