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


def test_security_headers_are_set(client):
    response = client.get("/api/health")
    assert response.headers["x-content-type-options"] == "nosniff"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]


def test_merge_rejects_too_many_files(client):
    pdf = make_pdf()
    response = client.post("/api/merge", files=_files(*[pdf] * 21))
    assert response.status_code == 413


def test_merge_rejects_oversized_file(client, monkeypatch):
    monkeypatch.setattr("app.controllers.merge_controller.MAX_FILE_BYTES", 10)
    response = client.post("/api/merge", files=_files(make_pdf(), make_pdf()))
    assert response.status_code == 413


def test_merge_rejects_non_pdf_content(client):
    response = client.post("/api/estimate", files=_files(make_pdf(), b"GIF89a....."))
    assert response.status_code == 400


def test_oversized_body_is_rejected(client, monkeypatch):
    monkeypatch.setattr("app.api.MAX_BODY_BYTES", 10)
    response = client.post("/api/merge", files=_files(make_pdf(), make_pdf()))
    assert response.status_code == 413


def test_unexpected_error_is_generic_and_has_headers(client, monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("secret internal detail")

    monkeypatch.setattr("app.controllers.merge_controller.merge_pdfs", boom)
    response = client.post("/api/merge", files=_files(make_pdf(), make_pdf()))
    assert response.status_code == 500
    assert "secret" not in response.text
    assert response.json() == {"detail": "Something went wrong on the server."}
    assert response.headers["x-content-type-options"] == "nosniff"


def test_validation_error_does_not_echo_input(client):
    response = client.post(
        "/api/merge",
        files=_files(make_pdf(), make_pdf()),
        data={"image_quality": "secret-value"},
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "Invalid request."}


def test_unknown_route_keeps_security_headers(client):
    response = client.get("/api/nope")
    assert response.status_code == 404
    assert response.headers["x-frame-options"] == "DENY"


def test_filename_in_message_is_sanitized(client):
    name = "a\nb" + "x" * 200 + ".pdf"
    response = client.post(
        "/api/merge",
        files=[
            ("files", (name, b"GIF89a....", "application/pdf")),
            ("files", ("b.pdf", make_pdf(), "application/pdf")),
        ],
    )
    detail = response.json()["detail"]
    assert response.status_code == 400
    assert "\n" not in detail and len(detail) < 120


def test_estimate_returns_size(client):
    response = client.post(
        "/api/estimate",
        files=_files(make_pdf(), make_pdf()),
        data={"image_quality": 50},
    )
    assert response.status_code == 200
    assert isinstance(response.json()["size"], int)
