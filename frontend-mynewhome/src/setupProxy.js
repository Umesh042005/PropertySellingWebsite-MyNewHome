// Dev-only: forwards /api to the Spring Boot backend (CRA picks this file up automatically).
// Used instead of package.json "proxy", which rewrites the Origin header and trips CORS.
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware("/api", {
      target: process.env.DEV_API_TARGET || "http://localhost:8080",
      changeOrigin: true,
    })
  );
};
