# VerasPDF - WORK IN PROGRESS...

This is my first project, built entirely with [Claude Code](https://claude.com/claude-code) as my guide.

## Aim

Build a simple app where the user drags several PDFs into a designated area and gets them merged into one single PDF.

Planned for later: a file size reduction feature.

## Learning goal

Learn how to implement a classic model-view-controller (MVC) architecture in a Python backend.

## Tech stack

- **Backend:** Python 3.13, FastAPI, pypdf
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui

The app is a monolith: the Python backend serves the JSON API and the built frontend.

## Getting started

Backend:

```powershell
.venv\Scripts\python.exe -m pip install fastapi uvicorn python-multipart pypdf ruff
.venv\Scripts\python.exe main.py
```

Frontend (in `frontend/`):

```powershell
npm install
npm run build   # backend serves frontend/dist at http://127.0.0.1:8000
npm run dev     # or run the dev server, which proxies /api to the backend
```

## Status

Project scaffold only. The drag-and-drop merge feature is not implemented yet.
