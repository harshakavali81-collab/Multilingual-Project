# Repository tree (source of truth: GitHub)
```text
Multilingual-Project/
├── .env.example
├── .github/workflows/ci.yml           # CI: pytest, ESLint, build, Docker
├── backend/
│   ├── main.py                        # routes, DB, ingestion, retrieval, analytics, auth gate
│   ├── seed_demo.py                   # explicit demo seed (not loaded automatically)
│   ├── requirements.txt               # FastAPI, SQLAlchemy, PDF/DOCX, Groq
│   ├── requirements-ml.txt            # optional multilingual LaBSE
│   ├── .env.example                   # local backend configuration
│   ├── Dockerfile
│   └── tests/
│       ├── conftest.py
│       └── test_api.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # uploads, Q&A, search, history, live charts
│   │   ├── App.css                    # responsive dashboard styling
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/                        # static icons
│   ├── package.json / package-lock.json
│   ├── vite.config.js
│   └── Dockerfile
├── docs/
│   ├── API_REFERENCE.md
│   ├── ANALYTICS.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_REPORT.md
│   ├── PROJECT_TREE.md
│   ├── PROJECT_WORKFLOW.md
│   ├── RELEASE_CHECKLIST.md
│   ├── TEST_PLAN.md
│   ├── VERIFICATION.md
│   └── diagrams/
│       ├── architecture.mmd
│       ├── workflow.mmd
│       ├── database-erd.mmd
│       ├── qa-sequence.mmd
│       ├── deployment.mmd
│       └── analytics-flow.mmd
├── docker-compose.yml
├── .gitignore
├── CONTRIBUTING.md
├── Makefile
├── SECURITY.md
└── README.md
```

### Model and runtime boundaries
- Documents and conversation history live in SQL storage, not git.
- Embeddings are calculated in process memory; installing optional sentence-transformers enables semantic multilingual retrieval.
- GROQ_API_KEY enables generated answers. Without it, answers are extractive and may not be translated.
- DOCX/PDF import extracts selectable text, not OCR.
- /analytics uses persisted records; visualizations are **actual counts**, not forecast or sample data.

## Additional production files
- `frontend/nginx.conf`: static frontend and same-origin /api reverse proxy.
- `frontend/src/AuthLogin.jsx` and `AccountSecurity.jsx`: account sign-in, password updates and admin user creation.
- `docker-compose.prod.yml`, `.env.production.example`: containerized private deployment configuration.
- `scripts/backup-postgres.sh` and `restore-postgres.sh`: operator-run backup and restore scripts.
- `docs/PRODUCTION_DEPLOYMENT.md`: deployment, HTTPS, secrets, storage and verification.
