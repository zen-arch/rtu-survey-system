import { useState, useMemo } from 'react'
import ResultsTable from '../components/ResultsTable'
import ExportButtons from '../components/ExportButtons'
import Toast from '../components/Toast'
import RefreshButton from '../components/RefreshButton'
import { useRealtimeResponses } from '../utils/useRealtimeResponses'
import { supabase } from '../utils/supabaseClient'

function Results() {
  const { 
    responses, setResponses, loading, 
    fetchData, showToast, toastMessage 
  } = useRealtimeResponses()

  const [filters, setFilters] = useState({
    dateFrom: '', dateTo: '', office: '', clientType: ''
  })

  const [toast, setToast] = useState({ show: false, message: '' })

  const showNotification = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

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

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({ dateFrom: '', dateTo: '', office: '', clientType: '' })
    } else {
      setFilters(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleDeleteResponse = async (row) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this response?'
    )
    if (!confirmed) return

    const { error } = await supabase
      .from('survey_responses')
      .delete()
      .eq('id', row.id)

    if (error) {
      alert('Failed to delete. Please try again.')
      console.error(error)
      return
    }

    await fetchData()
    window.dispatchEvent(new CustomEvent('responseDeleted'))
    showNotification('🗑️ Response deleted successfully')
  }

  // Just update local state — ResultsTable handles the Supabase update itself
  const handleFlagResponse = (updatedRow, isFlagged) => {
    setResponses(prev =>
      prev.map(r => r.id === updatedRow.id ? { ...r, ...updatedRow } : r)
    )
    showNotification(
      isFlagged
        ? '🚩 Response flagged for review'
        : '✅ Response unflagged'
    )
  }

  if (loading) return (
    <div className="results-page">
      <div className="loading">
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '12px' }}>Loading responses...</span>
      </div>
    </div>
  )

  return (
    <div className="results-page">
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        <div>
          <h1 className="page-title">Survey Results</h1>
          <p className="page-subtitle">
            View and manage all survey responses
          </p>
        </div>
        <RefreshButton onClick={fetchData} />
      </div>

      <ExportButtons data={filteredData} reportType="results" />

      <div className="filter-controls">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Date From</label>
            <input type="date" className="filter-input"
              value={filters.dateFrom}
              onChange={e => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Date To</label>
            <input type="date" className="filter-input"
              value={filters.dateTo}
              onChange={e => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Office / Service</label>
            <select className="filter-select"
              value={filters.office}
              onChange={e => handleFilterChange('office', e.target.value)}
            >
              <option value="">All Offices</option>
              <option value="Cashier">Cashier</option>
              <option value="Registrar">Registrar</option>
              <option value="Clinic">Clinic</option>
              <option value="MIC/MISO">MIC/MISO</option>
              <option value="SAASU">SAASU</option>
              <option value="BAO">BAO</option>
              <option value="SFAU">SFAU</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Client Type</label>
            <select className="filter-select"
              value={filters.clientType}
              onChange={e => handleFilterChange('clientType', e.target.value)}
            >
              <option value="">All Client Types</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
              <option value="Visitor">Visitor</option>
            </select>
          </div>
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <button className="export-btn secondary"
              onClick={() => handleFilterChange('reset', true)}
              style={{ padding: '10px 16px', marginTop: '22px' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <ResultsTable 
        data={filteredData} 
        onDelete={handleDeleteResponse} 
        onFlag={handleFlagResponse} 
      />

      <Toast message={toast.message} show={toast.show} />
    </div>
  )
}

export default Results