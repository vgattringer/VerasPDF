from io import BytesIO
from typing import BinaryIO

from pypdf import PdfWriter
from pypdf.errors import PyPdfError


class PdfMergeError(Exception):
    """Raised when the input files cannot be merged."""


def merge_pdfs(streams: list[BinaryIO]) -> bytes:
    """Merge the given PDF streams, in order, into one PDF."""
    if len(streams) < 2:
        raise PdfMergeError("At least two PDF files are required.")

    writer = PdfWriter()
    for index, stream in enumerate(streams, start=1):
        try:
            writer.append(stream)
        except (PyPdfError, ValueError) as exc:
            raise PdfMergeError(f"File {index} is not a valid PDF.") from exc

    out = BytesIO()
    writer.write(out)
    return out.getvalue()
