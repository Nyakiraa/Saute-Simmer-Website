"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/supabase-auth"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-auth"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          setUser(null)
          return
        }

        setUser(session?.user || null)
      } catch (error) {
        console.error("User check failed:", error)
        setUser(null)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
      setIsDropdownOpen(false)
      window.location.href = "/login?message=logout-success"
    } catch (error) {
      console.error("Logout error:", error)
      alert("Failed to logout")
    }
  }

  return (
    <header>
      <div className="header-container">
        <div className="nav-container">
          <Link href="/">
            <Image src="/images/redlogo.png" alt="Saute and Simmer Logo" width={120} height={50} className="logo" />
          </Link>
          <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <li>
              <Link href="/" className={isActive("/") ? "active" : ""} onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/meals" className={isActive("/meals") ? "active" : ""} onClick={() => setIsMenuOpen(false)}>
                Meal Sets
              </Link>
            </li>
            <li>
              <Link
                href="/custom-meals"
                className={isActive("/custom-meals") ? "active" : ""} 
                onClick={() => setIsMenuOpen(false)}
              >
                Custom Meals
              </Link>
            </li>
            <li>
              <Link href="/orders" className={isActive("/orders") ? "active" : ""} onClick={() => setIsMenuOpen(false)}>
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        <div className="profile-dropdown">
          <div
            className="profile-icon"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            {user ? (
              <>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginRight: "8px",
                  }}
                >
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: "14px" }}>{user.email?.split("@")[0]}</span>
              </>
            ) : (
             <>
  
    <i className="fas fa-user" style={{ fontSize: "16px" }}></i>
  
</>
            )}
          </div>

          {isDropdownOpen && (
            <div className="dropdown-content" style={{ display: "block" }}>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsDropdownOpen(false)}>
                    <i className="fas fa-user" style={{ marginRight: "8px" }}></i>
                    Profile
                  </Link>
                  <Link href="/orders" onClick={() => setIsDropdownOpen(false)}>
                    <i className="fas fa-shopping-bag" style={{ marginRight: "8px" }}></i>
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "8px 16px",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "inherit",
                      fontSize: "inherit",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i className="fas fa-sign-out-alt" style={{ marginRight: "8px" }}></i>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsDropdownOpen(false)}>
                    <i className="fas fa-sign-in-alt" style={{ marginRight: "8px" }}></i>
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setIsDropdownOpen(false)}>
                    <i className="fas fa-user-plus" style={{ marginRight: "8px" }}></i>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
