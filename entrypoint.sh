#!/bin/sh
set -e

# Generate runtime env.js with API_BASE_URL
TMP_ENV="/tmp/env.js.$$"
{
  printf 'window.__env = window.__env || {};\n'
  printf 'window.__env.API_BASE_URL = "%s";\n' "${API_BASE_URL:-}"
  
  # Append existing env.js if present
  if [ -f /app/public/env.js ]; then
    cat /app/public/env.js
  fi
} > "$TMP_ENV"

mv "$TMP_ENV" /app/public/env.js

# Start Angular dev server
exec npx ng serve \
  --host 0.0.0.0 \
  --port 4200 \
  --allowed-hosts "${FRONTEND_HOST:-localhost}"
