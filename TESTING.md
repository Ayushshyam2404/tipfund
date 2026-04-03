# FundForge Testing Guide

Comprehensive testing guide for development, CI/CD, and pre-deployment verification.

## Table of Contents
1. [Test Suite Overview](#test-suite-overview)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Test Coverage](#test-coverage)
5. [Debugging Tests](#debugging-tests)
6. [Continuous Integration](#continuous-integration)
7. [Pre-Deployment Testing](#pre-deployment-testing)

## Test Suite Overview

### Test Files (31 Total Tests)

**Component Tests (13 tests)**
- `__tests__/components/BrutalButton.test.tsx` (7 tests)
  - Render with text
  - Variant classes (primary, secondary, danger)
  - Size classes (sm, md, lg)
  - Click event handling
  - Disabled state
  - Custom className

- `__tests__/components/Badge.test.tsx` (6 tests)
  - Render with text
  - Variant types (success, danger, warning, info)
  - Custom className

**Utility Tests (18 tests)**

- `__tests__/lib/db.test.ts` (8 tests)
  - `calculateProjectFunding()` function
    - Standard percentage calculation
    - 100% funding edge case
    - Zero funding goal
    - Over-funding scenario
  - `calculateBidPayout()` function
    - Winning bid with 50% risk
    - Winning bid with 0% risk
    - Winning bid with 100% risk
    - Losing bid payout

- `__tests__/lib/schemas.test.ts` (10 tests)
  - `projectSchema` validation (5 tests)
    - Valid project data
    - Missing title
    - Negative funding goal
    - Short title validation
    - Long title validation
  - `bidSchema` validation (5 tests)
    - Valid bid data
    - Negative bid amount
    - Invalid risk percentage (>100)
    - Invalid prediction enum
    - Missing fields

### Configuration Files

- `jest.config.ts` - Jest configuration
- `jest.setup.ts` - Test environment setup with mocks

## Running Tests

### Basic Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm test -- --watch

# Run specific test file
npm test -- BrutalButton.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="variant"
```

### Coverage Analysis

```bash
# Generate coverage report
npm test -- --coverage

# Coverage by file
npm test -- --coverage --coverageReporters=text

# HTML coverage report (opens in browser)
npm test -- --coverage --coverageReporters=html
# Then open: coverage/index.html
```

### Coverage Thresholds

Current configuration requires:
- **Branches**: 50% minimum
- **Functions**: 50% minimum
- **Lines**: 50% minimum
- **Statements**: 50% minimum

View progress with: `npm test -- --coverage`

### Debugging

#### Run Single Test File with Output
```bash
npm test -- BrutalButton.test.tsx --verbose
```

#### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### Log Output During Tests
```typescript
// In test file
test('example', () => {
  console.log('Debug info:', someVariable)
  expect(true).toBe(true)
})
```

## Writing Tests

### Test Structure

```typescript
import { render, screen } from '@testing-library/react'
import { BrutalButton } from '@/components/ui/BrutalButton'

describe('BrutalButton', () => {
  it('renders with text', () => {
    render(<BrutalButton>Click me</BrutalButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies variant class', () => {
    const { container } = render(
      <BrutalButton variant="secondary">Test</BrutalButton>
    )
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-white')
  })
})
```

### Mocking Best Practices

#### Mock Next.js Navigation (jest.setup.ts)
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))
```

#### Mock Framer Motion (jest.setup.ts)
```typescript
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => children,
    button: ({ children }: any) => children,
    // ... other motion components
  },
}))
```

#### Mock Next.js Image
```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))
```

### Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react'

test('async operation', async () => {
  render(<MyComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

### Testing Database Functions

```typescript
import { calculateProjectFunding } from '@/lib/db'

describe('calculateProjectFunding', () => {
  it('calculates funding with commission', () => {
    const result = calculateProjectFunding(100, 1000)
    expect(result).toBe(110) // 100 + 10% commission
  })
})
```

### Testing Validation Schemas

```typescript
import { projectSchema } from '@/lib/schemas'

describe('projectSchema', () => {
  it('validates correct data', () => {
    const result = projectSchema.safeParse({
      title: 'My Project',
      description: 'A great project',
      fundingGoal: 5000,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid data', () => {
    const result = projectSchema.safeParse({
      title: 'A', // Too short
      fundingGoal: -100, // Negative
    })
    expect(result.success).toBe(false)
  })
})
```

## Test Coverage

### Current Coverage

Run to see exact numbers:
```bash
npm test -- --coverage
```

Expected output includes:
- Statements: 50%+
- Branches: 50%+
- Functions: 50%+
- Lines: 50%+

### Improving Coverage

Add tests for:
1. **Uncovered functions** - Focus on utility functions first
2. **Edge cases** - Boundary conditions, null values, empty states
3. **Error paths** - Invalid inputs, exceptions
4. **Integration points** - Component + hook interactions

### Coverage Reports

```bash
# View HTML report
npm test -- --coverage --coverageReporters=html && open coverage/index.html

# Text summary
npm test -- --coverage

# Detailed by file
npm test -- --coverage --verbose
```

## Debugging Tests

### Common Issues

#### Tests Timeout
```typescript
// Increase timeout for specific test
test('slow operation', async () => {
  // test code
}, 10000) // 10 second timeout
```

#### Mock Not Working
```bash
# Clear jest cache
npm test -- --clearCache

# Then run tests
npm test
```

#### Unexpected Token Error
- Ensure `jest.config.ts` is properly configured
- Check that `jest.setup.ts` is referenced in config
- Verify TypeScript preset in jest.config.ts

#### Animation-Related Failures
- Framer Motion is mocked in `jest.setup.ts`
- Components should render without animation
- Use `jest.mocked()` to verify mock calls

### Debug Mode

```bash
# Run single test with detailed output
npm test -- BrutalButton.test.tsx --verbose

# Watch single file
npm test -- BrutalButton.test.tsx --watch

# Show all test names without running
npm test -- --listTests
```

## Continuous Integration

### GitHub Actions Workflow

Located: `.github/workflows/ci-cd.yml`

Runs on:
- Every push to `main` and `develop`
- Every pull request to `main` and `develop`

Steps:
1. Checkout code
2. Setup Node.js (18.x and 20.x)
3. Cache npm dependencies
4. Install dependencies
5. Run linter (`npm run lint`)
6. Type check (`npm run type-check`)
7. Run tests (`npm test`)
8. Build project (`npm run build`)
9. Upload coverage to Codecov
10. Deploy to Vercel (main branch only)

### Local CI Simulation

```bash
# Run all CI steps locally
npm run lint
npm run type-check
npm test
npm run build
```

## Pre-Deployment Testing

### Complete Test Checklist

Before deploying to production:

**Unit Tests**
- [ ] `npm test` passes
- [ ] All 31 tests passing
- [ ] Coverage > 50%
- [ ] No failing tests

**Type Safety**
- [ ] `npm run type-check` passes
- [ ] Zero TypeScript errors
- [ ] All types properly defined

**Code Quality**
- [ ] `npm run lint` passes
- [ ] No linting errors
- [ ] Code follows style guide

**Build Verification**
- [ ] `npm run build` succeeds
- [ ] No build warnings
- [ ] Build output size acceptable
- [ ] Production build runs: `npm run start`

**Functional Testing**

Critical flows to test manually:
- [ ] User can signup with GitHub
- [ ] User can create a project
- [ ] User can place a bid
- [ ] Settlement calculation works
- [ ] Admin dashboard loads
- [ ] Mobile interface responsive
- [ ] Real-time updates working

**Performance Testing**
- [ ] Lighthouse score > 75
- [ ] Page load time < 2s
- [ ] API response time < 200ms
- [ ] Database queries optimized

**Mobile Testing**
- [ ] iOS Safari ✓
- [ ] Chrome Mobile ✓
- [ ] Touch interactions work
- [ ] Responsive design correct

### Pre-Deployment Script

Create `scripts/pre-deploy.sh`:
```bash
#!/bin/bash
set -e

echo "Running pre-deployment tests..."

echo "1. Linting..."
npm run lint

echo "2. Type checking..."
npm run type-check

echo "3. Running tests..."
npm test -- --coverage

echo "4. Building..."
npm run build

echo "✅ All pre-deployment checks passed!"
```

Run with:
```bash
chmod +x scripts/pre-deploy.sh
./scripts/pre-deploy.sh
```

## Test Examples

### Component Test Example

```typescript
// __tests__/components/BrutalButton.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrutalButton } from '@/components/ui/BrutalButton'

describe('BrutalButton', () => {
  it('renders with text', () => {
    render(<BrutalButton>Click me</BrutalButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    const { container } = render(<BrutalButton>Test</BrutalButton>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-black')
  })

  it('applies secondary variant class', () => {
    const { container } = render(
      <BrutalButton variant="secondary">Test</BrutalButton>
    )
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-white')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<BrutalButton onClick={onClick}>Click me</BrutalButton>)
    
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('disables when disabled prop is true', () => {
    render(<BrutalButton disabled>Disabled</BrutalButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <BrutalButton className="custom-class">Test</BrutalButton>
    )
    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
  })
})
```

### Utility Test Example

```typescript
// __tests__/lib/db.test.ts
import { calculateProjectFunding, calculateBidPayout } from '@/lib/db'

describe('calculateProjectFunding', () => {
  it('calculates funding with 10% commission', () => {
    const result = calculateProjectFunding(100, 1000)
    expect(result).toBe(110)
  })

  it('handles edge case of 100% funding', () => {
    const result = calculateProjectFunding(1000, 1000)
    expect(result).toBe(1100)
  })

  it('handles zero funding goal', () => {
    const result = calculateProjectFunding(100, 0)
    expect(result).toBe(110)
  })
})

describe('calculateBidPayout', () => {
  it('calculates winning bid payout correctly', () => {
    const payout = calculateBidPayout(100, 50, true, 1000, 1000)
    expect(payout).toBeGreaterThan(0)
  })

  it('calculates losing bid payout correctly', () => {
    const payout = calculateBidPayout(100, 50, false, 1000, 1000)
    expect(payout).toBeGreaterThan(0)
  })
})
```

### Schema Test Example

```typescript
// __tests__/lib/schemas.test.ts
import { projectSchema, bidSchema } from '@/lib/schemas'

describe('projectSchema', () => {
  it('validates correct project data', () => {
    const result = projectSchema.safeParse({
      title: 'My Project',
      description: 'A description',
      fundingGoal: 5000,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing title', () => {
    const result = projectSchema.safeParse({
      description: 'A description',
      fundingGoal: 5000,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative funding goal', () => {
    const result = projectSchema.safeParse({
      title: 'My Project',
      description: 'A description',
      fundingGoal: -1000,
    })
    expect(result.success).toBe(false)
  })
})

describe('bidSchema', () => {
  it('validates correct bid data', () => {
    const result = bidSchema.safeParse({
      amount: 100,
      riskPercent: 50,
      prediction: 'success',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid prediction enum', () => {
    const result = bidSchema.safeParse({
      amount: 100,
      riskPercent: 50,
      prediction: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})
```

## Next Steps

After all tests pass:
1. Review coverage report
2. Identify uncovered code
3. Add tests for critical paths
4. Run full CI/CD pipeline
5. Deploy to staging
6. Run E2E tests
7. Deploy to production

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)
