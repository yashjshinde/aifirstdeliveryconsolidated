---
agent: d365-fo
sub-domain: alm-config
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
status: "structure-ported; full verbatim body queued as bk-026"
---

# F&O ALM Configuration

> ALM tool, work-item hierarchy, field / priority / status maps for F&O work. PORTED structure per R16; full content in bk-026.

## Work-item hierarchy

Per `project.config.yaml alm.hierarchy` (typically `[Epic, Feature, "User Story", Task]` for ADO; `[Initiative, Epic, Story, "Sub-task"]` for JIRA).

F&O feature -> ALM mapping:

| F&O artefact | ADO type | JIRA type |
|---|---|---|
| FDD §1 Feature scope | Feature (L2) | Epic |
| Each `*`-marked TDD section per object | User Story (L3) | Story |
| Each unit-of-work in the build plan | Task (L4) | Sub-task |
| Per-object change log | (linked work item) | (linked issue) |

## Field map

| F&O / spec field | ADO field | JIRA field |
|---|---|---|
| Object-ID (EXT-NNN / DEN-NNN / etc.) | Custom field "Object-ID" | Custom field "Object-ID" |
| Module | Area Path | Component |
| Estimated hours | Original Estimate | Original Estimate |
| Priority | Priority (1-4) | Priority (Highest-Lowest) |
| Status | State (New / Active / Resolved / Closed) | Status (To Do / In Progress / Done) |

## Status transitions

| Local state | ADO state | JIRA state |
|---|---|---|
| draft | New | To Do |
| approved (post `/clarify`) | Active | In Progress |
| implemented | Resolved | Done |
| documented (post `/document`) | Closed | Closed |

## Priority map

Per `project.config.yaml alm.priorityMap`:

| Local label | ADO Priority | JIRA Priority |
|---|---|---|
| critical | 1 | Highest |
| high | 2 | High |
| medium | 3 | Medium |
| low | 4 | Low |

## /alm-extract output for d365-fo

The handoff produced by `/alm-extract` carries:
- Spec FRs as Epic / Feature work items
- TDD `*`-marked sections as User Stories
- Task cards as Tasks
- Object-IDs (EXT-NNN etc.) preserved as a custom field on each work item
- Section IDs (FR-NN / TS-NN / TC-NN) preserved as section-refs per work-items.v1 schema

## Source attribution

Full ALM-configuration matrix PORTED from predecessor's `10-alm-configuration.md` per R16. Queued as bk-026.
