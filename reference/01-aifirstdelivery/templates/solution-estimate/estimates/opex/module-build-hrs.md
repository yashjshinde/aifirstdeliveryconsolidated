# Module Build Hours — Estimation Summary

> **Source:** Aggregated from `business-req-detail.md`
> **Formula:** Effort (Hrs.) = Count × Rate (from constitution/21-factor-rates.md)
> **Note:** S = Simple | M = Medium | C = Complex | VC = Very Complex

---

## Module 1: Customer Master Sync (Fusion → D365)

| Factor | S (Count) | M (Count) | C (Count) | VC (Count) | S Hrs | M Hrs | C Hrs | VC Hrs | Total Hrs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Add'l Javascript on Entity | 0 | 1 | 1 | 0 | 0 | 2 | 4 | 0 | **6** |
| Azure Function Build & UT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Business Rule C&UT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Command Bar / Ribbon C&UT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| CRM Existing Entity C&UT | 0 | 1 | 3 | 0 | 0 | 2 | 12 | 0 | **14** |
| CRM Master Data Preparation | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | **1** |
| CRM New Entity C&UT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| CRM Plugin C&UT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| PCF Control Development | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Hierarchy Security | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Integration | 0 | 1 | 3 | 0 | 0 | 6 | 30 | 0 | **36** |
| Model Driven App Changes | 0 | 1 | 0 | 0 | 0 | 2 | 0 | 0 | **2** |
| Power Automate C&UT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Security Role | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Site Map | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Email Configuration | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Excel Report | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| HTML WebResource | 0 | 1 | 0 | 0 | 0 | 3 | 0 | 0 | **3** |
| ExperLogix Report | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Power BI Interactive Report | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Power BI Paginated / SSRS Report | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Power BI Dataset (Data Model) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| DAX Measure Set | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| RLS Design & Implementation | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| Power BI Workspace Setup & ALM | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| SSRS Stored Procedure | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| **Total** | **1** | **5** | **7** | **0** | **1** | **15** | **46** | **0** | **62** |

> **Rate Reference (non-zero factors applied in this module, from constitution/21-factor-rates.md):**
> - Add'l Javascript on Entity — Medium = 2 Hrs, Complex = 4 Hrs
> - CRM Existing Entity C&UT — Medium = 2 Hrs, Complex = 4 Hrs
> - CRM Master Data Preparation — Simple = 1 Hr
> - Integration — Medium = 6 Hrs, Complex = 10 Hrs
> - Model Driven App Changes — Medium = 2 Hrs
> - HTML WebResource — Medium = 3 Hrs

---

## Grand Summary — All Modules

| Module | Total Build Hrs |
|---|---:|
| Customer Master Sync (Fusion → D365) | 62 |
| **Grand Total Build Hrs** | **62** |
