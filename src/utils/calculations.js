/**
 * Compute the wealth threshold for a group (in millions)
 */
export function computeWealthThreshold(group, yearsElapsed) {
  const { incomeThreshold, incomeWealthRatio, growthRate } = group
  if (!incomeThreshold || !incomeWealthRatio) return null
  
  return (incomeThreshold / incomeWealthRatio) * Math.pow(1 + growthRate, yearsElapsed) / 1e6
}

/**
 * Compute the inverted Pareto coefficient
 */
export function computeParetoCoef(group) {
  const { avgIncome, incomeThreshold } = group
  if (!avgIncome || !incomeThreshold) return null
  
  return avgIncome / incomeThreshold
}

/**
 * Compute the share of wealth exposed to the tax
 */
export function computeShareExposed(group, reformThreshold, yearsElapsed) {
  const wealthThreshold = computeWealthThreshold(group, yearsElapsed)
  const pareto = computeParetoCoef(group)
  
  if (!wealthThreshold || !pareto) return 0
  if (reformThreshold <= wealthThreshold) return 1
  
  return Math.pow(wealthThreshold / reformThreshold, 1 / (pareto - 1))
}

/**
 * Compute number of individuals affected by the tax
 */
export function computeIndividualsAffected(group, reformThreshold, yearsElapsed, unitSize = 1.0) {
  const wealthThreshold = computeWealthThreshold(group, yearsElapsed);
  const pareto = computeParetoCoef(group);
  const { n } = group;

  if (!wealthThreshold || !pareto || !n) return 0;
  
  if (reformThreshold <= wealthThreshold) return n * unitSize;

  const alpha = pareto / (pareto - 1);
  const unitsAffected = n * Math.pow(wealthThreshold / reformThreshold, alpha);
  return unitsAffected * unitSize;
}

/**
 * Compute the tax rate under reform for a group
 */
export function computeReformRate(group, taxRate, reformThreshold, yearsElapsed) {
  const { totalRate, indivRate, incomeWealthRatio } = group
  
  if (!indivRate || !incomeWealthRatio) {
    return totalRate
  }
  
  const shareExposed = computeShareExposed(group, reformThreshold, yearsElapsed)
  const additionalTax = Math.max(0, taxRate / incomeWealthRatio - indivRate)
  
  return totalRate + additionalTax * shareExposed
}

/**
 * Compute extra fiscal revenues for a group (in billion)
 */
export function computeExtraRevenue(group, taxRate, reformThreshold, yearsElapsed) {
  const { totalRate, avgIncome, n, growthRate } = group
  
  if (!avgIncome || !n) return 0
  
  const reformRate = computeReformRate(group, taxRate, reformThreshold, yearsElapsed)
  const growthFactor = Math.pow(1 + growthRate, yearsElapsed)
  
  return (reformRate - totalRate) * avgIncome * n * growthFactor / 1e9
}

/**
 * Compute all data for the chart
 */
export function computeChartData(countryData, taxRate, reformThreshold) {
  const yearsElapsed = countryData.simulationYear - countryData.dataYear
  
  return countryData.groups.map((group) => ({
    group: group.group,
    currentRate: group.totalRate * 100,
    reformRate: computeReformRate(group, taxRate, reformThreshold, yearsElapsed) * 100,
  }))
}

/**
 * Compute total extra fiscal revenues
 */
export function computeTotalRevenue(countryData, taxRate, reformThreshold) {
  const yearsElapsed = countryData.simulationYear - countryData.dataYear
  
  return countryData.groups.reduce((sum, group) => {
    return sum + computeExtraRevenue(group, taxRate, reformThreshold, yearsElapsed)
  }, 0)
}

/**
 * Compute total number of individuals affected by the tax
 */
export function computeTotalIndividuals(countryData, reformThreshold) {
  const yearsElapsed = countryData.simulationYear - countryData.dataYear;
  const unitSize = countryData.unitSize || 1.0;

  return countryData.groups.reduce((sum, group) => {
    return sum + computeIndividualsAffected(group, reformThreshold, yearsElapsed, unitSize);
  }, 0);
}