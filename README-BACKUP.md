# Database Backup Guide

This guide explains how to backup and restore the Minh Phát SQLite database.

## 🗃️ Backup Scripts

Two backup scripts are provided:

### Node.js Script (Cross-platform)

- **Location**: `scripts/backup-database.js`
- **Advantages**: Works on all platforms (Windows, macOS, Linux)
- **Usage**: Via npm scripts or direct node execution

### Bash Script (Unix/Linux/macOS)

- **Location**: `scripts/backup-database.sh`
- **Advantages**: Native shell script with colored output
- **Usage**: Direct execution on Unix-like systems

## 📋 Commands

### Using NPM Scripts (Recommended)

```bash
# Create a backup
npm run db:backup

# List all backups
npm run db:list

# Restore from backup (replace <filename> with actual backup file)
npm run db:restore <filename>
```

### Using Node.js Script Directly

```bash
# Create a backup
node scripts/backup-database.js backup

# List all backups
node scripts/backup-database.js list

# Restore from backup
node scripts/backup-database.js restore database_backup_2024-01-15_14-30-45.sqlite
```

### Using Bash Script (Unix/Linux/macOS)

```bash
# Create a backup
./scripts/backup-database.sh backup

# List all backups
./scripts/backup-database.sh list

# Restore from backup
./scripts/backup-database.sh restore database_backup_2024-01-15_14-30-45.sqlite
```

## 📁 File Structure

```
project/
├── data/
│   └── database.sqlite          # Main database file
├── backups/                     # Backup directory (auto-created)
│   ├── database_backup_2024-01-15_14-30-45.sqlite
│   ├── database_backup_2024-01-15_15-45-12.sqlite
│   └── ...
└── scripts/
    ├── backup-database.js       # Node.js backup script
    └── backup-database.sh       # Bash backup script
```

## 🔄 Backup Process

1. **Automatic Backup Creation**: Backups are created with timestamps
2. **Verification**: File sizes are compared to ensure backup integrity
3. **Cleanup**: Automatically keeps only the 10 most recent backups
4. **Safety**: Before restore, current database is automatically backed up

## 📊 Backup Features

### ✅ What's Included in Backups

- All products with multilingual content
- Categories and subcategories
- Website content and translations
- Newsletter subscriptions
- Admin users (encrypted passwords)
- All indexes and database structure

### 🔒 Security

- Backup files are standard SQLite files
- Admin passwords remain MD5 hashed
- No sensitive data is exposed in plain text

## ⚡ Quick Examples

### Create Daily Backup

```bash
npm run db:backup
```

### Emergency Restore

```bash
# 1. List available backups
npm run db:list

# 2. Choose a backup and restore
npm run db:restore database_backup_2024-01-15_14-30-45.sqlite
```

### Scheduled Backups (Cron)

Add to your crontab for daily backups at 2 AM:

```bash
0 2 * * * cd /path/to/your/project && npm run db:backup
```

## 🚨 Important Notes

1. **Server Restart**: After restoring a backup, restart the server to reload the database
2. **File Permissions**: Ensure the backup directory is writable
3. **Disk Space**: Monitor backup directory size as it can grow over time
4. **Testing**: Always test backups in a development environment first

## 🛠️ Troubleshooting

### "Database file not found"

- Ensure the server has been started at least once to create the initial database
- Check that `data/database.sqlite` exists

### "Permission denied"

- On Unix systems, make the bash script executable: `chmod +x scripts/backup-database.sh`
- Ensure write permissions to the backup directory

### "Backup verification failed"

- Usually indicates disk space issues or file system problems
- Check available disk space

## 📞 Support

For backup-related issues:

1. Check this documentation
2. Verify file permissions
3. Ensure adequate disk space
4. Check server logs for database errors
