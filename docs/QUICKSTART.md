# Quick Start Guide

Get your PH PC Parts Aggregator running in minutes!

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** 9+ (comes with Node.js)

## Installation

### Automated Setup (Recommended)

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

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/pc_parts_db"

# 4. Generate Prisma client and initialize database
npx prisma generate
npx prisma db push
```

## Configuration

Edit `.env` file:

```bash
# Required
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pc_parts_db?schema=public"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional - Scraping
SCRAPER_TIMEOUT=30000
SCRAPER_MAX_RETRIES=3
BERMOR_MAX_PAGES=50
```

## Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Key Features

### 1. Browse Products
- Filter by category and retailer
- Search by name/brand
- Compare prices across retailers
- View product details with ratings

### 2. PC Builder
- Build custom PC configurations
- Select components by category
- Real-time price calculation
- Save and share builds
- Export builds as PDF

### 3. User Features
- User registration and authentication
- Save favorite builds
- Rate and comment on public builds
- Manage user profile
- View build gallery

## Common Tasks

### View Database

```bash
npx prisma studio
```

Opens web interface at [http://localhost:5555](http://localhost:5555)

### Build for Production

```bash
npm run build
npm start
```

### Docker Setup

```bash
docker-compose up -d
```

## API Endpoints

### Products
```bash
GET /api/products?category=CPU&search=AMD&page=1&limit=20
```

### Builds
```bash
GET /api/builds          # Get public builds
POST /api/builds         # Create new build
GET /api/builds/[id]     # Get build details
```

### User
```bash
GET /api/user/profile    # Get user profile
PUT /api/user/profile    # Update profile
```

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
3. Check database exists

### Prisma Client Not Generated

```bash
npx prisma generate
```

## Next Steps

1. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Customize**: Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
3. **Configure Scraping**: See [SCRAPER_SETUP.md](SCRAPER_SETUP.md)

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org/)

---

**Happy Coding!** 🚀
