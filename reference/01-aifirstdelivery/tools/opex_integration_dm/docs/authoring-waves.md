# Authoring waves

A **wave** is the framework's metadata layer that orchestrates **multiple entities** together with explicit phase + dependency ordering. The Oracle Fusion daily load is one wave; future feeds get their own waves.

This doc covers: when you need a wave, how the config is structured, how dependencies map to ADF behavior, and how to add a new wave.

## When you need a wave

You need a wave when:

- **Two or more entities must run on a coordinated schedule** with shared identity (`waveRunId`) for audit and reprocessing.
- **One entity references another** by alt-key (Site looks up Account; Contact has N:N to Account). The wave guarantees the referenced entity is loaded first.
- **You want one summary email per scheduled load**, not three (today three notifications would fire from three independent entity triggers).

You do **not** need a wave when an entity runs entirely independently — keep it on a per-entity trigger and skip the wave layer.

## Anatomy of a wave config

`config/waves/oracle_fusion_daily.json`:

```json
{
  "$schemaVersion": "1",
  "waveKey": "oracle_fusion_daily",
  "direction": "inbound",
  "entities": [
    { "entityKey": "customer", "phase": 1, "dependsOn": [],           "concurrent": false },
    { "entityKey": "site",     "phase": 2, "dependsOn": ["customer"], "concurrent": true  },
    { "entityKey": "contact",  "phase": 2, "dependsOn": ["customer"], "concurrent": true  }
  ],
  "failurePolicy": {
    "onEntityFailure":         "continueIndependent",
    "onDependencyFailure":     "skipDependent",
    "wavePartialThresholdPct": 10
  },
  "masterCacheRefresh": "betweenPhases",
  "configVersion":     "latest",
  "notification": { "onWaveFailure": [], "onWavePartial": [] }
}
```

The schema is at [`/config/schemas/wave.schema.json`](../config/schemas/wave.schema.json); `validate-config` enforces it.

### `phase` — coarse ordering

Everything in phase N runs only after every entity in phase N-1 finishes. Phases are sequential, never parallel. Use phase 1 for things others depend on; phase 2 for the dependents; phase 3 if a deeper chain ever exists.

Numbering: contiguous, starting at 1. `validate-config` V033 fails if you skip a number.

### `dependsOn` — fine-grained edges

This is the dependency edge inside or across phases. Two things use it:

1. **Failure propagation.** When `failurePolicy.onDependencyFailure=skipDependent`, an entity is skipped if any of its `dependsOn` failed.
2. **Cache refresh scoping.** With `masterCacheRefresh=betweenPhases`, only the masters touched by `dependsOn` entities get refreshed.

`dependsOn` must reference entities **in the same wave**. `validate-config` V031 catches violations.

You'll also get `V032` if the dependency points to an entity in a later phase ("phase ordering violation").

### `concurrent` — within a phase

When two entities are in the same phase and `concurrent: true` on both, ADF runs them in parallel (up to `ForEach.batchCount=4` in `pl_wave_orchestrator`). When `false`, the ForEach runs sequentially — useful when two entities in the same phase still need to be ordered.

### `failurePolicy`

```json
"failurePolicy": {
  "onEntityFailure":         "continueIndependent",
  "onDependencyFailure":     "skipDependent",
  "wavePartialThresholdPct": 10
}
```

- **`onEntityFailure`** = `stopWave` | `continueIndependent` | `continueAll`
  - `stopWave`: any entity failure halts the whole wave immediately. Strict.
  - `continueIndependent`: entities not dependent on the failed one keep running. **Recommended default.**
  - `continueAll`: every entity runs regardless. Most permissive.

- **`onDependencyFailure`** = `skipDependent` | `runAnyway`
  - `skipDependent`: dependents of a failed entity don't run. **Recommended default.**
  - `runAnyway`: dependents try anyway. Useful only if upstream's failure is a known fault tolerance.

- **`wavePartialThresholdPct`** is the **cross-entity error rate** above which the wave's status becomes Failed even if no individual entity failed outright.

### `masterCacheRefresh`

- **`betweenPhases`** (recommended) — refresh `/masters/*.parquet` between phases so phase N+1 sees rows phase N just loaded.
- **`beforeEachEntity`** — refresh before every entity. Highest correctness, slowest. Use when entities in the same phase write to the same master.
- **`never`** — use the prefetch TTL only. Acceptable when no entity in the wave writes to a master another entity reads.

### `configVersion`

- **`pinAtWaveStart`** — snapshot every entity config at wave start into `/audit/wave_runs/<waveRunId>/configs/`. The wave runs against the snapshot regardless of mid-wave config edits. **Use for compliance-sensitive runs.**
- **`latest`** (default) — each entity reads its own config at its own start.

## How wave config maps to ADF behavior

The wave orchestrator pipeline is `pl_wave_orchestrator`. The flow is:

```
SetVar_WaveRunId
   │ (use priorWaveRunId if supplied, otherwise pipeline().RunId)
Lookup_WaveConfig
   │
Filter_Phase1 → ForEach_Phase1Entity (parallel within phase) → pl_master_orchestrator
   │
Filter_Phase2 → ForEach_Phase2Entity (parallel within phase) → pl_master_orchestrator
   │
Filter_Phase3 → ForEach_Phase3Entity (parallel within phase) → pl_master_orchestrator
   │
Copy_WaveSummary → /audit/wave_runs/<waveRunId>/wave_summary.json
```

Each entity is invoked through `pl_master_orchestrator` with the wave's `waveRunId` propagated. The entity orchestrator writes its per-entity status to `/audit/wave_runs/<waveRunId>/<entityKey>.json`.

## Adding a new wave

### Step 1 — write the wave JSON

Create `config/waves/<waveKey>.json` based on the template:

```json
{
  "$schemaVersion": "1",
  "waveKey": "<my_wave>",
  "direction": "inbound",
  "entities": [
    { "entityKey": "...", "phase": 1, "dependsOn": [] },
    { "entityKey": "...", "phase": 2, "dependsOn": ["..."] }
  ],
  "failurePolicy": {
    "onEntityFailure": "continueIndependent",
    "onDependencyFailure": "skipDependent",
    "wavePartialThresholdPct": 10
  },
  "masterCacheRefresh": "betweenPhases",
  "configVersion": "latest"
}
```

### Step 2 — validate

```powershell
py -3 -m validate_config config
```

You'll catch:
- `V005` — filename doesn't match `waveKey`.
- `V010` — entity referenced doesn't have a JSON in `/config/entities/`.
- `V011` — wave direction is incompatible with the entity's direction.
- `V030` — `dependsOn` forms a cycle.
- `V031` — `dependsOn` points outside the wave.
- `V032` — phase ordering violates `dependsOn`.
- `V033` — phase numbering has gaps.

### Step 3 — add a trigger

Create a new trigger in `adf/triggers/`. Template (copy from `tr_wave_oracle_fusion_daily.json`):

```json
{
  "name": "tr_wave_<my_wave>_daily",
  "type": "Microsoft.DataFactory/factories/triggers",
  "properties": {
    "runtimeState": "Stopped",
    "pipelines": [
      {
        "pipelineReference": { "referenceName": "pl_wave_orchestrator", "type": "PipelineReference" },
        "parameters": { "waveKey": "<my_wave>", "runMode": "incremental" }
      }
    ],
    "type": "ScheduleTrigger",
    "typeProperties": {
      "recurrence": {
        "frequency": "Day",
        "interval": 1,
        "startTime": "<YYYY-MM-DD>T<HH:MM>:00Z",
        "timeZone": "UTC",
        "schedule": { "hours": [<HH>], "minutes": [<MM>] }
      }
    }
  }
}
```

Always start triggers with `runtimeState: "Stopped"`. Enable them in ADF Studio (or via `az datafactory trigger start`) **after** the first manual run succeeds.

### Step 4 — deploy

```powershell
./infra/deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev -SkipBicep
```

`-SkipBicep` re-publishes only the ADF artifacts and re-uploads `/config/` — no infra changes.

### Step 5 — first run, then enable trigger

In ADF Studio, manually trigger `pl_wave_orchestrator` with your `waveKey`. After it succeeds end-to-end, set the trigger's `runtimeState` to `Started`.

## Reprocessing inside a wave

`pl_wave_orchestrator` accepts an `entityFilter` parameter:

```
pl_wave_orchestrator(
  waveKey="oracle_fusion_daily",
  entityFilter=["site"],
  priorWaveRunId="<original-waveRunId>"
)
```

This re-runs **only** Site under the same `waveRunId`, inheriting the prior wave's master caches. Pass `priorWaveRunId` so the audit trail stays coherent.

See [operations.md](operations.md) for the full reprocess flow.

## What waves do **not** do (today)

- **Notifications** — `notification.onWaveFailure` / `onWavePartial` exist in the config schema but the actual Logic App wrapper is deferred to v2 (per the user decision in implementation.md). Wave status is visible via `/audit/wave_runs/<waveRunId>/wave_summary.json` and ADF Monitor today; email/Teams cards come later.

- **Selective failure-policy enforcement.** The shipped `pl_wave_orchestrator` runs all entities in dependency order but does **not** yet honor `onEntityFailure: stopWave` or `onDependencyFailure: skipDependent` programmatically — it always continues. The wave summary captures status accurately, but mid-wave halt-on-failure is a planned enhancement. Track as `Phase 2 enhancement` in `implementation.md` §7.

- **Wave-level retry/backoff.** Each entity orchestrator has its own retry budget; the wave doesn't re-fire an entity on transient failure. If you need that, re-run the wave manually with `priorWaveRunId`.

These are deliberate v1 cuts — the wave model is fully designed (spec §5), the orchestrator implements the happy path, and the harder failure-routing logic ships in v2.
