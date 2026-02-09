import { useState, useMemo, useCallback } from 'react'
import { computeChartData, computeTotalRevenue, computeTotalIndividuals } from '../utils/calculations'
import Parameters from './Parameters'
import Chart from './Chart'

// Tooltip descriptions for UI elements
const TOOLTIP_DESCRIPTIONS = {
  regular: 'Each income group occupies the same width on the x-axis',
  income: 'Groups are sized proportionally to their share of total income',
  population: 'Groups are sized proportionally to their number of individuals',
  individualsAffected: 'Number of tax units whose wealth exceeds the selected threshold. Only tax units with current individual taxes (relative to wealth) lower than the selected tax rate would have to pay the minimum wealth tax.'
}

function SimulatorSection({ countries }) {
  // State management
  const [countryData, setCountryData] = useState(countries[0])
  const [threshold, setThreshold] = useState(100)
  const [taxRate, setTaxRate] = useState(2)
  const [xScaleMode, setXScaleMode] = useState('regular')
  const [hoveredElement, setHoveredElement] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Compute tax metrics
  const taxRateDecimal = taxRate / 100
  const chartData = useMemo(() => 
    computeChartData(countryData, taxRateDecimal, threshold),
    [countryData, taxRateDecimal, threshold]
  )
  const totalRevenue = useMemo(() => 
    computeTotalRevenue(countryData, taxRateDecimal, threshold),
    [countryData, taxRateDecimal, threshold]
  )
  const totalIndividuals = useMemo(() => 
    computeTotalIndividuals(countryData, threshold),
    [countryData, threshold]
  )

  // Tooltip event handlers
  const handleMouseEnter = useCallback((element, event) => {
    setHoveredElement(element)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const handleMouseMove = useCallback((event) => {
    if (hoveredElement) {
      setTooltipPosition({ x: event.clientX, y: event.clientY })
    }
  }, [hoveredElement])

  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null)
  }, [])

  // Calculate X positions based on scale mode
  const xPositions = useMemo(() => {
    const groups = countryData.groups
    const numGroups = groups.length

    if (xScaleMode === 'regular') {
      return groups.map((_, i) => ((i + 0.5) / numGroups) * 100)
    }

    const key = xScaleMode === 'population' ? 'n' : 'incomeShare'
    const totalValue = groups.reduce((sum, g) => sum + (g[key] || 0), 0)
    
    let cumulative = 0
    return groups.map(g => {
      const groupSize = g[key] || 0
      const midPoint = cumulative + groupSize / 2
      cumulative += groupSize
      return (midPoint / totalValue) * 100
    })
  }, [countryData.groups, xScaleMode])

  // Calculate group boundaries
  const groupBoundaries = useMemo(() => {
    const groups = countryData.groups
    const numGroups = groups.length

    if (xScaleMode === 'regular') {
      return Array.from({ length: numGroups + 1 }, (_, i) => (i / numGroups) * 100)
    }

    const key = xScaleMode === 'population' ? 'n' : 'incomeShare'
    const totalValue = groups.reduce((sum, g) => sum + (g[key] || 0), 0)
    
    const boundaries = [0]
    let cumulative = 0
    groups.forEach(g => {
      cumulative += (g[key] || 0)
      boundaries.push((cumulative / totalValue) * 100)
    })
    return boundaries
  }, [countryData.groups, xScaleMode])

  return (
    <div>
      {/* Country selection tabs */}
      <div className="country-tabs">
        {countries.map((country) => (
          <button
            key={country.country}
            onClick={() => setCountryData(country)}
            className={`country-tab ${countryData.country === country.country ? 'active' : ''}`}
            style={countryData.country === country.country ? { background: country.color } : {}}
          >
            {country.country}
          </button>
        ))}
      </div>
      
      {/* Tax parameters and individuals affected */}
      <div className="controls-row">
        <Parameters
          taxRate={taxRate}
          setTaxRate={setTaxRate}
          threshold={threshold}
          setThreshold={setThreshold}
          currency={countryData.currency}
        />

        <div className="number-box">
          <span 
            className="number-label"
            onMouseEnter={(e) => handleMouseEnter('individualsAffected', e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'help' }}
          >
            Number of tax units potentially subject to the tax
          </span>
          <span className="number-value" style={{ color: countryData.color }}>
            {(Math.round(totalIndividuals / 10) * 10).toLocaleString('en-US')}
          </span>
        </div>
      </div>
      
      {/* Chart container */}
      <div className="chart-container">
        <Chart 
          data={chartData} 
          originalData={countryData.groups}
          color={countryData.color} 
          xPositions={xPositions}
          groupBoundaries={groupBoundaries}
          xScaleMode={xScaleMode}
          setXScaleMode={setXScaleMode}
          onTooltipEnter={handleMouseEnter}
          onTooltipMove={handleMouseMove}
          onTooltipLeave={handleMouseLeave}
          country={countryData.country}
          threshold={threshold}
          taxRate={taxRate}
          currency={countryData.currency}
        />
      </div>
    
      {/* Revenue metrics */}
      <div className="revenue-box">
        <div className="revenue-col">
          <span className="revenue-label">Extra fiscal revenues</span>
          <span className="revenue-value" style={{ color: countryData.color }}>
            {Math.round(totalRevenue).toLocaleString('en-US')} B{countryData.currency}
          </span>
          <span className="revenue-label">each year</span>
        </div>
        <div className="revenue-col">
          <span className="revenue-label">How much is that?</span>
          {countryData.gdp && (
            <span className="revenue-value-small" style={{ color: countryData.color }}>
              {((totalRevenue / countryData.gdp) * 100).toFixed(1)}% of GDP
            </span>
          )}
          {countryData.gdp && countryData.deficit && (
            <span className="revenue-value-small" style={{ color: countryData.color }}>
              {((totalRevenue / (countryData.gdp * countryData.deficit)) * 100).toFixed(0)}% of public deficit
            </span>
          )}
        </div>
      </div>

      {/* Tooltip for hover information */}
      {hoveredElement && (
        <div 
          className="mode-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y + 15}px`,
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          {TOOLTIP_DESCRIPTIONS[hoveredElement]}
        </div>
      )}
    </div>
  )
}

export default SimulatorSection