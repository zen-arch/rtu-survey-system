import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutGrid,
  Pencil, 
  Table, 
  FileBarChart,
  Settings,
  ArrowRight,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../utils/AuthContext'

/**
 * Sidebar Component
 * Navigation sidebar for the RTU Admin Dashboard
 * Uses RTU Blue color scheme
 */
function Sidebar() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  
  const navItems = [
    { 
      path: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: LayoutGrid 
    },
    { 
      path: '/admin/survey-builder', 
      label: 'Survey Builder', 
      icon: Pencil 
    },
    { 
      path: '/admin/surveys', 
      label: 'Surveys', 
      icon: Table 
    },
    { 
      path: '/admin/results', 
      label: 'Results', 
      icon: Table 
    },
    { 
      path: '/admin/reports', 
      label: 'Reports', 
      icon: FileBarChart 
    },
    { 
      path: '/admin/settings',
      label: 'Settings',
      icon: Settings
    },
    { 
      path: '/admin/offices',
      label: 'Offices',
      icon: Table
    }
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={collapsed ? { width: '80px' } : { width: '260px' }}>
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
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
        
        {/* Public Survey Link - Opens in new tab */}
        <button
          onClick={() => window.open('/survey', '_blank')}
          className="nav-link"
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%',
            cursor: 'pointer',
            textAlign: 'left'
          }}
          title={collapsed ? 'Public Survey Link' : ''}
        >
          <ExternalLink size={20} />
          {!collapsed && <span>Public Survey Link</span>}
        </button>
        
        {/* Logout Button */}
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="nav-link"
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%',
            cursor: 'pointer',
            marginTop: 'auto'
          }}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
          {!collapsed && <ArrowRight size={16} style={{ marginLeft: 'auto' }} />}
        </button>
      </nav>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: collapsed ? '28px' : '-12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#FFD700',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0033A0',
          zIndex: 1001
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}

export default Sidebar
