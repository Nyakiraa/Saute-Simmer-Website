import { createClient } from "@supabase/supabase-js"

// For client-side usage: hardcoded or environment variables (usually environment variables are better)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://arnbjoduiznhdffauyod.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmJqb2R1aXpuaGRmZmF1eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDcwNjksImV4cCI6MjA2NzEyMzA2OX0.2oQaSKDI8Wz24gNwMlUjlff1ep8fdIChEY2qzehMtL0"

// Export the client for frontend (anonymous key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a server-side client, using service role key for elevated permissions
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  return createClient(url, serviceRoleKey)
}
