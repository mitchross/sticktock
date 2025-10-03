#!/bin/bash

echo "Rebuilding SticktTock frontend for Talos OS with Kubernetes..."

# Navigate to the project root
cd "$(dirname "$0")"

echo "Building frontend Docker image..."
docker build -t sticktock-webapp ./frontend

echo ""
echo "Image built successfully!"
echo ""
echo "Next steps for Kubernetes deployment:"
echo "1. Tag the image for your registry:"
echo "   docker tag sticktock-webapp your-registry/sticktock-webapp:latest"
echo ""
echo "2. Push to your registry:"
echo "   docker push your-registry/sticktock-webapp:latest"
echo ""
echo "3. Update the image reference in k8s/frontend-deployment.yaml if needed"
echo ""
echo "4. Apply the Kubernetes manifests:"
echo "   kubectl apply -k k8s/"
echo ""
echo "5. Check the deployment status:"
echo "   kubectl get pods -n sticktock"
echo "   kubectl logs -f deployment/sticktock-frontend -n sticktock"