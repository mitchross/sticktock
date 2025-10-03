# StickTock AI Coding Guide

## Architecture Overview

StickTock is a privacy-focused TikTok proxy with a **Docker Swarm** deployment architecture:

- **Backend API** (Express/TypeScript on port 2000): Fetches TikTok videos via web scraping, stores metadata in SQLite (Prisma ORM), and manages local video files
- **Frontend** (Next.js 14 on port 3000): Server-side rendered pages with client components for video playback
- **Data Flow**: Frontend SSR → Backend API → TikTok scraping → Local file storage (`/var/local/sticktock/`)

Key architectural decisions:
- **No client-side TikTok calls**: All TikTok scraping happens server-side to protect user privacy
- **Soft-delete caching**: Videos are cached and soft-deleted when storage exceeds 25GB (see `checkAndCleanPublicFolder`)
- **URL rewriting**: Users replace `tiktok.com` with `sticktock.com` in URLs for instant proxying

## Critical Configuration

### 1. Domain Configuration (Required Before Deployment)
Edit `frontend/service.config.ts` with your actual domains:
```typescript
export const BASE_DOMAIN = 'example.com'; // Change this!
export const API_URL_FOR_BROWSER = `https://api.${BASE_DOMAIN}`;
export const API_URL_FOR_SERVER = `http://backend-api:2000`; // Docker internal
```
**Wrong domains = broken API calls and hard-to-debug CORS issues.**

### 2. Database Setup
Backend uses SQLite with Prisma. Database location is set via environment variable:
- **Production**: `DATABASE_URL="file:/var/local/sticktock/prisma-db.sqlite"` (mounted volume)
- **Development**: `DATABASE_URL="file:./prisma-db.sqlite"` (local)

Volume mount in `docker-swarm-stack.yml` must exist or deployment silently fails.

## Development Workflows

### Building & Deploying
```bash
# Full rebuild with both services
./reload-stack.sh --build-webapp --build-api

# Single service rebuild
./reload-stack.sh --build-api

# Stop stack
docker stack rm sticktock

# Check service status (if deployment seems stuck)
docker service ls
```

Images are tagged with timestamps (`2025-01-15_14-30`) and aliased as `latest`. The script auto-rebuilds with `--no-cache`.

### Local Development (Without Docker)
Backend:
```bash
cd backend-api
npm run dev  # tsx watch mode with nodemon
```

Frontend:
```bash
cd frontend
npm run dev  # Next.js dev server
```

**Note**: Prisma client must be generated before running: `npm run build-prisma-client`

## Project-Specific Patterns

### 1. TikTok Scraping Flow (`backend-api/utils/tiktok-api-wrappers.ts`)
```typescript
fetchPostByUrlAndMode(url, URL_SANS_BOGUS.FETCH_POST) →
  fetchAndFollowURL() →          // Follows redirects, validates whitelist
  parseTikTokData() →            // Extracts deviceId/odinId from DOM
  xbogus(URL, userAgent) →       // Generates X-Bogus parameter (anti-bot)
  pullVideoData() →              // Parses JSON, downloads files
  createPost() + createVideo()   // Saves to database
```

**Patchright Fallback**: If standard fetch fails (anti-bot detection), automatically falls back to Patchright (undetected Chromium) for stealth scraping. Patchright bypasses Cloudflare, Kasada, Datadome, and other anti-bot systems.

**Domain whitelist** (`BASE_DOMAINS_WHITELIST`) prevents SSRF attacks. Never remove this validation.

### 2. File Management Conventions
- Videos: `/public/videos/{tiktokId}.mp4`
- Thumbnails: `/public/thumbnails/{tiktokId}.jpg`
- Carousels: `/public/images/{tiktokId}/{index}.jpg`
- Authors: `/public/authors/{authorId}.jpg`

Storage cleanup runs after each request via `checkAndCleanPublicFolder()`. When >25GB, oldest non-deleted posts are purged (soft-delete in DB, hard-delete files).

### 3. Database Schema Patterns
```prisma
Post → Author (many-to-one)
Post → Video | Carousel (one-to-one, nullable)
Session.watched: comma-separated TikTok IDs
```

**Deleted field**: Posts are soft-deleted (`deleted: true`) but can be restored if re-requested (see `restorePost()`). This allows re-fetching videos on-demand.

### 4. Next.js SSR Strategy
All post pages (`/post/[id]`) use **Server Components** that:
1. Fetch post data via internal API route (`/api/post/[id]`)
2. Generate OpenGraph metadata with video URLs for social sharing
3. Pass session tokens via cookies for "watched videos" tracking

Frontend calls backend using `API_URL_FOR_SERVER` (Docker internal network) during SSR, and `API_URL_FOR_BROWSER` for client-side metadata.

### 5. Video Player Custom Controls (`frontend/src/components/VideoPlayer`)
- **Tap sides to 2x speed**: Touch/hold left or right 2/3 of video
- **Swipe to scrub**: Horizontal swipe adjusts `currentTime` (sensitivity: 0.025)
- **IntersectionObserver auto-play**: Videos auto-play when 50% visible in feed

## Common Pitfalls

1. **Missing volume mount**: Backend crashes if `/var/local/sticktock/` doesn't exist. Check `docker service ps sticktock_backend-api` for errors.

2. **Prisma client out of sync**: After schema changes, run:
   ```bash
   npx prisma migrate dev     # Creates migration
   npm run build-prisma-client # Regenerates client
   ```

3. **xbogus library failures**: TikTok's anti-bot system requires the `xbogus` npm package. If scraping breaks, the system automatically falls back to Patchright (undetected Chromium browser automation).

4. **CORS issues**: Ensure `cors({ origin: '*' })` in `backend-api/index.ts` allows frontend domain. Check `service.config.ts` URLs match actual deployment.

5. **Session token format**: `frontend/src/app/post/[id]/page.tsx` parses cookies manually. Cookie name must be `sessiontoken` (lowercase).

## Testing Changes

No automated test suite exists. Manual testing workflow:
1. Build: `./reload-stack.sh --build-api --build-webapp`
2. Check deployment: `docker service ls` (ensure 1/1 replicas)
3. Test URL conversion: `https://www.sticktock.com/post/7123456789` should load video
4. Verify storage cleanup: Check logs with `docker service logs sticktock_backend-api`

## License & Attribution

AGPLv3 licensed. Derived from [offtiktok](https://github.com/MarsHeer/offtiktok) (MIT). All contributions must maintain AGPL compatibility.
