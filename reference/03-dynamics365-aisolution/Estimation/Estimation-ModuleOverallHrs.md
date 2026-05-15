# Module Overall Hours — Estimation Deliverable

> **Source:** Estimation-ModuleBuildHrs.md (Grand Total per module)  
> **Formulas applied per estimation-instructions.md Section 2.3:**  
> - Plan & Design Hrs = Org Build & UT Hrs × 0.20  
> - Test Creation Hrs = Org Build & UT Hrs × 0.25  
> - Test Execution Hrs = Org Build & UT Hrs × 0.35  
> - Dev Fix Hrs = Org Build & UT Hrs × 0.35  
> - Deployment Hrs = Org Build & UT Hrs × 0.15  
> - Total Project Hrs = Sum of all phase columns  

---

## Module Overall Hours Table

| Module / Feature | Org Build & UT Hrs | Plan & Design Hrs | Test Creation Hrs | Test Execution Hrs | Dev Fix Hrs | Deployment Hrs | Total Project Hrs |
|---|---:|---:|---:|---:|---:|---:|---:|
| Integration – Oracle Fusion | 43.0 | 8.6 | 10.75 | 15.05 | 15.05 | 6.45 | **98.9** |
| Customer & Account Management | 17.0 | 3.4 | 4.25 | 5.95 | 5.95 | 2.55 | **39.1** |
| Contact Management | 14.5 | 2.9 | 3.63 | 5.08 | 5.08 | 2.18 | **33.4** |
| Sites Management | 3.0 | 0.6 | 0.75 | 1.05 | 1.05 | 0.45 | **6.9** |
| Dispatch & SR Management | 93.0 | 18.6 | 23.25 | 32.55 | 32.55 | 13.95 | **213.9** |
| Routing & Assignment | 27.0 | 5.4 | 6.75 | 9.45 | 9.45 | 4.05 | **62.1** |
| SLA & Escalation Management | 18.0 | 3.6 | 4.50 | 6.30 | 6.30 | 2.70 | **41.4** |
| **Total** | **215.5** | **43.1** | **53.88** | **75.43** | **75.43** | **32.33** | **495.7** |

---

## Summary Notes

| Item | Value |
|---|---|
| Total Requirements Analyzed | 34 |
| Total Inventory Rows Created | 77 |
| Total Modules | 7 |
| Total Org Build & UT Hours | 215.5 Hrs |
| Total Project Hours (all phases) | ~495.7 Hrs |
| Estimation Unit | Hours (Hrs.) |
| Estimation Method | Factor-Based (estimation-instructions.md) |

---

## Key Assumptions & Open Questions Summary

### Critical Open Questions (must be resolved before Build phase)

1. **Integration Platform** — What middleware is used for Oracle Fusion ? D365 sync (Azure Data Factory, MuleSoft, TIBCO)? This may require Azure Function hours to be added.
2. **D365 Field Service** — Is D365 Field Service Work Order used as the SR entity, or is D365 Case used? This changes the complexity of all SR-related items.
3. **Contract Management** — Are service contracts synced from Fusion or maintained manually in D365? Integration hours will increase if synced.
4. **Portal Platform** — Is a Power Pages portal already provisioned for multi-channel SR intake (REQ-34)?
5. **Serial Number Source of Truth** — Is D365 Equipment the source for serial number lookup, or is an external ERP call required (which would add Integration hours)?
6. **Escalation Matrix** — How many escalation levels and SLA windows exist for technician acknowledgement (REQ-23)? Additional flow complexity may increase hours.
7. **Email Intake Mailbox** — Is the service intake Exchange Online mailbox already provisioned for D365 server-side sync (REQ-28)?

### Key Assumptions Made

- Oracle Fusion integration uses a batch pattern via middleware; no real-time integration assumed in this estimate.
- D365 Case entity is used as the Service Request entity (not Work Order) unless confirmed otherwise.
- D365 Entitlement entity is used for contract management; a custom entity is conditionally included.
- Power Pages portal is the customer portal platform.
- Round-robin assignment state is stored in a D365 custom configuration entity (no external state store).
- All security roles are modifications to existing roles unless specified as new.
- SLA enforcement uses D365 native SLA entity as a base where applicable.
- Azure Functions are **not** included in this estimate; if the integration platform requires them, additional hours (2–12 Hrs per function) must be added.
