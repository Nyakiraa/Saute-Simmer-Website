"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getCurrentUser, signOut } from "@/lib/supabase-auth"
import type { User } from "@supabase/supabase-js"

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)

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
      // Redirect to login page with success message
      window.location.href = "/login?message=logged-out"
    } catch (error) {
      console.error("Logout error:", error)
      alert("Failed to logout")
    }
  }

  return (
    <header className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <a href="/" className="btn btn-ghost text-xl text-red-600 font-bold">
          SAUTÉ & SIMMER
        </a>
      </div>
      <div className="flex-none">
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/meals">Meal Sets</a>
            </li>
            <li>
              <a href="/custom-meals">Custom Meals</a>
            </li>
            <li>
              <a href="/orders">My Orders</a>
            </li>
          </ul>
        </div>
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold">{user.email?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a href="/profile">Profile</a>
              </li>
              <li>
                <a href="/orders">My Orders</a>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
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
