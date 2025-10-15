-- Add NextAuth tables
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Add new Build tables
CREATE TABLE IF NOT EXISTS "builds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "totalPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "build_items" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "build_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "build_ratings" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "build_ratings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "build_comments" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "build_comments_pkey" PRIMARY KEY ("id")
);

-- Add unique constraints
DO $$ BEGIN
    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_sessionToken_key" UNIQUE ("sessionToken");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_token_key" UNIQUE ("token");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE ("identifier", "token");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "build_items" ADD CONSTRAINT "build_items_buildId_productId_key" UNIQUE ("buildId", "productId");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "build_ratings" ADD CONSTRAINT "build_ratings_buildId_userId_key" UNIQUE ("buildId", "userId");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add foreign keys
DO $$ BEGIN
    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "builds" ADD CONSTRAINT "builds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "build_items" ADD CONSTRAINT "build_items_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "build_items" ADD CONSTRAINT "build_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "build_ratings" ADD CONSTRAINT "build_ratings_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "build_ratings" ADD CONSTRAINT "build_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "build_comments" ADD CONSTRAINT "build_comments_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "build_comments" ADD CONSTRAINT "build_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "builds_userId_idx" ON "builds"("userId");
CREATE INDEX IF NOT EXISTS "builds_isPublic_idx" ON "builds"("isPublic");
CREATE INDEX IF NOT EXISTS "build_ratings_buildId_idx" ON "build_ratings"("buildId");
CREATE INDEX IF NOT EXISTS "build_ratings_userId_idx" ON "build_ratings"("userId");
CREATE INDEX IF NOT EXISTS "build_comments_buildId_idx" ON "build_comments"("buildId");
CREATE INDEX IF NOT EXISTS "build_comments_userId_idx" ON "build_comments"("userId");

-- Migrate existing pc_builds to new builds table
INSERT INTO "builds" (id, name, description, "isPublic", "userId", "totalPrice", "createdAt", "updatedAt")
SELECT id, name, description, false, NULL, "totalPrice", "createdAt", "updatedAt"
FROM "pc_builds"
WHERE NOT EXISTS (SELECT 1 FROM "builds" WHERE "builds".id = "pc_builds".id);

-- Migrate existing pc_build_items to new build_items table
INSERT INTO "build_items" (id, "buildId", "productId", quantity, "createdAt")
SELECT id, "buildId", "productId", quantity, "createdAt"
FROM "pc_build_items"
WHERE NOT EXISTS (SELECT 1 FROM "build_items" WHERE "build_items".id = "pc_build_items".id);
