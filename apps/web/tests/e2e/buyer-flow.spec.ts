import { test, expect } from '@playwright/test'

test.describe('Buyer Flow - Intake to Quote', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/')
  })

  test('should complete buyer intake flow and view quotes', async ({ page }) => {
    // Navigate to buyer flow
    await page.click('text=Get Matched')
    await expect(page).toHaveURL('/buy')
    
    // Verify page title and form elements
    await expect(page.locator('h1')).toContainText('Tell Us About Your Requirements')
    
    // Fill out intake form
    await page.selectOption('select[name=\"use_case\"]', 'Material Handling')
    await page.fill('input[name=\"payload_kg\"]', '25')
    await page.fill('input[name=\"throughput_per_hr\"]', '100')
    await page.selectOption('select[name=\"space_constraint\"]', 'Compact')
    await page.selectOption('select[name=\"timeline_weeks\"]', '12')
    await page.selectOption('select[name=\"integration_existing\"]', 'New Installation')
    await page.selectOption('select[name=\"budget_range\"]', '10-25L')
    
    // Fill contact information
    await page.fill('input[name=\"contact_name\"]', 'John Doe')
    await page.fill('input[name=\"contact_email\"]', 'john@example.com')
    await page.fill('input[name=\"contact_phone\"]', '+91-9876543210')
    await page.fill('input[name=\"company_name\"]', 'Test Manufacturing Ltd')
    await page.fill('input[name=\"company_gstin\"]', '27AABCU9603R1ZM')
    
    // Submit form
    await page.click('button[type=\"submit\"]')
    
    // Should redirect to quote page
    await expect(page).toHaveURL(/\\/quote\\/[a-zA-Z0-9-]+/)
    
    // Verify quote page elements
    await expect(page.locator('h1')).toContainText('Your Equipment Matches')
    await expect(page.locator('text=Based on your requirements')).toBeVisible()
    
    // Check for requirements summary
    await expect(page.locator('text=Material Handling')).toBeVisible()
    await expect(page.locator('text=25 kg')).toBeVisible()
    await expect(page.locator('text=100/hr')).toBeVisible()
    
    // Should show matches (assuming seed data exists)
    const matches = page.locator('[data-testid=\"match-card\"]')
    await expect(matches.first()).toBeVisible()
    
    // Check for fit score
    await expect(page.locator('text=Fit Score')).toBeVisible()
    
    // Check for commercial options
    await expect(page.locator('text=Purchase (CAPEX)')).toBeVisible()
    await expect(page.locator('text=Lease (OpEx)')).toBeVisible()
    
    // Check for \"Buy Now\" button on first match
    const buyNowButton = page.locator('text=Buy Now').first()
    await expect(buyNowButton).toBeVisible()
  })

  test('should validate required fields in intake form', async ({ page }) => {
    await page.click('text=Get Matched')
    
    // Try to submit empty form
    await page.click('button[type=\"submit\"]')
    
    // Should show validation messages
    await expect(page.locator('text=Please select a use case')).toBeVisible()
    await expect(page.locator('text=Contact name is required')).toBeVisible()
    await expect(page.locator('text=Valid email is required')).toBeVisible()
  })

  test('should show different options based on use case selection', async ({ page }) => {
    await page.click('text=Get Matched')
    
    // Select different use cases and verify form updates
    await page.selectOption('select[name=\"use_case\"]', 'Welding')
    // Verify welding-specific fields appear
    await expect(page.locator('text=Weld Quality Requirements')).toBeVisible()
    
    await page.selectOption('select[name=\"use_case\"]', 'Painting')
    // Verify painting-specific fields appear
    await expect(page.locator('text=Paint Type')).toBeVisible()
  })

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/buy')
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible()
    
    // Check that form is still usable on mobile
    await page.selectOption('select[name=\"use_case\"]', 'Assembly')
    await page.fill('input[name=\"payload_kg\"]', '10')
    
    // Verify form submission works on mobile
    await page.fill('input[name=\"contact_name\"]', 'Mobile User')
    await page.fill('input[name=\"contact_email\"]', 'mobile@example.com')
    await page.fill('input[name=\"contact_phone\"]', '+91-9876543210')
    await page.fill('input[name=\"company_name\"]', 'Mobile Test Co')
    await page.fill('input[name=\"company_gstin\"]', '27AABCU9603R1ZM')
    
    await page.click('button[type=\"submit\"]')
    await expect(page).toHaveURL(/\\/quote\\/[a-zA-Z0-9-]+/)
  })

  test('should show no matches when criteria are very specific', async ({ page }) => {
    await page.click('text=Get Matched')
    
    // Fill with very specific/unusual requirements
    await page.selectOption('select[name=\"use_case\"]', 'Other')
    await page.fill('input[name=\"payload_kg\"]', '5000') // Very high payload
    await page.fill('input[name=\"throughput_per_hr\"]', '1000')
    await page.selectOption('select[name=\"timeline_weeks\"]', '2') // Very short timeline
    
    await page.fill('input[name=\"contact_name\"]', 'Specific User')
    await page.fill('input[name=\"contact_email\"]', 'specific@example.com')
    await page.fill('input[name=\"contact_phone\"]', '+91-9876543210')
    await page.fill('input[name=\"company_name\"]', 'Specific Needs Ltd')
    await page.fill('input[name=\"company_gstin\"]', '27AABCU9603R1ZM')
    
    await page.click('button[type=\"submit\"]')
    
    // Should show no matches message
    await expect(page.locator('text=No matches found')).toBeVisible()
    await expect(page.locator('text=Try New Search')).toBeVisible()
  })

  test('should allow navigation back to modify search', async ({ page }) => {
    // Complete a search first
    await page.click('text=Get Matched')
    
    await page.selectOption('select[name=\"use_case\"]', 'Assembly')
    await page.fill('input[name=\"payload_kg\"]', '15')
    await page.fill('input[name=\"contact_name\"]', 'Test User')
    await page.fill('input[name=\"contact_email\"]', 'test@example.com')
    await page.fill('input[name=\"contact_phone\"]', '+91-9876543210')
    await page.fill('input[name=\"company_name\"]', 'Test Company')
    await page.fill('input[name=\"company_gstin\"]', '27AABCU9603R1ZM')
    
    await page.click('button[type=\"submit\"]')
    await expect(page).toHaveURL(/\\/quote\\/[a-zA-Z0-9-]+/)
    
    // Navigate back to new search
    await page.click('text=New Search')
    await expect(page).toHaveURL('/buy')
    
    // Form should be reset
    await expect(page.locator('select[name=\"use_case\"]')).toHaveValue('')
    await expect(page.locator('input[name=\"payload_kg\"]')).toHaveValue('')
  })
})"