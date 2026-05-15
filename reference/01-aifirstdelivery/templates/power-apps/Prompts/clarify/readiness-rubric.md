# Task Readiness Rubric — Power Apps

For each task in the plan, evaluate every criterion below.

## Component Type (BLOCKER if missing)
- Is the component type exactly one of: CanvasApp | ModelDrivenApp | Flow | CopilotTopic | DataverseSchema | SecurityRole | Configuration?

## Artefact Specificity

### Canvas App Task
- Is the screen name specified?
- Is the data source / Dataverse table named?
- Is the delegation status of any Filter/Sort assessed?

### Flow Task
- Is the trigger type specified? (Automated / Scheduled / Instant)
- Is the Dataverse table or event specified?
- Is the connection reference name identified?
- Is error handling approach stated?

### Model-Driven App Task
- Is the form/view/dashboard name specified?
- Is the target entity named?
- For Business Rules: are conditions and actions described?

### Copilot Topic Task
- Are trigger phrases listed (at least 3 examples)?
- Is the Power Automate action named (if data access needed)?
- Are branching conditions described?

### Schema Task
- Table name, column name, data type, required/optional, description — all present?

### Security Role Task
- Table name and privilege level (User/BU/Parent-BU/Org/None) for each permission?

## FR Traceability (REQUIRED)
- Does the task reference at least one FR-NNN?

## Dependency Clarity (REQUIRED)
- Are all prerequisite tasks listed (e.g., schema must exist before flow can use the table)?

## Ambiguity Check (QUESTION level if any found)
- Would a developer need to make any assumption to start this task?
- Are there conditional branches not described? (e.g., "if the record exists, then...")
- For Canvas App: are delegation risks for Filter/Sort documented?
- For Flow: are error handling paths described (what happens on connector failure)?
- Are there any terms that could be interpreted more than one way?

## Complexity Check
- Is the task XL? If so, recommend splitting into subtasks of M or L.
- A task is XL if it touches more than 2 artefacts or would take more than 2 days.

## Output Location (BLOCKER)
- Is the output path in `output/{feature}/src/` derivable?
