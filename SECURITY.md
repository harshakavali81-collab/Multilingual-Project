# Security policy

## Reporting
Do not publish API keys, private document contents, database dumps, or sensitive exploit details in an issue. Contact the repository maintainer privately through GitHub to report a potential security problem.

## Current security posture
This is a development/student application and does not include authentication or user isolation. Do not expose it publicly with sensitive documents. Keep GROQ_API_KEY in backend environment configuration, rotate exposed keys, use HTTPS in deployments, restrict CORS, limit uploads, and follow the production checklist in docs/DEPLOYMENT.md before hosting it publicly.
