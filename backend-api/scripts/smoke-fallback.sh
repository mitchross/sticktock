#!/usr/bin/env bash
# Simple smoke test for the Puppeteer fallback endpoint
# Usage: ./smoke-fallback.sh "https://www.tiktok.com/@user/video/12345" [BACKEND_URL]
# BACKEND_URL defaults to http://localhost:2000

set -euo pipefail

URL_TO_TEST="$1"
BACKEND_URL="${2:-http://localhost:2000}"

if [ -z "$URL_TO_TEST" ]; then
  echo "Usage: $0 <tiktok-url> [backend-url]"
  exit 2
fi

ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$URL_TO_TEST")

FULL_URL="$BACKEND_URL/by_url/$ENCODED?fallback=puppeteer"

echo "Calling: $FULL_URL"

HTTP_OUTPUT=$(mktemp)
HTTP_STATUS=$(curl -sS -w "%{http_code}" -o "$HTTP_OUTPUT" "$FULL_URL" || true)

echo "HTTP status: $HTTP_STATUS"
echo "Response body:" 
cat "$HTTP_OUTPUT"
rm "$HTTP_OUTPUT"
