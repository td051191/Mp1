-- SQLite Database Schema for Minh Phát E-commerce

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_vi TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    image TEXT NOT NULL,
    images TEXT, -- JSON array of additional images
    category TEXT NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    weight TEXT,
    origin TEXT,
    harvest_date TEXT,
    shelf_life TEXT,
    nutrition TEXT, -- JSON object
    organic BOOLEAN DEFAULT FALSE,
    seasonal BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    description_en TEXT,
    description_vi TEXT,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    count INTEGER DEFAULT 0,
    parent_id TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    value_en TEXT,
    value_vi TEXT,
    type TEXT NOT NULL DEFAULT 'text', -- text, html, markdown, json
    section TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key, section)
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletters (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active', -- active, unsubscribed
    preferences TEXT, -- JSON object for preferences
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_organic ON products(organic);
CREATE INDEX IF NOT EXISTS idx_products_seasonal ON products(seasonal);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_key ON content(key);
CREATE INDEX IF NOT EXISTS idx_content_section ON content(section);
CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Create triggers to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
    AFTER UPDATE ON products
    BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_categories_timestamp 
    AFTER UPDATE ON categories
    BEGIN
        UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_content_timestamp 
    AFTER UPDATE ON content
    BEGIN
        UPDATE content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_newsletters_timestamp 
    AFTER UPDATE ON newsletters
    BEGIN
        UPDATE newsletters SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_admin_users_timestamp 
    AFTER UPDATE ON admin_users
    BEGIN
        UPDATE admin_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
