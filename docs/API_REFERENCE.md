# API Reference

The backend base URL is http://localhost:8000. Interactive OpenAPI docs are at /docs.

## Health and discovery
- GET / returns service name, version, and documentation routes.
- GET /health returns status, timestamp, whether Groq is configured, and selected embedding mode.

## Documents
- GET /articles returns saved documents, newest first.
- GET /documents/{document_id} returns one document or 404.
- POST /upload accepts multipart form fields: title, content, category.
- POST /upload-file accepts one uploaded PDF, TXT, or Markdown file (10 MiB default limit).
- DELETE /documents/{document_id} deletes one document and its in-memory embedding.

A successful upload returns message, document_id, title, and detected_language. Document responses contain id, title, content, language, category, and created_at.

## Questions
POST /ask accepts JSON with:
- query: required string, 1 to 4,000 characters.
- preferred_language: optional language code or name; use auto for detection.
- top_k: optional integer from 1 to 10, default 3.

The response includes answer, sources, detected_query_language, answer_language, answer_mode, and notice. Sources include document ID, title, language, and category. answer_mode identifies groq-llm, extractive-fallback, empty-knowledge-base, or no-relevant-context.

## History and stats
- GET /history?limit=100 reads persisted conversation history (limit is bounded to 1..500).
- DELETE /history clears persisted conversation history.
- GET /stats reports document count, question count, language counts, and supported languages.

## Error behavior
Validation errors return HTTP 422. Unsupported file types return 415, oversized uploads return 413, missing documents return 404. Provider errors fall back to a local extractive response rather than returning a traceback or exposing the API key.

## Additions
- GET /search?q=solar&limit=10 — ranked document previews, title and relevance scores; 1..50 results.
- GET /analytics?days=14 — day-by-day document uploads and questions (1..90 days), language/category distributions and answer modes.
- POST /upload-file also accepts CSV and DOCX documents. Text extraction is capped by MAX_DOCUMENT_CHARS (default 200,000); PDF parsing is capped at 250 pages. No OCR for scanned images.
- Set optional APP_API_KEY on the backend to protect data routes; send X-API-Key on API requests. The /health, /docs and OpenAPI spec endpoints remain public. The default local demo does not require a key.
