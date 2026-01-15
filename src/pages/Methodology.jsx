import 'katex/dist/katex.min.css';
import { Link } from "react-router-dom";

function Methodology() {
  return (
    <section className="section">
      <h1>Methodology</h1>

      <div className="methodology-content">

        <h2>Economic Concepts</h2>

        <p>
          <strong>Pre-tax income</strong> is the total economic income earned by an individual before any taxes are deducted. It includes all forms of income, 
          whether taxed or not, such as wages, dividends, and retained profits made by firms owned by wealthy individuals. 
          This concept allows for consistent comparison of economic resources across individuals. 
          By ranking all individuals by their pre-tax income, we can divide the population into groups - from the bottom 50% to the billionaires - 
          and analyze how taxes affect each segment of the income distribution.
        </p>

        <p>
          The <strong>effective tax rate</strong> is the share of pre-tax income actually paid in taxes. 
          Unlike statutory rates, it captures what people truly pay after accounting for deductions, exemptions, and tax avoidance, 
          expressed as a fraction of their total economic income. Crucially, the rates shown in this simulator include all taxes combined: income taxes, 
          payroll taxes, consumption taxes, corporate taxes (attributed to shareholders), wealth taxes, and estate taxes. 
        </p>

        <p>
          The <strong>minimum wealth tax</strong> is levied on an individual's total net wealth: the sum of all 
          assets (real estate, financial portfolios, business equity, etc.) minus liabilities. The "minimum" aspect works as a floor mechanism: 
          it guarantees that the ultra-wealthy pay at least a certain percentage of their wealth in taxes each year. If their existing tax 
          payments already exceed this floor, they owe nothing additional. If not, they pay the difference. 
          This design ensures the tax only kicks in when needed to reach the minimum threshold.
        </p>


        <h2>Data Sources</h2>
        <p>
          For each country, we use tabulations describing the distribution of pre-tax income 
          and tax rates by income group, from academic studies. See <Link to="/papers">Papers</Link>. 
        </p>
        <h2>Simulation Assumptions</h2>

        <p>
          For computing effective tax rates and extra fiscal revenues under the minimum wealth tax, we make the following assumptions:
        </p>

        <ul className="methodology-list">
          <li>
            We assume a uniform income-to-wealth ratio within each income group: 9% for billionaires 
            and 11% for millionaires. This allows computing wealth tax liabilities from income data.
          </li>
          <li>
            Wealth is assumed to follow a Pareto distribution within each income group, 
            where the Pareto coefficient is estimated from the income threshold and average income of the group.
          </li>
          <li>
            We assume 7% annual nominal income growth (10% for Brazil) to project income values from 
            the data year to 2025.
          </li>
        </ul>
        
        <p>
          Download the <a href="/wealth-tax-simulation.xlsx" download className="download-link">Excel version of the simulator</a> for complete details of the computations. 
        </p>

      </div>
    </section>
  )
}

export default Methodology