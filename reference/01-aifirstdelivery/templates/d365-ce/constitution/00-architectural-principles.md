# Constitution — Architectural Principles

These principles apply to every D365 CE solution. Every command must enforce them before generating any design, code, or plan output.

## 1 — Configuration First

Prefer configuration over customisation. Solve with out-of-the-box features before writing code.

Priority order:
1. **OOB configuration** — Business Rules, Views, Forms, Workflows (no code)
2. **Low-code customisation** — Power Automate, Power Fx, Canvas Apps
3. **Pro-code extension** — Plugins, PCF Controls, JavaScript web resources
4. **Custom code only as last resort** — when OOB and low-code cannot meet the requirement

Flag any FR that skips levels without justification as a constitution risk.

## 2 — Loose Coupling

Components must communicate through platform-provided abstractions — never through direct database connections or internal API bindings.

Rules:
- No direct SQL or cross-database queries — use Dataverse APIs only
- No point-to-point REST calls between custom components — route via Dataverse events, Service Bus, or APIM
- No shared state through the file system or in-memory caches across plugin executions
- Plugin and flow dependencies on external systems must be documented as Integration Points in the TDD

## 3 — Idempotent Operations

Every plugin, flow step, and integration operation must produce the same result if executed more than once with the same input.

Rules:
- Check for existing records before creating — use alternate keys or a known unique field
- Use `upsert` (`CreateOrUpdate`) in integrations rather than blind create
- Never trigger side effects (emails, approvals) without a guard flag or state check
- Document the idempotency mechanism in the FR or TDD for every outbound call

## 4 — Solution Layering Compliance

Every customisation must sit in the correct solution layer. Never place customisations in the default or base layer.

Refer to `01-solution-design.md` for solution naming and layering rules.

## 5 — Dataverse as System of Record

Dataverse is the authoritative store for all business data within the CE solution.

Rules:
- Do not replicate master data into external databases for operational use — query Dataverse
- Data synchronised from external systems must land in Dataverse before being used in CE processes
- Reporting extracts are the only permitted copy of CE data outside Dataverse, and must be read-only
