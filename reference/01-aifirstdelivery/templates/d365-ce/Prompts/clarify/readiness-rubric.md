# Task Readiness Rubric — D365 CE

For each high-level task in the plan, evaluate every criterion below.
A single BLOCKER fails the task. Multiple QUESTIONs do not block but must be listed.

## Component Type (BLOCKER if missing)
- Is the component type explicitly stated? (Plugin / Web Resource / PCF / Schema / Flow / Config)
- Is there exactly one component type per task, or is the task too broad?

## D365 CE Artefact Specificity (BLOCKER if missing)
- For **Plugin**: Is the entity schema name, message, and stage (Pre/Post/PreValidation) specified?
- For **Web Resource**: Is the entity, form name, and event (OnLoad/OnChange/OnSave) specified?
- For **PCF**: Is the target entity and column the control binds to specified?
- For **Flow**: Is the trigger (record creation/update/schedule/HTTP) and target entity specified?
- For **Schema Change**: Are table name, column name, data type, and required/optional stated?

## Functional Requirement Traceability (REQUIRED)
- Does the task reference at least one FR-NNN from the spec?

## Dependency Clarity (REQUIRED)
- Are all task dependencies listed?
- Are there any implicit dependencies not listed (e.g., schema must exist before plugin can use it)?

## Ambiguity Check (QUESTION level if any found)
- Would a developer need to make any assumption to start this task?
- Are there conditional branches not described? (e.g., "if the field exists, otherwise...")
- Are there any terms that could be interpreted more than one way?

## Complexity Check
- Is the task XL? If so, recommend splitting into subtasks of M or L.
- A task is XL if it touches more than 2 artefacts or would take more than 2 days.

## Output Location (BLOCKER if missing)
- Is the output path in `output/{feature}/src/` derivable from the task description?
