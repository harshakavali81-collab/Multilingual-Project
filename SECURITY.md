# Security policy

## Reporting
Do not publish API keys, private document contents, database dumps, or sensitive exploit details in an issue. Contact the repository maintainer privately through GitHub to report a potential security problem.

## Current security posture
This is a development/student application and does not include authentication or user isolation. Do not expose it publicly with sensitive documents. Keep GROQ_API_KEY in backend environment configuration, rotate exposed keys, use HTTPS in deployments, restrict CORS, limit uploads, and follow the production checklist in docs/DEPLOYMENT.md before hosting it publicly.

## Optional shared-key private mode
Set APP_API_KEY in the backend environment and send it as the X-API-Key header for all data routes. The React UI takes the key at runtime and saves it in browser session storage (never bundle it into a VITE_ variable). This is one shared key, **not** multi-user authentication, identity-based access controls, encrypted storage, or a production security system. Put HTTPS and network controls in front of the app. Health and API specification remain publicly reachable. Rotate the key if exposed, and restrict CORS_ORIGINS to known sites.

## Authenticated mode (AUTH_REQUIRED=true)
Use the production Compose file and strong ADMIN_EMAIL/ADMIN_PASSWORD to provision a first admin. Passwords use Argon2; bearer session tokens are randomly generated and only SHA-256 token digests are stored in PostgreSQL. Tokens expire in 8 hours and can be revoked by logout or password change. Repeated invalid account logins trigger a temporary lock. Admins can create member/admin users; all document/history/search/analytics queries are owner scoped.

Caveats: The API does not yet implement password recovery email, account disabling, OAuth/SSO, MFA, IP-level brute-force controls, enterprise audit trails, or granular group-sharing permissions. Session tokens are held in browser sessionStorage (defend against XSS, enforce HTTPS and strict content security policy at the ingress). Provider rate limiting and security monitoring remain necessary for public service. Existing local database rows lack owners and are intentionally inaccessible in authenticated mode.

Never use APP_API_KEY as a replacement for real multi-user login.
