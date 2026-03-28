import { useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts'

/**
 * BarChart Component
 * Displays satisfaction rating per RTU office/service
 * Uses RTU Blue color palette
 */
function BarChartComponent({ data }) {
  const [selectedOffice, setSelectedOffice] = useState('all')
  
  // RTU Blue color palette for bars
  const COLORS = ['#0033A0', '#1E90FF', '#63B3ED', '#90CDF4', '#BEE3F8', '#2B6CB0', '#3182CE']

  // Filter data based on selection
  const filteredData = selectedOffice === 'all' 
    ? data 
    : data.filter(item => item.office === selectedOffice)

  // Custom tooltip for better UX
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px 16px',
          border: '1px solid #E0E7FF',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</p>
          <p style={{ color: '#0033A0', fontSize: '14px' }}>
            Avg Rating: <strong>{payload[0].value.toFixed(2)}</strong>
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
    <div className="chart-card" style={{ border: '1px solid #E0E7FF' }}>
      {/* Filter Dropdown */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontSize: '14px', color: '#6c757d' }}>Filter by Office:</label>
        <select 
          value={selectedOffice}
          onChange={(e) => setSelectedOffice(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #E0E7FF',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#1A1A2E',
            backgroundColor: '#F5F7FA',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Offices</option>
          {data.map((item) => (
            <option key={item.office} value={item.office}>{item.office}</option>
          ))}
        </select>
      </div>

      <div className="chart-header">
        <h3 className="chart-title">Average Satisfaction Rating per Office</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
          <XAxis 
            dataKey="office" 
            tick={{ fontSize: 12, fill: '#6c757d' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={[0, 5]} 
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 12, fill: '#6c757d' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="averageRating" 
            name="Average Rating"
            radius={[4, 4, 0, 0]}
          >
            {filteredData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span style={{ fontSize: '12px', color: '#6c757d' }}>
          Scale: 1 (Very Dissatisfied) to 5 (Very Satisfied)
        </span>
      </div>
    </div>
  )
}

export default BarChartComponent

