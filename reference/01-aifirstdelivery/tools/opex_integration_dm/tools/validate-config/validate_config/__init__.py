"""validate-config — the CI gate for Opex integration framework configs."""
from .errors import Finding, Severity
from .runner import run

__all__ = ["Finding", "Severity", "run"]
__version__ = "0.1.0"
