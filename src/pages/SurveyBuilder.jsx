import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Star, 
  List, 
  MessageSquare,
  Copy,
  Check
} from 'lucide-react'
import { supabase } from '../utils/supabaseClient'

const PERIODS = ['Monthly', 'Quarterly', 'Yearly']

function SurveyBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [offices, setOffices] = useState([])

  const [survey, setSurvey] = useState({
    title: '',
    instructions: '',
    targetOffice: '',
    period: 'Monthly',
    status: 'draft',
    questions: []
  })

  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const fetchOffices = async () => {
      const { data, error } = await supabase
        .from('offices')
        .select('office_id, office_name')
        .order('office_name', { ascending: true })
      if (!error && data) {
        setOffices(data)
        console.log('Fetched offices:', data)
      }
    }
    fetchOffices()
  }, [])

  // Pre-fill form if editing existing survey
  useEffect(() => {
    try {
      if (location.state && location.state.editingSurvey) {
        const editData = location.state.editingSurvey

        // Parse questions — Supabase stores them as a JSON string
        let parsedQuestions = []
        if (Array.isArray(editData.questions)) {
          parsedQuestions = editData.questions
        } else if (typeof editData.questions === 'string') {
          try {
            parsedQuestions = JSON.parse(editData.questions) || []
          } catch {
            parsedQuestions = []
          }
        }

        setSurvey({
          title: editData.title || '',
          instructions: editData.instructions || '',
          // surveys table uses target_office; fall back to office for staff-created surveys
          targetOffice: editData.target_office || editData.office || editData.targetOffice || '',
          period: editData.period || 'Monthly',
          status: editData.status || 'draft',
          questions: parsedQuestions,
          id: editData.id || null,
          createdDate: editData.created_at || editData.createdDate || null
        })
      }
    } catch (error) {
      console.error('Error loading survey for editing:', error)
      setHasError(true)
    }
  }, [])
  
  const [showLink, setShowLink] = useState(false)
  const [copied, setCopied] = useState(false)

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: 'rating',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }
    setSurvey({
      ...survey,
      questions: [...survey.questions, newQuestion]
    })
  }

  const updateQuestion = (id, field, value) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    })
  }

  const deleteQuestion = (id) => {
    setSurvey({
      ...survey,
      questions: survey.questions.filter(q => q.id !== id)
    })
  }

  const addOption = (questionId) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
          : q
      )
    })
  }

  const removeOption = (questionId, optionIndex) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
          : q
      )
    })
  }

  const updateOption = (questionId, optionIndex, value) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, i) => i === optionIndex ? value : opt) }
          : q
      )
    })
  }

  const handleSaveDraft = async () => {
    const surveyData = {
      title: survey.title || 'Untitled Survey',
      instructions: survey.instructions || '',
      target_office: survey.targetOffice,
      period: survey.period,
      status: 'draft',
      questions: JSON.stringify(survey.questions),
      updated_at: new Date().toISOString()
    }

    if (survey.id) {
      await supabase.from('surveys').update(surveyData).eq('id', survey.id)
    } else {
      await supabase.from('surveys').insert({
        ...surveyData,
        id: 'S' + String(Date.now()).slice(-6),
        created_at: new Date().toISOString()
      })
    }
    navigate('/admin/surveys')
  }

  const handlePublish = async () => {
    const surveyData = {
      title: survey.title || 'Untitled Survey',
      instructions: survey.instructions || '',
      target_office: survey.targetOffice,
      period: survey.period,
      status: 'published',
      questions: JSON.stringify(survey.questions),
      updated_at: new Date().toISOString()
    }

    if (survey.id) {
      await supabase.from('surveys').update(surveyData).eq('id', survey.id)
    } else {
      await supabase.from('surveys').insert({
        ...surveyData,
        id: 'S' + String(Date.now()).slice(-6),
        created_at: new Date().toISOString()
      })
    }
    navigate('/admin/surveys')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://rtu.edu.ph/survey/${Date.now()}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (hasError) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: '#1A1A2E' }}>Something went wrong loading the survey.</h2>
        <button 
          onClick={() => navigate('/admin/surveys')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0033A0',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="page-header">
      <h1 className="page-title">Survey Builder</h1>
      <p className="page-subtitle">Create and manage your satisfaction surveys</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Left Panel - Builder */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A2E', marginBottom: '20px' }}>
            Survey Details
          </h3>

          {/* Survey Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#6c757d', marginBottom: '8px' }}>
              Survey Title
            </label>
            <input
              type="text"
              placeholder="Enter survey title"
              value={survey.title}
              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #E0E7FF',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                color: '#1A1A2E'
              }}
            />
          </div>

          {/* Survey Instructions */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#6c757d', marginBottom: '8px' }}>
              Survey Instructions
            </label>
            <textarea
              placeholder="Enter survey instructions"
              value={survey.instructions}
              onChange={(e) => setSurvey({ ...survey, instructions: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #E0E7FF',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                color: '#1A1A2E',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Target Office */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#6c757d', marginBottom: '8px' }}>
              Target Office
            </label>
            <select
              value={survey.targetOffice}
              onChange={(e) => setSurvey({ ...survey, targetOffice: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #E0E7FF',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                color: '#1A1A2E',
                backgroundColor: '#F5F7FA'
              }}
            >
              <option value="">Select Office</option>
              {offices.map(office => (
                <option key={office.office_id} value={office.office_name}>
                  {office.office_name}
                </option>
              ))}
            </select>
          </div>

          {/* Survey Period */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#6c757d', marginBottom: '8px' }}>
              Survey Period
            </label>
            <select
              value={survey.period}
              onChange={(e) => setSurvey({ ...survey, period: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #E0E7FF',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                color: '#1A1A2E',
                backgroundColor: '#F5F7FA'
              }}
            >
              {PERIODS.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>

          {/* Questions Section */}
          <div style={{ borderTop: '1px solid #E0E7FF', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A2E' }}>
                Questions
              </h3>
              <button
                onClick={addQuestion}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#FFD700',
                  color: '#0033A0',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            {survey.questions.map((question, index) => (
              <div
                key={question.id}
                style={{
                  backgroundColor: '#F5F7FA',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #E0E7FF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ cursor: 'grab', color: '#adb5bd', paddingTop: '8px' }}>
                    <GripVertical size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Enter your question"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0E7FF',
                        borderRadius: '6px',
                        fontSize: '14px',
                        marginBottom: '12px',
                        outline: 'none'
                      }}
                    />

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #E0E7FF',
                          borderRadius: '6px',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <option value="rating">Rating Scale (1-5)</option>
                        <option value="multiple">Multiple Choice</option>
                        <option value="text">Open-ended Text</option>
                      </select>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6c757d' }}>
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                        />
                        Required
                      </label>
                    </div>

                    {question.type === 'multiple' && (
                      <div style={{ marginTop: '8px' }}>
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input type="radio" disabled style={{ marginTop: '8px' }} />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #E0E7FF',
                                borderRadius: '6px',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                            />
                            {question.options.length > 2 && (
                              <button
                                onClick={() => removeOption(question.id, optIndex)}
                                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(question.id)}
                          style={{
                            background: 'none',
                            border: '1px dashed #E0E7FF',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            color: '#0033A0',
                            cursor: 'pointer',
                            width: '100%'
                          }}
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteQuestion(question.id)}
                    style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '8px' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {survey.questions.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#adb5bd',
                border: '2px dashed #E0E7FF',
                borderRadius: '8px'
              }}>
                No questions yet. Click "Add Question" to get started.
              </div>
            )}
          </div>

          {/* Bottom Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E0E7FF' }}>
            <button
              onClick={handleSaveDraft}
              style={{
                flex: 1, padding: '14px',
                backgroundColor: '#FFFFFF', color: '#0033A0',
                border: '2px solid #0033A0', borderRadius: '8px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              Save as Draft
            </button>
            <button
              onClick={handlePublish}
              style={{
                flex: 1, padding: '14px',
                backgroundColor: '#0033A0', color: '#FFFFFF',
                border: '2px solid #0033A0', borderRadius: '8px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              Publish Survey
            </button>
          </div>

          {showLink && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#F5F7FA', borderRadius: '8px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '8px' }}>
                Shareable Link
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={`https://rtu.edu.ph/survey/${Date.now()}`}
                  readOnly
                  style={{ flex: 1, padding: '10px 12px', border: '1px solid #E0E7FF', borderRadius: '6px', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                />
                <button
                  onClick={copyLink}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 16px',
                    backgroundColor: copied ? '#16A34A' : '#0033A0',
                    color: '#FFFFFF', border: 'none', borderRadius: '6px',
                    fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A2E', marginBottom: '20px' }}>
            Preview
          </h3>

          <div style={{ border: '3px solid #E0E7FF', borderRadius: '24px', padding: '20px', minHeight: '500px', backgroundColor: '#FFFFFF' }}>
            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid #E0E7FF', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0033A0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '16px' }}>RTU</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A2E', marginBottom: '4px' }}>
                {survey.title || 'Survey Title'}
              </h4>
              <p style={{ fontSize: '12px', color: '#6c757d' }}>
                {survey.instructions || 'Survey instructions will appear here...'}
              </p>
            </div>

            {survey.questions.length > 0 ? (
              survey.questions.map((q, idx) => (
                <div key={q.id} style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginBottom: '12px' }}>
                    {idx + 1}. {q.text || 'Question text'}
                    {q.required && <span style={{ color: '#DC2626' }}> *</span>}
                  </p>
                  
                  {q.type === 'rating' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#6c757d' }}>
                          {n}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'multiple' && (
                    <div>
                      {(q.options || []).map((opt, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#1A1A2E' }}>
                          <input type="radio" name={`q-${q.id}`} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'text' && (
                    <textarea placeholder="Type your answer here..." rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #E0E7FF', borderRadius: '6px', fontSize: '13px', resize: 'none' }} readOnly />
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#adb5bd' }}>
                <MessageSquare size={40} style={{ marginBottom: '12px' }} />
                <p>Add questions to see preview</p>
              </div>
            )}

            {survey.questions.length > 0 && (
              <button style={{ width: '100%', padding: '12px', backgroundColor: '#0033A0', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginTop: '16px' }}>
                Submit Response
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyBuilder