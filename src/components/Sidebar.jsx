import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Pencil, Table, FileBarChart, ArrowRight,
  LogOut, ChevronLeft, ChevronRight, ExternalLink, Users,
  Bell, X, Menu, Check, Trash2
} from 'lucide-react'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'

function Sidebar() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  // Mobile
  const [mobileOpen, setMobileOpen] = useState(false)

  // Resubmit notifications
  const [requests, setRequests] = useState([])
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)

  const navItems = [
    { path: '/admin/dashboard',       label: 'Dashboard',      icon: LayoutGrid },
    { path: '/admin/survey-builder',  label: 'Survey Builder', icon: Pencil },
    { path: '/admin/surveys',         label: 'Surveys',        icon: Table },
    { path: '/admin/results',         label: 'Results',        icon: Table },
    { path: '/admin/reports',         label: 'Reports',        icon: FileBarChart },
    { path: '/admin/offices',         label: 'Offices',        icon: Table },
    { path: '/admin/staff-accounts',  label: 'Staff Accounts', icon: Users },
  ]

  // ── Fetch pending resubmit requests ──
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('resubmit_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
    if (!error) setRequests(data || [])
  }

  useEffect(() => {
    fetchRequests()
    // Poll every 30s so admin sees new requests without refresh
    const interval = setInterval(fetchRequests, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Approve: set survey_responses.status = 'Resubmit Allowed' + mark request done ──
  const handleApprove = async (req) => {
    const { error: e1 } = await supabase
      .from('survey_responses')
      .update({ status: 'Resubmit Allowed' })
      .eq('id', req.response_id)

    const { error: e2 } = await supabase
      .from('resubmit_requests')
      .update({ status: 'approved' })
      .eq('id', req.id)

    if (!e1 && !e2) {
      setRequests(prev => prev.filter(r => r.id !== req.id))
    }
  }

  // ── Deny: just mark the request as denied ──
  const handleDeny = async (req) => {
    const { error } = await supabase
      .from('resubmit_requests')
      .update({ status: 'denied' })
      .eq('id', req.id)

    if (!error) {
      setRequests(prev => prev.filter(r => r.id !== req.id))
    }
  }

  const pendingCount = requests.length

  const formatTime = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    })
  }

  // ── Shared nav content ──
  const NavContent = ({ onNavClick }) => (
    <>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={collapsed ? { width: '40px', height: '40px' } : {}}>
            <img src="/rtu_logo.png" alt="RTU Logo" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              RTU
              <div className="sidebar-logo-subtitle">Survey System</div>
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={item.path === '/admin/dashboard'}
            title={collapsed ? item.label : ''}
            onClick={onNavClick}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        <button
          onClick={() => { window.open('/survey', '_blank'); onNavClick?.() }}
          className="nav-link"
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontSize: 'inherit', fontWeight: 'inherit', color: 'rgba(255,255,255,0.85)' }}
          title={collapsed ? 'Public Survey Link' : ''}
        >
          <ExternalLink size={20} />
          {!collapsed && <span>Public Survey Link</span>}
        </button>

        <button
          onClick={() => { logout(); navigate('/login') }}
          className="nav-link"
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', marginTop: 'auto', fontSize: 'inherit', fontWeight: 'inherit', color: 'rgba(255,255,255,0.85)' }}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
          {!collapsed && <ArrowRight size={16} style={{ marginLeft: 'auto' }} />}
        </button>
      </nav>
    </>
  )

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR (unchanged behaviour)
          ══════════════════════════════════════ */}
      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} desktop-sidebar`}
        style={collapsed ? { width: '80px' } : { width: '260px' }}
      >
        <NavContent />

        {/* Bell button — desktop only, top-right of sidebar */}
        <div
          ref={bellRef}
          style={{ position: 'absolute', top: '18px', right: collapsed ? '14px' : '16px' }}
        >
          <button
            onClick={() => setBellOpen(o => !o)}
            style={{
              position: 'relative', background: 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: '8px', padding: '7px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Resubmission Requests"
          >
            <Bell size={18} color="#FFFFFF" />
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                backgroundColor: '#DC2626', color: '#fff',
                fontSize: '10px', fontWeight: 700,
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1
              }}>
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {bellOpen && (
            <div style={{
              position: 'fixed',
              top: '60px',
              left: collapsed ? '94px' : '274px',
              width: '320px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: '1px solid #E0E7FF',
              zIndex: 2000,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid #E0E7FF',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A2E' }}>
                  Resubmission Requests
                  {pendingCount > 0 && (
                    <span style={{ marginLeft: '8px', backgroundColor: '#DC2626', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>
                      {pendingCount}
                    </span>
                  )}
                </span>
                <button onClick={() => setBellOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  <X size={16} color="#6c757d" />
                </button>
              </div>

              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {requests.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6c757d', fontSize: '13px' }}>
                    No pending requests
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req.id} style={{
                      padding: '12px 16px', borderBottom: '1px solid #F0F4FF',
                      display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>
                            {req.respondent_email}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6c757d' }}>
                            Office: {req.office}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#adb5bd' }}>
                            {formatTime(req.requested_at)}
                          </p>
                        </div>
                        <span style={{
                          backgroundColor: '#FEF9C3', color: '#92400E',
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                          borderRadius: '10px', whiteSpace: 'nowrap', flexShrink: 0
                        }}>
                          Pending
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(req)}
                          style={{
                            flex: 1, padding: '6px', backgroundColor: '#16A34A',
                            color: '#fff', border: 'none', borderRadius: '6px',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                          }}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          onClick={() => handleDeny(req)}
                          style={{
                            flex: 1, padding: '6px', backgroundColor: '#FFFFFF',
                            color: '#DC2626', border: '1px solid #DC2626', borderRadius: '6px',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                          }}
                        >
                          <Trash2 size={12} /> Deny
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', bottom: '20px',
            right: collapsed ? '28px' : '-12px',
            width: '24px', height: '24px', borderRadius: '50%',
            backgroundColor: '#FFD700', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0033A0', zIndex: 1001
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ══════════════════════════════════════
          MOBILE TOP BAR + DRAWER
          ══════════════════════════════════════ */}
      <div className="mobile-topbar" style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
        backgroundColor: '#0033A0',
        padding: '10px 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,51,160,0.3)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/rtu_logo.png" alt="RTU" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>RTU Survey System</span>
        </div>

        {/* Right: Bell + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Bell for mobile */}
          <div ref={null} style={{ position: 'relative' }}>
            <button
              onClick={() => setBellOpen(o => !o)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '8px', padding: '7px', cursor: 'pointer',
                display: 'flex', alignItems: 'center'
              }}
            >
              <Bell size={18} color="#FFFFFF" />
              {pendingCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-3px', right: '-3px',
                  backgroundColor: '#DC2626', color: '#fff',
                  fontSize: '10px', fontWeight: 700,
                  width: '16px', height: '16px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>

            {/* Mobile bell dropdown */}
            {bellOpen && (
              <div style={{
                position: 'fixed', top: '56px', right: '16px', left: '16px',
                backgroundColor: '#FFFFFF', borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                border: '1px solid #E0E7FF', zIndex: 2000, overflow: 'hidden'
              }}>
                <div style={{
                  padding: '14px 16px', borderBottom: '1px solid #E0E7FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A2E' }}>
                    Resubmission Requests
                    {pendingCount > 0 && (
                      <span style={{ marginLeft: '8px', backgroundColor: '#DC2626', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>
                        {pendingCount}
                      </span>
                    )}
                  </span>
                  <button onClick={() => setBellOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={16} color="#6c757d" />
                  </button>
                </div>
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {requests.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6c757d', fontSize: '13px' }}>
                      No pending requests
                    </div>
                  ) : (
                    requests.map(req => (
                      <div key={req.id} style={{
                        padding: '12px 16px', borderBottom: '1px solid #F0F4FF',
                        display: 'flex', flexDirection: 'column', gap: '8px'
                      }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>{req.respondent_email}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6c757d' }}>Office: {req.office}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#adb5bd' }}>{formatTime(req.requested_at)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApprove(req)}
                            style={{ flex: 1, padding: '7px', backgroundColor: '#16A34A', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleDeny(req)}
                            style={{ flex: 1, padding: '7px', backgroundColor: '#FFFFFF', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Trash2 size={12} /> Deny
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '8px', padding: '7px', cursor: 'pointer',
              display: 'flex', alignItems: 'center'
            }}
          >
            <Menu size={22} color="#FFFFFF" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1200, display: 'flex'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '260px', backgroundColor: '#0033A0',
              height: '100vh', padding: '24px 0',
              boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column',
              position: 'relative', animation: 'slideIn 0.25s ease',
              overflowY: 'auto'
            }}
          >
            {/* Close */}
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: '8px', padding: '6px', cursor: 'pointer',
                display: 'flex'
              }}
            >
              <X size={20} color="#FFFFFF" />
            </button>

            <NavContent onNavClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to  { transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar   { display: flex !important; }
          .main-content    { margin-left: 0 !important; padding-top: 64px !important; }
        }
      `}</style>
    </>
  )
}

export default Sidebar