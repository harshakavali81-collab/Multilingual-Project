# Release / verification checklist

- [x] All changes committed to a named GitHub branch; use a PR for review.
- [x] Backend supports PDF, DOCX, TXT, MD and CSV with size, page, and text-length validation.
- [x] Local database persists documents and saved chat history.
- [x] Real language/category/answer-mode and daily question graphs.
- [x] Source-linked question answers, optional Groq, optional LaBSE.
- [x] Document search and preview, export history and delete actions.
- [x] Architecture, sequence, ERD, deployment, workflow, and analytics diagrams.
- [ ] Verify every GitHub Actions job green on the final branch and `main`.
- [ ] Set production CORS origins, unique APP_API_KEY, TLS ingress, and firewall before external access.
- [ ] Implement real user accounts / RBAC and migrations before multi-user launch.
- [ ] Provision actual hosting, database backups and domain (requires owner infrastructure).
- [ ] Manually check multilingual quality with supported languages and external AI services.

## Smoke test
Run `docker compose up --build`; open the frontend, upload a small PDF/DOCX/CSV, ask about the document, inspect its cited source, confirm the language chart and daily questions update, export a history JSON, then stop the stack with `docker compose down`.

## Production hardening checkpoint
- [x] Admin-created password accounts with Argon2 hashes and temporary lockouts.
- [x] Revocable bearer sessions, session persistence, password changes and admin resets.
- [x] Owner-scoped document, query, chart, analytics and history access.
- [x] Nginx static frontend reverse proxies to internal API on production Compose.
- [x] PostgreSQL backup/restore scripts and deployment checklist committed.
- [ ] Provision an actual host, HTTPS, DNS, firewall and managed/off-site backups.
- [ ] Verify hosting, restore operation, recovery process and real-world AI behavior.
- [ ] Review rate limiting, MFA/SSO, access logging and dependency vulnerabilities before handling sensitive content.
