import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

/**
 * LineGraph Component
 * Displays satisfaction trend over time (monthly)
 * Uses RTU Blue color scheme
 */
function LineGraphComponent({ data, timePeriod }) {
  // Format month for display
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px 16px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{formatMonth(label)}</p>
          <p style={{ color: '#0033A0', fontSize: '14px' }}>
            Avg Rating: <strong>{payload[0].value}</strong>
          </p>
          <p style={{ color: '#6c757d', fontSize: '12px' }}>
            Responses: {payload[0].payload.count}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="chart-card full-width">
      <div className="chart-header">
        <h3 className="chart-title">Satisfaction Trend Over Time</h3>
        <div className="time-toggle">
          <button className={`time-toggle-btn ${timePeriod === 'monthly' ? 'active' : ''}`}>
            Monthly
          </button>
          <button className={`time-toggle-btn ${timePeriod === 'quarterly' ? 'active' : ''}`}>
            Quarterly
          </button>
          <button className={`time-toggle-btn ${timePeriod === 'yearly' ? 'active' : ''}`}>
            Yearly
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0033A0" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0033A0" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6c757d' }}
            tickFormatter={formatMonth}
          />
          <YAxis 
            domain={[0, 5]} 
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 12, fill: '#6c757d' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="averageRating"
            name="Average Rating"
            stroke="#0033A0"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRating)"
            dot={{ fill: '#0033A0', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#0033A0', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span style={{ fontSize: '12px', color: '#6c757d' }}>
          Average satisfaction rating over the selected time period
        </span>
      </div>
    </div>
  )
}

export default LineGraphComponent
