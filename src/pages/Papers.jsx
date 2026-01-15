function Papers() {
  const papers = [
    {
      country: "France",
      authors: "Bozio, Garbinti, Goupille-Lebret, Guillot, Piketty (2020)",
      title: "Predistribution vs. Redistribution: Evidence from France and the U.S.",
      url: "https://wid.world/www-site/uploads/2020/11/WorldInequalityLab_WP2020_22_PredistributionvsRedistribution.pdf"
    },
    {
      country: "France",
      authors: "Bach, Bozio, Guillouzouic, Malgouyres (2025)",
      title: "Do Billionaires Pay Taxes?",
      url: "https://www.ipp.eu/wp-content/uploads/2025/09/BBGM_2025.pdf"
    },
    {
      country: "United States",
      authors: "Saez, Zucman (2019)",
      title: "The Triumph of Injustice",
      url: "https://gabriel-zucman.eu/"
    },
    {
      country: "United States",
      authors: "Balkir, Saez, Yagan, Zucman (2025)",
      title: "How Much Tax Do US Billionaires Pay? Evidence From Administrative Data",
      url: "https://gabriel-zucman.eu/files/BSYZ2025NBER.pdf"
    },
    {
      country: "Brazil",
      authors: "Palomo, Bhering, Scot, Bachas et al. (2025)",
      title: "Tax Progressivity and Inequality in Brazil",
      url: "https://gabriel-zucman.eu/files/PalomoEtal2025.pdf"
    },
    {
      country: "Netherlands",
      authors: "Bruil, van Essen, Leenders, Lejour, Möhlmann, Rabaté (2025)",
      title: "Inequality and Redistribution in the Netherlands",
      url: "https://wouterleenders.eu/Bruiletal2025WP.pdf"
    },
    {
      country: "Italy",
      authors: "Guzzardi, Palagi, Roventini, Santoro (2024)",
      title: "Reconstructing Income Inequality in Italy",
      url: "https://wid.world/document/reconstructing-income-inequality-in-italy-new-evidence-and-tax-policy-implications-from-dina-world-inequality-lab-working-paper-2022-02/"
    }
  ]

  return (
    <section className="section">
      <h1>Research Papers</h1>
      <p className="section-intro">
        The data used in this simulator comes from the following academic studies on tax progressivity.
      </p>

      <table className="papers-table">
        <tbody>
          {papers.map((paper, idx) => (
            <tr key={idx}>
              <td className="paper-country">{paper.country}</td>
              <td>
                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="paper-link">
                  {paper.authors}
                </a>
                <span className="paper-title">{paper.title}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default Papers