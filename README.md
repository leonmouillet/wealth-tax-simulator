# Wealth Tax Simulator

An interactive web simulator showing how a minimum wealth tax would affect tax progressivity and fiscal revenues across multiple countries. Built with React and Vite.

**Live site:** [wealth-tax-simulator.vercel.app](https://wealth-tax-simulator.vercel.app)

## Key Files

| File | Purpose |
|------|---------|
| `src/data/*.json` | Input data for each country |
| `src/utils/calculations.js` | All simulation formulas|
| `src/components/Chart.jsx` | Interactive chart component with X-axis scaling modes |
| `src/components/SimulatorSection.jsx` | Simulator interface with tax parameters |
| `src/components/ComparisonSection.jsx` | Cross-country comparison chart |
| `src/pages/Home.jsx` | Assembles the main page sections |
| `src/index.css` | All CSS styles in one place |
| `public/wealth-tax-simulator.xlsx` | Downloadable Excel version of the simulator |

## Adding a New Country

1. Create the data file `src/data/[country].json`, following the exact same format as the other countries.

2. Import the data file in `src/pages/Home.jsx`:
```jsx
import countryData from '../data/[country].json'

const ALL_COUNTRIES = [franceData, usData, ..., countryData]
```

3. Add the corresponding reference to Papers page in `src/pages/Papers.jsx`.

## Modifying the Simulation

All calculations are in `src/utils/calculations.js`:

| Function | Purpose |
|----------|---------|
| `computeWealthThreshold()` | Converts income threshold to wealth threshold |
| `computeAlpha()` | Calculates the Pareto coefficient (alpha) |
| `computeCorrectedAlpha()` | Calculates corrected alpha accounting for next group |
| `computeShareExposed()` | Fraction of wealth above tax threshold |
| `computeIndividualsAffected()` | Number of individuals affected in a group |
| `computeReformRate()` | New effective tax rate under the reform |
| `computeExtraRevenue()` | Additional fiscal revenues per group |
| `computeChartData()` | Prepares data for the chart |
| `computeTotalRevenue()` | Sums revenues across all groups |
| `computeTotalIndividuals()` | Total number of individuals affected by the tax |

To change the simulation logic, edit these functions.

## Local Development

**Prerequisites:** Node.js (v18+)
```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser. Changes auto-reload.

## Deployment

The site is deployed on [Vercel](https://vercel.com), connected to the GitHub repository. Every push to the `main` branch triggers a new deployment automatically.

**Workflow to update the site:**
```bash
# After modifying files
git add .
git commit -m "Description of changes"
git push
```

The site updates automatically within ~30 seconds.