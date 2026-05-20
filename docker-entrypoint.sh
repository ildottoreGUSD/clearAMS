#!/bin/sh
# On first run with a mounted volume, seed users.json from the bundled copy.
if [ ! -f /data/users.json ] && [ -f /app/users.json ]; then
    cp /app/users.json /data/users.json
    echo "Seeded /data/users.json from bundled copy."
fi

exec gunicorn server:app --bind "0.0.0.0:${PORT:-8080}" --workers 1
