# Test Plan

## Automated checks
- GET / and GET /health return healthy service metadata.
- Empty database questions produce an intentional empty-state answer.
- Text upload saves a document with detected language.
- Question answering returns an answer and source metadata.
- Chat history persists and statistics reflect stored records.
- File upload accepts text formats and rejects unsupported extensions.
- Document deletion removes the record from the API.
- Clearing chat history removes persisted conversation entries.
- Frontend CI runs ESLint and a production build.
- Docker CI builds the backend image and validates Compose configuration.

## Local command
Set EMBEDDING_BACKEND=hashing, install backend/requirements.txt, then run python -m pytest -q backend/tests from the repository root.

## Manual smoke test
1. Open the UI and verify API connected status.
2. Add a short article, then verify the library count.
3. Ask a question whose answer is contained in the article.
4. Verify source cards and history are visible.
5. Upload a text-based PDF or text file.
6. Export history to JSON, clear history, and verify the empty state.
7. Remove a test document and confirm the list refreshes.

## Known limitations
The local hashing fallback is not cross-language semantic retrieval. LaBSE improves this when installed and loaded. The Groq service is external and optional. Scanned PDFs need OCR. Authentication, migrations, persistent vector indexing, and production-grade observability remain future work.
