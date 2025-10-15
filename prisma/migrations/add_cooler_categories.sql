-- Add new enum values
ALTER TYPE "PartCategory" ADD VALUE IF NOT EXISTS 'CPU_COOLER';
ALTER TYPE "PartCategory" ADD VALUE IF NOT EXISTS 'CASE_FAN';

-- Migrate existing COOLING products
UPDATE products
SET category = 'CPU_COOLER'
WHERE category = 'COOLING'
AND (
  LOWER(name) LIKE '%cpu cooler%'
  OR LOWER(name) LIKE '%cpu cooling%'
  OR LOWER(name) LIKE '%aio%'
  OR LOWER(name) LIKE '%water cool%'
  OR LOWER(name) LIKE '%liquid cool%'
  OR LOWER(name) LIKE '%tower cooler%'
);

UPDATE products
SET category = 'CASE_FAN'
WHERE category = 'COOLING';

-- Note: We cannot remove COOLING from the enum while it's in use
-- After all products are migrated, you can manually remove it if needed
