
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { getAllResponses } from './fetchResponses'

export function useRealtimeResponses() {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    const data = await getAllResponses()
    setResponses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Listen for responseDeleted event
  useEffect(() => {
    window.addEventListener('responseDeleted', fetchData)
    return () => window.removeEventListener('responseDeleted', fetchData)
  }, [])

  // Real-time Supabase subscription
  useEffect(() => {
    if (!supabase) return

    const subscription = supabase
      .channel('survey_responses_global')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'survey_responses' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setResponses(prev => prev.filter(r => r.id !== payload.old.id))
            showNotification('🗑️ A response was deleted')
          }
          if (payload.eventType === 'INSERT') {
            setResponses(prev => [payload.new, ...prev])
            showNotification('✅ New response submitted!')
          }
          if (payload.eventType === 'UPDATE') {
            setResponses(prev =>
              prev.map(r => r.id === payload.new.id ? payload.new : r)
            )
            showNotification('✏️ A response was updated')
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [])

  return { 
    responses, 
    setResponses, 
    loading, 
    fetchData, 
    showToast, 
    toastMessage 
  }
}


