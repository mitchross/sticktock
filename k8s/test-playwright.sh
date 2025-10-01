#!/bin/bash
# Test script for Playwright deployment in k8s
set -e

NAMESPACE="sticktock"
DEPLOYMENT="sticktock-backend"
TEST_URL="https://www.tiktok.com/@laetitia.circle/video/7538361488327609613"

echo "🔍 Checking deployment status..."
kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=60s

echo ""
echo "📊 Checking pod resources..."
kubectl top pod -n $NAMESPACE -l app=$DEPLOYMENT || echo "⚠️  Metrics not available"

echo ""
echo "🔍 Checking /dev/shm mount..."
POD=$(kubectl get pod -n $NAMESPACE -l app=$DEPLOYMENT -o jsonpath='{.items[0].metadata.name}')
echo "Pod: $POD"
kubectl exec -n $NAMESPACE $POD -- df -h /dev/shm

echo ""
echo "🔍 Checking Playwright installation..."
kubectl exec -n $NAMESPACE $POD -- npx playwright --version

echo ""
echo "🧪 Testing Playwright endpoint..."
echo "Port-forwarding to localhost:2000..."
kubectl port-forward -n $NAMESPACE svc/$DEPLOYMENT 2000:2000 &
PF_PID=$!
sleep 3

# URL encode the test URL
ENCODED_URL=$(echo "$TEST_URL" | jq -sRr @uri)

echo "Testing with URL: $TEST_URL"
RESPONSE=$(curl -s "http://localhost:2000/by_url/${ENCODED_URL}?fallback=playwright" || echo "FAILED")

# Kill port-forward
kill $PF_PID 2>/dev/null || true

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo "✅ SUCCESS! Playwright is working correctly"
    echo ""
    echo "Response preview:"
    echo "$RESPONSE" | jq '{id, tiktokId, author: .author.name, type}'
    exit 0
else
    echo "❌ FAILED! Response:"
    echo "$RESPONSE"
    echo ""
    echo "Check pod logs:"
    echo "  kubectl logs -n $NAMESPACE $POD"
    exit 1
fi
