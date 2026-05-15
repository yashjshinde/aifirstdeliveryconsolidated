"""dataflow-codegen — generate ADF Mapping Data Flow ARM JSON from entity configs."""
from .generator import (
    generate_inbound_dataflow,
    generate_outbound_dataflow,
    generate_phase2_dataflow,
    write_dataflow_arm,
)

__all__ = [
    "generate_inbound_dataflow",
    "generate_outbound_dataflow",
    "generate_phase2_dataflow",
    "write_dataflow_arm",
]
__version__ = "0.1.0"
