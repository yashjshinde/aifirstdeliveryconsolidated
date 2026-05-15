# {Solution Display Name} — Component Inventory

| Property | Value |
|---|---|
| Solution | {solution-name} v{version} |
| Publisher | {publisher-name} [{publisher-prefix}] |
| Scanned | {date} |
| Status | COMPLETE / PARTIAL |

---

## Solution Overview

| Property | Value |
|---|---|
| Unique Name | {solution-unique-name} |
| Version | {version} |
| Publisher Prefix | {prefix} |
| Managed | Yes / No |
| Description | {description or "Not provided"} |

---

## Entity Register

| Schema Name | Display Name | Ownership | Custom / OOB | Custom Attributes | Primary Name Field |
|---|---|---|---|---|---|
| `pub_example` | Example | User | Custom | 12 | `pub_name` |

---

## Attribute Summary

| Entity | Total Custom Attributes | Types Used |
|---|---|---|
| `pub_example` | 12 | Text(5), Lookup(3), OptionSet(2), DateTime(1), Decimal(1) |

---

## Relationship Register

| Relationship Schema Name | Type | Parent Entity | Child Entity | Cascade Delete |
|---|---|---|---|---|
| `pub_account_pub_example` | N:1 | account | pub_example | Restrict |

---

## Form Register

| Entity | Form Name | Form Type | Tabs |
|---|---|---|---|
| `pub_example` | Example Main Form | Main | 3 |

---

## View Register

| Entity | View Name | Type | Primary Column | Filter |
|---|---|---|---|---|
| `pub_example` | Active Examples | Public | pub_name | statecode = Active |

---

## Plugin Register

| Assembly Name | Plugin Class | Entity | Message | Stage | Mode |
|---|---|---|---|---|---|
| MyPlugin.dll | AccountPreCreatePlugin | account | Create | Pre-Operation | Sync |

---

## Web Resource Register

| Schema Name | Type | Description / Purpose |
|---|---|---|
| `pub_/js/account_form.js` | JavaScript | Account form scripts |

---

## PCF Control Register

| Control Name | Namespace | Type | Bound Property Type |
|---|---|---|---|
| RatingControl | Publisher | field | Whole.None |

---

## Power Automate Flow Register

| Display Name | Type | Trigger | Primary Entity |
|---|---|---|---|
| Notify Manager on Lead Assignment | Automated | Record created — Lead | lead |

---

## Classic Workflow Register

| Name | Scope | Trigger | Entity |
|---|---|---|---|
| Send Welcome Email | Organisation | Record Created | contact |

---

## Custom API Register

| Unique Name | Display Name | Bound Entity | Plugin Type |
|---|---|---|---|
| `pub_CalculateDiscount` | Calculate Discount | opportunity | DiscountCalculator |

---

## Security Role Register

| Role Name | Inferred Persona | Custom Entities with Privileges |
|---|---|---|
| Sales Manager | Sales Manager | pub_example: CRUD (Org) |

---

## Environment Variable Register

| Schema Name | Display Name | Type | Default Value |
|---|---|---|---|
| `pub_ExternalApiUrl` | External API URL | String | https://api.example.com |

---

## Integration Register

| Name | Type | Trigger | Direction | Target System |
|---|---|---|---|---|
| SyncLeadFunction | Azure Function | HttpTrigger POST | Outbound | External CRM |

---

## Existing Documents Register

| Filename | Apparent Purpose |
|---|---|
| technical-spec-v2.md | Technical specification for the quote module |

---

## Items Requiring Review

| Component | Type | Reason |
|---|---|---|
| `pub_LegacyFlow` | Power Automate | Could not parse flow definition JSON |
