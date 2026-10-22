# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment
- Windows, Python 3.13, virtualenv at `.venv` (use `.venv\Scripts\python.exe`, not `bin/`).
- Run: `.venv\Scripts\python.exe main.py`
- Install deps: `.venv\Scripts\python.exe -m pip install fastapi uvicorn python-multipart pypdf pillow ruff`
- PDF handling uses `pypdf`.

## Style
- Format and lint with `ruff format .` and `ruff check .`.
- Match existing code: 4-space indent, double quotes (ruff default), f-strings.

## Notes
- No tests exist yet; don't assume a test command.

## Frontend
- React + TypeScript + Tailwind v4 + shadcn/ui in `frontend/` (Vite). Backend is FastAPI in `app/`.
- Dev: `.venv\Scripts\python.exe main.py` and `npm run dev` in `frontend/` (proxies `/api` to :8000).
- Build: `npm run build` in `frontend/`; the backend serves `frontend/dist`.
- Add shadcn components: `npx shadcn@latest add <name>` in `frontend/`.
