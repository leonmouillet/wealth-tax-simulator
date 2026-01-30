import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const X_POSITIONS = [0, 40, 60, 70, 80, 90, 100]

function Chart({ data, color = "#e63946" }) {

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const chartData = data.map((d, i) => ({
    ...d,
    x: X_POSITIONS[i],
  }))

  const maxRate = Math.max(...data.map(d => Math.max(d.currentRate, d.reformRate)))
  const yMax = Math.ceil(maxRate / 10) * 10
  const yTicks = Array.from({ length: yMax / 10 + 1 }, (_, i) => i * 10)

  return (
    <div>
    <h3 className="chart-title">Effect of the wealth tax on tax progressivity</h3>
    <ResponsiveContainer width="100%" height={400}>
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
          tick={{ fontSize: 12, dy: 3 }}
        />
        <YAxis domain={[0, yMax]} tickFormatter={(v) => `${v}%`} ticks={yTicks} interval={0} />
        {!isMobile && (
          <Tooltip 
            formatter={(v) => `${v.toFixed(1)}%`}
            labelFormatter={(x) => chartData.find(d => d.x === x)?.group || ''}
            contentStyle={{ fontSize: '13px', padding: '6px 10px' }}
            itemStyle={{ fontSize: '13px', padding: '2px 0' }}
            labelStyle={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}
          />
        )}
        <Legend />
        <Line type="monotone" dataKey="currentRate" name="Current rate" stroke="#888" strokeWidth={2} activeDot={false} />
        <Line type="monotone" dataKey="reformRate" name="Rate under reform" stroke={color} strokeWidth={2} activeDot={false} />
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}

export default Chart