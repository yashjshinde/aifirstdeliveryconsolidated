# {Solution Display Name} — Functional Overview

| Property | Value |
|---|---|
| Solution | {solution-name} v{version} |
| Generated | {date} |
| Status | DRAFT — for stakeholder review |
| Prepared by | AI First Delivery — Brownfield Agent |

---

## §1 Executive Summary

{2-4 paragraphs describing what the solution does, which business processes it supports, and which user groups it serves. Written for a non-technical business stakeholder.}

---

## §2 Business Context

**Organisation / Team served:** {inferred from solution and entity naming}
**Business problem addressed:** {inferred from entity names, flow names, process patterns}
**Key outcomes supported:**
- {outcome 1}
- {outcome 2}

---

## §3 User Personas

| Persona | Description | Primary Activities | Security Role(s) |
|---|---|---|---|
| Sales Representative | {description} | Creates Leads, manages Opportunities, submits Quotes | Sales Representative |
| Sales Manager | {description} | Reviews team pipeline, approves Quotes above threshold | Sales Manager |

---

## §4 Business Processes Supported

### {Process Name}

**Description:** {one-line description}
**Trigger:** {what starts this process}
**Actors:** {list of personas involved}

**Process steps:**
1. {Actor}: {action}
2. System: {automated action — e.g. "automatically sends notification"}
3. {Actor}: {decision or action}
4. System: {automated outcome}

**Completion condition:** {what does done look like}
**Automated elements:** {which steps are automated vs manual}

---

## §5 Data Subjects and Key Information

| Business Name | What it stores | Key relationships |
|---|---|---|
| Customer Profile | Company details, contact preferences, credit limit | Links to Contacts and Orders |
| Sales Quote | Line items, pricing, validity period | Belongs to one Opportunity |

---

## §6 Automation Summary

| Flow / Workflow | Trigger | What it does | Type |
|---|---|---|---|
| Notify Manager on Lead Assignment | Lead assigned to user | Sends Teams notification to manager | Automated |
| Generate Welcome Email | Contact created | Sends onboarding email via Outlook | Automated |

---

## §7 Integration Summary

| External System | Direction | Data Exchanged | Frequency |
|---|---|---|---|
| ERP System | D365 → ERP | Orders and Invoices | Real-time on Order confirmation |
| Marketing Platform | Bidirectional | Contacts and Campaign responses | Nightly batch |

---

## §8 User Interface Highlights

**Key forms:**
- **{Entity} Main Form** — {what users do here in one sentence}
- **{Entity} Quick Create** — {purpose}

**Notable enhancements:**
- {PCF control name}: {what enhanced experience it provides}
- {Web resource}: {what it does for the user}

---

## §9 Security Summary

| Role | Business Purpose |
|---|---|
| Sales Representative | Day-to-day management of leads, contacts, and opportunities |
| Sales Manager | Team oversight and approval authority |

**Data access restrictions:** {any field-level security or record-level restrictions in plain language}

---

## §10 Known Gaps and Outstanding Questions

| Item | Description | Source |
|---|---|---|
| {Component name} | Purpose could not be determined | ⚠ NEEDS REVIEW |

---

## Documentation Gaps

Items that require input from the solution owner before this document can be completed:

- [ ] {gap 1}
- [ ] {gap 2}
