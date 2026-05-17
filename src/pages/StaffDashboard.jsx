import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Flag,
  LogOut,
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Table,
  Plus,
  Trash2,
  Eye,
  Edit3,
  CheckCircle,
  FileText,
  X
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'




const CLIENT_TYPE_COLORS = {
  Student: '#0033A0',
  Faculty: '#FFD700',
  Staff: '#16A34A',
  Visitor: '#F97316'
}

function StaffDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [selectedOffice, setSelectedOffice] = useState(user?.office || null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(false)

  const [activeView, setActiveView] = useState('dashboard')

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedResponse, setSelectedResponse] = useState(null)

  const rowsPerPage = 8

  const [surveys, setSurveys] = useState([])
  const [loadingSurveys, setLoadingSurveys] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState(null)

  // Survey builder state
  const [surveyTitle, setSurveyTitle] = useState('')
  const [surveyStatus, setSurveyStatus] = useState('draft')
  const [questions, setQuestions] = useState([])
  const [builderError, setBuilderError] = useState('')
  const [builderSuccess, setBuilderSuccess] = useState('')
  const [savingBuilder, setSavingBuilder] = useState(false)

  const fetchResponses = async (office) => {

    setLoading(true)
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('office', office)
      .order('submitted_at', { ascending: false })

    if (!error && data) setResponses(data)
    setLoading(false)
  }

  const fetchSurveys = async () => {
    setLoadingSurveys(true)
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('office', selectedOffice)
      .order('created_at', { ascending: false })
    if (!error && data) setSurveys(data)
    setLoadingSurveys(false)
  }

  useEffect(() => {
    if (selectedOffice && (activeView === 'surveys' || activeView === 'builder')) {
      fetchSurveys()
    }
  }, [selectedOffice, activeView])

  const handleDeleteSurvey = async (id) => {
    if (!confirm('Delete this survey?')) return
    await supabase.from('surveys').delete().eq('id', id)
    fetchSurveys()
  }

  const handleEditSurvey = (survey) => {
    setEditingSurvey(survey)
    setSurveyTitle(survey.title || '')
    setSurveyStatus(survey.status || 'draft')
    try {
      setQuestions(JSON.parse(survey.questions) || [])
    } catch {
      setQuestions([])
    }
    setActiveView('builder')
  }

  const handleNewSurvey = () => {
    setEditingSurvey(null)
    setSurveyTitle('')
    setSurveyStatus('draft')
    setQuestions([])
    setBuilderError('')
    setBuilderSuccess('')
    setActiveView('builder')
  }

  const addQuestion = (type) => {
    const newQ = {
      id: `q_${Date.now()}`,
      type,
      text: '',
      options: type === 'multiple_choice' ? ['', ''] : []
    }
    setQuestions(prev => [...prev, newQ])
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (qId, optIndex, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q
      const opts = [...q.options]
      opts[optIndex] = value
      return { ...q, options: opts }
    }))
  }

  const addOption = (qId) => {
    setQuestions(prev => prev.map(q => (q.id === qId ? { ...q, options: [...q.options, ''] } : q)))
  }

  const removeOption = (qId, optIndex) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q
      const opts = q.options.filter((_, i) => i !== optIndex)
      return { ...q, options: opts }
    }))
  }

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const handleSaveSurvey = async () => {
    setBuilderError('')
    setBuilderSuccess('')
    if (!surveyTitle.trim()) { setBuilderError('Survey title is required.'); return }
    if (questions.length === 0) { setBuilderError('Add at least one question.'); return }
    for (const q of questions) {
      if (!q.text.trim()) { setBuilderError('All questions must have text.'); return }
      if (q.type === 'multiple_choice' && q.options.some(o => !o.trim())) {
        setBuilderError('All multiple choice options must be filled.'); return
      }
    }

    setSavingBuilder(true)
    const payload = {
      title: surveyTitle,
      status: surveyStatus,
      questions: JSON.stringify(questions),
      office: selectedOffice,
      updated_at: new Date().toISOString()
    }

    let error
    if (editingSurvey) {
      const res = await supabase.from('surveys').update(payload).eq('id', editingSurvey.id)
      error = res.error
    } else {
      const res = await supabase.from('surveys').insert({ ...payload, created_at: new Date().toISOString() })
      error = res.error
    }

    setSavingBuilder(false)
    if (error) { setBuilderError('Failed to save survey. Try again.'); return }
    setBuilderSuccess(editingSurvey ? 'Survey updated!' : 'Survey created!')
    setTimeout(() => {
      setBuilderSuccess('')
      setActiveView('surveys')
    }, 1500)
  }

  useEffect(() => {
    if (selectedOffice) {
      fetchResponses(selectedOffice)
      setCurrentPage(1)
    }
  }, [selectedOffice])


  const handleLogout = () => {
    logout()
    navigate('/login')
  }


  // Stats
  const totalResponses = responses.length
  const averageRating =
    responses.length > 0
      ? (
          responses.reduce((sum, r) => sum + parseFloat(r.average_rating || 0), 0) /
          responses.length
        ).toFixed(2)
      : '0.00'

  const flaggedCount = responses.filter(r => r.status === 'Flagged').length
  const resubmitCount = responses.filter(r => r.status === 'Resubmit Allowed').length

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const map = {}
    responses.forEach(r => {
      if (!r.submitted_at) return
      const d = new Date(r.submitted_at)
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      if (!map[key]) map[key] = { month: key, total: 0, count: 0 }
      map[key].total += parseFloat(r.average_rating || 0)
      map[key].count += 1
    })

    return Object.values(map)
      .map(m => ({ month: m.month, avg: parseFloat((m.total / m.count).toFixed(2)) }))
      .slice(-6)
  }, [responses])

  // Client type breakdown
  const clientTypeData = useMemo(() => {
    const map = {}
    responses.forEach(r => {
      const t = r.client_type || 'Unknown'
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map).map(([type, count]) => ({ type, count }))
  }, [responses])

  // Paginated responses
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return responses.slice(start, start + rowsPerPage)
  }, [responses, currentPage])

  const totalPages = Math.ceil(responses.length / rowsPerPage)

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const renderStars = (rating) => {
    const val = Math.round(parseFloat(rating) || 0)
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} style={{ color: s <= val ? '#FFD700' : '#E0E7FF', fontSize: '16px' }}>★</span>
        ))}
      </div>
    )
  }

  const getStatusStyle = (status) => {
    if (status === 'Flagged') return { backgroundColor: '#DC2626', color: '#fff' }
    if (status === 'Resubmit Allowed') return { backgroundColor: '#FFD700', color: '#1A1A2E' }
    return { backgroundColor: '#16A34A', color: '#fff' }
  }



  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0033A0',
          position: 'fixed',
          height: '100vh',
          padding: '24px 0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/rtu_logo.png" alt="RTU Logo" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>RTU Survey System</div>
              <div style={{ fontSize: '11px', color: '#FFD700', marginTop: '2px' }}>Staff Portal</div>
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              backgroundColor: 'rgba(255,215,0,0.15)',
              borderRadius: '8px',
              padding: '8px 12px',
              border: '1px solid rgba(255,215,0,0.3)'
            }}
          >
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Managing Office
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFD700' }}>{selectedOffice}</div>
          </div>
        </div>

        <nav style={{ padding: '0 12px', flex: 1 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} color="#FFFFFF" /> },
            { id: 'responses', label: 'Responses', icon: <MessageSquare size={20} color="#FFFFFF" /> },
            { id: 'flagged', label: 'Flagged', icon: <Flag size={20} color="#FFFFFF" /> },
            { id: 'surveys', label: 'My Surveys', icon: <Table size={20} color="#FFFFFF" /> },
            { id: 'builder', label: 'Survey Builder', icon: <Pencil size={20} color="#FFFFFF" /> }
          ].map(item => (

            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                width: '100%',
                backgroundColor: activeView === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                marginBottom: '4px',
                cursor: 'pointer',
                borderLeft: activeView === item.id ? '3px solid #FFD700' : '3px solid transparent'
              }}
            >
              {item.icon}
              <span style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '14px' }}>{item.label}</span>
              {item.id === 'flagged' && flaggedCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: '#DC2626',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {flaggedCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} color="rgba(255,255,255,0.7)" />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '32px' }}>
        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>{selectedOffice}</h1>
                <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '4px' }}>Office satisfaction overview</p>
              </div>

              <button
                onClick={() => fetchResponses(selectedOffice)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: '#0033A0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              {[
                { label: 'Total Responses', value: totalResponses, icon: <Users size={22} color="#FFD700" />, color: '#0033A0' },
                { label: 'Average Rating', value: `${averageRating} / 5`, icon: <Award size={22} color="#FFD700" />, color: '#0033A0' },
                { label: 'Flagged Responses', value: flaggedCount, icon: <AlertTriangle size={22} color="#DC2626" />, color: '#DC2626' },
                { label: 'Pending Resubmit', value: resubmitCount, icon: <Award size={22} color="#F97316" />, color: '#F97316' }
              ].map((card, i) => (
                <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E0E7FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: 500 }}>{card.label}</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(0,51,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {card.icon}
                    </div>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: card.color, margin: 0 }}>{loading ? '...' : card.value}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E0E7FF' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A2E', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#0033A0" /> Rating Trend (Last 6 Months)
                </h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6c757d' }} />
                      <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#6c757d' }} />
                      <Tooltip formatter={(v) => [`${v} / 5`, 'Avg Rating']} contentStyle={{ borderRadius: '8px', border: '1px solid #E0E7FF' }} />
                      <Line type="monotone" dataKey="avg" stroke="#0033A0" strokeWidth={3} dot={{ fill: '#FFD700', strokeWidth: 2, r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' }}>No data yet</div>
                )}
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E0E7FF' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A2E', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="#0033A0" /> By Client Type
                </h3>
                {clientTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={clientTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6c757d' }} />
                      <YAxis type="category" dataKey="type" tick={{ fontSize: 12, fill: '#6c757d' }} width={60} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E0E7FF' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {clientTypeData.map((entry, i) => (
                          <Cell key={i} fill={CLIENT_TYPE_COLORS[entry.type] || '#0033A0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' }}>No data yet</div>
                )}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E0E7FF', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E0E7FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A2E', margin: 0 }}>Recent Responses</h3>
                <button onClick={() => setActiveView('responses')} style={{ fontSize: '13px', color: '#0033A0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  View All →
                </button>
              </div>

              <ResponseTable
                responses={responses.slice(0, 5)}
                formatDate={formatDate}
                renderStars={renderStars}
                getStatusStyle={getStatusStyle}
                onSelect={setSelectedResponse}
                loading={loading}
              />
            </div>
          </>
        )}

        {/* RESPONSES VIEW */}
        {activeView === 'responses' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>All Responses</h1>
              <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '4px' }}>{selectedOffice} — {totalResponses} total</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E0E7FF', overflow: 'hidden' }}>
              <ResponseTable
                responses={paginatedResponses}
                formatDate={formatDate}
                renderStars={renderStars}
                getStatusStyle={getStatusStyle}
                onSelect={setSelectedResponse}
                loading={loading}
              />

              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid #E0E7FF' }}>
                  <span style={{ fontSize: '13px', color: '#6c757d' }}>
                    Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, totalResponses)} of {totalResponses}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '8px 12px', border: '1px solid #E0E7FF', borderRadius: '6px', backgroundColor: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      <ChevronLeft size={16} color="#6c757d" />
                    </button>
                    <span style={{ padding: '8px 12px', fontSize: '13px', color: '#1A1A2E' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{ padding: '8px 12px', border: '1px solid #E0E7FF', borderRadius: '6px', backgroundColor: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                      <ChevronRight size={16} color="#6c757d" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* FLAGGED VIEW */}
        {activeView === 'flagged' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>Flagged Responses</h1>
              <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '4px' }}>{selectedOffice} — responses flagged by admin for attention</p>
            </div>

            {flaggedCount === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E0E7FF' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#16A34A', marginBottom: '8px' }}>No flagged responses</p>
                <p style={{ fontSize: '14px', color: '#6c757d' }}>All responses for your office are in good standing.</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E0E7FF', overflow: 'hidden' }}>
                <ResponseTable
                  responses={responses.filter(r => r.status === 'Flagged')}
                  formatDate={formatDate}
                  renderStars={renderStars}
                  getStatusStyle={getStatusStyle}
                  onSelect={setSelectedResponse}
                  loading={loading}
                />
              </div>
            )}
          </>
        )}

        {/* MY SURVEYS VIEW */}
        {activeView === 'surveys' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>My Surveys</h1>
                <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '4px' }}>{selectedOffice} — manage your office surveys</p>
              </div>
              <button
                onClick={handleNewSurvey}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#0033A0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                <Plus size={18} /> New Survey
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loadingSurveys ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6c757d' }}>Loading surveys...</div>
              ) : surveys.length === 0 ? (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px solid #E0E7FF' }}>
                  <FileText size={48} color="#E0E7FF" style={{ marginBottom: '16px' }} />
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px' }}>No surveys yet</p>
                  <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '24px' }}>Create your first survey for {selectedOffice}</p>
                  <button onClick={handleNewSurvey} style={{ padding: '10px 24px', backgroundColor: '#0033A0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    Create Survey
                  </button>
                </div>
              ) : surveys.map(survey => {
                let qCount = 0
                try { qCount = JSON.parse(survey.questions)?.length || 0 } catch {}
                return (
                  <div key={survey.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E0E7FF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>{survey.title}</h3>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: survey.status === 'published' ? '#16A34A' : '#F5F7FA',
                          color: survey.status === 'published' ? '#fff' : '#6c757d',
                          border: survey.status === 'published' ? 'none' : '1px solid #E0E7FF'
                        }}>
                          {survey.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>{qCount} question{qCount !== 1 ? 's' : ''} · Created {new Date(survey.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditSurvey(survey)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#EEF2FF', color: '#0033A0', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        <Edit3 size={15} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSurvey(survey.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'rgba(220,38,38,0.08)', color: '#DC2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* SURVEY BUILDER VIEW */}
        {activeView === 'builder' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>{editingSurvey ? 'Edit Survey' : 'New Survey'}</h1>
                <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '4px' }}>{selectedOffice}</p>
              </div>
              <button onClick={() => setActiveView('surveys')} style={{ padding: '10px 20px', backgroundColor: '#F5F7FA', color: '#6c757d', border: '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                ← Back to Surveys
              </button>
            </div>

            {builderError && (
              <div style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
                {builderError}
              </div>
            )}
            {builderSuccess && (
              <div style={{ backgroundColor: 'rgba(22,163,74,0.08)', color: '#16A34A', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> {builderSuccess}
              </div>
            )}

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '28px', border: '1px solid #E0E7FF', marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', display: 'block', marginBottom: '8px' }}>Survey Title</label>
              <input
                type="text"
                placeholder="e.g. Cashier Office Satisfaction Survey"
                value={surveyTitle}
                onChange={e => setSurveyTitle(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', fontSize: '15px', border: '2px solid #E0E7FF', borderRadius: '8px', outline: 'none', color: '#1A1A2E', backgroundColor: '#F5F7FA', boxSizing: 'border-box', marginBottom: '16px' }}
              />

              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', display: 'block', marginBottom: '8px' }}>Status</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['draft', 'published'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSurveyStatus(s)}
                    style={{
                      padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: '2px solid',
                      backgroundColor: surveyStatus === s ? '#0033A0' : '#F5F7FA',
                      color: surveyStatus === s ? '#fff' : '#6c757d',
                      borderColor: surveyStatus === s ? '#0033A0' : '#E0E7FF'
                    }}
                  >
                    {s === 'draft' ? 'Draft' : 'Published'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {questions.map((q, qIndex) => (
                <div key={q.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '2px solid #E0E7FF', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0033A0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Question {qIndex + 1} · {q.type === 'rating' ? 'Rating (1–5 Stars)' : q.type === 'multiple_choice' ? 'Multiple Choice' : 'Text Answer'}
                    </span>
                    <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                      <X size={18} />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter your question here..."
                    value={q.text}
                    onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '2px solid #E0E7FF', borderRadius: '8px', outline: 'none', color: '#1A1A2E', backgroundColor: '#F5F7FA', boxSizing: 'border-box', marginBottom: q.type === 'multiple_choice' ? '12px' : 0 }}
                  />

                  {q.type === 'multiple_choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt}
                            onChange={e => updateOption(q.id, optIndex, e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', fontSize: '13px', border: '1px solid #E0E7FF', borderRadius: '6px', outline: 'none', backgroundColor: '#F5F7FA' }}
                          />
                          {q.options.length > 2 && (
                            <button onClick={() => removeOption(q.id, optIndex)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(q.id)}
                        style={{ alignSelf: 'flex-start', padding: '6px 14px', backgroundColor: '#EEF2FF', color: '#0033A0', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '24px', color: '#FFD700' }}>★</span>)}
                      <span style={{ fontSize: '13px', color: '#6c757d', marginLeft: '8px', alignSelf: 'center' }}>Preview</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #E0E7FF', marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '12px' }}>Add Question</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { type: 'rating', label: '⭐ Rating (Stars)' },
                  { type: 'multiple_choice', label: '☑ Multiple Choice' },
                  { type: 'text', label: '✏️ Text Answer' }
                ].map(btn => (
                  <button
                    key={btn.type}
                    onClick={() => addQuestion(btn.type)}
                    style={{ padding: '10px 20px', backgroundColor: '#F5F7FA', color: '#0033A0', border: '2px solid #E0E7FF', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setActiveView('surveys')}
                style={{ padding: '12px 24px', backgroundColor: '#F5F7FA', color: '#6c757d', border: '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSurvey}
                disabled={savingBuilder}
                style={{ padding: '12px 28px', backgroundColor: '#0033A0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: savingBuilder ? 0.7 : 1 }}
              >
                {savingBuilder ? 'Saving...' : editingSurvey ? 'Save Changes' : 'Create Survey'}
              </button>
            </div>
          </>
        )}
      </main>


      {/* Response Detail Modal */}
      {selectedResponse && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '560px', width: '90%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0033A0', margin: 0 }}>Response Details</h2>
              <button onClick={() => setSelectedResponse(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6c757d' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Email', value: selectedResponse.respondent_email },
                { label: 'Client Type', value: selectedResponse.client_type },
                { label: 'Visit Type', value: selectedResponse.visit_type || 'N/A' },
                { label: 'Date Submitted', value: formatDate(selectedResponse.submitted_at) },
                { label: 'Average Rating', value: `${selectedResponse.average_rating} / 5` },
                { label: 'Status', value: selectedResponse.status || 'Normal' }
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#6c757d', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0033A0', marginBottom: '12px' }}>Ratings Breakdown</h3>
              {(() => {
                if (selectedResponse.custom_answers) {
                  try {
                    const d = JSON.parse(selectedResponse.custom_answers)
                    return (d.questions || []).map((q, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E0E7FF' }}>
                        <span style={{ fontSize: '13px', color: '#1A1A2E', flex: 1, paddingRight: '12px' }}>{q.text}</span>
                        {q.type === 'rating' ? (
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <span key={s} style={{ color: s <= (d.answers[q.id] || 0) ? '#FFD700' : '#E0E7FF', fontSize: '16px' }}>★</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#1A1A2E' }}>{d.answers[q.id] || 'N/A'}</span>
                        )}
                      </div>
                    ))
                  } catch {
                    return null
                  }
                }

                return [
                  { label: 'Overall Satisfaction', value: selectedResponse.rating_overall },
                  { label: 'Staff Professionalism', value: selectedResponse.rating_staff },
                  { label: 'Speed & Efficiency', value: selectedResponse.rating_speed },
                  { label: 'Cleanliness & Comfort', value: selectedResponse.rating_cleanliness },
                  { label: 'Recommendation', value: selectedResponse.rating_recommendation }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E0E7FF' }}>
                    <span style={{ fontSize: '13px', color: '#1A1A2E' }}>{item.label}</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} style={{ color: s <= (item.value || 0) ? '#FFD700' : '#E0E7FF', fontSize: '16px' }}>★</span>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>

            <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: '#6c757d', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feedback / Comments</p>
              <p style={{ fontSize: '14px', color: '#1A1A2E', lineHeight: '1.6', margin: 0 }}>{selectedResponse.feedback || 'No feedback provided.'}</p>
            </div>

            <button
              onClick={() => setSelectedResponse(null)}
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

// Reusable response table sub-component
function ResponseTable({ responses, formatDate, renderStars, getStatusStyle, onSelect, loading }) {
  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#6c757d' }}>Loading responses...</div>
  }

  if (responses.length === 0) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#6c757d' }}>No responses found.</div>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#F8F9FA' }}>
            {['Email', 'Client Type', 'Rating', 'Date Submitted', 'Status'].map(h => (
              <th
                key={h}
                style={{
                  padding: '12px 20px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#6c757d',
                  fontWeight: 600,
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
          {responses.map((r, i) => (
            <tr
              key={r.id || i}
              style={{ borderBottom: '1px solid #E0E7FF' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F7FA')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '14px 20px' }}>
                <button
                  onClick={() => onSelect(r)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0033A0',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  {r.respondent_email || '-'}
                </button>
              </td>
              <td style={{ padding: '14px 20px', fontSize: '13px', color: '#1A1A2E' }}>{r.client_type || '-'}</td>
              <td style={{ padding: '14px 20px' }}>{renderStars(r.average_rating)}</td>
              <td style={{ padding: '14px 20px', fontSize: '13px', color: '#1A1A2E', whiteSpace: 'nowrap' }}>{formatDate(r.submitted_at)}</td>
              <td style={{ padding: '14px 20px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600,
                    ...getStatusStyle(r.status)
                  }}
                >
                  {r.status || 'Normal'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StaffDashboard

