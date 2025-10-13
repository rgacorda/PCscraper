# Quick Start Guide

Get your PH PC Parts Aggregator up and running in minutes!

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** 9+ (comes with Node.js)

## Installation

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./scripts/setup.sh
```

The script will:
- Check Node.js version
- Install dependencies
- Create .env file
- Generate Prisma client
- Initialize database

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/pc_parts_db"

# 4. Generate Prisma client
npx prisma generate

# 5. Initialize database
npx prisma db push
```

## Configuration

Edit `.env` file:

```bash
# Required
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pc_parts_db?schema=public"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional
SCRAPER_TIMEOUT=30000
SCRAPER_MAX_RETRIES=3
```

## Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## First Steps

### 1. Seed Sample Data (Optional)

```bash
npx tsx scripts/seed.ts
```

This creates sample products with listings from all retailers.

### 2. Browse Products

Navigate to [http://localhost:3000](http://localhost:3000) to see the product listing page.

### 3. Try PC Builder

Visit [http://localhost:3000/builder](http://localhost:3000/builder) to build a PC configuration.

### 4. Trigger Scraping

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"retailer": "DATABLITZ"}'
```

Available retailers: `DATABLITZ`, `PCWORX`, `BERMOR`

## Common Tasks

### View Database

```bash
npx prisma studio
```

Opens a web interface at [http://localhost:5555](http://localhost:5555)

### Check Types

```bash
npm run type-check
```

### Lint Code

```bash
npm run lint
```

### Build for Production

```bash
npm run build
npm start
```

## Using Docker

### Start with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Application on port 3000

### Run Migrations

```bash
docker-compose exec app npx prisma db push
```

### View Logs

```bash
docker-compose logs -f app
```

### Stop Services

```bash
docker-compose down
```

## Project Structure

```
PCscraper/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── features/         # Feature modules
│   ├── lib/              # Utilities
│   └── scraper/          # Web scraping logic
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/
│   ├── setup.sh          # Setup script
│   └── seed.ts           # Seed data
└── package.json
```

## Key Features

### 1. Product Browsing
- Filter by category
- Search by name/brand
- View prices from multiple retailers
- Check stock status

### 2. PC Builder
- Select components by category
- Real-time price calculation
- Build summary
- Save configurations

### 3. Price Aggregation
- Automated scraping from retailers
- Price comparison
- Stock tracking
- Historical data

## API Endpoints

### Get Products

```bash
GET /api/products?category=CPU&search=AMD&page=1&limit=20
```

### Trigger Scraping

```bash
POST /api/scrape
Content-Type: application/json

{
  "retailer": "DATABLITZ"
}
```

## Environment Modes

### Development
```bash
NODE_ENV=development npm run dev
```
- Hot reload
- Detailed error messages
- Development tools enabled

### Production
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```
- Optimized builds
- Minimal error details
- Performance optimizations

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Failed

1. Ensure PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Check database exists:
   ```bash
   psql -U postgres -l
   ```

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Scraping Errors

- Check target website is accessible
- Verify selectors in scraper files
- Review network connectivity
- Check rate limiting

## Next Steps

1. **Customize Scrapers**: Edit files in `src/scraper/retailers/`
2. **Add Features**: Extend PC Builder functionality
3. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Explore Docs**:
   - [Scraper Documentation](src/scraper/README.md)
   - [API Documentation](src/features/api/README.md)
   - [PC Builder Docs](src/features/pc-builder/README.md)

## Getting Help

- **Documentation**: Check README files in feature directories
- **Logs**: Review terminal output and browser console
- **Database**: Use Prisma Studio to inspect data
- **Issues**: Check GitHub issues or create new one

## Development Tips

1. **Use TypeScript**: Leverage type safety
2. **Hot Reload**: Changes auto-refresh in dev mode
3. **Database GUI**: Use Prisma Studio for data management
4. **API Testing**: Use Postman or curl for API testing
5. **Git Workflow**: Commit frequently with clear messages

## Production Checklist

Before deploying to production:

- [ ] Set strong DATABASE_URL password
- [ ] Configure CRON_SECRET
- [ ] Set NODE_ENV to "production"
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up error monitoring
- [ ] Configure database backups
- [ ] Test all API endpoints
- [ ] Verify scraper functionality
- [ ] Review security headers

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Happy Coding!** 🚀
