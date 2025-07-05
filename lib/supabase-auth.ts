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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Sign up failed:", error)
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
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Get user failed:", error)
    return null
  }
}
