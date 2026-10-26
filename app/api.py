"""FastAPI application: wires the routers together and serves the frontend."""

from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.controllers import merge_controller

DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

# Request bodies carry multipart overhead on top of the files themselves.
MAX_BODY_BYTES = merge_controller.MAX_TOTAL_BYTES + 1024 * 1024

SECURITY_HEADERS = {
    "Content-Security-Policy": (
        "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
        "object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
    ),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
}

app = FastAPI(title="VerasPDF")
app.include_router(merge_controller.router)


@app.middleware("http")
async def protect(request: Request, call_next) -> Response:
    """Reject oversized bodies early and add security headers to responses."""
    length = request.headers.get("content-length")
    if length and length.isdigit() and int(length) > MAX_BODY_BYTES:
        response = JSONResponse({"detail": "Request too large."}, status_code=413)
    else:
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
