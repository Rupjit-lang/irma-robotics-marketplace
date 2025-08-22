# IRMA Marketplace - Setup Guide

Industrial Robotics Marketplace - B2B vertical marketplace for automation and robotics solutions in India.

## Prerequisites

- Node.js 18+ and pnpm 8+
- PostgreSQL database (Supabase recommended)
- Supabase project for auth and database
- Razorpay account for payments (sandbox for development)

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd irma-marketplace
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Edit .env.local with your actual credentials
   ```

3. **Database Setup**
   ```bash
   cd apps/web
   pnpm db:migrate
   pnpm db:seed
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

   Visit http://localhost:3000

## Environment Configuration

### Database URLs

- **Production Runtime**: Use transaction pooler (port 6543) with pgbouncer
  ```
  DATABASE_URL="postgresql://user:pass@host:6543/db?sslmode=require&pgbouncer=true&connection_limit=1"
  ```

- **Migrations/CI**: Use session pooler (port 5432)
  ```
  PRISMA_MIGRATE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
  ```

### Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from Settings > API
3. Set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

### Razorpay Configuration (Sandbox)

1. Create Razorpay account and enable Route
2. Get test credentials from Dashboard
3. Set in `.env.local`:
   ```
   RAZORPAY_KEY_ID="rzp_test_your_key"
   RAZORPAY_KEY_SECRET="your_secret"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key"
   ```

## Architecture

### Monorepo Structure
```
irma-marketplace/
├── apps/
│   └── web/                 # Next.js 14 app
├── packages/
│   └── lib/                 # Shared matching engine
├── docs/                    # Documentation
└── prisma/                  # Database schema & migrations
```

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (email OTP/magic links)
- **Payments**: Razorpay Route (split payouts)
- **Testing**: Vitest (unit), Playwright (e2e)

## Key Features

### Buyer Flow
1. Submit requirements via `/buy` form
2. AI matching engine finds top 3 options
3. View quotes with fit scores on `/quote/[id]`
4. Multiple commercial options: Purchase/Lease/Pilot

### Supplier Flow
1. Complete KYC verification
2. Upload product catalog via CSV
3. Receive matched buyer inquiries
4. Get split payouts via Razorpay Route

### Matching Engine
- Weighted scoring algorithm (spec 40%, integration 20%, lead 10%, service 15%, warranty 10%, TCO 5%)
- JSONB specs optimization with GIN indexes
- Configurable weights for different use cases

## Development Commands

```bash
# Development
pnpm dev                     # Start dev server
pnpm build                   # Build for production
pnpm start                   # Start production server

# Database
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed with sample data
pnpm db:studio              # Open Prisma Studio

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e              # Run e2e tests
pnpm lint                   # Lint all packages
pnpm format                 # Format code

# Packages
pnpm build:packages         # Build shared packages
```

## Database Schema

### Core Models
- **User**: Auth users from Supabase
- **Org**: Buyer/Supplier organizations
- **Membership**: User-Org relationships with roles
- **Product**: Supplier catalog with JSONB specs
- **Intake**: Buyer requirements submissions
- **Match**: AI-generated product matches with scores
- **KYC**: Supplier verification status

### Key Relationships
- Users belong to Orgs via Memberships
- Products belong to Supplier Orgs
- Intakes generate Matches with Products
- KYC gates supplier listing/payout capabilities

## Production Deployment

### Environment Variables
```bash
# Production database URLs
DATABASE_URL="postgresql://..."          # Transaction pooler
PRISMA_MIGRATE_URL="postgresql://..."    # Session pooler for migrations

# Supabase production
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Razorpay production
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
```

### CI/CD Pipeline
- Use PRISMA_MIGRATE_URL for migrations in CI
- Run `pnpm db:seed` after migrations
- Build and deploy web app

### Performance Considerations
- Use transaction pooler URLs in production
- Enable GIN indexes on Product.specs
- Implement Redis caching for matching results
- Use CDN for static assets

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Ensure correct pooler URLs for runtime vs migrations
   - Check SSL requirements: `?sslmode=require`

2. **Auth Issues**
   - Verify Supabase URLs and keys
   - Check middleware.ts configuration

3. **Matching Engine**
   - Validate intake data against schema
   - Check product status = 'LIVE'
   - Verify JSONB spec structure

4. **Build Errors**
   - Install dependencies: `pnpm install`
   - Build packages first: `pnpm build:packages`

### Logs and Debugging
- Check browser console for client errors
- Review Next.js server logs
- Use Prisma Studio for database inspection
- Monitor Supabase auth logs

## Support

- Review this documentation
- Check sample seed data for examples
- Run test suite for validation
- Contact development team for issues

---

**Next Steps**: See TESTPLAN.md for testing guidance and CSV_FORMAT.md for supplier catalog specifications.