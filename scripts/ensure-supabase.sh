#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="http://127.0.0.1:54221/rest/v1/"
MAX_WAIT=60

if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
  echo "Supabase already running"
  exit 0
fi

echo "Starting local Supabase..."
pnpm supabase start &
START_PID=$!

elapsed=0
while ! curl -sf "$HEALTH_URL" > /dev/null 2>&1; do
  if [ $elapsed -ge $MAX_WAIT ]; then
    echo "Timed out waiting for Supabase" >&2
    exit 1
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

wait $START_PID
echo "Supabase is ready"
