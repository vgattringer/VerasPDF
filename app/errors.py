"""Central error handling: one JSON error shape and no leaked internals.

Expected errors (:class:`PdfMergeError`, ``HTTPException``) keep the message
chosen by the code that raised them. Everything else is logged server-side and
answered with a generic message, so stack traces and library details never
reach the client.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.models.pdf_merger import PdfMergeError

logger = logging.getLogger(__name__)

SECURITY_HEADERS = {
    "Content-Security-Policy": (
        "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
        "object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
    ),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
}


def error_response(
    status_code: int, message: str, headers: dict[str, str] | None = None
) -> JSONResponse:
    """Build a ``{"detail": message}`` response that carries the security headers.

    Handlers for unexpected errors run outside the middleware stack, so every
    error response sets the security headers itself.

    Args:
        status_code: HTTP status of the response.
        message: Text shown to the client.
        headers: Extra headers, e.g. ``Allow`` on a 405.

    Returns:
        The JSON error response.
    """
    return JSONResponse(
        {"detail": message},
        status_code=status_code,
        headers={**(headers or {}), **SECURITY_HEADERS},
    )


async def handle_merge_error(request: Request, exc: Exception) -> JSONResponse:
    """Answer a failed merge with 400 and the model's own message."""
    return error_response(400, str(exc))


async def handle_http_exception(request: Request, exc: Exception) -> JSONResponse:
    """Answer an ``HTTPException`` with the message of the code that raised it.

    A ``detail`` that is not a string (FastAPI allows any value) is replaced by
    a generic message, so structured data cannot leak by accident.
    """
    assert isinstance(exc, StarletteHTTPException)
    message = exc.detail if isinstance(exc.detail, str) else "Request failed."
    return error_response(exc.status_code, message, exc.headers)


async def handle_validation_error(request: Request, exc: Exception) -> JSONResponse:
    """Answer a malformed request with 422 without echoing the input back."""
    return error_response(422, "Invalid request.")


async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    """Log an unexpected error and answer with a generic 500."""
    logger.error(
        "Unhandled error on %s %s",
        request.method,
        request.url.path,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return error_response(500, "Something went wrong on the server.")


def register_error_handlers(app: FastAPI) -> None:
    """Attach all exception handlers to ``app``."""
    app.add_exception_handler(PdfMergeError, handle_merge_error)
    app.add_exception_handler(StarletteHTTPException, handle_http_exception)
    app.add_exception_handler(RequestValidationError, handle_validation_error)
    app.add_exception_handler(Exception, handle_unexpected_error)
