---
applyTo: "output/**"
description: "Solution Estimate constitution rules — auto-injected when editing estimation artifacts. Enforces factor-based estimation, uncertainty disclosure, brownfield adjustments, and phase multiplier application."
---

# Solution Estimate Constitution — Always-On Rules

These rules apply to ALL Solution Estimate artifacts. They are hard constraints, not suggestions.

## Estimation Levels

| Level | Command | Confidence | Work Item Depth |
|---|---|---|---|
| ROM | `/solution-estimate-rom` | ±40% | L1/L2 only |
| Structured | `/solution-estimate-spec` | ±20% | L1/L2/L3 |
| Detailed | `/solution-estimate-plan` | ±10% | L1/L2/L3/L4 |

Never produce L3/L4 breakdowns for a ROM estimate. Never claim higher confidence than the estimation level supports.

## Factor Rates

- **Never hardcode rates** — always read from `constitution/21-factor-rates.md`
- Factor rates are per-factor, per-complexity (S/M/C/VC) in hours
- New factors must be proposed in `proposed-factors.md` before use — never invent a rate

## Phase Multipliers

- **Never hardcode phase multipliers** — always read from `constitution/22-estimation-rules.md`
- All 5 phases applied to every deliverable: Plan & Design, Test Creation, Test Execution, Dev Fix, Deployment
- Phase multipliers sum to 2.30× base build hours

## Brownfield Adjustments

| Component Status | Rate Adjustment |
|---|---|
| NEW | 100% |
| EXTEND | 60% of base hours |
| REPLACE | 1.15× of base hours |
| REFERENCED | 0 hours |

## Uncertainty Disclosure

- Every estimate document must include the uncertainty range (±40%, ±20%, or ±10%)
- ROM estimates must include: "This ROM estimate carries ±40% uncertainty. Structured or detailed estimation is required before committing to delivery."

## Formal Deliverable Structure

The formal deliverable (from `/solution-estimate-build`) consists of exactly 3 files:
1. Business Requirements Detail — requirement-level breakdown
2. Module Build Hours — build phase hours per module
3. Module Overall Hours — all phases applied, per module, totals
