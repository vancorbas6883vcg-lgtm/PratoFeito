CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TYPE user_type AS ENUM ('buyer','supplier');
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type user_type NOT NULL, name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  phone VARCHAR(30), address TEXT, city VARCHAR(80),
  cnpj VARCHAR(18), establishment_type VARCHAR(60),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (type <> 'supplier' OR cnpj IS NOT NULL)
);
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL, category VARCHAR(60) NOT NULL, description TEXT,
  image_url TEXT, quantity INT NOT NULL CHECK (quantity >= 0), unit VARCHAR(20) NOT NULL DEFAULT 'un',
  expiry_date DATE NOT NULL, original_price NUMERIC(10,2) NOT NULL CHECK (original_price >= 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0), offer_type VARCHAR(20) NOT NULL DEFAULT 'discount' CHECK (offer_type IN ('discount','donation')),
  pickup_time VARCHAR(60), is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_active ON products (is_active, expiry_date);
CREATE SEQUENCE order_number_seq START 1000;
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number BIGINT NOT NULL DEFAULT nextval('order_number_seq'),
  buyer_id UUID NOT NULL REFERENCES users(id),
  total_amount NUMERIC(10,2) NOT NULL, receipt_type VARCHAR(20) NOT NULL CHECK (receipt_type IN ('pickup','delivery')),
  delivery_address TEXT, status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','ready','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0), unit_price NUMERIC(10,2) NOT NULL
);
