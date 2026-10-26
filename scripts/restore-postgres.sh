#!/usr/bin/env sh
set -eu
if [ "${RESTORE_CONFIRM:-}" != "YES" ] || [ "$#" -ne 1 ]; then
  echo "DANGER: Restoring replaces database objects. Back up first and stop application traffic." >&2
  echo "Usage: RESTORE_CONFIRM=YES sh scripts/restore-postgres.sh backups/file.dump" >&2
  exit 2
fi
FILE=$1
if [ ! -r "$FILE" ]; then echo "Cannot read backup: $FILE" >&2; exit 2; fi
cd "$(dirname "$0")/.."
docker compose -f docker-compose.prod.yml exec -T db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < "$FILE"
echo "Restore finished. Verify records and API login before bringing traffic back."
