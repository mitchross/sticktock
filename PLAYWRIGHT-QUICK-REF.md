# Playwright Migration - Quick Reference

## ✅ What Changed

| Component | Old | New |
|-----------|-----|-----|
| **Backend Dependency** | `puppeteer` | `playwright` + `playwright-extra` + stealth plugin |
| **Query Parameter** | `?fallback=puppeteer` | `?fallback=playwright` |
| **Variable Name** | `usePuppeteer` | `usePlaywright` |
| **Frontend Checkbox** | "Use Puppeteer fallback" | "Use browser rendering (Playwright)" |
| **Memory Limit (k8s)** | 1Gi | 2Gi |
| **CPU Limit (k8s)** | 500m | 1000m |
| **/dev/shm** | Not mounted | 1Gi emptyDir |

## 🚀 Quick Deploy

```bash
# 1. Build images
cd backend-api && docker build -t ghcr.io/mitchross/sticktock/backend:latest . && docker push $_
cd ../frontend && docker build -t ghcr.io/mitchross/sticktock/frontend:latest . && docker push $_

# 2. Get digests and update k8s manifests
docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/mitchross/sticktock/backend:latest
docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/mitchross/sticktock/frontend:latest
# Update image@sha256:... in k8s/*.yaml files

# 3. Deploy
kubectl apply -f k8s/

# 4. Test
./k8s/test-playwright.sh
```

## 🧪 Test Commands

```bash
# Test backend (URL must be encoded)
TIKTOK_URL="https://www.tiktok.com/@laetitia.circle/video/7538361488327609613"
ENCODED=$(echo "$TIKTOK_URL" | jq -sRr @uri)
curl "http://localhost:2000/by_url/${ENCODED}?fallback=playwright" | jq '.'

# Test in k8s
kubectl port-forward -n sticktock svc/sticktock-backend 2000:2000
# Then run curl command above
```

## 📋 Files to Commit

```bash
# Backend
backend-api/package.json
backend-api/package-lock.json
backend-api/tsconfig.json
backend-api/utils/puppeteer-fallback.ts
backend-api/utils/tiktok-api-wrappers.ts
backend-api/routes/by-url.ts
backend-api/routes/related.ts

# Frontend
frontend/src/components/HomePage/index.tsx

# Kubernetes
k8s/backend-deployment.yaml
k8s/PLAYWRIGHT-DEPLOYMENT.md
k8s/test-playwright.sh

# Documentation
.github/copilot-instructions.md
PLAYWRIGHT-MIGRATION-SUMMARY.md
PLAYWRIGHT-QUICK-REF.md (this file)
```

## ⚠️ Breaking Changes

1. **Query parameter changed**: `?fallback=puppeteer` → `?fallback=playwright`
   - Old parameter will NOT work after deployment
   - Frontend updated automatically

2. **Resource requirements increased**:
   - New minimum memory: 1Gi (was 512Mi)
   - New memory limit: 2Gi (was 1Gi)
   - Ensure your cluster has capacity

3. **/dev/shm required**:
   - Chrome WILL CRASH without this
   - Automatically added to k8s deployment

## ✅ Verification Checklist

After deployment:
- [ ] Backend pod running without OOMKill
- [ ] `kubectl exec ... npx playwright --version` works
- [ ] `/dev/shm` shows ~1Gi available
- [ ] API returns video data with `?fallback=playwright`
- [ ] Frontend checkbox toggles Playwright mode
- [ ] No "Chrome crashed" errors in logs

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| OOMKilled | Increase memory limit in deployment.yaml |
| Chrome crashes | Verify /dev/shm is mounted (1Gi) |
| "Executable not found" | Rebuild image with playwright install step |
| Timeout | Check CPU throttling, increase CPU limit |

## 📞 Need Help?

1. Read: `PLAYWRIGHT-MIGRATION-SUMMARY.md` (full details)
2. Read: `k8s/PLAYWRIGHT-DEPLOYMENT.md` (k8s-specific)
3. Run: `./k8s/test-playwright.sh` (automated test)
4. Check: `kubectl logs -f -n sticktock deployment/sticktock-backend`
