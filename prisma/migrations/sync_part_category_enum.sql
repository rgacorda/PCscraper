-- Add missing enum values to PartCategory
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block
-- Each ADD VALUE must be a separate statement

-- Add CPU_COOLER if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CPU_COOLER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'CPU_COOLER';
    END IF;
END $$;

-- Add GPU if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'GPU' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'GPU';
    END IF;
END $$;

-- Add MOTHERBOARD if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MOTHERBOARD' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'MOTHERBOARD';
    END IF;
END $$;

-- Add RAM if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'RAM' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'RAM';
    END IF;
END $$;

-- Add STORAGE if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'STORAGE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'STORAGE';
    END IF;
END $$;

-- Add PSU if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PSU' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'PSU';
    END IF;
END $$;

-- Add CASE if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CASE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'CASE';
    END IF;
END $$;

-- Add CASE_FAN if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CASE_FAN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'CASE_FAN';
    END IF;
END $$;

-- Add MONITOR if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MONITOR' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'MONITOR';
    END IF;
END $$;

-- Add PERIPHERAL if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PERIPHERAL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'PERIPHERAL';
    END IF;
END $$;

-- Add ACCESSORY if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ACCESSORY' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'ACCESSORY';
    END IF;
END $$;

-- Add OTHER if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'OTHER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')) THEN
        ALTER TYPE "PartCategory" ADD VALUE 'OTHER';
    END IF;
END $$;
