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
          whether taxed or not, such as wages, dividends, and profits retained in the firms owned by wealthy individuals. 
          This concept allows for consistent comparison of economic resources across individuals. 
          By ranking all individuals by their pre-tax income, we can divide the population into groups - from the bottom 10% to the billionaires - 
          and count how much taxes are paid by each segment of the income distribution in proportion to their income.
        </p>

        <p>
          The <strong>effective tax rate</strong> is the share of pre-tax income actually paid in taxes. 
          Unlike statutory rates, it captures what people truly pay after accounting for deductions, exemptions, and tax avoidance, 
          expressed as a fraction of their total economic income. The rates shown in this simulator include all taxes combined: income taxes, 
          payroll taxes, consumption taxes, corporate taxes (attributed to shareholders), wealth taxes, and estate taxes. 
        </p>

        <p>
          The <strong>minimum wealth tax</strong> is levied on an individual's total net wealth: the sum of all 
          assets (real estate, financial portfolios, business equity, etc.) minus liabilities. The "minimum" aspect works as a floor mechanism: 
          it guarantees that the ultra-wealthy pay at least a certain percentage of their wealth in taxes each year. If their existing tax 
          payments already exceed this floor, they owe nothing additional. If not, they pay the difference. 
        </p>


        <h2>Simulation Method</h2>
        <p>
          For each country, we use tabulations describing the distribution of pre-tax income 
          and tax rates by income group, from academic studies. See <Link to="/papers">Papers</Link>. 
          For computing effective tax rates and extra fiscal revenues under the minimum wealth tax, we assume a uniform income-to-wealth ratio within each income group. 
          This ratio is taken decreasing along the income distribution, from 13% for the group <i>P99-P99.9</i> to 9% for the group <i>P99.999-Billionaires</i>. 
          The ratio for billionnaires is calibrated using the average wealth of billionnaires recored in the Forbes list.
        </p>
        <p>
          Download the <a href="/wealth-tax-simulation.xlsx" download className="download-link">Excel version of the simulator</a> for complete details of the computations. 
          We welcome any comments, questions or suggestions regarding these simulations. Please do not hesitate to contact us at le.mouillet@gmail.com. 
        </p>

      </div>
    </section>
  )
}

export default Methodology