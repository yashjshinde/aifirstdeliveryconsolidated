# Constitution — Architectural Principles

These principles apply to every Power Platform solution. Every command must enforce them before generating any design, configuration, or code output.

## 1 — Configuration First

Solve requirements with platform configuration before writing code. Follow the priority order:

1. **OOB configuration** — Business Rules, standard views/forms, OOB workflows, Power Automate standard connectors
2. **Low-code** — Power Fx formulas, Power Automate cloud flows, Copilot Studio topics
3. **Pro-code** — Plugins, PCF Controls, JavaScript web resources
4. **Pro-code only as last resort** — when OOB and low-code provably cannot meet the requirement

Flag any FR that skips levels without justification as a Constitution Risk in the spec.

## 2 — Delegation Awareness

Every data query in a Canvas App must be delegation-safe for the expected data volume.

Rules:
- Identify delegation status of every Filter/Sort/Search expression at design time
- If a table is expected to exceed 500 rows, all queries filtering it must delegate to the server
- Non-delegable operations must be explicitly flagged as Delegation Warnings in the TDD
- Never use `CountRows(Filter(...))` on large tables — use `CountIf` with a delegable expression or a Dataverse aggregate query
- Document the delegation analysis per screen in the TDD

## 3 — Reusable Child Flows

Shared business logic must live in a child flow — not duplicated across multiple parent flows.

Rules:
- Any logic used in more than one flow must be extracted into a named child flow
- Child flows must be in the same solution as their parent flows
- Child flows must be documented in the TDD with inputs, outputs, and error behaviour
- Never call a child flow from outside its solution without an explicit API layer

## 4 — Solution Layering

Every customisation must sit in a named managed solution — never in the Default Solution.

Rules:
- No components in the Default Solution — they cannot be transported or versioned
- Use a base solution for shared schema (tables, global option sets) and a feature solution for app components
- Dependent solutions must be documented in the TDD
- Refer to `07-devops-alm.md` for solution naming and ALM standards

## 5 — Dataverse as System of Record

Dataverse is the authoritative store for all business data in the Power Platform solution.

Rules:
- Do not replicate master data into SharePoint lists, Excel files, or external databases for operational use
- Canvas apps display and collect data — they do not own the data store
- Data synchronised from external systems must land in Dataverse before being used in Power Platform processes
- Reporting extracts are the only permitted copy outside Dataverse, and must be read-only

## 6 — Connection References Always

Flows must use connection references — not personal or embedded connections.

Rules:
- Every connector in every flow must reference a named Connection Reference
- Connection References must be owned by a service account, not an individual user
- No flow may reference the flow creator's personal connection — this breaks deployment
- Document every Connection Reference in the TDD Solution and ALM Design section
