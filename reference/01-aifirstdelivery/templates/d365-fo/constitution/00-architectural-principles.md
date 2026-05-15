# Constitution — Architectural Principles

These principles apply to every D365 F&O deliverable. Every command must enforce them before generating any design, code, or plan output.

## 1 — Extension Over Modification

Never modify Microsoft base objects. Always extend.

Rules:
- Use CoC (Chain of Command) to extend class methods — never modify the original class
- Use table extensions to add fields — never modify the original table
- Use form extensions to add/modify controls — never modify the original form
- No overlayering under any circumstances — it is a constitution blocker
- If a Microsoft object is sealed or cannot be extended, raise it as a Technical Risk in the TDD with an alternative approach

## 2 — Configuration First

Solve requirements with D365 F&O standard configuration before writing X++.

Priority order:
1. **Parameters and Setup** — Financial parameters, procurement parameters, module setup tables
2. **Standard Workflows** — D365 F&O native workflow engine for approval processes
3. **Standard Alerts** — OOB alert framework for change notifications
4. **Business Events** — standard D365 Business Events for integration triggers before writing custom code
5. **X++ Extension** — only when standard configuration provably cannot meet the requirement

Flag any FR that skips levels without justification as a Constitution Risk in the FDD review.

## 3 — Minimum Footprint

Build only what is required. No gold-plating, no speculative generality.

Rules:
- Every custom object must map to a specific business requirement — no objects "for future use"
- Every object must be registered in the Object Register before development begins (ref: `01-governance-and-objects.md`)
- Objects classified Very Complex require Solution Architect approval before development starts
- Retire objects that are no longer required — do not leave dead code in the solution

## 4 — Performance-Conscious Batch Design

Every batch job must be designed for performance from the start.

Rules:
- Use `SysOperation` framework for all batch processing — no direct `Batch` class inheritance without TL approval
- Batch tasks must be designed to run in parallel using `SysOperationServiceController` task bundles where the business data allows
- Avoid `select` statements inside loops — use `join` or set-based operations
- No `sleep()` calls in synchronous paths — use event-driven or batch scheduling
- Batch jobs processing > 10,000 records must include a progress indicator and support restart-from-checkpoint
- State the expected throughput target (records/hour) in the TDD for every batch object

## 5 — Upgrade Compatibility

Every custom object must survive a Microsoft One Version update without manual rework.

Rules:
- No hard dependencies on sealed Microsoft classes — use public APIs and extension points only
- No use of internal/private Microsoft methods — flag as a Technical Risk in the TDD if no public alternative exists
- No hardcoded `DataAreaId` references — use `curExt()` or pass it as a parameter
- Every TDD must include an Upgrade Risk section listing any Microsoft objects referenced that could change

## 6 — Object Categorisation Compliance

Every deliverable must be classified and registered before development begins.

Rules:
- Assign an Object-ID from the correct category prefix (EXT, DEN, INT, etc.) per `01-governance-and-objects.md`
- Object category drives the applicable standards file in `02-object-type-standards.md`
- Complexity estimate requires peer review for Medium and above
- No development work begins on an unregistered object
