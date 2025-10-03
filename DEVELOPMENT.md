# Local Development Setup

## Quick Start

### Option 1: Docker Development (Recommended)
```bash
# Build both services
./reload-stack.sh --build-webapp --build-api

# Frontend will be at http://localhost:3000
# Backend API will be at http://localhost:2000
```

The services are configured to use `localhost` URLs for local development:
- Frontend → Backend: `http://localhost:2000`
- Browser → API: `http://localhost:2000` (not `api.example.com`)

### Option 2: Local Node.js Development

**Backend:**
```bash
cd backend-api
npm install
npm run build-prisma-client
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Configuration Notes

### Domain Configuration (`frontend/service.config.ts`)

The config automatically switches between local and production:

```typescript
// Localhost for development
export const API_URL_FOR_BROWSER = process.env.NODE_ENV === 'production' 
  ? `https://api.${BASE_DOMAIN}` 
  : `http://localhost:2000`;

// Docker Swarm internal network for production
export const API_URL_FOR_SERVER = process.env.DOCKER_ENV === 'swarm'
  ? `http://backend-api:2000`
  : `http://localhost:2000`;
```

### Before Production Deployment

**IMPORTANT**: Change `BASE_DOMAIN` in `frontend/service.config.ts`:
```typescript
export const BASE_DOMAIN = 'yourdomain.com'; // Change from example.com!
```

## TikTok Scraping

The backend uses a **two-tier approach**:

1. **Primary**: Direct HTTP fetch with `xbogus` anti-bot parameter
2. **Fallback**: Patchright (undetected Chromium) if primary fails

Patchright bypasses:
- ✅ Cloudflare
- ✅ Kasada  
- ✅ Datadome
- ✅ Akamai Bot Manager
- ✅ Most anti-bot systems

## Troubleshooting

### "ERR_NAME_NOT_RESOLVED" in browser
- Check `service.config.ts` has correct localhost URLs
- Ensure backend is running on port 2000
- Verify frontend can reach `http://localhost:2000`

### Patchright Installation Issues
```bash
cd backend-api
npx patchright install chromium
```

### Volume Mount Errors
Create the data directory:
```bash
sudo mkdir -p /var/local/sticktock-api-data
sudo chown -R $USER:$USER /var/local/sticktock-api-data
```

## Testing

Manual test workflow:
```bash
# 1. Start services
./reload-stack.sh --build-api --build-webapp

# 2. Check services
docker service ls

# 3. Test in browser
# Visit: http://localhost:3000
# Enter a TikTok URL (replace tiktok.com with localhost:3000)

# 4. Check logs
docker service logs sticktock_backend-api -f
```
