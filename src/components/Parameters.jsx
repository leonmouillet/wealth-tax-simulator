function Parameters({ taxRate, setTaxRate, threshold, setThreshold, currency = "€" }) {
  return (
    <div className="parameters">
      <div className="parameter">
        <span className="parameter-label">Wealth threshold</span>
        <input
          type="range"
          className="parameter-slider"
          min="1"
          max="500"
          step="1"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
        <span className="parameter-value">{threshold} M{currency}</span>
      </div>
      
      <div className="parameter">
        <span className="parameter-label">Tax rate</span>
        <input
          type="range"
          className="parameter-slider"
          min="0"
          max="5"
          step="0.1"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
        <span className="parameter-value">{taxRate.toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default Parameters