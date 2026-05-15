"""excel-to-json — converts the mapping workbook to /config/entities/*.json."""
from .converter import convert_workbook, convert_sheet
__all__ = ["convert_workbook", "convert_sheet"]
__version__ = "0.1.0"
