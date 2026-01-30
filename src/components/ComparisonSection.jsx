import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const X_POSITIONS = [0, 40, 60, 70, 80, 90, 100]

function ComparisonSection({ countries }) {

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const groups = countries[0].groups.map(g => g.group)
  
  const chartData = groups.map((group, idx) => {
    const entry = { group, x: X_POSITIONS[idx] }
    countries.forEach((country) => {
      const rate = country.groups[idx]?.totalRate
      entry[country.country] = rate ? rate * 100 : null
    })
    return entry
  })

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          type="number" 
          domain={[0, 100]} 
          ticks={X_POSITIONS}
          tickFormatter={(x) => chartData.find(d => d.x === x)?.group || ''}
          textAnchor="end"
          angle={-45}
          height={80}
          interval={0}
          tick={{ fontSize: 12, dy: 3}}
        />
        <YAxis domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
        {!isMobile && (
          <Tooltip 
            formatter={(v) => `${v.toFixed(1)}%`}
            labelFormatter={(x) => chartData.find(d => d.x === x)?.group || ''}
            contentStyle={{ fontSize: '13px', padding: '6px 10px' }}
            itemStyle={{ fontSize: '13px', padding: '2px 0' }}
            labelStyle={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}
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
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default ComparisonSection