import { useState } from 'react'
import { Check, Star, GraduationCap } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'

const OFFICES = ['Cashier', 'Registrar', 'Clinic', 'MIC/MISO', 'SAASU', 'BAO', 'SFAU']
const CLIENT_TYPES = ['Student', 'Faculty', 'Staff', 'Visitor']
const VISIT_TYPES = ['First visit', 'Return visit', 'Regular visit (weekly/monthly)', 'Referred by someone']

const RATING_QUESTIONS = [
  'How satisfied are you with the overall service?',
  'How would you rate the staff\'s professionalism?',
  'How would you rate the speed and efficiency of service?',
  'How likely are you to recommend this service to others?'
]

/**
 * SurveyForm Page Component
 * Public-facing survey form for respondents
 * Path: /survey/:officeId
 */
function SurveyForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    clientType: '',
    office: '',
    anonymous: false,
    name: '',
    email: '',
    ratings: [0, 0, 0, 0],
    visitType: '',
    comments: ''
  })
  
  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const updateRating = (questionIndex, rating) => {
    const newRatings = [...formData.ratings]
    newRatings[questionIndex] = rating
    setFormData({ ...formData, ratings: newRatings })
    if (errors[`rating${questionIndex}`]) {
      setErrors({ ...errors, [`rating${questionIndex}`]: '' })
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.clientType) newErrors.clientType = 'Please select your role'
    if (!formData.office) newErrors.office = 'Please select an office'
    if (!formData.anonymous && !formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.anonymous && !formData.email.trim()) newErrors.email = 'Email is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    formData.ratings.forEach((rating, index) => {
      if (rating === 0) newErrors[`rating${index}`] = 'Please rate this question'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors = {}
    if (!formData.visitType) newErrors.visitType = 'Please select your visit type'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    const averageRating = formData.ratings.filter(r => r > 0).reduce((a, b) => a + b, 0) / formData.ratings.filter(r => r > 0).length
    
    const submissionData = {
      client_type: formData.clientType,
      office: formData.office,
      respondent_name: formData.anonymous ? null : formData.name,
      respondent_email: formData.anonymous ? null : formData.email,
      rating_overall: formData.ratings[0],
      rating_staff: formData.ratings[1],
      rating_speed: formData.ratings[2],
      rating_recommendation: formData.ratings[3],
      visit_type: formData.visitType,
      feedback: formData.comments,
      average_rating: averageRating.toFixed(2),
      status: averageRating >= 4 ? 'Normal' : averageRating >= 3 ? 'Flagged' : 'Flagged'
    }

    const { error } = await supabase
      .from('survey_responses')
      .insert(submissionData)

    if (!error) {
      setSubmitted(true)
    } else {
      console.error('Error submitting survey:', error)
      alert('There was an error submitting your response. Please try again.')
    }
  }

  const handleReset = () => {
    setFormData({
      clientType: '',
      office: '',
      anonymous: false,
      name: '',
      email: '',
      ratings: [0, 0, 0, 0],
      visitType: '',
      comments: ''
    })
    setCurrentStep(1)
    setSubmitted(false)
  }

  const averageRating = formData.ratings.filter(r => r > 0).reduce((a, b) => a + b, 0) / formData.ratings.filter(r => r > 0).length

  // Success Screen
  if (submitted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F5F7FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Success Checkmark */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#0033A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Check size={40} color="#FFD700" strokeWidth={3} />
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A2E', marginBottom: '12px' }}>
            Thank you for your feedback!
          </h2>
          <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '24px' }}>
            Your response has been submitted successfully.
          </p>

          {/* Average Rating */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Your average rating:</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star}
                  size={28}
                  fill={star <= Math.round(averageRating) ? '#FFD700' : 'none'}
                  stroke={star <= Math.round(averageRating) ? '#FFD700' : '#E0E7FF'}
                />
              ))}
            </div>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#0033A0', marginTop: '8px' }}>
              {averageRating.toFixed(1)} / 5
            </p>
          </div>

          <button
            onClick={handleReset}
            style={{
              padding: '14px 28px',
              backgroundColor: '#FFFFFF',
              color: '#0033A0',
              border: '2px solid #0033A0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F5F7FA',
      padding: '0 0 40px 0'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#0033A0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '14px' }}>RTU</span>
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
          Client Satisfaction Survey
        </h1>
      </div>

      {/* Step Indicator */}
      <div style={{ 
        maxWidth: '680px', 
        margin: '0 auto', 
        padding: '24px 20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '8px'
      }}>
        {[1, 2, 3].map(step => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: currentStep > step ? '#0033A0' : currentStep === step ? '#FFD700' : '#E0E7FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentStep > step ? '#FFFFFF' : currentStep === step ? '#0033A0' : '#6c757d',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {currentStep > step ? <Check size={18} /> : step}
            </div>
            <span style={{ 
              marginLeft: '8px', 
              fontSize: '13px', 
              color: currentStep >= step ? '#1A1A2E' : '#adb5bd',
              fontWeight: currentStep === step ? '600' : '400'
            }}>
              {step === 1 ? 'Your Info' : step === 2 ? 'Ratings' : 'Feedback'}
            </span>
            {step < 3 && (
              <div style={{ 
                width: '40px', 
                height: '2px', 
                backgroundColor: currentStep > step ? '#0033A0' : '#E0E7FF',
                marginLeft: '8px'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E0E7FF',
        padding: '32px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        {/* STEP 1: Respondent Info */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1A2E', marginBottom: '24px' }}>
              Respondent Information
            </h2>

            {/* Client Type */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>
                Client Type <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {CLIENT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => updateField('clientType', type)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '24px',
                      border: `2px solid ${formData.clientType === type ? '#FFD700' : '#0033A0'}`,
                      backgroundColor: formData.clientType === type ? '#FFD700' : '#FFFFFF',
                      color: formData.clientType === type ? '#0033A0' : '#0033A0',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.clientType && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{errors.clientType}</p>}
            </div>

            {/* Office */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>
                Office Being Evaluated <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={formData.office}
                onChange={(e) => updateField('office', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${errors.office ? '#DC2626' : '#E0E7FF'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="">Select an office</option>
                {OFFICES.map(office => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </select>
              {errors.office && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{errors.office}</p>}
            </div>

            {/* Anonymous Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div 
                  onClick={() => updateField('anonymous', !formData.anonymous)}
                  style={{
                    width: '48px',
                    height: '26px',
                    borderRadius: '13px',
                    backgroundColor: formData.anonymous ? '#0033A0' : '#E0E7FF',
                    position: 'relative',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    position: 'absolute',
                    top: '2px',
                    left: formData.anonymous ? '24px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Submit anonymously</span>
              </label>
            </div>

            {/* Name and Email (when not anonymous) */}
            {!formData.anonymous && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>
                    Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter your name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${errors.name ? '#DC2626' : '#E0E7FF'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  {errors.name && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>
                    Email <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${errors.email ? '#DC2626' : '#E0E7FF'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  {errors.email && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{errors.email}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Likert Rating */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1A2E', marginBottom: '24px' }}>
              Satisfaction Ratings
            </h2>

            {RATING_QUESTIONS.map((question, qIndex) => (
              <div key={qIndex} style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>
                  {qIndex + 1}. {question} <span style={{ color: '#DC2626' }}>*</span>
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={32}
                      fill={star <= formData.ratings[qIndex] ? '#FFD700' : 'none'}
                      stroke={star <= formData.ratings[qIndex] ? '#FFD700' : '#E0E7FF'}
                      onClick={() => updateRating(qIndex, star)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#adb5bd' }}>
                  <span>1 = Very Dissatisfied</span>
                  <span>3 = Neutral</span>
                  <span>5 = Very Satisfied</span>
                </div>
                {errors[`rating${qIndex}`] && (
                  <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{errors[`rating${qIndex}`]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Feedback */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1A2E', marginBottom: '24px' }}>
              Additional Feedback
            </h2>

            {/* Visit Type */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>
                Which best describes your visit today? <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {VISIT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => updateField('visitType', type)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '24px',
                      border: `2px solid ${formData.visitType === type ? '#FFD700' : '#0033A0'}`,
                      backgroundColor: formData.visitType === type ? '#FFD700' : '#FFFFFF',
                      color: formData.visitType === type ? '#0033A0' : '#0033A0',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.visitType && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{errors.visitType}</p>}
            </div>

            {/* Comments */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>
                Share any additional comments or suggestions:
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => updateField('comments', e.target.value.slice(0, 500))}
                placeholder="Type your feedback here..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #E0E7FF',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none'
                }}
              />
              <p style={{ textAlign: 'right', fontSize: '12px', color: '#adb5bd', marginTop: '4px' }}>
                {formData.comments.length} / 500
              </p>
            </div>

            <p style={{ fontSize: '14px', color: '#6c757d', marginTop: '24px' }}>
              🔒 Your response is securely stored and kept confidential.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E0E7FF' }}>
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FFFFFF',
                color: '#0033A0',
                border: '2px solid #0033A0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          ) : (
            <div />
          )}
          
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0033A0',
                color: '#FFFFFF',
                border: '2px solid #0033A0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                padding: '14px 32px',
                backgroundColor: '#0033A0',
                color: '#FFFFFF',
                border: '2px solid #0033A0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Submit Response
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SurveyForm

