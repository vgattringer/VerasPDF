import io

import pytest
from pypdf import PdfReader

from app.models.pdf_merger import PdfMergeError, merge_pdfs

from .conftest import make_image_pdf, make_pdf


def test_merge_combines_pages():
    result = merge_pdfs([io.BytesIO(make_pdf(2)), io.BytesIO(make_pdf(3))])
    assert len(PdfReader(io.BytesIO(result)).pages) == 5


def test_merge_requires_two_files():
    with pytest.raises(PdfMergeError):
        merge_pdfs([io.BytesIO(make_pdf())])


def test_merge_reports_invalid_file_index():
    streams = [io.BytesIO(make_pdf()), io.BytesIO(b"not a pdf")]
    with pytest.raises(PdfMergeError, match="File 2"):
        merge_pdfs(streams)


def test_merge_with_reduced_quality():
    result = merge_pdfs([io.BytesIO(make_pdf()), io.BytesIO(make_pdf())], 50)
    assert len(PdfReader(io.BytesIO(result)).pages) == 2


def test_merge_converts_unexpected_parser_errors():
    # Damaging the page-tree object makes pypdf fail with an AssertionError
    # instead of a PyPdfError. Any parser failure must become a PdfMergeError.
    damaged = make_pdf(5).replace(b"/Type /Pages", b"/Type  Pages")
    assert damaged != make_pdf(5)
    streams = [io.BytesIO(make_pdf()), io.BytesIO(damaged)]
    with pytest.raises(PdfMergeError, match="File 2"):
        merge_pdfs(streams)


def test_reduce_never_grows_already_compressed_images():
    # JPEGs saved below the target quality cannot be shrunk by re-encoding;
    # naive recompression made the merged file bigger than its inputs.
    pdfs = [make_image_pdf(seed, quality=50, optimize=True) for seed in (0, 7)]
    result = merge_pdfs([io.BytesIO(pdf) for pdf in pdfs], 65)
    assert len(result) <= sum(len(pdf) for pdf in pdfs)


def test_reduce_still_shrinks_high_quality_images():
    pdfs = [make_image_pdf(seed, quality=95) for seed in (0, 7)]
    result = merge_pdfs([io.BytesIO(pdf) for pdf in pdfs], 65)
    assert len(result) < 0.7 * sum(len(pdf) for pdf in pdfs)
