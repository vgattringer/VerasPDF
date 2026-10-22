from io import BytesIO
from typing import BinaryIO

from pypdf import PdfWriter
from pypdf.errors import PyPdfError


class PdfMergeError(Exception):
    """Raised when the input files cannot be merged."""


def merge_pdfs(streams: list[BinaryIO], image_quality: int = 100) -> bytes:
    """Merge the given PDF streams, in order, into one PDF.

    Below image_quality 100 (JPEG quality, 1-100), images are recompressed,
    content streams are compressed and duplicate objects are removed.
    """
    if len(streams) < 2:
        raise PdfMergeError("At least two PDF files are required.")

    writer = PdfWriter()
    for index, stream in enumerate(streams, start=1):
        try:
            writer.append(stream)
        except (PyPdfError, ValueError) as exc:
            raise PdfMergeError(f"File {index} is not a valid PDF.") from exc

    if image_quality < 100:
        _reduce_size(writer, image_quality)

    out = BytesIO()
    writer.write(out)
    return out.getvalue()


def _reduce_size(writer: PdfWriter, image_quality: int) -> None:
    for page in writer.pages:
        for image in page.images:
            try:
                image.replace(image.image, quality=image_quality)
            except (PyPdfError, ValueError, OSError):
                continue  # keep images that cannot be recompressed
        page.compress_content_streams()
    writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)
