import { supabase } from './supabaseClient'

export async function getAllResponses() {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching responses:', error)
    return []
  }
  return data
}

