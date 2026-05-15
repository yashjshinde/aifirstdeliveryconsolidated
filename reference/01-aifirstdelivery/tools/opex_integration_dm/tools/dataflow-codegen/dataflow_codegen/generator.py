"""Orchestrate templates + DSL builder to produce an inbound Data Flow per entity."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Any

from .dsl import MdfScript, wrap_arm
from .templates import LookupSpec, TEMPLATES, _apply_aliases, _apply_normalize, _col


def _column_type_for_source(field: dict[str, Any]) -> str:
    """Pick the MDF column type for a source field. Defaults to string."""
    mapping = {
        "text": "string", "int": "integer", "decimal": "decimal",
        "datetime": "string",  # parsed via toTimestamp later
        "date": "string", "bool": "string",
    }
    return mapping.get(field.get("sourceType", "text"), "string")


def _distinct_lookup_specs(entity: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Return one descriptor per distinct (referenceTable, refField) combo across
    all lookup fields, keyed by reference table name (one source per table)."""
    out: dict[str, dict[str, Any]] = {}
    for field in entity.get("fields", []):
        xform = field.get("transform", {})
        if xform.get("type") != "lookup":
            continue
        fwd = xform.get("forward", {})
        rt = fwd.get("referenceTable", "")
        if not rt:
            continue
        if rt not in out:
            out[rt] = {
                "referenceTable":  rt,
                "refField":        fwd.get("refField", ""),
                "primaryIdField":  fwd.get("primaryIdField", ""),
            }
    return out


def generate_inbound_dataflow(
    entity_config: dict[str, Any],
    project_config: dict[str, Any] | None = None,
    *,
    runtime_runid_placeholder: str = "{{runId}}",
) -> dict[str, Any]:
    """Generate the ARM JSON for `df_transform_<entityKey>_inbound`."""
    project_config = project_config or {}
    entity_key = entity_config["entityKey"]
    df_name = f"df_transform_{entity_key}_inbound"

    script = MdfScript()

    # ---- Source: /staged/<entityKey>/<runId>/data.parquet ----
    src_columns = [(_col(f["source"]), _column_type_for_source(f))
                   for f in entity_config.get("fields", [])]
    script.source(
        "srcStaged",
        columns=src_columns,
        path=f"/staged/{entity_key}/{runtime_runid_placeholder}/data.parquet",
    )

    # ---- Sources: one per distinct master table ----
    lookup_specs = _distinct_lookup_specs(entity_config)
    broadcast_threshold = (project_config or {}).get("masterBroadcastThresholdRows", 100000)
    master_streams: dict[str, str] = {}
    for rt, info in lookup_specs.items():
        stream = f"srcMasters_{rt}"
        # We don't know master size at codegen time; default to broadcast left.
        # The audit recommends pulling this from /audit/master_cache_state.json — out of scope here.
        script.source(
            stream,
            columns=[(_col(info["refField"]), "string"), (_col(info["primaryIdField"]), "string")],
            path=f"/masters/{rt}.parquet",
            broadcast="left",
        )
        master_streams[rt] = stream

    # ---- Sequence of Derived Columns + Lookups per field ----
    script.select_stream("srcStaged")

    # Batch all "simple" transforms into one Derived Column per group, then handle
    # lookups one at a time (each needs its own Lookup transformation).
    pending_derives: list[tuple[str, str]] = []

    def flush_derives() -> None:
        nonlocal pending_derives
        if pending_derives:
            script.derive(pending_derives)
            pending_derives = []

    for field in entity_config.get("fields", []):
        xform_type = field.get("transform", {}).get("type")
        if xform_type not in TEMPLATES:
            continue
        result = TEMPLATES[xform_type](field)
        if isinstance(result, LookupSpec):
            # Flush any pending derives before the lookup.
            flush_derives()
            _emit_lookup(script, result, master_streams)
        else:
            pending_derives.extend(result)

    flush_derives()

    # ---- Validation-error split (B012) + alias suggestions (B013) ----
    # __row_valid is set true by default at source; each lookup with onMissing=error
    # ANDs a per-field check into it. Same pattern works for choice/state with onMissing=fail
    # via the case() emitting null when no key matches.
    has_strict_lookup = any(
        f.get("transform", {}).get("type") == "lookup"
        and (f["transform"].get("forward") or {}).get("onMissing", "error") == "error"
        for f in entity_config.get("fields", [])
    )
    has_strict_choice = any(
        f.get("transform", {}).get("type") in {"choice", "state"}
        and (f["transform"].get("forward") or {}).get("onMissing", "fail") == "fail"
        for f in entity_config.get("fields", [])
    )
    has_alias_suggestions = any(
        (f.get("transform", {}).get("forward") or {}).get("onMissing") == "suggestion"
        for f in entity_config.get("fields", [])
    )

    if has_strict_lookup or has_strict_choice or has_alias_suggestions:
        # Build the row-level validity flag
        flag_parts: list[str] = []
        for field in entity_config.get("fields", []):
            x = field.get("transform", {})
            fwd = x.get("forward") or {}
            if x.get("type") == "lookup" and fwd.get("onMissing", "error") == "error":
                # Lookup ok if source was null (and nullBehavior allows) or target resolved
                src = _col(field["source"])
                tgt = _col(field["target"])
                flag_parts.append(f"(isNull({src}) || !isNull({tgt}))")
            elif x.get("type") in {"choice", "state"} and fwd.get("onMissing", "fail") == "fail":
                src = _col(field["source"])
                tgt = _col(field["target"])
                flag_parts.append(f"(isNull({src}) || !isNull({tgt}))")
        validity_expr = " && ".join(flag_parts) if flag_parts else "true()"
        script.derive([("__row_valid", validity_expr)])

        # Conditional Split: valid / errors / suggestions
        branches = [("__row_valid == true()", "valid")]
        if has_alias_suggestions:
            # Suggestion path: any lookup with onMissing=suggestion whose target is null and source non-null
            sug_parts: list[str] = []
            for field in entity_config.get("fields", []):
                x = field.get("transform", {})
                fwd = x.get("forward") or {}
                if fwd.get("onMissing") == "suggestion":
                    src = _col(field["source"])
                    tgt = _col(field["target"])
                    sug_parts.append(f"(!isNull({src}) && isNull({tgt}))")
            sug_expr = " || ".join(sug_parts) if sug_parts else "false()"
            script.derive([("__suggestion_needed", sug_expr)])
            branches.append(("__suggestion_needed == true()", "suggestions"))

        _split_name, _branch_streams = script.split(branches)

        # Valid branch → sinkFinal
        script.select_stream(f"cs_1@valid")
        script.sink("sinkFinal", path=f"/final/{entity_key}/{runtime_runid_placeholder}/data.parquet")

        # Errors branch (rows not matching any valid/suggestion predicate)
        script.select_stream(f"cs_1")  # default stream for unmatched rows
        script.sink(
            "sinkTransformErrors",
            path=f"/errors/{entity_key}/{runtime_runid_placeholder}/transform_errors.parquet",
        )

        # Suggestions branch (if applicable)
        if has_alias_suggestions:
            script.select_stream(f"cs_1@suggestions")
            script.sink(
                "sinkAliasSuggestions",
                path=f"/errors/{entity_key}/{runtime_runid_placeholder}/alias_suggestions.parquet",
            )
    else:
        # No strict transforms — everything to sinkFinal as before.
        script.sink(
            "sinkFinal",
            path=f"/final/{entity_key}/{runtime_runid_placeholder}/data.parquet",
        )

    return wrap_arm(df_name, script.render())


# ---------------------------------------------------------------------------
# B015 — Phase 2 data flow for entities with self-lookups (loadPhase: 2)
# ---------------------------------------------------------------------------
def generate_phase2_dataflow(
    entity_config: dict[str, Any],
    project_config: dict[str, Any] | None = None,
    *,
    runtime_runid_placeholder: str = "{{runId}}",
) -> dict[str, Any] | None:
    """Generate df_phase2_<entityKey>_inbound only if the entity declares any field
    with `loadPhase: 2`. Returns None when no phase-2 fields exist."""
    phase2_fields = [f for f in entity_config.get("fields", []) if f.get("loadPhase") == 2]
    if not phase2_fields:
        return None

    project_config = project_config or {}
    entity_key = entity_config["entityKey"]
    df_name = f"df_phase2_{entity_key}_inbound"

    script = MdfScript()

    # Source: the original raw (phase-1 already loaded the rest of the columns)
    src_columns = [(_col(f["source"]), _column_type_for_source(f))
                   for f in entity_config.get("fields", [])]
    script.source(
        "srcRaw",
        columns=src_columns,
        path=f"/raw/{entity_key}/{runtime_runid_placeholder}/data.parquet",
    )

    # Master sources — only for the phase-2 lookups
    master_streams: dict[str, str] = {}
    for f in phase2_fields:
        fwd = f.get("transform", {}).get("forward") or {}
        rt = fwd.get("referenceTable")
        if rt and rt not in master_streams:
            stream = f"srcMasters_{rt}"
            script.source(
                stream,
                columns=[(_col(fwd["refField"]), "string"),
                         (_col(fwd.get("primaryIdField", "")), "string")],
                path=f"/masters/{rt}.parquet",
                broadcast="left",
            )
            master_streams[rt] = stream

    # Project just the alt-keys (so the load can locate the existing row)
    alt_keys: list[str] = entity_config.get("target", {}).get("alternateKey", [])
    keep_cols: list[tuple[str, str]] = []
    for ak in alt_keys:
        # Find the source-side column for each alt-key
        for f in entity_config.get("fields", []):
            if f["target"] == ak:
                keep_cols.append((ak, f"toString({_col(f['source'])})"))
                break

    # Then derive the phase-2 lookup columns
    script.select_stream("srcRaw")
    for f in phase2_fields:
        from .templates import LookupSpec, TEMPLATES
        result = TEMPLATES["lookup"](f)
        if isinstance(result, LookupSpec):
            _emit_lookup(script, result, master_streams)

    # Select only alt-keys + phase-2 columns for the sink
    final_cols = list(keep_cols)
    for f in phase2_fields:
        final_cols.append((f["target"], _col(f["target"])))
    if final_cols:
        script.derive(final_cols)

    script.sink(
        "sinkPhase2",
        path=f"/final/{entity_key}/{runtime_runid_placeholder}/phase2.parquet",
    )

    return wrap_arm(df_name, script.render())


def _emit_lookup(script: MdfScript, spec: LookupSpec, master_streams: dict[str, str]) -> None:
    """Emit normalize → alias → Lookup → emit GUID for one lookup field."""
    rt = spec.reference_table
    right_stream = master_streams.get(rt)
    if right_stream is None:
        # Unknown master — emit a no-op derive that copies source to target as text.
        script.derive([(spec.target_column, f"toString({_col(spec.source_column_for_key)})")])
        return

    src_col = _col(spec.source_column_for_key)
    normalized = _apply_normalize(src_col, spec.normalize_steps)
    canonical = _apply_aliases(normalized, spec.alias_map)
    # Stage the canonical lookup key as its own column so we can reference it in the Lookup join.
    key_col = f"__lookup_key_{spec.target_column}"
    script.derive([(key_col, canonical)])
    # Lookup join condition (MDF Lookup uses the `on` shape: leftCol == rightStream.rightCol)
    on_expr = f"{key_col} == {right_stream}@{_col(spec.ref_field)}"
    # Note: MDF's actual lookup() syntax matches by column-pair tuples; this is the simplified form
    # that ADF Studio re-emits when the script is imported. The runtime accepts both shapes.
    script.lookup(right_stream, on_expr, broadcast=spec.broadcast)
    # Emit the resolved GUID into the target column. If the lookup missed, the value is null.
    script.derive([(spec.target_column, f"{right_stream}@{_col(spec.primary_id_field)}")])


def write_dataflow_arm(arm: dict[str, Any], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as fh:
        json.dump(arm, fh, indent=2, ensure_ascii=False)
        fh.write("\n")


# ---------------------------------------------------------------------------
# Outbound generation
# ---------------------------------------------------------------------------
def generate_outbound_dataflow(
    entity_config: dict[str, Any],
    project_config: dict[str, Any] | None = None,
    *,
    runtime_runid_placeholder: str = "{{runId}}",
) -> dict[str, Any]:
    """Generate `df_transform_<entityKey>_outbound`.

    Reads /raw/<entityKey>/<runId>/data.parquet (Dataverse extract output) and
    applies each transform's REVERSE branch. Auto-invertible transforms (direct,
    choice, state, yesNo, dateTime) invert their forward map at codegen time.
    Lookup fields use the Dataverse $expand result (preferred) or join /masters.
    Non-invertible transforms (concat, split, conditional) require an explicit
    reverse block in the config — if missing, the field is skipped with a comment.
    """
    project_config = project_config or {}
    entity_key = entity_config["entityKey"]
    df_name = f"df_transform_{entity_key}_outbound"

    script = MdfScript()

    # Source columns are the DV-side schema names (since we read the extract).
    src_columns: list[tuple[str, str]] = []
    for f in entity_config.get("fields", []):
        tgt = f["target"]
        # `target` may be an OOB DV schema name with mixed casing — wrap in backticks if needed
        src_columns.append((_col(tgt), "string"))

    script.source(
        "srcRaw",
        columns=src_columns,
        path=f"/raw/{entity_key}/{runtime_runid_placeholder}/data.parquet",
    )

    # Build reverse Derived Column entries per field
    pending_derives: list[tuple[str, str]] = []
    for field in entity_config.get("fields", []):
        if field.get("outboundInclude", True) is False:
            continue
        xform = field.get("transform", {})
        xtype = xform.get("type")
        rev = _reverse_expression(field, xform, xtype)
        if rev is None:
            continue  # skipped (e.g. non-invertible without reverse block)
        pending_derives.append(rev)

    if pending_derives:
        script.derive(pending_derives)

    script.sink(
        "sinkFinalOut",
        path=f"/staged-out/{entity_key}/{runtime_runid_placeholder}/data.parquet",
    )

    return wrap_arm(df_name, script.render())


def _reverse_expression(
    field: dict[str, Any],
    xform: dict[str, Any],
    xtype: str,
) -> tuple[str, str] | None:
    """Return (source_column_name, MDF expression) for the reverse of one field, or None."""
    from .templates import _quote

    src_name = field["source"]
    tgt_col = _col(field["target"])
    src_type = field.get("sourceType", "text")

    if xtype == "direct":
        # cast DV value back to source type / format
        if src_type == "datetime":
            return (src_name, f"toString(toTimestamp({tgt_col}), 'yyyy-MM-dd HH:mm:ss')")
        if src_type == "date":
            return (src_name, f"toString(toDate({tgt_col}), 'yyyy-MM-dd')")
        if src_type == "int":
            return (src_name, f"toString(toInteger({tgt_col}))")
        if src_type == "decimal":
            return (src_name, f"toString(toDecimal({tgt_col}))")
        if src_type == "bool":
            return (src_name, f"toString(toBoolean({tgt_col}))")
        return (src_name, f"toString({tgt_col})")

    fwd = xform.get("forward") or {}

    if xtype in {"choice", "state"}:
        # Inverse case: int → label
        pairs: list[str] = []
        for label, value in (fwd.get("map") or {}).items():
            pairs.append(f"equals({tgt_col}, {value})")
            pairs.append(_quote(label))
        pairs.append(f"toString({tgt_col})")  # fallback when no key matches
        return (src_name, "case(" + ", ".join(pairs) + ")")

    if xtype == "yesNo":
        true_v = _quote((fwd.get("trueValues") or ["Y"])[0])
        false_v = _quote((fwd.get("falseValues") or ["N"])[0])
        return (src_name, f"iif({tgt_col} == true(), {true_v}, {false_v})")

    if xtype == "dateTime":
        in_fmt = _quote(fwd.get("inputFormat", "yyyy-MM-dd HH:mm:ss"))
        src_tz = fwd.get("sourceTz", "UTC")
        if src_tz.upper() == "UTC":
            return (src_name, f"toString(toTimestamp({tgt_col}), {in_fmt})")
        return (src_name, f"toString(fromUTC(toTimestamp({tgt_col}), {_quote(src_tz)}), {in_fmt})")

    if xtype == "map":
        # If forward.map is 1:1 we can auto-invert
        m = fwd.get("map") or {}
        values = list(m.values())
        if len(values) != len(set(map(_hashable_v, values))):
            return None  # not 1:1 — requires explicit reverse.map
        pairs2: list[str] = []
        for key, val in m.items():
            pairs2.append(f"equals({tgt_col}, {_quote(val)})")
            pairs2.append(_quote(key))
        pairs2.append(f"toString({tgt_col})")
        return (src_name, "case(" + ", ".join(pairs2) + ")")

    if xtype == "lookup":
        # Prefer the DV $expand result (a column named per the navigationProperty + refField)
        nav = fwd.get("navigationProperty", "")
        ref_field = fwd.get("refField", "")
        if nav and ref_field:
            # Backtick-quote the dotted nav-prop reference
            return (src_name, f"`{nav}.{ref_field}`")
        # Otherwise we'd need a Lookup against /masters — emit a placeholder for now
        return (src_name, f"toString({tgt_col})")

    if xtype in {"concat", "split", "conditional"}:
        # Require explicit reverse — skip if missing
        rev = xform.get("reverse")
        if not rev:
            return None
        # conditional: writes[] produces multiple output columns; we can only emit one
        # per call here, so we emit the first one. For full support, the caller would
        # need to enumerate writes[] separately. For v1 this is acceptable since the
        # conditional transforms in Customer/Site/Contact have multiple outputs each
        # and the workbook author would handle this with multiple `direct` mappings.
        if xtype == "conditional" and rev.get("writes"):
            w = rev["writes"][0]
            from .templates import _compile_when
            when_expr = _compile_when(w["when"]) if "=" in w["when"] else w["when"]
            return (w["column"], f"iif({when_expr}, {_quote(w['value'])}, {_quote(w.get('elseValue'))})")
        if xtype == "concat" and rev.get("regex"):
            # group 1 by default — caller should split into multiple direct mappings for full coverage
            return (src_name, f"regexExtract({tgt_col}, {_quote(rev['regex'])}, 1)")
        if xtype == "split" and rev.get("inputs"):
            inputs = [_col(i) for i in rev["inputs"]]
            sep = _quote(rev.get("separator", ""))
            args = ", ".join([sep] + inputs)
            return (src_name, f"concatWS({args})")
        return None

    return None


def _hashable_v(v: Any) -> Any:
    if isinstance(v, list):
        return tuple(_hashable_v(x) for x in v)
    if isinstance(v, dict):
        return tuple(sorted((k, _hashable_v(val)) for k, val in v.items()))
    return v
