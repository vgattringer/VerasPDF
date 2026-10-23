"""HTTP endpoints for merging PDFs.

This is the "controller" layer: it receives requests, delegates the real work
to :mod:`app.models.pdf_merger`, and turns the result (or error) into an HTTP
response.
"""

from fastapi import APIRouter, Form, HTTPException, Response, UploadFile

from app.models.pdf_merger import PdfMergeError, merge_pdfs

router = APIRouter(prefix="/api")


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
        HTTPException: With status 400 if the files cannot be merged.
    """
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
