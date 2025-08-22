import { test, expect } from '@playwright/test'

test.describe('Supplier Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete supplier onboarding KYC flow', async ({ page }) => {
    // Navigate to supplier onboarding
    await page.click('text=List Products')
    await expect(page).toHaveURL('/supplier/onboarding')
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Supplier Onboarding')
    
    // Step 1: Basic Information
    await page.fill('input[name=\"businessName\"]', 'Tech Automation Solutions Pvt Ltd')
    await page.selectOption('select[name=\"businessType\"]', 'private_limited')
    await page.fill('input[name=\"registrationNumber\"]', 'U72900KA2020PTC123456')
    await page.fill('input[name=\"gstin\"]', '29AABCT1234A1Z5')
    await page.fill('input[name=\"panNumber\"]', 'AABCT1234A')
    
    await page.click('button:has-text(\"Next: Contact Details\")')
    
    // Step 2: Contact Information
    await expect(page.locator('text=Contact Information')).toBeVisible()
    
    await page.fill('input[name=\"authorizedSignatory\"]', 'Rajesh Kumar')
    await page.fill('input[name=\"designation\"]', 'Managing Director')
    await page.fill('input[name=\"email\"]', 'rajesh@techautomation.com')
    await page.fill('input[name=\"phone\"]', '+91-9876543210')
    await page.fill('input[name=\"alternatePhone\"]', '+91-9876543211')
    
    await page.click('button:has-text(\"Next: Business Details\")')
    
    // Step 3: Business Details
    await expect(page.locator('text=Business Details')).toBeVisible()
    
    await page.fill('textarea[name=\"businessAddress\"]', '123 Industrial Area, Peenya, Bangalore, Karnataka, 560058')
    await page.fill('input[name=\"yearsInBusiness\"]', '8')
    await page.fill('input[name=\"employeeCount\"]', '45')
    await page.fill('input[name=\"annualRevenue\"]', '15')
    
    // Add certifications
    await page.click('button:has-text(\"Add Certification\")')
    await page.fill('input[name=\"certifications.0\"]', 'ISO 9001:2015')
    await page.click('button:has-text(\"Add Certification\")')
    await page.fill('input[name=\"certifications.1\"]', 'CE Marking')
    
    // Add business references
    await page.click('button:has-text(\"Add Reference\")')
    await page.fill('input[name=\"references.0\"]', 'Tata Motors Ltd')
    await page.click('button:has-text(\"Add Reference\")')
    await page.fill('input[name=\"references.1\"]', 'Mahindra & Mahindra')
    
    await page.click('button:has-text(\"Next: Financial Information\")')
    
    // Step 4: Financial Information
    await expect(page.locator('text=Financial Information')).toBeVisible()
    
    await page.fill('input[name=\"bankAccount.bankName\"]', 'HDFC Bank')
    await page.fill('input[name=\"bankAccount.accountNumber\"]', '50100123456789')
    await page.fill('input[name=\"bankAccount.ifscCode\"]', 'HDFC0001234')
    await page.fill('input[name=\"bankAccount.beneficiaryName\"]', 'Tech Automation Solutions Pvt Ltd')
    
    // Upload documents (mock file uploads)
    const panFile = page.locator('input[name=\"panDocument\"]')
    await panFile.setInputFiles({
      name: 'pan_certificate.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock PAN document content')
    })
    
    const gstFile = page.locator('input[name=\"gstDocument\"]')
    await gstFile.setInputFiles({
      name: 'gst_certificate.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock GST document content')
    })
    
    const bankFile = page.locator('input[name=\"bankDocument\"]')
    await bankFile.setInputFiles({
      name: 'bank_statement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock bank statement content')
    })
    
    // Accept terms and conditions
    await page.check('input[name=\"acceptTerms\"]')
    await page.check('input[name=\"consentDataProcessing\"]')
    
    // Submit KYC application
    await page.click('button:has-text(\"Submit KYC Application\")')
    
    // Should show success message
    await expect(page.locator('text=KYC Application Submitted')).toBeVisible()
    await expect(page.locator('text=under review')).toBeVisible()
    
    // Should have option to proceed to catalog upload
    await expect(page.locator('text=Upload Product Catalog')).toBeVisible()
  })

  test('should validate required fields in KYC form', async ({ page }) => {
    await page.click('text=List Products')
    
    // Try to proceed without filling required fields
    await page.click('button:has-text(\"Next: Contact Details\")')
    
    // Should show validation messages
    await expect(page.locator('text=Business name is required')).toBeVisible()
    await expect(page.locator('text=Business type is required')).toBeVisible()
    await expect(page.locator('text=Valid GSTIN is required')).toBeVisible()
  })

  test('should validate GSTIN format', async ({ page }) => {
    await page.click('text=List Products')
    
    // Enter invalid GSTIN
    await page.fill('input[name=\"gstin\"]', 'INVALID_GSTIN')
    await page.fill('input[name=\"businessName\"]', 'Test Business')
    await page.selectOption('select[name=\"businessType\"]', 'private_limited')
    
    await page.click('button:has-text(\"Next: Contact Details\")')
    
    // Should show GSTIN validation error
    await expect(page.locator('text=Invalid GSTIN format')).toBeVisible()
    
    // Enter valid GSTIN
    await page.fill('input[name=\"gstin\"]', '29AABCT1234A1Z5')
    await page.click('button:has-text(\"Next: Contact Details\")')
    
    // Should proceed to next step
    await expect(page.locator('text=Contact Information')).toBeVisible()
  })

  test('should handle file upload validations', async ({ page }) => {
    await page.click('text=List Products')
    
    // Navigate to financial information step
    await page.fill('input[name=\"businessName\"]', 'Test Company')
    await page.selectOption('select[name=\"businessType\"]', 'private_limited')
    await page.fill('input[name=\"gstin\"]', '29AABCT1234A1Z5')
    await page.fill('input[name=\"panNumber\"]', 'AABCT1234A')
    await page.click('button:has-text(\"Next: Contact Details\")')
    
    await page.fill('input[name=\"authorizedSignatory\"]', 'Test User')
    await page.fill('input[name=\"email\"]', 'test@example.com')
    await page.fill('input[name=\"phone\"]', '+91-9876543210')
    await page.click('button:has-text(\"Next: Business Details\")')
    
    await page.fill('textarea[name=\"businessAddress\"]', 'Test Address')
    await page.fill('input[name=\"yearsInBusiness\"]', '5')
    await page.click('button:has-text(\"Next: Financial Information\")')
    
    // Try to upload invalid file type
    const invalidFile = page.locator('input[name=\"panDocument\"]')
    await invalidFile.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Invalid file type')
    })
    
    // Should show file type validation error
    await expect(page.locator('text=Only PDF files are allowed')).toBeVisible()
    
    // Upload valid file
    await invalidFile.setInputFiles({
      name: 'pan_certificate.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Valid PDF content')
    })
    
    // Error should disappear
    await expect(page.locator('text=Only PDF files are allowed')).not.toBeVisible()
  })

  test('should show progress indicator throughout the flow', async ({ page }) => {
    await page.click('text=List Products')
    
    // Check initial progress
    await expect(page.locator('[data-testid=\"progress-step-1\"]')).toHaveClass(/active/)
    await expect(page.locator('[data-testid=\"progress-step-2\"]')).not.toHaveClass(/active/)
    
    // Complete step 1
    await page.fill('input[name=\"businessName\"]', 'Test Company')
    await page.selectOption('select[name=\"businessType\"]', 'private_limited')
    await page.fill('input[name=\"gstin\"]', '29AABCT1234A1Z5')
    await page.fill('input[name=\"panNumber\"]', 'AABCT1234A')
    await page.click('button:has-text(\"Next: Contact Details\")')
    
    // Check progress updated
    await expect(page.locator('[data-testid=\"progress-step-1\"]')).toHaveClass(/completed/)
    await expect(page.locator('[data-testid=\"progress-step-2\"]')).toHaveClass(/active/)
  })

  test('should allow going back to previous steps', async ({ page }) => {
    await page.click('text=List Products')
    
    // Complete first step
    await page.fill('input[name=\"businessName\"]', 'Test Company')
    await page.selectOption('select[name=\"businessType\"]', 'private_limited')
    await page.fill('input[name=\"gstin\"]', '29AABCT1234A1Z5')
    await page.fill('input[name=\"panNumber\"]', 'AABCT1234A')
    await page.click('button:has-text(\"Next: Contact Details\")')
    
    // Go back to previous step
    await page.click('button:has-text(\"Back\")')
    
    // Should be back at basic information with form data preserved
    await expect(page.locator('text=Basic Information')).toBeVisible()
    await expect(page.locator('input[name=\"businessName\"]')).toHaveValue('Test Company')
    await expect(page.locator('input[name=\"gstin\"]')).toHaveValue('29AABCT1234A1Z5')
  })

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/supplier/onboarding')
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible()
    
    // Check that forms are usable on mobile
    await page.fill('input[name=\"businessName\"]', 'Mobile Test Company')
    await page.selectOption('select[name=\"businessType\"]', 'private_limited')
    
    // Verify mobile navigation works
    await page.click('button:has-text(\"Next: Contact Details\")')
    await expect(page.locator('text=Contact Information')).toBeVisible()
  })
})"