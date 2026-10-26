import io
import sqlite3

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture
def client(tmp_path):
    path = tmp_path / 'test.db'
    main.init_db(path)

    def override_db():
        db = sqlite3.connect(path, check_same_thread=False)
        db.row_factory = sqlite3.Row
        db.execute('PRAGMA foreign_keys=ON')
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[main.get_db] = override_db
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()


def test_health_and_empty_state(client):
    assert client.get('/health').status_code == 200
    assert client.get('/stats').json()['documents'] == 0
    assert client.get('/articles').json() == []
    result = client.post('/ask', json={'query': 'something', 'preferred_language': 'en'})
    assert result.status_code == 200
    assert result.json()['mode'] == 'no_match'
    assert client.get('/history').json()[0]['question'] == 'something'


def test_add_search_preview_delete_and_stats(client, monkeypatch):
    monkeypatch.delenv('GROQ_API_KEY', raising=False)
    monkeypatch.delenv('EMBEDDING_MODEL', raising=False)
    post = client.post('/upload', json={'title': 'Solar handbook', 'content': 'Solar panels convert sunlight to electricity. Solar energy is renewable.', 'category': 'Science'})
    assert post.status_code == 200
    doc_id = post.json()['document_id']
    assert client.get(f'/articles/{doc_id}').json()['title'] == 'Solar handbook'
    response = client.post('/ask', json={'query': 'solar sunlight', 'preferred_language': 'en'}).json()
    assert response['mode'] == 'extractive'
    assert response['sources'][0]['id'] == doc_id
    assert response['answer_language'] == 'en'
    assert client.get('/stats').json()['chunks'] == 1
    assert client.delete(f'/articles/{doc_id}').status_code == 200
    assert client.get(f'/articles/{doc_id}').status_code == 404
    assert client.get('/stats').json()['chunks'] == 0
    assert client.delete(f'/articles/{doc_id}').status_code == 404


def test_file_upload_and_validation(client):
    result = client.post('/upload-file', files={'file': ('note.txt', b'Rain falls from clouds.', 'text/plain')})
    assert result.status_code == 200
    assert client.get('/stats').json()['documents'] == 1
    invalid = client.post('/upload-file', files={'file': ('script.exe', b'not allowed', 'application/octet-stream')})
    assert invalid.status_code == 415
    oversized = client.post('/upload-file', files={'file': ('huge.txt', b'a' * (main.MAX_FILE_BYTES + 1), 'text/plain')})
    assert oversized.status_code == 413
    invalid_utf = client.post('/upload-file', files={'file': ('bad.txt', b'\xff\xfe', 'text/plain')})
    assert invalid_utf.status_code == 422


def test_languages_history_and_native_script(client, monkeypatch):
    monkeypatch.delenv('GROQ_API_KEY', raising=False)
    assert main.detect_language('తెలుగు భాష') == 'te'
    assert main.detect_language('हिन्दी भाषा') == 'hi'
    assert main.detect_language('தமிழ்') == 'ta'
    assert main.detect_language('ಕನ್ನಡ') == 'kn'
    assert 'kn' in client.get('/languages').json()
    client.post('/upload', json={'title': 'Telugu', 'content': 'తెలుగు భాష చాలా అందమైనది'})
    response = client.post('/ask', json={'query': 'తెలుగు', 'preferred_language': 'auto'}).json()
    assert response['preferred_language'] == 'te'
    assert response['sources']
    assert len(client.get('/history').json()) == 1
    assert client.delete('/history').status_code == 200
    assert client.get('/history').json() == []


def test_reject_blank_text(client):
    response = client.post('/upload', json={'title': 'Test', 'content': '   '})
    assert response.status_code == 422
    assert client.post('/ask', json={'query': '   '}).status_code == 422
