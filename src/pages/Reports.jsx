import { useState, useMemo, useEffect } from 'react'
import ExportButtons from '../components/ExportButtons'
import { getAllResponses } from '../utils/fetchResponses'

/**
 * Reports Page Component
 * Displays comprehensive reports with export functionality
 * Path: /admin/reports
 */
function Reports() {
  // Data state
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  // Fetch data function
  const fetchData = async () => {
    setLoading(true)
    const data = await getAllResponses()
    setResponses(data)
    setLoading(false)
  }

  // Calculate report statistics
  const reportData = useMemo(() => {
    if (responses.length === 0) {
      return {
        totalResponses: 0,
        averageRating: '0.00',
        satisfiedPercent: '0.0',
        lowPerforming: [],
        officeRatings: [],
        clientDistribution: [],
        monthlyStats: []
      }
    }

    const totalResponses = responses.length
    
    // Calculate average rating
    const totalRating = responses.reduce((sum, item) => sum + parseFloat(item.average_rating || 0), 0)
    const averageRating = (totalRating / totalResponses).toFixed(2)
    
    // Calculate satisfaction percentage
    const satisfiedCount = responses.filter(item => parseFloat(item.average_rating || 0) >= 4).length
    const satisfiedPercent = ((satisfiedCount / totalResponses) * 100).toFixed(1)
    
    // Calculate low performing services (rating < 3)
    const lowPerformingMap = {}
    responses.forEach(item => {
      if (parseFloat(item.average_rating || 0) < 3) {
        if (!lowPerformingMap[item.office]) {
          lowPerformingMap[item.office] = 0
        }
        lowPerformingMap[item.office]++
      }
    })
    const lowPerforming = Object.entries(lowPerformingMap)
      .map(([office, count]) => ({ office, count }))
    
    // Average satisfaction per office
    const officeMap = {}
    responses.forEach(item => {
      if (!officeMap[item.office]) {
        officeMap[item.office] = { total: 0, count: 0 }
      }
      officeMap[item.office].total += parseFloat(item.average_rating || 0)
      officeMap[item.office].count++
    })
    
    const officeRatings = Object.entries(officeMap)
      .map(([office, data]) => ({
        office,
        averageRating: data.total / data.count
      }))
    
    // Client type distribution
    const clientTypeMap = {}
    responses.forEach(item => {
      if (!clientTypeMap[item.client_type]) {
        clientTypeMap[item.client_type] = 0
      }
      clientTypeMap[item.client_type]++
    })
    
    const clientTypes = ['Student', 'Faculty', 'Staff', 'Visitor']
    const clientDistribution = clientTypes.map(type => ({
      type,
      count: clientTypeMap[type] || 0,
      percentage: ((clientTypeMap[type] || 0) / totalResponses * 100).toFixed(1)
    }))
    
    // Monthly statistics
    const monthlyData = {}
    responses.forEach(item => {
      const date = new Date(item.submitted_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 }
      }
      monthlyData[monthKey].total += parseFloat(item.average_rating || 0)
      monthlyData[monthKey].count++
    })
    
    const monthlyStats = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        averageRating: (data.total / data.count).toFixed(2),
        responses: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return {
      totalResponses,
      averageRating,
      satisfiedPercent,
      lowPerforming,
      officeRatings,
      clientDistribution,
      monthlyStats
    }
  }, [responses])

  // Get rating color class
  const getRatingClass = (rating) => {
    if (rating >= 4) return 'high'
    if (rating >= 3) return 'medium'
    return 'low'
  }

  // Format month for display
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Loading state
  if (loading) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Comprehensive survey analysis and insights</p>
        </div>
        
        <div className="loading">
          <div className="loading-spinner"></div>
          <span style={{ marginLeft: '12px' }}>Loading survey data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="reports-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Comprehensive survey analysis and insights</p>
        </div>
        <button
          onClick={fetchData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0033A0',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Export Buttons */}
      <ExportButtons data={responses} reportType="full_report" />

      {/* Report Summary Section */}
      <div className="reports-section">
        <div className="report-header">
          <h2 className="report-title">Survey Summary Report</h2>
          <p className="report-subtitle">
            Total Responses: {reportData.totalResponses} | Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div className="report-content">
          {/* Key Statistics */}
          <div className="report-stats">
            <div className="report-stat">
              <div className="report-stat-label">Total Responses</div>
              <div className="report-stat-value">{reportData.totalResponses}</div>
            </div>
            <div className="report-stat">
              <div className="report-stat-label">Average Satisfaction</div>
              <div className="report-stat-value">{reportData.averageRating}/5</div>
            </div>
            <div className="report-stat">
              <div className="report-stat-label">Satisfaction Rate</div>
              <div className="report-stat-value">{reportData.satisfiedPercent}%</div>
            </div>
            <div className="report-stat">
              <div className="report-stat-label">Low Performing Services</div>
              <div className="report-stat-value">{reportData.lowPerforming.length}</div>
            </div>
          </div>

          {/* Office Ratings Table */}
          <h3 className="report-section-title">Average Satisfaction by Office</h3>
          <table className="office-rating-table">
            <thead>
              <tr>
                <th>Office / Service</th>
                <th>Average Rating</th>
                <th>Rating Bar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.officeRatings.map((office) => (
                <tr key={office.office}>
                  <td><strong>{office.office}</strong></td>
                  <td>{office.averageRating.toFixed(2)} / 5.00</td>
                  <td>
                    <div className="rating-bar">
                      <div 
                        className={`rating-bar-fill ${getRatingClass(office.averageRating)}`}
                        style={{ width: `${(office.averageRating / 5) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td>
                    {office.averageRating >= 4 ? (
                      <span style={{ color: '#16A34A', fontWeight: 600 }}>Excellent</span>
                    ) : office.averageRating >= 3 ? (
                      <span style={{ color: '#FFD700', fontWeight: 600 }}>Good</span>
                    ) : (
                      <span style={{ color: '#DC2626', fontWeight: 600 }}>Needs Improvement</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Low Performing Services */}
          <h3 className="report-section-title" style={{ marginTop: '32px' }}>
            Services Requiring Attention (Rating Below 3)
          </h3>
          {reportData.lowPerforming.length > 0 ? (
            <ul className="low-performance-list">
              {reportData.lowPerforming.map((item, index) => (
                <li key={index} className="low-performance-item">
                  <span className="low-performance-office">{item.office}</span>
                  <span className="low-performance-count">{item.count} low rating(s)</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#16A34A', padding: '16px', background: 'rgba(22, 163, 74, 0.1)', borderRadius: '8px' }}>
              ✓ No services currently require attention. All offices have average ratings of 3 or above.
            </p>
          )}

          {/* Client Type Distribution */}
          <h3 className="report-section-title" style={{ marginTop: '32px' }}>
            Client Type Distribution
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {reportData.clientDistribution.map((client) => (
              <div 
                key={client.type}
                style={{ 
                  padding: '20px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0033A0' }}>
                  {client.count}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>{client.type}</div>
                <div style={{ fontSize: '12px', color: '#adb5bd' }}>{client.percentage}%</div>
              </div>
            ))}
          </div>

          {/* Monthly Trend */}
          <h3 className="report-section-title" style={{ marginTop: '32px' }}>
            Monthly Satisfaction Trend
          </h3>
          <table className="office-rating-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Responses</th>
                <th>Average Rating</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {reportData.monthlyStats.map((month) => (
                <tr key={month.month}>
                  <td>{formatMonth(month.month)}</td>
                  <td>{month.responses}</td>
                  <td>{month.averageRating} / 5.00</td>
                  <td>
                    <div className="rating-bar">
                      <div 
                        className={`rating-bar-fill ${getRatingClass(parseFloat(month.averageRating))}`}
                        style={{ width: `${(parseFloat(month.averageRating) / 5) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports

