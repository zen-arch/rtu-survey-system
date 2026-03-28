import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, AlertTriangle, Check, Star, X, Edit } from 'lucide-react'
import StarRating from '../components/StarRating'
import { supabase } from '../utils/supabaseClient'

const OFFICES = ['Cashier', 'Registrar', 'Clinic', 'MIC/MISO', 'SAASU', 'BAO', 'SFAU']
const CLIENT_TYPES = ['Student', 'Faculty', 'Staff', 'Visitor']
const VISIT_TYPES = ['First visit', 'Return visit', 'Regular visit (weekly/monthly)', 'Referred by someone']

const RATING_QUESTIONS = [
  { key: 'overallSatisfaction', question: 'How satisfied are you with the overall service?' },
  { key: 'staffProfessionalism', question: "How would you rate the staff's professionalism?" },
  { key: 'speedEfficiency', question: 'How would you rate the speed and efficiency of service?' },
  { key: 'cleanlinessComfort', question: 'How would you rate the cleanliness and comfort of the area?' },
  { key: 'recommendation', question: 'How likely are you to recommend this service to others?' }
]

/**
 * StepIndicator Component
 * Shows progress through survey steps
 */
function StepIndicator({ currentStep, steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Step Circle */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCompleted ? '#0033A0' : isActive ? '#FFD700' : '#E0E7FF',
                color: isCompleted ? '#FFFFFF' : isActive ? '#0033A0' : '#6c757d',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              {isCompleted ? <Check size={18} /> : stepNum}
            </div>
            
            {/* Step Label */}
            <span
              style={{
                marginLeft: '8px',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#0033A0' : isCompleted ? '#0033A0' : '#6c757d'
              }}
            >
              {step}
            </span>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  width: '60px',
                  height: '2px',
                  backgroundColor: isCompleted ? '#0033A0' : '#E0E7FF',
                  marginLeft: '12px',
                  marginRight: '12px'
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * StudentDashboard Component
 * Shows after successful submission - displays user's survey history
 */
function StudentDashboard({ userEmail, onLogout, onEditResponse }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResponse, setEditingResponse] = useState(null)

  useEffect(() => {
    fetchSubmissions()
  }, [userEmail])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('respondent_email', userEmail)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSurveyedFaculties = () => {
    setShowModal(true)
  }

  const handleChangeResponse = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('respondent_email', userEmail)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      
      setEditingResponse(data)
      onEditResponse(data)
    } catch (error) {
      console.error('Error fetching last response:', error)
      alert('Could not load your previous response.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('rtu_user_email')
    onLogout()
  }

  const totalSubmissions = submissions.length
  const averageRating = submissions.length > 0 
    ? (submissions.reduce((sum, s) => sum + parseFloat(s.average_rating || 0), 0) / submissions.length).toFixed(1)
    : 0
  const uniqueOffices = [...new Set(submissions.map(s => s.office))].length
  const lastSubmitted = submissions.length > 0 
    ? new Date(submissions[0].submitted_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : 'N/A'

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      {/* Header Bar */}
      <div style={{
        backgroundColor: '#0033A0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#0033A0', fontWeight: '700', fontSize: '12px' }}>RTU</span>
          </div>
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
          My Survey Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSurveyedFaculties}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              border: '2px solid #FFD700',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Surveyed Faculties
          </button>
          <button
            onClick={handleChangeResponse}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              border: '2px solid #FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Change Response
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px', 
          marginBottom: '24px' 
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Total Submissions</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#0033A0' }}>{totalSubmissions}</p>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Average Rating Given</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#0033A0' }}>{averageRating}/5</p>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Offices Evaluated</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#0033A0' }}>{uniqueOffices}</p>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Last Submitted</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#0033A0' }}>{lastSubmitted}</p>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A2E', marginBottom: '20px' }}>
            My Submission History
          </h2>
          
          {submissions.length === 0 ? (
            <p style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>No submissions yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E0E7FF' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>Office</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>Client Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>Average Rating</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #E0E7FF' }}>
                      <td style={{ padding: '14px 12px', fontSize: '14px', color: '#1A1A2E' }}>{sub.office}</td>
                      <td style={{ padding: '14px 12px', fontSize: '14px', color: '#1A1A2E' }}>{sub.client_type}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={16} fill={star <= Math.round(sub.average_rating) ? '#FFD700' : 'none'} stroke={star <= Math.round(sub.average_rating) ? '#FFD700' : '#E0E7FF'} />
                          ))}
                          <span style={{ marginLeft: '8px', fontWeight: '600', color: '#0033A0' }}>{sub.average_rating}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', fontSize: '14px', color: '#1A1A2E' }}>{formatDate(sub.submitted_at)}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: sub.status === 'Normal' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: sub.status === 'Normal' ? '#16A34A' : '#DC2626' }}>
                          {sub.status || 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0033A0', margin: 0 }}>Surveyed Offices/Faculties</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={24} color="#6c757d" />
              </button>
            </div>
            {submissions.length === 0 ? (
              <p style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>No offices surveyed yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E0E7FF' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d' }}>Office Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d' }}>Date Submitted</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#6c757d' }}>Rating Given</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #E0E7FF' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{sub.office}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{formatDate(sub.submitted_at)}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={14} fill={star <= Math.round(sub.average_rating) ? '#FFD700' : 'none'} stroke={star <= Math.round(sub.average_rating) ? '#FFD700' : '#E0E7FF'} />
                          ))}
                          <span style={{ marginLeft: '4px', fontWeight: '600', color: '#0033A0' }}>{sub.average_rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * PublicSurvey Page Component
 * Public landing page for RTU Client Satisfaction Survey
 * Route: /survey
 */
function PublicSurvey({ startAtForm }) {

  const navigate = useNavigate()
  const location = useLocation()

const [customQuestions, setCustomQuestions] = useState([])

const fetchSurveyQuestions = async (surveyId) => {
  const { data, error } = await supabase
    .from('surveys')
    .select('questions, target_office')
    .eq('id', surveyId)
    .single()
  
  if (!error && data) {
    setCustomQuestions(data.questions || [])
    if (data.target_office) {
      setFormData(prev => ({ ...prev, office: data.target_office }))
    }
  }
}

useEffect(() => {
  if (location.state?.skipToSurvey && location.state?.email) {
    const { email, clientType, office, surveyId } = location.state
    setFormData({
      email: email || '',
      clientType: clientType || '',
      office: office || ''
    })
    if (surveyId) fetchSurveyQuestions(surveyId)
    setShowSurvey(true)
    setCurrentStep(2)
  }
}, [location.state?.skipToSurvey])

  useEffect(() => {
    if (startAtForm && location.state?.email && location.state?.office) {
      const { email, clientType, office, surveyId } = location.state
      setFormData({
        email: email || '',
        clientType: clientType || '',
        office: office || ''
      })
      setShowSurvey(true)
      setCurrentStep(2)
    }
  }, [startAtForm])

  const [currentStep, setCurrentStep] = useState(1)

  const [landingStep, setLandingStep] = useState(1) // 1 = email/clientType, 2 = office selection
  const [showSurvey, setShowSurvey] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    clientType: '',
    office: ''
  })
  
  const [ratings, setRatings] = useState({
    overallSatisfaction: 0,
    staffProfessionalism: 0,
    speedEfficiency: 0,
    cleanlinessComfort: 0,
    recommendation: 0
  })
  
  const [visitType, setVisitType] = useState('')
  const [feedback, setFeedback] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [customAnswers, setCustomAnswers] = useState({})
  
  const [errors, setErrors] = useState({})
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [submitted, setSubmitted] = useState(false)


  // Handle isEditing state from location.state (navigated from StudentDashboard Edit)
  useEffect(() => {
    if (location.state?.isEditing) {
      const { email, clientType, office, responseId, existingRatings, existingVisitType, existingFeedback } = location.state
      
      setFormData({
        email: email || '',
        clientType: clientType || '',
        office: office || ''
      })
      
      setRatings(existingRatings || {
        overallSatisfaction: 0,
        staffProfessionalism: 0,
        speedEfficiency: 0,
        cleanlinessComfort: 0,
        recommendation: 0
      })
      
      setVisitType(existingVisitType || '')
      setFeedback(existingFeedback || '')
      setIsEditing(true)
      setEditingId(responseId)
      setCurrentStep(3) // Go straight to questions (step 3 in survey view)
      setShowSurvey(true)
    }
  }, [location.state])

  useEffect(() => {
    const savedEmail = localStorage.getItem('rtu_user_email')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }))
    }
  }, [])

  // Handle navigation from StudentDashboard with pre-filled data (non-editing)
  useEffect(() => {
    if (location.state && !location.state?.isEditing) {
      const { email, clientType, office } = location.state
      if (email) {
        setFormData(prev => ({ ...prev, email }))
        localStorage.setItem('rtu_user_email', email)
      }
      if (clientType) setFormData(prev => ({ ...prev, clientType }))
      if (office) {
        setFormData(prev => ({ ...prev, office }))
        // Skip to survey questions if all data is provided
        if (email && clientType && office) {
          setShowSurvey(true)
          setCurrentStep(2)
        }
      }
    }
  }, [location.state])

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const checkDuplicate = () => {
    const key = `rtu_submitted_${formData.email}_${formData.office}`
    const submitted = localStorage.getItem(key)
    return submitted !== null
  }

  const validateLandingStep1 = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.clientType) {
      newErrors.clientType = 'Please select your role'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateLandingStep2 = () => {
    const newErrors = {}
    if (!formData.office) {
      newErrors.office = 'Please select an office to evaluate'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


const validateStep2 = () => {
  setErrors({})
  return true
}


  const validateStep3 = () => {
    const newErrors = {}
    if (!visitType) {
      newErrors.visitType = 'Please select an option'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextLandingStep = async () => {
    if (landingStep === 1) {
      if (!validateLandingStep1()) return
      
      // Save email to localStorage
      localStorage.setItem('rtu_user_email', formData.email)
      
      // ALWAYS redirect to student dashboard first, regardless of previous submissions
      navigate('/student/dashboard', { 
        state: { email: formData.email, clientType: formData.clientType } 
      })
    }
  }

  const handleBeginSurvey = () => {
    if (!validateLandingStep2()) return
    
    if (!isEditing && !editingId && checkDuplicate()) {
      setAlreadySubmitted(true)
      return
    }
    
    localStorage.setItem('rtu_user_email', formData.email)
    setShowSurvey(true)
    setCurrentStep(2)
  }

  const handleBackToLandingStep1 = () => {
    setLandingStep(1)
    setErrors({})
  }

  const handleNextStep = () => {
    if (currentStep === 2) {
      if (!validateStep2()) return
      setCurrentStep(3)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    const averageRating = (
      (ratings.overallSatisfaction + ratings.staffProfessionalism + ratings.speedEfficiency + ratings.cleanlinessComfort + ratings.recommendation) / 5
    ).toFixed(1)

    try {
      if (isEditing && editingId) {
        const { error } = await supabase
          .from('survey_responses')
          .update({
            client_type: formData.clientType,
            office: formData.office,
            rating_overall: ratings.overallSatisfaction,
            rating_staff: ratings.staffProfessionalism,
            rating_speed: ratings.speedEfficiency,
            rating_cleanliness: ratings.cleanlinessComfort,
            rating_recommendation: ratings.recommendation,
            average_rating: averageRating,
            visit_type: visitType,
            feedback: feedback
          })
          .eq('id', editingId)
        if (error) throw error
        navigate('/student/dashboard', {
          state: { email: formData.email, clientType: formData.clientType }
        })
      } else {
        const { error } = await supabase
          .from('survey_responses')
          .insert({
            respondent_email: anonymous ? 'anonymous' : formData.email,
            client_type: formData.clientType,
            office: formData.office,
            rating_overall: ratings.overallSatisfaction,
            rating_staff: ratings.staffProfessionalism,
            rating_speed: ratings.speedEfficiency,
            rating_cleanliness: ratings.cleanlinessComfort,
            rating_recommendation: ratings.recommendation,
            average_rating: averageRating,
            visit_type: visitType,
            feedback: feedback,
            status: 'Normal'
          })
        if (error) throw error

        const key = 'rtu_submitted_' + formData.email + '_' + formData.office
        localStorage.setItem(key, new Date().toISOString())

        setSubmitted(true)
        setShowDashboard(true)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  const handleGoBack = () => {
    if (currentStep === 2) {
      setShowSurvey(false)
      setAlreadySubmitted(false)
      setFormData({ email: formData.email, clientType: '', office: '' })
      setLandingStep(1)
      setErrors({})
      setIsEditing(false)
      setEditingId(null)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    }
  }

  // Student Dashboard View
  if (showDashboard) {
    return (
      <StudentDashboard 
        userEmail={formData.email}
        onLogout={() => {
          setShowDashboard(false)
          setSubmitted(false)
          setShowSurvey(false)
          setFormData({ email: '', clientType: '', office: '' })
          setLandingStep(1)
          setRatings({ overallSatisfaction: 0, staffProfessionalism: 0, speedEfficiency: 0, cleanlinessComfort: 0, recommendation: 0 })
          setVisitType('')
          setFeedback('')
          setCurrentStep(1)
          setIsEditing(false)
          setEditingId(null)
        }}
        onEditResponse={(response) => {
          setFormData({ email: formData.email, clientType: response.client_type, office: response.office })
          setRatings({
            overallSatisfaction: response.rating_overall || 0,
            staffProfessionalism: response.rating_staff || 0,
            speedEfficiency: response.rating_speed || 0,
            cleanlinessComfort: response.rating_cleanliness || 0,
            recommendation: response.rating_recommendation || 0
          })
          setVisitType(response.visit_type || '')
          setFeedback(response.feedback || '')
          setIsEditing(true)
          setEditingId(response.id)
          setShowDashboard(false)
          setShowSurvey(true)
          setCurrentStep(2)
        }}
      />
    )
  }

  // Success Screen
  if (submitted) {
    const averageRating = (
      (ratings.overallSatisfaction + ratings.staffProfessionalism + ratings.speedEfficiency + ratings.cleanlinessComfort + ratings.recommendation) / 5
    ).toFixed(1)

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <div style={{ backgroundColor: '#0033A0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={24} color="#0033A0" />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>RTU Client Satisfaction Survey System</h1>
        </div>

        <div style={{ maxWidth: '500px', margin: '60px auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#0033A0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={50} color="#FFD700" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0033A0', marginBottom: '12px' }}>Thank You!</h2>
          <p style={{ fontSize: '16px', color: '#1A1A2E', marginBottom: '8px' }}>Your feedback has been submitted successfully.</p>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '24px' }}>Your response helps RTU improve its services.</p>

          <div style={{ backgroundColor: '#E0E7FF', borderRadius: '12px', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
            <p style={{ fontSize: '14px', color: '#1A1A2E', marginBottom: '8px' }}><strong>Office Evaluated:</strong> {formData.office}</p>
            <p style={{ fontSize: '14px', color: '#1A1A2E', marginBottom: '12px' }}><strong>Your Average Rating:</strong></p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={24} fill={star <= Math.round(averageRating) ? '#FFD700' : 'none'} stroke={star <= Math.round(averageRating) ? '#FFD700' : '#E0E7FF'} />
              ))}
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#0033A0', marginLeft: '8px' }}>{averageRating} / 5</span>
            </div>
          </div>

          <button onClick={() => navigate('/student/dashboard', { state: { email: formData.email, clientType: formData.clientType } })} style={{ width: '100%', padding: '14px', backgroundColor: '#0033A0', color: '#FFFFFF', border: '2px solid #0033A0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
            🏠 Go to My Dashboard
          </button>
          
          <button onClick={() => setShowDashboard(true)} style={{ padding: '14px 32px', backgroundColor: '#FFFFFF', color: '#0033A0', border: '2px solid #0033A0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginRight: '12px', marginBottom: '12px' }}>
            View My Dashboard
          </button>
          
          <a href="https://www.rtu.edu.ph" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', color: '#6c757d', fontSize: '14px', textDecoration: 'none' }}>
            Go to RTU Website
          </a>

          <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#0033A0', fontWeight: '700', fontSize: '10px' }}>RTU</span>
            </div>
            <span style={{ color: '#6c757d', fontSize: '12px' }}>Rizal Technological University</span>
          </div>
        </div>
      </div>
    )
  }

  // Already submitted view
  if (alreadySubmitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <div style={{ backgroundColor: '#0033A0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '14px' }}>RTU</span>
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>RTU Client Satisfaction Survey System</h1>
        </div>

        <div style={{ maxWidth: '500px', margin: '60px auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <AlertTriangle size={40} color="#FFD700" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0033A0', marginBottom: '12px' }}>Already Submitted!</h2>
          <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '24px' }}>You have already submitted a response for <strong>{formData.office}</strong>.</p>
          <p style={{ fontSize: '16px', color: '#16A34A', marginBottom: '32px', fontWeight: '600' }}>Thank you for your feedback!</p>

          <button onClick={handleGoBack} style={{ padding: '14px 32px', backgroundColor: '#0033A0', color: '#FFFFFF', border: '2px solid #0033A0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Survey View (Step 2 & 3)
  if (showSurvey) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <div style={{ backgroundColor: '#0033A0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={24} color="#0033A0" />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>RTU Client Satisfaction Survey System</h1>
        </div>

        <div style={{ maxWidth: '700px', margin: '40px auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
          <StepIndicator currentStep={currentStep} steps={['Your Info', 'Rate Our Service', 'Your Feedback']} />

          {currentStep >= 2 && (
            <div style={{ backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Check size={20} color="#16A34A" />
              <span style={{ color: '#16A34A', fontWeight: '500' }}>✓ Your Info Submitted</span>
              <span style={{ color: '#6c757d', marginLeft: 'auto' }}>{formData.clientType} • {formData.office}</span>
            </div>
          )}


{currentStep === 2 && (
  <div>
    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0033A0', marginBottom: '24px' }}>
      {isEditing ? 'Step 2: Update Your Rating' : 'Step 2: Rate Our Service'}
    </h2>

    {customQuestions.length > 0 ? (
      customQuestions.map((q, index) => (
        <div key={q.id} style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: index < customQuestions.length - 1 ? '1px solid #E0E7FF' : 'none' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>
            {index + 1}. {q.text}
            {q.required && <span style={{ color: '#DC2626' }}> *</span>}
          </p>
          {q.type === 'rating' && (
            <StarRating
              value={customAnswers[q.id] || 0}
              onChange={(value) => setCustomAnswers(prev => ({ ...prev, [q.id]: value }))}
              size="large"
            />
          )}
          {q.type === 'multiple' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(q.options || []).map((option, optIndex) => (
                <label key={optIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', border: customAnswers[q.id] === option ? '2px solid #FFD700' : '2px solid #E0E7FF' }}>
                  <input
                    type="radio"
                    name={String(q.id)}
                    value={option}
                    checked={customAnswers[q.id] === option}
                    onChange={() => setCustomAnswers(prev => ({ ...prev, [q.id]: option }))}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
          {q.type === 'text' && (
            <textarea
              placeholder="Type your response..."
              value={customAnswers[q.id] || ''}
              onChange={(e) => setCustomAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              style={{ width: '100%', minHeight: '80px', padding: '12px 16px', border: '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
          )}
        </div>
      ))
    ) : (
      RATING_QUESTIONS.map((q, index) => (
        <div key={q.key} style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: index < RATING_QUESTIONS.length - 1 ? '1px solid #E0E7FF' : 'none' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>{index + 1}. {q.question}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <StarRating value={ratings[q.key]} onChange={(value) => setRatings({ ...ratings, [q.key]: value })} size="large" />
            <span style={{ fontSize: '12px', color: '#6c757d', minWidth: '140px' }}>
              {ratings[q.key] === 1 ? 'Very Dissatisfied' : ratings[q.key] === 2 ? 'Dissatisfied' : ratings[q.key] === 3 ? 'Neutral' : ratings[q.key] === 4 ? 'Satisfied' : ratings[q.key] === 5 ? 'Very Satisfied' : 'Click to rate'}
            </span>
          </div>
          {errors[q.key] && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '8px' }}>{errors[q.key]}</p>}
        </div>
      ))
    )}

    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
      <button onClick={handleGoBack} style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#6c757d', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Back</button>
      <button onClick={handleNextStep} style={{ padding: '12px 32px', backgroundColor: '#0033A0', color: '#FFFFFF', border: '2px solid #0033A0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Next</button>
    </div>
  </div>
)}


          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0033A0', marginBottom: '24px' }}>Step 3: Your Feedback</h2>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>Which best describes your visit today? <span style={{ color: '#DC2626' }}>*</span></label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {VISIT_TYPES.map(type => (
                    <button key={type} type="button" onClick={() => { setVisitType(type); if (errors.visitType) setErrors({ ...errors, visitType: '' }) }} style={{ padding: '10px 16px', borderRadius: '20px', border: visitType === type ? '2px solid #FFD700' : '2px solid #E0E7FF', backgroundColor: visitType === type ? '#FFD700' : '#FFFFFF', color: visitType === type ? '#0033A0' : '#1A1A2E', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>{type}</button>
                  ))}
                </div>
                {errors.visitType && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '8px' }}>{errors.visitType}</p>}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>Any additional comments or suggestions?<span style={{ color: '#6c757d', fontWeight: '400' }}> (optional)</span></label>
                <textarea placeholder="Type your feedback here..." value={feedback} onChange={(e) => { if (e.target.value.length <= 500) setFeedback(e.target.value) }} style={{ width: '100%', minHeight: '120px', padding: '12px 16px', border: '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', color: '#1A1A2E' }} />
                <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px', textAlign: 'right' }}>{feedback.length} / 500</p>
              </div>

              <button onClick={handleSubmit} style={{ width: '100%', padding: '16px', backgroundColor: '#0033A0', color: '#FFFFFF', border: '2px solid #0033A0', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>{isEditing ? 'Update My Response' : 'Submit My Feedback'}</button>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#6c757d', marginTop: '12px' }}>🔒 Your response is securely stored.</p>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button onClick={handleGoBack} style={{ background: 'none', border: 'none', color: '#6c757d', fontSize: '14px', cursor: 'pointer' }}>← Back to ratings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Initial Landing Page - Screen 1 (Email + Client Type) or Screen 2 (Office Selection)
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <div style={{ backgroundColor: '#0033A0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={24} color="#0033A0" />
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>RTU Client Satisfaction Survey System</h1>
      </div>

      <div style={{ maxWidth: '500px', margin: '60px auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0033A0', marginBottom: '8px' }}>Welcome!</h2>
          <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '16px' }}>Please fill in your details to begin the survey.</p>
          <div style={{ width: '60px', height: '3px', backgroundColor: '#FFD700', margin: '0 auto' }} />
        </div>

        {/* SCREEN 1: Email + Client Type */}
        {landingStep === 1 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>Email Address <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="email" placeholder="Enter your email address" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }) }} style={{ width: '100%', padding: '12px 16px', border: errors.email ? '2px solid #DC2626' : '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#1A1A2E' }} />
              {errors.email && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>I am a... <span style={{ color: '#DC2626' }}>*</span></label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {CLIENT_TYPES.map(type => (
                  <button key={type} type="button" onClick={() => { setFormData({ ...formData, clientType: type }); if (errors.clientType) setErrors({ ...errors, clientType: '' }) }} style={{ padding: '12px 20px', borderRadius: '24px', border: formData.clientType === type ? '2px solid #FFD700' : '2px solid #0033A0', backgroundColor: formData.clientType === type ? '#FFD700' : '#FFFFFF', color: formData.clientType === type ? '#0033A0' : '#0033A0', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>{type}</button>
                ))}
              </div>
              {errors.clientType && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.clientType}</p>}
            </div>

            <button onClick={handleNextLandingStep} style={{ width: '100%', padding: '14px', backgroundColor: '#0033A0', color: '#FFFFFF', border: '2px solid #0033A0', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              Next
            </button>
          </div>
        )}

        {/* SCREEN 2: Office Selection */}
        {landingStep === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#0033A0', marginBottom: '4px' }}>Hello, {formData.email}! 👋</p>
              <p style={{ fontSize: '14px', color: '#6c757d' }}>Which office would you like to evaluate today?</p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {OFFICES.map(office => (
                  <button key={office} type="button" onClick={() => { setFormData({ ...formData, office: office }); if (errors.office) setErrors({ ...errors, office: '' }) }} style={{ padding: '12px 20px', borderRadius: '24px', border: formData.office === office ? '2px solid #FFD700' : '2px solid #0033A0', backgroundColor: formData.office === office ? '#FFD700' : '#FFFFFF', color: formData.office === office ? '#0033A0' : '#0033A0', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>{office}</button>
                ))}
              </div>
              {errors.office && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>{errors.office}</p>}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleBackToLandingStep1} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: '#6c757d', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Back</button>
              <button onClick={handleBeginSurvey} style={{ flex: 2, padding: '14px', backgroundColor: '#0033A0', color: '#FFFFFF', border: '2px solid #0033A0', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Begin Survey</button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6c757d', marginTop: '24px' }}>🔒 Your information is kept confidential and secure.</p>
      </div>
    </div>
  )
}

export default PublicSurvey

