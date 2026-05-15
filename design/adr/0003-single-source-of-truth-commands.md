---
adr: 0003
title: Single source of truth — commands authored only in agents/{a}/.claude/commands/
status: accepted
decided-on: 2026-05-14
design-doc-refs: [02-agent-skeleton.md, 12-publish-pipeline.md]
---

# ADR-0003 — Single source of truth: commands authored in agents/{a}/.claude/commands/ only

## Status

`accepted` — decided 2026-05-14.

## Context

Per ADR-0002, the platform must produce four delivery surfaces (Claude standalone + root-unified, GHCP standalone + root-unified) from a single authored source. The choice of **which directory** holds the authored source determines:

- How agent authors locate the file they should edit
- What naming convention drives all four generated outputs
- Whether the file is callable as-is when an agent folder is opened in isolation

Two reasonable options exist: author in a Claude-native location (`.claude/commands/`) or author in a tool-neutral location (e.g., `commands/` at the agent root, transformed twice into Claude and GHCP).

## Decision

Commands are authored **only** in `agents/{a}/.claude/commands/*.md` — the Claude-native location.

- This is the source-of-truth path. The Publish Pipeline (ADR-0011) reads from here and produces the three derivative surfaces (Claude root-unified, GHCP standalone, GHCP root-unified).
- Opening `agents/{a}/` in Claude Code with no build step makes the command immediately invokable as `/spec`, `/plan`, etc. — no installation, no transformation required.
- The same file's frontmatter and body are reused by the GHCP transformation (markdown → prompt file with chatmode wrapper).

## Alternatives considered

- **Tool-neutral `agents/{a}/commands/*.md`.** Reject — would require generating the Claude standalone surface too, breaking the zero-build promise for Claude users. Adds a generated `.claude/commands/` mirror that drifts from the authored neutral source.
- **Author in two places (Claude + GHCP) with sync.** Reject — bi-directional sync is a drift trap; one side eventually becomes stale. Single source eliminates the question entirely.
- **Author per surface (four parallel files).** Reject — see ADR-0002 alternatives.

## Consequences

**Positive:**
- Zero-build path for Claude single-agent users.
- One file to edit per command per agent. The pipeline does the rest.
- Generated outputs are read-only and drift-checked: a hand-edit of a generated file fails CI.

**Negative:**
- GHCP single-agent users must run the publish pipeline once to materialise their prompt files (acceptable — same applies to any plugin install).
- The Claude-native location bias is explicit. Tools that don't speak the Claude command file format (frontmatter + body conventions) must adapt at publish time.

**Affected design docs:** [02-agent-skeleton.md](../02-agent-skeleton.md), [12-publish-pipeline.md](../12-publish-pipeline.md).

## References

- Related ADRs: [ADR-0002](0002-dual-mode-delivery-surfaces.md), [ADR-0011](0011-publish-pipeline-8-job-model.md)
