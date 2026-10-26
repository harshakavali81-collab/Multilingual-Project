# Project Workflow

## Setup and run
1. Clone or download this repository.
2. Configure backend environment variables; SQLite is the local default and Groq is optional.
3. Install backend requirements and start Uvicorn.
4. Install frontend packages and start Vite.
5. Confirm the UI shows the API as connected and open the API docs for direct checks.

## Add knowledge
1. A user enters a title, category, and content, or selects a text/Markdown/PDF file.
2. The API validates the request, verifies file type and size, and extracts text.
3. It detects the document language, writes the document to the database, and caches its embedding.
4. The UI refreshes the document list and counts.

## Ask a question
1. User submits a natural-language query and desired answer language.
2. API identifies the query language and embeds the query.
3. Retrieval ranks stored document vectors by cosine similarity and selects the strongest matches.
4. If no document is relevant, the API returns a safe no-context message.
5. Otherwise, the context is sent to Groq when configured; if not, or on provider failure, the extractive fallback is used.
6. The API returns the answer, source documents, answer mode, and any fallback notice, and saves the Q&A to history.
7. The UI presents the answer and source cards; history can be exported as JSON or cleared.

## Deployment
Docker Compose starts PostgreSQL first, waits for the database health check, then starts the API and Vite. The frontend is available on port 3000 and the API on port 8000. The database volume persists data between restarts.

## Verification
Run the backend test suite with EMBEDDING_BACKEND=hashing. CI also lints and builds the frontend and validates Compose. See the test plan for feature coverage and release checks.
