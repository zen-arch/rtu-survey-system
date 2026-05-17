import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useOffices() {
  const [offices, setOffices] = useState([])
  const [loadingOffices, setLoadingOffices] = useState(true)

  useEffect(() => {
    const fetchOffices = async () => {
      setLoadingOffices(true)
      const { data, error } = await supabase
        .from('offices')
        .select('office_id, office_name')
        .order('office_name', { ascending: true })

      if (!error && data) setOffices(data)
      setLoadingOffices(false)
    }

    fetchOffices()
  }, [])

  return { offices, loadingOffices }
}

