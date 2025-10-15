-- Step 1: Add new enum values (must be in separate transaction)
ALTER TYPE "PartCategory" ADD VALUE IF NOT EXISTS 'CPU_COOLER';
ALTER TYPE "PartCategory" ADD VALUE IF NOT EXISTS 'CASE_FAN';
