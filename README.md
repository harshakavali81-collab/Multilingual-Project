# LinguaBase — Multilingual Indian Language Knowledge Base

A full-stack **React + FastAPI** knowledge base for uploading documents and asking evidence-backed questions in **English, Hindi, Telugu, Tamil and Kannada**. The interface includes a document library, source previews, persistent conversation history, JSON export, and language analytics.

## What works without API keys

- Ingest **PDF (selectable text), DOCX, TXT, MD, CSV**, or paste text directly.
- Auto-detect English / Devanagari / Telugu / Tamil / Kannada scripts; index text into overlapping passages in **SQLite**.
- Search matching documents using local keyword ranking, display **source excerpts** and link directly to original documents.
- Browse, preview, delete documents, save questions, export or clear chat history, and see usage stats.
- Run the API and frontend locally or via Docker Compose. No paid accounts are required.

## Optional AI integrations

The app distinguishes *grounded source excerpts* from *AI-generated answers*. Without a Groq key, it **does not claim to generate a translated answer**. Cross-language semantic matching needs an optional multilingual embedding model; the lightweight default uses same-language lexical matching.

- **Generative answers:** configure `GROQ_API_KEY` (and optionally `GROQ_MODEL`). Uses retrieved passages and instructs the model to answer in the selected language.
- **Multilingual semantic retrieval:** install `backend/requirements-ai.txt` and set `EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. First retrieval downloads model weights; subsequent requests need sufficient memory. Configure the Docker backend to install `requirements-ai.txt` if using embeddings in a container.
- Translation quality depends on the selected model and retrieved source quality; short or ambiguous questions may be hard to match.

## Run locally

Requirements: **Python 3.11+** and **Node.js 22+**.

**Terminal 1 (backend)**

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 (frontend)**

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173**, API docs **http://localhost:8000/docs**, health **http://localhost:8000/health**. The Vite dev server proxies `/api` to the backend so no hard-coded browser API address is needed.

## Run with Docker

From the repository root:

```bash
docker compose up --build
```

Open **http://localhost:5173**. SQLite data persists in a Docker named volume; it is not tracked in Git. For optional AI answer generation, copy `.env.example` to `.env` and set `GROQ_API_KEY`. Keep `.env` private. Docker defaults to the lightweight lexical search mode.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/health` | API and optional AI features |
| GET | `/languages` | Supported languages |
| GET | `/articles` | Document list and previews |
| GET | `/articles/{id}` | Full document content |
| DELETE | `/articles/{id}` | Delete document and chunks |
| POST | `/upload` | Add text `{title, content, category}` |
| POST | `/upload-file` | Upload a multipart file field named `file` |
| POST | `/ask` | Ask `{query, preferred_language}` (`auto/en/hi/te/ta/kn`) |
| GET | `/history` | Last 200 stored questions and answers |
| DELETE | `/history` | Clear history |
| GET | `/stats` | Total documents, chunks, questions and languages |

Answer metadata reports `mode` (`generated`, `extractive`, `no_match`), `answer_language`, `retrieval_mode` and source details, so clients can distinguish model-generated responses from copied context.

## Tests and checks

```bash
pip install -r backend/requirements-dev.txt
PYTHONPATH=backend pytest -q backend/tests
cd frontend && npm install && npm run lint && npm run build
```

GitHub Actions runs backend tests and frontend lint/build on pushes and pull requests.

## Limits and privacy

- **Single-user/local demo, not a production multi-tenant service.** The API has no login or access controls. Do **not** publicly expose it with sensitive documents before adding authentication, authorization, encryption/retention policy, abuse controls and production hosting protections.
- Up to **5 MB** per upload and **500,000 characters** per document. Image-only PDFs require a separate OCR pipeline.
- Optional embedding mode computes vectors during retrieval; for large datasets, move to a persisted vector index / batch ingestion.
- History and document text are stored unencrypted in SQLite. With Groq enabled, selected retrieved excerpts are sent to Groq to produce an answer; handle sensitive content accordingly.
- Docker uses Vite's development server for ease of testing, not a hardened production static web server.

## Project structure

`backend/main.py` — API, search and SQLite  
`backend/tests/test_api.py` — endpoint tests  
`frontend/src/App.jsx` — responsive React UI  
`frontend/src/App.css` — app design  
`docker-compose.yml` — local stack  
`.github/workflows/ci.yml` — automated checks

Built as a portfolio-ready, expandable demo. Contributions and suggestions welcome.
