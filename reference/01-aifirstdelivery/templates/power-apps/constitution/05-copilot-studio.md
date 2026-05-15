# Constitution — Copilot Studio Standards

## Topic Design
- One topic = one intent — do not create multi-purpose topics
- Topic name: `{Action} {Subject}` (e.g., `Check Order Status`, `Raise Support Ticket`)
- Every topic must have a clear trigger phrase set (minimum 5 variations)
- System topics (Escalate, End Conversation, Fallback) must be customised — never left as default

## Conversation Design
- Use **adaptive cards** for structured data display — not plain text tables
- Maximum 3 questions per topic before confirming or escalating
- Always provide a way to restart or go back — never trap users in a dead-end branch
- Use **entities** for slot-filling — do not parse raw text with manual conditions

## Entities
- Use **prebuilt entities** where available (date, time, number, email)
- Custom entity name: `{Subject}Entity` (e.g., `ProductCategoryEntity`)
- List entities must be maintained — stale values break intent matching

## Variables
- Global variable name: `gbl_{Purpose}` (e.g., `gbl_CustomerEmail`)
- Topic variable name: `tp_{Purpose}` (e.g., `tp_OrderNumber`)
- Clear global variables at the end of the session — do not carry state across unrelated conversations

## Actions and Power Automate Integration
- Use **Power Automate flows** for all external data access — no direct connector calls in topics
- Flow called from Copilot must use the `When a copilot calls a flow` trigger
- Flow name: `{OrgPrefix} Copilot — {Purpose}`
- Always handle flow failure in the topic with a user-facing error message

## Escalation
- Every copilot must have a working escalation path to a human agent or channel
- Escalation topic must pass conversation transcript to the agent
- Do not let a copilot loop endlessly on failed intent — fall back after 2 retries

## Testing
- Every topic must have at least 3 test conversations in Test Canvas before publishing
- Test: happy path, no-match fallback, escalation path
