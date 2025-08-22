# 🤖 IRMA - Industrial Robotics Marketplace

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/irma-marketplace&env=DATABASE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,RAZORPAY_KEY_ID,NEXT_PUBLIC_RAZORPAY_KEY_ID&envDescription=Required%20environment%20variables%20for%20IRMA%20marketplace&project-name=irma-marketplace&repository-name=irma-marketplace)

> **India's First B2B Industrial Robotics Marketplace**  
> Connecting manufacturers with verified automation suppliers through AI-powered matching

## 🌟 Overview

IRMA is a comprehensive B2B marketplace platform specifically designed for India's industrial automation sector. It connects buyers seeking robotics solutions with verified suppliers through an intelligent matching algorithm.

### 🎯 Key Features

- **🤖 AI-Powered Matching** - Sophisticated algorithm matching buyers with optimal suppliers
- **🏭 Supplier Onboarding** - Complete KYC verification and catalog management
- **💳 Integrated Payments** - Razorpay Route with automatic supplier payouts (85/15 split)
- **📱 Mobile-First Design** - Responsive UI optimized for all devices
- **🔒 Enterprise Security** - Supabase Auth with role-based access control
- **📊 Real-time Analytics** - Performance tracking and match optimization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Email OTP/Magic Links)
- **Payments**: Razorpay Route for split payouts
- **UI Components**: shadcn/ui component library
- **Testing**: Vitest (unit), Playwright (e2e)
- **Deployment**: Vercel with automatic deployments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Supabase project
- Razorpay account

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/irma-marketplace.git
cd irma-marketplace

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your credentials

# Setup database
cd apps/web
npx prisma migrate dev
npx prisma db seed

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### 🌐 Deploy to Vercel

1. **One-Click Deploy**: Click the Vercel button above
2. **Manual Deploy**: Follow the [deployment guide](./VERCEL_DEPLOY.md)

## 📋 Project Structure

```
irma-marketplace/
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   └── lib/         # Utilities
│       └── prisma/          # Database schema
├── packages/
│   └── lib/                 # Shared utilities
│       ├── src/
│       │   ├── matching.ts  # AI matching engine
│       │   └── razorpay.ts  # Payment utilities
├── docs/                    # Documentation
└── tests/                   # Test suites
```

## 🎯 Core Features

### For Buyers
- **Smart Requirements Capture** - Detailed form for automation needs
- **AI-Powered Matching** - Get top 3 supplier recommendations
- **Transparent Pricing** - Purchase, lease, and pilot options
- **Secure Payments** - Razorpay integration with buyer protection

### For Suppliers  
- **KYC Verification** - 4-step onboarding with document verification
- **Catalog Management** - CSV upload for bulk product listings
- **Automatic Matching** - AI connects you with relevant buyers
- **Fast Payouts** - 85% revenue share with 24-hour transfers

### Platform Features
- **Multi-tenant Architecture** - Separate buyer/supplier organizations
- **Role-based Access Control** - Admin, user, and guest permissions
- **Comprehensive Analytics** - Match rates, conversion tracking
- **Mobile Optimization** - Perfect experience on all devices

## 📊 Matching Algorithm

The AI matching engine considers multiple factors:

- **Specifications (40%)** - Payload, reach, speed, technical specs
- **Integration (20%)** - PLC compatibility, fieldbus support
- **Lead Time (10%)** - Delivery timeline vs requirements
- **Service Coverage (15%)** - Geographic availability, support
- **Warranty (10%)** - MTTR, service level agreements
- **TCO Clarity (5%)** - Price transparency, operating costs

## 🔐 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."
PRISMA_MIGRATE_URL="postgresql://..."

# Authentication (Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Payments (Razorpay)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
ROUTE_WEBHOOK_SECRET="..."

# Application
NEXT_PUBLIC_APP_URL="https://irma-marketplace.vercel.app"
```

## 🧪 Testing

```bash
# Unit tests (Matching engine)
cd packages/lib
pnpm test

# E2E tests (Full workflows) 
cd apps/web
pnpm test:e2e

# Type checking
pnpm type-check
```

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for real user experience
- **Bundle Size**: <100KB initial load
- **Response Times**: <100ms for matching algorithm

## 🛡️ Security Features

- **Authentication**: Supabase Auth with email verification
- **Authorization**: Row-level security (RLS) policies
- **Payment Security**: PCI-compliant via Razorpay
- **Data Protection**: DPDP Act 2023 compliance
- **XSS Prevention**: Content Security Policy headers

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md) - Complete development setup
- [Deployment Guide](./VERCEL_DEPLOY.md) - Production deployment
- [Testing Guide](./docs/TESTING.md) - Testing strategies
- [CSV Format Guide](./docs/CSV_FORMAT.md) - Supplier catalog format

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Supabase** - Backend-as-a-Service platform  
- **Vercel** - Deployment and hosting
- **Razorpay** - Payment processing for India
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

For support and questions:
- **Email**: support@irma.co.in
- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/irma-marketplace/issues)

---

**Built with ❤️ for India's Industrial Automation Future**