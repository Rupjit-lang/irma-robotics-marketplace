/// <reference types="vitest/globals" />
import { MatchingEngine, DEFAULT_WEIGHTS, IntakeData, Product, MatchingWeights } from './matching'

describe('MatchingEngine', () => {
  let engine: MatchingEngine
  let mockIntake: IntakeData
  let mockProducts: Product[]

  beforeEach(() => {
    engine = new MatchingEngine()
    
    mockIntake = {
      use_case: 'Pick and place operations',
      payload_kg: 10,
      throughput_per_hr: 150,
      integration: 'PLC',
      timeline_weeks: 12,
      budget_range: '₹5-10 lakhs',
      location: 'Chennai',
      uptime_target_pct: 95
    }

    mockProducts = [
      {
        id: 'prod-1',
        orgId: 'org-1',
        category: 'SixAxis',
        title: 'KUKA KR 10 R1100-2',
        sku: 'KUKA-KR10-001',
        payloadKg: 10,
        reachMm: 1100,
        repeatabilityMm: 0.03,
        maxSpeedMps: 2.0,
        ipRating: 'IP54',
        controller: 'Siemens S7-1500',
        specs: {
          certifications: ['CE', 'ISO 9001'],
          safetyRating: 'high',
          connectivity: ['Profinet', 'Ethernet'],
          warrantyMonths: 24,
          mttrHours: 4,
          serviceTeam: true,
          remoteDiagnostics: true,
          reliabilityRating: 'high',
          prioritySupport: true,
          operatingCostINRPerYear: 50000,
          maintenanceCostINRPerYear: 30000
        },
        priceMinINR: 800000,
        priceMaxINR: 900000,
        leadTimeWeeks: 8,
        status: 'LIVE',
        org: {
          name: 'KUKA India',
          type: 'SUPPLIER'
        }
      },
      {
        id: 'prod-2',
        orgId: 'org-2',
        category: 'SCARA',
        title: 'Epson G10-A01',
        sku: 'EPSON-G10-001',
        payloadKg: 15,
        reachMm: 900,
        repeatabilityMm: 0.02,
        maxSpeedMps: 3.5,
        ipRating: 'IP65',
        controller: 'Epson RC700-A',
        specs: {
          certifications: ['CE'],
          safetyRating: 'medium',
          connectivity: ['EtherCAT'],
          warrantyMonths: 12,
          mttrHours: 6,
          serviceTeam: false,
          remoteDiagnostics: false
        },
        priceMinINR: 400000,
        priceMaxINR: 700000,
        leadTimeWeeks: 16,
        status: 'LIVE',
        org: {
          name: 'Epson India',
          type: 'SUPPLIER'
        }
      },
      {
        id: 'prod-3',
        orgId: 'org-3',
        category: 'AGV',
        title: 'MiR100 AGV',
        sku: 'MIR-100-001',
        payloadKg: 100,
        maxSpeedMps: 1.5,
        controller: 'MiR Fleet Controller',
        specs: {
          certifications: ['CE', 'FCC'],
          connectivity: ['WiFi', 'Ethernet'],
          warrantyMonths: 36,
          mttrHours: 2,
          serviceTeam: true,
          remoteDiagnostics: true
        },
        priceMinINR: 1500000,
        priceMaxINR: 1600000,
        leadTimeWeeks: 6,
        status: 'LIVE',
        org: {
          name: 'MiR India',
          type: 'SUPPLIER'
        }
      },
      {
        id: 'prod-4',
        orgId: 'org-4',
        category: 'SixAxis',
        title: 'Draft Robot',
        sku: 'DRAFT-001',
        payloadKg: 5,
        priceMinINR: 300000,
        priceMaxINR: 400000,
        leadTimeWeeks: 4,
        status: 'DRAFT', // Should be filtered out
        specs: {},
        org: {
          name: 'Draft Supplier',
          type: 'SUPPLIER'
        }
      }
    ]
  })

  describe('Constructor and Configuration', () => {
    it('should use default weights when none provided', () => {
      const engine = new MatchingEngine()
      expect(engine).toBeInstanceOf(MatchingEngine)
    })

    it('should accept custom weights', () => {
      const customWeights: MatchingWeights = {
        spec: 0.5,
        integration: 0.3,
        lead: 0.1,
        serviceCoverage: 0.05,
        warranty: 0.03,
        tcoClarity: 0.02
      }
      const engine = new MatchingEngine(customWeights)
      expect(engine).toBeInstanceOf(MatchingEngine)
    })
  })

  describe('matchProducts', () => {
    it('should return top 3 matches by default', async () => {
      const results = await engine.matchProducts(mockIntake, mockProducts)
      expect(results).toHaveLength(3)
      expect(results[0].fitScore).toBeGreaterThanOrEqual(results[1].fitScore)
      expect(results[1].fitScore).toBeGreaterThanOrEqual(results[2].fitScore)
    })

    it('should filter out non-LIVE products', async () => {
      const results = await engine.matchProducts(mockIntake, mockProducts)
      const productIds = results.map(r => r.productId)
      expect(productIds).not.toContain('prod-4') // DRAFT status product
    })

    it('should respect maxResults parameter', async () => {
      const results = await engine.matchProducts(mockIntake, mockProducts, 2)
      expect(results).toHaveLength(2)
    })

    it('should handle empty product list', async () => {
      const results = await engine.matchProducts(mockIntake, [])
      expect(results).toHaveLength(0)
    })

    it('should return all products when fewer than maxResults', async () => {
      const liveProducts = mockProducts.filter(p => p.status === 'LIVE')
      const results = await engine.matchProducts(mockIntake, mockProducts, 10)
      expect(results).toHaveLength(liveProducts.length)
    })
  })

  describe('Spec Score Computation', () => {
    it('should give high score for exact payload match', async () => {
      const exactMatch = { ...mockProducts[0], payloadKg: 10 } // Exact match
      const results = await engine.matchProducts(mockIntake, [exactMatch])
      expect(results[0].fitScore).toBeGreaterThan(70)
    })

    it('should give higher score for payload capacity above requirement', async () => {
      const higherCapacity = { ...mockProducts[0], payloadKg: 15 }
      const exactCapacity = { ...mockProducts[0], payloadKg: 10 }
      
      const higherResults = await engine.matchProducts(mockIntake, [higherCapacity])
      const exactResults = await engine.matchProducts(mockIntake, [exactCapacity])
      
      expect(higherResults[0].fitScore).toBeGreaterThanOrEqual(exactResults[0].fitScore)
    })

    it('should penalize insufficient payload capacity', async () => {
      const insufficient = { ...mockProducts[0], payloadKg: 5 } // Half required
      const sufficient = { ...mockProducts[0], payloadKg: 10 }
      
      const insuffResults = await engine.matchProducts(mockIntake, [insufficient])
      const suffResults = await engine.matchProducts(mockIntake, [sufficient])
      
      expect(insuffResults[0].fitScore).toBeLessThan(suffResults[0].fitScore)
    })

    it('should reward high-throughput products for high-throughput requirements', async () => {
      const highThroughputIntake = { ...mockIntake, throughput_per_hr: 200 }
      const fastRobot = { ...mockProducts[0], maxSpeedMps: 3.0 }
      const slowRobot = { ...mockProducts[0], maxSpeedMps: 1.0 }
      
      const fastResults = await engine.matchProducts(highThroughputIntake, [fastRobot])
      const slowResults = await engine.matchProducts(highThroughputIntake, [slowRobot])
      
      expect(fastResults[0].fitScore).toBeGreaterThan(slowResults[0].fitScore)
    })

    it('should reward products with certifications and safety features', async () => {
      const certified = { 
        ...mockProducts[0], 
        specs: { 
          certifications: ['CE', 'ISO 9001'], 
          safetyRating: 'high',
          connectivity: ['Profinet']
        }
      }
      const basic = { 
        ...mockProducts[0], 
        specs: {}
      }
      
      const certResults = await engine.matchProducts(mockIntake, [certified])
      const basicResults = await engine.matchProducts(mockIntake, [basic])
      
      expect(certResults[0].fitScore).toBeGreaterThan(basicResults[0].fitScore)
    })
  })

  describe('Integration Score Computation', () => {
    it('should give high score for PLC-compatible controllers', async () => {
      const plcIntake = { ...mockIntake, integration: 'PLC' as const }
      const siemensController = { ...mockProducts[0], controller: 'Siemens S7-1500' }
      const unknownController = { ...mockProducts[0], controller: 'Generic Controller' }
      
      const siemensResults = await engine.matchProducts(plcIntake, [siemensController])
      const unknownResults = await engine.matchProducts(plcIntake, [unknownController])
      
      expect(siemensResults[0].fitScore).toBeGreaterThan(unknownResults[0].fitScore)
    })

    it('should reward Fieldbus compatibility for Fieldbus integration', async () => {
      const fieldbusIntake = { ...mockIntake, integration: 'Fieldbus' as const }
      const profinetController = { ...mockProducts[0], controller: 'Profinet Gateway' }
      const basicController = { ...mockProducts[0], controller: 'Basic PLC' }
      
      const profinetResults = await engine.matchProducts(fieldbusIntake, [profinetController])
      const basicResults = await engine.matchProducts(fieldbusIntake, [basicController])
      
      expect(profinetResults[0].fitScore).toBeGreaterThan(basicResults[0].fitScore)
    })

    it('should handle Standalone integration requirement', async () => {
      const standaloneIntake = { ...mockIntake, integration: 'Standalone' as const }
      const results = await engine.matchProducts(standaloneIntake, [mockProducts[0]])
      
      expect(results[0].fitScore).toBeGreaterThan(0)
    })

    it('should reward connectivity features', async () => {
      const connected = { 
        ...mockProducts[0], 
        specs: { connectivity: ['Ethernet', 'WiFi'] }
      }
      const basic = { 
        ...mockProducts[0], 
        specs: {}
      }
      
      const connectedResults = await engine.matchProducts(mockIntake, [connected])
      const basicResults = await engine.matchProducts(mockIntake, [basic])
      
      expect(connectedResults[0].fitScore).toBeGreaterThan(basicResults[0].fitScore)
    })
  })

  describe('Lead Time Score Computation', () => {
    it('should give perfect score for lead time within requirement', async () => {
      const fastDelivery = { ...mockProducts[0], leadTimeWeeks: 8 } // Within 12 weeks
      const results = await engine.matchProducts(mockIntake, [fastDelivery])
      
      // Should contribute positively to overall score
      expect(results[0].fitScore).toBeGreaterThan(50)
    })

    it('should penalize longer lead times', async () => {
      const fast = { ...mockProducts[0], leadTimeWeeks: 6 }
      const slow = { ...mockProducts[0], leadTimeWeeks: 20 }
      
      const fastResults = await engine.matchProducts(mockIntake, [fast])
      const slowResults = await engine.matchProducts(mockIntake, [slow])
      
      expect(fastResults[0].fitScore).toBeGreaterThan(slowResults[0].fitScore)
    })

    it('should handle extreme lead time delays', async () => {
      const extremeDelay = { ...mockProducts[0], leadTimeWeeks: 52 } // 1 year
      const results = await engine.matchProducts(mockIntake, [extremeDelay])
      
      // Should still return a valid score, not negative
      expect(results[0].fitScore).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Service Coverage Score', () => {
    it('should reward service team availability', async () => {
      const withService = { 
        ...mockProducts[0], 
        specs: { 
          serviceTeam: true, 
          remoteDiagnostics: true,
          trainigIncluded: true 
        }
      }
      const withoutService = { 
        ...mockProducts[0], 
        specs: {}
      }
      
      const withResults = await engine.matchProducts(mockIntake, [withService])
      const withoutResults = await engine.matchProducts(mockIntake, [withoutService])
      
      expect(withResults[0].fitScore).toBeGreaterThan(withoutResults[0].fitScore)
    })

    it('should consider location proximity', async () => {
      const withLocation = { ...mockIntake, location: 'Mumbai' }
      const withoutLocation = { ...mockIntake, location: undefined }
      
      const withResults = await engine.matchProducts(withLocation, [mockProducts[0]])
      const withoutResults = await engine.matchProducts(withoutLocation, [mockProducts[0]])
      
      expect(withResults[0].fitScore).toBeGreaterThanOrEqual(withoutResults[0].fitScore)
    })
  })

  describe('Warranty Score', () => {
    it('should reward longer warranty periods', async () => {
      const longWarranty = { 
        ...mockProducts[0], 
        specs: { warrantyMonths: 36 }
      }
      const shortWarranty = { 
        ...mockProducts[0], 
        specs: { warrantyMonths: 6 }
      }
      
      const longResults = await engine.matchProducts(mockIntake, [longWarranty])
      const shortResults = await engine.matchProducts(mockIntake, [shortWarranty])
      
      expect(longResults[0].fitScore).toBeGreaterThan(shortResults[0].fitScore)
    })

    it('should reward better MTTR (Mean Time To Repair)', async () => {
      const fastRepair = { 
        ...mockProducts[0], 
        specs: { mttrHours: 2 }
      }
      const slowRepair = { 
        ...mockProducts[0], 
        specs: { mttrHours: 12 }
      }
      
      const fastResults = await engine.matchProducts(mockIntake, [fastRepair])
      const slowResults = await engine.matchProducts(mockIntake, [slowRepair])
      
      expect(fastResults[0].fitScore).toBeGreaterThan(slowResults[0].fitScore)
    })
  })

  describe('TCO Clarity Score', () => {
    it('should reward tight price ranges', async () => {
      const tightPricing = { 
        ...mockProducts[0], 
        priceMinINR: 800000, 
        priceMaxINR: 820000 // 2.5% spread
      }
      const loosePricing = { 
        ...mockProducts[0], 
        priceMinINR: 600000, 
        priceMaxINR: 1000000 // 66% spread
      }
      
      const tightResults = await engine.matchProducts(mockIntake, [tightPricing])
      const looseResults = await engine.matchProducts(mockIntake, [loosePricing])
      
      expect(tightResults[0].fitScore).toBeGreaterThan(looseResults[0].fitScore)
    })

    it('should reward operating cost transparency', async () => {
      const transparent = { 
        ...mockProducts[0], 
        specs: { 
          operatingCostINRPerYear: 50000,
          maintenanceCostINRPerYear: 30000
        }
      }
      const opaque = { 
        ...mockProducts[0], 
        specs: {}
      }
      
      const transparentResults = await engine.matchProducts(mockIntake, [transparent])
      const opaqueResults = await engine.matchProducts(mockIntake, [opaque])
      
      expect(transparentResults[0].fitScore).toBeGreaterThan(opaqueResults[0].fitScore)
    })
  })

  describe('Match Result Structure', () => {
    it('should include all required fields in match result', async () => {
      const results = await engine.matchProducts(mockIntake, [mockProducts[0]])
      const match = results[0]
      
      expect(match).toHaveProperty('productId')
      expect(match).toHaveProperty('fitScore')
      expect(match).toHaveProperty('why')
      expect(match).toHaveProperty('assumptions')
      expect(match).toHaveProperty('commercials')
      expect(match).toHaveProperty('deliveryInstall')
      expect(match).toHaveProperty('sla')
      
      expect(typeof match.fitScore).toBe('number')
      expect(Array.isArray(match.why)).toBe(true)
      expect(Array.isArray(match.assumptions)).toBe(true)
    })

    it('should generate meaningful explanations for high-scoring matches', async () => {
      const perfectMatch = {
        ...mockProducts[0],
        payloadKg: 10, // Exact match
        controller: 'Siemens S7-1500', // PLC compatible
        leadTimeWeeks: 6, // Faster than required
        specs: {
          serviceTeam: true,
          warrantyMonths: 24,
          certifications: ['CE', 'ISO 9001']
        }
      }
      
      const results = await engine.matchProducts(mockIntake, [perfectMatch])
      const match = results[0]
      
      expect(match.why.length).toBeGreaterThan(0)
      expect(match.why.some(reason => reason.includes('spec'))).toBe(true)
    })

    it('should generate appropriate assumptions', async () => {
      const incompleteProduct = {
        ...mockProducts[0],
        payloadKg: undefined // Missing payload data
      }
      const incompleteIntake = {
        ...mockIntake,
        location: undefined, // Missing location
        uptime_target_pct: undefined // Missing uptime target
      }
      
      const results = await engine.matchProducts(incompleteIntake, [incompleteProduct])
      const match = results[0]
      
      expect(match.assumptions.length).toBeGreaterThan(0)
      expect(match.assumptions.some(assumption => 
        assumption.includes('payload') || 
        assumption.includes('coverage') ||
        assumption.includes('uptime')
      )).toBe(true)
    })

    it('should generate realistic commercial options', async () => {
      const results = await engine.matchProducts(mockIntake, [mockProducts[0]])
      const commercials = results[0].commercials
      
      expect(commercials.purchase.priceINR).toBeGreaterThan(0)
      expect(commercials.lease.monthlyINR).toBeGreaterThan(0)
      expect(commercials.pilot.costINR).toBeGreaterThan(0)
      
      expect(commercials.lease.termMonths).toBe(36)
      expect(commercials.pilot.durationWeeks).toBe(8)
      
      // Lease should be reasonable percentage of purchase price
      const monthlyAsPercentOfTotal = commercials.lease.monthlyINR / commercials.purchase.priceINR
      expect(monthlyAsPercentOfTotal).toBeLessThan(0.15) // Less than 15% monthly
    })

    it('should generate delivery and installation details', async () => {
      const results = await engine.matchProducts(mockIntake, [mockProducts[0]])
      const delivery = results[0].deliveryInstall
      
      expect(delivery.installWindowWeeks).toBeGreaterThan(0)
      expect(delivery.trainingHours).toBeGreaterThan(0)
      expect(typeof delivery.supportIncluded).toBe('boolean')
      
      // Six-axis robots should have more training hours
      const sixAxisProduct = { ...mockProducts[0], category: 'SixAxis' }
      const scaraProduct = { ...mockProducts[0], category: 'SCARA' }
      
      const sixAxisResults = await engine.matchProducts(mockIntake, [sixAxisProduct])
      const scaraResults = await engine.matchProducts(mockIntake, [scaraProduct])
      
      expect(sixAxisResults[0].deliveryInstall.trainingHours).toBeGreaterThan(
        scaraResults[0].deliveryInstall.trainingHours
      )
    })

    it('should generate realistic SLA commitments', async () => {
      const results = await engine.matchProducts(mockIntake, [mockProducts[0]])
      const sla = results[0].sla
      
      expect(sla.uptimeGuarantee).toBeGreaterThanOrEqual(95)
      expect(sla.uptimeGuarantee).toBeLessThanOrEqual(99.9)
      expect(sla.responseTimeHours).toBeGreaterThan(0)
      expect(sla.restoreTimeHours).toBeGreaterThan(0)
      
      // Priority support should have faster response times
      const priorityProduct = {
        ...mockProducts[0],
        specs: { prioritySupport: true }
      }
      const standardProduct = {
        ...mockProducts[0],
        specs: { prioritySupport: false }
      }
      
      const priorityResults = await engine.matchProducts(mockIntake, [priorityProduct])
      const standardResults = await engine.matchProducts(mockIntake, [standardProduct])
      
      expect(priorityResults[0].sla.responseTimeHours).toBeLessThanOrEqual(
        standardResults[0].sla.responseTimeHours
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle products with minimal data', async () => {
      const minimalProduct: Product = {
        id: 'minimal-1',
        orgId: 'org-minimal',
        category: 'Other',
        title: 'Basic Robot',
        sku: 'BASIC-001',
        specs: {},
        priceMinINR: 100000,
        priceMaxINR: 200000,
        leadTimeWeeks: 10,
        status: 'LIVE'
      }
      
      const results = await engine.matchProducts(mockIntake, [minimalProduct])
      expect(results).toHaveLength(1)
      expect(results[0].fitScore).toBeGreaterThanOrEqual(0)
      expect(results[0].fitScore).toBeLessThanOrEqual(100)
    })

    it('should handle extreme values gracefully', async () => {
      const extremeIntake: IntakeData = {
        use_case: 'Heavy lifting',
        payload_kg: 1000, // Very high payload
        throughput_per_hr: 1, // Very low throughput
        integration: 'Other',
        timeline_weeks: 1, // Very urgent
        budget_range: '₹1-2 crores'
      }
      
      const results = await engine.matchProducts(extremeIntake, mockProducts)
      expect(results.length).toBeGreaterThan(0)
      results.forEach(result => {
        expect(result.fitScore).toBeGreaterThanOrEqual(0)
        expect(result.fitScore).toBeLessThanOrEqual(100)
      })
    })

    it('should handle zero and negative values appropriately', async () => {
      const zeroPayload = { ...mockIntake, payload_kg: 0 }
      const results = await engine.matchProducts(zeroPayload, mockProducts)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Weight Configuration Impact', () => {
    it('should prioritize spec matching with high spec weight', async () => {
      const specFocusedWeights: MatchingWeights = {
        spec: 0.8,
        integration: 0.05,
        lead: 0.05,
        serviceCoverage: 0.05,
        warranty: 0.03,
        tcoClarity: 0.02
      }
      
      const specEngine = new MatchingEngine(specFocusedWeights)
      
      const perfectSpecMatch = {
        ...mockProducts[0],
        payloadKg: 10, // Perfect match
        leadTimeWeeks: 20 // Poor lead time
      }
      
      const poorSpecMatch = {
        ...mockProducts[1],
        payloadKg: 3, // Poor match  
        leadTimeWeeks: 4 // Great lead time
      }
      
      const results = await specEngine.matchProducts(mockIntake, [perfectSpecMatch, poorSpecMatch])
      expect(results[0].productId).toBe(perfectSpecMatch.id)
    })

    it('should prioritize lead time with high lead weight', async () => {
      const leadFocusedWeights: MatchingWeights = {
        spec: 0.1,
        integration: 0.1,
        lead: 0.7,
        serviceCoverage: 0.05,
        warranty: 0.03,
        tcoClarity: 0.02
      }
      
      const leadEngine = new MatchingEngine(leadFocusedWeights)
      
      const fastDelivery = {
        ...mockProducts[0],
        payloadKg: 5, // Poor spec match
        leadTimeWeeks: 4 // Excellent lead time
      }
      
      const slowDelivery = {
        ...mockProducts[1],
        payloadKg: 15, // Good spec match
        leadTimeWeeks: 24 // Poor lead time
      }
      
      const results = await leadEngine.matchProducts(mockIntake, [fastDelivery, slowDelivery])
      expect(results[0].productId).toBe(fastDelivery.id)
    })
  })
})