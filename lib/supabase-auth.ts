import { createClient } from "@supabase/supabase-js"
import { SUPABASE_CONFIG } from "./config"

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

// Auth helper functions
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("Google login error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Google login failed:", error)
    throw error
  }
}

export const signInWithFacebook = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("Facebook login error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Facebook login failed:", error)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    // First check if customer exists in our custom table
    const customerExists = await checkCustomerExists(email)

    if (!customerExists) {
      throw new Error("Account not found. Please sign up first.")
    }

    // Use Supabase auth for password verification
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Email login error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Email login failed:", error)
    throw error
  }
}

export const signUp = async (email: string, password: string, userData?: any) => {
  try {
    // First create the Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (authError) {
      console.error("Auth sign up error:", authError)
      throw authError
    }

    // Then create customer record in our custom table
    if (authData.user) {
      const customerData = {
        name: userData?.full_name || "",
        email: email,
        phone: userData?.phone || "",
        address: userData?.address || "",
      }

      const customerResponse = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      if (!customerResponse.ok) {
        console.error("Failed to create customer record")
        // Don't throw error here as auth user is already created
      }
    }

    return authData
  } catch (error) {
    console.error("Sign up failed:", error)
    throw error
  }
}

export const createCustomerFromOAuth = async (user: any, additionalData: { phone: string; address: string }) => {
  try {
    const customerData = {
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
      email: user.email,
      phone: additionalData.phone,
      address: additionalData.address,
    }

    console.log("Creating customer with data:", customerData)

    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to create customer record:", errorText)
      throw new Error("Failed to create customer record")
    }

    const result = await response.json()
    console.log("Customer created successfully:", result)
    return result
  } catch (error) {
    console.error("Failed to create customer from OAuth:", error)
    throw error
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      throw error
    }
  } catch (error) {
    console.error("Sign out failed:", error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return null
    }

    if (!session) {
      return null
    }

    return session.user
  } catch (error) {
    console.error("Get user failed:", error)
    return null
  }
}

export const getAuthState = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Auth state error:", error)
      return { user: null, session: null, error }
    }

    return { user: session?.user || null, session, error: null }
  } catch (error) {
    console.error("Auth state check failed:", error)
    return { user: null, session: null, error }
  }
}

export const checkCustomerExists = async (email: string): Promise<boolean> => {
  try {
    console.log("Checking if customer exists for email:", email)

    const response = await fetch("/api/customers/by-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const exists = response.ok
    console.log("Customer exists:", exists)
    return exists
  } catch (error) {
    console.error("Error checking customer:", error)
    return false
  }
}
