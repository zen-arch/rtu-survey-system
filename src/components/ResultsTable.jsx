import { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Star 
} from 'lucide-react'
import { supabase } from '../utils/supabaseClient'

const CLIENT_TYPES = ['Student', 'Faculty', 'Staff', 'Visitor']

function ResultsTable({ data, onDelete, onFlag, offices = [] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'submitted_at', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterOffice, setFilterOffice] = useState('')
  const [filterClientType, setFilterClientType] = useState('')
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [allowingResubmit, setAllowingResubmit] = useState(false)
  const [resubmitDone, setResubmitDone] = useState(false)

  // Flag modal state
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [flagTarget, setFlagTarget] = useState(null)
  const [flagReason, setFlagReason] = useState('')
  const [flagging, setFlagging] = useState(false)

  // Unflag modal state
  const [showUnflagModal, setShowUnflagModal] = useState(false)
  const [unflagTarget, setUnflagTarget] = useState(null)
  const [unflagging, setUnflagging] = useState(false)

  useEffect(() => { setCurrentPage(1) }, [data])
  useEffect(() => {
    setResubmitDone(false)
    setAllowingResubmit(false)
  }, [selectedResponse])

  const filteredData = useMemo(() => {
    let result = [...data]
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(item =>
        (item.respondent_email && item.respondent_email.toLowerCase().includes(search)) ||
        (item.office && item.office.toLowerCase().includes(search)) ||
        (item.feedback && item.feedback.toLowerCase().includes(search))
      )
    }
    if (filterOffice) result = result.filter(item => item.office === filterOffice)
    if (filterClientType) result = result.filter(item => item.client_type === filterClientType)
    result.sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [data, searchTerm, sortConfig, filterOffice, filterClientType])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Open flag modal
  const openFlagModal = (item) => {
    setFlagTarget(item)
    setFlagReason('')
    setShowFlagModal(true)
  }

  // Submit flag with reason
  const handleSubmitFlag = async () => {
    if (!flagReason.trim()) return
    setFlagging(true)
    const { error } = await supabase
      .from('survey_responses')
      .update({ status: 'Flagged', flag_reason: flagReason.trim() })
      .eq('id', flagTarget.id)
    setFlagging(false)
    if (error) { alert('Failed to flag. Please try again.'); return }
    setShowFlagModal(false)
    setFlagTarget(null)
    setFlagReason('')
    if (onFlag) onFlag({ ...flagTarget, status: 'Flagged', flag_reason: flagReason.trim() }, true)
  }

  // Open unflag modal — only if staff has submitted resolution note
  const openUnflagModal = (item) => {
    setUnflagTarget(item)
    setShowUnflagModal(true)
  }

  // Confirm unflag
  const handleConfirmUnflag = async () => {
    setUnflagging(true)
    const { error } = await supabase
      .from('survey_responses')
      .update({ status: 'Normal', flag_reason: null, resolution_note: null })
      .eq('id', unflagTarget.id)
    setUnflagging(false)
    if (error) { alert('Failed to unflag. Please try again.'); return }
    setShowUnflagModal(false)
    if (onFlag) onFlag({ ...unflagTarget, status: 'Normal' }, false)
    // Also update detail modal if open
    if (selectedResponse?.id === unflagTarget.id) {
      setSelectedResponse(prev => ({ ...prev, status: 'Normal', flag_reason: null, resolution_note: null }))
    }
  }

  const handleAllowResubmit = async () => {
    if (!selectedResponse) return
    setAllowingResubmit(true)
    try {
      const { error } = await supabase
        .from('survey_responses')
        .update({ status: 'Resubmit Allowed' })
        .eq('id', selectedResponse.id)
      if (error) { alert('Failed to allow resubmit: ' + (error.message || 'Unknown error')); return }
      const email = selectedResponse.respondent_email || ''
      const office = selectedResponse.office || ''
      localStorage.removeItem(`rtu_submitted_${email}_${office}`)
      setResubmitDone(true)
      setSelectedResponse(prev => ({ ...prev, status: 'Resubmit Allowed' }))
    } catch (err) {
      alert('Unexpected error: ' + err.message)
    } finally {
      setAllowingResubmit(false)
    }
  }

  const renderStars = (rating) => {
    const ratingValue = Math.round(parseFloat(rating) || 0)
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={16} className={`star ${star <= ratingValue ? 'filled' : ''}`}
            fill={star <= ratingValue ? '#FFD700' : 'none'}
            stroke={star <= ratingValue ? '#FFD700' : '#dee2e6'}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronUp size={14} style={{ opacity: 0.3 }} />
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  return (
    <div className="results-table-container">
      {/* Table Header */}
      <div className="table-header">
        <h3 className="table-title">Survey Results</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="table-search">
            <Search size={18} color="#6c757d" />
            <input type="text" placeholder="Search by email or keyword..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            />
          </div>
          <select className="filter-select" value={filterOffice}
            onChange={(e) => { setFilterOffice(e.target.value); setCurrentPage(1) }}
            style={{ width: '150px' }}
          >
            <option value="">All Offices</option>
            {offices.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="filter-select" value={filterClientType}
            onChange={(e) => { setFilterClientType(e.target.value); setCurrentPage(1) }}
            style={{ width: '150px' }}
          >
            <option value="">All Types</option>
            {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('respondent_email')}>Email <SortIcon columnKey="respondent_email" /></th>
              <th onClick={() => handleSort('office')}>Office <SortIcon columnKey="office" /></th>
              <th onClick={() => handleSort('client_type')}>Client Type <SortIcon columnKey="client_type" /></th>
              <th onClick={() => handleSort('average_rating')}>Rating <SortIcon columnKey="average_rating" /></th>
              <th onClick={() => handleSort('submitted_at')}>Date Submitted <SortIcon columnKey="submitted_at" /></th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((item, index) => (
              <tr key={item.id || index}>
                <td style={{ padding: '16px 20px' }}>
                  <button onClick={() => setSelectedResponse(item)}
                    style={{ background: 'none', border: 'none', color: '#0033A0', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    {item.respondent_email || '-'}
                  </button>
                </td>
                <td>{item.office || '-'}</td>
                <td>{item.client_type || '-'}</td>
                <td>{renderStars(item.average_rating)}</td>
                <td>{formatDate(item.submitted_at)}</td>
                <td>
                  <span className={`status-badge ${(item.status || 'normal').toLowerCase().replace(' ', '-')}`}
                    style={{
                      backgroundColor: item.status === 'Flagged' ? '#DC2626' : item.status === 'Resubmit Allowed' ? '#FFD700' : '#16A34A',
                      color: item.status === 'Resubmit Allowed' ? '#1A1A2E' : '#fff',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600
                    }}
                  >
                    {item.status || 'Normal'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Flag button — only show if not already flagged */}
                    {item.status !== 'Flagged' && (
                      <button onClick={() => openFlagModal(item)}
                        style={{ padding: '4px 10px', backgroundColor: 'transparent', color: '#F97316', border: '1px solid #F97316', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        🚩 Flag
                      </button>
                    )}
                    {/* Unflag button — only show if flagged AND staff has resolved */}
                    {item.status === 'Flagged' && (
                      <button onClick={() => openUnflagModal(item)}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: item.resolution_note ? 'transparent' : '#f5f5f5',
                          color: item.resolution_note ? '#16A34A' : '#adb5bd',
                          border: `1px solid ${item.resolution_note ? '#16A34A' : '#dee2e6'}`,
                          borderRadius: '4px', fontSize: '12px',
                          cursor: item.resolution_note ? 'pointer' : 'not-allowed'
                        }}
                        disabled={!item.resolution_note}
                        title={!item.resolution_note ? 'Waiting for staff resolution note' : 'Click to unflag'}
                      >
                        ✅ Unflag
                      </button>
                    )}
                    <button
                      onClick={async () => { setDeletingId(item.id); await onDelete?.(item); setDeletingId(null) }}
                      disabled={deletingId === item.id}
                      style={{ padding: '4px 10px', backgroundColor: deletingId === item.id ? '#fee2e2' : 'transparent', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '4px', fontSize: '12px', cursor: deletingId === item.id ? 'not-allowed' : 'pointer' }}
                    >
                      {deletingId === item.id ? '⏳' : '🗑️ Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>No results found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
        </div>
        <div className="pagination-controls">
          <select className="page-size-select" value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) pageNum = i + 1
            else if (currentPage <= 3) pageNum = i + 1
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
            else pageNum = currentPage - 2 + i
            return (
              <button key={pageNum} className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
            )
          })}
          <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── FLAG MODAL ── */}
      {showFlagModal && flagTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#DC2626', marginBottom: '8px' }}>🚩 Flag Response</h2>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
              You are flagging the response from <strong>{flagTarget.respondent_email}</strong> ({flagTarget.office}).
              The office staff will see this reason and must resolve it before you can unflag.
            </p>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px' }}>
              Flag Reason <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              placeholder="e.g. Low rating on cleanliness — please investigate and improve this area."
              value={flagReason}
              onChange={e => setFlagReason(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '12px', border: '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowFlagModal(false)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#F5F7FA', color: '#6c757d', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button onClick={handleSubmitFlag} disabled={!flagReason.trim() || flagging}
                style={{ flex: 2, padding: '12px', backgroundColor: flagReason.trim() ? '#DC2626' : '#fee2e2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: flagReason.trim() ? 'pointer' : 'not-allowed' }}
              >
                {flagging ? '⏳ Flagging...' : '🚩 Submit Flag'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UNFLAG MODAL ── */}
      {showUnflagModal && unflagTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#16A34A', marginBottom: '8px' }}>✅ Confirm Unflag</h2>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
              Response from <strong>{unflagTarget.respondent_email}</strong> ({unflagTarget.office})
            </p>

            {/* Flag reason */}
            <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '14px', marginBottom: '16px', borderLeft: '4px solid #DC2626' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626', marginBottom: '6px', textTransform: 'uppercase' }}>Flag Reason (Admin)</p>
              <p style={{ fontSize: '14px', color: '#1A1A2E', margin: 0 }}>{unflagTarget.flag_reason || 'No reason provided.'}</p>
            </div>

            {/* Resolution note */}
            <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '14px', marginBottom: '20px', borderLeft: '4px solid #16A34A' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#16A34A', marginBottom: '6px', textTransform: 'uppercase' }}>Resolution Note (Staff)</p>
              <p style={{ fontSize: '14px', color: '#1A1A2E', margin: 0 }}>{unflagTarget.resolution_note}</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowUnflagModal(false)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#F5F7FA', color: '#6c757d', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button onClick={handleConfirmUnflag} disabled={unflagging}
                style={{ flex: 2, padding: '12px', backgroundColor: '#16A34A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                {unflagging ? '⏳ Processing...' : '✅ Confirm Unflag'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESPONSE DETAIL MODAL ── */}
      {selectedResponse && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0033A0', margin: 0 }}>Response Details</h2>
              <button onClick={() => setSelectedResponse(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6c757d' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Email', value: selectedResponse.respondent_email },
                { label: 'Office', value: selectedResponse.office },
                { label: 'Client Type', value: selectedResponse.client_type },
                { label: 'Date Submitted', value: new Date(selectedResponse.submitted_at).toLocaleDateString() },
                { label: 'Visit Type', value: selectedResponse.visit_type || 'N/A' },
                { label: 'Average Rating', value: `${selectedResponse.average_rating} / 5` },
                { label: 'Status', value: selectedResponse.status || 'Normal' },
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Flag reason — show if flagged */}
            {selectedResponse.status === 'Flagged' && selectedResponse.flag_reason && (
              <div style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '14px', marginBottom: '16px', borderLeft: '4px solid #DC2626' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626', marginBottom: '6px', textTransform: 'uppercase' }}>🚩 Flag Reason</p>
                <p style={{ fontSize: '14px', color: '#1A1A2E', margin: 0 }}>{selectedResponse.flag_reason}</p>
              </div>
            )}

            {/* Resolution note — show if present */}
            {selectedResponse.resolution_note && (
              <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '14px', marginBottom: '16px', borderLeft: '4px solid #16A34A' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#16A34A', marginBottom: '6px', textTransform: 'uppercase' }}>✅ Staff Resolution Note</p>
                <p style={{ fontSize: '14px', color: '#1A1A2E', margin: 0 }}>{selectedResponse.resolution_note}</p>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0033A0', marginBottom: '12px' }}>Ratings Breakdown</h3>
              {(() => {
                if (selectedResponse.custom_answers) {
                  try {
                    const customData = JSON.parse(selectedResponse.custom_answers)
                    const questions = customData.questions || []
                    const answers = customData.answers || {}
                    return questions.map((q, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #E0E7FF' }}>
                        <span style={{ fontSize: '14px', color: '#1A1A2E' }}>{q.text}</span>
                        {q.type === 'rating' ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1,2,3,4,5].map(star => (
                              <span key={star} style={{ color: star <= (answers[q.id] || 0) ? '#FFD700' : '#E0E7FF', fontSize: '18px' }}>★</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '14px', color: '#1A1A2E' }}>{answers[q.id] || 'N/A'}</span>
                        )}
                      </div>
                    ))
                  } catch { return null }
                } else {
                  return [
                    { label: 'Overall Satisfaction', value: selectedResponse.rating_overall },
                    { label: 'Staff Professionalism', value: selectedResponse.rating_staff },
                    { label: 'Speed & Efficiency', value: selectedResponse.rating_speed },
                    { label: 'Cleanliness & Comfort', value: selectedResponse.rating_cleanliness },
                    { label: 'Recommendation', value: selectedResponse.rating_recommendation }
                  ].map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #E0E7FF' }}>
                      <span style={{ fontSize: '14px', color: '#1A1A2E' }}>{item.label}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1,2,3,4,5].map(star => (
                          <span key={star} style={{ color: star <= (item.value || 0) ? '#FFD700' : '#E0E7FF', fontSize: '18px' }}>★</span>
                        ))}
                      </div>
                    </div>
                  ))
                }
              })()}
            </div>

            <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>Feedback / Comments</p>
              <p style={{ fontSize: '14px', color: '#1A1A2E', lineHeight: '1.6' }}>{selectedResponse.feedback || 'No feedback provided.'}</p>
            </div>

            {/* Allow Resubmit */}
            <button onClick={handleAllowResubmit} disabled={allowingResubmit || resubmitDone}
              style={{ width: '100%', marginBottom: '10px', padding: '12px', backgroundColor: resubmitDone ? '#16A34A' : allowingResubmit ? '#93C5FD' : '#FFD700', color: resubmitDone ? '#FFFFFF' : '#1A1A2E', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: allowingResubmit || resubmitDone ? 'not-allowed' : 'pointer' }}
            >
              {resubmitDone ? '✅ Resubmit Allowed' : allowingResubmit ? '⏳ Processing...' : '🔄 Allow Resubmit'}
            </button>

            <button onClick={() => setSelectedResponse(null)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsTable