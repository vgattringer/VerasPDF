"""PDF merging logic.

This module is the "model" layer: it knows how to merge PDFs but nothing about
HTTP. The controller in :mod:`app.controllers.merge_controller` calls it.
"""

from io import BytesIO
from typing import BinaryIO

from pypdf import PdfWriter
from pypdf.errors import PyPdfError


class PdfMergeError(Exception):
    """Raised when the input files cannot be merged.

    This is a *custom exception class*. Inheriting from :class:`Exception`
    (the part in parentheses in ``class PdfMergeError(Exception)``) makes it
    something you can ``raise`` and catch with ``except PdfMergeError``. It
    needs no code of its own: the docstring alone is a valid class body.
    """


def merge_pdfs(streams: list[BinaryIO], image_quality: int = 100) -> bytes:
    """Merge the given PDF streams, in order, into one PDF.

    Below ``image_quality`` 100 (JPEG quality, 1-100), images are recompressed,
    content streams are compressed and duplicate objects are removed.

    Args:
        streams: Open binary file objects, one per PDF, in merge order.
        image_quality: JPEG quality for images. 100 leaves them untouched.

    Returns:
        The bytes of the merged PDF.

    Raises:
        PdfMergeError: If fewer than two streams are given or one of them is
            not a valid PDF.
    """
    if len(streams) < 2:
        raise PdfMergeError("At least two PDF files are required.")

    # PdfWriter is a class from pypdf. Calling it creates an *object*
    # (an instance) that holds the PDF being built; we then call its
    # *methods* (append, write) on that object.
    writer = PdfWriter()
    for index, stream in enumerate(streams, start=1):
        try:
            writer.append(stream)
        except (PyPdfError, ValueError) as exc:
            # "from exc" keeps the original error attached for debugging.
            raise PdfMergeError(f"File {index} is not a valid PDF.") from exc

    if image_quality < 100:
        _reduce_size(writer, image_quality)

    out = BytesIO()
    writer.write(out)
    return out.getvalue()


def _reduce_size(writer: PdfWriter, image_quality: int) -> None:
    """Shrink the PDF held by ``writer`` in place.

    The leading underscore is a convention meaning "internal helper, not part
    of the public interface".

    Args:
        writer: The writer whose pages are recompressed.
        image_quality: JPEG quality applied to every image.
    """
    for page in writer.pages:
        for image in page.images:
            try:
                image.replace(image.image, quality=image_quality)
            except (PyPdfError, ValueError, OSError):
                continue  # keep images that cannot be recompressed
        page.compress_content_streams()
    writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
