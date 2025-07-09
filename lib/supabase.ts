import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const createServerClient = (supabaseServiceKey: string) => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Client-side browser client
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Database helper functions
export const getCustomers = async () => {
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching customers:", error)
    return []
  }

  return data || []
}

export const getItems = async () => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching items:", error)
    return []
  }

  return data || []
}

export const getMealSets = async () => {
  const { data, error } = await supabase
    .from("meal_sets")
    .select("*")
    .order("type", { ascending: false })
    .order("price", { ascending: true })

  if (error) {
    console.error("Error fetching meal sets:", error)
    return []
  }

  return data || []
}

export const getCateringServices = async () => {
  const { data, error } = await supabase.from("catering_services").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching catering services:", error)
    return []
  }

  return data || []
}

export const getLocations = async () => {
  const { data, error } = await supabase.from("locations").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching locations:", error)
    return []
  }

  return data || []
}

export const getOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data || []
}

export const getPayments = async () => {
  const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
    return []
  }

  return data || []
}
