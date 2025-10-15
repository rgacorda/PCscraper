-- Add rating column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2);
