"""Tests for dataflow-codegen against the shipped configs."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from dataflow_codegen.dsl import MdfScript, wrap_arm
from dataflow_codegen.generator import generate_inbound_dataflow
from dataflow_codegen.templates import (
    TEMPLATES, LookupSpec, tf_choice, tf_concat, tf_conditional,
    tf_datetime, tf_direct, tf_lookup, tf_state, tf_yesno,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
CONFIG_DIR = REPO_ROOT / "config"


# ---------------------------------------------------------------------------
# Template-level tests — verify each transform's MDF expression shape
# ---------------------------------------------------------------------------
def test_direct_text():
    field = {"source": "X", "target": "x", "targetType": "text",
             "transform": {"type": "direct"}}
    assert tf_direct(field) == [("x", "toString(X)")]


def test_direct_int():
    field = {"source": "X", "target": "x", "targetType": "int",
             "transform": {"type": "direct"}}
    assert tf_direct(field) == [("x", "toInteger(X)")]


def test_concat():
    field = {"source": "_", "target": "_", "targetType": "text",
             "transform": {"type": "concat",
                           "forward": {"inputs": ["A", "B"], "separator": " ", "target": "ab"},
                           "reverse": {"input": "ab", "regex": "(.+) (.+)"}}}
    out = tf_concat(field)
    assert out == [("ab", "concatWS(' ', A, B)")]


def test_state():
    field = {"source": "STATUS", "target": "statecode", "targetType": "state",
             "transform": {"type": "state",
                           "forward": {"map": {"A": 0, "I": 1}, "default": 0}}}
    expr = tf_state(field)[0][1]
    assert "case(" in expr
    assert "equals(STATUS, 'A')" in expr
    assert "0" in expr  # value
    assert "equals(STATUS, 'I')" in expr


def test_choice_with_aliases_and_normalize():
    field = {"source": "CITY", "target": "city", "targetType": "choice",
             "transform": {"type": "choice",
                           "forward": {
                               "map": {"Delhi": 884870000, "Mumbai": 884870001},
                               "default": None,
                               "onMissing": "fail",
                               "normalize": ["trim", "toLowerCase"],
                               "aliases": {"delhi": "Delhi", "new delhi": "Delhi", "bombay": "Mumbai"},
                           }}}
    expr = tf_choice(field)[0][1]
    # Normalize chain — note alias resolution happens BEFORE the map case().
    # The map case() then compares against canonical names, which after lower()
    # of the source won't match — this is a known limitation; the alias output
    # must match the map keys exactly. Both 'Delhi' and 'delhi' map to 'Delhi' here.
    assert "lower(" in expr
    assert "trim(" in expr
    assert "equals(case(" in expr  # the alias case() wraps the normalized value
    assert "'Delhi'" in expr
    assert "884870000" in expr


def test_yesno():
    field = {"source": "CreditHold", "target": "creditonhold", "targetType": "bool",
             "transform": {"type": "yesNo",
                           "forward": {"trueValues": ["Y", "Yes"], "falseValues": ["N", "No"]}}}
    expr = tf_yesno(field)[0][1]
    assert "equals(CreditHold, 'Y')" in expr
    assert "true()" in expr and "false()" in expr


def test_datetime_utc_passthrough():
    field = {"source": "LAST_UPDATE_DATE", "target": "modifiedon", "targetType": "datetime",
             "transform": {"type": "dateTime",
                           "forward": {"sourceTz": "UTC", "targetTz": "UTC",
                                       "inputFormat": "yyyy-MM-dd HH:mm:ss",
                                       "outputFormat": "yyyy-MM-ddTHH:mm:ssZ"}}}
    expr = tf_datetime(field)[0][1]
    # Source is UTC so we don't wrap toUTC; just toTimestamp.
    assert "toTimestamp" in expr
    assert "toUTC" not in expr


def test_datetime_with_source_tz():
    field = {"source": "X", "target": "y", "targetType": "datetime",
             "transform": {"type": "dateTime",
                           "forward": {"sourceTz": "America/Chicago", "targetTz": "UTC",
                                       "inputFormat": "yyyy-MM-dd HH:mm:ss",
                                       "outputFormat": "yyyy-MM-ddTHH:mm:ssZ"}}}
    expr = tf_datetime(field)[0][1]
    assert "toUTC" in expr and "America/Chicago" in expr


def test_conditional():
    field = {"source": "_", "target": "primaryphonetype", "targetType": "choice",
             "transform": {"type": "conditional",
                           "forward": {
                               "rules": [
                                   {"when": "PRIMARY_MOBILE=Y", "value": 884870000},
                                   {"when": "PRIMARY_LAND=Y",   "value": 884870002},
                               ],
                               "default": None,
                           }}}
    expr = tf_conditional(field)[0][1]
    assert "case(" in expr
    assert "equals(PRIMARY_MOBILE, 'Y')" in expr
    assert "884870000" in expr
    assert "null()" in expr


def test_lookup_returns_spec():
    field = {"source": "EQUIPMET_DISCOUNT", "target": "opx_EquipmentDiscountId",
             "targetType": "lookup",
             "transform": {"type": "lookup",
                           "forward": {
                               "referenceTable": "opx_equipmentdiscount",
                               "entitySetName":  "opx_equipmentdiscounts",
                               "navigationProperty": "opx_EquipmentDiscount",
                               "refField": "opx_code",
                               "primaryIdField": "opx_equipmentdiscountid",
                           }}}
    spec = tf_lookup(field)
    assert isinstance(spec, LookupSpec)
    assert spec.reference_table == "opx_equipmentdiscount"
    assert spec.ref_field == "opx_code"


# ---------------------------------------------------------------------------
# End-to-end: generate a Data Flow for Customer from the shipped config
# ---------------------------------------------------------------------------
def test_generate_customer_dataflow_smoke():
    cfg = json.loads((CONFIG_DIR / "entities" / "customer.json").read_text(encoding="utf-8"))
    project = json.loads((CONFIG_DIR / "_project.json").read_text(encoding="utf-8"))
    arm = generate_inbound_dataflow(cfg, project)
    assert arm["name"] == "df_transform_customer_inbound"
    assert arm["type"] == "Microsoft.DataFactory/factories/dataflows"
    lines = arm["properties"]["typeProperties"]["scriptLines"]
    assert any("srcStaged" in ln for ln in lines)
    assert any("srcMasters_opx_equipmentdiscount" in ln for ln in lines)
    assert any("sinkFinal" in ln for ln in lines)
    # The phase-2 self-lookup (BILL_TO_ACCOUNT → msdyn_billingaccount) — its referenceTable
    # is `account` so there should be a srcMasters_account source.
    assert any("srcMasters_account" in ln for ln in lines)
    # No phantom MDF function names from the prior draft
    full = "\n".join(lines)
    assert "assignAs(" not in full
    assert "mapLookup(" not in full
    assert "toError(" not in full


def test_generate_site_dataflow_smoke():
    cfg = json.loads((CONFIG_DIR / "entities" / "site.json").read_text(encoding="utf-8"))
    arm = generate_inbound_dataflow(cfg)
    assert arm["name"] == "df_transform_site_inbound"
    assert "scriptLines" in arm["properties"]["typeProperties"]


def test_generate_contact_dataflow_smoke():
    cfg = json.loads((CONFIG_DIR / "entities" / "contact.json").read_text(encoding="utf-8"))
    arm = generate_inbound_dataflow(cfg)
    assert arm["name"] == "df_transform_contact_inbound"
    lines = arm["properties"]["typeProperties"]["scriptLines"]
    # Contact has two conditional transforms (primary phone / email type).
    joined = "\n".join(lines)
    assert "opx_primaryphonetype" in joined
    assert "opx_primaryemailtype" in joined


def test_dsl_builder_produces_valid_chain():
    s = MdfScript()
    s.source("srcStaged", columns=[("X", "string")], path="/staged/x.parquet")
    s.derive([("y", "toString(X)")])
    s.sink("sinkFinal", path="/final/y.parquet")
    lines = s.render()
    assert len(lines) == 3
    assert "~> srcStaged" in lines[0]
    assert "srcStaged derive" in lines[1]
    assert "sink" in lines[2] and "~> sinkFinal" in lines[2]
