import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import Reports from './pages/Reports'
import Login from './pages/Login'
import SurveyBuilder from './pages/SurveyBuilder'
import Surveys from './pages/Surveys'
import SurveyForm from './pages/SurveyForm'
import PublicSurvey from './pages/PublicSurvey'
import StudentDashboard from './pages/StudentDashboard'
import { ProtectedRoute, Unauthorized } from './utils/AuthContext'
import AdminOffices from './pages/AdminOffices'

// Admin Layout Component
function AdminLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="survey-builder" element={<SurveyBuilder />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="results" element={<Results />} />
          <Route path="reports" element={<Reports />} />
          <Route path="offices" element={<AdminOffices />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/login" element={<Login />} />
      
      {/* Unauthorized Page */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Public Survey Landing Page */}
      <Route path="/survey" element={<PublicSurvey />} />
      
      {/* Survey Form Direct Access */}
      <Route path="/survey/form" element={<PublicSurvey startAtForm={true} />} />
      
      {/* Student Dashboard - Public (anyone with email can access) */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      
      {/* Actual Survey Form */}
      <Route path="/survey-form" element={<SurveyForm />} />
      
      {/* Staff Dashboard - Protected */}
      <Route path="/staff/dashboard" element={
        <ProtectedRoute requiredRole="staff">
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#0033A0',
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Staff Dashboard - Coming Soon
          </div>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes - Protected */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

