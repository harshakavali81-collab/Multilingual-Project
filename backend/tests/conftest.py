import os
import sys
from pathlib import Path

os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/multilingual_kb_pytest_import.sqlite3")
os.environ["EMBEDDING_BACKEND"] = "hashing"
os.environ.pop("GROQ_API_KEY", None)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import main


@pytest.fixture()
def client(tmp_path, monkeypatch):
    database_file = tmp_path / "test.sqlite3"
    test_engine = create_engine(
        "sqlite:///" + str(database_file),
        connect_args={"check_same_thread": False},
    )
    main.Base.metadata.create_all(bind=test_engine)
    test_session = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)

    def override_get_db():
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    monkeypatch.setattr(main, "SessionLocal", test_session)
    main.app.dependency_overrides[main.get_db] = override_get_db
    main._DOCUMENT_EMBEDDINGS.clear()
    main._encoder = None
    main._encoder_attempted = True
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()
    main._DOCUMENT_EMBEDDINGS.clear()
    test_engine.dispose()
