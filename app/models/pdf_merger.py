"""PDF merging logic.

This module is the "model" layer: it knows how to merge PDFs but nothing about
HTTP. The controller in :mod:`app.controllers.merge_controller` calls it.
"""

from io import BytesIO
from typing import BinaryIO

from PIL import Image
from pypdf import PdfWriter
from pypdf._page import ImageFile
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
        except Exception as exc:
            # pypdf can fail on damaged files with more than PyPdfError
            # (e.g. AssertionError, AttributeError), so catch broadly here.
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

    An image is only re-encoded if that makes it smaller. Images that are
    already compressed at or below ``image_quality`` stay as they are.

    Args:
        writer: The writer whose pages are recompressed.
        image_quality: JPEG quality applied to images that benefit.
    """
    for page in writer.pages:
        for image in page.images:
            try:
                if _jpeg_size(image.image, image_quality) >= _stored_size(image):
                    continue  # re-encoding would not shrink this image
                image.replace(image.image, quality=image_quality, optimize=True)
            except (PyPdfError, ValueError, OSError):
                continue  # keep images that cannot be recompressed
        page.compress_content_streams()
    writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)


def _jpeg_size(pil_image: Image.Image, image_quality: int) -> int:
    """Return how many bytes ``pil_image`` takes as a JPEG at this quality.

    Raises:
        OSError: If the image mode cannot be saved as JPEG (palette, 1-bit,
            transparency). Quality has no effect on those, so callers skip them.
    """
    buffer = BytesIO()
    pil_image.save(buffer, "JPEG", quality=image_quality, optimize=True)
    return buffer.tell()


def _stored_size(image: ImageFile) -> int:
    """Return how many bytes the image currently occupies inside the PDF."""
    # pypdf has no public accessor for the still-encoded stream bytes;
    # image.data is only that for JPEG/JPEG 2000 originals.
    return len(image.indirect_reference.get_object()._data)
