# Project Structure

## Directory Overview

```
PCscraper/
├── .vscode/                    # VSCode editor settings
│   ├── settings.json          # Editor configuration
│   └── extensions.json        # Recommended extensions
├── prisma/                     # Database schema and migrations
│   └── schema.prisma          # Prisma database schema
├── scripts/                    # Utility scripts
│   ├── setup.sh               # Automated setup script
│   └── seed.ts                # Database seeding script
├── src/                        # Application source code
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── products/      # Products endpoint
│   │   │   │   └── route.ts
│   │   │   └── scrape/        # Scraping endpoint
│   │   │       └── route.ts
│   │   ├── builder/           # PC Builder page
│   │   │   └── page.tsx
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── features/              # Feature modules
│   │   ├── api/               # API documentation
│   │   │   └── README.md
│   │   ├── pc-builder/        # PC Builder feature
│   │   │   ├── components/
│   │   │   │   └── PCBuilder.tsx
│   │   │   └── README.md
│   │   └── ui/                # UI components
│   │       ├── components/
│   │       │   └── ProductList.tsx
│   │       └── README.md
│   ├── lib/                   # Shared utilities
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Helper functions
│   └── scraper/               # Web scraping module
│       ├── retailers/
│       │   ├── datablitz.ts   # Datablitz scraper
│       │   ├── pcworx.ts      # PCWorx scraper
│       │   └── bermor.ts      # Bermor scraper
│       ├── index.ts           # Scraper orchestrator
│       ├── normalizer.ts      # Data normalization
│       └── README.md          # Scraper documentation
├── .env.example               # Environment variables template
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier configuration
├── .dockerignore             # Docker ignore rules
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker container definition
├── DEPLOYMENT.md             # Deployment guide
├── next.config.ts            # Next.js configuration
├── package.json              # NPM dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── PROJECT_STRUCTURE.md      # This file
├── README.md                 # Project overview
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── vercel.json               # Vercel deployment configuration
```

## Key Files

### Configuration Files

| File | Purpose |
|------|---------|
| [package.json](package.json) | Dependencies and scripts |
| [tsconfig.json](tsconfig.json) | TypeScript compiler settings |
| [next.config.ts](next.config.ts) | Next.js framework configuration |
| [tailwind.config.ts](tailwind.config.ts) | Tailwind CSS styling |
| [prisma/schema.prisma](prisma/schema.prisma) | Database schema |
| [.env.example](.env.example) | Environment variables template |

### Core Application

| File | Purpose |
|------|---------|
| [src/app/layout.tsx](src/app/layout.tsx) | Root layout with navigation |
| [src/app/page.tsx](src/app/page.tsx) | Home page with product listings |
| [src/app/builder/page.tsx](src/app/builder/page.tsx) | PC Builder interface |
| [src/lib/prisma.ts](src/lib/prisma.ts) | Database client singleton |
| [src/lib/utils.ts](src/lib/utils.ts) | Utility functions |

### API Routes

| Route | Purpose |
|-------|---------|
| [/api/products](src/app/api/products/route.ts) | Product listing and search |
| [/api/scrape](src/app/api/scrape/route.ts) | Trigger scraping jobs |

### Scraper Module

| File | Purpose |
|------|---------|
| [src/scraper/index.ts](src/scraper/index.ts) | Scraping orchestrator |
| [src/scraper/normalizer.ts](src/scraper/normalizer.ts) | Data normalization |
| [src/scraper/retailers/datablitz.ts](src/scraper/retailers/datablitz.ts) | Datablitz scraper |
| [src/scraper/retailers/pcworx.ts](src/scraper/retailers/pcworx.ts) | PCWorx scraper |
| [src/scraper/retailers/bermor.ts](src/scraper/retailers/bermor.ts) | Bermor scraper |

### UI Components

| Component | Purpose |
|-----------|---------|
| [ProductList.tsx](src/features/ui/components/ProductList.tsx) | Product grid with filters |
| [PCBuilder.tsx](src/features/pc-builder/components/PCBuilder.tsx) | PC configuration tool |

### Deployment

| File | Purpose |
|------|---------|
| [Dockerfile](Dockerfile) | Container image definition |
| [docker-compose.yml](docker-compose.yml) | Local Docker setup |
| [vercel.json](vercel.json) | Vercel deployment config |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment instructions |

## Database Schema

### Models

1. **Product** - Base product information
2. **ProductListing** - Retailer-specific listings
3. **PCBuild** - User PC configurations
4. **PCBuildItem** - Components in builds
5. **ScrapeJob** - Scraping job logs

### Enums

- **PartCategory**: CPU, GPU, MOTHERBOARD, RAM, etc.
- **Retailer**: DATABLITZ, PCWORX, BERMOR
- **StockStatus**: IN_STOCK, OUT_OF_STOCK, LIMITED_STOCK, UNKNOWN

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run scrape` | Run scraper manually |

## Environment Variables

Required environment variables (see [.env.example](.env.example)):

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - development/production
- `NEXT_PUBLIC_APP_URL` - Public application URL
- `CRON_SECRET` - Secret for cron authentication
- `SCRAPER_TIMEOUT` - Scraper timeout in ms
- `SCRAPER_MAX_RETRIES` - Max retry attempts
- `SCRAPER_USER_AGENT` - Custom user agent

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - UI library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database

### Scraping
- **Cheerio** - Fast HTML parsing
- **Axios** - HTTP client
- **Playwright** - Browser automation (optional)

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static typing

### Deployment
- **Vercel** - Serverless deployment platform
- **Docker** - Containerization
- **Railway** - Alternative hosting

## Development Workflow

1. **Setup**: Run `./scripts/setup.sh` or follow manual steps
2. **Database**: Initialize with `npm run db:push`
3. **Seed Data**: Run `tsx scripts/seed.ts` (optional)
4. **Development**: Use `npm run dev`
5. **Type Check**: Run `npm run type-check` before commits
6. **Build**: Test production build with `npm run build`
7. **Deploy**: Push to Vercel or deploy via Docker

## API Flow

```
Client Request
    ↓
Next.js API Route
    ↓
Prisma Client
    ↓
PostgreSQL Database
    ↓
JSON Response
```

## Scraping Flow

```
Cron Job / Manual Trigger
    ↓
API Route (/api/scrape)
    ↓
Scraper Index (src/scraper/index.ts)
    ↓
Retailer Scraper (datablitz/pcworx/bermor)
    ↓
Normalizer (categorize, clean data)
    ↓
Database (upsert products & listings)
    ↓
Update Price Ranges
```

## Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line Length**: 90 characters (recommended)
- **Format**: Prettier
- **Lint**: ESLint with Next.js config

## Contributing

1. Follow TypeScript strict mode
2. Use Prisma for all database operations
3. Add proper error handling
4. Write descriptive commit messages
5. Update documentation when needed
6. Test locally before pushing

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Scraper Module Docs](src/scraper/README.md)
- [API Documentation](src/features/api/README.md)
- [PC Builder Docs](src/features/pc-builder/README.md)
