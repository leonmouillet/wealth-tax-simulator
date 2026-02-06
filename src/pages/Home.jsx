import { Link } from 'react-router-dom'

import franceData from '../data/fra.json'
import usData from '../data/usa.json'
import netherlandsData from '../data/ndl.json'
import brazilData from '../data/bra.json'
import italyData from '../data/ita.json'

import ComparisonSection from '../components/ComparisonSection'
import SimulatorSection from '../components/SimulatorSection'

const ALL_COUNTRIES = [franceData, usData, netherlandsData, brazilData, italyData]

function Home() {
  const scrollToSimulator = () => {
    document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className="section">
        <h1>Billionaires don't pay income tax...</h1>
        <p className="section-intro">
          Exposed by recent studies across multiple countries, the ultra-wealthy face lower effective 
          tax rates than ordinary people.
        </p>
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Effective tax rate (all taxes combined) along the income distribution</h3>
            <button onClick={scrollToSimulator} className="cta-button">
              Try the simulator ↓
            </button>
          </div>
          <ComparisonSection countries={ALL_COUNTRIES} />
          <Link to="/papers" className="source-link">Sources →</Link>
        </div>
      </section>

      <section className="section" id="simulator">
        <h1>... and we're going to change that.</h1>
        <p className="section-intro">
          Explore how a <strong>minimum wealth tax</strong> would restore progressivity and generate significant revenues. 
          Adjust the parameters below to see the impact in each country.
        </p>
        <SimulatorSection countries={ALL_COUNTRIES} />
      </section>
    </>
  )
}

export default Home