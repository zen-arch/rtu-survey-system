import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts'

/**
 * PieChart Component
 * Displays client type distribution (Student, Faculty, Staff, Visitor)
 * Uses RTU Blue color palette
 */
function PieChartComponent({ data }) {
  // RTU Blue inspired colors
  const COLORS = ['#0033A0', '#1E90FF', '#63B3ED', '#90CDF4']
  
  // Custom legend formatter
  const renderLegend = (props) => {
    const { payload } = props
    return (
      <div className="chart-legend">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="chart-legend-item">
            <div 
              className="chart-legend-color" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span>{entry.value}: {entry.payload.value} ({((entry.payload.value / data.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = data.reduce((a, b) => a + b.value, 0)
      const percentage = ((payload[0].value / total) * 100).toFixed(1)
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px 16px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{payload[0].name}</p>
          <p style={{ color: '#0033A0', fontSize: '14px' }}>
            <strong>{payload[0].value}</strong> responses
          </p>
          <p style={{ color: '#6c757d', fontSize: '12px' }}>
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Client Type Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PieChartComponent
