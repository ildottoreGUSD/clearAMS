@echo off
REM ── ClearAMS Server Launcher ──────────────────────────────────────────────────
REM Edit ADMIN_KEY below to set a permanent admin password for the admin panel.
REM Keep it secret — anyone with this key can add/remove user accounts.

set ADMIN_KEY=changeme

cd /d "%~dp0"
python3 server.py
pause
