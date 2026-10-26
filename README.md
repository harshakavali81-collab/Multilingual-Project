# Multilingual Indian Language Knowledge Base Platform

A full-stack knowledge-base application for adding documents and asking grounded questions in English, Hindi, Telugu, Tamil, and Kannada.

## Features

- Responsive React and Vite user interface.
- FastAPI backend with SQLite for local use and PostgreSQL for Docker deployments.
- Add text articles or upload text, Markdown, and text-based PDF documents.
- Language identification and semantic-style retrieval; LaBSE embeddings are enabled when the optional ML package and model are available.
- Optional Groq-generated answers with an extractive local fallback when the API key is not configured.
- Source document references, persistent chat history, export-to-JSON, document deletion, language counts, and dashboard statistics.
- API documentation at the FastAPI Swagger page.
- Unit/API tests, GitHub Actions checks, Docker Compose deployment, architecture diagrams, and a project report.

## Repository layout

- backend/main.py — API, persistence, retrieval, answer generation, upload parsing, and analytics.
- backend/requirements.txt — core runtime and test dependencies.
- backend/requirements-ml.txt — optional Sentence Transformers dependency for LaBSE.
- backend/tests — API test suite.
- frontend/src — React UI and responsive styling.
- docker-compose.yml — PostgreSQL, API, and UI services.
- docs — workflow, architecture, API reference, deployment guide, test plan, and project report.

## Run locally

### 1. Start the API

In a terminal:

    cd backend
    python -m venv .venv

Activate the environment on Windows PowerShell:

    .venv\Scripts\Activate.ps1

On macOS/Linux:

    source .venv/bin/activate

Install dependencies and start the service:

    python -m pip install -r requirements.txt
    uvicorn main:app --reload

The API is available at http://localhost:8000 and the interactive API guide at http://localhost:8000/docs. Copy backend/.env.example to backend/.env to set environment values. GROQ_API_KEY is optional; without it, the API uses an extractive fallback answer. The first LaBSE model load may download a large model. For a lightweight offline run, set EMBEDDING_BACKEND=hashing.

### 2. Start the frontend

Open another terminal:

    cd frontend
    npm install
    npm run dev

Open the URL printed by Vite, usually http://localhost:5173. Set VITE_API_BASE_URL in frontend/.env.local if the API runs elsewhere.

## Run tests

From the repository root:

    EMBEDDING_BACKEND=hashing python -m pytest -q backend/tests

On Windows PowerShell:

    $env:EMBEDDING_BACKEND = "hashing"
    python -m pytest -q backend/tests

The GitHub Actions workflow also installs frontend dependencies, runs lint and production build, and validates the Docker Compose configuration.

## Run with Docker Compose

Copy .env.example to .env, change DB_PASSWORD to a strong local value, and optionally add GROQ_API_KEY. Then run:

    docker compose up --build

Open http://localhost:3000 for the app, http://localhost:8000/docs for the API, and http://localhost:8000/health for health status. Compose stores PostgreSQL data in the named postgres_data volume.

## API routes

- GET /health — backend status and optional provider configuration indicator.
- GET /articles — list documents.
- GET /documents/{document_id} — retrieve one document.
- POST /upload — save text submitted as form fields title, content, and category.
- POST /upload-file — upload .txt, .md, or a text-based .pdf file.
- DELETE /documents/{document_id} — delete one document.
- POST /ask — ask a question. JSON fields: query, preferred_language, and optional top_k.
- GET /history — retrieve saved Q&A history.
- DELETE /history — clear saved chat history.
- GET /stats — document and question counts plus language breakdown.

## Retrieval and AI notes

When configured, Sentence Transformers loads sentence-transformers/LaBSE for multilingual embeddings. If that optional model cannot load, the backend stays available with a deterministic local hashing/lexical vector fallback. That fallback is useful for offline demos and basic same-language matching; it is not equivalent to a multilingual transformer. Configure GROQ_API_KEY to use the Groq chat-completions service. Model output is instructed to stay grounded in retrieved context, and the API reports its answer mode and any fallback notice.

Uploads are limited by MAX_UPLOAD_BYTES (10 MiB by default). Scanned PDFs do not contain selectable text; OCR is not included. Do not commit credentials, private documents, virtual environments, database files, or model caches.

## Project documentation

Start with docs/PROJECT_WORKFLOW.md and docs/ARCHITECTURE.md for system flow and component boundaries. docs/API_REFERENCE.md lists request and response shapes. docs/DEPLOYMENT.md, docs/TEST_PLAN.md, and docs/PROJECT_REPORT.md cover deployment, verification, and the project explanation. A PDF version of the report is included in the project bundle.

## Troubleshooting

- API offline in the UI: start the backend and verify VITE_API_BASE_URL.
- LLM responses unavailable: verify GROQ_API_KEY; without it, fallback mode is expected.
- First LaBSE run is slow: model download and initial loading may take time. Use EMBEDDING_BACKEND=hashing for offline testing.
- PostgreSQL connection fails in Compose: check DB_PASSWORD and ensure the database service is healthy.
- PDF contains no text: upload a text-based PDF or extract text before upload.

## License

Unless a license is added by the project owner, all rights remain with the repository owner. Choose an open-source license explicitly if you want to grant reuse rights.

## 2026 completion upgrade
The `feature/finalize-analytics-diagrams-and-security` branch adds **DOCX and CSV ingestion**, a **document-length guard**, optional single-user **APP_API_KEY** private mode, **/search** and **/analytics** endpoints, and live bar charts for language distribution and daily question traffic. Charts always use real SQLite/PostgreSQL counts (zero before use); no invented sample metrics.

**Private mode:** set APP_API_KEY in the backend environment, then enter that key into the frontend's optional private-key field and click Connect. Do not set a VITE_APP_API_KEY or otherwise embed the secret in frontend source. This is a shared-key demo, not multi-user login.

**Project structure and diagrams:** see [full tree](docs/PROJECT_TREE.md), [component architecture](docs/diagrams/architecture.mmd), [database relationships](docs/diagrams/database-erd.mmd), [question sequence](docs/diagrams/qa-sequence.mmd), [deployment graph](docs/diagrams/deployment.mmd), and [analytics data flow](docs/diagrams/analytics-flow.mmd). [Analytics guide](docs/ANALYTICS.md) and [release checklist](docs/RELEASE_CHECKLIST.md) provide descriptions and verification criteria.
