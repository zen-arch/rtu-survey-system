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
import StaffDashboard from './pages/StaffDashboard'
import AdminStaff from './pages/AdminStaff'

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
          <Route path="staff-accounts" element={<AdminStaff />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/survey" element={<PublicSurvey />} />
      <Route path="/survey/form" element={<PublicSurvey startAtForm={true} />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/survey-form" element={<SurveyForm />} />
      <Route path="/staff/dashboard" element={
        <ProtectedRoute requiredRole="staff">
          <StaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App