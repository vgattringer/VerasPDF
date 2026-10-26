"""FastAPI application: wires the routers together and serves the frontend."""

from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles

from app.controllers import merge_controller
from app.errors import SECURITY_HEADERS, error_response, register_error_handlers

DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

# Request bodies carry multipart overhead on top of the files themselves.
MAX_BODY_BYTES = merge_controller.MAX_TOTAL_BYTES + 1024 * 1024

app = FastAPI(title="VerasPDF")
app.include_router(merge_controller.router)
register_error_handlers(app)


@app.middleware("http")
async def protect(request: Request, call_next) -> Response:
    """Reject oversized bodies early and add security headers to responses."""
    length = request.headers.get("content-length")
    if length and length.isdigit() and int(length) > MAX_BODY_BYTES:
        return error_response(413, "Request too large.")
    response = await call_next(request)
    response.headers.update(SECURITY_HEADERS)
    return response


@app.get("/api/health")
def health() -> dict[str, str]:
    """Report that the server is running."""
    return {"status": "ok"}


# Mounted last so /api routes take precedence.
if DIST.is_dir():
    app.mount("/", StaticFiles(directory=DIST, html=True), name="frontend")
