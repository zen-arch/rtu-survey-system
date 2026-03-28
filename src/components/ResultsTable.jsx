import { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Star 
} from 'lucide-react'

const OFFICES = ['Cashier', 'Registrar', 'Clinic', 'MIC/MISO', 'SAASU', 'BAO', 'SFAU']
const CLIENT_TYPES = ['Student', 'Faculty', 'Staff', 'Visitor']

/**
 * ResultsTable Component
 * Displays survey results with sorting, filtering, search, and pagination
 */
function ResultsTable({ data, onDelete, onFlag }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'submitted_at', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
const [filterOffice, setFilterOffice] = useState('')
const [filterClientType, setFilterClientType] = useState('')
const [selectedResponse, setSelectedResponse] = useState(null)
const [deletingId, setDeletingId] = useState(null)


  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = [...data]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(item => 
        (item.respondent_email && item.respondent_email.toLowerCase().includes(search)) ||
        (item.office && item.office.toLowerCase().includes(search)) ||
        (item.feedback && item.feedback.toLowerCase().includes(search))
      )
    }

    // Office filter
    if (filterOffice) {
      result = result.filter(item => item.office === filterOffice)
    }

    // Client type filter
    if (filterClientType) {
      result = result.filter(item => item.client_type === filterClientType)
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return result
  }, [data, searchTerm, sortConfig, filterOffice, filterClientType])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Render star rating
  const renderStars = (rating) => {
    const ratingValue = Math.round(parseFloat(rating) || 0)
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`star ${star <= ratingValue ? 'filled' : ''}`}
            fill={star <= ratingValue ? '#FFD700' : 'none'}
            stroke={star <= ratingValue ? '#FFD700' : '#dee2e6'}
          />
        ))}
      </div>
    )
  }

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Sort icon component
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp size={14} style={{ opacity: 0.3 }} />
    }
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  return (
    <div className="results-table-container">
      <div className="table-header">
        <h3 className="table-title">Survey Results</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Search */}
          <div className="table-search">
            <Search size={18} color="#6c757d" />
            <input
              type="text"
              placeholder="Search by email or keyword..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* Office Filter */}
          <select
            className="filter-select"
            value={filterOffice}
            onChange={(e) => {
              setFilterOffice(e.target.value)
              setCurrentPage(1)
            }}
            style={{ width: '150px' }}
          >
            <option value="">All Offices</option>
            {OFFICES.map(office => (
              <option key={office} value={office}>{office}</option>
            ))}
          </select>

          {/* Client Type Filter */}
          <select
            className="filter-select"
            value={filterClientType}
            onChange={(e) => {
              setFilterClientType(e.target.value)
              setCurrentPage(1)
            }}
            style={{ width: '150px' }}
          >
            <option value="">All Types</option>
            {CLIENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('respondent_email')}>
                Email <SortIcon columnKey="respondent_email" />
              </th>
              <th onClick={() => handleSort('office')}>
                Office <SortIcon columnKey="office" />
              </th>
              <th onClick={() => handleSort('client_type')}>
                Client Type <SortIcon columnKey="client_type" />
              </th>
              <th onClick={() => handleSort('average_rating')}>
                Rating <SortIcon columnKey="average_rating" />
              </th>
              <th onClick={() => handleSort('submitted_at')}>
                Date Submitted <SortIcon columnKey="submitted_at" />
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={item.id || index}>

<td style={{ padding: '16px 20px' }}>
  <button
    onClick={() => setSelectedResponse(item)}
    style={{
      background: 'none',
      border: 'none',
      color: '#0033A0',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'underline',
      padding: 0
    }}
  >
    {item.respondent_email || '-'}
  </button>
</td>

                  <td>{item.office || '-'}</td>
                  <td>{item.client_type || '-'}</td>
                  <td>{renderStars(item.average_rating)}</td>
                  <td>{formatDate(item.submitted_at)}</td>
                  <td>
                    <span className={`status-badge ${(item.status || 'normal').toLowerCase()}`}>
                      {item.status || 'Normal'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onFlag && onFlag(item)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'transparent',
                          color: '#F97316',
                          border: '1px solid #F97316',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        🚩 Flag
                      </button>
                      <button
                        onClick={async () => {
                          setDeletingId(item.id)
                          await onDelete && onDelete(item)
                          setDeletingId(null)
                        }}
                        disabled={deletingId === item.id}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: deletingId === item.id 
                            ? '#fee2e2' : 'transparent',
                          color: '#DC2626',
                          border: '1px solid #DC2626',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {deletingId === item.id ? '⏳ Deleting...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  No results found
                </td>
              </tr>
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
          <select
            className="page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            return (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>

      </div>

      {/* Response Modal */}
      {selectedResponse && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0033A0', margin: 0 }}>Response Details</h2>
        <button onClick={() => setSelectedResponse(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6c757d' }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Email</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{selectedResponse.respondent_email}</p>
        </div>
        <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Office</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{selectedResponse.office}</p>
        </div>
        <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Client Type</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{selectedResponse.client_type}</p>
        </div>
        <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Date Submitted</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{new Date(selectedResponse.submitted_at).toLocaleDateString()}</p>
        </div>
        <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Visit Type</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{selectedResponse.visit_type || 'N/A'}</p>
        </div>
        <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Average Rating</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#0033A0' }}>{selectedResponse.average_rating} / 5</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0033A0', marginBottom: '12px' }}>Ratings Breakdown</h3>
        {[
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
                <span key={star} style={{ color: star <= item.value ? '#FFD700' : '#E0E7FF', fontSize: '18px' }}>★</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px' }}>
        <p style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>Feedback / Comments</p>
        <p style={{ fontSize: '14px', color: '#1A1A2E', lineHeight: '1.6' }}>
          {selectedResponse.feedback || 'No feedback provided.'}
        </p>
      </div>

      <button onClick={() => setSelectedResponse(null)} style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
        Close
      </button>
    </div>
  </div>
)}
    </div>
  )
}


export default ResultsTable

