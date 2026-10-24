# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Baked into the JS bundle at build time
ARG REACT_APP_API_URL=""
ARG REACT_APP_GOOGLE_CLIENT_ID=""
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
RUN npm run build

# ---------- Runtime stage: nginx serves the SPA and proxies /api to the backend ----------
FROM nginx:1.27-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html

# Where nginx forwards /api requests (docker-compose service name by default)
ENV BACKEND_URL=http://backend:8080
EXPOSE 80
