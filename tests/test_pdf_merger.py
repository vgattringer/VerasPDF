import io

import pytest
from pypdf import PdfReader

from app.models.pdf_merger import PdfMergeError, merge_pdfs

from .conftest import make_pdf


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
