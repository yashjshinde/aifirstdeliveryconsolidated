# Estimation Instructions

## Overview

This document guides an AI assistant to analyze Dynamics 365 / Power Platform requirement documents and produce structured effort estimation outputs.  
All estimations must align with the **Estimation-Inventory-Template** and **MasterFactorDefinition** reference files.

---

## Part 1 — Reference: Factor Definitions & Complexity

### 1.1 Factor Definition & Complexity Levels

The table below defines each **estimation inventory factor** and describes what qualifies as Simple, Medium, Complex, or Very Complex for that factor.

| Factor | Factor Definition | Simple | Medium | Complex | Very Complex |
|---|---|---|---|---|---|
| CRM Existing Entity C&UT | Enhancements to existing CRM entities including fields, forms, views, relationships, and business rules with unit testing. | Field or form update, minor view change | Multiple fields, form changes, simple rules | Complex rules, multi-entity impact | Heavy dependency, security, integrations |
| CRM New Entity C&UT | Design, configuration, and testing of a new CRM entity. | Simple entity, limited fields | Multiple fields and relationships | Complex relationships and rules | Cross-module dependency, integrations |
| CRM Plugin C&UT | Server-side plugin development for complex business logic. | Single plugin, simple logic | Multiple steps and validations | Complex business logic | Transactional, cross-entity logic |
| Business Rule C&UT | Configuration of no-code business rules in CRM. | Single rule | Multiple conditions | Complex branching | Multiple rules across entities |
| Command Bar / Ribbon C&UT | Custom command or ribbon button development. | Visibility rule only | Action with JS | Multiple actions | Role-based, integration-triggered |
| Add'l Javascript on Entity | Client-side scripting on entity forms. | Simple validation | Multiple event handlers | Complex client logic | Performance-sensitive logic |
| Power Automate C&UT | Workflow automation using Power Automate. | Linear flow | Conditions and approvals | Multiple systems involved | Error handling, retries, integrations |
| Azure Function Build & UT | Azure Functions for integration or background processing. | Single trigger | Multiple triggers | External dependencies | State, security, complex processing |
| Integration | Data exchange between CRM and external systems. | Batch, one-direction | Batch with transformations | Near real-time | Real-time, bi-directional |
| Model Driven App Changes | Model-driven app configuration changes. | Navigation update | Multiple components | Complex restructuring | Multi-app redesign |
| PCF Control Development | Custom PCF control development. | UI-only | UI + logic | Complex interactions | High performance, reusable |
| Excel Report | Excel-based report creation from CRM data. | Single sheet | Multiple sheets | Complex formulas | Large datasets |
| HTML WebResource | HTML UI components embedded in CRM. | Static UI | UI with JS | Dynamic UI | Integration-heavy UI |
| Security Role | CRM security role creation or update. | Single role | Multiple roles | Complex privilege model | Hierarchy + app-based |
| Hierarchy Security | Hierarchy-based access configuration. | Single level | 2–3 levels | Multiple hierarchies | Cross-BU hierarchy |
| Site Map | CRM sitemap configuration. | Menu update | Multiple areas | App-level config | Multi-app alignment |
| CRM Master Data Preparation | Preparation of master data prior to migration. | Simple lists | Multiple entities | Entity relationships | Data dependency-heavy |
| Email Configuration | CRM email and template configuration. | Single template | Multiple templates | Dynamic templates | External integration |
| ExperLogix Report | ExperLogix report development in CRM. | Simple layout | Multiple sections | Advanced logic | High data volume |

---

### 1.2 Factor Estimation Points by Complexity

> **Estimation Unit:** Hours (Hrs.)  
> **Formula:** `Effort (Hrs.) = Complexity Hrs. × Inventory Count`

| Factor | Simple (Hrs.) | Medium (Hrs.) | Complex (Hrs.) | Very Complex (Hrs.) |
|---|---:|---:|---:|---:|
| CRM Existing Entity C&UT | 1 | 2 | 4 | 7 |
| CRM New Entity C&UT | 2 | 4 | 7 | 10 |
| CRM Plugin C&UT | 2 | 5 | 8 | 12 |
| Business Rule C&UT | 1 | 2 | 3 | 5 |
| Command Bar / Ribbon C&UT | 1 | 3 | 5 | 8 |
| Add'l Javascript on Entity | 1 | 2 | 4 | 6 |
| Power Automate C&UT | 1 | 3 | 5 | 8 |
| Azure Function Build & UT | 2 | 5 | 8 | 12 |
| Integration | 3 | 6 | 10 | 15 |
| Model Driven App Changes | 1 | 2 | 4 | 6 |
| PCF Control Development | 3 | 6 | 10 | 15 |
| Excel Report | 1 | 2 | 3 | 5 |
| HTML WebResource | 1 | 3 | 5 | 8 |
| Security Role | 0.5 | 1 | 2 | 3 |
| Hierarchy Security | 1 | 2 | 4 | 6 |
| Site Map | 0.5 | 1 | 2 | 3 |
| CRM Master Data Preparation | 1 | 3 | 5 | 8 |
| Email Configuration | 0.5 | 1 | 2 | 3 |
| ExperLogix Report | 2 | 4 | 7 | 10 |

---

## Part 2 — Reference: Output Structures

### 2.1 Business Req. Detail — Column Definitions

Each row in the Business Req. Detail table represents **one inventory factor for one requirement**. A single requirement will produce multiple rows if multiple inventory types are required.

| Column | Description | Example / Allowed Values |
|---|---|---|
| **Req ID** | Unique requirement identifier sourced from the input document. | `REQ-001`, `US-123` |
| **Module / Feature** | Logical grouping of the requirement under a functional area. | `Case Management`, `Lead Management`, `Integration – SAP` |
| **Req Title** | Verbatim requirement statement copied from the source document. Describes *what* to implement, not *how*. | `"System shall auto-assign cases based on product category and region."` |
| **Priority** | Implementation priority driven by business criticality and delivery phasing. | `High`, `Medium`, `Low`, `MVP Phase 1`, `MVP Phase 2` |
| **Fitment** | How the requirement is addressed within CRM / Power Platform capabilities. | `Out of the Box`, `Configuration`, `Customization`, `Integration`, `Non-Functional`, `Covered in other requirement`, `Out of Scope` |
| **Type of Integration** | Integration pattern — **only populated when Fitment = Integration**; otherwise `NA`. | `Batch`, `Real-time`, `Middleware`, `API based`, `File based`, `NA` |
| **Inventory** | The specific estimation factor from Section 1.1 that covers this row's work. | `CRM Plugin C&UT`, `Add'l Javascript on Entity`, `Power Automate C&UT` |
| **Simple** | Count of inventory items at Simple complexity. | Integer ≥ 0 |
| **Medium** | Count of inventory items at Medium complexity. | Integer ≥ 0 |
| **Complex** | Count of inventory items at Complex complexity. | Integer ≥ 0 |
| **Very Complex** | Count of inventory items at Very Complex complexity. | Integer ≥ 0 |
| **Solution / Rationale** | Reason the chosen inventory factor and complexity level were selected. Explains the implementation approach. | `"Plugin required for server-side validation; async execution assumed."` |
| **Assumptions / Comments** | Assumptions made during estimation, constraints, or interpretation notes. | `"Assumes standard security roles are already in place."` |
| **Open Questions** | Unresolved clarifications or gaps that need business / technical confirmation. | `"Is real-time integration mandatory or can batch suffice?"` |

> **Key rule:** Complexity columns capture **counts of items**, not hours. Hours are derived from Section 1.2.

---

#### Multi-Inventory Row Example

A single requirement that needs both JavaScript and a Plugin produces two rows — one per inventory type:

| Req ID | Module / Feature | Req Title | Priority | Fitment | Type of Integration | Inventory | Simple | Medium | Complex | Very Complex | Solution / Rationale | Assumptions / Comments | Open Questions |
|---|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|
| REQ-01 | Case Management | Auto-assign cases based on product category and region | High | Customization | NA | Add'l Javascript on Entity | 1 | 2 | 0 | 0 | Client-side handlers for field visibility and pre-validation before save | Rules executed client-side only | Confirm rule precedence order |
| REQ-01 | Case Management | Auto-assign cases based on product category and region | High | Customization | NA | CRM Plugin C&UT | 0 | 1 | 1 | 0 | Server-side plugin for async assignment logic after record save | Plugin runs asynchronously post-save | Confirm async vs sync requirement |

---

### 2.2 Module Build Hrs — Table Structure

The Module Build Hrs table aggregates all Business Req. Detail rows for a given module into a single hour roll-up.  
One table is produced **per Module / Feature**.

**Structure:**

| Factor | S (Count) | M (Count) | C (Count) | VC (Count) | S Hrs | M Hrs | C Hrs | VC Hrs | Total Hrs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Add'l Javascript on Entity | | | | | 0 | 0 | 0 | 0 | 0 |
| Azure Function Build & UT | | | | | 0 | 0 | 0 | 0 | 0 |
| Business Rule C&UT | | | | | 0 | 0 | 0 | 0 | 0 |
| Command Bar / Ribbon C&UT | | | | | 0 | 0 | 0 | 0 | 0 |
| CRM Existing Entity C&UT | | | | | 0 | 0 | 0 | 0 | 0 |
| CRM Master Data Preparation | | | | | 0 | 0 | 0 | 0 | 0 |
| CRM New Entity C&UT | | | | | 0 | 0 | 0 | 0 | 0 |
| CRM Plugin C&UT | | | | | 0 | 0 | 0 | 0 | 0 |
| PCF Control Development | | | | | 0 | 0 | 0 | 0 | 0 |
| Hierarchy Security | | | | | 0 | 0 | 0 | 0 | 0 |
| Integration | | | | | 0 | 0 | 0 | 0 | 0 |
| Model Driven App Changes | | | | | 0 | 0 | 0 | 0 | 0 |
| Power Automate C&UT | | | | | 0 | 0 | 0 | 0 | 0 |
| Security Role | | | | | 0 | 0 | 0 | 0 | 0 |
| Site Map | | | | | 0 | 0 | 0 | 0 | 0 |
| Email Configuration | | | | | 0 | 0 | 0 | 0 | 0 |
| Excel Report | | | | | 0 | 0 | 0 | 0 | 0 |
| HTML WebResource | | | | | 0 | 0 | 0 | 0 | 0 |
| ExperLogix Report | | | | | 0 | 0 | 0 | 0 | 0 |
| **Total** | | | | | **0** | **0** | **0** | **0** | **0** |

**Hour Formulas (per row):**

| Column | Formula |
|---|---|
| S Hrs | `S Count × Simple Hrs rate` (from Section 1.2 for that factor) |
| M Hrs | `M Count × Medium Hrs rate` |
| C Hrs | `C Count × Complex Hrs rate` |
| VC Hrs | `VC Count × Very Complex Hrs rate` |
| Total Hrs | `S Hrs + M Hrs + C Hrs + VC Hrs` |
| **Grand Total** | Sum of all row Total Hrs values |

**Example — CRM Plugin C&UT with counts S=1, M=5, C=3, VC=1:**

`S Hrs = 1×2 = 2` | `M Hrs = 5×5 = 25` | `C Hrs = 3×8 = 24` | `VC Hrs = 1×12 = 12` | `Total = 63 Hrs`

> Only enter **counts (S, M, C, VC)** — never manually override hour columns.

---

### 2.3 Module Overall Hrs — Summary Structure

The Module Overall Hrs table presents the final cross-phase effort summary per module.  
**Only populate the `Module Name` and `Org Build & UT Hrs` columns** — all other phase columns are auto-calculated.

| Module / Feature | Org Build & UT Hrs | Plan & Design Hrs | Test Creation Hrs | Test Execution Hrs | Dev Fix Hrs | Deployment Hrs |Total Project Hrs |
|---|---:|---:|---:|---:|---:|---:|---:|
| Lead Management |`leadbuild` | `leadbuild * 0.2` |`leadbuild * 0.25` |`leadbuild * 0.35` | `leadbuild * 0.35`| `Org leadbuild * 0.15`| |
| Case Management |`casebuild` | `casebuild * 0.2` |`casebuild * 0.25` |`casebuild * 0.35` | `casebuild * 0.35`| `Org casebuild * 0.15`| |
| **Total** | | | | | | | |

> Do **not** modify formula columns (Plan & Design Hrs, Test Creation Hrs, Test Execution Hrs, Dev Fix Hrs, Deployment Hrs, Total Project Hrs).

---

## Part 3 — Execution Steps

### Step 1 — Ingest the Requirement File

- Accept the uploaded requirement document (Excel, Word, or plain text).
- Parse and extract **all individual requirements** from every sheet or section.
- Consolidate into a single flat list before proceeding.

---

### Step 2 — Group Requirements into Modules / Features

- Review each requirement in the context of applicable Dynamics 365 / Power Platform modules:
  - D365 CRM Sales
  - D365 CRM Service
  - D365 Field Service
  - Custom Power App / Power Pages
- Assign a short, descriptive **Module / Feature** label to each requirement.
- Common groupings: `Lead Management`, `Case Management`, `Work Order`, `Integration – [System Name]`, `Reporting & Analytics`, `Security & Access`.

---

### Step 3 — Build the Business Req. Detail Inventory

- For **each requirement**, produce one or more rows using the column definitions in Section 2.1.
- A single requirement **must** produce multiple rows if it requires more than one inventory type.
- Use Section 1.1 to determine the correct factor and complexity level.
- Use Section 1.2 to validate that complexity classification is consistent with the hour rates.
- Populate **Solution / Rationale**, **Assumptions / Comments**, and **Open Questions** for every row — do not leave them blank.

---

### Step 4 — Produce the Business Req. Detail Output

- Output the completed Business Req. Detail table as an **Excel file** (preferred) or **Markdown table**.
- Sort rows by **Module / Feature** ascending, then by **Req ID** ascending.

---

### Step 5 — Build the Module Build Hrs Summary

- For each Module / Feature, aggregate all Business Req. Detail rows with the same module label.
- Sum counts (S, M, C, VC) per inventory factor across all matching rows.
- Populate the Module Build Hrs table (Section 2.2) with those summed counts.
- Let the hour formulas calculate S Hrs, M Hrs, C Hrs, VC Hrs, and Total Hrs — do not enter hours manually.
- Produce one table per module as an **Excel file** or **Markdown table**.

---

### Step 6 — Populate Module Overall Hrs

- For each module, enter:
  1. **Module Name** — matching the label used in Steps 2–5.
  2. **Org Build & UT Hrs** — the Grand Total Hrs from that module's Step 5 table.
- Leave all other columns (Design, SIT, UAT, Deployment, Total Project Hrs) to auto-calculate.

---

### Step 7 — Deliver the Final Estimation Output

- Produce the completed **Module Overall Hrs** table (Section 2.3) as the final deliverable.
- Verify totals are consistent with the Step 5 module totals before sharing.
- This output is the **effort estimation deliverable** to be reviewed with stakeholders.

---

## Part 4 — Key Rules

| # | Rule |
|---|---|
| 1 | **One row per inventory type per requirement.** Never collapse multiple inventory types into a single row. |
| 2 | **Never enter hours manually.** Only supply counts (S, M, C, VC); hours derive from Section 1.2 formulas. |
| 3 | **Document all open questions.** Unresolved ambiguities must be recorded in the Open Questions column — not silently assumed. |
| 4 | **Solution / Rationale is mandatory.** Every row must explain why that inventory factor and complexity were chosen. |
| 5 | **Fitment must be one of the approved values.** `Out of the Box` / `Configuration` / `Customization` / `Integration` / `Non-Functional` / `Covered in other requirement` / `Out of Scope` / `Deprecated / Not Supported`. |
| 6 | **Priority reflects business impact.** Do not simply copy client labels — assess delivery phase and dependency order. |
| 7 | **Type of Integration = NA** for all rows where Fitment ≠ Integration. |

---

## Part 5 — Reference Files

| File | Purpose |
|---|---|
| Requirement file (uploaded by user) | Source of all requirements to be estimated |
| `Estimation-Inventory-Template.xlsx` | Business Req. Detail entry template |
| `MasterFactorDefinition.xlsx` | Factor definitions, hour rates, Module Build Hrs sheet, Module Overall Hrs sheet |
