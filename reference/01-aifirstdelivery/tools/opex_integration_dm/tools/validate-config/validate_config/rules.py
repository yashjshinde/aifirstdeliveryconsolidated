"""Cross-file and content rules V004–V052. Each rule is a small function with the same signature:

    def rule_V0xx(state: ConfigState) -> list[Finding]:
        ...

The runner collects them via the RULES registry at the bottom.
"""
from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .errors import Finding, Severity, RULE_CATALOG


# ---------------------------------------------------------------------------
# State container — passed to every rule function
# ---------------------------------------------------------------------------
@dataclass
class ConfigState:
    """All parsed configs, keyed for easy cross-file lookup."""
    project: tuple[Path, dict[str, Any]] | None = None
    entities: dict[str, tuple[Path, dict[str, Any]]] = field(default_factory=dict)
    waves: dict[str, tuple[Path, dict[str, Any]]] = field(default_factory=dict)
    aliases: dict[str, tuple[Path, dict[str, Any]]] = field(default_factory=dict)
    # Files whose schema validation failed get skipped by cross-file rules.
    invalid_files: set[Path] = field(default_factory=set)


def _f(code: str, message: str, file: Path | None = None, jp: str = "", **context) -> Finding:
    """Convenience constructor that fills severity/url from RULE_CATALOG."""
    severity, _desc, url = RULE_CATALOG[code]
    return Finding(
        code=code, severity=severity, message=message,
        file=file, json_pointer=jp, rule_url=url, context=context,
    )


# ---------------------------------------------------------------------------
# V004, V005 — filename matches contents
# ---------------------------------------------------------------------------
def rule_V004(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for key, (path, doc) in state.entities.items():
        declared = doc.get("entityKey")
        expected = path.stem  # strip .json
        if declared and declared != expected:
            out.append(_f("V004",
                f"entityKey '{declared}' does not match filename '{expected}'",
                file=path, jp="/entityKey",
                declared=declared, expected=expected))
    return out


def rule_V005(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for key, (path, doc) in state.waves.items():
        declared = doc.get("waveKey")
        expected = path.stem
        if declared and declared != expected:
            out.append(_f("V005",
                f"waveKey '{declared}' does not match filename '{expected}'",
                file=path, jp="/waveKey"))
    return out


# ---------------------------------------------------------------------------
# V006 — notification.to non-empty when email channel is enabled
# ---------------------------------------------------------------------------
def rule_V006(state: ConfigState) -> list[Finding]:
    if not state.project:
        return []
    path, doc = state.project
    notif = doc.get("notification", {})
    if not notif.get("enabled", False):
        return []
    channels = set(notif.get("onFailure", [])) | set(notif.get("onPartial", []))
    if "email" in channels and not notif.get("to"):
        return [_f("V006",
            "notification.to is empty but 'email' is configured as a channel",
            file=path, jp="/notification/to")]
    return []


# ---------------------------------------------------------------------------
# V007 — batchSize sanity range
# ---------------------------------------------------------------------------
def rule_V007(state: ConfigState) -> list[Finding]:
    if not state.project:
        return []
    path, doc = state.project
    bs = doc.get("batchSize", 0)
    if bs and (bs < 50 or bs > 1000):
        return [_f("V007",
            f"batchSize={bs} is outside the Dataverse-recommended range (50-1000); "
            f"tune cautiously and review the throttling budget in 03-error-model-and-runbook.md §5.5",
            file=path, jp="/batchSize")]
    return []


# ---------------------------------------------------------------------------
# V010, V011 — wave entityKey resolves and direction-compatible
# ---------------------------------------------------------------------------
def rule_V010(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for wkey, (wpath, wdoc) in state.waves.items():
        for i, e in enumerate(wdoc.get("entities", [])):
            ek = e.get("entityKey")
            if ek and ek not in state.entities:
                out.append(_f("V010",
                    f"wave references unknown entityKey '{ek}' (no /config/entities/{ek}.json)",
                    file=wpath, jp=f"/entities/{i}/entityKey",
                    entityKey=ek, waveKey=wkey))
    return out


def rule_V011(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for wkey, (wpath, wdoc) in state.waves.items():
        wave_dir = wdoc.get("direction")
        for i, e in enumerate(wdoc.get("entities", [])):
            ek = e.get("entityKey")
            if ek not in state.entities:
                continue  # V010 already reported
            edoc = state.entities[ek][1]
            entity_dir = edoc.get("direction")
            compatible = {
                "inbound":  {"inbound", "bidirectional"},
                "outbound": {"outbound", "bidirectional"},
                "mixed":    {"inbound", "outbound", "bidirectional"},
            }.get(wave_dir, set())
            if entity_dir not in compatible:
                out.append(_f("V011",
                    f"wave.direction='{wave_dir}' incompatible with entity '{ek}'.direction='{entity_dir}'",
                    file=wpath, jp=f"/entities/{i}/entityKey"))
    return out


# ---------------------------------------------------------------------------
# V012, V013 — aliasesFile reference
# ---------------------------------------------------------------------------
def rule_V012(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            forward = fld.get("transform", {}).get("forward", {})
            af = forward.get("aliasesFile")
            if not af:
                continue
            af_stem = Path(af).stem  # e.g. "opx_city__opx_cityname"
            if af_stem not in state.aliases:
                out.append(_f("V012",
                    f"aliasesFile '{af}' does not exist (looking for /config/aliases/{af_stem}.json)",
                    file=epath, jp=f"/fields/{fi}/transform/forward/aliasesFile",
                    aliasesFile=af))
    return out


def rule_V013(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            forward = fld.get("transform", {}).get("forward", {})
            af = forward.get("aliasesFile")
            if not af:
                continue
            af_stem = Path(af).stem
            if af_stem not in state.aliases:
                continue  # V012 reported
            apath, adoc = state.aliases[af_stem]
            ref_table = forward.get("referenceTable")
            ref_field = forward.get("refField")
            if ref_table and adoc.get("refTable") != ref_table:
                out.append(_f("V013",
                    f"alias file refTable='{adoc.get('refTable')}' does not match transform.forward.referenceTable='{ref_table}'",
                    file=epath, jp=f"/fields/{fi}/transform/forward/aliasesFile"))
            if ref_field and adoc.get("refField") != ref_field:
                out.append(_f("V013",
                    f"alias file refField='{adoc.get('refField')}' does not match transform.forward.refField='{ref_field}'",
                    file=epath, jp=f"/fields/{fi}/transform/forward/aliasesFile"))
    return out


# ---------------------------------------------------------------------------
# V015 — N:N relationshipSchemaName uniqueness across entities
# ---------------------------------------------------------------------------
def rule_V015(state: ConfigState) -> list[Finding]:
    seen: dict[str, list[str]] = defaultdict(list)
    for ekey, (epath, edoc) in state.entities.items():
        for rel in edoc.get("relationships", []) or []:
            rsn = rel.get("relationshipSchemaName")
            if rsn:
                seen[rsn].append(ekey)
    out: list[Finding] = []
    for rsn, owners in seen.items():
        if len(owners) > 1:
            out.append(_f("V015",
                f"relationship '{rsn}' declared by multiple entities: {sorted(owners)}; "
                f"ambiguous N:N owner",
                relationship=rsn, owners=sorted(owners)))
    return out


# ---------------------------------------------------------------------------
# V020 — non-invertible transforms require explicit reverse on outbound/bidi
# ---------------------------------------------------------------------------
_NON_INVERTIBLE = {"concat", "split", "conditional"}


def rule_V020(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        direction = edoc.get("direction")
        if direction not in {"outbound", "bidirectional"}:
            continue
        for fi, fld in enumerate(edoc.get("fields", [])):
            if fld.get("outboundInclude", True) is False:
                continue  # excluded from outbound — no reverse needed
            xform = fld.get("transform", {})
            if xform.get("type") not in _NON_INVERTIBLE:
                continue
            if not xform.get("reverse"):
                out.append(_f("V020",
                    f"transform.type='{xform.get('type')}' has no reverse block on "
                    f"outbound entity '{ekey}', field source='{fld.get('source')}'",
                    file=epath, jp=f"/fields/{fi}/transform/reverse"))
    return out


# ---------------------------------------------------------------------------
# V021 — map.forward.map is 1:1 OR reverse.map declared
# ---------------------------------------------------------------------------
def rule_V021(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") != "map":
                continue
            fwd_map = (x.get("forward") or {}).get("map", {}) or {}
            values = list(fwd_map.values())
            unique_values = set(map(_hashable, values))
            if len(values) != len(unique_values):
                # not 1:1
                if not (x.get("reverse") or {}).get("map"):
                    out.append(_f("V021",
                        f"map.forward.map is not 1:1 (duplicate values: {sorted(set(v for v in values if values.count(v) > 1))}); "
                        f"declare reverse.map explicitly",
                        file=epath, jp=f"/fields/{fi}/transform/reverse/map"))
    return out


def _hashable(v: Any) -> Any:
    """Make a value hashable for set membership (lists/dicts → tuples/frozensets)."""
    if isinstance(v, list):
        return tuple(_hashable(x) for x in v)
    if isinstance(v, dict):
        return tuple(sorted((k, _hashable(val)) for k, val in v.items()))
    return v


# ---------------------------------------------------------------------------
# V022 — choice forward.map values in option-set range
# ---------------------------------------------------------------------------
def rule_V022(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") != "choice":
                continue
            m = (x.get("forward") or {}).get("map", {}) or {}
            for k, v in m.items():
                if not isinstance(v, int) or v < 1 or v > 2147483647:
                    out.append(_f("V022",
                        f"choice.forward.map['{k}']={v!r} is not a valid Dataverse OptionSet value (1..2147483647)",
                        file=epath, jp=f"/fields/{fi}/transform/forward/map/{k}"))
    return out


# ---------------------------------------------------------------------------
# V023 — entitySetName plural-shape heuristic (warning only)
# ---------------------------------------------------------------------------
_PLURAL_OK = re.compile(r"(s|es|set)$", re.IGNORECASE)


def rule_V023(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") != "lookup":
                continue
            esn = (x.get("forward") or {}).get("entitySetName", "")
            if esn and not _PLURAL_OK.search(esn):
                out.append(_f("V023",
                    f"entitySetName='{esn}' does not look plural; "
                    f"Dataverse pluralization is irregular — verify against EntityDefinitions",
                    file=epath, jp=f"/fields/{fi}/transform/forward/entitySetName"))
    return out


# ---------------------------------------------------------------------------
# V025 — alias filename pattern
# ---------------------------------------------------------------------------
_ALIAS_FILENAME = re.compile(r"^[a-z0-9_]+__[a-z0-9_]+\.json$")


def rule_V025(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for akey, (apath, _adoc) in state.aliases.items():
        if not _ALIAS_FILENAME.match(apath.name):
            out.append(_f("V025",
                f"alias filename '{apath.name}' must match pattern <refTable>__<refField>.json",
                file=apath))
    return out


# ---------------------------------------------------------------------------
# V026 — self-lookup must declare loadPhase:2
# ---------------------------------------------------------------------------
def rule_V026(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        target_entity = (edoc.get("target") or {}).get("entityLogicalName")
        if not target_entity:
            continue
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") != "lookup":
                continue
            ref = (x.get("forward") or {}).get("referenceTable")
            if ref == target_entity and fld.get("loadPhase", 1) != 2:
                out.append(_f("V026",
                    f"self-lookup ({target_entity}->{target_entity}) on field source='{fld.get('source')}' "
                    f"must declare loadPhase:2 (would otherwise fail at runtime)",
                    file=epath, jp=f"/fields/{fi}/loadPhase"))
    return out


# ---------------------------------------------------------------------------
# V028 — createIfMissing must be false in v1
# ---------------------------------------------------------------------------
def rule_V028(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") != "lookup":
                continue
            if (x.get("forward") or {}).get("createIfMissing") is True:
                out.append(_f("V028",
                    f"createIfMissing=true is deferred to v2; "
                    f"pl_create_missing_masters not yet specified",
                    file=epath, jp=f"/fields/{fi}/transform/forward/createIfMissing"))
    return out


# ---------------------------------------------------------------------------
# V030-V034 — Wave DAG rules
# ---------------------------------------------------------------------------
def rule_V030(state: ConfigState) -> list[Finding]:
    """Detect cycles in dependsOn graph."""
    out: list[Finding] = []
    for wkey, (wpath, wdoc) in state.waves.items():
        graph = {e["entityKey"]: list(e.get("dependsOn") or []) for e in wdoc.get("entities", [])}
        cycle = _find_cycle(graph)
        if cycle:
            out.append(_f("V030",
                f"dependsOn cycle detected in wave '{wkey}': {' -> '.join(cycle)}",
                file=wpath, jp="/entities"))
    return out


def _find_cycle(graph: dict[str, list[str]]) -> list[str] | None:
    color: dict[str, int] = {}  # 0=unvisited, 1=in-stack, 2=done
    parent: dict[str, str | None] = {}
    cycle: list[str] = []

    def dfs(u: str) -> bool:
        color[u] = 1
        for v in graph.get(u, []):
            if color.get(v) == 1:
                # cycle found; reconstruct
                node, path = u, [v]
                while node and node != v:
                    path.append(node)
                    node = parent.get(node)
                path.append(v)
                cycle.extend(reversed(path))
                return True
            if color.get(v, 0) == 0:
                parent[v] = u
                if dfs(v):
                    return True
        color[u] = 2
        return False

    for node in graph:
        if color.get(node, 0) == 0:
            if dfs(node):
                return cycle
    return None


def rule_V031(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for wkey, (wpath, wdoc) in state.waves.items():
        members = {e["entityKey"] for e in wdoc.get("entities", [])}
        for i, e in enumerate(wdoc.get("entities", [])):
            for dep in e.get("dependsOn") or []:
                if dep not in members:
                    out.append(_f("V031",
                        f"entity '{e['entityKey']}' dependsOn '{dep}' which is not in the same wave",
                        file=wpath, jp=f"/entities/{i}/dependsOn"))
    return out


def rule_V032(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for wkey, (wpath, wdoc) in state.waves.items():
        phase_of = {e["entityKey"]: e["phase"] for e in wdoc.get("entities", [])}
        for i, e in enumerate(wdoc.get("entities", [])):
            for dep in e.get("dependsOn") or []:
                if dep in phase_of and phase_of[dep] >= e["phase"]:
                    out.append(_f("V032",
                        f"entity '{e['entityKey']}' (phase {e['phase']}) dependsOn '{dep}' "
                        f"(phase {phase_of[dep]}) — phase ordering violation",
                        file=wpath, jp=f"/entities/{i}/dependsOn"))
    return out


def rule_V033(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for wkey, (wpath, wdoc) in state.waves.items():
        phases = {e["phase"] for e in wdoc.get("entities", [])}
        if not phases:
            continue
        expected = set(range(1, max(phases) + 1))
        missing = sorted(expected - phases)
        if missing:
            out.append(_f("V033",
                f"phase numbers must be contiguous starting at 1; missing: {missing}",
                file=wpath, jp="/entities"))
    return out


# ---------------------------------------------------------------------------
# V040 — inbound entity must have at least one inbound-included field
# ---------------------------------------------------------------------------
def rule_V040(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        if edoc.get("direction") == "inbound":
            included = [f for f in edoc.get("fields", []) if f.get("inboundInclude", True)]
            if not included:
                out.append(_f("V040",
                    f"inbound entity '{ekey}' has no fields with inboundInclude=true",
                    file=epath, jp="/fields"))
    return out


# ---------------------------------------------------------------------------
# V041 — outbound query non-empty per mode
# ---------------------------------------------------------------------------
def rule_V041(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        if edoc.get("direction") not in {"outbound", "bidirectional"}:
            continue
        outbound = (edoc.get("target") or {}).get("outbound")
        if not outbound:
            continue  # schema validation will catch
        q = outbound.get("query", {})
        mode = q.get("mode")
        if mode == "odataFilter" and not q.get("odataFilter"):
            out.append(_f("V041",
                f"target.outbound.query.mode='odataFilter' but odataFilter is empty/null",
                file=epath, jp="/target/outbound/query/odataFilter"))
        elif mode == "fetchXml" and not q.get("fetchXml"):
            out.append(_f("V041",
                f"target.outbound.query.mode='fetchXml' but fetchXml is empty/null",
                file=epath, jp="/target/outbound/query/fetchXml"))
        elif mode == "savedView" and not q.get("savedView"):
            out.append(_f("V041",
                f"target.outbound.query.mode='savedView' but savedView is empty/null",
                file=epath, jp="/target/outbound/query/savedView"))
    return out


# ---------------------------------------------------------------------------
# V050 — dedup overlap with alternateKey
# ---------------------------------------------------------------------------
def rule_V050(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        dedup = edoc.get("dedup") or {}
        if not dedup.get("enabled", True):
            continue
        cs = set(dedup.get("checksumColumns") or [])
        akey = set((edoc.get("target") or {}).get("alternateKey") or [])
        # alternateKey is on Dataverse-side schema names; checksumColumns are source-side names.
        # Find fields whose target is in akey, then their source name.
        akey_sources: set[str] = set()
        for fld in edoc.get("fields", []):
            if fld.get("target") in akey:
                akey_sources.add(fld.get("source"))
        if cs and cs == akey_sources:
            out.append(_f("V050",
                f"dedup.checksumColumns equals the source-projection of target.alternateKey; "
                f"alt-key dedup is implicit on upsert — consider removing or adding distinguishing columns",
                file=epath, jp="/dedup/checksumColumns"))
    return out


# ---------------------------------------------------------------------------
# V051 — dateTime sourceTz=targetTz=UTC is a no-op
# ---------------------------------------------------------------------------
def rule_V051(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") != "dateTime":
                continue
            f = x.get("forward") or {}
            if f.get("sourceTz", "UTC") == "UTC" and f.get("targetTz", "UTC") == "UTC" and \
               f.get("inputFormat", "") == f.get("outputFormat", ""):
                out.append(_f("V051",
                    f"dateTime transform on '{fld.get('source')}' has sourceTz=targetTz=UTC "
                    f"and identical formats — consider 'direct' instead",
                    file=epath, jp=f"/fields/{fi}/transform"))
    return out


# ---------------------------------------------------------------------------
# V014 — lookup references a referenceTable that's not the target of any entity
#         in this config tree and isn't a known DV system table (warning).
# ---------------------------------------------------------------------------
_KNOWN_DV_SYSTEM_TABLES = {
    "account", "contact", "lead", "opportunity", "systemuser", "team",
    "pricelevel", "product", "transactioncurrency", "businessunit", "queue",
    "msdyn_functionallocation", "msdyn_workorder", "msdyn_customerasset",
    "savedquery", "userquery",
}


def rule_V014(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    # Build set of every entityLogicalName in the config tree
    known = set(_KNOWN_DV_SYSTEM_TABLES)
    for _ekey, (_p, edoc) in state.entities.items():
        tgt = (edoc.get("target") or {}).get("entityLogicalName")
        if tgt:
            known.add(tgt)
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") != "lookup":
                continue
            ref = (x.get("forward") or {}).get("referenceTable")
            if ref and ref not in known:
                out.append(_f("V014",
                    f"lookup references referenceTable='{ref}' which is neither a known DV system table "
                    f"nor a target of any entity in this config tree",
                    file=epath, jp=f"/fields/{fi}/transform/forward/referenceTable",
                    referenceTable=ref))
    return out


# ---------------------------------------------------------------------------
# V016 — alias file content validates against alias-file.schema.json.
#         The runner already runs JSON Schema validation against the alias schema;
#         this rule cross-checks the inline alias map for empties and dup keys.
# ---------------------------------------------------------------------------
def rule_V016(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for akey, (apath, adoc) in state.aliases.items():
        aliases = adoc.get("aliases") or {}
        if not aliases:
            out.append(_f("V016",
                f"alias file has empty aliases map — remove the file or add entries",
                file=apath, jp="/aliases"))
        # Detect cycles or self-mappings
        for k, v in aliases.items():
            if k == v:
                out.append(_f("V016",
                    f"alias '{k}' maps to itself — likely a no-op; remove or fix",
                    file=apath, jp=f"/aliases/{k}"))
    return out


# ---------------------------------------------------------------------------
# V024 — alias keys may be unreachable after the normalize chain.
#         Example: normalize=[toLowerCase], aliases={"NEW DELHI":"Delhi"}
#         — the uppercase key can never match a normalized lookup value.
# ---------------------------------------------------------------------------
def rule_V024(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []

    def _check(rules_list: list[str], aliases_map: dict, path: Path, jp: str) -> None:
        if not aliases_map or not rules_list:
            return
        if "toLowerCase" in rules_list:
            bad = [k for k in aliases_map if any(c.isupper() for c in k)]
            if bad:
                out.append(_f("V024",
                    f"alias keys contain uppercase chars but normalize includes 'toLowerCase'; "
                    f"unreachable: {sorted(bad)[:3]}{'...' if len(bad) > 3 else ''}",
                    file=path, jp=jp))
        if "toUpperCase" in rules_list:
            bad = [k for k in aliases_map if any(c.islower() for c in k)]
            if bad:
                out.append(_f("V024",
                    f"alias keys contain lowercase chars but normalize includes 'toUpperCase'; "
                    f"unreachable: {sorted(bad)[:3]}{'...' if len(bad) > 3 else ''}",
                    file=path, jp=jp))

    # Inline aliases in entity fields
    for ekey, (epath, edoc) in state.entities.items():
        for fi, fld in enumerate(edoc.get("fields", [])):
            fwd = (fld.get("transform") or {}).get("forward") or {}
            _check(
                fwd.get("normalize") or [],
                fwd.get("aliases") or {},
                epath,
                f"/fields/{fi}/transform/forward/aliases",
            )

    # Externalized alias files
    for akey, (apath, adoc) in state.aliases.items():
        _check(adoc.get("normalize") or [], adoc.get("aliases") or {}, apath, "/aliases")

    return out


# ---------------------------------------------------------------------------
# V034 — N:N relatedEntity is in this wave but the owner entity doesn't
#         declare it in dependsOn (warning — runtime order may be wrong).
# ---------------------------------------------------------------------------
def rule_V034(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for wkey, (wpath, wdoc) in state.waves.items():
        wave_entities = {e["entityKey"]: e for e in wdoc.get("entities", [])}
        # Build map: entity → entity whose target.entityLogicalName matches
        target_to_entity: dict[str, str] = {}
        for ekey in wave_entities:
            if ekey in state.entities:
                tgt = (state.entities[ekey][1].get("target") or {}).get("entityLogicalName")
                if tgt:
                    target_to_entity[tgt] = ekey

        for ekey, wentry in wave_entities.items():
            if ekey not in state.entities:
                continue
            edoc = state.entities[ekey][1]
            depends = set(wentry.get("dependsOn") or [])
            for ri, rel in enumerate(edoc.get("relationships") or []):
                related = rel.get("relatedEntity")
                if not related:
                    continue
                related_owner = target_to_entity.get(related)
                if related_owner and related_owner != ekey and related_owner not in depends:
                    out.append(_f("V034",
                        f"entity '{ekey}' has N:N relationship to '{related}' (owned by entity '{related_owner}' in this wave) "
                        f"but '{related_owner}' is not in dependsOn — phase ordering may be wrong",
                        file=wpath, jp=f"/entities[{ekey}]/dependsOn",
                        suggestion=related_owner))
    return out


# ---------------------------------------------------------------------------
# V042 — outbound lookups must either have $expand or be excluded from outbound.
# ---------------------------------------------------------------------------
def rule_V042(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    for ekey, (epath, edoc) in state.entities.items():
        if edoc.get("direction") not in {"outbound", "bidirectional"}:
            continue
        expand_navs = {e.get("navigationProperty")
                       for e in ((edoc.get("target") or {}).get("outbound") or {}).get("expand") or []}
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") != "lookup":
                continue
            if fld.get("outboundInclude", True) is False:
                continue
            nav = (x.get("forward") or {}).get("navigationProperty")
            if nav and nav not in expand_navs:
                out.append(_f("V042",
                    f"outbound lookup on '{fld.get('source')}' (nav='{nav}') is included but missing from "
                    f"target.outbound.expand — add to expand[] or set outboundInclude:false",
                    file=epath, jp=f"/fields/{fi}/transform/forward/navigationProperty"))
    return out


# ---------------------------------------------------------------------------
# V043 — bidirectional transforms should declare explicit reverse (warning).
#         Auto-inverted maps are allowed but flagged so authors confirm intent.
# ---------------------------------------------------------------------------
def rule_V043(state: ConfigState) -> list[Finding]:
    out: list[Finding] = []
    _AUTOINVERTIBLE = {"choice", "state", "map", "yesNo", "dateTime"}
    for ekey, (epath, edoc) in state.entities.items():
        if edoc.get("direction") != "bidirectional":
            continue
        for fi, fld in enumerate(edoc.get("fields", [])):
            x = fld.get("transform", {})
            if x.get("type") in _AUTOINVERTIBLE and not (x.get("reverse") or {}):
                out.append(_f("V043",
                    f"bidirectional entity uses '{x.get('type')}' transform with no explicit reverse; "
                    f"auto-inversion is fine but confirm intent for outbound rendering",
                    file=epath, jp=f"/fields/{fi}/transform/reverse"))
    return out


# ---------------------------------------------------------------------------
# V052 — partialLoadAllowed:false with failureThresholdPct>0 is dead code.
# ---------------------------------------------------------------------------
def rule_V052(state: ConfigState) -> list[Finding]:
    if not state.project:
        return []
    path, doc = state.project
    if doc.get("partialLoadAllowed") is False and (doc.get("failureThresholdPct") or 0) > 0:
        return [_f("V052",
            f"_project.json has partialLoadAllowed=false but failureThresholdPct={doc.get('failureThresholdPct')} — "
            f"the threshold is dead code (any error fails the pipeline)",
            file=path, jp="/failureThresholdPct")]
    return []


# ---------------------------------------------------------------------------
# Registry — runner iterates this list.
# Order matters only for reproducible output (we then sort).
# ---------------------------------------------------------------------------
RULES = [
    rule_V004, rule_V005, rule_V006, rule_V007,
    rule_V010, rule_V011, rule_V012, rule_V013, rule_V014, rule_V015, rule_V016,
    rule_V020, rule_V021, rule_V022, rule_V023, rule_V024, rule_V025, rule_V026, rule_V028,
    rule_V030, rule_V031, rule_V032, rule_V033, rule_V034,
    rule_V040, rule_V041, rule_V042, rule_V043,
    rule_V050, rule_V051, rule_V052,
]
