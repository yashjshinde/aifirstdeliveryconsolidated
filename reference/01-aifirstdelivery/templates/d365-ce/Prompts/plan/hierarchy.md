# Plan Hierarchy Definitions — D365 CE

Use these definitions when decomposing a spec into the plan hierarchy.

## Feature
The top-level deliverable. Corresponds to one functional specification.
A feature delivers a complete, user-visible capability.
Example: "Account Loyalty Points"

## Epic
A major technical workstream within the feature.
An epic groups stories that share a deployment unit or functional area.
An epic should be completable in one sprint cycle.
Examples: "Data Model", "Business Logic (Plugins)", "UI Enhancements", "Integrations"

## User Story
A single unit of user-facing value, written from a persona's perspective.
Format: "As a {persona}, I want {action}, so that {value}."
A story should be implementable within one developer-day to three developer-days.
Example: "As a Sales Rep, I want to see loyalty points on the Account form, so that I can tailor my pitch."

## High-Level Task
A discrete technical unit of work that produces one or more D365 CE artefacts.
A task maps to exactly one component type (Plugin, Web Resource, Schema Change, etc.).
A task should be implementable by one developer without collaboration dependencies mid-task.
Tasks are WHAT to build — they do not prescribe code; that comes in the /task command.

## Component Types for D365 CE Tasks

| Type | When to Use |
|---|---|
| Plugin | Server-side business logic on Dataverse operations |
| Web Resource (JS) | Client-side form behaviour, validation, navigation |
| Web Resource (HTML) | Embedded web pages in forms or dashboards |
| PCF Control | Custom field or dataset visualisation |
| Flow | Automated process: approval, notification, integration trigger |
| Schema Change | New/modified tables, columns, relationships, option sets |
| Configuration | Security roles, views, charts, dashboards, site map |
| Integration | Outbound call to external system from plugin or flow |
