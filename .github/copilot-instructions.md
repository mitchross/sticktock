## StickTock — Developer guidance for AI coding agents

This file captures the minimal, actionable knowledge an AI coding agent needs to be productive in the StickTock repo.

Keep things focused: reference exact files, commands, and conventions rather than generic advice.

1. Big picture
- Two primary services live in this repo:
  - `frontend/` — Next.js app (port 3000). Key files: `frontend/service.config.ts`, `frontend/package.json`, `frontend/Dockerfile`, `src/app/*`.
  - `backend-api/` — Express + Prisma API (port 2000). Key files: `backend-api/index.ts`, `backend-api/routes/*`, `backend-api/utils/*`, `backend-api/prisma/schema.prisma`.

2. Important data flow and integrations
- The frontend uses `service.config.ts` to configure API and domain URLs. When changing routes or ports update that file.
- The backend stores static assets and the SQLite DB under `/var/local/sticktock` at runtime. That path is created and linked in `backend-api/utils/setup-funcs.ts` and must be present in Docker/stack deployments (see `docker-swarm-stack.yml` volume mapping).
- TikTok data is fetched and parsed in `backend-api/utils/tiktok-api-wrappers.ts`. The code:
  - follows redirects using `fetchAndFollowURL`
  - extracts TikTok rehydration data from the page DOM (see `parseTikTokData`)
  - constructs TikTok API URLs and computes an `X-Bogus` parameter with the `xbogus` package
  - stores media files in `public/{videos,thumbnails,audio,images,authors}` and creates DB rows via `backend-api/utils/db-helpers.ts` (Prisma client).

3. Build / dev / deploy commands (exact)
- Local frontend dev: from `frontend/`: `npm run dev` (Next.js dev server on 3000).
- Local backend dev: in `backend-api/` the repo uses `tsx --watch` for development; but container builds run `npm run build` which does `npx prisma generate`, `npx prisma migrate deploy`, then `tsc`. See `backend-api/package.json` scripts.
- Build both images & redeploy stack (recommended): run project root `./reload-stack.sh --build-webapp --build-api` (requires Docker in swarm mode). The helper `rebuild-frontend.sh` builds only the frontend image for k8s/workflow testing.
- Compose stack file: `docker-swarm-stack.yml` exposes ports 3000 and 2000 and maps `/var/local/sticktock-api-data` to `/var/local/sticktock/` in the backend container — ensure the host volume exists and is writable.

4. Project conventions and patterns to follow
- Static assets are served from the `public` folder and the backend creates a symlink from `/var/local/sticktock/public` -> `public` at runtime. Avoid hardcoding absolute paths except via `setupVarDataFolder()`.
- Database: Prisma + SQLite. Migrations live in `backend-api/prisma/migrations`. The runtime SQLite file is expected in `/var/local/sticktock/prisma-db.sqlite*` (setup code will copy the packaged DB file into the data folder if absent).
- Error handling style: routes return simple JSON errors and log with `logger` from `backend-api/utils/logger.ts`. Follow the same minimal pattern when adding routes.

5. Common tasks and where to edit
- Add/modify API endpoints: `backend-api/routes/*` and wire them in `backend-api/index.ts`.
- Add data model fields: update `backend-api/prisma/schema.prisma`, create a migration, and ensure `npm run build-prisma-client` / `npm run make-prisma-db` are run during build.
- Work involving TikTok fetching should be limited to `backend-api/utils/tiktok-api-wrappers.ts` or `backend-api/legacy/*` helpers. Be cautious — TikTok scraping code contains fragile DOM parsing and xbogus computations.

6. Security & operational notes (discoverable from code)
- The backend CORS policy allows origin '*' and only GET methods; production deployments should lock this down in `backend-api/index.ts` if needed.
- The app relies on `ffmpeg` for thumbnail extraction via `fluent-ffmpeg` and uses `ffmpeg-static` so it runs without external packages inside the image.

7. Examples snippets (copyable guidance for agents)
- To fetch a post and store assets: call logic inside `fetchPostByUrlAndMode(url, URL_SANS_BOGUS.FETCH_POST)` — this function returns the Prisma `post` record or an Error; it also downloads assets to `public/` and creates DB rows.
- To serve a new route that returns the latest post: add a handler in `backend-api/routes/` and mount it in `backend-api/index.ts` alongside `/latest`.

8. Files worth reading before making changes
- `backend-api/utils/tiktok-api-wrappers.ts` — TikTok parsing and download logic (fragile, high-risk changes)
- `backend-api/utils/db-helpers.ts` — Prisma usage patterns and helper functions
- `backend-api/utils/setup-funcs.ts` — how the runtime data folder and symlinks are created
- `frontend/service.config.ts` — environment variables and API URL configuration for the frontend
- `docker-swarm-stack.yml`, `reload-stack.sh`, `rebuild-frontend.sh` — deployment helpers

If anything above is unclear or you want the agent to follow stricter rules (style, test coverage, commit message format), tell me and I will iterate. 
