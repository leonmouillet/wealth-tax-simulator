import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Custom x positions: first 3 groups spread over 0-60, last 4 over 60-100
const X_POSITIONS = [0, 40, 60, 70, 80, 90, 100]

function Chart({ data, color = "#e63946" }) {
  const chartData = data.map((d, i) => ({
    ...d,
    x: X_POSITIONS[i],
  }))

  const maxRate = Math.max(...data.map(d => Math.max(d.currentRate, d.reformRate)))
  const yMax = Math.ceil(maxRate / 10) * 10
  const yTicks = Array.from({ length: yMax / 10}, (_, i) => i * 10)

  return (
    <div>
    <h3 className="chart-title">Effect of the wealth tax on tax progressivity</h3>
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{right: 40}}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          type="number" 
          domain={[0, 100]} 
          ticks={X_POSITIONS}
          tickFormatter={(x) => chartData.find(d => d.x === x)?.group || ''}
          textAnchor="middle"
          height={50}
          interval={0}
          tick={{ fontSize: 14, dy: 10 }}
        />
        <YAxis domain={[0, yMax]} tickFormatter={(v) => `${v}%`} ticks={yTicks} interval={0}/>
        <Tooltip 
          formatter={(v) => `${v.toFixed(1)}%`}
          labelFormatter={(x) => chartData.find(d => d.x === x)?.group || ''}
        />
        <Legend />
        <Line type="monotone" dataKey="currentRate" name="Current rate" stroke="#888" strokeWidth={2} />
        <Line type="monotone" dataKey="reformRate" name="Rate under reform" stroke={color} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}

export default Chart