# Production deployment — private, single-host Docker stack

This is a **deployment recipe**, not evidence of an existing live deployment. Use a VPS or container host with Docker and Docker Compose. You must arrange the hosting, domain, TLS certificate, and durable off-site backups with your chosen provider. The application is suitable for a controlled demonstration; review security and operations before high-stakes/sensitive use.

## 1. Prepare the host
- Create a Linux host with Docker Engine and Compose Plugin installed.
- Clone the repository and ensure no private data/secrets are in Git.
- Provision a domain and a TLS-terminating reverse proxy/load balancer (Caddy, Traefik, Nginx, or provider-managed HTTPS).
- Install a host firewall. Expose **only HTTPS 443 and HTTP 80** at the proxy; never directly expose port 5432 or 8000.
- Ensure outbound access to package registries on first build.

## 2. Configure secrets
```sh
cp .env.production.example .env
chmod 600 .env
```
Set DB_PASSWORD (long, alphanumeric), ADMIN_EMAIL and ADMIN_PASSWORD (12+ random characters, preferably 20+). Do not paste real credentials in ChatGPT/GitHub. The initial administrator is created when the database has no users. Subsequent edits to ADMIN_PASSWORD do **not** rotate an existing user password: use the app's Change Password form.

## 3. Build and run
```sh
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```
The UI listens only on **127.0.0.1:8080** by default. Configure your HTTPS proxy to route your public domain to that endpoint. For a container platform requiring an externally bound port, set WEB_BIND=0.0.0.0 only with provider firewall and TLS ingress configured.

## 4. Verify authentication and privacy
Open the HTTPS URL, log in as ADMIN_EMAIL, create a member using the account panel, and log in as the member in a different browser profile. Each person can only access their own documents, search, history and analytics. Legacy pre-auth documents keep NULL ownership and are **not** assigned to newly created accounts. If you need legacy content, migrate it intentionally after a reviewed backup; do not automatically publish it to all users.

## 5. AI integration
GROQ_API_KEY is optional. Without it, the app returns source-based extractive answers; it does **not** automatically translate English to Telugu/Hindi/Tamil/Kannada. Semantic cross-language retrieval requires installing the optional requirements-ml.txt plus sufficient RAM/disk for LaBSE. The default production image uses the hashing fallback to remain lightweight. Never advertise hashing as equivalent to LaBSE.

## 6. Database backups
Run `sh scripts/backup-postgres.sh` and secure the resulting backup. Set up a host cron job or managed backup schedule yourself; this project does not activate a remote backup subscription. Encrypt and ship backups off host; test a restore on a disposable instance. Restore is **destructive**; see `scripts/restore-postgres.sh` and require RESTORE_CONFIRM=YES.

## 7. Operations
Use `docker compose -f docker-compose.prod.yml logs --tail=100 backend` for debugging. Check GET /api/health through the proxy. Alert on HTTP 5xx, failed backups, database free space and certificate expiration. Apply dependency security updates routinely. Apply database migrations during maintenance windows only after backups. Do not run the dev Vite server as your production web frontend.

## 8. Remaining owner tasks
Live hosting, actual domain DNS, HTTPS, on-host provisioning, email/SMS recovery, audit logging, managed backups, secret rotation and compliance review require infrastructure/credentials or future integration work. The password-based login is not a complete identity provider or enterprise SSO.
