# Factor Definitions

Standard estimation factors for Microsoft technology delivery.
Approved project-specific factors are appended below the standard list after running `/factors-review`.

> **How to read this table:** Each row is one billable factor type. When a requirement needs multiple factor types to deliver it, it produces multiple inventory rows — one per factor.

| # | Factor | Simple | Medium | Complex | Very Complex |
|---|---|---|---|---|---|
| 1 | Add'l Javascript on Entity | Single event handler; one form; display-only logic | Multiple event handlers; cross-field logic; form show/hide | Complex business logic; multiple forms; cross-entity validation; async calls | Highly complex stateful scripting; large conditional trees; real-time integration calls |
| 2 | Azure Function Build & UT | Single trigger; one input/output; no external calls | HTTP trigger; simple transformation; one external call | Multiple triggers; complex logic; error handling; retry patterns | Durable functions; orchestrations; high-throughput; multi-system integrations |
| 3 | Business Rule C&UT | Single condition; one action; one entity | Multiple conditions; cross-field dependencies; branching | Complex condition trees; multiple entities; scope-based rules | Highly complex rule chains; advanced scoping; near-plugin complexity |
| 4 | Command Bar / Ribbon C&UT | Show/hide existing button | New button with simple action | Custom command with complex JS; conditional visibility | Multi-step customisation; ribbon rule logic; complex enable/disable conditions |
| 5 | CRM Existing Entity C&UT | Field addition; view update; minor form change | Multiple fields; form sections; sub-grids; multiple views | Major form restructure; multiple relationships; complex views | Cross-solution entity restructure; significant model impact |
| 6 | CRM Master Data Preparation | Single lookup table; manual data load | Multiple lookup tables; import; basic transformation | Complex data migration; multiple entities; validation rules | Large-scale migration; external source; transformation pipeline |
| 7 | CRM New Entity C&UT | Simple entity; few fields; single form/view | Standard entity; relationships; multiple views; form | Complex entity; multiple relationships; advanced forms; security | Complex entity with deep relationships; many forms; high-impact data model |
| 8 | CRM Plugin C&UT | Single synchronous step; one entity; simple logic | Cross-entity logic; multiple steps; pre/post images | Complex business logic; multiple entities; async patterns; error handling | High-complexity orchestration; cross-system calls; stateful logic |
| 9 | PCF Control Development | Simple display control; read-only; static dataset | Interactive control; events; moderate complexity | Complex control; external API calls; advanced rendering; stateful | Full custom framework; complex data operations; third-party integration |
| 10 | Hierarchy Security | Simple parent-child hierarchy; single entity | Multiple entities in hierarchy; role scoping | Complex hierarchy with custom depth; multiple role types | Deep hierarchy; cross-BU; complex access model |
| 11 | Integration | One-way batch; single entity; straightforward mapping | Bidirectional or scheduled; multi-field transformation | Real-time; complex transformation; error handling; retry logic | High-volume; event-driven; multi-system; orchestration layer |
| 12 | Model Driven App Changes | Navigation update; view addition; sitemap entry | App redesign; multiple area changes; component addition | New functional area; significant layout redesign | Full app rebuild or major multi-area restructure |
| 13 | Power Automate C&UT | Simple trigger/action; single condition | Multiple conditions; branching; approval workflow | Complex orchestration; timer-based; multi-step; error handling | Durable flows; child flows; highly conditional; external system calls |
| 14 | Security Role | Minor privilege change on existing role | New role or significant existing role modification | Custom role with cross-entity scope; field security | Complex RBAC; hierarchy security; field-level security; multiple roles |
| 15 | Site Map | Single navigation entry addition | Structural navigation change; multiple areas | New app area; complex group/sub-area hierarchy | Full sitemap redesign |
| 16 | Email Configuration | Basic mailbox/queue setup | Queue routing rules; email-to-record configuration | Advanced server-side sync; multiple mailboxes; routing logic | Complex multi-mailbox; custom routing; advanced sync rules |
| 17 | Excel Report | Simple export; few columns; standard views | Multi-column report; formatted template; multiple sheets | Complex calculations; multiple data sources; conditional formatting | Highly complex workbook; VBA; dynamic charts |
| 18 | HTML WebResource | Static HTML page; minimal JS | Interactive form; JS validation; D365 data access | Complex form; portal embedding; API calls; advanced JS | Full SPA-style WebResource; complex data binding; real-time updates |
| 19 | ExperLogix Report | Simple single-section report | Multi-section; conditional content | Complex layout; multiple data sources; calculations | Highly complex report; custom logic; multiple conditional sections |
| 20 | Power BI Interactive Report | 1-page; 1–3 standard visuals; single dataset; no custom measures | 2–4 pages; mixed visuals; basic DAX measures; slicers | 5+ pages; bookmarks; drill-through; cross-filtering; complex DAX | Multi-dataset composite model; embedded analytics; advanced DAX; dynamic parameters |
| 21 | Power BI Paginated / SSRS Report | Single data source; tabular layout; few parameters | Multi-parameter; grouped rows; subtotals; basic conditional formatting | Multiple data sources; subreports; chart sections; complex grouping | Multi-section; subscriptions; dynamic column pivoting; complex calculations |
| 22 | Power BI Dataset (Data Model) | 1–2 tables; basic star schema; no calculated columns | 3–5 tables; star schema; calculated columns; basic incremental refresh | 6–10 tables; complex relationships; many calculated columns; incremental refresh config | Composite model; multiple data sources; DirectQuery; complex data preparation |
| 23 | DAX Measure Set | 1–5 basic measures (SUM, COUNT, basic time intelligence) | 6–15 measures; CALCULATE with filters; standard time intelligence patterns | 16–30 measures; ALLSELECTED; iterators; semi-additive; complex CALCULATE | 30+ measures; dynamic segmentation; advanced time intelligence; complex iterators |
| 24 | RLS Design & Implementation | Static RLS; 1–2 roles; hardcoded values | Dynamic RLS; USERPRINCIPALNAME(); 2–4 roles | Dynamic RLS with Dataverse/Azure AD lookup; BU-based; 4–6 roles | Hierarchy RLS; multiple security dimensions; Dataverse-managed security |
| 25 | Power BI Workspace Setup & ALM | Single workspace; manual deployment; basic settings | DEV/UAT/PROD workspaces; deployment pipeline; service principal | Full ALM pipeline; automated deployment; sensitivity labels; governance policy | Multi-tenant or embedded setup; full CI/CD automation; custom governance |
| 26 | SSRS Stored Procedure | Single table; few parameters; no joins | Multi-table joins; filtering; basic aggregation | Complex joins; dynamic SQL; multiple result sets; performance tuning | CTE chains; dynamic pivoting; high-volume; multiple result sets |

---

## Project-Specific Factors

*Approved custom factors are appended here by `/factors-review` after the standard list.*
