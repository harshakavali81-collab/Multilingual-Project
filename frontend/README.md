# LinguaBase frontend

React 19 + Vite 8 responsive interface. Requires Node 22+.

```bash
npm install
npm run dev
npm run lint
npm run build
```

Open http://localhost:5173. The `/api` proxy forwards to FastAPI on http://127.0.0.1:8000 by default. Set `API_PROXY_TARGET=http://backend:8000` for Docker, as configured in `frontend/Dockerfile`.
