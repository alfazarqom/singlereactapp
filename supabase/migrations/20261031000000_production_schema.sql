-- ============================================================================
-- STOREFRONT & DUITKU PAYMENT GATEWAY PRODUCTION DATABASE SCHEMA FOR SUPABASE
-- Fully Idempotent: Handles existing tables, adds missing columns safely
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT 'Shirt',
    banner TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure all category columns exist if table was already present
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Shirt';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS banner TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL DEFAULT 'Storefront',
    category TEXT NOT NULL,
    category_slug TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL DEFAULT 0,
    original_price BIGINT,
    discount INT DEFAULT 0,
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    stock INT NOT NULL DEFAULT 10,
    sold_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    images JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure all product columns exist if table was already present
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Storefront';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price BIGINT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price BIGINT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount INT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 5.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_count INT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- 4. ORDERS TABLE (Integrates with Duitku POP & Invoices)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    merchant_order_id TEXT UNIQUE,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    total_amount BIGINT DEFAULT 0,
    payment_status TEXT DEFAULT 'PENDING',
    payment_method TEXT DEFAULT 'DUITKU_POP',
    duitku_reference TEXT,
    duitku_va_number TEXT,
    duitku_payment_url TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crucial: Ensure all order columns exist even if public.orders already existed previously
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merchant_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount BIGINT DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'DUITKU_POP';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS duitku_reference TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS duitku_va_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS duitku_payment_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- 5. PAYMENT AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_order_id TEXT,
    reference TEXT,
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.payment_logs ADD COLUMN IF NOT EXISTS merchant_order_id TEXT;
ALTER TABLE public.payment_logs ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE public.payment_logs ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.payment_logs ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE public.payment_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_order_id ON public.orders(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Categories: Public read
DROP POLICY IF EXISTS "Allow public read on categories" ON public.categories;
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT USING (true);

-- Products: Public read
DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);

-- Orders: Public insert, select, update
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);

-- Payment Logs: Public insert/read
DROP POLICY IF EXISTS "Allow public insert on payment_logs" ON public.payment_logs;
CREATE POLICY "Allow public insert on payment_logs" ON public.payment_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on payment_logs" ON public.payment_logs;
CREATE POLICY "Allow public select on payment_logs" ON public.payment_logs FOR SELECT USING (true);

-- ============================================================================
-- 8. INITIAL PRODUCTION SEED DATA
-- ============================================================================

INSERT INTO public.categories (id, name, slug, icon, banner)
VALUES
  ('cat-1', 'Fashion', 'fashion', 'Shirt', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200'),
  ('cat-2', 'Electronics', 'electronics', 'Smartphone', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200'),
  ('cat-3', 'Beauty', 'beauty', 'Sparkles', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200'),
  ('cat-4', 'Home & Living', 'home-living', 'Home', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200'),
  ('cat-5', 'Sports', 'sports', 'Activity', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200'),
  ('cat-6', 'Accessories', 'accessories', 'Watch', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  banner = EXCLUDED.banner;

INSERT INTO public.products (
  id, name, slug, brand, category, category_slug, description, price, original_price, discount, rating, review_count, stock, sold_count, is_featured, is_best_seller, is_new_arrival, images, colors, sizes, specs
)
VALUES
  (
    'prod-1',
    'Aura Noise-Canceling Wireless Headphones Pro',
    'aura-wireless-headphones-pro',
    'Aura Audio',
    'Electronics',
    'electronics',
    'Premium over-ear wireless headphones engineered with hybrid active noise cancellation, 30-hour playback, custom acoustic drivers, and spatial audio calibration.',
    2499000,
    3299000,
    24,
    4.9,
    312,
    14,
    840,
    true,
    true,
    false,
    '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800"]'::jsonb,
    '["Matte Black", "Silver Quartz", "Navy Blue"]'::jsonb,
    '["Standard"]'::jsonb,
    '["Active Noise Cancellation", "30 Hours Battery", "Bluetooth 5.3", "Custom EQ App"]'::jsonb
  ),
  (
    'prod-2',
    'Minimalist Leather Smartwatch Gen-4',
    'minimalist-leather-smartwatch',
    'Chronos',
    'Electronics',
    'electronics',
    'Sleek biometric smartwatch featuring AMOLED touch screen, heart rate & SpO2 tracking, GPS, 50m water resistance, and genuine Italian leather strap.',
    1850000,
    2200000,
    15,
    4.7,
    184,
    9,
    410,
    true,
    false,
    true,
    '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800"]'::jsonb,
    '["Tan Brown", "Midnight Black"]'::jsonb,
    '["40mm", "44mm"]'::jsonb,
    '["OLED Always-On", "Heart & ECG Sensor", "5 ATM Waterproof", "7-Day Battery Life"]'::jsonb
  ),
  (
    'prod-3',
    'Urban Explorer Ergonomic 25L Backpack',
    'urban-explorer-backpack',
    'NORDIC',
    'Fashion',
    'fashion',
    'Weatherproof rolltop city backpack featuring 16-inch padded laptop sleeve, quick-access passport pocket, and breathable memory foam back panel.',
    790000,
    1100000,
    28,
    4.8,
    96,
    22,
    630,
    false,
    true,
    false,
    '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800"]'::jsonb,
    '["Charcoal Slate", "Olive Green", "Desert Sand"]'::jsonb,
    '["One Size (25L)"]'::jsonb,
    '["Waterproof Cordura", "Fits 16-inch Laptop", "Luggage Pass-through", "YKK Zippers"]'::jsonb
  ),
  (
    'prod-4',
    'Heavyweight Organic Cotton Oversized Hoodie',
    'heavyweight-cotton-hoodie',
    'KITH & CO',
    'Fashion',
    'fashion',
    'Crafted from 450 GSM organic French terry cotton. Double-layered hood, dropped shoulders, and pre-shrunk finish for long-lasting relaxed aesthetic.',
    480000,
    600000,
    20,
    4.6,
    142,
    35,
    920,
    true,
    false,
    true,
    '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800"]'::jsonb,
    '["Washed Off-White", "Charcoal Gray", "Sage Green"]'::jsonb,
    '["S", "M", "L", "XL"]'::jsonb,
    '["100% Organic Cotton", "450 GSM Fleece", "Pre-shrunk", "Ribbed Cuffs"]'::jsonb
  ),
  (
    'prod-5',
    'Ceramic Pour-Over Coffee Dripper Set',
    'ceramic-pour-over-coffee-set',
    'KONO Studio',
    'Home & Living',
    'home-living',
    'Handcrafted ceramic V60 style pour-over dripper complete with heat-resistant 700ml glass carafe and precision walnut wood stand.',
    649000,
    799000,
    18,
    4.9,
    215,
    11,
    540,
    false,
    true,
    false,
    '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"]'::jsonb,
    '["Matte White", "Japanese Black Ceramic"]'::jsonb,
    '["600ml / 2-4 Cups"]'::jsonb,
    '["High-Fired Ceramic", "Borosilicate Carafe", "Includes 40 Paper Filters", "Dishwasher Safe"]'::jsonb
  ),
  (
    'prod-6',
    'Botanical Hydrating Facial Essence 150ml',
    'botanical-hydrating-facial-essence',
    'LUMINA Skincare',
    'Beauty',
    'beauty',
    'Nourishing facial treatment essence formulated with green tea ferment, hyaluronic acid, and niacinamide for radiant skin elasticity.',
    320000,
    420000,
    23,
    4.8,
    380,
    45,
    1200,
    true,
    true,
    false,
    '["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800"]'::jsonb,
    '["Standard Bottle"]'::jsonb,
    '["150ml"]'::jsonb,
    '["Cruelty-Free", "Dermatologist Tested", "Alcohol-Free", "Vegan Certified"]'::jsonb
  ),
  (
    'prod-7',
    'Pro Performance Non-Slip Yoga Mat 6mm',
    'pro-performance-yoga-mat',
    'ZENFIT',
    'Sports',
    'sports',
    'Eco-friendly natural tree rubber yoga mat with laser-etched alignment guides, superior grip density, and antimicrobial surface coat.',
    520000,
    650000,
    20,
    4.7,
    110,
    18,
    310,
    false,
    false,
    true,
    '["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=800"]'::jsonb,
    '["Ocean Teal", "Deep Plum", "Midnight Ash"]'::jsonb,
    '["183cm x 68cm x 6mm"]'::jsonb,
    '["Natural Rubber", "Antimicrobial Layer", "Laser Alignment", "Includes Carrying Strap"]'::jsonb
  ),
  (
    'prod-8',
    'Polarized Titanium Frame Sunglasses',
    'polarized-titanium-sunglasses',
    'VERVE Eyewear',
    'Accessories',
    'accessories',
    'Ultra-lightweight aerospace titanium frames with UV400 anti-glare polarized lenses. Maximum comfort for outdoor performance and driving.',
    890000,
    1250000,
    28,
    4.9,
    88,
    15,
    270,
    true,
    false,
    true,
    '["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"]'::jsonb,
    '["Gunmetal Silver", "Gold Amber"]'::jsonb,
    '["Medium Fit"]'::jsonb,
    '["100% UV400 Protection", "16g Titanium Frame", "Anti-Scratch Coating", "Includes Leather Case"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  category_slug = EXCLUDED.category_slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount = EXCLUDED.discount,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock = EXCLUDED.stock,
  sold_count = EXCLUDED.sold_count,
  is_featured = EXCLUDED.is_featured,
  is_best_seller = EXCLUDED.is_best_seller,
  is_new_arrival = EXCLUDED.is_new_arrival,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  sizes = EXCLUDED.sizes,
  specs = EXCLUDED.specs;
