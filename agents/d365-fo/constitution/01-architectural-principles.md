---
agent: d365-fo
sub-domain: architecture
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
status: "structure-ported; full verbatim body queued as bk-026"
---

# F&O Architectural Principles

> PORTED structure from a battle-tested predecessor delivery framework per [design/agents/d365-fo.md](../../../design/agents/d365-fo.md) R16. Full verbatim body content lands in **bk-026** authoring.

## Principle 1 - Extension over Modification

Never modify base F&O code. All customisations are **extensions** via the supported extension framework:

- Tables: table extensions (add fields, not modify)
- Forms: form extensions (add controls, not modify)
- Classes: Chain-of-Command (CoC) extensions
- Reports: ER extensions or report extensions

If a requirement appears to demand modification, log an Open Question with the justification + the supported alternative.

## Principle 2 - Config-first 5-level priority

Decision tree when sizing any requirement:

1. **Module setup / parameter** (no code; pure configuration)
2. **Data entity / business rule / workflow** (declarative)
3. **Workflow framework** (F&O native workflow)
4. **Extension (CoC / table extension / form extension)** (custom X++ code)
5. **Service class + integration** (cross-system; warrants `integration` agent handoff)

Always pick the lowest level that satisfies the requirement. Document the choice in the FDD §8 OOB-first Decision Log.

## Principle 3 - Minimum footprint

Each feature touches the minimum set of objects necessary. Avoid scope creep into adjacent modules. When cross-module work is genuinely needed, document the cross-module touch points explicitly and align with the affected module's owner.

## Principle 4 - Batch design

Long-running operations MUST run as batch jobs. Real-time threshold: 30 seconds for AOS interactive operations. Batch design checklist:

- Resumable on failure
- Idempotent per record (re-running doesn't double-process)
- Logged per record (success / failure / skipped)
- Failure path: dead-letter queue or skip-with-log

## Principle 5 - Upgrade compatibility

Every extension is forward-compatible with F&O service updates:

- Don't depend on internal members (use `public` API only)
- Don't subclass sealed base classes
- Use feature-management flags for behaviour that depends on F&O version

## Cross-reference

- Object-type-specific standards per artefact: [03-object-type-standards.md](03-object-type-standards.md)
- X++ coding standards: [04-extension-coding-standards.md](04-extension-coding-standards.md)
- NFR targets: [08-nfr-targets.md](08-nfr-targets.md)
