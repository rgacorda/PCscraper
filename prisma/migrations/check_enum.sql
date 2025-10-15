-- Check current enum values
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PartCategory')
ORDER BY enumlabel;
