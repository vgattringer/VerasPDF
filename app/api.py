"""FastAPI application: wires the routers together and serves the frontend."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.controllers import merge_controller

DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

app = FastAPI(title="VerasPDF")
app.include_router(merge_controller.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Report that the server is running."""
    return {"status": "ok"}


# Mounted last so /api routes take precedence.
if DIST.is_dir():
    app.mount("/", StaticFiles(directory=DIST, html=True), name="frontend")
