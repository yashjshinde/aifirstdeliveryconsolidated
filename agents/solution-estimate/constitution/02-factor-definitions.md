---
agent: solution-estimate
version: 1.0.0
last-reviewed: 2026-05-14
owner: aggregator
---

# Factor Definitions — How to Apply the 103-Factor Catalogue

The full catalogue with hour rates and per-complexity descriptions lives in two files in `templates/`:

- [factor-rates.yaml](../templates/factor-rates.yaml) — VS/S/M/C/VC hour rates per factor
- [factor-definitions.md](../templates/factor-definitions.md) — per-factor complexity descriptions

This file describes **how the catalogue is applied** by `/estimate` when sizing requirements.

## The catalogue at a glance

**103 active factors** organised into 11 categories. Each factor has 5 complexity levels (VS, S, M, C, VC).

| # of factors | Category | Examples |
|---|---|---|
| 17 | CRM Core Dev & Customization | Entity, Plugin, Workflow Assembly, Business Rule, JS, Dashboard |
| 6 | Code / ASP.NET / Web Services | ASP.NET Page, Business Entity Component, Data Access Component, Web Service |
| 5 | Reports & Dashboards | SSRS / Power BI Report (new), CRM Report Wizard, Modify Report, Dashboard Config |
| 3 | Integration & Data Migration (SI) | ETL Package, Kingsway, ADF |
| 5 | Power Platform | Canvas Screen, Power Automate Flow, Portal Page Configuration / Styling, Portal Web Role |
| 15 | Sales Module | Account, Contact, Lead, Opportunity, Quote, Order, Invoice, Competitors, Product Catalog, etc. |
| 10 | Service Module | Case, Contract, Queue, Facility, Services Setup, KB, Subject Tree, etc. |
| 5 | Marketing Module | Campaign, Marketing Lists, Quick Campaigns, etc. |
| 6 | Core Foundation | Core Custom Entities, Email, KB Article, Mail Merge, Connections |
| 6 | UI / Navigation | Site Map, Multi-Currency, Ribbon, Command Bar, Role-Based Form, Mobile Form |
| 5 | Office / Integration Setup | Outlook Client, Offline Client, SharePoint, Activity Feeds, Bing Maps |
| 5 | Security | Security Role Base Config, Business Unit Hierarchy, FLS, User Setup, Access Teams |
| 7 | Process / Workflow / Misc | Workflow, Action, BPF, Business Rule, Dialogs, Duplicate Detection, Auditing |
| **8** | **Reintroduced (Integration / Power Platform / Reports / Security extensions)** | Azure Function, Integration (generic), Master Data Prep, Model Driven App Changes, PCF, Excel Report, ExperLogix Report, Hierarchy Security |

## 5-level complexity model (VS / S / M / C / VC)

| Level | Mnemonic | Typical scope hint |
|---|---|---|
| **VS** | Very Simple | Smallest unit; trivial mapping; no logic; OOB or near-OOB |
| **S** | Simple | One entity, one action, simple validation |
| **M** | Medium | Multiple entities OR moderate logic OR limited integration |
| **C** | Complex | Cross-entity logic OR async / batch concerns OR external dependencies |
| **VC** | Very Complex | State / security / performance-sensitive OR cross-system orchestration |

A blank (`-`) in the rate table for a level means **that factor does not define that complexity in the canonical source**. Do not assume 0; the rate is undefined. If a requirement clearly hits that level, log it in Open Questions and pick the nearest defined level with a note.

## Factor selection heuristic for `/estimate`

When sizing a requirement, the agent walks this decision tree:

1. **Is the requirement satisfied OOB / config / customization?** -> sets the Fitment column (per 03-fitment-classification.md).
2. **Which Module does it touch?** -> sets the Module column (per 04-categorization-rules.md). May be cross-module; pick the *primary* module and surface cross-module in Cross-Cutting notes.
3. **Which Inventory factor covers this work?** -> from the 103 catalogue, pick the factor that most precisely names the work product.
   - For mixed work (e.g., "case auto-assign needs both a plugin AND JS"), emit TWO rows (Rule 1).
4. **Which complexity tier?** -> match the requirement's scope hint against the per-factor descriptions in `factor-definitions.md`.
5. **Brownfield status?** -> if `project.config.yaml mode: brownfield` and the brownfield agent has produced `_brownfield/inventory.json`, look up this artifact's classification (NEW / EXTEND / REPLACE / REFERENCED). Otherwise `N/A`.
6. **Confidence level?** -> from the input source quality:
   - RFP title only -> Placeholder ±40%
   - RFP narrative -> Low ±30%
   - Spec with open Qs -> Medium ±20%
   - Spec, no open Qs -> High ±15%
   - Plan with full ACs -> Fully Detailed ±10%

## When no factor fits

If none of the 103 factors precisely covers the work, **do not invent a factor inline**. Instead, emit a row in `Estimation-Proposed-Factors.md` describing the proposed new factor + suggested rates + the requirements that would use it. The user reviews and decides whether to accept permanently or once.

## Project-level overrides

A project may override specific factor rates via `projects/{p}/_aggregator/estimation/factor-rates-override.yaml`. The override file is keyed by factor name and only needs to declare the rates that differ from the canonical catalogue. The agent merges canonical + override at run time, with override winning per the [ADR-0010](../../../design/adr/0010-templates-agent-owned.md) two-layer model.

## Module-detection (shared with brownfield agent)

The Module column is derived from a shared module-detection ruleset in [templates/module-detection.yaml](../templates/module-detection.yaml). This file is mirrored by the brownfield agent (when brownfield mode is enabled, both agents see the same Module classification for the same artefact). See [design/agents/brownfield.md § Module-detection](../../../design/agents/brownfield.md).
