import { Calendar } from 'lucide-react'
import { CLIENT_TYPES } from '../data/mockData'
import { useOffices } from '../utils/useOffices'

/**
 * FilterControls Component
 * Provides filtering options for date range, office/service, and client type
 */
function FilterControls({ filters, onFilterChange }) {
  const { offices } = useOffices()

  return (
    <div className="filter-controls">
      <div className="filter-row">
        {/* Date Range Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Date From
          </label>
          <input
            type="date"
            className="filter-input"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Date To</label>
          <input
            type="date"
            className="filter-input"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
          />
        </div>

        {/* Office/Service Filter */}
        <div className="filter-group">
          <label className="filter-label">Office / Service</label>
          <select
            className="filter-select"
            value={filters.office}
            onChange={(e) => onFilterChange('office', e.target.value)}
          >
            <option value="">All Offices</option>
            {offices.map((o) => (
              <option key={o.office_id} value={o.office_name}>
                {o.office_name}
              </option>
            ))}
          </select>
        </div>

        {/* Client Type Filter */}
        <div className="filter-group">
          <label className="filter-label">Client Type</label>
          <select
            className="filter-select"
            value={filters.clientType}
            onChange={(e) => onFilterChange('clientType', e.target.value)}
          >
            <option value="">All Client Types</option>
            {CLIENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="filter-group" style={{ flex: '0 0 auto' }}>
          <button
            className="export-btn secondary"
            onClick={() => onFilterChange('reset', true)}
            style={{ padding: '10px 16px' }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterControls

