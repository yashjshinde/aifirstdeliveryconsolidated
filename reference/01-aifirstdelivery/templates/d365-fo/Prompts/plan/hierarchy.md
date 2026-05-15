# Plan Hierarchy Definitions — D365 F&O

The D365 F&O plan is **flat** — there is no Feature/Epic/Story/Task hierarchy. Every item in the plan is a directly implementable X++ object or configuration task.

## Plan Structure

```
Requirement (Epic in ALM)
  └── Object-001 (Task in ALM)
  └── Object-002 (Task in ALM)
  └── Object-NNN (Task in ALM)
```

Each plan item maps to exactly **one** of the ten object categories and exactly **one** object type from the 32-type catalogue.

## Object Categories and Typical Plan Items

| Category | Prefix | Typical plan items |
|---|---|---|
| Extensions | EXT | Form Extension, Table Extension, New Class, Event Handler Class, CoC Extension, New Table, New Form, Batch Job |
| Data Entities | DEN | Data Entity Extension, New Data Entity |
| Security Roles | SEC | New Security Role, Security Role Extension, Role Definition Sheet |
| Power Platform | PPL | Power Automate Flow, Canvas App |
| Retail Extensions | RET | POS Extension, HWS Extension, CRT Extension |
| Workflows | WFL | New Workflow Type, Workflow Approval, Workflow Category |
| Business Documents | BDC | New GER Configuration, New SSRS Business Document |
| Analytical Reports | ANR | Power BI Report |
| Operational Reports | OPR | New SSRS Operational Report |
| Integrations | INT | Integration Class, Interface Logic Class, Azure Resource Configuration |

## Sizing Rules

When estimating complexity, every item must match the constitution definitions:

| Complexity | T-Shirt | Criteria |
|---|---|---|
| Very Simple | XS | Pure configuration; no X++ |
| Simple | S | Single small extension, single field, no logic |
| Medium | M | Limited X++; moderate business logic; clear rules |
| Complex | L | Significant X++; batch; cross-module; multiple integration endpoints |
| Very Complex | XL | Enterprise-grade; multiple systems; real-time integration; SA design review required |

## Sequencing Rules

Always sequence to resolve dependencies before the objects that need them:

1. Base Enums and EDTs before any object that references them
2. New Tables before Classes and Form Extensions that query or display them
3. Table Extensions before Data Entities built on those extensions
4. Security Privileges before Security Duties; Duties before Roles
5. Data Entities before Integration classes that use them as transport
6. Integration Infrastructure (Bicep/App Registration/Key Vault config) before Interface Logic classes
