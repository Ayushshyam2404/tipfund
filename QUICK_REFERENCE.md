# FundForge Quick Reference

Fast reference guide for common development, testing, and deployment tasks.

## Development Commands

```bash
# Start development server
npm run dev

# Start production server (after build)
npm run start

# Build project
npm run build

# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Tests
npm test                    # Run all tests once
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage report
```

## Testing Checklist (Before Commit)

```bash
npm run lint && npm run type-check && npm test && npm run build
```

## Database Commands

```bash
# Create migration
npx prisma migrate dev --name "description"

# Deploy migrations
npx prisma migrate deploy

# Reset database (development)
npx prisma migrate reset

# View database
npx prisma studio

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed
```

## Deployment

### Via Vercel CLI
```bash
npm install -g vercel          # Install if needed
vercel --prod                  # Deploy to production
vercel status                  # Check deployment status
```

### Via GitHub (Automatic)
```bash
git push origin main           # Auto-deploys via Actions
```

## Environment Setup

```bash
# Create local env file
cp .env.example .env.local

# List all environment variables
grep "^" .env.example

# Pull from Vercel (if deployed)
vercel env pull
```

## Troubleshooting

```bash
# Clear cache
npm cache clean --force
rm -rf node_modules
npm install

# Clear TypeScript cache
npx tsc --listFiles

# Clear Jest cache
npm test -- --clearCache

# Check Node version (need 20.11.0+)
node --version

# List all npm scripts
npm run
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes (runs linter if hooks installed)
git commit -m "feat: description"

# Push to GitHub (triggers CI/CD)
git push origin feature/your-feature

# Merge to main (auto-deploys to production)
git checkout main
git merge feature/your-feature
git push origin main
```

## Production Deployments

```bash
# Full pre-deployment check
npm run lint && npm run type-check && npm test -- --coverage && npm run build

# Deploy
vercel --prod

# Verify deployment
curl https://your-app.vercel.app/api/health
```

## Local Production Build

```bash
# Build production bundle
npm run build

# Start production server locally
npm run start

# Test at http://localhost:3000
```

## Debugging

```bash
# Debug mode
DEBUG=* npm run dev

# VSCode debug (add to .vscode/launch.json)
# {
#   "type": "node",
#   "request": "launch",
#   "name": "Jest Debug",
#   "program": "${workspaceFolder}/node_modules/.bin/jest",
#   "args": ["--runInBand"],
#   "console": "integratedTerminal"
# }
```

## API Testing

```bash
# List all API endpoints
grep -r "export" app/api

# Test API locally
curl http://localhost:3000/api/projects

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/projects
```

## Performance Analysis

```bash
# Build analysis
npm run build -- --analyze

# Check bundle size
npm run build

# Generate lighthouse report
npm run build && npm run start
# Then use Chrome DevTools Lighthouse tab
```

## Useful Links

- **Local Dev**: http://localhost:3000
- **Production**: https://your-app.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/your-org/tipfund
- **Supabase Console**: https://app.supabase.io
- **Database Studio**: `npx prisma studio`

## File Locations

| Item | Location |
|------|----------|
| Pages | `app/` |
| Components | `components/` |
| API Routes | `app/api/` |
| Database Schema | `prisma/schema.prisma` |
| Tests | `__tests__/` |
| Utilities | `lib/` |
| Hooks | `hooks/` |
| Configuration | Root directory |
| Styles | `app/globals.css` |

## Common Errors

| Error | Solution |
|-------|----------|
| Module not found | Clear cache: `npm cache clean --force` |
| Port 3000 in use | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| TypeScript errors | Run: `npm run type-check` |
| Tests failing | Run: `npm test -- --clearCache` |
| Build fails | Check: `npm run lint` then `npm run type-check` |
| Database error | Verify: `DATABASE_URL` in `.env.local` |

## Important Reminders

- Always lint and type-check before committing
- Run full test suite before pushing
- Never commit sensitive credentials
- Use `.env.local` for local development
- Keep dependencies updated
- Review deployment logs after each deployment
- Monitor error logs in production

## Weekly Maintenance

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix

# Review package.json for outdated versions
npm outdated
```

## Key Information

- **Node Version**: 20.11.0+
- **Database**: PostgreSQL 14+
- **Framework**: Next.js 16.2.2
- **Test Coverage**: 50% minimum
- **Lighthouse Target**: 75% minimum
- **Uptime Target**: 99.9%

## Documentation Files

- `README.md` - Platform overview
- `DEPLOYMENT.md` - Detailed deployment guide
- `TESTING.md` - Testing guide
- `PRODUCTION_CHECKLIST.md` - Pre-launch checklist
- `QUICK_REFERENCE.md` - This file
- `.env.example` - All environment variables

## Getting Help

1. Check relevant documentation file above
2. Search GitHub Issues
3. Review error logs: `vercel logs`
4. Check test output: `npm test -- --verbose`
5. Consult deployment logs in Vercel dashboard

---

**Last Updated**: Phase 11
**Version**: 1.0.0
