# IRMA Marketplace - Testing Documentation

## Overview

This document outlines the comprehensive testing strategy for the IRMA Industrial Robotics Marketplace, covering unit tests, integration tests, and end-to-end testing.

## Unit Tests - Matching Engine

### Test Coverage

The matching engine (`packages/lib/src/matching.ts`) has been extensively tested with 100+ test cases covering:

#### Core Functionality
- **Constructor and Configuration**: Default weights, custom weight configuration
- **Main Matching Function**: Top N results, filtering, sorting, empty product lists
- **Result Structure**: Complete match result validation with all required fields

#### Scoring Algorithm Tests

1. **Spec Score Computation (40% weight)**
   - Payload capacity matching (exact, above, below requirements)
   - Throughput considerations for high-volume applications
   - Technical specifications (certifications, safety ratings, connectivity)
   - Edge cases with missing payload data

2. **Integration Score Computation (20% weight)**
   - PLC compatibility (Siemens, ABB, Rockwell controllers)
   - Fieldbus integration (Profinet, EtherCAT protocols)
   - Standalone system handling
   - Connectivity feature rewards

3. **Lead Time Score Computation (10% weight)**
   - Perfect scores for fast delivery
   - Penalty calculations for delays
   - Extreme delay handling (graceful degradation)

4. **Service Coverage Score (15% weight)**
   - Service team availability
   - Remote diagnostics capabilities
   - Location proximity considerations
   - Training inclusion bonuses

5. **Warranty Score (10% weight)**
   - Warranty period rewards (12, 24, 36 months)
   - MTTR (Mean Time To Repair) considerations
   - Service level differentiation

6. **TCO Clarity Score (5% weight)**
   - Price range tightness rewards
   - Operating cost transparency
   - Maintenance cost visibility

#### Advanced Testing Scenarios

- **Weight Configuration Impact**: Tests verify that different weight configurations properly prioritize different scoring criteria
- **Edge Cases**: Minimal product data, extreme values, zero/negative inputs
- **Match Result Generation**: Realistic commercial options, delivery details, SLA commitments

### Test Implementation

```typescript
// Example test structure
describe('MatchingEngine', () => {
  describe('Spec Score Computation', () => {
    it('should give high score for exact payload match', async () => {
      // Test implementation with assertions
    })
  })
})
```

### Running Unit Tests

```bash
# From packages/lib directory
npm test

# With coverage
npm run test:coverage
```

## Integration Tests

### API Endpoint Testing
- Authentication flows with Supabase
- Database operations with Prisma
- Razorpay payment processing
- CSV upload validation and processing

### Database Integration
- Prisma schema validation
- JSONB querying with GIN indexes
- Transaction handling for complex operations

## End-to-End Tests (Playwright)

### Core User Flows

1. **Buyer Journey**
   - Navigate to homepage
   - Fill intake form with requirements
   - Review matched products and quotes
   - Complete payment process
   - Receive order confirmation

2. **Supplier Journey**
   - Complete KYC onboarding
   - Upload product catalog via CSV
   - Manage product listings (draft → live)
   - Receive and process orders
   - Track payouts and settlements

### Test Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
})
```

## Test Data Management

### Seed Data
- Comprehensive product catalog with diverse specifications
- Multiple supplier organizations with verified KYC
- Sample buyer organizations with completed intakes
- Payment history and transaction records

### Test Environment Setup
1. Isolated test database with fresh migrations
2. Mock Razorpay webhooks for payment testing
3. Supabase auth emulator for user management
4. Email testing with temporary providers

## Performance Testing

### Matching Engine Performance
- Sub-100ms response times for product matching
- Memory usage optimization for large product catalogs
- Concurrent request handling validation

### Database Performance
- Query optimization with proper indexing
- JSONB field performance with GIN indexes
- Connection pooling efficiency

## Quality Assurance Checklist

### Code Quality
- [ ] ESLint configuration with TypeScript rules
- [ ] Prettier formatting consistency
- [ ] TypeScript strict mode compliance
- [ ] Zero compilation warnings/errors

### Security Testing
- [ ] Authentication bypass attempts
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection with proper sanitization
- [ ] CSRF token validation

### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Keyboard navigation support
- [ ] Color contrast compliance (WCAG 2.1)
- [ ] Focus management for complex forms

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
```

### Test Coverage Targets
- **Unit Tests**: 90%+ coverage for critical business logic
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Complete user journeys validated

## Test Maintenance

### Regular Updates
- Update test data monthly with new product categories
- Refresh API mocks when external services change
- Review and update performance benchmarks quarterly

### Documentation
- Maintain test case documentation in Notion/Confluence
- Update test plans for new feature releases
- Share testing results in team retrospectives

## Known Limitations

1. **Vitest Configuration**: Type resolution requires proper workspace setup with pnpm
2. **Mock Services**: Razorpay webhook testing requires ngrok for local development
3. **Performance Tests**: Large-scale matching tests require production-like data volumes

## Next Steps

1. **Load Testing**: Implement Artillery.js for high-volume matching scenarios
2. **Visual Regression Testing**: Add Percy/Chromatic for UI consistency
3. **API Contract Testing**: Implement Pact.js for supplier integration APIs
4. **Chaos Engineering**: Test system resilience with controlled failures

---

*Last Updated: December 2024*
*Maintained by: IRMA Engineering Team*