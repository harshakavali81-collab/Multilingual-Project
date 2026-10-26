# Deployment Guide

## Local development
- Python 3.11 or newer and Node.js 22 are recommended.
- Run the backend from the backend directory with Uvicorn.
- Run the frontend from the frontend directory with npm install and npm run dev.
- Configure VITE_API_BASE_URL if the API is not at http://localhost:8000.

## Docker Compose
1. Copy .env.example to .env.
2. Change DB_PASSWORD to a strong local password.
3. Optionally set GROQ_API_KEY to enable LLM-generated answers.
4. Run docker compose up --build.
5. Open the web UI at http://localhost:3000 and the API docs at http://localhost:8000/docs.
6. Stop the stack with docker compose down. The named PostgreSQL volume is retained; use docker compose down -v only when you intentionally want to erase the database volume.

## Environment
DATABASE_URL selects SQLite locally or PostgreSQL in Compose. CORS_ORIGINS is a comma-separated list. MAX_UPLOAD_BYTES defaults to 10 MiB. GROQ_API_KEY is optional. EMBEDDING_BACKEND=hashing forces the offline fallback; auto tries LaBSE when the optional package is installed. Set VITE_API_BASE_URL at frontend build time for non-local deployment.

## Production checklist
- Use HTTPS, least-privilege credentials, and strong database secrets.
- Never commit .env files, API tokens, user documents, database exports, or model caches.
- Put the frontend behind a production static web server and replace Vite's development server for production.
- Add authentication and authorization before exposing document management to the internet.
- Back up PostgreSQL and test recovery; add migrations, monitoring, rate limits, and request logging.
- Use a persistent embedding/vector store for larger document collections.
