# Repository standard

## Layout

This repository keeps its working source paths. A shared portfolio structure does not require moving a React application, Python package, BI workbook or Verilog project into identical runtime directories.

| Area | Convention |
| --- | --- |
| Landing page | `README.md`: purpose, visuals, demo, features, stack, architecture, setup, tradeoffs and roadmap |
| Detailed reference | `PROJECT_GUIDE.md`: retained project-specific explanation and historical release notes |
| Documentation | `docs/`: design, inventory, reproduction and evidence |
| Work intake | `.github/ISSUE_TEMPLATE/`: bug and feature forms |
| Review | `.github/PULL_REQUEST_TEMPLATE.md`: linked issue, behavior and validation |
| Automation | `.github/workflows/portfolio-docs.yml`: README section and local-link checks |
| Source and tests | Existing project-specific paths listed below; no empty source/test placeholders |

## Workflow

1. Open an issue describing the user problem and measurable acceptance criteria.
2. Add it to a GitHub Project with Todo, In progress, Review and Done states when a board is configured.
3. Use a focused branch and meaningful commits, such as `docs: correct local setup paths` or `fix(api): reject malformed input`.
4. Run the project's documented checks and `python scripts/check_portfolio_docs.py`.
5. Open a pull request with actual validation results and `Closes #<issue-number>`.
6. Merge after review; record release evidence and update the issue/board.

Board creation, profile pins, repository social previews and milestone settings require account-level configuration. This file does not claim those settings have been applied.

## Validation scope

The documentation check validates the landing-page headings and local link targets only. It does not execute models, certify test coverage, inspect Git history for secrets, verify external websites, or prove production readiness. Existing application workflows remain the source of runtime CI evidence.

Keep credentials in local environment variables. A gitignore rule does not remove secrets already tracked or committed. Use only permitted sample data in public demos.

## Inventory at standardization

The following are the pre-existing public project files. New standardization files are described above. Historical guides may mention external bundles that are not part of this list.

- [`CONTRIBUTING.md`](<../CONTRIBUTING.md>)
- [`Makefile`](<../Makefile>)
- [`README.md`](<../README.md>)
- [`SECURITY.md`](<../SECURITY.md>)
- [`backend`](<../backend>)
- [`backend/.env.example`](<../backend/.env.example>)
- [`backend/Dockerfile`](<../backend/Dockerfile>)
- [`backend/main.py`](<../backend/main.py>)
- [`backend/models.py`](<../backend/models.py>)
- [`backend/requirements-ml.txt`](<../backend/requirements-ml.txt>)
- [`backend/requirements.txt`](<../backend/requirements.txt>)
- [`backend/seed_demo.py`](<../backend/seed_demo.py>)
- [`backend/services.py`](<../backend/services.py>)
- [`backend/tests`](<../backend/tests>)
- [`backend/tests/conftest.py`](<../backend/tests/conftest.py>)
- [`backend/tests/test_api.py`](<../backend/tests/test_api.py>)
- [`docker-compose.prod.yml`](<../docker-compose.prod.yml>)
- [`docker-compose.yml`](<../docker-compose.yml>)
- [`docs`](<../docs>)
- [`docs/ANALYTICS.md`](<../docs/ANALYTICS.md>)
- [`docs/API_REFERENCE.md`](<../docs/API_REFERENCE.md>)
- [`docs/ARCHITECTURE.md`](<../docs/ARCHITECTURE.md>)
- [`docs/DEPLOYMENT.md`](<../docs/DEPLOYMENT.md>)
- [`docs/PRODUCTION_DEPLOYMENT.md`](<../docs/PRODUCTION_DEPLOYMENT.md>)
- [`docs/PROJECT_REPORT.md`](<../docs/PROJECT_REPORT.md>)
- [`docs/PROJECT_TREE.md`](<../docs/PROJECT_TREE.md>)
- [`docs/PROJECT_WORKFLOW.md`](<../docs/PROJECT_WORKFLOW.md>)
- [`docs/RELEASE_CHECKLIST.md`](<../docs/RELEASE_CHECKLIST.md>)
- [`docs/TEST_PLAN.md`](<../docs/TEST_PLAN.md>)
- [`docs/VERIFICATION.md`](<../docs/VERIFICATION.md>)
- [`docs/diagrams`](<../docs/diagrams>)
- [`docs/diagrams/analytics-flow.mmd`](<../docs/diagrams/analytics-flow.mmd>)
- [`docs/diagrams/architecture.mmd`](<../docs/diagrams/architecture.mmd>)
- [`docs/diagrams/database-erd.mmd`](<../docs/diagrams/database-erd.mmd>)
- [`docs/diagrams/deployment.mmd`](<../docs/diagrams/deployment.mmd>)
- [`docs/diagrams/qa-sequence.mmd`](<../docs/diagrams/qa-sequence.mmd>)
- [`docs/diagrams/workflow.mmd`](<../docs/diagrams/workflow.mmd>)
- [`frontend`](<../frontend>)
- [`frontend/.env.example`](<../frontend/.env.example>)
- [`frontend/Dockerfile`](<../frontend/Dockerfile>)
- [`frontend/README.md`](<../frontend/README.md>)
- [`frontend/eslint.config.js`](<../frontend/eslint.config.js>)
- [`frontend/index.html`](<../frontend/index.html>)
- [`frontend/nginx.conf`](<../frontend/nginx.conf>)
- [`frontend/package-lock.json`](<../frontend/package-lock.json>)
- [`frontend/package.json`](<../frontend/package.json>)
- [`frontend/public`](<../frontend/public>)
- [`frontend/public/favicon.svg`](<../frontend/public/favicon.svg>)
- [`frontend/public/icons.svg`](<../frontend/public/icons.svg>)
- [`frontend/src`](<../frontend/src>)
- [`frontend/src/AccountSecurity.jsx`](<../frontend/src/AccountSecurity.jsx>)
- [`frontend/src/App.css`](<../frontend/src/App.css>)
- [`frontend/src/App.jsx`](<../frontend/src/App.jsx>)
- [`frontend/src/AuthLogin.jsx`](<../frontend/src/AuthLogin.jsx>)
- [`frontend/src/assets`](<../frontend/src/assets>)
- [`frontend/src/assets/hero.png`](<../frontend/src/assets/hero.png>)
- [`frontend/src/assets/react.svg`](<../frontend/src/assets/react.svg>)
- [`frontend/src/assets/vite.svg`](<../frontend/src/assets/vite.svg>)
- [`frontend/src/index.css`](<../frontend/src/index.css>)
- [`frontend/src/main.jsx`](<../frontend/src/main.jsx>)
- [`frontend/vite.config.js`](<../frontend/vite.config.js>)
- [`scripts`](<../scripts>)
- [`scripts/backup-postgres.sh`](<../scripts/backup-postgres.sh>)
- [`scripts/restore-postgres.sh`](<../scripts/restore-postgres.sh>)
