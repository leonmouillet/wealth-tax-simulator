import { PAPERS_DATA } from '../data/papers'

function Papers() {
  return (
    <section className="section">
      <h1>Research Papers</h1>
      <p className="section-intro">
        The data used in the simulator comes from the following academic studies on income inequality and tax progressivity.
        New studies will soon be carried out on other countries, and will be integrated into the simulator.
      </p>

      <table className="papers-table">
        <tbody>
          {PAPERS_DATA.map((paper, idx) => (
            <tr key={idx}>
              <td className="paper-country">{paper.country}</td>
              <td>
                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="paper-link">
                  {paper.authors} ({paper.year})
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