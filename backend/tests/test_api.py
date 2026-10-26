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
