-- ====================================================================
-- HE THONG DATABASE SCHEMA CHUAN CHUYEN NGHIEP - PHU TUNG O TO Q.BA
-- DBMS: PostgreSQL 15+
-- Mat tran anh xa 100% UI/UX Public Website & Admin Dashboard
-- ====================================================================

-- 1. BANG NGUOI DUNG & NHAN VIEN QUAN TRI (USERS)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL DEFAULT 'sales', -- super_admin, sales, warehouse, content_editor, customer
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. BANG DANH MUC PHU TUNG & CHUNG LOAI XE (CATEGORIES)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BANG THUONG HIEU SAN XUAT (BRANDS)
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BANG SAN PHAM PHU TUNG O TO (PRODUCTS)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    brand_id INT REFERENCES brands(id) ON DELETE SET NULL,
    
    -- Thong tin Cong khai (Public UI)
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    part_number VARCHAR(100) NOT NULL, -- Ma Part No. Nha may (vd: VG1560080012, JS160T...)
    description TEXT,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    in_stock BOOLEAN DEFAULT TRUE, -- Badge "San Kho Da Nang"
    quality_standard VARCHAR(100) DEFAULT 'Loai 1 Cao Cap', -- "Loai 1 Cao Cap", "Chinh Hang"
    compatibility JSONB DEFAULT '[]'::jsonb, -- Mang cac dong xe tuong thich: ["HOWO 371", "HOWO V7G", "Shacman X3000"]
    specifications JSONB DEFAULT '{}'::jsonb, -- Key-Value: {"Ma phu tung": "...", "Chat lieu": "..."}

    -- Thong tin Noi bo Quan tri Admin (Admin Internal Only UI)
    internal_code VARCHAR(100) UNIQUE NOT NULL, -- Ma Noi Bo Admin (vd: QB-DC-0012, QB-HS-0160)
    internal_name VARCHAR(255) NOT NULL, -- Ten Quan Ly Noi Bo (vd: WEICHAI-WP12-OIL-FILTER-LOAI1)
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    cost_price DECIMAL(12, 2) DEFAULT 0.00 CHECK (cost_price >= 0), -- Gia von nhap kho

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. BANG BOHINH ANH SAN PHAM (PRODUCT_IMAGES)
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

-- 6. BANG DON HANG & YEU CAU BAO GIA (ORDERS / QUOTATIONS)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL, -- Ma don (vd: QB-ORD-20260807-001)
    user_id INT REFERENCES users(id) ON DELETE SET NULL, -- Tai khoan phu trách hoac NULL neu khach vang lai
    
    -- Thong tin Khach hang Bieu mau Bao gia
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL, -- So dien thoai bat buoc
    customer_email VARCHAR(255),
    company_name VARCHAR(255),
    
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending (Cho xu ly), confirmed (Da bao gia), completed (Hoan tat), cancelled (Huy)
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_address TEXT,
    notes TEXT, -- Ghi chu cua khach hang hoac Nhan vien Kinh doanh
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. BANG CHI TIET PHU TUNG TRONG DON BAO GIA (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    item_note TEXT
);

-- 8. BANG BAI VIET TIN TUC & CAM NANG KY THUAT (NEWS)
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_slug VARCHAR(100) NOT NULL DEFAULT 'cam-nang-ky-thuat', -- cam-nang-ky-thuat, tin-tuc-thi-truong
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    views INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. BANG KHANH HANG THONG KE (CUSTOMERS DIRECTORY)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    company_name VARCHAR(255),
    address TEXT,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(14, 2) DEFAULT 0.00,
    last_order_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. BANG DANH MUC TIN TUC (NEWS_CATEGORIES)
CREATE TABLE IF NOT EXISTS news_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. BANG CAU HINH HE THONG (SYSTEM_SETTINGS)
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. BANG THUONG HIEU DOI TAC (PARTNER_BRANDS)
CREATE TABLE IF NOT EXISTS partner_brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- CHI MUC OPTIMIZATION (INDEXES) THAM CHIEU TOC DO TRA CUU HOẢ TỐC
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_products_part_number ON products(part_number);
CREATE INDEX IF NOT EXISTS idx_products_internal_code ON products(internal_code);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
