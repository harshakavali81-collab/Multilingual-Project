# Multilingual Indian Language Knowledge Base Platform

A full-stack knowledge-base application for adding documents and asking grounded questions in English, Hindi, Telugu, Tamil, and Kannada.

[Setup](#local-installation--setup-guide) · [Architecture](#architecture--system-design-diagram) · [Detailed guide](PROJECT_GUIDE.md) · [Repository standard](docs/REPOSITORY_STANDARD.md)

## Visuals

![Project diagram / illustration](<frontend/src/assets/hero.png>)

Existing project visual; diagrams and illustrative graphics are not evidence of a deployed application.

## Live Link / Demo

Run the local demo using the setup guide below. No public deployment URL has been verified for this documentation update.

## Key Features

- Responsive React and Vite user interface.
- FastAPI backend with SQLite for local use and PostgreSQL for Docker deployments.
- Add text articles or upload text, Markdown, and text-based PDF documents.
- Language identification and semantic-style retrieval; LaBSE embeddings are enabled when the optional ML package and model are available.
- Optional Groq-generated answers with an extractive local fallback when the API key is not configured.
- Source document references, persistent chat history, export-to-JSON, document deletion, language counts, and dashboard statistics.
- API documentation at the FastAPI Swagger page.
- Unit/API tests, GitHub Actions checks, Docker Compose deployment, architecture diagrams, and a project report.

## Tech Stack

![Python](https://img.shields.io/badge/Python-334155?style=flat-square) ![FastAPI](https://img.shields.io/badge/FastAPI-334155?style=flat-square) ![React](https://img.shields.io/badge/React-334155?style=flat-square) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-334155?style=flat-square)

Dependency versions and optional packages are defined in the repository manifests.

## Architecture / System Design Diagram

[Architecture documentation / diagram](<docs/ARCHITECTURE.md>)

## Local Installation & Setup Guide

```bash
git clone https://github.com/harshakavali81-collab/Multilingual-Project.git
cd Multilingual-Project
```

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

## Challenges & Solutions

Multilingual embeddings and generated answers depend on optional models and API access. The project provides a local hashing/lexical retrieval path and extractive answer fallback so the API remains usable without those services, while documenting that this fallback does not provide equivalent multilingual semantics.

## Future Improvements

- Capture a reproducible end-to-end demo with runtime versions and sample inputs.
- Expand regression checks for invalid inputs and documented edge cases.
- Record measured results, data provenance and deployment limitations alongside each release.

## Scope and supporting evidence

A full-stack knowledge-base application for adding documents and asking grounded questions in English, Hindi, Telugu, Tamil, and Kannada.

## Repository Structure

| Location | Purpose |
| --- | --- |
| `backend/` | Backend services |
| `frontend/` | Frontend interface |
| `docs/` | Documentation |
| `scripts/` | Automation scripts |
| `.github/` | Issue forms, PR template and automated checks |

[Complete file inventory and workflow](docs/REPOSITORY_STANDARD.md). Runtime entry points retain their existing paths.

## Workflow & Tracking

Use the [bug and feature forms](https://github.com/harshakavali81-collab/Multilingual-Project/issues/new/choose) to define work with acceptance criteria. Keep tasks in Todo → In progress → Review → Done, and link a pull request with `Closes #<number>`. See [the maintenance workflow](docs/REPOSITORY_STANDARD.md#workflow).

## License

Original project software is available under the [MIT License](LICENSE). See [licensing scope](docs/LICENSING.md) for third-party and data exclusions.

