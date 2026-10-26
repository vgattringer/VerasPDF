"""HTTP endpoints for merging PDFs.

This is the "controller" layer: it receives requests, delegates the real work
to :mod:`app.models.pdf_merger`, and turns the result (or error) into an HTTP
response.
"""

from fastapi import APIRouter, Form, HTTPException, Response, UploadFile

from app.models.pdf_merger import PdfMergeError, merge_pdfs

router = APIRouter(prefix="/api")

MAX_FILES = 20
MAX_FILE_BYTES = 50 * 1024 * 1024
MAX_TOTAL_BYTES = 200 * 1024 * 1024


def _check_limits(files: list[UploadFile]) -> None:
    """Reject uploads that are too many, too large, or not PDFs.

    Args:
        files: Uploaded PDFs.

    Raises:
        HTTPException: With status 413 if a size limit is exceeded, or 400 if
            a file does not start with the PDF magic bytes.
    """
    if len(files) > MAX_FILES:
        raise HTTPException(413, f"At most {MAX_FILES} files can be merged.")
    total = 0
    for file in files:
        size = file.size or 0
        total += size
        if size > MAX_FILE_BYTES:
            raise HTTPException(413, f"{file.filename} is too large.")
        if file.file.read(5) != b"%PDF-":
            raise HTTPException(400, f"{file.filename} is not a valid PDF.")
        file.file.seek(0)
    if total > MAX_TOTAL_BYTES:
        raise HTTPException(413, "The files are too large in total.")


def _merge(files: list[UploadFile], image_quality: int) -> bytes:
    """Hand the uploads to the model and return the merged PDF's bytes.

    The merging itself happens in :func:`app.models.pdf_merger.merge_pdfs`
    (the model, like a service method in Spring or .NET). This helper only
    adapts between the two layers: it unwraps each upload into a plain file
    object for the model, and converts the model's ``PdfMergeError`` into an
    HTTP 400 so the client gets a proper error response.

    The ``/merge`` and ``/estimate`` endpoints both use it so that this
    conversion exists in one place only.

    Args:
        files: Uploaded PDFs, in merge order.
        image_quality: JPEG quality, 1-100.

    Returns:
        The merged PDF as bytes, exactly as returned by ``merge_pdfs``.

    Raises:
        HTTPException: With status 400 if the files cannot be merged, or 413
            if they exceed the size limits.
    """
    _check_limits(files)
    try:
        return merge_pdfs([file.file for file in files], image_quality)
    except PdfMergeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/merge")
def merge(
    files: list[UploadFile], image_quality: int = Form(100, ge=1, le=100)
) -> Response:
    """Merge the uploaded PDFs and return the result as a download."""
    return Response(
        content=_merge(files, image_quality),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="merged.pdf"'},
    )


@router.post("/estimate")
def estimate(
    files: list[UploadFile], image_quality: int = Form(100, ge=1, le=100)
) -> dict[str, int]:
    """Return the size in bytes the merged PDF would have.

    It performs the full merge and measures it, so it is as slow as merging.
    """
    return {"size": len(_merge(files, image_quality))}
