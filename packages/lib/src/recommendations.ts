// Type-only import to avoid runtime dependency on @prisma/client
type PrismaClient = any

export interface RecommendationOptions {
  userId: string
  orgId: string
  limit?: number
  excludeProductIds?: string[]
  algorithm?: 'hybrid' | 'browsing' | 'industry' | 'trending' | 'similar_buyers'
}

export interface RecommendationResult {
  productId: string
  score: number
  reason: string
  algorithm: string
  metadata?: Record<string, any>
}

export interface ProductRecommendation {
  product: {
    id: string
    title: string
    category: string
    priceMinINR: number
    priceMaxINR: number
    leadTimeWeeks: number
    org: {
      name: string
      gstin: string | null
    }
  }
  score: number
  reason: string
  algorithm: string
}

export class RecommendationEngine {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Get personalized recommendations for a buyer
   */
  async getRecommendationsForUser(options: RecommendationOptions): Promise<ProductRecommendation[]> {
    const { userId, orgId, limit = 10, excludeProductIds = [], algorithm = 'hybrid' } = options

    let recommendations: RecommendationResult[] = []

    if (algorithm === 'hybrid') {
      // Combine multiple algorithms with weighted scores
      const browsingRecs = await this.getBrowsingBasedRecommendations(userId, orgId, limit * 2)
      const industryRecs = await this.getIndustryBasedRecommendations(orgId, limit)
      const trendingRecs = await this.getTrendingRecommendations(orgId, limit)
      const similarBuyerRecs = await this.getSimilarBuyerRecommendations(userId, orgId, limit)

      // Weight and combine recommendations
      recommendations = this.combineRecommendations([
        { results: browsingRecs, weight: 0.4 },
        { results: industryRecs, weight: 0.25 },
        { results: trendingRecs, weight: 0.2 },
        { results: similarBuyerRecs, weight: 0.15 }
      ], limit)
    } else {
      switch (algorithm) {
        case 'browsing':
          recommendations = await this.getBrowsingBasedRecommendations(userId, orgId, limit)
          break
        case 'industry':
          recommendations = await this.getIndustryBasedRecommendations(orgId, limit)
          break
        case 'trending':
          recommendations = await this.getTrendingRecommendations(orgId, limit)
          break
        case 'similar_buyers':
          recommendations = await this.getSimilarBuyerRecommendations(userId, orgId, limit)
          break
      }
    }

    // Filter out excluded products
    recommendations = recommendations.filter(r => !excludeProductIds.includes(r.productId))

    // Get product details
    const productDetails = await this.getProductDetails(recommendations.map(r => r.productId))

    // Combine recommendations with product details
    const productRecommendations: ProductRecommendation[] = recommendations
      .map(rec => {
        const product = productDetails.find((p: any) => p.id === rec.productId)
        if (!product) return null
        return {
          product,
          score: rec.score,
          reason: rec.reason,
          algorithm: rec.algorithm
        }
      })
      .filter(Boolean) as ProductRecommendation[]

    // Log recommendations for analytics
    await this.logRecommendations(userId, orgId, algorithm, productRecommendations)

    return productRecommendations
  }

  /**
   * Get recommendations based on user's browsing history
   */
  private async getBrowsingBasedRecommendations(
    userId: string, 
    orgId: string, 
    limit: number
  ): Promise<RecommendationResult[]> {
    // Get recently viewed products
    const recentViews = await this.prisma.productView.findMany({
      where: {
        userId,
        orgId,
        viewedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        product: {
          include: {
            org: true
          }
        }
      },
      orderBy: { viewedAt: 'desc' },
      take: 20
    })

    if (recentViews.length === 0) {
      return []
    }

    // Get categories and specifications from viewed products
    const viewedCategories = [...new Set(recentViews.map((v: any) => v.product.category))]
    const viewedSpecs = recentViews.map((v: any) => v.product.specs as Record<string, any>)

    // Find similar products in same categories
    const similarProducts = await this.prisma.product.findMany({
      where: {
        category: { in: viewedCategories },
        status: 'LIVE',
        id: { notIn: recentViews.map((v: any) => v.productId) },
        org: {
          kyc: {
            status: 'VERIFIED'
          }
        }
      },
      include: {
        org: true
      },
      take: limit * 2
    })

    // Score products based on similarity to viewed items
    const recommendations: RecommendationResult[] = similarProducts.map((product: any) => {
      let score = 0.5 // Base score for being in same category

      // Boost score for products from same suppliers user has viewed
      const viewedFromSameSupplier = recentViews.some((v: any) => v.product.orgId === product.orgId)
      if (viewedFromSameSupplier) {
        score += 0.3
      }

      // Boost score for similar price range
      const avgViewedPrice = recentViews.reduce((sum: number, v: any) =>
        sum + (v.product.priceMinINR + v.product.priceMaxINR) / 2, 0) / recentViews.length
      const productPrice = (product.priceMinINR + product.priceMaxINR) / 2
      const priceRatio = Math.min(avgViewedPrice, productPrice) / Math.max(avgViewedPrice, productPrice)
      score += priceRatio * 0.2

      return {
        productId: product.id,
        score,
        reason: viewedFromSameSupplier 
          ? `From ${product.org.name} - a supplier you've viewed before`
          : `Similar to products you've recently viewed`,
        algorithm: 'browsing'
      }
    })

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Get recommendations based on what similar companies in the industry are viewing
   */
  private async getIndustryBasedRecommendations(
    orgId: string, 
    limit: number
  ): Promise<RecommendationResult[]> {
    // Get current org's industry/type
    const currentOrg = await this.prisma.org.findUnique({
      where: { id: orgId },
      include: {
        memberships: {
          include: {
            user: true
          }
        }
      }
    })

    if (!currentOrg) return []

    // Find similar organizations (same type, similar size based on GSTIN patterns)
    const similarOrgs = await this.prisma.org.findMany({
      where: {
        type: currentOrg.type,
        id: { not: orgId },
        deletedAt: null
      },
      take: 100 // Sample from larger pool
    })

    // Get products frequently viewed by similar organizations
    const popularProductViews = await this.prisma.productView.groupBy({
      by: ['productId'],
      where: {
        orgId: { in: similarOrgs.map((org: any) => org.id) },
        viewedAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // Last 60 days
        }
      },
      _count: {
        productId: true
      },
      orderBy: {
        _count: {
          productId: 'desc'
        }
      },
      take: limit * 2
    })

    // Get product details for popular products
    const productIds = popularProductViews.map((p: any) => p.productId)
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'LIVE',
        org: {
          kyc: {
            status: 'VERIFIED'
          }
        }
      },
      include: {
        org: true
      }
    })

    const recommendations: RecommendationResult[] = popularProductViews.map((view: any) => {
      const product = products.find((p: any) => p.id === view.productId)
      if (!product) return null

      const viewCount = view._count.productId
      const score = Math.min(viewCount / 10, 1) // Normalize view count to 0-1 score

      return {
        productId: product.id,
        score,
        reason: `Popular among ${viewCount} similar companies in your industry`,
        algorithm: 'industry'
      }
    }).filter(Boolean) as RecommendationResult[]

    return recommendations.slice(0, limit)
  }

  /**
   * Get trending products in the user's region
   */
  private async getTrendingRecommendations(
    orgId: string, 
    limit: number
  ): Promise<RecommendationResult[]> {
    // Get products with highest view velocity in last 7 days
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const last14Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

    // Get view counts for last 7 days and previous 7 days
    const recentViews = await this.prisma.productView.groupBy({
      by: ['productId'],
      where: {
        viewedAt: { gte: last7Days }
      },
      _count: {
        productId: true
      }
    })

    const previousViews = await this.prisma.productView.groupBy({
      by: ['productId'],
      where: {
        viewedAt: { gte: last14Days, lt: last7Days }
      },
      _count: {
        productId: true
      }
    })

    // Calculate trending score (recent views vs previous period)
    const trendingScores = new Map<string, number>()

    recentViews.forEach((recent: any) => {
      const previous = previousViews.find((p: any) => p.productId === recent.productId)
      const recentCount = recent._count.productId
      const previousCount = previous?._count.productId || 0
      
      // Calculate trend score - higher score for products with growing interest
      const trendScore = previousCount > 0 
        ? (recentCount - previousCount) / previousCount
        : recentCount / 10 // New products get baseline score

      if (trendScore > 0) {
        trendingScores.set(recent.productId, Math.min(trendScore, 2)) // Cap at 2x growth
      }
    })

    // Get product details for trending products
    const trendingProductIds = Array.from(trendingScores.keys())
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: trendingProductIds },
        status: 'LIVE',
        org: {
          kyc: {
            status: 'VERIFIED'
          }
        }
      },
      include: {
        org: true
      }
    })

    const recommendations: RecommendationResult[] = Array.from(trendingScores.entries())
      .map(([productId, trendScore]) => {
        const product = products.find((p: any) => p.id === productId)
        if (!product) return null

        return {
          productId,
          score: Math.min(trendScore / 2, 1), // Normalize to 0-1
          reason: `Trending - ${Math.round(trendScore * 100)}% increase in interest this week`,
          algorithm: 'trending'
        }
      })
      .filter(Boolean) as RecommendationResult[]

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Get recommendations based on what similar buyers have purchased
   */
  private async getSimilarBuyerRecommendations(
    userId: string, 
    orgId: string, 
    limit: number
  ): Promise<RecommendationResult[]> {
    // Get user's interaction history
    const userInteractions = await this.prisma.userInteraction.findMany({
      where: {
        userId,
        orgId,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      include: {
        product: true
      }
    })

    if (userInteractions.length === 0) return []

    const userProductIds = userInteractions
      .filter((i: any) => i.productId)
      .map((i: any) => i.productId!) 

    // Find users who have interacted with similar products
    const similarUsers = await this.prisma.userInteraction.findMany({
      where: {
        productId: { in: userProductIds },
        userId: { not: userId },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      },
      distinct: ['userId'],
      include: {
        user: true
      }
    })

    if (similarUsers.length === 0) return []

    // Get products these similar users have interacted with
    const similarUserProductInteractions = await this.prisma.userInteraction.findMany({
      where: {
        userId: { in: similarUsers.map((u: any) => u.userId) },
        productId: { notIn: userProductIds }, // Exclude products current user already knows
        interactionType: { in: ['VIEW_PRODUCT', 'REQUEST_QUOTE', 'COMPLETE_PAYMENT'] }
      },
      include: {
        product: {
          include: {
            org: true
          }
        }
      }
    })

    // Count interactions per product
    const productInteractionCounts = new Map<string, number>()
    similarUserProductInteractions.forEach((interaction: any) => {
      if (interaction.productId) {
        const count = productInteractionCounts.get(interaction.productId) || 0
        productInteractionCounts.set(interaction.productId, count + 1)
      }
    })

    // Get unique products and calculate scores
    const recommendations: RecommendationResult[] = Array.from(productInteractionCounts.entries())
      .map(([productId, count]) => {
        const interaction = similarUserProductInteractions.find((i: any) => i.productId === productId)
        if (!interaction?.product || interaction.product.status !== 'LIVE') return null

        const score = Math.min(count / 5, 1) // Normalize to 0-1 score

        return {
          productId,
          score,
          reason: `${count} similar buyers have shown interest in this product`,
          algorithm: 'similar_buyers'
        }
      })
      .filter(Boolean) as RecommendationResult[]

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Combine multiple recommendation sources with weights
   */
  private combineRecommendations(
    sources: Array<{ results: RecommendationResult[]; weight: number }>,
    limit: number
  ): RecommendationResult[] {
    const combinedScores = new Map<string, { score: number; reasons: string[]; algorithms: string[] }>()

    sources.forEach(source => {
      source.results.forEach(result => {
        const existing = combinedScores.get(result.productId)
        if (existing) {
          existing.score += result.score * source.weight
          existing.reasons.push(result.reason)
          existing.algorithms.push(result.algorithm)
        } else {
          combinedScores.set(result.productId, {
            score: result.score * source.weight,
            reasons: [result.reason],
            algorithms: [result.algorithm]
          })
        }
      })
    })

    const finalRecommendations: RecommendationResult[] = Array.from(combinedScores.entries())
      .map(([productId, data]) => ({
        productId,
        score: data.score,
        reason: data.reasons[0], // Use the first reason or combine them
        algorithm: 'hybrid',
        metadata: {
          allReasons: data.reasons,
          sourceAlgorithms: data.algorithms
        }
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return finalRecommendations
  }

  /**
   * Get product details for recommendations
   */
  private async getProductDetails(productIds: string[]) {
    return await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'LIVE'
      },
      include: {
        org: {
          select: {
            name: true,
            gstin: true
          }
        }
      }
    })
  }

  /**
   * Log recommendations for analytics and feedback loop
   */
  private async logRecommendations(
    userId: string,
    orgId: string,
    algorithm: string,
    recommendations: ProductRecommendation[]
  ) {
    try {
      await this.prisma.recommendationLog.create({
        data: {
          userId,
          orgId,
          recommendationType: algorithm === 'hybrid' ? 'BROWSING_HISTORY' : 
                            algorithm === 'browsing' ? 'BROWSING_HISTORY' :
                            algorithm === 'industry' ? 'INDUSTRY_SIMILAR' :
                            algorithm === 'trending' ? 'TRENDING_REGION' : 'SIMILAR_BUYERS',
          productIds: recommendations.map(r => r.product.id),
          algorithm,
          score: recommendations.length > 0 ? recommendations[0].score : 0,
          metadata: {
            totalRecommendations: recommendations.length,
            averageScore: recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length
          }
        }
      })
    } catch (error) {
      // Silent error handling - recommendations are not critical
    }
  }

  /**
   * Track when a user clicks on a recommendation
   */
  async trackRecommendationClick(
    userId: string,
    orgId: string,
    productId: string
  ) {
    try {
      // Find the most recent recommendation log that included this product
      const recentLog = await this.prisma.recommendationLog.findFirst({
        where: {
          userId,
          orgId,
          productIds: { has: productId },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (recentLog) {
        await this.prisma.recommendationLog.update({
          where: { id: recentLog.id },
          data: {
            clickedProductId: productId,
            clickedAt: new Date()
          }
        })
      }

      // Also track as a user interaction
      await this.prisma.userInteraction.create({
        data: {
          userId,
          orgId,
          productId,
          interactionType: 'VIEW_PRODUCT',
          metadata: {
            source: 'recommendation',
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (error) {
      // Silent error handling - tracking is not critical
    }
  }
}