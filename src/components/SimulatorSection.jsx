import { useState } from 'react'
import { Link } from 'react-router-dom'
import { computeChartData, computeTotalRevenue, computeTotalIndividuals } from '../utils/calculations'
import Parameters from './Parameters'
import Chart from './Chart'

function SimulatorSection({ countries }) {
  const [countryData, setCountryData] = useState(countries[0])
  const [threshold, setThreshold] = useState(100)
  const [taxRate, setTaxRate] = useState(2)

  const taxRateDecimal = taxRate / 100
  const chartData = computeChartData(countryData, taxRateDecimal, threshold)
  const totalRevenue = computeTotalRevenue(countryData, taxRateDecimal, threshold)
  const totalIndivduals = computeTotalIndividuals(countryData, threshold)

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
          <span className="number-label">Number of individuals potentially subject to the tax</span>
          <span className="number-value">{Math.round(totalIndivduals).toLocaleString('en-US')}</span>
        </div>

      </div>
      
      <div className="chart-container">
        <Chart data={chartData} color={countryData.color} />
        <Link to="/methodology" className="source-link">Methodology →</Link>
      </div>
    
      <div className="revenue-box">
        <div className="revenue-col">
          <span className="revenue-label">Extra fiscal revenues</span>
          <span className="revenue-value">{Math.round(totalRevenue).toLocaleString('en-US')} B{countryData.currency}</span>
          <span className="revenue-label">each year</span>
        </div>
        <div className="revenue-col">
          <span className="revenue-label">How much is that?</span>
        </div>
      </div>
        
    </div>
  )
}

export default SimulatorSection