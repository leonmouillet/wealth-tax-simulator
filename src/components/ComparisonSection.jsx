import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const X_POSITIONS = [0, 40, 60, 70, 80, 90, 100]

function ComparisonSection({ countries }) {
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
    <div style={{ width: "100%" }}>
    <ResponsiveContainer width="100%" height={450}>
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
        <YAxis domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
        <Tooltip 
          formatter={(v) => `${v.toFixed(1)}%`}
          labelFormatter={(x) => chartData.find(d => d.x === x)?.group || ''}
        />
        <Legend />
        {countries.map((country) => (
          <Line
            key={country.country}
            type="monotone"
            dataKey={country.country}
            stroke={country.color}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}

      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}

export default ComparisonSection