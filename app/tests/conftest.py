import io

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter

from app.api import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app, raise_server_exceptions=False)


def make_pdf(pages: int = 1) -> bytes:
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def make_image_pdf(seed: int, **save_options) -> bytes:
    """One-page PDF holding a photo-like JPEG saved with the given options."""
    from PIL import Image, ImageFilter

    size = (800, 600)
    base = Image.effect_noise((100, 75), 60 + seed).convert("RGB").resize(size)
    noise = Image.effect_noise(size, 12 + seed).convert("RGB")
    image = Image.blend(base, noise, 0.15).filter(ImageFilter.GaussianBlur(1))
    buffer = io.BytesIO()
    image.save(buffer, "PDF", **save_options)
    return buffer.getvalue()
