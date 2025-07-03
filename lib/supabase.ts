import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://arnbjoduiznhdffauyod.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmJqb2R1aXpuaGRmZmF1eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDcwNjksImV4cCI6MjA2NzEyMzA2OX0.2oQaSKDI8Wz24gNwMlUjlff1ep8fdIChEY2qzehMtL0"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
