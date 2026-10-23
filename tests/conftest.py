import io

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter

from app.api import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def make_pdf(pages: int = 1) -> bytes:
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()
