#!/bin/bash
# ── ClearAMS Server Launcher ──────────────────────────────────────────────────
# Edit ADMIN_KEY below to set a permanent admin password for the admin panel.

export ADMIN_KEY=LASKYseaside91202

cd "$(dirname "$0")"

# ── Cloudflare tunnel (clearams.gusddev.app → localhost:8080) ─────────────────
CLOUDFLARED=/tmp/cloudflared
if [ ! -f "$CLOUDFLARED" ]; then
  echo "Downloading cloudflared..."
  curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CLOUDFLARED"
  chmod +x "$CLOUDFLARED"
fi

echo "Starting Cloudflare tunnel (clearams.gusddev.app)..."
"$CLOUDFLARED" tunnel --config ~/.cloudflared/config.yml run > /tmp/tunnel.log 2>&1 &
TUNNEL_PID=$!
echo "  tunnel PID: $TUNNEL_PID"

# ── Remotion player (build if dist/ missing) ──────────────────────────────────
if [ ! -d "remotion-viz/dist" ]; then
  echo "Building Remotion player..."
  cd remotion-viz && npm run build:player && cd ..
fi

# ── Flask server ──────────────────────────────────────────────────────────────
echo "Starting ClearAMS server on port 8080..."
python3 server.py

# If Flask exits, also kill the tunnel
kill "$TUNNEL_PID" 2>/dev/null
