#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database paths
const DB_PATH = path.join(__dirname, '../data/database.sqlite');
const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup() {
  try {
    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
      console.error('❌ Database file not found at:', DB_PATH);
      process.exit(1);
    }

    // Create timestamp for backup filename
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .replace('T', '_')
      .slice(0, 19);

    const backupFileName = `database_backup_${timestamp}.sqlite`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);

    // Get file sizes for verification
    const originalSize = fs.statSync(DB_PATH).size;
    const backupSize = fs.statSync(backupPath).size;

    if (originalSize === backupSize) {
      console.log('✅ Database backup created successfully!');
      console.log(`📁 Backup location: ${backupPath}`);
      console.log(`📊 File size: ${(originalSize / 1024).toFixed(2)} KB`);
      
      // List all backups
      console.log('\n📋 Available backups:');
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.sqlite'))
        .sort()
        .reverse();

      backups.forEach((backup, index) => {
        const backupFilePath = path.join(BACKUP_DIR, backup);
        const stats = fs.statSync(backupFilePath);
        const size = (stats.size / 1024).toFixed(2);
        const date = stats.mtime.toLocaleString();
        console.log(`  ${index + 1}. ${backup} (${size} KB, ${date})`);
      });

      // Clean up old backups (keep only 10 most recent)
      if (backups.length > 10) {
        const oldBackups = backups.slice(10);
        console.log(`\n🧹 Cleaning up ${oldBackups.length} old backup(s)...`);
        oldBackups.forEach(oldBackup => {
          fs.unlinkSync(path.join(BACKUP_DIR, oldBackup));
          console.log(`   Deleted: ${oldBackup}`);
        });
      }

    } else {
      console.error('❌ Backup verification failed - file sizes do not match');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

function restoreBackup(backupFile) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      console.error('❌ Backup file not found:', backupPath);
      process.exit(1);
    }

    // Create backup of current database before restoring
    if (fs.existsSync(DB_PATH)) {
      const timestamp = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '-')
        .replace('T', '_')
        .slice(0, 19);
      const currentBackupPath = path.join(BACKUP_DIR, `database_before_restore_${timestamp}.sqlite`);
      fs.copyFileSync(DB_PATH, currentBackupPath);
      console.log(`📁 Current database backed up to: ${currentBackupPath}`);
    }

    // Restore backup
    fs.copyFileSync(backupPath, DB_PATH);
    
    console.log('✅ Database restored successfully!');
    console.log(`📁 Restored from: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('📁 No backup directory found');
      return;
    }

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.sqlite'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('📁 No backups found');
      return;
    }

    console.log('📋 Available backups:');
    backups.forEach((backup, index) => {
      const backupFilePath = path.join(BACKUP_DIR, backup);
      const stats = fs.statSync(backupFilePath);
      const size = (stats.size / 1024).toFixed(2);
      const date = stats.mtime.toLocaleString();
      console.log(`  ${index + 1}. ${backup} (${size} KB, ${date})`);
    });

  } catch (error) {
    console.error('❌ Failed to list backups:', error.message);
  }
}

// Parse command line arguments
const command = process.argv[2];
const argument = process.argv[3];

switch (command) {
  case 'backup':
  case 'create':
    createBackup();
    break;
    
  case 'restore':
    if (!argument) {
      console.error('❌ Please specify backup file to restore');
      console.log('Usage: node backup-database.js restore <backup-filename>');
      process.exit(1);
    }
    restoreBackup(argument);
    break;
    
  case 'list':
    listBackups();
    break;
    
  default:
    console.log('🗃️  Minh Phát Database Backup Tool');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/backup-database.js backup     - Create a new backup');
    console.log('  node scripts/backup-database.js restore <file> - Restore from backup');
    console.log('  node scripts/backup-database.js list       - List all backups');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/backup-database.js backup');
    console.log('  node scripts/backup-database.js restore database_backup_2024-01-15_14-30-45.sqlite');
    console.log('  node scripts/backup-database.js list');
    break;
}
