# Backand fo the RSS feeds client

This repository is a NestJS backend for an RSS feeds client. 

## Prerequisites
- Node.js 18+ (recommended: LTS)
- npm 9+
- MongoDB instance (unless you use Docker compose or a remote DB)

## Quick start

1. Install dependencies:
   
   ```bash
   npm install
   ```

2. Configure environment variables (see .env section below). If you don't provide any, sensible defaults are used.

3. Start the server in watch mode:
   
   ```bash
   npm run start:dev
   ```

4. The API will listen on PORT (default 3600). Health check endpoint:
   
   - GET http://localhost:3600/health

## Environment variables (.env)
The application reads the following environment variables (all optional, defaults shown):

- AUTH_SECRET: session secret string (default: "secret")
- COOKIE_NAME: session cookie name (default: "connect.sid")
- PORT: server port (default: "3600")
- WEB_CLIENT: allowed CORS origin for the frontend (default: "http://localhost:4200")
- DB_HOST: MongoDB connection URI (default: "mongodb://rss-db/rss")
- CORS_ENABLED: optional additional origin to allow (string). If set, will be added to CORS origins.
- ORPHANED_USER: number of months of inactivity after which users are considered orphaned and may be removed (default: 2)

You can create a .env file in the project root with any of the variables above.

## Deployment

Using docker compose: [repository](https://github.com/emp74ark/rss-deploy)

## Authentication & sessions
- The API uses cookie-based sessions (express-session). After successful auth, a session cookie (name from COOKIE_NAME, default: connect.sid) is set and used for subsequent requests.
- Login/signup endpoints return the user object.

## API endpoints overview
- Health
  - GET /health — service status and version.

- Auth
  - POST /auth/login — body: { login, password } → returns user (no password). Sets session.
  - POST /auth/signup — body: { password } → creates a user with automatically generated login. Sets session.
  - GET /auth/logout — clears the session cookie.

- User
  - POST /user — Admin only. Create user. body: { login, password, role }
  - GET /user — Admin only. Paginated list. Query: pageNumber, perPage
  - GET /user/self — current user info
  - GET /user/:id — get user by id
  - PATCH /user/:id — update fields { login?, password?, role? }
  - DELETE /user/orphaned — Admin only. Delete users inactive for `ORPHANED_USER` months and their related data
  - DELETE /user/:id — delete user by id (204 No Content)

- Feed (requires session)
  - POST /feed — create a feed
  - GET /feed — list feeds for
  - GET /feed/refresh — refresh all feeds
  - GET /feed/:id — get one feed
  - PATCH /feed/:id — update feed
  - DELETE /feed/:id — remove feed
  - GET /feed/:id/refresh — refresh one feed

- Article (requires session)
  - POST /article — create article
  - GET /article — list articles
    - Query filters: read=true|false, tags=[t1,t2], feed=feedId, dateSort=asc|desc
  - GET /article/:id — get one article
  - GET /article/:id/full — fetch full-text content for article
  - PATCH /article/:id — update single article
  - PATCH /article?all=true — bulk update all articles that match criteria
  - DELETE /article/:id — remove article

- Tag (requires session)
  - POST /tag — create tag
  - GET /tag — list tags. Query: default=true to get default tags
  - GET /tag/:name — get one tag by name
  - PATCH /tag/:name — update tag
  - DELETE /tag/:name — delete tag
