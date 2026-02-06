import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'

function ComparisonSection({ countries }) {

  const [isMobile, setIsMobile] = useState(false)
  const [hoveredGroupIndex, setHoveredGroupIndex] = useState(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const groups = countries[0].groups.map(g => g.group)
  const numGroups = groups.length
  
  // Calculer les positions X (milieu de chaque groupe)
  const xPositions = groups.map((_, idx) => ((idx + 0.5) / numGroups) * 100)
  
  // Calculer les frontières (extrémités des groupes)
  const groupBoundaries = [0]
  for (let i = 1; i <= numGroups; i++) {
    groupBoundaries.push((i / numGroups) * 100)
  }
  
  // Créer les données du chart avec positions X
  const chartData = groups.map((group, idx) => {
    const entry = { group, x: xPositions[idx] }
    countries.forEach((country) => {
      const rate = country.groups[idx]?.totalRate
      entry[country.country] = rate ? rate * 100 : null
    })
    return entry
  })

  // Labels pour l'axe X
  const xAxisLabels = groups.map((group, idx) => ({
    position: xPositions[idx],
    label: group
  }))

  // Fonction pour déterminer le groupe survolé
  const handleMouseMove = (state) => {
    if (!state || !state.activeLabel) {
      setHoveredGroupIndex(null)
      return
    }
    
    // activeLabel contient la valeur X du point survolé
    const xValue = parseFloat(state.activeLabel)
    
    // Trouver l'index du groupe qui correspond à cette position X
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
  }

  const handleMouseLeave = () => {
    setHoveredGroupIndex(null)
  }

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart 
        data={chartData} 
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        
        {/* Zone grisée pour le groupe survolé */}
        {!isMobile && hoveredGroupIndex !== null && hoveredGroupIndex < groupBoundaries.length - 1 && (
          <ReferenceArea
            x1={groupBoundaries[hoveredGroupIndex]}
            x2={groupBoundaries[hoveredGroupIndex + 1]}
            fill="#000000"
            fillOpacity={0.05}
            strokeOpacity={0}
          />
        )}
        
        {/* Lignes verticales aux frontières des groupes */}
        {groupBoundaries.map((boundary, idx) => (
          <ReferenceLine 
            key={`boundary-${idx}`}
            x={boundary} 
            stroke="#d0d0d0" 
            strokeDasharray="3 3"
          />
        ))}
        
        {/* Labels aux centres des groupes */}
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
        
        {/* Axe X avec ticks aux frontières */}
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
        
        <YAxis domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
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