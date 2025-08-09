#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Check if admin_users table exists and has data
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='admin_users'", (err, tables) => {
  if (err) {
    console.error('Error checking tables:', err);
    process.exit(1);
  }
  
  if (tables.length === 0) {
    console.log('❌ admin_users table does not exist');
    process.exit(1);
  }
  
  console.log('✅ admin_users table exists');
  
  // Check admin users
  db.all("SELECT * FROM admin_users", (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      process.exit(1);
    }
    
    console.log(`Found ${users.length} admin user(s):`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password Hash: ${user.password_hash}`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('❌ No admin users found. Creating admin user...');
      createAdminUser();
    } else {
      // Test password validation
      const testPassword = 'admin123';
      const testHash = crypto.createHash('md5').update(testPassword).digest('hex');
      console.log(`Test password hash for "admin123": ${testHash}`);
      
      const adminUser = users.find(u => u.username === 'admin');
      if (adminUser) {
        if (adminUser.password_hash === testHash) {
          console.log('✅ Admin password hash matches');
        } else {
          console.log('❌ Admin password hash does NOT match');
          console.log(`Expected: ${testHash}`);
          console.log(`Actual: ${adminUser.password_hash}`);
        }
      }
      
      db.close();
    }
  });
});

function createAdminUser() {
  const id = crypto.randomUUID();
  const passwordHash = crypto.createHash('md5').update('admin123').digest('hex');
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO admin_users (id, username, password_hash, name, email, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, 'admin', passwordHash, 'Administrator', 'admin@minhphat.com', now, now], function(err) {
    if (err) {
      console.error('Error creating admin user:', err);
    } else {
      console.log('✅ Admin user created successfully');
    }
    db.close();
  });
}
