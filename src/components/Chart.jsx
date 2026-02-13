import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'
import { exportChartToPNG, exportChartToExcel } from '../utils/export'

// Constants
const MOBILE_BREAKPOINT = 768
const MIN_LABEL_SPACING = 3 // Minimum spacing between labels in % of X-axis

function Chart({ 
  data, 
  originalData, 
  color = "#e63946", 
  xPositions = null, 
  groupBoundaries = null, 
  xScaleMode = 'regular',
  setXScaleMode,
  onTooltipEnter,
  onTooltipMove,
  onTooltipLeave,
  country, 
  threshold, 
  taxRate, 
  currency 
}) {  
  
  const chartRef = useRef(null)

  // State management
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredGroupIndex, setHoveredGroupIndex] = useState(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const previousModeRef = useRef(xScaleMode)
  
  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Detect X-scale mode changes to disable animation
  useEffect(() => {
    if (previousModeRef.current !== xScaleMode) {
      setShouldAnimate(false)
      previousModeRef.current = xScaleMode
    } else {
      setShouldAnimate(true)
    }
  }, [xScaleMode, data])

  // Memoized chart data with X positions
  const chartData = useMemo(() => 
    xPositions ? data.map((d, i) => ({ ...d, x: xPositions[i] })) : data,
    [data, xPositions]
  )

  // Memoized Y-axis configuration
  const { yMax, yTicks } = useMemo(() => {
    const maxRate = Math.max(...data.map(d => Math.max(d.currentRate || 0, d.reformRate || 0)))
    const max = Math.ceil(maxRate / 10) * 10
    return {
      yMax: max,
      yTicks: Array.from({ length: max / 10 + 1 }, (_, i) => i * 10)
    }
  }, [data])

  // Determine which labels to display (all in regular mode, filtered in population/income mode)
  const visibleLabelIndices = useMemo(() => {
    if (!xPositions || xPositions.length === 0) return []
    
    // Show all labels in regular mode
    if (xScaleMode === 'regular') {
      return data.map((_, idx) => idx)
    }
    
    // Priority-based greedy selection for population/income modes
    const getPriority = (group) => {
      if (group === 'Billionaires') return 0
      if (group.includes('P99.99')) return 1
      if (group.includes('P99.9')) return 2
      if (group.includes('P99')) return 3
      if (group.includes('P90')) return 4
      if (group.includes('P10') || group.includes('P20')) return 5
      return 6
    }
    
    // Sort indices by priority
    const sortedIndices = Array.from({ length: data.length }, (_, i) => i)
      .sort((a, b) => getPriority(data[a].group) - getPriority(data[b].group))
    
    // Greedy selection: add label if it doesn't overlap with already selected ones
    const selected = []
    for (const idx of sortedIndices) {
      if (selected.every(sel => Math.abs(xPositions[idx] - xPositions[sel]) >= MIN_LABEL_SPACING)) {
        selected.push(idx)
      }
    }
    
    return selected.sort((a, b) => a - b)
  }, [data, xPositions, xScaleMode])

  // Build X-axis label data for ReferenceLine components
  const xAxisLabels = useMemo(() => {
    if (!xPositions) return []
    return visibleLabelIndices.map(idx => ({
      position: xPositions[idx],
      label: data[idx]?.group
    }))
  }, [data, xPositions, visibleLabelIndices])

  // Handle mouse movement to highlight hovered group
  const handleMouseMove = useCallback((state) => {
    if (!state?.activeLabel || !xPositions) {
      setHoveredGroupIndex(null)
      return
    }
    
    const xValue = parseFloat(state.activeLabel)
    
    // Find closest group to mouse position
    let closestIndex = 0
    let minDistance = Math.abs(xPositions[0] - xValue)
    
    for (let i = 1; i < xPositions.length; i++) {
      const distance = Math.abs(xPositions[i] - xValue)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }
    
    setHoveredGroupIndex(closestIndex)
  }, [xPositions])

  const handleMouseLeave = useCallback(() => {
    setHoveredGroupIndex(null)
  }, [])

  // Custom tooltip with tax rates and additional info (income share, population)
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    
    const groupData = chartData.find(d => d.x === label)
    if (!groupData) return null
    
    const groupIndex = data.findIndex(d => d.group === groupData.group)
    if (groupIndex === -1) return null
    
    const originalGroup = originalData?.[groupIndex]
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '13px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '13px' }}>
          {groupData.group}
        </div>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color, marginBottom: '2px', fontSize: '13px' }}>
            {entry.name}: {entry.value !== null ? `${entry.value.toFixed(1)}%` : 'N/A'}
          </div>
        ))}
        
        {/* Additional info: income share and population */}
        {originalGroup && (originalGroup.incomeShare !== null || originalGroup.n) && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
            {originalGroup.incomeShare !== null && originalGroup.incomeShare !== undefined && (
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>
                Income share: {(originalGroup.incomeShare * 100).toFixed(1)}%
              </div>
            )}
            {originalGroup.n && (
              <div style={{ color: '#666', fontSize: '12px' }}>
                Population: {originalGroup.n.toLocaleString('en-US')}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }, [chartData, data, originalData])

  const handleExportPNG = () => {
    if (chartRef.current) {
      exportChartToPNG(chartRef.current, {
        country,
        threshold,
        taxRate,
        currency,
        title: 'Effect of a wealth tax on tax progressivity. Effective tax rate along the income distribution, without and with a wealth tax',
        type: 'simulation'
      })
    }
  }

  const handleExportExcel = () => {
    exportChartToExcel(chartData, {
      country,
      threshold,
      taxRate,
      currency,
      title: 'Effect of a wealth tax on tax progressivity. Effective tax rate along the income distribution, without and with a wealth tax',
      type: 'simulation'
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="chart-title" style={{ margin: 0 }}>
          Effect of the wealth tax on tax progressivity
        </h3>
      </div>
      <div ref={chartRef}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          key={xScaleMode}
          data={chartData} 
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
          {/* Shaded area for hovered group (disabled on mobile) */}
          {!isMobile && hoveredGroupIndex !== null && groupBoundaries && hoveredGroupIndex < groupBoundaries.length - 1 && (
            <ReferenceArea
              x1={groupBoundaries[hoveredGroupIndex]}
              x2={groupBoundaries[hoveredGroupIndex + 1]}
              fill="#000000"
              fillOpacity={0.05}
              strokeOpacity={0}
            />
          )}
          
          {/* Vertical lines at group boundaries */}
          {groupBoundaries?.map((boundary, idx) => (
            <ReferenceLine 
              key={`boundary-${idx}`}
              x={boundary} 
              stroke="#d0d0d0" 
              strokeDasharray="3 3"
            />
          ))}
          
          {/* Labels at group centers */}
          {xAxisLabels.map((item, idx) => (
            <ReferenceLine 
              key={`label-${idx}`}
              x={item.position}
              stroke="transparent"
              label={{
                value: item.label,
                position: 'bottom',
                angle: -45,
                offset: 10,
                style: { 
                  fontSize: xScaleMode === 'regular' ? 12 : 11,
                  fill: '#666',
                  textAnchor: 'end'
                }
              }}
            />
          ))}
          
          {/* X-axis with ticks at boundaries */}
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={[0, 100]} 
            ticks={groupBoundaries}
            tickLine={true}
            tick={{ stroke: '#666' }}
            tickFormatter={() => ''}
            height={100}
          />
          
          <YAxis domain={[0, yMax]} tickFormatter={(v) => `${v}%`} ticks={yTicks} interval={0} />
          
          {!isMobile && (
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
            />
          )}
          
        <Legend 
          verticalAlign="top" 
          align="right"
          wrapperStyle={{ paddingBottom: '20px' }}
        />
                  
          {/* Data lines */}
          <Line 
            type="monotone" 
            dataKey="currentRate" 
            name="Current tax rate" 
            stroke="#888" 
            strokeWidth={2} 
            activeDot={false} 
            connectNulls 
            isAnimationActive={shouldAnimate}
          />
          <Line 
            type="monotone" 
            dataKey="reformRate" 
            name="Tax rate with a wealth tax" 
            stroke={color} 
            strokeWidth={2} 
            activeDot={false} 
            connectNulls 
            isAnimationActive={shouldAnimate}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
     <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', marginBottom: '10px' }}>
        <div className="scale-mode-selector">
          <span className="scale-label">Change X-axis scale</span>
          <div className="scale-buttons">
            <button
              className={`scale-button ${xScaleMode === 'regular' ? 'active' : ''}`}
              onClick={() => setXScaleMode('regular')}
              onMouseEnter={(e) => onTooltipEnter?.('regular', e)}
              onMouseMove={onTooltipMove}
              onMouseLeave={onTooltipLeave}
            >
              Regular
            </button>
            <button
              className={`scale-button ${xScaleMode === 'income' ? 'active' : ''}`}
              onClick={() => setXScaleMode('income')}
              onMouseEnter={(e) => onTooltipEnter?.('income', e)}
              onMouseMove={onTooltipMove}
              onMouseLeave={onTooltipLeave}
            >
              Income
            </button>
            <button
              className={`scale-button ${xScaleMode === 'population' ? 'active' : ''}`}
              onClick={() => setXScaleMode('population')}
              onMouseEnter={(e) => onTooltipEnter?.('population', e)}
              onMouseMove={onTooltipMove}
              onMouseLeave={onTooltipLeave}
            >
              Population
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer avec export et methodology */}
      <div className="chart-footer">
        <div className="export-section">
          <span className="scale-label">Export data</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExportPNG} className="export-button">
              🖼️ PNG
            </button>
            <button onClick={handleExportExcel} className="export-button">
              📊 Excel
            </button>
          </div>
        </div>
        
        <Link to="/methodology" className="source-link">Methodology →</Link>
      </div>
    </div>
  )
}
export default Chart