import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertTriangle, Check, Star, X } from 'lucide-react'
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

function StepIndicator({ currentStep, steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isCompleted ? '#0033A0' : isActive ? '#FFD700' : '#E0E7FF', color: isCompleted ? '#FFFFFF' : isActive ? '#0033A0' : '#6c757d', fontWeight: '600', fontSize: '14px' }}>
              {isCompleted ? <Check size={18} /> : stepNum}
            </div>
            <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: isActive ? '600' : '400', color: isActive ? '#0033A0' : isCompleted ? '#0033A0' : '#6c757d' }}>{step}</span>
            {index < steps.length - 1 && (
              <div style={{ width: '60px', height: '2px', backgroundColor: isCompleted ? '#0033A0' : '#E0E7FF', marginLeft: '12px', marginRight: '12px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PublicSurvey({ startAtForm }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [currentStep, setCurrentStep] = useState(1)
  const [landingStep, setLandingStep] = useState(1)
  const [showSurvey, setShowSurvey] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [customQuestions, setCustomQuestions] = useState([])
  const [customAnswers, setCustomAnswers] = useState({})

  const [formData, setFormData] = useState({ email: '', clientType: '', office: '' })
  const [ratings, setRatings] = useState({ overallSatisfaction: 0, staffProfessionalism: 0, speedEfficiency: 0, cleanlinessComfort: 0, recommendation: 0 })
  const [visitType, setVisitType] = useState('')
  const [feedback, setFeedback] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [errors, setErrors] = useState({})
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
    const init = async () => {
      if (location.state?.skipToSurvey && location.state?.email) {
        const { email, clientType, office, surveyId } = location.state
        setFormData({ email: email || '', clientType: clientType || '', office: office || '' })
        if (surveyId) await fetchSurveyQuestions(surveyId)

        // Check if already submitted for this office
        const { data: existing } = await supabase
          .from('survey_responses')
          .select('id, status')
          .eq('respondent_email', email)
          .eq('office', office)
          .maybeSingle()

        // ✅ FIXED: match exact status string set by ResultsTable.jsx
        if (existing && existing.status !== 'Resubmit Allowed') {
          setAlreadySubmitted(true)
          setShowSurvey(true)
          return
        }

        // No existing submission, or admin allowed resubmit — proceed to survey
        setShowSurvey(true)
        setCurrentStep(2)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (location.state?.isEditing) {
      const { email, clientType, office, responseId, existingRatings, existingVisitType, existingFeedback } = location.state
      setFormData({ email: email || '', clientType: clientType || '', office: office || '' })
      setRatings(existingRatings || { overallSatisfaction: 0, staffProfessionalism: 0, speedEfficiency: 0, cleanlinessComfort: 0, recommendation: 0 })
      setVisitType(existingVisitType || '')
      setFeedback(existingFeedback || '')
      setIsEditing(true)
      setEditingId(responseId)
      setCurrentStep(2)
      setShowSurvey(true)
    }
  }, [])

  useEffect(() => {
    const savedEmail = localStorage.getItem('rtu_user_email')
    if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail }))
  }, [])

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateLandingStep1 = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email address'
    if (!formData.clientType) newErrors.clientType = 'Please select your role'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateLandingStep2 = () => {
    const newErrors = {}
    if (!formData.office) newErrors.office = 'Please select an office to evaluate'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (customQuestions.length > 0) {
      customQuestions.forEach(q => {
        if (q.required && !customAnswers[q.id]) {
          newErrors[q.id] = 'This field is required'
        }
      })
    } else {
      const ratingKeys = ['overallSatisfaction', 'staffProfessionalism', 'speedEfficiency', 'cleanlinessComfort', 'recommendation']
      ratingKeys.forEach(key => {
        if (ratings[key] === 0) newErrors[key] = 'Please rate this question'
      })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextLandingStep = async () => {
    if (landingStep === 1) {
      if (!validateLandingStep1()) return
      localStorage.setItem('rtu_user_email', formData.email)
      navigate('/student/dashboard', { state: { email: formData.email, clientType: formData.clientType } })
    }
  }

  const handleBeginSurvey = () => {
    if (!validateLandingStep2()) return
    localStorage.setItem('rtu_user_email', formData.email)
    setShowSurvey(true)
    setCurrentStep(2)
  }

  const handleNextStep = () => {
    if (currentStep === 2) {
      if (!validateStep2()) return
      setCurrentStep(3)
    }
  }

  const handleSubmit = async () => {
    const averageRating = (() => {
      if (customQuestions && customQuestions.length > 0) {
        const ratingAnswers = customQuestions
          .filter(q => q.type === 'rating')
          .map(q => Number(customAnswers[q.id] || 0))
        if (ratingAnswers.length > 0) {
          return (ratingAnswers.reduce((sum, val) => sum + val, 0) / ratingAnswers.length).toFixed(1)
        }
        return '5.0'
      }
      return ((ratings.overallSatisfaction + ratings.staffProfessionalism + ratings.speedEfficiency + ratings.cleanlinessComfort + ratings.recommendation) / 5).toFixed(1)
    })()

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
        navigate('/student/dashboard', { state: { email: formData.email, clientType: formData.clientType } })
      } else {
        // Check if resubmitting — if so, UPDATE the existing row instead of INSERT
        const { data: existing } = await supabase
          .from('survey_responses')
          .select('id, status')
          .eq('respondent_email', formData.email)
          .eq('office', formData.office)
          .maybeSingle()

        if (existing && existing.status === 'Resubmit Allowed') {
          // Overwrite the existing response and reset status to Normal
          const { error } = await supabase
            .from('survey_responses')
            .update({
              client_type: formData.clientType,
              rating_overall: ratings.overallSatisfaction,
              rating_staff: ratings.staffProfessionalism,
              rating_speed: ratings.speedEfficiency,
              rating_cleanliness: ratings.cleanlinessComfort,
              rating_recommendation: ratings.recommendation,
              average_rating: averageRating,
              visit_type: visitType,
              feedback: feedback,
              status: 'Normal',
              submitted_at: new Date().toISOString(),
              custom_answers: customQuestions.length > 0 ? JSON.stringify({
                questions: customQuestions,
                answers: customAnswers
              }) : null
            })
            .eq('id', existing.id)
          if (error) throw error
        } else {
          // Fresh insert
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
              status: 'Normal',
              custom_answers: customQuestions.length > 0 ? JSON.stringify({
                questions: customQuestions,
                answers: customAnswers
              }) : null
            })
          if (error) throw error

          const key = 'rtu_submitted_' + formData.email + '_' + formData.office
          localStorage.setItem(key, new Date().toISOString())

          try {
            let clientId = null
            const { data: existingClient } = await supabase
              .from('clients')
              .select('client_id, email, type')
              .eq('email', anonymous ? 'anonymous' : formData.email)
              .maybeSingle()

            if (existingClient) {
              clientId = existingClient.client_id
            } else {
              const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert({ email: anonymous ? 'anonymous' : formData.email, type: formData.clientType })
                .select('client_id')
                .single()
              if (!clientError) clientId = newClient.client_id
            }

            if (clientId) {
              const { data: surveyFormData, error: formError } = await supabase
                .from('survey_form')
                .insert({ client_id: clientId, date: new Date().toISOString().split('T')[0], service_availed: formData.office, rate_scale: Math.round(parseFloat(averageRating)) })
                .select('survey_id')
                .single()

              if (!formError && surveyFormData) {
                await supabase.from('survey_response').insert({ response_id: 'R' + Date.now(), survey_id: surveyFormData.survey_id, feedback: feedback, suggestions: '' })
              }
            }
          } catch (normalizedError) {
            console.error('Normalized tables error:', normalizedError)
          }
        }

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

  const Header = () => (
    <div style={{ backgroundColor: '#0033A0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <img src="/rtu_logo.png" alt="RTU Logo" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
      <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>RTU Client Satisfaction Survey System</h1>
    </div>
  )

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <Header />
        <div style={{ maxWidth: '500px', margin: '60px auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#0033A0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={50} color="#FFD700" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0033A0', marginBottom: '12px' }}>Thank You!</h2>
          <p style={{ fontSize: '16px', color: '#1A1A2E', marginBottom: '8px' }}>Your feedback has been submitted successfully.</p>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '24px' }}>Your response helps RTU improve its services.</p>
          <button onClick={() => navigate('/student/dashboard', { state: { email: formData.email, clientType: formData.clientType } })} style={{ width: '100%', padding: '14px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
            Go to My Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (showSurvey && alreadySubmitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <Header />
        <div style={{ maxWidth: '500px', margin: '60px auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFF3CD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <AlertTriangle size={40} color="#FFD700" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0033A0', marginBottom: '12px' }}>Already Submitted</h2>
          <p style={{ fontSize: '15px', color: '#1A1A2E', marginBottom: '8px' }}>You have already submitted a response for this office.</p>
          <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '24px' }}>Please contact the admin if you need to resubmit.</p>
          <button
            onClick={() => navigate('/student/dashboard', { state: { email: formData.email, clientType: formData.clientType } })}
            style={{ width: '100%', padding: '14px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (showSurvey) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
        <Header />
        <div style={{ maxWidth: '700px', margin: '40px auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <StepIndicator currentStep={currentStep - 1} steps={['Rate Our Service', 'Your Feedback']} />

          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0033A0', marginBottom: '24px' }}>
                {isEditing ? 'Step 1: Update Your Rating' : 'Step 1: Rate Our Service'}
              </h2>
              {customQuestions.length > 0 ? (
                customQuestions.map((q, index) => (
                  <div key={q.id} style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: index < customQuestions.length - 1 ? '1px solid #E0E7FF' : 'none' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>
                      {index + 1}. {q.text}
                      {q.required && <span style={{ color: '#DC2626' }}> *</span>}
                    </p>
                    {q.type === 'rating' && (
                      <StarRating value={customAnswers[q.id] || 0} onChange={(value) => setCustomAnswers(prev => ({ ...prev, [q.id]: value }))} size="large" />
                    )}
                    {q.type === 'multiple' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(q.options || []).map((option, optIndex) => (
                          <label key={optIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', border: customAnswers[q.id] === option ? '2px solid #FFD700' : '2px solid #E0E7FF' }}>
                            <input type="radio" name={String(q.id)} value={option} checked={customAnswers[q.id] === option} onChange={() => setCustomAnswers(prev => ({ ...prev, [q.id]: option }))} />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'text' && (
                      <textarea placeholder="Type your response..." value={customAnswers[q.id] || ''} onChange={(e) => setCustomAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} style={{ width: '100%', minHeight: '80px', padding: '12px 16px', border: '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
                    )}
                    {errors[q.id] && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '8px' }}>{errors[q.id]}</p>}
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
                <button onClick={handleGoBack} style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#6c757d', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Back</button>
                <button onClick={handleNextStep} style={{ padding: '12px 32px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Next</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0033A0', marginBottom: '24px' }}>Step 2: Your Feedback</h2>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>Any additional comments? <span style={{ color: '#6c757d', fontWeight: '400' }}>(optional)</span></label>
                <textarea placeholder="Type your feedback here..." value={feedback} onChange={(e) => { if (e.target.value.length <= 500) setFeedback(e.target.value) }} style={{ width: '100%', minHeight: '120px', padding: '12px 16px', border: '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
                <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px', textAlign: 'right' }}>{feedback.length} / 500</p>
              </div>
              <button onClick={handleSubmit} style={{ width: '100%', padding: '16px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>{isEditing ? 'Update My Response' : 'Submit My Feedback'}</button>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#6c757d', marginTop: '12px' }}>Your response is securely stored.</p>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button onClick={handleGoBack} style={{ background: 'none', border: 'none', color: '#6c757d', fontSize: '14px', cursor: 'pointer' }}>Back to ratings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <Header />
      <div style={{ maxWidth: '500px', margin: '60px auto', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0033A0', marginBottom: '8px' }}>Welcome!</h2>
          <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '16px' }}>Please fill in your details to begin the survey.</p>
          <div style={{ width: '60px', height: '3px', backgroundColor: '#FFD700', margin: '0 auto' }} />
        </div>
        {landingStep === 1 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>Email Address <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="email" placeholder="Enter your email address" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }) }} style={{ width: '100%', padding: '12px 16px', border: errors.email ? '2px solid #DC2626' : '2px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#1A1A2E' }} />
              {errors.email && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>I am a... <span style={{ color: '#DC2626' }}>*</span></label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {CLIENT_TYPES.map(type => (
                  <button key={type} type="button" onClick={() => { setFormData({ ...formData, clientType: type }); setErrors({ ...errors, clientType: '' }) }} style={{ padding: '12px 20px', borderRadius: '24px', border: formData.clientType === type ? '2px solid #FFD700' : '2px solid #0033A0', backgroundColor: formData.clientType === type ? '#FFD700' : '#FFFFFF', color: '#0033A0', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>{type}</button>
                ))}
              </div>
              {errors.clientType && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.clientType}</p>}
            </div>
            <button onClick={handleNextLandingStep} style={{ width: '100%', padding: '14px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Next</button>
          </div>
        )}
        {landingStep === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#0033A0' }}>Hello, {formData.email}!</p>
              <p style={{ fontSize: '14px', color: '#6c757d' }}>Which office would you like to evaluate today?</p>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {OFFICES.map(office => (
                  <button key={office} type="button" onClick={() => { setFormData({ ...formData, office: office }); setErrors({ ...errors, office: '' }) }} style={{ padding: '12px 20px', borderRadius: '24px', border: formData.office === office ? '2px solid #FFD700' : '2px solid #0033A0', backgroundColor: formData.office === office ? '#FFD700' : '#FFFFFF', color: '#0033A0', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>{office}</button>
                ))}
              </div>
              {errors.office && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>{errors.office}</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setLandingStep(1)} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: '#6c757d', border: '1px solid #E0E7FF', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Back</button>
              <button onClick={handleBeginSurvey} style={{ flex: 2, padding: '14px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Begin Survey</button>
            </div>
          </div>
        )}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6c757d', marginTop: '24px' }}>Your information is kept confidential and secure.</p>
      </div>
    </div>
  )
}

export default PublicSurvey