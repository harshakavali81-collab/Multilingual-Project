# Architecture

## Components

1. React + Vite provides the responsive dashboard, language picker, document forms, file upload, source links, recent conversations, export, and status messages.
2. FastAPI exposes a documented REST API, validates payloads, enforces upload limits, and manages HTTP errors and CORS.
3. SQLAlchemy stores documents and conversation records in SQLite locally or PostgreSQL under Docker Compose.
4. The retrieval layer embeds documents and questions. If Sentence Transformers and LaBSE are available, it uses multilingual transformer embeddings. A deterministic hashing-vector fallback keeps offline demos and tests usable but is not a substitute for cross-lingual transformer semantics.
5. Groq is an optional answer-generation provider. The prompt constrains answers to retrieved context. When the provider is missing or fails, a local extractive answer is returned.
6. GitHub Actions runs backend API tests, frontend lint/build, and Docker Compose configuration validation.

## Data flow

Browser → API request → FastAPI validation → SQLAlchemy document query → query/document embeddings → ranked context → optional Groq generation or local fallback → answer plus source metadata → persistent chat history → UI.

## Persistence

The documents table holds title, content, detected language, category, and created timestamp. The chat_history table stores question, answer, language, source JSON, answer mode, and timestamp. Embeddings are cached in process memory and recomputed when needed; no persistent vector index is currently shipped.

## Security and reliability

Secrets are environment variables and are excluded from commits. Uploads are restricted to plain text, Markdown, and text-based PDFs, with a configurable size cap. CORS origins are configurable. Health checks support local and container validation. For production deployment, add authentication, authorization, rate limiting, migration tooling, observability, backups, and a persistent vector database.

## Additional graphs
- [Component graph](diagrams/architecture.mmd)
- [Document-to-answer workflow](diagrams/workflow.mmd)
- [Entity relationship diagram](diagrams/database-erd.mmd)
- [Query/response sequence](diagrams/qa-sequence.mmd)
- [Local deployment graph](diagrams/deployment.mmd)
- [Live metrics data flow](diagrams/analytics-flow.mmd)

Charts are computed from persisted database rows and updated when the React dashboard refreshes. The optional API key middleware is enforced for all data operations when APP_API_KEY is configured; it does **not** implement user accounts or document access isolation.
