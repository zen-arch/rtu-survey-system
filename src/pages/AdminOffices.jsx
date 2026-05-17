import { useEffect, useMemo, useState } from 'react'
import Toast from '../components/Toast'
import { supabase } from '../utils/supabaseClient'

// Generates a unique ID for office_id (text type, not auto-increment)
const generateOfficeId = () => `office_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

function AdminOffices() {
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [toast, setToast] = useState({ show: false, message: '' })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [formName, setFormName] = useState('')
  const [editingOffice, setEditingOffice] = useState(null)
  const [deletingOffice, setDeletingOffice] = useState(null)

  const showNotification = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3500)
  }

  const fetchOffices = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('offices')
      .select('office_id, office_name')
      .order('office_name', { ascending: true })

    if (error) {
      console.error('FETCH ERROR:', error)
      showNotification('❌ Failed to load offices: ' + (error.message || error.code))
      setOffices([])
      setLoading(false)
      return
    }

    console.log('Fetched offices:', data)
    setOffices(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOffices()
  }, [])

  const existingNamesLower = useMemo(() => {
    return new Set((offices || []).map(o => (o?.office_name || '').trim().toLowerCase()))
  }, [offices])

  const normalizeName = (name) => (name || '').trim().replace(/\s+/g, ' ')

  const validateOfficeName = ({ name, excludeId = null }) => {
    const normalized = normalizeName(name)
    if (!normalized) return { ok: false, message: 'Office name cannot be empty' }
    const lower = normalized.toLowerCase()
    if (excludeId !== null) {
      const conflict = (offices || []).some(
        o => o.office_id !== excludeId && (o?.office_name || '').trim().toLowerCase() === lower
      )
      if (conflict) return { ok: false, message: 'An office with that name already exists' }
    } else {
      if (existingNamesLower.has(lower)) return { ok: false, message: 'An office with that name already exists' }
    }
    return { ok: true, normalized }
  }

  // ─── ADD ────────────────────────────────────────────────────────────────────
  const handleAddOffice = async () => {
    const validation = validateOfficeName({ name: formName })
    if (!validation.ok) {
      showNotification('⚠️ ' + validation.message)
      return
    }

    setSaving(true)
    const newId = generateOfficeId()
    console.log('INSERT attempt:', { office_id: newId, office_name: validation.normalized })

    const { data, error } = await supabase
      .from('offices')
      .insert({ office_id: newId, office_name: validation.normalized })
      .select()

    console.log('INSERT result → data:', data, '| error:', error)

    if (error) {
      showNotification('❌ Add failed: ' + (error.message || error.code || 'Unknown error'))
      setSaving(false)
      return
    }

    setIsAddModalOpen(false)
    setFormName('')
    showNotification('✅ Office added successfully')
    await fetchOffices()
    setSaving(false)
  }

  // ─── EDIT ───────────────────────────────────────────────────────────────────
  const openEditModal = (office) => {
    setEditingOffice(office)
    setFormName(office?.office_name || '')
    setIsEditModalOpen(true)
  }

  const handleUpdateOffice = async () => {
    const validation = validateOfficeName({ name: formName, excludeId: editingOffice?.office_id })
    if (!validation.ok) {
      showNotification('⚠️ ' + validation.message)
      return
    }

    setSaving(true)
    console.log('UPDATE attempt:', { office_id: editingOffice.office_id, office_name: validation.normalized })

    const { data, error } = await supabase
      .from('offices')
      .update({ office_name: validation.normalized })
      .eq('office_id', editingOffice.office_id)
      .select()

    console.log('UPDATE result → data:', data, '| error:', error)

    if (error) {
      showNotification('❌ Update failed: ' + (error.message || error.code || 'Unknown error'))
      setSaving(false)
      return
    }

    if (data && data.length === 0) {
      showNotification('⚠️ No rows updated — office ID not found.')
      setSaving(false)
      return
    }

    setIsEditModalOpen(false)
    setEditingOffice(null)
    setFormName('')
    showNotification('✅ Office updated successfully')
    await fetchOffices()
    setSaving(false)
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────
  const openDeleteModal = (office) => {
    setDeletingOffice(office)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteOffice = async () => {
    const id = deletingOffice?.office_id
    if (!id) {
      showNotification('⚠️ Cannot delete: missing office ID')
      return
    }

    setSaving(true)
    console.log('DELETE attempt:', { office_id: id })

    const { data, error } = await supabase
      .from('offices')
      .delete()
      .eq('office_id', id)
      .select()

    console.log('DELETE result → data:', data, '| error:', error)

    if (error) {
      showNotification('❌ Delete failed: ' + (error.message || error.code || 'Unknown error'))
      setSaving(false)
      return
    }

    setIsDeleteModalOpen(false)
    setDeletingOffice(null)
    showNotification('🗑️ Office deleted successfully')
    await fetchOffices()
    setSaving(false)
  }

  // ─── MODAL SHELL ────────────────────────────────────────────────────────────
  const ModalShell = ({ title, children, onClose }) => (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px',
        maxWidth: '560px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0033A0', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#6c757d', lineHeight: 1 }} type="button">×</button>
        </div>
        {children}
      </div>
    </div>
  )

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span style={{ marginLeft: '12px' }}>Loading offices...</span>
        </div>
        <Toast message={toast.message} show={toast.show} />
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Office Management</h1>
          <p className="page-subtitle">Manage offices used in the RTU Client Satisfaction Survey</p>
        </div>
        <button
          onClick={() => { setFormName(''); setIsAddModalOpen(true) }}
          style={{
            padding: '10px 16px', backgroundColor: '#0033A0', color: '#FFFFFF',
            border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ color: '#FFD700', fontWeight: 900 }}>+</span> Add Office
        </button>
      </div>

      <div className="results-table-container" style={{ marginTop: '16px' }}>
        <div className="table-header">
          <h3 className="table-title">Offices</h3>
          <div style={{ color: '#6c757d', fontSize: '13px', fontWeight: 500 }}>Total: {offices.length}</div>
        </div>

        <div className="table-wrapper">
          <table className="data-table" style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={{ cursor: 'default' }}>Name</th>
                <th style={{ cursor: 'default' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offices.length > 0 ? offices.map((office) => (
                <tr key={office.office_id}>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontWeight: 700, color: '#1A1A2E' }}>{office.office_name}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => openEditModal(office)}
                        style={{
                          padding: '6px 10px', background: 'transparent', color: '#0033A0',
                          border: '1px solid #0033A0', borderRadius: '8px',
                          fontSize: '13px', cursor: 'pointer', fontWeight: 600
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(office)}
                        style={{
                          padding: '6px 10px', background: 'transparent', color: '#DC2626',
                          border: '1px solid #DC2626', borderRadius: '8px',
                          fontSize: '13px', cursor: 'pointer', fontWeight: 600
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    No offices found. Click "Add Office" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast message={toast.message} show={toast.show} />

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <ModalShell title="Add Office" onClose={() => { setIsAddModalOpen(false); setFormName('') }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label className="filter-label">Office name</label>
              <input
                type="text"
                className="filter-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !saving && handleAddOffice()}
                placeholder="e.g., Cashier"
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="button" onClick={() => { setIsAddModalOpen(false); setFormName('') }}
                style={{ padding: '10px 14px', background: '#F5F7FA', color: '#1A1A2E', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleAddOffice} disabled={saving}
                style={{ padding: '10px 14px', backgroundColor: saving ? '#93C5FD' : '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingOffice && (
        <ModalShell title="Edit Office" onClose={() => { setIsEditModalOpen(false); setEditingOffice(null); setFormName('') }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label className="filter-label">Office name</label>
              <input
                type="text"
                className="filter-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !saving && handleUpdateOffice()}
                placeholder="Enter office name"
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingOffice(null); setFormName('') }}
                style={{ padding: '10px 14px', background: '#F5F7FA', color: '#1A1A2E', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleUpdateOffice} disabled={saving}
                style={{ padding: '10px 14px', backgroundColor: saving ? '#93C5FD' : '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && deletingOffice && (
        <ModalShell title="Delete Office" onClose={() => { setIsDeleteModalOpen(false); setDeletingOffice(null) }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ backgroundColor: '#F5F7FA', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#1A1A2E', marginBottom: '6px' }}>Are you sure?</div>
              <div style={{ color: '#6c757d', fontSize: '14px' }}>
                This will permanently delete <span style={{ color: '#DC2626', fontWeight: 800 }}>{deletingOffice.office_name}</span>.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="button" onClick={() => { setIsDeleteModalOpen(false); setDeletingOffice(null) }}
                style={{ padding: '10px 14px', background: '#F5F7FA', color: '#1A1A2E', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteOffice} disabled={saving}
                style={{ padding: '10px 14px', backgroundColor: saving ? '#FCA5A5' : '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  )
}

export default AdminOffices