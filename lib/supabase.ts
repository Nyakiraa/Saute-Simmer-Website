// lib/supabase.ts

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "./config";

// Client for browser-side usage
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Server-side client for API routes
export const createServerClient = () => {
  // Use service role key if available, otherwise use anon key
  const key = SUPABASE_CONFIG.serviceRoleKey || SUPABASE_CONFIG.anonKey;
  return createClient(SUPABASE_CONFIG.url, key);
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    SUPABASE_CONFIG.url !== "https://arnbjoduiznhdffauyod.supabase.co" &&
    SUPABASE_CONFIG.anonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmJqb2R1aXpuaGRmZmF1eW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDcwNjksImV4cCI6MjA2NzEyMzA2OX0.2oQaSKDI8Wz24gNwMlUjlff1ep8fdIChEY2qzehMtL0"
  );
};
