from .conftest import make_pdf


def _files(*contents: bytes):
    return [
        ("files", (f"{i}.pdf", c, "application/pdf")) for i, c in enumerate(contents)
    ]


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_merge_returns_pdf(client):
    response = client.post("/api/merge", files=_files(make_pdf(), make_pdf()))
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'filename="merged.pdf"' in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")


def test_merge_single_file_is_rejected(client):
    response = client.post("/api/merge", files=_files(make_pdf()))
    assert response.status_code == 400


def test_merge_invalid_file_is_rejected(client):
    response = client.post("/api/merge", files=_files(make_pdf(), b"not a pdf"))
    assert response.status_code == 400
    assert "not a valid PDF" in response.json()["detail"]


def test_merge_rejects_out_of_range_quality(client):
    response = client.post(
        "/api/merge",
        files=_files(make_pdf(), make_pdf()),
        data={"image_quality": 0},
    )
    assert response.status_code == 422


def test_estimate_returns_size(client):
    response = client.post(
        "/api/estimate",
        files=_files(make_pdf(), make_pdf()),
        data={"image_quality": 50},
    )
    assert response.status_code == 200
    assert isinstance(response.json()["size"], int)
