#!/bin/bash

# Minh Phát Database Backup Script
# Usage: ./scripts/backup-database.sh [backup|restore|list]

set -e  # Exit on any error

# Configuration
DB_PATH="./data/database.sqlite"
BACKUP_DIR="./backups"
MAX_BACKUPS=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to create backup
create_backup() {
    echo -e "${BLUE}🗃️  Creating database backup...${NC}"
    
    # Check if database exists
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}❌ Database file not found at: $DB_PATH${NC}"
        exit 1
    fi
    
    # Create timestamp for backup filename
    TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
    BACKUP_FILE="database_backup_${TIMESTAMP}.sqlite"
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
    
    # Copy database file
    cp "$DB_PATH" "$BACKUP_PATH"
    
    # Verify backup
    if [ -f "$BACKUP_PATH" ]; then
        ORIGINAL_SIZE=$(stat -f%z "$DB_PATH" 2>/dev/null || stat -c%s "$DB_PATH" 2>/dev/null)
        BACKUP_SIZE=$(stat -f%z "$BACKUP_PATH" 2>/dev/null || stat -c%s "$BACKUP_PATH" 2>/dev/null)
        
        if [ "$ORIGINAL_SIZE" -eq "$BACKUP_SIZE" ]; then
            echo -e "${GREEN}✅ Database backup created successfully!${NC}"
            echo -e "${BLUE}📁 Backup location: $BACKUP_PATH${NC}"
            echo -e "${BLUE}📊 File size: $((ORIGINAL_SIZE / 1024)) KB${NC}"
        else
            echo -e "${RED}❌ Backup verification failed - file sizes do not match${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Backup creation failed${NC}"
        exit 1
    fi
    
    # Clean up old backups
    cleanup_old_backups
}

# Function to restore backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Please specify backup file to restore${NC}"
        echo "Usage: $0 restore <backup-filename>"
        exit 1
    fi
    
    BACKUP_PATH="${BACKUP_DIR}/${backup_file}"
    
    if [ ! -f "$BACKUP_PATH" ]; then
        echo -e "${RED}❌ Backup file not found: $BACKUP_PATH${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  This will replace the current database. Continue? (y/N)${NC}"
    read -r confirmation
    
    if [[ $confirmation != [yY] && $confirmation != [yY][eE][sS] ]]; then
        echo "Restore cancelled."
        exit 0
    fi
    
    # Backup current database before restoring
    if [ -f "$DB_PATH" ]; then
        TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
        CURRENT_BACKUP="${BACKUP_DIR}/database_before_restore_${TIMESTAMP}.sqlite"
        cp "$DB_PATH" "$CURRENT_BACKUP"
        echo -e "${BLUE}📁 Current database backed up to: $CURRENT_BACKUP${NC}"
    fi
    
    # Restore backup
    cp "$BACKUP_PATH" "$DB_PATH"
    
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
    echo -e "${BLUE}📁 Restored from: $BACKUP_PATH${NC}"
}

# Function to list backups
list_backups() {
    echo -e "${BLUE}📋 Available backups:${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "📁 No backup directory found"
        return
    fi
    
    BACKUPS=($(ls -t "$BACKUP_DIR"/*.sqlite 2>/dev/null || true))
    
    if [ ${#BACKUPS[@]} -eq 0 ]; then
        echo "📁 No backups found"
        return
    fi
    
    for i in "${!BACKUPS[@]}"; do
        backup="${BACKUPS[$i]}"
        filename=$(basename "$backup")
        size=$(stat -f%z "$backup" 2>/dev/null || stat -c%s "$backup" 2>/dev/null)
        size_kb=$((size / 1024))
        date_modified=$(stat -f%Sm -t '%Y-%m-%d %H:%M:%S' "$backup" 2>/dev/null || stat -c%y "$backup" 2>/dev/null | cut -d'.' -f1)
        echo "  $((i + 1)). $filename (${size_kb} KB, $date_modified)"
    done
}

# Function to clean up old backups
cleanup_old_backups() {
    BACKUPS=($(ls -t "$BACKUP_DIR"/*.sqlite 2>/dev/null || true))
    
    if [ ${#BACKUPS[@]} -gt $MAX_BACKUPS ]; then
        echo -e "${YELLOW}🧹 Cleaning up old backups (keeping $MAX_BACKUPS most recent)...${NC}"
        
        for ((i=$MAX_BACKUPS; i<${#BACKUPS[@]}; i++)); do
            old_backup="${BACKUPS[$i]}"
            filename=$(basename "$old_backup")
            rm "$old_backup"
            echo "   Deleted: $filename"
        done
    fi
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}🗃️  Minh Phát Database Backup Tool${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 backup                    - Create a new backup"
    echo "  $0 restore <backup-file>     - Restore from backup"
    echo "  $0 list                      - List all backups"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore database_backup_2024-01-15_14-30-45.sqlite"
    echo "  $0 list"
}

# Main script logic
case "${1:-help}" in
    backup|create)
        create_backup
        ;;
    restore)
        restore_backup "$2"
        ;;
    list)
        list_backups
        ;;
    help|--help|-h|*)
        show_usage
        ;;
esac
