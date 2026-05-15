"""ADF Mapping Data Flow DSL builder.

ADF Mapping Data Flows are described in ARM JSON via `properties.typeProperties.scriptLines`
— an array of strings, each line in MDF's specific transformation DSL.

Example shape of a finished script line set (heavily abbreviated):

    source(allowSchemaDrift: true, output(ACCOUNT_NUMBER as string)) ~> srcStaged
    srcStaged derive(accountnumber = toString(ACCOUNT_NUMBER)) ~> dc_directs
    dc_directs split(__row_valid == true(), disjoint: false) ~> cs_split@(valid, invalid)
    cs_split@valid sink(...) ~> sinkFinal
    cs_split@invalid sink(...) ~> sinkTransformErrors

This module gives a small builder that accumulates lines, manages stream-name uniqueness,
and emits the final ARM JSON. Reference for the DSL syntax:
https://learn.microsoft.com/azure/data-factory/data-flow-expression-functions
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any


@dataclass
class MdfScript:
    """Accumulator for `scriptLines`. Tracks the current stream name so transforms chain."""
    lines: list[str] = field(default_factory=list)
    _next_id: dict[str, int] = field(default_factory=dict)
    _current_stream: str | None = None

    def fresh(self, prefix: str) -> str:
        """Return a unique stream identifier with the given prefix."""
        i = self._next_id.get(prefix, 0) + 1
        self._next_id[prefix] = i
        return f"{prefix}{i}"

    def source(
        self,
        name: str,
        *,
        columns: list[tuple[str, str]] | None = None,
        path: str | None = None,
        broadcast: str | None = None,
    ) -> str:
        """Emit a `source(...) ~> name` line. Returns the stream name."""
        opts: list[str] = ["allowSchemaDrift: true", "validateSchema: false"]
        if broadcast:
            opts.append(f"broadcast: '{broadcast}'")
        if columns is not None:
            cols = ",\n        ".join(f"{c} as {t}" for c, t in columns)
            opts.append(f"output(\n        {cols}\n    )")
        if path is not None:
            opts.append(f"format: 'parquet'")
        joined = ",\n    ".join(opts)
        self.lines.append(f"source(\n    {joined}\n) ~> {name}")
        self._current_stream = name
        return name

    def derive(self, columns: list[tuple[str, str]], *, alias: str | None = None) -> str:
        """Emit `<prev> derive(col = expr, ...) ~> <new>`. Returns new stream name."""
        if self._current_stream is None:
            raise RuntimeError("No current stream — call source() first")
        new_name = alias or self.fresh("dc_")
        body = ",\n    ".join(f"{name} = {expr}" for name, expr in columns)
        self.lines.append(f"{self._current_stream} derive(\n    {body}\n) ~> {new_name}")
        self._current_stream = new_name
        return new_name

    def split(
        self,
        conditions: list[tuple[str, str]],
        *,
        disjoint: bool = False,
        alias: str | None = None,
    ) -> tuple[str, list[str]]:
        """Emit a Conditional Split. Returns (split_name, [branch_stream_names])."""
        if self._current_stream is None:
            raise RuntimeError("No current stream")
        split_name = alias or self.fresh("cs_")
        body_lines = [f"{cond}" for cond, _label in conditions]
        body_lines.append(f"disjoint: {'true' if disjoint else 'false'}")
        body = ",\n    ".join(body_lines)
        labels = [lbl for _c, lbl in conditions]
        labels_decl = ", ".join(labels)
        self.lines.append(f"{self._current_stream} split(\n    {body}\n) ~> {split_name}@({labels_decl})")
        branch_streams = [f"{split_name}@{lbl}" for lbl in labels]
        # current stream becomes the "first" branch by convention; caller can override.
        self._current_stream = branch_streams[0]
        return split_name, branch_streams

    def select_stream(self, stream: str) -> None:
        """Set the current stream pointer (used when chaining after a split branch)."""
        self._current_stream = stream

    def lookup(
        self,
        right_source: str,
        on: str,
        *,
        broadcast: str = "left",
        alias: str | None = None,
    ) -> str:
        """Emit a Lookup transformation. Returns new stream name."""
        if self._current_stream is None:
            raise RuntimeError("No current stream")
        new_name = alias or self.fresh("lk_")
        self.lines.append(
            f"{self._current_stream}, {right_source} lookup(\n"
            f"    {on},\n"
            f"    multiple: false,\n"
            f"    pickup: 'any',\n"
            f"    broadcast: '{broadcast}'\n"
            f") ~> {new_name}"
        )
        self._current_stream = new_name
        return new_name

    def sink(self, name: str, *, path: str | None = None, error_handling: str = "stopOnFirstError") -> None:
        """Emit a sink line. Does NOT change the current stream (sinks are terminal)."""
        if self._current_stream is None:
            raise RuntimeError("No current stream")
        opts = [
            "allowSchemaDrift: true",
            "validateSchema: false",
            "format: 'parquet'",
            "skipDuplicateMapInputs: true",
            "skipDuplicateMapOutputs: true",
            f"errorHandlingOption: '{error_handling}'",
        ]
        body = ",\n    ".join(opts)
        self.lines.append(f"{self._current_stream} sink(\n    {body}\n) ~> {name}")

    def render(self) -> list[str]:
        """Return the accumulated lines (suitable for ARM scriptLines)."""
        return list(self.lines)


# ---------------------------------------------------------------------------
# ARM JSON envelope
# ---------------------------------------------------------------------------
def wrap_arm(
    dataflow_name: str,
    script_lines: list[str],
    *,
    sources: list[dict[str, Any]] | None = None,
    sinks: list[dict[str, Any]] | None = None,
    transformations: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Wrap script lines in the standard ADF Data Flow ARM resource JSON."""
    return {
        "name": dataflow_name,
        "type": "Microsoft.DataFactory/factories/dataflows",
        "apiVersion": "2018-06-01",
        "properties": {
            "type": "MappingDataFlow",
            "typeProperties": {
                "sources": sources or [],
                "sinks":   sinks or [],
                "transformations": transformations or [],
                "scriptLines": script_lines,
            },
        },
    }
