import { z } from 'zod'

// Intake form schema
export const IntakeSchema = z.object({
  use_case: z.string().min(1, 'Use case is required'),
  payload_kg: z.number().min(0, 'Payload must be non-negative'),
  throughput_per_hr: z.number().min(0, 'Throughput must be non-negative'),
  integration: z.enum(['PLC', 'Fieldbus', 'Standalone', 'Other']),
  timeline_weeks: z.number().min(1, 'Timeline must be at least 1 week'),
  budget_range: z.string().optional(),
  location: z.string().optional(),
  uptime_target_pct: z.number().min(0).max(100).optional(),
})

export type IntakeData = z.infer<typeof IntakeSchema>

// Product interface
export interface Product {
  id: string
  orgId: string
  category: string
  title: string
  sku: string
  payloadKg?: number
  reachMm?: number
  repeatabilityMm?: number
  maxSpeedMps?: number
  ipRating?: string
  controller?: string
  specs: Record<string, any>
  priceMinINR: number
  priceMaxINR: number
  leadTimeWeeks: number
  status: string
  // Org data for service coverage
  org?: {
    name: string
    type: string
  }
}

export interface MatchResult {
  productId: string
  fitScore: number
  why: string[]
  assumptions: string[]
  commercials: {
    purchase: {
      priceINR: number
      description: string
    }
    lease: {
      monthlyINR: number
      termMonths: number
      description: string
    }
    pilot: {
      durationWeeks: number
      costINR: number
      description: string
    }
  }
  deliveryInstall: {
    installWindowWeeks: number
    trainingHours: number
    supportIncluded: boolean
  }
  sla: {
    uptimeGuarantee: number
    responseTimeHours: number
    restoreTimeHours: number
  }
}

export interface MatchingWeights {
  spec: number          // 40%
  integration: number   // 20%
  lead: number         // 10%
  serviceCoverage: number // 15%
  warranty: number     // 10%
  tcoClarity: number   // 5%
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  spec: 0.4,
  integration: 0.2,
  lead: 0.1,
  serviceCoverage: 0.15,
  warranty: 0.1,
  tcoClarity: 0.05,
}

/**
 * Core matching engine that computes FitScore (0-100) based on weighted criteria
 */
export class MatchingEngine {
  private weights: MatchingWeights

  constructor(weights: MatchingWeights = DEFAULT_WEIGHTS) {
    this.weights = weights
  }

  /**
   * Main matching function - returns top matches for an intake
   */
  public async matchProducts(
    intake: IntakeData,
    products: Product[],
    maxResults: number = 3
  ): Promise<MatchResult[]> {
    const matches: MatchResult[] = []

    for (const product of products) {
      if (product.status !== 'LIVE') continue

      const match = this.computeMatch(intake, product)
      matches.push(match)
    }

    // Sort by fitScore descending and return top N
    return matches
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, maxResults)
  }

  /**
   * Compute match for a single product against intake requirements
   */
  private computeMatch(intake: IntakeData, product: Product): MatchResult {
    const specScore = this.computeSpecScore(intake, product)
    const integrationScore = this.computeIntegrationScore(intake, product)
    const leadScore = this.computeLeadTimeScore(intake, product)
    const serviceScore = this.computeServiceCoverageScore(intake, product)
    const warrantyScore = this.computeWarrantyScore(product)
    const tcoScore = this.computeTCOClarityScore(product)

    const fitScore = Math.round(
      specScore * this.weights.spec +
      integrationScore * this.weights.integration +
      leadScore * this.weights.lead +
      serviceScore * this.weights.serviceCoverage +
      warrantyScore * this.weights.warranty +
      tcoScore * this.weights.tcoClarity
    )

    const why = this.generateWhyReasons(intake, product, {
      spec: specScore,
      integration: integrationScore,
      lead: leadScore,
      service: serviceScore,
      warranty: warrantyScore,
      tco: tcoScore,
    })

    const assumptions = this.generateAssumptions(intake, product)
    const commercials = this.generateCommercials(product)
    const deliveryInstall = this.generateDeliveryInstall(intake, product)
    const sla = this.generateSLA(product)

    return {
      productId: product.id,
      fitScore,
      why,
      assumptions,
      commercials,
      deliveryInstall,
      sla,
    }
  }

  /**
   * Spec matching score (0-100)
   * Considers payload, throughput, technical specs
   */
  private computeSpecScore(intake: IntakeData, product: Product): number {
    let score = 50 // Base score

    // Payload matching
    if (product.payloadKg) {
      if (product.payloadKg >= intake.payload_kg) {
        score += 20
      } else {
        // Penalty for insufficient payload
        const deficit = (intake.payload_kg - product.payloadKg) / intake.payload_kg
        score -= Math.min(30, deficit * 100)
      }
    }

    // Throughput considerations (simplified - based on speed/capacity indicators)
    if (product.maxSpeedMps && intake.throughput_per_hr > 100) {
      score += product.maxSpeedMps > 1.5 ? 15 : 5
    }

    // Technical specs from JSONB
    if (product.specs) {
      if (product.specs.certifications) score += 10
      if (product.specs.safetyRating) score += 5
      if (product.specs.connectivity) score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Integration compatibility score (0-100)
   */
  private computeIntegrationScore(intake: IntakeData, product: Product): number {
    let score = 30 // Base score

    // Controller compatibility
    if (product.controller) {
      const controllers = product.controller.toLowerCase()
      if (intake.integration === 'PLC') {
        if (controllers.includes('siemens') || controllers.includes('abb') || controllers.includes('rockwell')) {
          score += 50
        } else {
          score += 20
        }
      } else if (intake.integration === 'Fieldbus') {
        if (controllers.includes('profinet') || controllers.includes('ethercat')) {
          score += 60
        } else {
          score += 25
        }
      } else if (intake.integration === 'Standalone') {
        score += 40
      }
    }

    // Connectivity from specs
    if (product.specs?.connectivity) {
      score += 20
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Lead time score (0-100)
   */
  private computeLeadTimeScore(intake: IntakeData, product: Product): number {
    if (product.leadTimeWeeks <= intake.timeline_weeks) {
      return 100
    }
    
    const delay = product.leadTimeWeeks - intake.timeline_weeks
    const delayPenalty = (delay / intake.timeline_weeks) * 100
    
    return Math.max(0, 100 - delayPenalty)
  }

  /**
   * Service coverage score (0-100)
   * Based on supplier capabilities
   */
  private computeServiceCoverageScore(intake: IntakeData, product: Product): number {
    let score = 40 // Base score

    // Location proximity (simplified)
    if (intake.location) {
      score += 20 // Assume good coverage for now
    }

    // Service capabilities from specs
    if (product.specs) {
      if (product.specs.serviceTeam) score += 20
      if (product.specs.remoteDiagnostics) score += 15
      if (product.specs.trainigIncluded) score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Warranty/MTTR score (0-100)
   */
  private computeWarrantyScore(product: Product): number {
    let score = 40 // Base score

    if (product.specs) {
      const warrantyMonths = product.specs.warrantyMonths || 12
      if (warrantyMonths >= 24) score += 30
      else if (warrantyMonths >= 12) score += 20
      else score += 10

      // MTTR considerations
      const mttr = product.specs.mttrHours
      if (mttr) {
        if (mttr <= 4) score += 30
        else if (mttr <= 8) score += 20
        else score += 10
      }
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * TCO clarity score (0-100)
   */
  private computeTCOClarityScore(product: Product): number {
    let score = 30 // Base score

    // Price range clarity
    const priceSpread = (product.priceMaxINR - product.priceMinINR) / product.priceMinINR
    if (priceSpread < 0.2) score += 40 // Tight price range
    else if (priceSpread < 0.5) score += 30
    else score += 20

    // Operating cost transparency
    if (product.specs) {
      if (product.specs.operatingCostINRPerYear) score += 20
      if (product.specs.maintenanceCostINRPerYear) score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Generate explanation for the match
   */
  private generateWhyReasons(
    intake: IntakeData,
    product: Product,
    scores: Record<string, number>
  ): string[] {
    const reasons: string[] = []

    if (scores.spec > 70) {
      reasons.push(`Excellent spec match - handles ${intake.payload_kg}kg payload requirement`)
    }
    if (scores.integration > 70) {
      reasons.push(`Strong integration compatibility with ${intake.integration} systems`)
    }
    if (scores.lead > 90) {
      reasons.push(`Fast delivery - ${product.leadTimeWeeks} weeks meets your ${intake.timeline_weeks} week timeline`)
    }
    if (scores.service > 70) {
      reasons.push('Comprehensive service coverage and support')
    }

    if (reasons.length === 0) {
      reasons.push('Meets basic requirements with room for optimization')
    }

    return reasons
  }

  /**
   * Generate assumptions made in the match
   */
  private generateAssumptions(intake: IntakeData, product: Product): string[] {
    const assumptions: string[] = []

    if (!product.payloadKg) {
      assumptions.push('Payload capacity assumed adequate based on category')
    }
    if (!intake.location) {
      assumptions.push('Service coverage assumed available in major Indian cities')
    }
    if (!intake.uptime_target_pct) {
      assumptions.push('Standard uptime requirements (95%+) assumed')
    }

    return assumptions
  }

  /**
   * Generate commercial options
   */
  private generateCommercials(product: Product) {
    const basePrice = (product.priceMinINR + product.priceMaxINR) / 2

    return {
      purchase: {
        priceINR: Math.round(basePrice),
        description: `CAPEX purchase including basic installation and 1-year warranty`,
      },
      lease: {
        monthlyINR: Math.round(basePrice * 0.08), // ~8% monthly
        termMonths: 36,
        description: `36-month lease with maintenance included, option to purchase`,
      },
      pilot: {
        durationWeeks: 8,
        costINR: Math.round(basePrice * 0.15),
        description: `8-week paid pilot program, cost adjustable against purchase`,
      },
    }
  }

  /**
   * Generate delivery and installation details
   */
  private generateDeliveryInstall(intake: IntakeData, product: Product) {
    return {
      installWindowWeeks: Math.max(2, Math.ceil(product.leadTimeWeeks * 0.2)),
      trainingHours: product.category === 'SixAxis' ? 40 : 24,
      supportIncluded: true,
    }
  }

  /**
   * Generate SLA details
   */
  private generateSLA(product: Product) {
    const baseUptime = 95
    const uptimeBonus = product.specs?.reliabilityRating === 'high' ? 2 : 0

    return {
      uptimeGuarantee: baseUptime + uptimeBonus,
      responseTimeHours: product.specs?.prioritySupport ? 2 : 4,
      restoreTimeHours: product.specs?.mttrHours || 8,
    }
  }
}