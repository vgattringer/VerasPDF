"""Sphinx configuration for the VerasPDF documentation."""

import sys
from pathlib import Path

# Make the `app` package importable so autodoc can read its docstrings.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

project = "VerasPDF"
author = "Vera Gattringer"

extensions = [
    "sphinx.ext.autodoc",  # pulls documentation out of docstrings
    "sphinx.ext.napoleon",  # understands Google-style "Args:/Returns:" sections
    "sphinx.ext.viewcode",  # adds [source] links next to every function/class
]

autodoc_member_order = "bysource"
autodoc_typehints = "description"

html_theme = "alabaster"
exclude_patterns = ["_build"]
