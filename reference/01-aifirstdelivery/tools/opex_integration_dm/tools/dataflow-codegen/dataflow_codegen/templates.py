"""Per-transform-type MDF expression templates.

Each function takes the field config plus useful context and returns a list of
(target_column_name, mdf_expression) tuples that should appear inside the same
Derived Column transformation. For lookup transforms (the only one that needs
its own dedicated MDF transformation, not just a Derived Column), the function
returns a special marker so the orchestrator inserts a Lookup transformation.

All expressions in this module use real MDF expression language only — verified
against learn.microsoft.com/azure/data-factory/data-flow-expression-functions.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class LookupSpec:
    """Marker returned by lookup-type templates so the orchestrator knows to insert
    a Lookup transformation, not just a Derived Column."""
    target_column: str
    source_column_for_key: str
    normalize_steps: list[str]   # list of MDF expression layers to apply to the key
    alias_map: dict[str, str]    # variant → canonical
    reference_table: str
    ref_field: str
    primary_id_field: str
    broadcast: str               # 'left' | 'auto'
    on_missing: str              # error | useDefault | passNull | suggestion
    default_value: Any
    null_behavior: str           # clear | skip


# ---------------------------------------------------------------------------
# Cast helpers
# ---------------------------------------------------------------------------
_MDF_TYPE_CAST = {
    "text":     "toString",
    "int":      "toInteger",
    "decimal":  "toDecimal",
    "datetime": "toTimestamp",
    "dateonly": "toDate",
    "bool":     "toBoolean",
    "choice":   "toInteger",
    "state":    "toInteger",
    "lookup":   "toString",
}


def _cast(value_expr: str, target_type: str) -> str:
    fn = _MDF_TYPE_CAST.get(target_type, "toString")
    if target_type == "datetime":
        return f"toTimestamp({value_expr}, 'yyyy-MM-dd HH:mm:ss')"
    if target_type == "dateonly":
        return f"toDate({value_expr}, 'yyyy-MM-dd')"
    return f"{fn}({value_expr})"


def _quote(value: Any) -> str:
    """Render a Python value as an MDF literal."""
    if value is None:
        return "null()"
    if isinstance(value, bool):
        return "true()" if value else "false()"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return "'" + value.replace("'", "\\'") + "'"
    raise ValueError(f"unsupported literal: {value!r}")


# ---------------------------------------------------------------------------
# Per-type templates
# Each returns a list of (col_name, expr) — Derived Column entries — OR a LookupSpec.
# ---------------------------------------------------------------------------
def tf_direct(field: dict[str, Any]) -> list[tuple[str, str]]:
    src = field["source"]
    tgt = field["target"]
    return [(tgt, _cast(_col(src), field["targetType"]))]


def tf_concat(field: dict[str, Any]) -> list[tuple[str, str]]:
    fwd = field["transform"]["forward"]
    inputs = [_col(i) for i in fwd["inputs"]]
    sep = _quote(fwd["separator"])
    args = ", ".join([sep] + inputs)
    return [(fwd["target"], f"concatWS({args})")]


def tf_split(field: dict[str, Any]) -> list[tuple[str, str]]:
    fwd = field["transform"]["forward"]
    src = _col(fwd["input"])
    regex = _quote(fwd["regex"])
    return [(out, f"regexExtract({src}, {regex}, {i + 1})") for i, out in enumerate(fwd["outputs"])]


def tf_conditional(field: dict[str, Any]) -> list[tuple[str, str]]:
    fwd = field["transform"]["forward"]
    parts: list[str] = []
    for rule in fwd.get("rules", []):
        parts.append(_compile_when(rule["when"]))
        parts.append(_quote(rule["value"]))
    parts.append(_quote(fwd.get("default")))
    expr = "case(" + ", ".join(parts) + ")"
    return [(field["target"], expr)]


def tf_map(field: dict[str, Any]) -> list[tuple[str, str]]:
    return _build_choice_like(field, integer_values=False)


def tf_choice(field: dict[str, Any]) -> list[tuple[str, str]]:
    return _build_choice_like(field, integer_values=True)


def tf_state(field: dict[str, Any]) -> list[tuple[str, str]]:
    return _build_choice_like(field, integer_values=True)


def _build_choice_like(field: dict[str, Any], *, integer_values: bool) -> list[tuple[str, str]]:
    fwd = field["transform"]["forward"]
    src_col = _apply_normalize(_col(field["source"]), fwd.get("normalize") or [])
    src_col = _apply_aliases(src_col, fwd.get("aliases") or {})
    pairs: list[str] = []
    for k, v in (fwd.get("map") or {}).items():
        pairs.append(f"equals({src_col}, {_quote(k)})")
        pairs.append(str(v) if integer_values else _quote(v))
    pairs.append(_quote(fwd.get("default")))
    expr = "case(" + ", ".join(pairs) + ")"
    return [(field["target"], expr)]


def tf_yesno(field: dict[str, Any]) -> list[tuple[str, str]]:
    fwd = field["transform"]["forward"]
    src = _col(field["source"])
    true_disjunction = "or(" + ", ".join(f"equals({src}, {_quote(v)})" for v in fwd["trueValues"]) + ")"
    false_disjunction = "or(" + ", ".join(f"equals({src}, {_quote(v)})" for v in fwd["falseValues"]) + ")"
    expr = f"case({true_disjunction}, true(), {false_disjunction}, false(), null())"
    return [(field["target"], expr)]


def tf_datetime(field: dict[str, Any]) -> list[tuple[str, str]]:
    fwd = field["transform"]["forward"]
    src = _col(field["source"])
    in_fmt = _quote(fwd.get("inputFormat", "yyyy-MM-dd HH:mm:ss"))
    src_tz = fwd.get("sourceTz", "UTC")
    if src_tz.upper() == "UTC":
        # already UTC; just parse + format
        expr = f"toTimestamp({src}, {in_fmt})"
    else:
        # parse, then convert TZ to UTC
        expr = f"toUTC(toTimestamp({src}, {in_fmt}), {_quote(src_tz)})"
    return [(field["target"], expr)]


def tf_lookup(field: dict[str, Any]) -> LookupSpec:
    fwd = field["transform"]["forward"]
    return LookupSpec(
        target_column=field["target"],
        source_column_for_key=field["source"],
        normalize_steps=fwd.get("normalize") or [],
        alias_map=fwd.get("aliases") or {},
        reference_table=fwd["referenceTable"],
        ref_field=fwd["refField"],
        primary_id_field=fwd.get("primaryIdField", ""),
        broadcast="left",
        on_missing=fwd.get("onMissing", "error"),
        default_value=fwd.get("default"),
        null_behavior=fwd.get("nullBehavior", "clear"),
    )


# ---------------------------------------------------------------------------
# Normalize and alias helpers — used by lookup, choice, state, map
# ---------------------------------------------------------------------------
def _apply_normalize(expr: str, rules: list[str]) -> str:
    """Wrap `expr` in MDF normalize functions per the rules list."""
    out = expr
    for rule in rules:
        if rule == "trim":
            out = f"trim({out})"
        elif rule == "collapseWhitespace":
            out = f"regexReplace({out}, '\\s+', ' ')"
        elif rule == "toLowerCase":
            out = f"lower({out})"
        elif rule == "toUpperCase":
            out = f"upper({out})"
        elif rule == "stripPunctuation":
            out = f"regexReplace({out}, '[\\p{{P}}]', '')"
        elif rule == "stripDiacritics":
            # MDF lacks a direct unaccent — leave a comment-form for human review.
            out = f"/* stripDiacritics: implement via Spark UDF */ {out}"
        elif rule.startswith("removeRegex:"):
            pat = rule[len("removeRegex:"):]
            out = f"regexReplace({out}, '{pat.replace(chr(39), chr(92)+chr(39))}', '')"
    return out


def _apply_aliases(expr: str, aliases: dict[str, str]) -> str:
    """Wrap `expr` in a `case(equals(x, 'variant'), 'canonical', ..., x)` chain."""
    if not aliases:
        return expr
    pairs = []
    for variant, canonical in aliases.items():
        pairs.append(f"equals({expr}, {_quote(variant)})")
        pairs.append(_quote(canonical))
    pairs.append(expr)
    return "case(" + ", ".join(pairs) + ")"


def _compile_when(when: str) -> str:
    """Translate a config 'when' string like 'PRIMARY_MOBILE_PHONE=Y' to MDF expression."""
    if "=" in when and not any(op in when for op in ("==", "!=", ">=", "<=")):
        col, val = when.split("=", 1)
        return f"equals({_col(col.strip())}, {_quote(val.strip())})"
    return when


def _col(name: str) -> str:
    """Return an MDF column reference. Names with non-identifier chars need backtick quoting."""
    if name.replace("_", "").isalnum() and not name[:1].isdigit():
        return name
    return f"`{name}`"


# ---------------------------------------------------------------------------
# Dispatch table
# ---------------------------------------------------------------------------
TEMPLATES = {
    "direct":      tf_direct,
    "concat":      tf_concat,
    "split":       tf_split,
    "conditional": tf_conditional,
    "map":         tf_map,
    "choice":      tf_choice,
    "state":       tf_state,
    "yesNo":       tf_yesno,
    "dateTime":    tf_datetime,
    "lookup":      tf_lookup,
}
