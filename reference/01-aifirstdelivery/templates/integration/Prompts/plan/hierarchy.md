# Plan Hierarchy Definitions — Azure Integration

Use these definitions when decomposing a spec into the plan hierarchy.

## Feature

The top-level deliverable. Corresponds to one functional specification.
A feature delivers a complete, user-visible integration capability end-to-end.
Example: "Order Event Processor"

## Epic

A major technical workstream within the feature.
An epic groups stories that share a deployment unit or functional area.
An epic should be completable in one sprint cycle.
Examples: "Infrastructure (Bicep)", "Message Processing (Functions)", "API Layer (APIM)", "Schema & Contracts"

## User Story

A single unit of user-facing or integration-facing value, written from a persona's perspective.
Format: "As a {persona}, I want {action}, so that {value}."
A story should be implementable within one developer-day to three developer-days.
Example: "As the Fulfilment Service, I want to receive order events from the e-commerce system, so that I can trigger downstream processing automatically."

## High-Level Task

A discrete technical unit of work that produces one or more Azure Integration artefacts.
A task maps to exactly one component type (Function, Logic App, Bicep, etc.).
A task should be implementable by one developer without collaboration dependencies mid-task.
Tasks are WHAT to build — they do not prescribe code; that comes in the `/task` command.

## Component Types for Azure Integration Tasks

| Type | When to Use |
|---|---|
| AzureFunction | Compute — event-driven processing, HTTP-triggered API handlers, scheduled jobs |
| LogicApp | Orchestration — multi-step workflows, human approval steps, SaaS connector chains |
| ServiceBusSchema | Message contract — JSON Schema definition + C# DTO class for a Service Bus message |
| APIMPolicy | API gateway — JWT validation, rate limiting, RFC 7807 error normalisation, routing |
| BicepIaC | Infrastructure — Azure resource provisioning, role assignments, parameter files per environment |
| Configuration | Non-code setup — App Settings, Key Vault secret names, connection strings via Key Vault reference |
| Integration | Cross-system wiring — documenting the binding between two systems (e.g., Service Bus trigger → Function) |
