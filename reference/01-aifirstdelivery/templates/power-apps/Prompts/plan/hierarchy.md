# Plan Hierarchy Definitions — Power Platform

Use these definitions when decomposing a spec into the plan hierarchy.

## Feature

The top-level deliverable. Corresponds to one functional specification.
A feature delivers a complete, user-visible Power Platform capability.
Example: "Customer Request Tracker"

## Epic

A major technical workstream within the feature.
An epic groups stories that share a deployment unit or functional area.
An epic should be completable in one sprint cycle.
Examples: "Data Model (Dataverse Schema)", "User Interface (Canvas App)", "Automation (Flows)", "Self-Service (Copilot Studio)"

## User Story

A single unit of user-facing value, written from a persona's perspective.
Format: "As a {persona}, I want {action}, so that {value}."
A story should be implementable within one developer-day to three developer-days.
Example: "As a Customer Service Agent, I want to log a new customer request from the canvas app, so that the team can track and resolve it."

## High-Level Task

A discrete technical unit of work that produces one or more Power Platform artefacts.
A task maps to exactly one component type (Canvas App, Flow, Copilot Topic, etc.).
A task should be implementable by one maker or developer without collaboration dependencies mid-task.
Tasks are WHAT to build — they do not prescribe formulas or flow actions; that comes in the `/task` command.

## Component Types for Power Platform Tasks

| Type | When to Use |
|---|---|
| CanvasApp | Custom user interface — screens, galleries, forms built in Power Apps Studio |
| ModelDrivenApp | Data-centric interface — forms, views, dashboards driven by Dataverse schema |
| Flow | Automated process — Power Automate cloud flow: approval, notification, integration trigger |
| CopilotTopic | Conversational AI — Copilot Studio topic: trigger phrases, nodes, branching, escalation |
| DataverseSchema | Data model — new/modified tables, columns, relationships, option sets, calculated fields |
| SecurityRole | Access control — Dataverse security role, column security profile, Azure AD group mapping |
| Configuration | Non-code setup — environment variables, connection references, solution settings, DLP exceptions |
