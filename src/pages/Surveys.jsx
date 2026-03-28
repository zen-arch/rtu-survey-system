import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit2, Trash2, X, Check } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'

function Surveys() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSurveys() }, [])

  const fetchSurveys = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('surveys').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      const surveysWithCounts = await Promise.all(data.map(async (survey) => {
        const { count } = await supabase.from('survey_responses').select('*', { count: 'exact', head: true }).eq('office', survey.target_office)
        return { ...survey, responseCount: count || 0 }
      }))
      setSurveys(surveysWithCounts)
    }
    setLoading(false)
  }

  const filteredSurveys = surveys.filter(s =>
    (s.title||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.target_office||'').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const styles = {
      draft: { backgroundColor: '#6c757d', color: '#FFFFFF' },
      active: { backgroundColor: '#16A34A', color: '#FFFFFF' },
      closed: { backgroundColor: '#DC2626', color: '#FFFFFF' }
    }
    return <span style={{ ...(styles[status]||styles.draft), padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>{status||'draft'}</span>
  }

  const handleClose = async (id, currentStatus) => {
    const newStatus = currentStatus === 'closed' ? 'active' : 'closed'
    await supabase.from('surveys').update({ status: newStatus }).eq('id', id)
    setSurveys(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this survey?')) {
      await supabase.from('surveys').delete().eq('id', id)
      setSurveys(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleEdit = (survey) => { navigate('/admin/survey-builder', { state: { editingSurvey: survey } }) }
  const handleView = (survey) => { alert('Survey: ' + survey.title + ' Office: ' + survey.target_office) }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><p>Loading surveys...</p></div>

  return (
    <div>
      <div className='page-header'>
        <h1 className='page-title'>Survey Management</h1>
        <p className='page-subtitle'>Manage and track all your surveys</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/admin/survey-builder')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={18} />Create New Survey
        </button>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '2px solid #E0E7FF', borderRadius: '8px', padding: '0 12px' }}>
          <Search size={18} color='#6c757d' />
          <input type='text' placeholder='Search by title or office...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', padding: '12px', fontSize: '14px', width: '250px', color: '#1A1A2E' }} />
        </div>
      </div>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F5F7FA' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>Survey ID</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>Title</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>Target Office</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>Created Date</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>Responses</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.map((survey) => (
                <tr key={survey.id} style={{ borderBottom: '1px solid #E0E7FF' }}>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#0033A0' }}>{survey.id}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1A1A2E', fontWeight: '500' }}>{survey.title}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6c757d' }}>{survey.target_office}</td>
                  <td style={{ padding: '16px 20px' }}>{getStatusBadge(survey.status)}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6c757d' }}>{survey.created_at ? new Date(survey.created_at).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#0033A0' }}>{survey.responseCount || 0}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleView(survey)} title='View' style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #E0E7FF', borderRadius: '6px', cursor: 'pointer' }}><Eye size={16} color='#0033A0' /></button>
                      <button onClick={() => handleEdit(survey)} title='Edit' style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #E0E7FF', borderRadius: '6px', cursor: 'pointer' }}><Edit2 size={16} color='#6c757d' /></button>
                      <button onClick={() => handleClose(survey.id, survey.status)} title={survey.status === 'closed' ? 'Reopen' : 'Close'} style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #E0E7FF', borderRadius: '6px', cursor: 'pointer' }}>{survey.status === 'closed' ? <Check size={16} color='#16A34A' /> : <X size={16} color='#ffc107' />}</button>
                      <button onClick={() => handleDelete(survey.id)} title='Delete' style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #E0E7FF', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} color='#DC2626' /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSurveys.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6c757d' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No surveys found</p>
            <p style={{ fontSize: '14px' }}>Create a new survey to get started</p>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #E0E7FF', backgroundColor: '#F5F7FA' }}>
          <span style={{ fontSize: '14px', color: '#6c757d' }}>Showing {filteredSurveys.length} of {surveys.length} surveys</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button disabled style={{ padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E0E7FF', borderRadius: '6px', fontSize: '13px', color: '#6c757d', cursor: 'not-allowed' }}>Previous</button>
            <button disabled style={{ padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E0E7FF', borderRadius: '6px', fontSize: '13px', color: '#6c757d', cursor: 'not-allowed' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Surveys