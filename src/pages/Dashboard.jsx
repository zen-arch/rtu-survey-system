import { useMemo, useState } from 'react'
import SummaryCards from '../components/SummaryCards'
import BarChart from '../components/BarChart'
import PieChart from '../components/PieChart'
import LineGraph from '../components/LineGraph'
import FilterControls from '../components/FilterControls'
import Toast from '../components/Toast'
import RefreshButton from '../components/RefreshButton'
import { useRealtimeResponses } from '../utils/useRealtimeResponses'

function Dashboard() {
  const { 
    responses, loading, fetchData, 
    showToast, toastMessage 
  } = useRealtimeResponses()

  const [filters, setFilters] = useState({
    dateFrom: '', dateTo: '', office: '', clientType: ''
  })

  const [timePeriod, setTimePeriod] = useState('monthly')

  const filteredData = useMemo(() => {
    let result = [...responses]
    if (filters.dateFrom)
      result = result.filter(i => 
        new Date(i.submitted_at) >= new Date(filters.dateFrom))
    if (filters.dateTo)
      result = result.filter(i => 
        new Date(i.submitted_at) <= new Date(filters.dateTo))
    if (filters.office)
      result = result.filter(i => i.office === filters.office)
    if (filters.clientType)
      result = result.filter(i => i.client_type === filters.clientType)
    return result
  }, [responses, filters])

  const stats = useMemo(() => {
    const total = filteredData.length
    const avg = total > 0
      ? (filteredData.reduce((s, i) => 
          s + parseFloat(i.average_rating || 0), 0) / total).toFixed(2)
      : '0.00'
    const satisfied = total > 0
      ? ((filteredData.filter(i => 
          parseFloat(i.average_rating || 0) >= 4).length / total) * 100
        ).toFixed(1)
      : '0.0'
    const uniqueOffices = [...new Set(filteredData.map(i => i.office))]
    return {
      totalResponses: total,
      averageRating: avg,
      officeCount: uniqueOffices.length || 7,
      satisfiedPercent: satisfied
    }
  }, [filteredData])

  const chartData = useMemo(() => {
    const officeMap = {}
    const clientTypeMap = {}
    const monthlyData = {}

    filteredData.forEach(item => {
      // Office data
      if (!officeMap[item.office]) 
        officeMap[item.office] = { total: 0, count: 0 }
      officeMap[item.office].total += parseFloat(item.average_rating || 0)
      officeMap[item.office].count += 1

      // Client type data
      clientTypeMap[item.client_type] = 
        (clientTypeMap[item.client_type] || 0) + 1

      // Monthly trend data
      const date = new Date(item.submitted_at)
      const key = `${date.getFullYear()}-${
        String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[key]) monthlyData[key] = { total: 0, count: 0 }
      monthlyData[key].total += parseFloat(item.average_rating || 0)
      monthlyData[key].count += 1
    })

    return {
      officeData: Object.entries(officeMap)
        .map(([office, d]) => ({
          office,
          averageRating: (d.total / d.count).toFixed(2),
          count: d.count
        })),
      clientData: Object.entries(clientTypeMap)
        .map(([name, value]) => ({ name, value })),
      trendData: Object.entries(monthlyData)
        .map(([month, d]) => ({
          month,
          averageRating: (d.total / d.count).toFixed(2),
          count: d.count
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
    }
  }, [filteredData])

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({ dateFrom: '', dateTo: '', office: '', clientType: '' })
    } else {
      setFilters(prev => ({ ...prev, [key]: value }))
    }
  }

  if (loading) return (
    <div className="dashboard-page">
      <div className="loading">
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '12px' }}>Loading...</span>
      </div>
    </div>
  )

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">
            RTU Client Satisfaction Survey System - Real-time analytics
          </p>
        </div>
        <RefreshButton onClick={fetchData} />
      </div>

      <SummaryCards
        totalResponses={stats.totalResponses}
        averageRating={stats.averageRating}
        officeCount={stats.officeCount}
        satisfiedPercent={stats.satisfiedPercent}
      />

      <FilterControls filters={filters} onFilterChange={handleFilterChange} />

      <div className="charts-section">
        <BarChart data={chartData.officeData} />
        <PieChart data={chartData.clientData} />
      </div>

      <LineGraph 
        data={chartData.trendData} 
        timePeriod={timePeriod} 
      />

      <Toast message={toastMessage} show={showToast} />
    </div>
  )
}

export default Dashboard
