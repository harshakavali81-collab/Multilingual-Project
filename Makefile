.PHONY: test backend frontend-build frontend-lint compose-check

test:
	python -m pytest -q backend/tests

backend:
	cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

compose-check:
	docker compose config --quiet
