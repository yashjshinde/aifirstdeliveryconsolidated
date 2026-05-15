# Object Type Standards

## Data Entities (DEN)

**Naming:** `AVA_<Module>_<BusinessArea>_<EntityName>_Entity`

**Governing principles:**
- Standard-first: always evaluate standard D365 F&O Data Entities before creating custom ones
- Single purpose: integration, data migration, or configuration — not mixed concerns
- DMF compatibility: all custom entities must support Data Management Framework
- No direct table access: external consumers use entities, not raw tables

**Design standards:**
- Documented field mapping specification (source → entity field, transformation, mandatory/optional, validation)
- Set-based processing for migration entities
- Validation logic on insert/update
- Respect D365 F&O security context
- OData-exposed entities flagged `IsPublic = Yes` and documented in integration inventory
- Staging table support for bulk import

**Performance:** Single OData insert < 2s; batch < 1,000 records < 2min; > 10,000 records must use async/batch DMF.

---

## Security Roles (SEC)

**Naming:** `AVA_<Module>_<RoleName>_Role`

**Governing principles:**
- Standard roles first — evaluate before creating custom
- Least privilege — minimum access for job function
- Segregation of duties — no conflicting duties in one role without documented exception
- No direct privilege assignment — assign roles, never individual privileges

**Design standards:**
- Role Definition Sheet: role name, description, duties, privileges, target personas, SoD conflicts
- Tested in dedicated security test cycle (access + restriction)
- Transportable via security configuration packages — no manual production config
- Sensitive data access flagged and approved by Data Protection Officer

---

## Power Platform (PPL)

**Naming:** Apps: `AVA_<Module>_<AppName>_App` | Flows: `AVA_<Module>_<FlowName>_Flow`

**Governing principles:**
- Approved environment only — not personal or default environments
- D365 F&O as system of record — no parallel data stores
- Governed via CoE toolkit — all production components registered with named owner
- DLP compliance — all flows and apps

**Design standards:**
- Service accounts for D365 F&O connections — no personal credentials
- Error handling with try-catch-finally and failure notifications
- No sensitive data in flow run history — use secure inputs/outputs
- All components solution-aware and deployable via managed solutions
- Complex logic in D365 F&O (X++ or business events), not in Power Automate expressions

---

## Retail Extensions (RET)

**Naming:** `AVA_<Component>_<ExtensionName>_RetailExt`
**Component codes:** POS, HWS, CSU, CRT

**Governing principles:**
- Standard Retail functionality first
- Extension model only — no modification of sealed/standard Retail code
- Offline resilience — extensions must function in offline POS mode
- Backward compatibility — no breakage of existing POS operations

---

## Workflows (WFL)

**Naming:** `AVA_<Module>_<DocumentType>_<WorkflowPurpose>_Workflow`

**Governing principles:**
- D365 F&O native workflow engine for document approvals
- Power Automate for cross-system workflows (also register under PPL)
- No workflow logic in X++ — use workflow condition editor
- Audit trail mandatory

**Design standards:**
- Documented Workflow Design Document: trigger, approval hierarchy, delegation, escalation timeouts, rejection behaviour, notification templates
- Configurable email templates — no hardcoded content
- Delegation and absence management — no permanent blocks
- Escalation timeout defined for every step; auto-escalate after 5 business days default
- End-to-end tested in TEST before UAT: happy path, rejection, escalation, delegation

---

## Business Documents (BDC)

**Naming:** `AVA_<Module>_<BusinessArea>_<DocumentName>_Document`

**Governing principles:**
- GER preferred; SSRS only when GER cannot meet requirement
- Standard templates first
- Multi-entity support unless explicitly single-entity scoped
- Branding compliance — approved company template

**Performance:** Single document < 5s; batch < 500 documents < 5min; > 500 must use async print.

---

## Analytical Reports (ANR)

**Naming:** `AVA_<Module>_<BusinessArea>_<ReportName>_AnalyticalReport`

**Governing principles:**
- Power BI as primary tool
- Source data from Entity Store, Azure Data Lake, or approved Dataverse tables — never direct OLTP queries
- Standard Power BI content packs first

**Design standards:**
- Report Specification: business questions, data sources, refresh frequency, audience, RLS requirements
- Row-Level Security aligned with D365 F&O security model
- Published via approved Power BI pipeline (Dev → Test → Prod workspace)
- All DAX measures documented with descriptions

**Performance:** Dashboard < 5 visuals: < 5s; detailed < 10 visuals: < 10s; complex: < 20s.

---

## Operational Reports (OPR)

**Naming:** `AVA_<Module>_<BusinessArea>_<ReportName>_OperationalReport`

**Governing principles:**
- Standard reports first
- SSRS for print-ready output
- Form-based for on-screen inquiry
- No ad-hoc queries on production — use published Data Entities or approved views

**Performance:** Transactional < 5s; operational batch < 1,000 rows < 30s; period-end < 50,000 rows < 3min; larger must use batch/async.

---

## Integrations (INT)

**Naming:** `AVA_<Direction>_<Source>_<Target>_<DataDomain>_Integration`
**Direction codes:** INB, OUT, BDR

**Governing principles:**
- Loosely coupled — D365 F&O must not have hard runtime dependency on external systems
- API-first (OData or custom services); file-based only when external system cannot support API
- Middleware ownership — all transformations in middleware layer (Azure Integration Services, Logic Apps), not in X++
- D365 F&O is system of record — no external direct write to database

**Design standards:**
- Documented Integration Contract: data schema, trigger, frequency, error handling, retry policy
- Idempotency — reprocessing same message must not create duplicates
- Staging table before committing to base tables — enables error inspection and reprocessing
- All errors surfaced in D365 F&O Integration Log — silent failures prohibited
- Sensitive fields masked in all integration logs

**Authentication:**
- Inbound APIs: Azure AD (Entra ID) service principal — no basic auth or API keys in code
- Service principal credentials in Azure Key Vault, rotated annually minimum
- No hardcoded URLs or credentials in X++ code

**Error handling:**

| Scenario | Required Behaviour |
|---|---|
| External system unavailable | Retry 3 times exponential back-off; alert on failure |
| Validation failure | Reject to error queue; log full payload + error reason; do not retry |
| Partial success | Log each record individually; do not roll back successes |
| Duplicate detection | Discard silently; log at DEBUG level |
