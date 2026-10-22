from fastapi import APIRouter, Form, HTTPException, Response, UploadFile

from app.models.pdf_merger import PdfMergeError, merge_pdfs

router = APIRouter(prefix="/api")


@router.post("/merge")
async def merge(files: list[UploadFile], reduce_size: bool = Form(False)) -> Response:
    try:
        merged = merge_pdfs([file.file for file in files], reduce_size)
    except PdfMergeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return Response(
        content=merged,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="merged.pdf"'},
    )
