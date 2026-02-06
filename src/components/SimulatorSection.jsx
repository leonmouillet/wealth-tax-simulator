import { useState } from 'react'
import { Link } from 'react-router-dom'
import { computeChartData, computeTotalRevenue, computeTotalIndividuals } from '../utils/calculations'
import Parameters from './Parameters'
import Chart from './Chart'

function SimulatorSection({ countries }) {
  const [countryData, setCountryData] = useState(countries[0])
  const [threshold, setThreshold] = useState(100)
  const [taxRate, setTaxRate] = useState(2)
  const [xScaleMode, setXScaleMode] = useState('regular') // 'regular', 'population', 'income'
  const [hoveredElement, setHoveredElement] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const taxRateDecimal = taxRate / 100
  const chartData = computeChartData(countryData, taxRateDecimal, threshold)
  const totalRevenue = computeTotalRevenue(countryData, taxRateDecimal, threshold)
  const totalIndividuals = computeTotalIndividuals(countryData, threshold)

  // Descriptions pour les tooltips
  const tooltipDescriptions = {
    regular: 'Each income group occupies the same width on the x-axis',
    income: 'Groups are sized proportionally to their share of total income',
    population: 'Groups are sized proportionally to their number of individuals',
    individualsAffected: 'Number of tax units whose wealth exceeds the selected threshold. Only tax units with current individual taxes (relative to wealth) lower than the selected tax rate would have to pay the minimum wealth tax.'
  }

  const handleMouseEnter = (element, event) => {
    setHoveredElement(element)
    updateTooltipPosition(event)
  }

  const handleMouseMove = (event) => {
    if (hoveredElement) {
      updateTooltipPosition(event)
    }
  }

  const handleMouseLeave = () => {
    setHoveredElement(null)
  }

  const updateTooltipPosition = (event) => {
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    })
  }

  // Calculer les positions X en fonction du mode
  const computeXPositions = () => {
    const groups = countryData.groups

    if (xScaleMode === 'regular') {
      // En mode regular : espacer régulièrement, points au MILIEU de chaque intervalle
      const numGroups = groups.length
      return groups.map((_, i) => ((i + 0.5) / numGroups) * 100)
    }

    if (xScaleMode === 'population') {
      // Calculer les positions basées sur le nombre d'individus (MILIEU de chaque groupe)
      const totalValue = groups.reduce((sum, g) => sum + (g.n || 0), 0)
      let cumulative = 0
      const positions = groups.map(g => {
        const groupSize = g.n || 0
        const midPoint = cumulative + groupSize / 2
        cumulative += groupSize
        return (midPoint / totalValue) * 100
      })
      return positions
    } else if (xScaleMode === 'income') {
      // Calculer les positions basées sur la part de revenu (MILIEU de chaque groupe)
      const totalValue = groups.reduce((sum, g) => sum + (g.incomeShare || 0), 0)
      let cumulative = 0
      const positions = groups.map(g => {
        const groupSize = g.incomeShare || 0
        const midPoint = cumulative + groupSize / 2
        cumulative += groupSize
        return (midPoint / totalValue) * 100
      })
      return positions
    }

    return null
  }

  // Calculer les frontières des groupes (pour les lignes verticales et les ticks)
  const computeGroupBoundaries = () => {
    const groups = countryData.groups
    const boundaries = [0] // Commence à 0

    if (xScaleMode === 'regular') {
      // En mode regular : frontières régulièrement espacées
      const numGroups = groups.length
      for (let i = 1; i <= numGroups; i++) {
        boundaries.push((i / numGroups) * 100)
      }
      return boundaries
    }

    if (xScaleMode === 'population') {
      const totalValue = groups.reduce((sum, g) => sum + (g.n || 0), 0)
      let cumulative = 0
      groups.forEach(g => {
        cumulative += (g.n || 0)
        boundaries.push((cumulative / totalValue) * 100)
      })
    } else if (xScaleMode === 'income') {
      const totalValue = groups.reduce((sum, g) => sum + (g.incomeShare || 0), 0)
      let cumulative = 0
      groups.forEach(g => {
        cumulative += (g.incomeShare || 0)
        boundaries.push((cumulative / totalValue) * 100)
      })
    }

    return boundaries
  }

  const xPositions = computeXPositions()
  const groupBoundaries = computeGroupBoundaries()

  return (
    <div>
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
          <span className="number-value">{(Math.round(totalIndividuals / 10) * 10).toLocaleString('en-US')}</span>
        </div>

      </div>
      
      <div className="chart-container">
        <Chart 
          data={chartData} 
          originalData={countryData.groups}
          color={countryData.color} 
          xPositions={xPositions}
          groupBoundaries={groupBoundaries}
          xScaleMode={xScaleMode}
        />
        
        <div className="chart-footer">
          <div className="scale-mode-selector">
            <span className="scale-label">Change X-axis scale</span>
            <div className="scale-buttons">
              <button
                className={`scale-button ${xScaleMode === 'regular' ? 'active' : ''}`}
                onClick={() => setXScaleMode('regular')}
                onMouseEnter={(e) => handleMouseEnter('regular', e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                Regular
              </button>
              <button
                className={`scale-button ${xScaleMode === 'income' ? 'active' : ''}`}
                onClick={() => setXScaleMode('income')}
                onMouseEnter={(e) => handleMouseEnter('income', e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                Income
              </button>
              <button
                className={`scale-button ${xScaleMode === 'population' ? 'active' : ''}`}
                onClick={() => setXScaleMode('population')}
                onMouseEnter={(e) => handleMouseEnter('population', e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                Population
              </button>
            </div>
          </div>
          
          <Link to="/methodology" className="source-link">Methodology →</Link>
        </div>
      </div>
    
      <div className="revenue-box">
        <div className="revenue-col">
          <span className="revenue-label">Extra fiscal revenues</span>
          <span className="revenue-value">{Math.round(totalRevenue).toLocaleString('en-US')} B{countryData.currency}</span>
          <span className="revenue-label">each year</span>
        </div>
        <div className="revenue-col">
          <span className="revenue-label">How much is that?</span>
          {countryData.gdp && (
            <span className="revenue-value-small">
              {((totalRevenue / countryData.gdp) * 100).toFixed(1)}% of GDP
            </span>
          )}
          {countryData.gdp && countryData.deficit && (
            <span className="revenue-value-small">
              {((totalRevenue / (countryData.gdp * countryData.deficit)) * 100).toFixed(0)}% of public deficit
            </span>
          )}
        </div>
      </div>

      {/* Tooltip */}
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
          {tooltipDescriptions[hoveredElement]}
        </div>
      )}
        
    </div>
  )
}

export default SimulatorSection