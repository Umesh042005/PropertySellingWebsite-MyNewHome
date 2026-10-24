# MyNewHome

A full-stack property listing website: browse, search and filter apartments, houses, land and commercial spaces, and post your own listings. Similar to OLX, but only for property.

## Features

- **Accounts**: sign up or log in with username/email and password, or with Google. JWT authentication.
- **Listings**: post, edit and delete your own properties with a photo. Only the owner (or an admin) can change a listing.
- **Browse**: category pages, keyword search (title, city, locality, description), price range filter and sorting.
- **Contact**: call or WhatsApp the owner directly from the listing page.
- **AI descriptions**: "Write it with AI" drafts a listing description with Google Gemini.
- **Responsive UI** that works on phones and desktops.

## Tech stack

| Part | Tech |
| --- | --- |
| Backend | Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL |
| Frontend | React 19, React Router 7, Tailwind CSS, Axios |
| Deployment | Docker, docker compose, nginx |

```
PropertyBazaar/
├── backend-mynewhome/backend/   Spring Boot API (port 8080)
├── frontend-mynewhome/          React app (port 3000)
└── docker-compose.yml           MySQL + API + web, in one command
```

---

## Run locally (development)

**Requirements:** Java 17+, Maven, Node 20+, MySQL 8.

### 1. Backend

```bash
cd backend-mynewhome/backend
cp .env.example .env
```

Then edit `.env`:

- Set `DB_PASSWORD`.
- Set `JWT_SECRET` to 32 or more random characters, for example the output of `openssl rand -base64 48`.

`GOOGLE_CLIENT_ID` and `GEMINI_API_KEY` are optional; leave them empty to turn those features off.

```bash
mvn spring-boot:run
```

The `propertydb` database is created automatically. The API runs at http://localhost:8080 (health check: `/api/health`).

### 2. Frontend

```bash
cd frontend-mynewhome
npm install
npm start
```

Open http://localhost:3000. In development, `src/setupProxy.js` forwards `/api` requests to `localhost:8080`.

### Tests

```bash
cd backend-mynewhome/backend
mvn test
```

The tests use an in-memory H2 database, so MySQL isn't needed.

### Upgrading an existing database

If your database was created by an older version of the app, run [`db/migrate-existing.sql`](backend-mynewhome/backend/db/migrate-existing.sql) once. It widens the description column so long descriptions fit.

---

## Deploy

All configuration comes from environment variables. No secrets live in the code.

### Option A: one server with Docker (easiest)

On any VPS (DigitalOcean, AWS Lightsail, an Azure VM, …) with Docker installed:

```bash
cp .env.example .env
```

Edit `.env` and fill in `DB_PASSWORD`, `DB_ROOT_PASSWORD`, `JWT_SECRET` and `PUBLIC_URL`. Then start everything:

```bash
docker compose up -d --build
```

This starts three containers:

- MySQL, with a persistent volume.
- The Spring Boot API.
- nginx, which serves the React build and proxies `/api` to the API.

The site is published on `APP_PORT` (default 3000). Put a TLS-terminating proxy such as Caddy, or Cloudflare, in front for HTTPS.

### Option B: separate hosting (for example Render + Vercel)

1. **Database:** any managed MySQL 8 (Aiven, Railway, PlanetScale-compatible MySQL, …).
2. **Backend:** create a Docker web service from `backend-mynewhome/backend` (Render, Railway, Fly.io…) and set these environment variables:

| Variable | Example |
| --- | --- |
| `DB_URL` | `jdbc:mysql://HOST:3306/propertydb?useSSL=true&serverTimezone=UTC` |
| `DB_USERNAME` / `DB_PASSWORD` | your database credentials |
| `JWT_SECRET` | 32+ random characters |
| `FRONTEND_URL` | `https://your-site.vercel.app` (comma-separate multiple origins) |
| `GOOGLE_CLIENT_ID` | optional |
| `GEMINI_API_KEY` | optional |

   `PORT` is respected automatically.

3. **Frontend:** import `frontend-mynewhome` into Vercel or Netlify (build command `npm run build`, output folder `build`) and set:
   - `REACT_APP_API_URL`: your backend URL, for example `https://mynewhome-api.onrender.com`
   - `REACT_APP_GOOGLE_CLIENT_ID`: optional

   `vercel.json` already sets up client-side routing.

4. **Google sign-in (optional):** in Google Cloud Console, add your site's URL to the OAuth client's *Authorized JavaScript origins*.

### Production checklist

- [ ] Use a new, random `JWT_SECRET`. Never reuse the development one.
- [ ] Create fresh database passwords and a fresh Gemini API key.
- [ ] Serve the site over HTTPS.
- [ ] Set `FRONTEND_URL` / `PUBLIC_URL` to the exact public origin.

## API overview

| Method | Endpoint | Auth |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/google-login` | public |
| GET | `/api/properties?category=&search=` | public |
| GET | `/api/properties/{id}`, `/api/properties/{id}/image` | public |
| GET | `/api/properties/mine` | user |
| POST | `/api/properties` (multipart) | user |
| PUT / DELETE | `/api/properties/{id}` | owner or admin |
| POST | `/api/gemini/description` | user |
| GET | `/api/user/me` | user |
| GET / PUT / DELETE | `/api/user/{id}` | admin |

Errors are always JSON: `{ "error": "message" }`.

## Author

**Umesh Deshmukh**, B.Tech CSE (2022–2026). [GitHub](https://github.com/Umesh042005)
