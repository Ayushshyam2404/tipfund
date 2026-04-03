# FundForge - Prediction Market & Project Funding Platform

A modern, production-ready prediction market platform built with Next.js 16, Supabase, and PostgreSQL. Enables transparent project funding through decentralized prediction markets and real-time settlement.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.11.0+
- PostgreSQL 14+
- npm/yarn
- Vercel account (for deployment)

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/tipfund.git
cd tipfund

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Database setup
npx prisma migrate deploy

# Start development server
npm run dev
```

Visit `http://localhost:3000`

### Build & Test

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build
npm run start
```

## 📋 Platform Overview

### Core Features

#### 🎯 Project Management
- Create and manage funding projects
- Set realistic funding goals
- Track project progress in real-time
- View detailed project metrics

#### 📈 Prediction Markets
- Users can place bids predicting project outcomes
- Flexible risk multipliers (0-100%)
- Real-time market depth
- Transparent settlement mechanism

#### 💰 Smart Funding
- Intelligent fund distribution
- Dynamic settlement calculations
- Automated bid payouts
- Transparent commission handling

#### ⚡ Real-Time Features
- Live project updates via Supabase subscriptions
- Real-time bid placement
- Instant settlement notifications
- Live dashboard statistics

#### 🔐 Secure Authentication
- GitHub OAuth integration
- Session management
- Protected API endpoints
- Role-based access control

#### 📱 Mobile-First Design
- Fully responsive design
- Touch-optimized interface
- 44px minimum touch targets
- Fast load times on mobile

#### 🎨 Admin Dashboard
- Platform statistics
- Settlement management
- System monitoring
- User administration

## 📁 Project Structure

```
tipfund/
├── app/                          # Next.js App Router
│   ├── api/                      # 10 REST API endpoints
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Dashboard pages
│   ├── (settlement)/             # Settlement pages
│   ├── (admin)/                  # Admin pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # 100+ React components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components
│   ├── layouts/                  # Layout wrappers
│   └── animations/               # Animated components
├── lib/                          # Utilities & helpers
│   ├── db.ts                     # Database calculations
│   ├── schemas.ts                # Zod validation schemas
│   └── supabase.ts               # Supabase client
├── hooks/                        # Custom React hooks
│   ├── useProjectSubscription    # Real-time projects
│   ├── useSettlement             # Settlement updates
│   └── useMobile*                # Mobile utilities
├── public/                       # Static assets
├── prisma/                       # Database schema
│   └── schema.prisma             # Entity definitions
├── __tests__/                    # Test files (31 tests)
│   ├── components/               # Component tests
│   └── lib/                      # Utility tests
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions pipeline
├── jest.config.ts                # Jest configuration
├── jest.setup.ts                 # Test environment setup
├── vercel.json                   # Vercel deployment config
├── DEPLOYMENT.md                 # Deployment guide
├── PRODUCTION_CHECKLIST.md       # Go-live checklist
└── README.md                     # This file
```

## 🗄️ Database Schema

### Core Entities

**Users**
- GitHub OAuth integration
- Profile information
- Role-based permissions

**Projects**
- Title, description, funding goal
- Created by, start/end dates
- Status tracking
- 1:M with Bids

**Bids**
- Amount, risk percentage
- Prediction (success/failure)
- User ID + Project ID
- Timestamps

**Settlements**
- Funding amount
- Payout calculations
- Settlement date
- Status (pending/completed)

### Key Calculations

```typescript
// Project Funding
fundingPercentage = totalBidAmount / fundingGoal
total = totalBidAmount + totalBidAmount * fundingPercentage

// Bid Payout (For Winner)
payout = riskMultiplier * 1.2 * totalWinnerAmount

// Bid Payout (For Loser)
payout = (100 - riskMultiplier) / 100 * totalLoserAmount
```

## 🔌 API Endpoints (10 Total)

### Authentication
- `POST /api/auth/callback` - GitHub OAuth callback
- `GET /api/auth/user` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project

### Bids
- `POST /api/bids` - Place bid
- `GET /api/bids/[id]` - Get bid details

### Settlements
- `GET /api/settlements` - List settlements
- `POST /api/settlements` - Calculate settlement

**All endpoints require**: Bearer token in `Authorization` header

## 🎨 Design System

### Brutalist Aesthetics
- Bold, geometric shapes
- High contrast
- Minimal decoration
- Strong typography

### Component Library
- BrutalButton (4 variants, 3 sizes)
- BrutalInput (with validation)
- BrutalCard (flexible containers)
- Badge (5 status types)
- Various layouts (Stack, Grid, etc.)

### Animations
- Framer Motion throughout
- HoverScaleWrapper for interactivity
- StaggerContainer for lists
- CelebrationAnimation for milestones
- Smooth page transitions

### Colors
- Primary: #000000 (black)
- Secondary: #FFFFFF (white)
- Accent: #FF6B35 (orange)
- Status: Green (success), Red (danger), Yellow (warning)

## 📊 Real-Time Features

### Subscription Hooks
```typescript
// Watch project changes
const { project, loading } = useProjectSubscription(projectId)

// Watch settlement updates
const { settlement, loading } = useSettlementSubscription(settlementId)
```

Auto-cleanup on unmount. No manual unsubscribe needed.

## 📱 Mobile Support

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Mobile Features
- Touch-optimized: 44px minimum targets
- Safe area handling (notch support)
- Hamburger navigation
- Gesture detection (swipe, long-press)
- Orientation handling
- Reduced animations option

## 🧪 Testing

### Test Coverage
- 31 unit test cases created
- Components: 13 tests (BrutalButton, Badge)
- Utilities: 18 tests (calculations, validation)

### Running Tests
```bash
# Run all tests
npm test

# Coverage report
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Mocking Strategy
- Next.js useRouter, usePathname, useSearchParams
- next/image (renders as img)
- Framer Motion (plain divs to avoid animation issues)

## 🚀 Deployment

### Quick Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or push to main branch (auto-deploys via GitHub Actions)
git push origin main
```

### Environment Setup
See `DEPLOYMENT.md` for complete setup instructions.

Key variables required:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_ID`, `GITHUB_SECRET`

### Pre-Launch Checklist
See `PRODUCTION_CHECKLIST.md` for complete 100-item verification list.

## 🔒 Security

### Authentication
- GitHub OAuth (secure)
- Session tokens validated on every API call
- Bearer token authentication
- CORS properly configured

### Database
- Prepared statements (Prisma)
- SQL injection protection
- Encrypted connections
- Role-based access control

### API
- Rate limiting (production recommended)
- Input validation (Zod schemas)
- Error message sanitization
- HTTPS only (production)

## 📈 Performance

### Optimizations
- Server-side rendering
- Static generation where possible
- Image optimization
- Code splitting
- CSS-in-JS optimization

### Metrics Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Lighthouse Score: > 85

## 🛠️ Development

### Code Style
- TypeScript strict mode
- ESLint rules enforced
- Prettier formatting
- Husky pre-commit hooks (optional)

### Debugging
```bash
# Debug mode
DEBUG=* npm run dev

# Check TypeScript
npm run type-check

# Lint check
npm run lint

# Build diagnostics
npm run build
```

## 📚 Documentation

- `DEPLOYMENT.md` - Complete deployment guide
- `PRODUCTION_CHECKLIST.md` - Essential pre-launch checks
- `API.md` - API documentation (if available)
- GitHub Issues - Feature requests & bug reports

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Run tests: `npm test`
4. Type check: `npm run type-check`
5. Commit: `git commit -m "feat: your feature"`
6. Push: `git push origin feature/your-feature`
7. Create Pull Request

## 📞 Support

### Common Issues

**Database connection fails**
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Check network access

**Build errors**
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`
- Check Node version: `node --version`

**Tests failing**
- Clear jest cache: `npm test -- --clearCache`
- Check environment variables
- Verify mock setup

See `DEPLOYMENT.md` troubleshooting section for more.

## 📊 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.2.2 |
| Database | PostgreSQL 14+ |
| ORM | Prisma v6.19.3 |
| Auth | Supabase + GitHub OAuth |
| Real-time | Supabase Subscriptions |
| React 3D | React Three Fiber |
| Animations | Framer Motion |
| Styling | Tailwind CSS |
| Validation | Zod |
| Testing | Jest + React Testing Library |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

## 📜 License

Proprietary - TipFund Inc.

## 🎯 Key Metrics (Target)

- **Uptime**: > 99.9%
- **Response Time**: < 500ms
- **Error Rate**: < 0.1%
- **Lighthouse**: > 85
- **Test Coverage**: > 50%

## 🚦 Status

- ✅ Phase 1-10: Complete
- ✅ Phase 11: Testing & Deployment infrastructure created
- 🚀 Ready for production deployment

---

**Last Updated**: Phase 11 - Testing & Deployment
**Version**: 1.0.0
**Maintainer**: Your Team Name
