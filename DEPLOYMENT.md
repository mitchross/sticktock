# SticktTock - GitHub Actions Build & Talos OS Deployment

## GitHub Actions Workflow

The workflow automatically builds and pushes Docker images to GitHub Container Registry when you:
- Push to `main` branch → `latest` tag
- Create version tags (e.g., `v1.0.0`) → semantic versioning

Images will be available at:
- `ghcr.io/mitchross/sticktock/backend:latest`
- `ghcr.io/mitchross/sticktock/frontend:latest`

## Talos OS Kubernetes Deployment

### Prerequisites
- Default StorageClass configured in your cluster
- Ingress controller (e.g., nginx-ingress) installed

### Deploy to Talos
```bash
kubectl apply -f k8s/deployment.yaml
```

### Verify Deployment
```bash
# Check pods
kubectl get pods -n sticktock

# Check services  
kubectl get services -n sticktock

# View logs
kubectl logs -n sticktock deployment/sticktock-backend -f
kubectl logs -n sticktock deployment/sticktock-frontend -f
```

## Configuration

The Kubernetes manifest includes:
- **Non-root security**: `runAsUser: 1000`, no privilege escalation
- **Resource limits**: Memory and CPU limits for production
- **Persistent storage**: 10GB volume for backend data
- **Ingress routing**: `/api` → backend, `/` → frontend

Update the ingress host in `k8s/deployment.yaml` for your domain:
```yaml
spec:
  rules:
  - host: your-domain.com  # Change this
```

## Architecture
- **Backend**: Node.js API on port 2000
- **Frontend**: Next.js app on port 3000
- **Data**: Persistent volume at `/var/local/sticktock`