# Playwright Migration - Complete Summary

## ✅ All Changes Complete

This document summarizes the complete migration from Puppeteer to Playwright with stealth capabilities.

---

## 🎯 What Was Accomplished

### 1. Backend Changes

#### Replaced Puppeteer with Playwright
- ✅ **Removed** `puppeteer` dependency
- ✅ **Added** `playwright`, `playwright-extra`, and `puppeteer-extra-plugin-stealth`
- ✅ **Updated** `backend-api/utils/puppeteer-fallback.ts` to use Playwright with stealth plugin
- ✅ **Excluded** legacy Puppeteer files from TypeScript compilation (`tsconfig.json`)

#### Renamed Variables for Consistency
- ✅ Changed `usePuppeteer` → `usePlaywright` in all backend routes
- ✅ Changed query parameter from `?fallback=puppeteer` → `?fallback=playwright`
- ✅ Updated type definitions in `tiktok-api-wrappers.ts`
- ✅ Updated routes: `by-url.ts`, `related.ts`

#### Updated Documentation
- ✅ Updated `.github/copilot-instructions.md` to reflect Playwright usage
- ✅ Updated error messages to say "Playwright" instead of "Puppeteer"

### 2. Frontend Changes

#### Updated HomePage Component
- ✅ Renamed `usePuppeteer` → `usePlaywright` state variable
- ✅ Changed checkbox ID from `use-puppeteer` → `use-playwright`
- ✅ Updated query parameter to `?fallback=playwright`
- ✅ Fixed dependency array to include `usePlaywright`
- ✅ Updated label text: "Use browser rendering (Playwright) for better compatibility"

### 3. Kubernetes Configuration

#### Updated Deployment for Talos
- ✅ **Increased memory**: 512Mi → 2Gi (Chrome requires this)
- ✅ **Increased CPU**: 250m → 1000m (browser rendering is intensive)
- ✅ **Added /dev/shm volume**: 1Gi shared memory mount (CRITICAL for Chrome)
- ✅ **Added environment variables**: `PLAYWRIGHT_BROWSERS_PATH`, `NODE_ENV`
- ✅ **Maintained security**: Non-root, no privileged escalation (Talos-safe)

#### Created Documentation & Tools
- ✅ Created `k8s/PLAYWRIGHT-DEPLOYMENT.md` - Complete deployment guide
- ✅ Created `k8s/test-playwright.sh` - Automated test script
- ✅ Updated test script to use `?fallback=playwright`

---

## 📋 API Changes

### Old API (Puppeteer)
```bash
curl "http://localhost:2000/by_url/<URL>?fallback=puppeteer"
```

### New API (Playwright) ✅
```bash
curl "http://localhost:2000/by_url/<URL>?fallback=playwright"
```

**Note:** The old `puppeteer` parameter will no longer work after deployment.

---

## 🚀 Deployment Checklist

### Local Testing ✅
- [x] Backend builds successfully
- [x] Playwright stealth plugin installed
- [x] Docker image builds with Playwright browsers
- [x] Local container test successful
- [x] API responds to `?fallback=playwright`

### Kubernetes Deployment (Next Steps)
- [ ] Build and push new backend image
  ```bash
  cd backend-api
  docker build -t ghcr.io/mitchross/sticktock/backend:latest .
  docker push ghcr.io/mitchross/sticktock/backend:latest
  ```

- [ ] Build and push new frontend image
  ```bash
  cd frontend
  docker build -t ghcr.io/mitchross/sticktock/frontend:latest .
  docker push ghcr.io/mitchross/sticktock/frontend:latest
  ```

- [ ] Update image digests in `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml`
  ```bash
  docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/mitchross/sticktock/backend:latest
  docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/mitchross/sticktock/frontend:latest
  ```

- [ ] Apply updated manifests
  ```bash
  kubectl apply -f k8s/backend-deployment.yaml
  kubectl apply -f k8s/frontend-deployment.yaml
  ```

- [ ] Monitor rollout
  ```bash
  kubectl rollout status deployment/sticktock-backend -n sticktock
  kubectl rollout status deployment/sticktock-frontend -n sticktock
  ```

- [ ] Run automated tests
  ```bash
  ./k8s/test-playwright.sh
  ```

---

## 🔍 How to Test

### Test Backend Directly
```bash
# Encode your TikTok URL
TIKTOK_URL="https://www.tiktok.com/@laetitia.circle/video/7538361488327609613"
ENCODED_URL=$(echo "$TIKTOK_URL" | jq -sRr @uri)

# Test with Playwright
curl -s "http://localhost:2000/by_url/${ENCODED_URL}?fallback=playwright" | jq '.'
```

### Test Frontend
1. Open StickTock homepage
2. Check the "Use browser rendering (Playwright)" checkbox
3. Paste a TikTok URL
4. Submit - the frontend will add `?fallback=playwright` to the API request

### Test in Kubernetes
```bash
# Run automated test
./k8s/test-playwright.sh

# Or manually
kubectl port-forward -n sticktock svc/sticktock-backend 2000:2000
curl "http://localhost:2000/by_url/<ENCODED_URL>?fallback=playwright"
```

---

## 🛡️ Security & Performance

### Security (Talos-Safe)
- ✅ Runs as non-root user (UID 1000)
- ✅ No privileged escalation
- ✅ No SYS_ADMIN capability needed (using `--no-sandbox`)
- ✅ All capabilities dropped
- ✅ Read-only root filesystem disabled (Playwright needs cache)

### Performance Expectations
| Metric | Value |
|--------|-------|
| Cold start (first request) | ~10-30s |
| Warm request (cached browser) | ~3-5s |
| Memory usage (idle) | ~500Mi |
| Memory usage (rendering) | ~800Mi-1.5Gi |
| CPU usage (rendering) | 200-500m |

### Resource Limits (Updated for Playwright)
```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

---

## 📊 Database Schema

**Note:** The database column is still named `usedPuppeteer` for backwards compatibility. It now tracks Playwright usage (when `usePlaywright=true`).

```sql
-- Column already exists from migration
ALTER TABLE "Post" ADD COLUMN "usedPuppeteer" BOOLEAN NOT NULL DEFAULT 0;
```

To query posts fetched with Playwright:
```sql
SELECT * FROM Post WHERE usedPuppeteer = 1;
```

---

## 🧪 Verification Steps

After deployment, verify:

1. **Playwright is installed**
   ```bash
   kubectl exec -n sticktock deployment/sticktock-backend -- npx playwright --version
   ```

2. **/dev/shm is mounted**
   ```bash
   kubectl exec -n sticktock deployment/sticktock-backend -- df -h /dev/shm
   # Should show ~1Gi
   ```

3. **Backend responds**
   ```bash
   kubectl port-forward -n sticktock svc/sticktock-backend 2000:2000
   curl http://localhost:2000/
   # Should return: "Welcome to the StickTock API!"
   ```

4. **Playwright fetching works**
   ```bash
   curl "http://localhost:2000/by_url/<ENCODED_URL>?fallback=playwright"
   # Should return post JSON with .id, .tiktokId, .author, etc.
   ```

5. **Frontend checkbox works**
   - Open homepage
   - Check "Use browser rendering" box
   - Paste TikTok URL and submit
   - Should successfully load video page

---

## 🐛 Troubleshooting

### Pod OOMKilled
**Solution:** Memory limits increased to 2Gi. If still happening, increase further.

### Chrome crashes with "Failed to create shared memory"
**Solution:** `/dev/shm` volume added (1Gi). Verify it's mounted correctly.

### "Executable doesn't exist" error
**Solution:** Rebuild image with `npx playwright install --with-deps` step.

### Browser times out
**Solution:** Check CPU throttling: `kubectl top pod -n sticktock`

### Frontend still says "puppeteer"
**Solution:** Rebuild and redeploy frontend image.

---

## 📝 Files Modified

### Backend
- `backend-api/package.json` - Added Playwright deps, removed Puppeteer
- `backend-api/tsconfig.json` - Excluded legacy files
- `backend-api/Dockerfile` - Added Playwright install step
- `backend-api/utils/puppeteer-fallback.ts` - Replaced with Playwright implementation
- `backend-api/utils/tiktok-api-wrappers.ts` - Renamed usePuppeteer → usePlaywright
- `backend-api/routes/by-url.ts` - Updated to use usePlaywright
- `backend-api/routes/related.ts` - Updated to use usePlaywright

### Frontend
- `frontend/src/components/HomePage/index.tsx` - Renamed usePuppeteer → usePlaywright

### Kubernetes
- `k8s/backend-deployment.yaml` - Increased resources, added /dev/shm, env vars
- `k8s/PLAYWRIGHT-DEPLOYMENT.md` - New deployment documentation
- `k8s/test-playwright.sh` - Automated test script

### Documentation
- `.github/copilot-instructions.md` - Updated to reflect Playwright

---

## 🎉 Benefits of This Migration

1. **Better Detection Evasion**: Playwright-extra with stealth plugin handles 20+ anti-bot techniques automatically
2. **Maintained & Updated**: Active community keeps stealth methods current
3. **Production Ready**: Battle-tested by thousands of scraping projects
4. **Kubernetes Compatible**: Works securely in Talos with proper resource allocation
5. **Consistent Naming**: All variables and parameters now use "playwright" naming
6. **Better User Experience**: Frontend clearly indicates browser rendering option

---

## 📞 Support

If you encounter issues:
1. Check pod logs: `kubectl logs -f -n sticktock deployment/sticktock-backend`
2. Check events: `kubectl describe pod -n sticktock -l app=sticktock-backend`
3. Run test script: `./k8s/test-playwright.sh`
4. Check this summary document

---

**Migration Status:** ✅ COMPLETE  
**Last Updated:** September 30, 2025  
**Ready for Production:** Yes (after k8s deployment)
