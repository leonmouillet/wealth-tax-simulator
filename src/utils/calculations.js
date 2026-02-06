/**
 * Compute group exposure to the tax
 */

export function computeWealthThreshold(group, yearsElapsed) {
  const { incomeThreshold, incomeWealthRatio, nominalGrowthThreshold } = group
  if (!incomeThreshold || !incomeWealthRatio || nominalGrowthThreshold === null || nominalGrowthThreshold === undefined) return null
  
  const incomeThresholdPresent = incomeThreshold * Math.pow(1 + nominalGrowthThreshold, yearsElapsed)
  return incomeThresholdPresent / incomeWealthRatio / 1e6
}

export function computeAlpha(group, yearsElapsed) {
  const { avgIncome, incomeThreshold, nominalGrowthAvg, nominalGrowthThreshold } = group
  if (!avgIncome || !incomeThreshold || nominalGrowthAvg === null || nominalGrowthAvg === undefined || nominalGrowthThreshold === null || nominalGrowthThreshold === undefined) return null
  
  const avgIncomePresent = avgIncome * Math.pow(1 + nominalGrowthAvg, yearsElapsed)
  const incomeThresholdPresent = incomeThreshold * Math.pow(1 + nominalGrowthThreshold, yearsElapsed)
  
  if (avgIncomePresent <= incomeThresholdPresent) return null
  
  return avgIncomePresent / (avgIncomePresent - incomeThresholdPresent)
}

export function computeCorrectedAlpha(group, nextGroup, yearsElapsed) {
  if (!nextGroup) return null
  
  const paretoAlpha = computeAlpha(group, yearsElapsed)
  const wealthThreshold = computeWealthThreshold(group, yearsElapsed)
  const wealthThresholdNext = computeWealthThreshold(nextGroup, yearsElapsed)
  
  if (!paretoAlpha || !wealthThreshold || !wealthThresholdNext) return null
  
  return paretoAlpha * (1 - Math.pow(wealthThreshold / wealthThresholdNext, paretoAlpha - 1))
}

export function computeShareExposed(group, nextGroup, reformThreshold, yearsElapsed) {
  const wealthThreshold = computeWealthThreshold(group, yearsElapsed)
  const wealthThresholdNext = nextGroup ? computeWealthThreshold(nextGroup, yearsElapsed) : null
  const correctedAlpha = nextGroup ? computeCorrectedAlpha(group, nextGroup, yearsElapsed) : null
  
  if (!wealthThreshold) return 0
  if (reformThreshold <= wealthThreshold) return 1
  if (wealthThresholdNext && reformThreshold >= wealthThresholdNext) return 0
  
  if (!wealthThresholdNext || correctedAlpha === null) {
    const paretoAlpha = computeAlpha(group, yearsElapsed)
    if (!paretoAlpha) return 0
    return Math.pow(wealthThreshold / reformThreshold, 1 / (paretoAlpha - 1))
  }
  
  const numerator = Math.pow(reformThreshold, -correctedAlpha + 1) - Math.pow(wealthThresholdNext, -correctedAlpha + 1)
  const denominator = Math.pow(wealthThreshold, -correctedAlpha + 1) - Math.pow(wealthThresholdNext, -correctedAlpha + 1)
  const result = numerator / denominator
  return Math.max(0, Math.min(1, result))
}

export function computeIndividualsAffected(group, nextGroup, reformThreshold, yearsElapsed) {
  const { n, populationGrowth } = group
  if (!n) return 0
  
  const nPresent = (populationGrowth !== null && populationGrowth !== undefined) 
    ? n * Math.pow(1 + populationGrowth, yearsElapsed) 
    : n
  
  const wealthThreshold = computeWealthThreshold(group, yearsElapsed)
  const wealthThresholdNext = nextGroup ? computeWealthThreshold(nextGroup, yearsElapsed) : null
  const correctedAlpha = nextGroup ? computeCorrectedAlpha(group, nextGroup, yearsElapsed) : null
  
  if (!wealthThreshold) return 0
  if (reformThreshold <= wealthThreshold) return nPresent
  if (wealthThresholdNext && reformThreshold >= wealthThresholdNext) return 0
  
  if (!wealthThresholdNext || correctedAlpha === null) {
    const paretoAlpha = computeAlpha(group, yearsElapsed)
    if (!paretoAlpha) return 0
    const alpha = paretoAlpha / (paretoAlpha - 1)
    return nPresent * Math.pow(wealthThreshold / reformThreshold, alpha)
  }
  
  const numerator = Math.pow(reformThreshold, -correctedAlpha) - Math.pow(wealthThresholdNext, -correctedAlpha)
  const denominator = Math.pow(wealthThreshold, -correctedAlpha) - Math.pow(wealthThresholdNext, -correctedAlpha)
  const fraction = numerator / denominator
  return Math.max(0, Math.min(1, fraction)) * nPresent
}

/**
 * Compute the tax rate under reform for a group
 */
export function computeReformRate(group, nextGroup, taxRate, reformThreshold, yearsElapsed) {
  const { totalRate, indivRate, incomeWealthRatio } = group
  
  if (!totalRate) return null
  if (!indivRate || !incomeWealthRatio) return totalRate
  
  const shareExposed = computeShareExposed(group, nextGroup, reformThreshold, yearsElapsed)
  const additionalTax = Math.max(0, taxRate / incomeWealthRatio - indivRate)
  
  return totalRate + additionalTax * shareExposed
}

/**
 * Compute extra fiscal revenues for a group
 */
export function computeExtraRevenue(group, nextGroup, taxRate, reformThreshold, yearsElapsed) {
  const { totalRate, avgIncome, n, nominalGrowthAvg, populationGrowth } = group
  
  if (!avgIncome || !n || !totalRate) return 0
  
  const reformRate = computeReformRate(group, nextGroup, taxRate, reformThreshold, yearsElapsed)
  if (reformRate === null) return 0
  
  const avgIncomePresent = (nominalGrowthAvg !== null && nominalGrowthAvg !== undefined)
    ? avgIncome * Math.pow(1 + nominalGrowthAvg, yearsElapsed)
    : avgIncome
  
  const nPresent = (populationGrowth !== null && populationGrowth !== undefined)
    ? n * Math.pow(1 + populationGrowth, yearsElapsed)
    : n
  
  return (reformRate - totalRate) * avgIncomePresent * nPresent / 1e9
}

/**
 * Compute all data for the chart
 */
export function computeChartData(countryData, taxRate, reformThreshold) {
  const yearsElapsed = countryData.simulationYear - countryData.dataYear
  
  return countryData.groups.map((group, index) => {
    const nextGroup = index < countryData.groups.length - 1 ? countryData.groups[index + 1] : null
    const reformRate = computeReformRate(group, nextGroup, taxRate, reformThreshold, yearsElapsed)
    
    return {
      group: group.group,
      currentRate: group.totalRate ? group.totalRate * 100 : null,
      reformRate: reformRate ? reformRate * 100 : null,
    }
  })
}

/**
 * Compute total extra fiscal revenues
 */
export function computeTotalRevenue(countryData, taxRate, reformThreshold) {
  const yearsElapsed = countryData.simulationYear - countryData.dataYear
  
  return countryData.groups.reduce((sum, group, index) => {
    const nextGroup = index < countryData.groups.length - 1 ? countryData.groups[index + 1] : null
    return sum + computeExtraRevenue(group, nextGroup, taxRate, reformThreshold, yearsElapsed)
  }, 0)
}

/**
 * Compute total number of individuals affected by the tax
 */
export function computeTotalIndividuals(countryData, reformThreshold) {
  const yearsElapsed = countryData.simulationYear - countryData.dataYear

  return countryData.groups.reduce((sum, group, index) => {
    const nextGroup = index < countryData.groups.length - 1 ? countryData.groups[index + 1] : null
    return sum + computeIndividualsAffected(group, nextGroup, reformThreshold, yearsElapsed)
  }, 0)
}