# Zero-cost public demo deployment (Render)

This project is prepared for a Render Free web service using the native Python runtime.

## Deploy configuration
The root `render.yaml` defines Python runtime from `backend/`, dependency installation, Uvicorn, `/api/health` health check and Singapore region.

## Free-tier limitation
Render Free web services have an ephemeral filesystem. Local SQLite feedback can be lost whenever the service restarts, redeploys, or spins down. This is acceptable only for a disposable prototype; do not use it as durable customer data storage.

## Deployment sequence
1. Publish this source in a Git repository.
2. In Render, create a Blueprint from that repository and select the Free service.
3. Wait for the build/deploy to finish.
4. Test `https://YOUR-SERVICE.onrender.com/api/health`.
5. Set `API_BASE_URL` in `mobile/src/config.ts` to that HTTPS base URL.
6. Build the Android APK through Expo EAS after the EAS project is linked.

No service has been created from this template yet. Creating it requires a hosting account and repository authorization.
