#!/bin/bash
# ── ClearAMS Server Launcher ──────────────────────────────────────────────────
# Edit ADMIN_KEY below to set a permanent admin password for the admin panel.

export ADMIN_KEY=changeme

cd "$(dirname "$0")"
python3 server.py
