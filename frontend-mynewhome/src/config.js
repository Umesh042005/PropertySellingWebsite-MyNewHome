// Values are injected at build time from .env files / hosting env vars (see .env.example).
// Empty API_URL means "same origin": the CRA dev proxy (src/setupProxy.js) or the nginx
// reverse proxy in production forwards /api to the backend.
export const API_URL = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
