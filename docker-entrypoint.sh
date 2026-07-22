#!/bin/sh
# Runs as root (the container's default user) before the app starts.
#
# DATA_DIR / DOWNLOAD_ROOT usually point at a mounted persistent volume
# (a Render Disk, a Railway/Fly volume, a `docker run -v` bind mount). That
# volume is attached fresh at container start — it wasn't part of the image
# build — so whatever `chown` happened in the Dockerfile doesn't apply to it,
# and it typically comes in owned by root. Without this step the app (running
# as the non-root "telextract" user) fails with EACCES trying to write there.
set -e

DATA_DIR="${DATA_DIR:-/app/data}"
DOWNLOAD_ROOT="${DOWNLOAD_ROOT:-/app/downloads}"

mkdir -p "$DATA_DIR" "$DOWNLOAD_ROOT"

if chown -R telextract:nodejs "$DATA_DIR" "$DOWNLOAD_ROOT" 2>/dev/null; then
  exec su-exec telextract "$@"
else
  echo "[entrypoint] Could not chown $DATA_DIR / $DOWNLOAD_ROOT — running as root instead." >&2
  exec "$@"
fi
