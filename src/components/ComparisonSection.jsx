import { useState, useEffect, useMemo, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'

// Constants
const MOBILE_BREAKPOINT = 768
const Y_DOMAIN_MAX = 60

function ComparisonSection({ countries }) {

  // State management
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredGroupIndex, setHoveredGroupIndex] = useState(null)

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Memoized data calculations
  const { groups, numGroups, xPositions, groupBoundaries, chartData, xAxisLabels } = useMemo(() => {
    const grps = countries[0].groups.map(g => g.group)
    const num = grps.length
    
    // Calculate X positions (center of each group)
    const xPos = grps.map((_, idx) => ((idx + 0.5) / num) * 100)
    
    // Calculate group boundaries
    const boundaries = Array.from({ length: num + 1 }, (_, i) => (i / num) * 100)
    
    // Build chart data with rates for each country
    const data = grps.map((group, idx) => {
      const entry = { group, x: xPos[idx] }
      countries.forEach((country) => {
        const rate = country.groups[idx]?.totalRate
        entry[country.country] = rate ? rate * 100 : null
      })
      return entry
    })

    // Build X-axis labels
    const labels = grps.map((group, idx) => ({
      position: xPos[idx],
      label: group
    }))

    return {
      groups: grps,
      numGroups: num,
      xPositions: xPos,
      groupBoundaries: boundaries,
      chartData: data,
      xAxisLabels: labels
    }
  }, [countries])

  // Handle mouse movement to highlight hovered group
  const handleMouseMove = useCallback((state) => {
    if (!state?.activeLabel) {
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

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart 
        data={chartData} 
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        
        {/* Shaded area for hovered group (disabled on mobile) */}
        {!isMobile && hoveredGroupIndex !== null && hoveredGroupIndex < groupBoundaries.length - 1 && (
          <ReferenceArea
            x1={groupBoundaries[hoveredGroupIndex]}
            x2={groupBoundaries[hoveredGroupIndex + 1]}
            fill="#000000"
            fillOpacity={0.05}
            strokeOpacity={0}
          />
        )}
        
        {/* Vertical lines at group boundaries */}
        {groupBoundaries.map((boundary, idx) => (
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
                fontSize: 12,
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
          height={80}
        />
        
        <YAxis domain={[0, Y_DOMAIN_MAX]} tickFormatter={(v) => `${v}%`} />

        {!isMobile && (
          <Tooltip 
            formatter={(v) => v !== null && v !== undefined ? `${v.toFixed(1)}%` : 'N/A'}
            labelFormatter={(x) => chartData.find(d => d.x === x)?.group || ''}
            contentStyle={{ fontSize: '13px', padding: '6px 10px' }}
            itemStyle={{ fontSize: '13px', padding: '2px 0' }}
            labelStyle={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}
            cursor={false}
          />
        )}

        <Legend />
        
        {/* Country lines */}
        {countries.map((country) => (
          <Line
            key={country.country}
            type="monotone"
            dataKey={country.country}
            stroke={country.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default ComparisonSection