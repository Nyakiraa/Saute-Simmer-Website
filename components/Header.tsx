"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getCurrentUser, signOut } from "@/lib/supabase-auth"

const Header: React.FC = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
      // Show success message and redirect to login
      alert("You have been successfully logged out.")
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      alert("Failed to logout")
    }
  }

  return (
    <header className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">daisyUI</a>
      </div>
      <div className="flex-none">
        {user ? (
          <div className="dropdown">
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        ) : (
          <a href="/login" className="btn btn-primary">
            Login
          </a>
        )}
      </div>
    </header>
  )
}

export default Header
