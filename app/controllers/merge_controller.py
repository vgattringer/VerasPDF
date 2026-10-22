from fastapi import APIRouter, Form, HTTPException, Response, UploadFile

from app.models.pdf_merger import PdfMergeError, merge_pdfs

router = APIRouter(prefix="/api")


def _merge(files: list[UploadFile], image_quality: int) -> bytes:
    try:
        return merge_pdfs([file.file for file in files], image_quality)
    except PdfMergeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/merge")
async def merge(
    files: list[UploadFile], image_quality: int = Form(100, ge=1, le=100)
) -> Response:
    return Response(
        content=_merge(files, image_quality),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="merged.pdf"'},
    )


@router.post("/estimate")
async def estimate(
    files: list[UploadFile], image_quality: int = Form(100, ge=1, le=100)
) -> dict[str, int]:
    """Return the size in bytes the merged PDF would have."""
    return {"size": len(_merge(files, image_quality))}
