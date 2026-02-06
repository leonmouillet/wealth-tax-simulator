import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'

function Chart({ data, originalData, color = "#e63946", xPositions = null, groupBoundaries = null, xScaleMode = 'regular' }) {

  const [isMobile, setIsMobile] = useState(false)
  const [hoveredGroupIndex, setHoveredGroupIndex] = useState(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const previousModeRef = useRef(xScaleMode)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Détecter les changements de mode X
  useEffect(() => {
    if (previousModeRef.current !== xScaleMode) {
      // Mode X vient de changer : pas d'animation
      setShouldAnimate(false)
      previousModeRef.current = xScaleMode
    } else {
      // Changement de données (taxe) : animation
      setShouldAnimate(true)
    }
  }, [xScaleMode, data])

  const chartData = xPositions 
    ? data.map((d, i) => ({ ...d, x: xPositions[i] }))
    : data

  const maxRate = Math.max(...data.map(d => Math.max(d.currentRate || 0, d.reformRate || 0)))
  const yMax = Math.ceil(maxRate / 10) * 10
  const yTicks = Array.from({ length: yMax / 10 + 1 }, (_, i) => i * 10)

  // Fonction pour déterminer quels labels afficher
  const getVisibleLabels = () => {
    if (!xPositions || xPositions.length === 0) return []
    
    // En mode regular, afficher tous les labels
    if (xScaleMode === 'regular') {
      return data.map((d, idx) => idx)
    }
    
    // En mode population/income, calculer dynamiquement
    const visibleIndices = []
    
    // Estimation de l'espace minimum nécessaire par label (en % de l'axe X)
    const minSpacing = 6
    
    // Priorité des groupes
    const getPriority = (group) => {
      if (group === 'Billionaires') return 100
      if (group.includes('P99.99')) return 80
      if (group.includes('P99.9')) return 70
      if (group.includes('P99')) return 60
      if (group.includes('P90')) return 50
      if (group.includes('P10') || group.includes('P20')) return 40
      return 30
    }
    
    // Créer une liste avec positions, priorités et indices
    const labelData = data.map((d, idx) => ({
      index: idx,
      position: xPositions[idx],
      group: d.group,
      priority: getPriority(d.group)
    }))
    
    // Trier par priorité décroissante
    const sortedByPriority = [...labelData].sort((a, b) => b.priority - a.priority)
    
    // Algorithme greedy
    const selected = []
    
    for (const item of sortedByPriority) {
      let canAdd = true
      
      for (const selectedIdx of selected) {
        const distance = Math.abs(xPositions[item.index] - xPositions[selectedIdx])
        if (distance < minSpacing) {
          canAdd = false
          break
        }
      }
      
      if (canAdd) {
        selected.push(item.index)
      }
    }
    
    return selected.sort((a, b) => a - b)
  }

  const visibleLabelIndices = getVisibleLabels()

  // Créer les labels pour l'axe X
  const getXAxisLabels = () => {
    return xPositions.map((pos, idx) => {
      if (!visibleLabelIndices.includes(idx)) {
        return null
      }
      const group = data[idx]?.group
      return { position: pos, label: group }
    }).filter(Boolean)
  }

  const xAxisLabels = getXAxisLabels()

  // Fonction pour déterminer le groupe survolé en fonction de la position X
  const handleMouseMove = (state) => {
    if (!state || !state.activeLabel) {
      setHoveredGroupIndex(null)
      return
    }
    
    // activeLabel contient la valeur X du point survolé
    const xValue = parseFloat(state.activeLabel)
    
    // Trouver l'index du groupe qui correspond à cette position X
    if (xPositions) {
      // Trouver le groupe dont la position est la plus proche
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
  }

  const handleMouseLeave = () => {
    setHoveredGroupIndex(null)
  }

  // Custom Tooltip avec informations supplémentaires
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null
    
    // Trouver le groupe correspondant via label (qui contient la position X)
    const groupData = chartData.find(d => d.x === label)
    if (!groupData) return null
    
    // Trouver l'index du groupe
    const groupIndex = data.findIndex(d => d.group === groupData.group)
    if (groupIndex === -1) return null
    
    // Accéder aux données originales
    const originalGroup = originalData ? originalData[groupIndex] : null
    
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
        
        {/* Informations supplémentaires */}
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
  }

  return (
    <div>
      <h3 className="chart-title">Effect of the wealth tax on tax progressivity</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          key={xScaleMode}
          data={chartData} 
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
          {/* Zone grisée pour le groupe survolé */}
          {!isMobile && hoveredGroupIndex !== null && groupBoundaries && hoveredGroupIndex < groupBoundaries.length - 1 && (
            <ReferenceArea
              x1={groupBoundaries[hoveredGroupIndex]}
              x2={groupBoundaries[hoveredGroupIndex + 1]}
              fill="#000000"
              fillOpacity={0.05}
              strokeOpacity={0}
            />
          )}
          
          {/* Lignes verticales aux frontières des groupes */}
          {groupBoundaries && groupBoundaries.map((boundary, idx) => (
            <ReferenceLine 
              key={`boundary-${idx}`}
              x={boundary} 
              stroke="#d0d0d0" 
              strokeDasharray="3 3"
            />
          ))}
          
          {/* Labels aux centres des groupes comme ReferenceLine avec Label */}
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
          
          <YAxis domain={[0, yMax]} tickFormatter={(v) => `${v}%`} ticks={yTicks} interval={0} />
          {!isMobile && (
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
            />
          )}
          <Legend />
          <Line 
            type="monotone" 
            dataKey="currentRate" 
            name="Current rate" 
            stroke="#888" 
            strokeWidth={2} 
            activeDot={false} 
            connectNulls 
            isAnimationActive={shouldAnimate}
          />
          <Line 
            type="monotone" 
            dataKey="reformRate" 
            name="Rate under reform" 
            stroke={color} 
            strokeWidth={2} 
            activeDot={false} 
            connectNulls 
            isAnimationActive={shouldAnimate}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart