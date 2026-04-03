# FundForge Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Testing](#testing)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Vercel Deployment](#vercel-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Tools
- Node.js 20.11.0+ (recommended)
- npm or yarn
- Git
- Vercel CLI (for local testing)
- PostgreSQL 14+ (local development)

### Required Accounts
- Supabase (database + auth)
- GitHub (OAuth + issues)
- Vercel (hosting)
- GitHub (for Actions CI/CD)

## Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/tipfund.git
cd tipfund
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `GITHUB_ID` & `GITHUB_SECRET`: GitHub OAuth credentials
- `GITHUB_TOKEN`: GitHub personal access token

### 4. Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Type Check
```bash
npm run type-check
```

### Lint Code
```bash
npm run lint
```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code coverage > 50%
- [ ] All commits meaningful and descriptive

### Functionality Testing
- [ ] User authentication works (GitHub OAuth)
- [ ] Project creation functional
- [ ] Funding flow complete
- [ ] Bidding system operational
- [ ] Real-time updates working
- [ ] Settlement calculations correct
- [ ] Admin panel accessible
- [ ] Mobile responsive on multiple devices

### Security
- [ ] All environment variables set
- [ ] API keys rotated if needed
- [ ] Database backups configured
- [ ] SSL/TLS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] No sensitive data in logs
- [ ] Auth tokens properly validated

### Performance
- [ ] Lighthouse score > 75
- [ ] Build time acceptable
- [ ] No console warnings
- [ ] Lazy loading implemented
- [ ] Images optimized
- [ ] CSS/JS minimized

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment steps documented
- [ ] Environment variables documented

## Vercel Deployment

### 1. Connect to Vercel

Option A: Using Vercel Dashboard
```bash
# Visit https://vercel.com/new
# Select GitHub repository
# Import project
```

Option B: Using Vercel CLI
```bash
vercel link
```

### 2. Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GITHUB_ID`
   - `GITHUB_SECRET`
   - `GITHUB_TOKEN`

### 3. Configure Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Node Version**: `20.11`

### 4. Deploy

Trigger deployment:
```bash
# Via CLI
vercel --prod

# Via Git push to main branch (automatic)
git push origin main
```

## Environment Configuration

### Production Environment Variables

Ensure these are set in Vercel:

```bash
# Database
DATABASE_URL=postgresql://user:password@prod-db:5432/tipfund

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# GitHub OAuth (Production App)
GITHUB_ID=your-prod-github-id
GITHUB_SECRET=your-prod-github-secret

# GitHub Token
GITHUB_TOKEN=your-prod-github-token

# Node Environment
NODE_ENV=production
```

### Staging Environment Setup

1. Create staging branch: `staging`
2. Configure staging environment in Vercel
3. Set staging-specific environment variables
4. Use staging for pre-production testing

## Post-Deployment

### 1. Verify Deployment
```bash
# Check deployment status
vercel status

# Visit production URL
open https://your-app.vercel.app
```

### 2. Run Smoke Tests
- [ ] Homepage loads
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Database queries succeed
- [ ] Real-time updates work
- [ ] Admin panel accessible

### 3. Monitor Performance
- Check Vercel Analytics
- Review Lighthouse scores
- Monitor error rates
- Check database performance

### 4. Enable Monitoring

Set up:
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Log aggregation (Papertrail, Loggly)

## Monitoring & Maintenance

### Daily Checks
- [ ] System status dashboard
- [ ] Error logs
- [ ] API health

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check security logs
- [ ] Verify backups
- [ ] Review user feedback

### Monthly Maintenance
- [ ] Update dependencies
- [ ] Review and optimize slow queries
- [ ] Check storage usage
- [ ] Rotate credentials
- [ ] Security audit

### Emergency Procedures

#### Rollback Deployment
```bash
# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Select previous deployment
# 3. Click "Promote to Production"

# Via CLI
vercel rollback
```

#### Database Recovery
```bash
# Check recent backups
pg_dump -h your-db-host -U user -d tipfund > backup.sql

# Restore if needed
psql -h your-db-host -U user -d tipfund < backup.sql
```

#### Emergency Maintenance Mode
Edit `public/maintenance.html` and deploy with:
```bash
vercel --prod --scope=your-team
```

## CI/CD Pipeline

GitHub Actions automatically:
1. Runs tests on every PR
2. Type-checks code
3. Runs linting
4. Builds project
5. Uploads coverage to Codecov
6. Deploys to production on merge to `main`

View pipeline status: `.github/workflows/ci-cd.yml`

## Troubleshooting

### Build Failing
- Check Node version: `node --version`
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`
- Check env vars: `vercel env pull`

### Database Connection Issues
- Verify DATABASE_URL format
- Check network access in PostgreSQL
- Ensure service role key is correct
- Check Supabase status page

### API Errors
- Review Vercel logs: `vercel logs`
- Check API keys configuration
- Verify CORS settings
- Test API endpoints locally

### Performance Issues
- Analyze Vercel Analytics
- Check database query performance
- Review Next.js build size
- Optimize images and assets

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [GitHub Issues](https://github.com/your-org/tipfund/issues)

## Success Metrics

After deployment, track:
- Uptime: > 99.9%
- Response time: < 500ms
- Error rate: < 0.1%
- Lighthouse score: > 85
- User satisfaction: > 4.5/5
