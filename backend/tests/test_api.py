def test_health_and_root(client):
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "operational"
    assert client.get("/").json()["docs"] == "/docs"


def test_empty_knowledge_base_is_a_valid_response(client):
    response = client.post("/ask", json={"query": "What is solar energy?", "preferred_language": "en"})
    assert response.status_code == 200
    assert "empty" in response.json()["answer"].lower()
    assert response.json()["sources"] == []


def test_upload_question_sources_history_and_stats(client):
    upload = client.post(
        "/upload",
        data={
            "title": "Solar energy",
            "content": "Solar panels convert sunlight into electricity. Solar energy is renewable.",
            "category": "Energy",
        },
    )
    assert upload.status_code == 201
    assert upload.json()["detected_language"] == "English"

    answer = client.post("/ask", json={"query": "How do solar panels make electricity?", "preferred_language": "en"})
    assert answer.status_code == 200
    assert answer.json()["sources"][0]["title"] == "Solar energy"
    assert answer.json()["answer"]

    history = client.get("/history").json()
    assert len(history) == 1
    assert history[0]["question"].startswith("How do solar panels")
    assert client.get("/stats").json()["document_count"] == 1


def test_file_upload_and_document_delete(client):
    upload = client.post(
        "/upload-file",
        files={"file": ("notes.txt", b"Telugu knowledge base demo content.", "text/plain")},
    )
    assert upload.status_code == 201
    doc_id = upload.json()["document_id"]
    assert client.get("/documents/" + str(doc_id)).status_code == 200
    assert client.delete("/documents/" + str(doc_id)).status_code == 200
    assert client.get("/documents/" + str(doc_id)).status_code == 404


def test_upload_rejects_unsupported_types(client):
    response = client.post(
        "/upload-file",
        files={"file": ("payload.exe", b"not supported", "application/octet-stream")},
    )
    assert response.status_code == 415


def test_clear_history(client):
    client.post("/ask", json={"query": "Anything?"})
    assert client.get("/history").json()
    result = client.delete("/history")
    assert result.status_code == 200
    assert client.get("/history").json() == []



def test_csv_and_docx_upload(client):
    from io import BytesIO
    from docx import Document

    csv = client.post("/upload-file", files={"file": ("sales.csv", "region,sales\\nHyderabad,42".encode(), "text/csv")})
    assert csv.status_code == 201
    assert csv.json()["title"] == "sales.csv"
    doc = Document()
    doc.add_paragraph("Kannada and Telugu documentation for onboarding.")
    payload = BytesIO()
    doc.save(payload)
    response = client.post("/upload-file", files={"file": ("guide.docx", payload.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")})
    assert response.status_code == 201
    assert "onboarding" in client.get("/documents/" + str(response.json()["document_id"])).json()["content"]


def test_analytics_uses_real_database_counts(client):
    client.post("/upload", data={"title": "Report", "content": "Water is important for life.", "category": "Science"})
    client.post("/ask", json={"query": "What is water?"})
    result = client.get("/analytics?days=7")
    assert result.status_code == 200
    analytics = result.json()
    assert len(analytics["daily"]) == 7
    assert sum(day["documents"] for day in analytics["daily"]) == 1
    assert sum(day["questions"] for day in analytics["daily"]) == 1
    assert analytics["category_counts"]["Science"] == 1


def test_search_and_limits(client, monkeypatch):
    client.post("/upload", data={"title": "Solar", "content": "Solar energy converts sunlight into power."})
    matched = client.get("/search?q=solar")
    assert matched.status_code == 200
    assert matched.json()["total"] >= 1
    assert "content" not in matched.json()["results"][0]
    monkeypatch.setattr("main.MAX_DOCUMENT_CHARS", 12)
    assert client.post("/upload", data={"title": "Too long", "content": "This document exceeds the maximum length."}).status_code == 413


def test_optional_private_mode(client, monkeypatch):
    monkeypatch.setenv("APP_API_KEY", "a-local-test-secret")
    assert client.get("/health").status_code == 200
    assert client.get("/articles").status_code == 401
    assert client.get("/articles", headers={"X-API-Key": "wrong"}).status_code == 401
    assert client.get("/articles", headers={"X-API-Key": "a-local-test-secret"}).status_code == 200
