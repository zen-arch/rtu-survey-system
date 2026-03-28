import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gmgcyxjcubbcutldakpq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZ2N5eGpjdWJiY3V0bGRha3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjQwODAsImV4cCI6MjA4ODQ0MDA4MH0.BzwtpuHZqDSoMCJWimF7i0VkcbqYLNEgID-Z3Q618og'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

