function Parameters({ taxRate, setTaxRate, threshold, setThreshold, currency = "€" }) {
  // Convert between slider value (logarithmic) and actual threshold
  const logMin = 0 // log10(1) = 0
  const logMax = 3 // log10(1000) = 3
  
  // Smart rounding based on magnitude
  const smartRound = (value) => {
    if (value < 10) {
      return Math.round(value) // 1-10: round to integer
    } else if (value < 100) {
      return Math.round(value / 5) * 5 // 10-100: round to nearest 5
    } else {
      return Math.round(value / 50) * 50 // 100-1000: round to nearest 50
    }
  }
  
  // Convert threshold to slider position
  const thresholdToSlider = (value) => {
    return Math.log10(value) * 100 / logMax
  }
  
  // Convert slider position to threshold
  const sliderToThreshold = (sliderValue) => {
    const logValue = (sliderValue * logMax) / 100
    const rawValue = Math.pow(10, logValue)
    return smartRound(rawValue)
  }
  
  const handleThresholdChange = (e) => {
    const sliderValue = Number(e.target.value)
    const newThreshold = sliderToThreshold(sliderValue)
    setThreshold(newThreshold)
  }
  
  return (
    <div className="parameters">
      <div className="parameter">
        <span className="parameter-label">Wealth threshold</span>
        <input
          type="range"
          className="parameter-slider"
          min="0"
          max="100"
          step="0.1"
          value={thresholdToSlider(threshold)}
          onChange={handleThresholdChange}
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
          step="0.5"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
        <span className="parameter-value">{taxRate.toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default Parameters