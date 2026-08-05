#!/usr/bin/env bash
# RedDrop AI V2 Production Database Backup Script
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
DB_NAME=${DB_NAME:-"reddropai"}
DB_USER=${DB_USER:-"reddrop_user"}
DB_PASS=${DB_PASSWORD:-"reddrop_password_123"}
DB_HOST=${DB_HOST:-"localhost"}

mkdir -p "$BACKUP_DIR"

echo "📦 Starting database backup for $DB_NAME at $TIMESTAMP..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "✅ Backup successfully saved to $BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"
