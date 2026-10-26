#!/usr/bin/env sh
set -eu
# For the single-host production Docker Compose stack.
cd "$(dirname "$0")/.."
mkdir -p backups
chmod 700 backups
DEST="backups/bhasha-$(date -u +%Y%m%dT%H%M%SZ).dump"
TMP="${DEST}.partial"
trap 'rm -f "$TMP"' EXIT
docker compose -f docker-compose.prod.yml exec -T db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$TMP"
chmod 600 "$TMP"
mv "$TMP" "$DEST"
trap - EXIT
echo "Database backup saved to $DEST"
echo "Store an encrypted off-site copy and test restoration regularly."
