export * from './matching'
export * from './razorpay'
export * from './seo'
export * from './notifications'

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatTimeframe = (weeks: number): string => {
  if (weeks < 2) return `${weeks} week`
  if (weeks < 4) return `${weeks} weeks`
  if (weeks < 12) return `${Math.round(weeks / 4)} months`
  return `${Math.round(weeks / 12)} years`
}

export const getProductCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    AMR: 'Autonomous Mobile Robot',
    AGV: 'Automated Guided Vehicle',
    SixAxis: '6-Axis Robot Arm',
    SCARA: 'SCARA Robot',
    Conveyor: 'Conveyor System',
    ASRS: 'Automated Storage & Retrieval',
    Vision: 'Vision System',
    Other: 'Other Automation'
  }
  return categoryNames[category] || category
}