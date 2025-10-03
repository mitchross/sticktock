# Playwright Deployment Guide for Talos Kubernetes

## Overview
This document explains the changes needed to run Playwright with stealth plugin in your Talos k8s cluster.

## Critical Changes Made to `backend-deployment.yaml`

### 1. Increased Resource Limits
```yaml
resources:
  requests:
    memory: "1Gi"      # Was 512Mi - Chrome needs minimum 1GB
    cpu: "500m"        # Was 250m - Browser rendering is CPU intensive
  limits:
    memory: "2Gi"      # Was 1Gi - Headroom for complex pages
    cpu: "1000m"       # Was 500m - Prevents throttling during page rendering
```

**Why:** Chrome/Chromium requires significant memory and CPU. With the old limits:
- Pod would OOMKill during browser launch or page rendering
- CPU throttling would cause timeouts
- Multiple concurrent requests would crash the pod

### 2. Added /dev/shm Volume (CRITICAL)
```yaml
volumeMounts:
  - name: dshm
    mountPath: /dev/shm

volumes:
  - name: dshm
    emptyDir:
      medium: Memory
      sizeLimit: 1Gi
```

**Why:** Chrome uses shared memory (`/dev/shm`) for inter-process communication. Without this:
- Chrome will crash with cryptic errors like "Failed to create shared memory"
- Browser tabs can't communicate
- Page rendering will fail silently

Default `/dev/shm` in containers is only 64Mi, which is insufficient.

### 3. Added Playwright Environment Variables
```yaml
env:
  - name: PLAYWRIGHT_BROWSERS_PATH
    value: "/home/node/.cache/ms-playwright"
  - name: NODE_ENV
    value: "production"
```

**Why:** 
- Ensures Playwright finds the browsers installed during image build
- Production mode optimizes Playwright behavior

## Security Considerations for Talos

### Current Security Posture (SAFE)
```yaml
securityContext:
  runAsNonRoot: true              # ✅ Running as node user (UID 1000)
  allowPrivilegeEscalation: false # ✅ No privilege escalation
  readOnlyRootFilesystem: false   # ⚠️  Required for Playwright cache
  capabilities:
    drop:
      - ALL                        # ✅ All capabilities dropped
```

### Why We DON'T Need SYS_ADMIN
Our Playwright implementation uses `--no-sandbox` and `--disable-setuid-sandbox` flags (see `backend-api/utils/puppeteer-fallback.ts`). This means:
- ✅ No Linux capabilities needed
- ✅ Works with Talos strict security
- ✅ No privileged pods required
- ⚠️  Slightly reduced browser isolation (acceptable for scraping use case)

If you wanted full Chrome sandboxing, you would need:
```yaml
securityContext:
  capabilities:
    add:
      - SYS_ADMIN  # Required for Chrome's sandbox
```
But this is NOT recommended in Talos and not needed for our use case.

## Deployment Steps

### 1. Build and Push New Image
```bash
# Build with Playwright
cd backend-api
docker build -t ghcr.io/mitchross/sticktock/backend:latest .

# Push to your registry
docker push ghcr.io/mitchross/sticktock/backend:latest
```

### 2. Update Deployment Image Hash
After pushing, get the new image digest:
```bash
docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/mitchross/sticktock/backend:latest
```

Update the image line in `backend-deployment.yaml` with the new SHA256.

### 3. Apply to Cluster
```bash
# Apply updated deployment
kubectl apply -f k8s/backend-deployment.yaml

# Watch rollout
kubectl rollout status deployment/sticktock-backend -n sticktock

# Check logs
kubectl logs -f deployment/sticktock-backend -n sticktock
```

### 4. Test Playwright Endpoint
```bash
# Port-forward to test
kubectl port-forward -n sticktock svc/sticktock-backend 2000:2000

# Test in another terminal (URL must be encoded)
curl "http://localhost:2000/by_url/https%3A%2F%2Fwww.tiktok.com%2F%40laetitia.circle%2Fvideo%2F7538361488327609613?fallback=puppeteer"
```

## Troubleshooting in Talos

### Pod OOMKilled
**Symptom:** Pod restarts, `kubectl describe pod` shows OOMKilled
**Solution:** Increase memory limits in deployment (already done - now 2Gi)

### Chrome Crashes with Shared Memory Error
**Symptom:** Logs show "Failed to create shared memory" or browser crashes
**Solution:** Verify `/dev/shm` volume is mounted (already added)
```bash
kubectl exec -it -n sticktock deployment/sticktock-backend -- df -h /dev/shm
```
Should show ~1Gi available.

### Browser Times Out
**Symptom:** Requests hang or timeout after 30s
**Solution:** 
1. Check CPU throttling: `kubectl top pod -n sticktock`
2. Increase CPU limits if consistently throttled
3. Check network egress from cluster to TikTok

### Playwright Browsers Not Found
**Symptom:** Error: "Executable doesn't exist at /home/node/.cache/ms-playwright..."
**Solution:** Rebuild image ensuring `npx playwright install --with-deps` runs during build

### Talos-Specific: SELinux/AppArmor Denials
Talos uses strict security. If you see denials:
```bash
# Check pod events
kubectl describe pod -n sticktock -l app=sticktock-backend

# Check Talos node logs
talosctl dmesg | grep -i denied
```

Most issues are resolved by the `/dev/shm` mount and `--no-sandbox` flags.

## Performance Considerations

### Cold Start
First request after pod start will be slow (~10-30s):
- Playwright initializes browser
- Chrome launches and warms up
- Stealth plugins inject

Subsequent requests reuse the browser instance (~3-5s).

### Concurrent Requests
Current setup uses a singleton browser instance. For high concurrency:
1. Increase replicas in deployment
2. Or implement request queuing in code
3. Consider dedicated browser pool pods

### Resource Monitoring
```bash
# Watch resource usage
kubectl top pod -n sticktock -l app=sticktock-backend

# Typical usage per request:
# - CPU: 200-500m during page render
# - Memory: 800Mi-1.5Gi peak
```

## Recommended: Add Readiness/Liveness Probes

Add to `backend-deployment.yaml`:
```yaml
livenessProbe:
  httpGet:
    path: /
    port: 2000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /
    port: 2000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2
```

This ensures k8s knows when the pod is ready and healthy.

## Summary Checklist

- [x] Increased memory limits to 2Gi
- [x] Increased CPU limits to 1000m
- [x] Added /dev/shm volume mount (1Gi)
- [x] Added Playwright environment variables
- [x] Maintained non-root security context
- [x] Using --no-sandbox (no SYS_ADMIN needed)
- [ ] Build and push new image
- [ ] Update image SHA in deployment
- [ ] Apply to cluster
- [ ] Test Playwright functionality
- [ ] Monitor resource usage
- [ ] (Optional) Add health probes

## Questions or Issues?

If you encounter problems:
1. Check pod logs: `kubectl logs -f -n sticktock deployment/sticktock-backend`
2. Check events: `kubectl describe pod -n sticktock -l app=sticktock-backend`
3. Exec into pod: `kubectl exec -it -n sticktock deployment/sticktock-backend -- sh`
4. Test browser: `npx playwright --version` inside pod
