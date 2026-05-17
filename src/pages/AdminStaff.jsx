import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'

function AdminStaff() {
  const { user } = useAuth()

  const [staff, setStaff] = useState([])
  const [offices, setOffices] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'

  const [form, setForm] = useState({
    email: '',
    password: '',
    office_name: ''
  })

  const [editingId, setEditingId] = useState(null)

  const COLORS = useMemo(
    () => ({
      primary: '#0033A0',
      gold: '#FFD700',
      white: '#FFFFFF',
      surface: '#F5F7FA',
      text: '#1A1A2E',
      border: '#E0E7FF',
      error: '#DC2626',
      success: '#16A34A'
    }),
    []
  )

  useEffect(() => {
    const fetchOffices = async () => {
      const { data, error } = await supabase
        .from('offices')
        .select('office_id, office_name')
        .order('office_name', { ascending: true })

      if (!error && data) setOffices(data)
    }

    const fetchStaff = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('office_staff')
        .select('id, email, password, office_name, office_id')
        .order('created_at', { ascending: false })

      if (!error && data) setStaff(data)
      setLoading(false)
    }

    fetchOffices()
    fetchStaff()
  }, [])

  const showToast = (type, message) => {
    setToast({ show: true, type, message })
    window.setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  const openAddModal = () => {
    setModalMode('add')
    setEditingId(null)
    setForm({ email: '', password: '', office_name: '' })
    setModalOpen(true)
  }

  const openEditModal = (row) => {
    setModalMode('edit')
    setEditingId(row.id)
    setForm({
      email: row.email || '',
      password: '', // keep blank; user can set new password
      office_name: row.office_name || ''
    })
    setModalOpen(true)
  }

  const handleDelete = async (row) => {
    const ok = window.confirm(`Delete staff account for ${row.email}?`)
    if (!ok) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('office_staff')
        .delete()
        .eq('id', row.id)

      if (error) throw error

      setStaff(prev => prev.filter(s => s.id !== row.id))
      showToast('success', 'Staff account deleted.')
    } catch (e) {
      showToast('error', 'Failed to delete staff account.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email.trim()) return showToast('error', 'Email is required.')
    if (!form.office_name.trim()) return showToast('error', 'Office is required.')

    const emailLower = form.email.trim().toLowerCase()

    const officeMatch = offices.find(o => o.office_name === form.office_name)
    if (!officeMatch) return showToast('error', 'Selected office is invalid.')

    try {
      setSaving(true)

      if (modalMode === 'add') {
        if (!form.password.trim()) return showToast('error', 'Password is required.')

        const { error } = await supabase
          .from('office_staff')
          .insert({
            email: emailLower,
            password: form.password,
            office_id: officeMatch.office_id,
            office_name: officeMatch.office_name
          })

        if (error) throw error

        const { data } = await supabase
          .from('office_staff')
          .select('id, email, password, office_name, office_id')
          .order('created_at', { ascending: false })

        if (data) setStaff(data)
        showToast('success', 'Staff account added.')
      } else {
        // edit
        if (!editingId) return

        const updatePayload = {
          email: emailLower,
          office_id: officeMatch.office_id,
          office_name: officeMatch.office_name
        }
        if (form.password.trim()) updatePayload.password = form.password

        const { error } = await supabase
          .from('office_staff')
          .update(updatePayload)
          .eq('id', editingId)

        if (error) throw error

        setStaff(prev =>
          prev.map(s => (s.id === editingId ? { ...s, ...updatePayload } : s))
        )
        showToast('success', 'Staff account updated.')
      }

      setModalOpen(false)
    } catch (e) {
      showToast('error', 'Failed to save staff account.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.surface, padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: COLORS.text, margin: 0 }}>
              Staff Accounts
            </h1>
            <p style={{ marginTop: '6px', color: '#6c757d', fontSize: '14px' }}>
              Manage office staff credentials and assignments.
            </p>
          </div>

          <button
            onClick={openAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700
            }}
          >
            <Plus size={18} />
            Add Staff Account
          </button>
        </div>

        <div style={{ backgroundColor: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6c757d' }}>Loading staff accounts...</div>
          ) : staff.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6c757d' }}>No staff accounts found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8F9FA' }}>
                    {[
                      'Email',
                      'Password',
                      'Office',
                      'Actions'
                    ].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '14px 20px',
                          textAlign: 'left',
                          fontSize: '12px',
                          color: '#6c757d',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #E0E7FF' }}>
                      <td style={{ padding: '14px 20px', color: COLORS.text, fontSize: '14px', fontWeight: 600 }}>
                        {row.email}
                      </td>
                      <td style={{ padding: '14px 20px', color: COLORS.text, fontSize: '14px' }}>
                        {'•'.repeat(10)}
                      </td>
                      <td style={{ padding: '14px 20px', color: COLORS.text, fontSize: '14px' }}>
                        {row.office_name || '-' }
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => openEditModal(row)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#FFFFFF',
                              color: COLORS.primary,
                              border: `1px solid ${COLORS.primary}`,
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <Pencil size={16} /> Edit
                            </span>
                          </button>

                          <button
                            onClick={() => handleDelete(row)}
                            disabled={saving}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#FFFFFF',
                              color: COLORS.error,
                              border: `1px solid ${COLORS.error}`,
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              opacity: saving ? 0.6 : 1
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <Trash2 size={16} /> Delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2500
            }}
          >
            <div
              style={{
                width: '92%',
                maxWidth: '560px',
                backgroundColor: COLORS.white,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={20} color={COLORS.primary} />
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: COLORS.text }}>
                    {modalMode === 'add' ? 'Add Staff Account' : 'Edit Staff Account'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6c757d' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#6c757d', marginBottom: '8px' }}>
                      Email
                    </label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      type="email"
                      placeholder="Enter staff email"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        borderRadius: '10px',
                        border: `2px solid ${COLORS.border}`,
                        backgroundColor: COLORS.surface,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#6c757d', marginBottom: '8px' }}>
                      Password {modalMode === 'edit' ? '(leave blank to keep current)' : ''}
                    </label>
                    <input
                      value={form.password}
                      onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                      type="text"
                      placeholder={modalMode === 'edit' ? 'Optional' : 'Enter password'}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        borderRadius: '10px',
                        border: `2px solid ${COLORS.border}`,
                        backgroundColor: COLORS.surface,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#6c757d', marginBottom: '8px' }}>
                      Office
                    </label>
                    <select
                      value={form.office_name}
                      onChange={(e) => setForm(prev => ({ ...prev, office_name: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '14px',
                        borderRadius: '10px',
                        border: `2px solid ${COLORS.border}`,
                        backgroundColor: COLORS.surface,
                        outline: 'none'
                      }}
                    >
                      <option value="">Select office</option>
                      {offices.map(o => (
                        <option key={o.office_id} value={o.office_name}>
                          {o.office_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        border: `2px solid ${COLORS.border}`,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 800,
                        color: COLORS.text
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        backgroundColor: COLORS.primary,
                        borderRadius: '10px',
                        border: `2px solid ${COLORS.primary}`,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 800,
                        color: COLORS.white,
                        opacity: saving ? 0.7 : 1
                      }}
                    >
                      {saving ? 'Saving...' : modalMode === 'add' ? 'Add' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {toast.show && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: toast.type === 'error' ? COLORS.error : COLORS.success,
              color: COLORS.white,
              padding: '12px 18px',
              borderRadius: '10px',
              fontWeight: 800,
              zIndex: 3000,
              boxShadow: '0 6px 24px rgba(0,0,0,0.18)'
            }}
          >
            {toast.type === 'error' ? '⚠️' : '✓'} {toast.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminStaff

