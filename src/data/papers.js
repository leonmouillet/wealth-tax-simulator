// Papers database
export const PAPERS_DATA = [
  {
    country: "France",
    authors: "Bozio, Garbinti, Goupille-Lebret, Guillot, Piketty",
    year: 2020,
    shortRef: "Bozio et al. (2020)",
    title: "Predistribution vs. Redistribution: Evidence from France and the U.S.",
    url: "https://wid.world/www-site/uploads/2020/11/WorldInequalityLab_WP2020_22_PredistributionvsRedistribution.pdf"
  },
  {
    country: "France",
    authors: "Bach, Bozio, Guillouzouic, Malgouyres",
    year: 2025,
    shortRef: "Bach et al. (2025)",
    title: "Do Billionaires Pay Taxes?",
    url: "https://www.ipp.eu/wp-content/uploads/2025/09/BBGM_2025.pdf"
  },
  {
    country: "United States",
    authors: "Piketty, Saez, Zucman",
    year: 2018,
    shortRef: "Piketty et al. (2018)",
    title: "Distributional National Accounts: Methods and Estimates for the United States",
    url: "https://gabriel-zucman.eu/usdina/"
  },
  {
    country: "United States",
    authors: "Balkir, Saez, Yagan, Zucman",
    year: 2025,
    shortRef: "Balkir et al. (2025)",
    title: "How Much Tax Do US Billionaires Pay? Evidence From Administrative Data",
    url: "https://gabriel-zucman.eu/files/BSYZ2025NBER.pdf"
  },
  {
    country: "Brazil",
    authors: "Palomo, Bhering, Scot, Bachas et al.",
    year: 2025,
    shortRef: "Palomo et al. (2025)",
    title: "Tax Progressivity and Inequality in Brazil",
    url: "https://gabriel-zucman.eu/files/PalomoEtal2025.pdf"
  },
  {
    country: "Netherlands",
    authors: "Bruil, van Essen, Leenders, Lejour, Möhlmann, Rabaté",
    year: 2025,
    shortRef: "Bruil et al. (2025)",
    title: "Inequality and Redistribution in the Netherlands",
    url: "https://wouterleenders.eu/Bruiletal2025WP.pdf"
  },
  {
    country: "Italy",
    authors: "Guzzardi, Palagi, Roventini, Santoro",
    year: 2024,
    shortRef: "Guzzardi et al. (2024)",
    title: "Reconstructing Income Inequality in Italy",
    url: "https://wid.world/document/reconstructing-income-inequality-in-italy-new-evidence-and-tax-policy-implications-from-dina-world-inequality-lab-working-paper-2022-02/"
  }
]

// Get papers for a single country
export function getCountryPapers(country) {
  return PAPERS_DATA.filter(p => p.country === country)
}

// Get papers for multiple countries
export function getMultipleCountriesPapers(countries) {
  const uniquePapers = new Map()
  
  PAPERS_DATA.forEach(paper => {
    if (countries.includes(paper.country)) {
      const key = `${paper.authors}-${paper.year}`
      if (!uniquePapers.has(key)) {
        uniquePapers.set(key, paper)
      }
    }
  })
  
  return Array.from(uniquePapers.values())
}

// Format citations for display
export function formatCitations(papers) {
  return papers.map(p => p.shortRef).join(', ')
}

// Format full author list with year
export function formatFullAuthors(papers) {
  return papers.map(p => `${p.authors} (${p.year})`).join('; ')
}