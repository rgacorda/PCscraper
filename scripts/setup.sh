#!/bin/bash

echo "🚀 Setting up PH PC Parts Aggregator..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18+ is required. Current version: $(node -v)"
  exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo "✅ Dependencies installed"

# Check for .env file
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Creating from .env.example..."
  cp .env.example .env
  echo "📝 Please edit .env file with your database credentials"
  echo "   DATABASE_URL=\"postgresql://user:password@localhost:5432/pc_parts_db\""
  read -p "Press Enter to continue after updating .env..."
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
  echo "❌ Failed to generate Prisma Client"
  exit 1
fi

echo "✅ Prisma Client generated"

# Ask about database setup
read -p "Would you like to initialize the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🗄️  Setting up database..."
  npx prisma db push

  if [ $? -ne 0 ]; then
    echo "⚠️  Database setup failed. Make sure PostgreSQL is running and DATABASE_URL is correct"
    echo "   You can run 'npx prisma db push' manually later"
  else
    echo "✅ Database setup complete"
  fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review and update .env file if needed"
echo "  2. Start the development server: npm run dev"
echo "  3. Visit http://localhost:3000"
echo ""
echo "Optional commands:"
echo "  - View database: npx prisma studio"
echo "  - Run scraper: npm run scrape"
echo "  - Type check: npm run type-check"
echo ""
