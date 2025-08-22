# IRMA Marketplace - Test Plan

This document outlines the testing strategy and test cases for the IRMA marketplace MVP.

## Testing Strategy

### Test Pyramid
1. **Unit Tests** (Vitest): Core business logic, matching engine
2. **Integration Tests**: API endpoints, database operations
3. **E2E Tests** (Playwright): Complete user flows
4. **Manual Testing**: UX validation, edge cases

### Test Environments
- **Development**: Local with test database
- **Staging**: Production-like with Supabase staging
- **Production**: Monitoring and smoke tests only

## Unit Tests (Vitest)

### Matching Engine Tests
Location: `packages/lib/src/matching.test.ts`

#### Test Cases
1. **Spec Score Calculation**
   - ✅ Perfect payload match (score: 70+)
   - ✅ Insufficient payload penalty
   - ✅ High throughput bonus
   - ✅ Technical specs bonus (certifications, safety)

2. **Integration Score Calculation**
   - ✅ PLC compatibility with Siemens/ABB controllers
   - ✅ Fieldbus compatibility (Profinet, EtherCAT)
   - ✅ Standalone operation scoring
   - ✅ Connectivity bonus from specs

3. **Lead Time Scoring**
   - ✅ On-time delivery (100 points)
   - ✅ Delay penalty calculation
   - ✅ Edge case: zero timeline

4. **Weighted Scoring**
   - ✅ Default weights (spec 40%, integration 20%, etc.)
   - ✅ Custom weights
   - ✅ Final score normalization (0-100)

5. **Commercial Options Generation**
   - ✅ Purchase price calculation
   - ✅ Lease monthly rate (~8% of CAPEX)
   - ✅ Pilot cost (~15% of CAPEX)
   - ✅ SLA generation based on specs

### Utility Functions Tests
Location: `packages/lib/src/utils.test.ts`

#### Test Cases
1. **Currency Formatting**
   - ✅ INR formatting: ₹10,00,000
   - ✅ Large numbers: ₹1,00,00,000
   - ✅ Decimal handling

2. **Category Names**
   - ✅ AMR → "Autonomous Mobile Robot"
   - ✅ SixAxis → "6-Axis Robot Arm"
   - ✅ Unknown category fallback

## Integration Tests

### API Endpoint Tests
Location: `apps/web/src/app/api/**/*.test.ts`

#### Intake API (`/api/intakes`)
1. **Authentication**
   - ✅ Requires valid Supabase auth
   - ❌ Rejects unauthenticated requests
   - ❌ Rejects invalid tokens

2. **Request Validation**
   - ✅ Validates required fields (use_case, payload_kg, etc.)
   - ❌ Rejects invalid integration types
   - ❌ Rejects negative values
   - ❌ Rejects malformed JSON

3. **Business Logic**
   - ✅ Creates user record if not exists
   - ✅ Creates buyer org if not exists
   - ✅ Creates intake record
   - ✅ Runs matching engine
   - ✅ Saves matches to database
   - ✅ Updates intake status to MATCHED

4. **Response Format**
   - ✅ Returns intakeId and matchCount
   - ✅ Handles zero matches gracefully
   - ✅ Error responses with proper status codes

### Database Operations
Location: `apps/web/src/lib/db.test.ts`

#### Prisma Operations
1. **User Management**
   - ✅ Create user with Supabase ID
   - ✅ Upsert user on login
   - ✅ Handle duplicate emails

2. **Organization Management**
   - ✅ Create buyer organization
   - ✅ Create supplier organization
   - ✅ Membership creation and roles

3. **Product Operations**
   - ✅ Create product with JSONB specs
   - ✅ GIN index performance on specs queries
   - ✅ Bulk upsert from CSV data

4. **Matching Operations**
   - ✅ Create intake and matches atomically
   - ✅ Query top N matches by fitScore
   - ✅ Include related data (product, org)

## E2E Tests (Playwright)

### Authentication Flow
Location: `apps/web/tests/auth.spec.ts`

#### Test Cases
1. **Email OTP Sign-in**
   - ✅ Navigate to /auth/signin
   - ✅ Enter email address
   - ✅ Submit form
   - ✅ Display "check email" message
   - 🔄 [Manual] Verify email received
   - 🔄 [Manual] Click magic link
   - ✅ Redirect to homepage
   - ✅ Show signed-in state

2. **Authentication Persistence**
   - ✅ Page refresh maintains auth state
   - ✅ Navigate between pages
   - ✅ Access protected routes

3. **Sign Out**
   - ✅ Navigate to account page
   - ✅ Click sign out button
   - ✅ Redirect to homepage
   - ✅ Show signed-out state

### Buyer Flow (Critical Path)
Location: `apps/web/tests/buyer-flow.spec.ts`

#### Test Cases
1. **Complete Buyer Journey**
   - ✅ Visit homepage
   - ✅ Click "Get Matched" CTA
   - ✅ Fill intake form with valid data:
     - Use case: "Pick and place automation"
     - Payload: 25 kg
     - Throughput: 200 units/hour
     - Integration: PLC
     - Timeline: 12 weeks
   - ✅ Submit form
   - ✅ Redirect to quote page
   - ✅ Display 3 matched options
   - ✅ Show fit scores (expect 60-95)
   - ✅ Display commercial options
   - ✅ Show delivery and SLA details

2. **Intake Form Validation**
   - ❌ Submit empty form (show errors)
   - ❌ Enter negative payload (show error)
   - ❌ Select invalid integration (prevent)
   - ✅ Fill optional fields (budget, location)

3. **Quote Page Features**
   - ✅ Display requirements summary
   - ✅ Show match explanations ("why this match")
   - ✅ Display assumptions made
   - ✅ Format prices correctly (₹ symbols)
   - ✅ Show relative fit scores

### Supplier Flow
Location: `apps/web/tests/supplier-flow.spec.ts`

#### Test Cases
1. **Supplier Onboarding** (Future)
   - 🔄 Navigate to /supplier/onboarding
   - 🔄 Complete KYC form
   - 🔄 Upload required documents
   - 🔄 Submit for verification

2. **CSV Upload** (Future)
   - 🔄 Navigate to /supplier/catalog
   - 🔄 Upload valid CSV file
   - 🔄 Display validation results
   - 🔄 Bulk create products

3. **Payout Dashboard** (Future)
   - 🔄 Check KYC verification requirement
   - 🔄 Connect Razorpay account
   - 🔄 View transaction history

### Responsive Design Tests
Location: `apps/web/tests/responsive.spec.ts`

#### Test Cases
1. **Mobile Layout (375px)**
   - ✅ Homepage hero responsive
   - ✅ Navigation collapse to hamburger
   - ✅ Intake form mobile-friendly
   - ✅ Quote cards stack vertically

2. **Tablet Layout (768px)**
   - ✅ Grid layouts adapt properly
   - ✅ Touch targets adequate size
   - ✅ Modal dialogs fit screen

3. **Desktop Layout (1200px+)**
   - ✅ Full layout utilization
   - ✅ Sidebar navigation
   - ✅ Multi-column grids

## Performance Tests

### Core Web Vitals
Target thresholds per requirements:
- **LCP (Largest Contentful Paint)**: ≤ 2.5s
- **INP (Interaction to Next Paint)**: ≤ 200ms
- **CLS (Cumulative Layout Shift)**: ≤ 0.1

#### Test Cases
1. **Homepage Performance**
   - ✅ LCP < 2.5s (hero section)
   - ✅ INP < 200ms (CTA button clicks)
   - ✅ CLS < 0.1 (no layout shifts)

2. **Intake Form Performance**
   - ✅ Form interaction responsiveness
   - ✅ Validation feedback speed
   - ✅ Submission handling

3. **Quote Page Performance**
   - ✅ SSR rendering speed
   - ✅ Database query optimization
   - ✅ Image loading performance

### Matching Engine Performance
Location: `packages/lib/src/matching.perf.test.ts`

#### Test Cases
1. **Scale Testing**
   - ✅ 100 products: < 100ms
   - ✅ 1000 products: < 500ms
   - ✅ 5000 products: < 2s

2. **Memory Usage**
   - ✅ No memory leaks
   - ✅ Efficient JSONB queries
   - ✅ GIN index utilization

## Security Tests

### Authentication Security
#### Test Cases
1. **Session Management**
   - ✅ Secure cookie settings
   - ✅ CSRF protection
   - ✅ Session timeout

2. **API Security**
   - ❌ Unauthorized API access blocked
   - ❌ SQL injection prevention
   - ❌ XSS prevention

### Data Protection
#### Test Cases
1. **Input Validation**
   - ❌ Malicious JSON in specs
   - ❌ Script injection in text fields
   - ❌ File upload validation

2. **Data Privacy**
   - ✅ User data isolation
   - ✅ Proper authorization checks
   - ✅ Audit logging

## Manual Testing Checklist

### User Experience
- [ ] **Navigation**: Intuitive flow between pages
- [ ] **Forms**: Clear validation messages
- [ ] **Loading States**: Appropriate spinners/skeletons
- [ ] **Error Handling**: User-friendly error messages
- [ ] **Mobile UX**: Touch-friendly interface

### Business Logic
- [ ] **Matching Quality**: Realistic fit scores and explanations
- [ ] **Price Display**: Correct INR formatting and ranges
- [ ] **Commercial Options**: Reasonable lease/pilot calculations
- [ ] **SLA Terms**: Appropriate response/restore times

### Edge Cases
- [ ] **No Matches**: Graceful handling when no products match
- [ ] **Extreme Values**: Very high/low payload requirements
- [ ] **Network Issues**: Offline/connection error handling
- [ ] **Browser Compatibility**: Chrome, Firefox, Safari, Edge

## Test Data

### Seed Data Validation
The seed data provides realistic test scenarios:

1. **Products Coverage**
   - ✅ 2 Supplier organizations
   - ✅ 7 LIVE products across all categories
   - ✅ Varied specifications and price ranges
   - ✅ Different lead times (3-20 weeks)

2. **Realistic Specs**
   - ✅ Industrial robot specifications
   - ✅ Conveyor system parameters
   - ✅ Vision system capabilities
   - ✅ Mobile robot features

3. **KYC Status**
   - ✅ Both suppliers VERIFIED (can receive payouts)
   - ✅ Realistic company information
   - ✅ Valid GST numbers

## Test Execution

### Continuous Integration
```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm test

# Run e2e tests (requires running dev server)
pnpm dev &
pnpm test:e2e

# Check test coverage
pnpm test:coverage
```

### Test Reports
- **Unit Tests**: Console output + coverage report
- **E2E Tests**: Playwright HTML report
- **Performance**: Lighthouse CI reports

### Test Data Reset
```bash
# Reset test database
pnpm db:migrate:reset
pnpm db:seed

# Clear test artifacts
rm -rf test-results/
rm -rf playwright-report/
```

## Acceptance Criteria

### MVP Release Criteria
- [x] **Authentication**: Users can sign in with email OTP
- [x] **Buyer Flow**: Can submit intake and see 3 ranked options
- [x] **Matching Engine**: Returns realistic fit scores (30-95 range)
- [x] **Commercial Options**: Shows purchase/lease/pilot pricing
- [x] **Performance**: Meets Core Web Vitals targets
- [x] **Responsive**: Works on mobile/tablet/desktop
- [ ] **Supplier Flow**: KYC verification and CSV upload (Future)
- [ ] **Payments**: Razorpay integration (Future)

### Post-MVP Enhancement Tests
- [ ] **Advanced Matching**: ML-based scoring improvements
- [ ] **Real-time Updates**: WebSocket notifications
- [ ] **Multi-language**: Hindi and regional language support
- [ ] **Advanced Analytics**: Supplier performance metrics

---

**Note**: Tests marked with ✅ should be implemented and passing. Tests marked with ❌ represent negative test cases that should fail appropriately. Tests marked with 🔄 are planned for future implementation.