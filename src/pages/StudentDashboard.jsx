import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Star, 
  Building2, 
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  ClipboardPen
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '../utils/supabaseClient'

const ClipboardIcon = () => (
  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 51, 160, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <ClipboardList size={24} color="#FFD700" />
  </div>
)

const StarIcon = () => (
  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255, 215, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Star size={24} color="#0033A0" fill="#0033A0" />
  </div>
)

const BuildingIcon = () => (
  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 51, 160, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Building2 size={24} color="#FFD700" />
  </div>
)

const CalendarIcon = () => (
  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255, 215, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Calendar size={24} color="#0033A0" />
  </div>
)

function StudentDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const studentEmail = location.state?.email || localStorage.getItem('rtu_user_email') || ''
  const studentClientType = location.state?.clientType || localStorage.getItem('rtu_client_type') || ''

  useEffect(() => {
    if (location.state?.clientType) {
      localStorage.setItem('rtu_client_type', location.state.clientType)
    }
  }, [])

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeView, setActiveView] = useState('dashboard')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [availableSurveys, setAvailableSurveys] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [requestingResubmit, setRequestingResubmit] = useState(null) // responseId being requested
  const rowsPerPage = 5

  const fetchActiveSurveys = async () => {
    const { data } = await supabase
      .from('surveys')
      .select('*')
      .eq('status', 'published')
    setAvailableSurveys(data || [])
  }

  useEffect(() => {
    if (studentEmail) {
      fetchSubmissions()
      fetchActiveSurveys()
    }
  }, [studentEmail])

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarOpen && e.target.id === 'sidebar-overlay') {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [sidebarOpen])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('respondent_email', studentEmail)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSurveyStatus = (targetOffice) => {
    const existing = submissions.find(s => s.office === targetOffice)
    if (!existing) return 'allowed'
    if (existing.status === 'Resubmit Allowed') return 'resubmit_allowed'
    return 'already_submitted'
  }

  const handleSurveyNow = (survey) => {
    const status = getSurveyStatus(survey.target_office)
    if (status === 'already_submitted') {
      setToast({
        show: true,
        message: `You've already submitted for ${survey.target_office}. Request a resubmission from your dashboard.`,
        type: 'error'
      })
      return
    }
    navigate('/survey/form', {
      state: {
        email: studentEmail,
        clientType: localStorage.getItem('rtu_client_type') || 'Student',
        office: survey.target_office || '',
        surveyId: survey.id,
        fromDashboard: true,
        skipToSurvey: true
      }
    })
  }

  // Request resubmission — inserts a notification row for admin
  const handleRequestResubmit = async (row) => {
    setRequestingResubmit(row.id)
    try {
      // Check if a pending request already exists
      const { data: existing } = await supabase
        .from('resubmit_requests')
        .select('id')
        .eq('response_id', row.id)
        .eq('status', 'pending')
        .maybeSingle()

      if (existing) {
        setToast({ show: true, message: 'You already have a pending resubmission request for this response.', type: 'error' })
        return
      }

      const { error } = await supabase
        .from('resubmit_requests')
        .insert({
          response_id: row.id,
          respondent_email: studentEmail,
          office: row.office,
          status: 'pending',
          requested_at: new Date().toISOString()
        })

      if (error) throw error

      setToast({ show: true, message: `Resubmission request sent to admin for ${row.office}. You'll be notified once approved.`, type: 'success' })
    } catch (err) {
      console.error('Resubmit request error:', err)
      setToast({ show: true, message: 'Failed to send request. Please try again.', type: 'error' })
    } finally {
      setRequestingResubmit(null)
    }
  }

  // Stats
  const totalSubmissions = submissions.length
  const averageRating = submissions.length > 0
    ? (submissions.reduce((sum, s) => sum + parseFloat(s.average_rating || 0), 0) / submissions.length).toFixed(1)
    : '0.0'
  const uniqueOffices = [...new Set(submissions.map(s => s.office))].length
  const lastSubmitted = submissions.length > 0 && submissions[0].submitted_at
    ? new Date(submissions[0].submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A'

  const chartData = submissions.length > 0
    ? Object.entries(
        submissions.reduce((acc, curr) => {
          if (!acc[curr.office]) acc[curr.office] = { total: 0, count: 0 }
          acc[curr.office].total += parseFloat(curr.average_rating || 0)
          acc[curr.office].count += 1
          return acc
        }, {})
      ).map(([office, data]) => ({ office, averageRating: (data.total / data.count).toFixed(1) }))
    : []

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = submissions.slice(indexOfFirstRow, indexOfLastRow)
  const totalPages = Math.ceil(submissions.length / rowsPerPage)

  const handleLogout = () => {
    localStorage.removeItem('rtu_user_email')
    window.location.href = '/survey'
  }

  const navigateTo = (view) => {
    if (view === 'surveys') {
      fetchActiveSurveys()
      fetchSubmissions()
    }
    setActiveView(view)
    setSidebarOpen(false)
  }

  // Sidebar nav content (shared between desktop & mobile)
  const SidebarContent = () => (
    <>
      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/rtu_logo.png" alt="RTU Logo" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', lineHeight: 1.3 }}>Survey System</div>
        </div>
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#FFD700', wordBreak: 'break-all' }}>
          {studentEmail}
        </div>
      </div>

      <nav style={{ padding: '0 12px', flex: 1 }}>
        <button
          onClick={() => navigateTo('dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', width: '100%',
            backgroundColor: activeView === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer',
            borderLeft: activeView === 'dashboard' ? '3px solid #FFD700' : '3px solid transparent'
          }}
        >
          <LayoutDashboard size={20} color="#FFFFFF" />
          <span style={{ color: '#FFFFFF', fontWeight: 500 }}>My Dashboard</span>
        </button>

        <button
          onClick={() => navigateTo('surveys')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', width: '100%',
            backgroundColor: activeView === 'surveys' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer',
            borderLeft: activeView === 'surveys' ? '3px solid #FFD700' : '3px solid transparent'
          }}
        >
          <ClipboardPen size={20} color="#FFFFFF" />
          <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Answer a Survey</span>
        </button>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', width: '100%',
            backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          <LogOut size={20} color="#FFFFFF" />
          <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Logout</span>
        </button>
      </nav>
    </>
  )

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6c757d' }}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F7FA' }}>

      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside style={{
        width: '260px', backgroundColor: '#0033A0', position: 'fixed', height: '100vh',
        padding: '24px 0', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        // Hide on small screens
        '@media(max-width:768px)': { display: 'none' }
      }}
        className="desktop-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          id="sidebar-overlay"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1100, display: 'flex'
          }}
        >
          {/* Drawer */}
          <div style={{
            width: '260px', backgroundColor: '#0033A0', height: '100vh',
            padding: '24px 0', boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column', position: 'relative',
            animation: 'slideIn 0.25s ease'
          }}>
            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
                padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={20} color="#FFFFFF" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '24px' }} className="main-content">

        {/* ── MOBILE TOP BAR ── */}
        <div className="mobile-topbar" style={{
          display: 'none', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#0033A0', padding: '12px 16px', borderRadius: '12px',
          marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,51,160,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/rtu_logo.png" alt="RTU Logo" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>Survey System</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}
          >
            <Menu size={22} color="#FFFFFF" />
          </button>
        </div>

        {activeView === 'dashboard' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E', marginBottom: '8px' }}>My Survey Dashboard</h1>
                <p style={{ color: '#6c757d', fontSize: '14px' }}>Track your feedback and submission history</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {[
                { label: 'Total Submissions', value: totalSubmissions, icon: <ClipboardIcon />, size: '32px' },
                { label: 'Average Rating Given', value: `${averageRating} / 5`, icon: <StarIcon />, size: '32px' },
                { label: 'Offices Evaluated', value: uniqueOffices, icon: <BuildingIcon />, size: '32px' },
                { label: 'Last Submitted', value: lastSubmitted, icon: <CalendarIcon />, size: '20px' },
              ].map(({ label, value, icon, size }) => (
                <div key={label} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E7FF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>{label}</span>
                    {icon}
                  </div>
                  <p style={{ fontSize: size, fontWeight: '700', color: '#0033A0', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E7FF', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A2E', marginBottom: '20px' }}>My Satisfaction Ratings per Office</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="office" tick={{ fontSize: 12, fill: '#6c757d' }} angle={-45} textAnchor="end" height={60} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#6c757d' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '8px' }}
                      formatter={(value) => [`${value} / 5`, 'Average Rating']}
                    />
                    <Bar dataKey="averageRating" name="Average Rating" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill="#0033A0" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Submissions Table */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E7FF', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E0E7FF' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A2E' }}>My Submission History</h2>
              </div>

              {submissions.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6c757d' }}>
                  <p>No submissions yet.</p>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          {['Office Evaluated', 'Client Type', 'Average Rating', 'Date Submitted', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentRows.map((row, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #E0E7FF' }}>
                            <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1A1A2E', whiteSpace: 'nowrap' }}>{row.office}</td>
                            <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1A1A2E', whiteSpace: 'nowrap' }}>{row.client_type}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} size={16}
                                    fill={star <= Math.round(row.average_rating) ? '#FFD700' : 'none'}
                                    stroke={star <= Math.round(row.average_rating) ? '#FFD700' : '#E0E7FF'}
                                  />
                                ))}
                                <span style={{ marginLeft: '8px', fontWeight: 600, color: '#0033A0' }}>{row.average_rating}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1A1A2E', whiteSpace: 'nowrap' }}>{formatDateTime(row.submitted_at)}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                backgroundColor:
                                  row.status === 'Resubmit Allowed' ? '#FFD700' :
                                  row.status === 'Flagged' ? '#DC2626' : '#16A34A',
                                color: row.status === 'Resubmit Allowed' ? '#1A1A2E' : '#FFFFFF'
                              }}>
                                {row.status || 'Normal'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {/* Only show request button if NOT already allowed to resubmit */}
                              {row.status !== 'Resubmit Allowed' ? (
                                <button
                                  onClick={() => handleRequestResubmit(row)}
                                  disabled={requestingResubmit === row.id}
                                  style={{
                                    padding: '7px 14px',
                                    backgroundColor: '#FFFFFF',
                                    color: '#0033A0',
                                    border: '1px solid #0033A0',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: requestingResubmit === row.id ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    opacity: requestingResubmit === row.id ? 0.6 : 1,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <Bell size={13} />
                                  {requestingResubmit === row.id ? 'Sending…' : 'Request Resubmit'}
                                </button>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>Resubmit granted</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid #E0E7FF', flexWrap: 'wrap', gap: '12px' }}>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>
                        Showing {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, submissions.length)} of {submissions.length}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          style={{ padding: '8px 12px', border: '1px solid #E0E7FF', backgroundColor: '#fff', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
                          <ChevronLeft size={16} color="#6c757d" />
                        </button>
                        <span style={{ fontSize: '14px', color: '#1A1A2E' }}>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          style={{ padding: '8px 12px', border: '1px solid #E0E7FF', backgroundColor: '#fff', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
                          <ChevronRight size={16} color="#6c757d" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* AVAILABLE SURVEYS VIEW */
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E', marginBottom: '8px' }}>Available Surveys</h1>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>Select a survey to participate</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {availableSurveys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6c757d', gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '18px', marginBottom: '8px' }}>No surveys available at the moment.</p>
                  <p style={{ fontSize: '14px' }}>Please check back later.</p>
                </div>
              ) : (
                availableSurveys.map(survey => {
                  const surveyStatus = getSurveyStatus(survey.target_office)
                  const alreadySubmitted = surveyStatus === 'already_submitted'
                  const resubmitAllowed = surveyStatus === 'resubmit_allowed'

                  return (
                    <div key={survey.id} style={{
                      backgroundColor: '#FFFFFF',
                      border: `2px solid ${resubmitAllowed ? '#FFD700' : '#E0E7FF'}`,
                      borderRadius: '12px', padding: '20px',
                      display: 'flex', flexDirection: 'column', gap: '12px',
                      opacity: alreadySubmitted ? 0.75 : 1
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#F5F7FA', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏢</div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0033A0', margin: 0 }}>{survey.title}</h3>
                          <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>{survey.target_office} • {survey.period}</p>
                        </div>
                      </div>

                      {alreadySubmitted && (
                        <div style={{ fontSize: '12px', color: '#6c757d', backgroundColor: '#F5F7FA', borderRadius: '6px', padding: '6px 10px' }}>
                          ✅ Already submitted
                        </div>
                      )}
                      {resubmitAllowed && (
                        <div style={{ fontSize: '12px', color: '#1A1A2E', backgroundColor: '#FEF9C3', borderRadius: '6px', padding: '6px 10px', fontWeight: 600 }}>
                          🔄 Resubmission allowed by admin
                        </div>
                      )}

                      <button
                        onClick={() => handleSurveyNow(survey)}
                        disabled={alreadySubmitted}
                        style={{
                          width: '100%', padding: '12px',
                          backgroundColor: alreadySubmitted ? '#E0E7FF' : resubmitAllowed ? '#FFD700' : '#0033A0',
                          color: alreadySubmitted ? '#6c757d' : resubmitAllowed ? '#1A1A2E' : '#FFFFFF',
                          border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                          cursor: alreadySubmitted ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {alreadySubmitted ? 'Already Submitted' : resubmitAllowed ? '🔄 Resubmit Survey' : 'Survey Now'}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          backgroundColor: toast.type === 'error' ? '#DC2626' : '#16A34A',
          color: '#FFFFFF', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 2000,
          fontSize: '14px', fontWeight: '600', maxWidth: '360px'
        }}>
          {toast.type === 'error' ? '⚠️' : '✓'} {toast.message}
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

export default StudentDashboard