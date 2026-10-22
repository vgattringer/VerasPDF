# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment
- Windows, Python 3.13, virtualenv at `.venv` (use `.venv\Scripts\python.exe`, not `bin/`).
- Run: `.venv\Scripts\python.exe main.py`
- Install deps: `.venv\Scripts\python.exe -m pip install pypdf ruff`
- PDF handling uses `pypdf`.

## Style
- Format and lint with `ruff format .` and `ruff check .`.
- Match existing code: 4-space indent, single quotes, f-strings.

## Notes
- No tests exist yet; don't assume a test command.
