# Project Report: Multilingual Indian Language Knowledge Base Platform

## Abstract
The project provides a searchable knowledge base for documents written in English, Hindi, Telugu, Tamil, and Kannada. Users can add articles or upload text-based files, ask grounded questions, inspect source documents, and review conversation history.

## Problem statement
Knowledge stored in multiple languages can be difficult to search using a single language interface. The project brings document ingestion, retrieval, and answer presentation into one application and reports the documents used to construct an answer.

## Objectives
- Build a complete React + FastAPI application.
- Persist uploaded text and Q&A history in a relational database.
- Detect supported language scripts and return source-linked answers.
- Support optional multilingual embeddings and hosted LLM generation while preserving local fallback behavior.
- Provide tests, deployment configurations, architecture documentation, and a maintainable GitHub workflow.

## Technology
React, Vite, JavaScript, FastAPI, Pydantic, SQLAlchemy, SQLite/PostgreSQL, Sentence Transformers with LaBSE (optional), Groq (optional), pypdf, pytest, Docker Compose, and GitHub Actions.

## System design
The frontend calls FastAPI endpoints. The API validates data, writes documents to SQL storage, embeds document/question text, ranks candidate documents by cosine similarity, and supplies the selected context to the answer layer. Groq is used when configured; otherwise a local extractive fallback returns relevant sentences. The result includes source metadata and is saved to chat history.

## Main features
Text article creation, text/Markdown/PDF upload, file type and size validation, source display, supported-language picker, auto-detection, persisted chat history, JSON export, document deletion, usage statistics, API health, Swagger documentation, automated testing, Docker Compose, and CI checks.

## API summary
GET /health, GET /articles, GET /documents/{document_id}, POST /upload, POST /upload-file, DELETE /documents/{document_id}, POST /ask, GET /history, DELETE /history, and GET /stats.

## Verification
The local backend API test suite passed: 6 tests. Python source compilation passed. PDF report rendering was inspected for clipping. Frontend lint/build could not be run inside the authoring container because npm packages were not installed and registry network access was unavailable; GitHub Actions is configured to validate those steps after push.

## Limitations and next steps
The hashing vectorizer is a lightweight offline fallback and does not deliver full cross-lingual semantics; install LaBSE for multilingual transformer embeddings. Scanned PDFs require OCR. For production, add authentication, access controls, migrations, rate limiting, monitoring, backups, and a persistent vector database.

## Run
Install the backend requirements in backend, start Uvicorn, then install frontend packages and run Vite. Alternatively use Docker Compose. See README.md, docs/DEPLOYMENT.md, and docs/API_REFERENCE.md for exact steps.

