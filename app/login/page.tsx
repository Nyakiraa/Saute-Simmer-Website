"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { signInWithGoogle, signInWithFacebook, signInWithEmail } from "@/lib/supabase-auth"
import { supabase } from "@/lib/supabase-auth"

export default function LoginPage() {
  const [isCustomer, setIsCustomer] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminEmail: "",
    adminPassword: "",
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session check error:", error)
          return
        }

        if (session?.user) {
          // Get redirect parameter from URL
          const urlParams = new URLSearchParams(window.location.search)
          const redirect = urlParams.get("redirect")

          // User is already logged in, redirect appropriately
          const allowedAdminEmails = [
            "ecbathan@gbox.adnu.edu.ph",
            "rabad@gbox.adnu.edu.ph",
            "charnepomuceno@gbox.adnu.edu.ph",
          ]
          if (allowedAdminEmails.includes(session.user.email || "")) {
            window.location.href = redirect || "/admin"
          } else {
            window.location.href = redirect || "/"
          }
        }
      } catch (error) {
        console.error("User check failed:", error)
      }
    }
    checkUser()
  }, [])

  // Show logout success message
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get("message")

    if (message === "logout-success") {
      // Show success message
      const successDiv = document.createElement("div")
      successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-family: Poppins, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `
      successDiv.textContent = "Successfully logged out!"
      document.body.appendChild(successDiv)

      // Remove message after 3 seconds
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv)
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }, 3000)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.email || !formData.password) {
      alert("Please fill out all required fields.")
      setIsLoading(false)
      return
    }

    try {
      const { user } = await signInWithEmail(formData.email, formData.password)
      if (user) {
        // Get redirect parameter from URL
        const urlParams = new URLSearchParams(window.location.search)
        const redirect = urlParams.get("redirect")

        // Check if this user is an admin
        const allowedAdminEmails = [
          "ecbathan@gbox.adnu.edu.ph",
          "rabad@gbox.adnu.edu.ph",
          "charnepomuceno@gbox.adnu.edu.ph",
        ]
        if (allowedAdminEmails.includes(user.email || "")) {
          window.location.href = redirect || "/admin"
        } else {
          window.location.href = redirect || "/"
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      alert(error.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.adminEmail || !formData.adminPassword) {
      alert("Please fill out all required fields.")
      setIsLoading(false)
      return
    }

    try {
      const { user } = await signInWithEmail(formData.adminEmail, formData.adminPassword)
      if (user) {
        // Get redirect parameter from URL
        const urlParams = new URLSearchParams(window.location.search)
        const redirect = urlParams.get("redirect")

        // Check if this user is an admin
        const allowedAdminEmails = [
          "ecbathan@gbox.adnu.edu.ph",
          "rabad@gbox.adnu.edu.ph",
          "charnepomuceno@gbox.adnu.edu.ph",
        ]

        if (allowedAdminEmails.includes(user.email || "")) {
          window.location.href = redirect || "/admin"
        } else {
          alert("Access denied. Admin privileges required.")
        }
      }
    } catch (error: any) {
      console.error("Admin login error:", error)
      alert("Invalid admin credentials. Please check your email and password.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      // The redirect will be handled by the OAuth flow
    } catch (error: any) {
      console.error("Google login error:", error)
      alert(error.message || "Google login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithFacebook()
      // The redirect will be handled by the OAuth flow
    } catch (error: any) {
      console.error("Facebook login error:", error)
      alert(error.message || "Facebook login failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "var(--text-color)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 15px 35px var(--shadow-color)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            flex: 1,
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
            color: "var(--light-text)",
          }}
        >
          <Image
            src="/images/logo.png"
            alt="Saute and Simmer Logo"
            width={220}
            height={90}
            style={{ marginBottom: "30px", filter: "drop-shadow(0 5px 10px rgba(0, 0, 0, 0.2))" }}
          />

          {isCustomer ? (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", fontWeight: "300" }}>
                Filipino Catering at Your Service
              </h2>
              <div style={{ marginTop: "30px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <span style={{ marginRight: "10px", fontSize: "1.2rem" }}>✓</span>
                  <span>Browse Fixed Meal Sets</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <span style={{ marginRight: "10px", fontSize: "1.2rem" }}>✓</span>
                  <span>Create Custom Meals</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <span style={{ marginRight: "10px", fontSize: "1.2rem" }}>✓</span>
                  <span>Track Your Orders</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", fontWeight: "300" }}>Admin Management System</h2>
              <div style={{ marginTop: "30px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <i className="fas fa-box" style={{ marginRight: "10px", fontSize: "1.2rem" }}></i>
                  <span>Manage Inventory</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <i className="fas fa-utensils" style={{ marginRight: "10px", fontSize: "1.2rem" }}></i>
                  <span>Create Meal Sets</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <i className="fas fa-concierge-bell" style={{ marginRight: "10px", fontSize: "1.2rem" }}></i>
                  <span>Manage Catering Services</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <i className="fas fa-clipboard-list" style={{ marginRight: "10px", fontSize: "1.2rem" }}></i>
                  <span>Process Orders</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div
          style={{
            flex: 1,
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflow: "hidden",
            maxHeight: "600px",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              marginBottom: "30px",
              color: "var(--primary-color)",
              fontWeight: "600",
            }}
          >
            {isCustomer ? "Welcome Back!" : "Admin Login"}
          </h1>

          {/* Toggle Container */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#f5f5f5",
              borderRadius: "50px",
              marginBottom: "20px",
              position: "relative",
              overflow: "hidden",
              minHeight: "50px",
            }}
          >
            <div
              onClick={() => setIsCustomer(true)}
              style={{
                flex: 1,
                padding: "12px 20px",
                textAlign: "center",
                cursor: "pointer",
                position: "relative",
                zIndex: 1,
                transition: "color 0.3s ease",
                color: isCustomer ? "var(--light-text)" : "inherit",
              }}
            >
              Customer
            </div>
            <div
              onClick={() => setIsCustomer(false)}
              style={{
                flex: 1,
                padding: "12px 20px",
                textAlign: "center",
                cursor: "pointer",
                position: "relative",
                zIndex: 1,
                transition: "color 0.3s ease",
                color: !isCustomer ? "var(--light-text)" : "inherit",
              }}
            >
              Admin
            </div>
            <div
              style={{
                position: "absolute",
                height: "100%",
                width: "50%",
                background: "linear-gradient(to right, var(--primary-color), var(--primary-dark))",
                borderRadius: "50px",
                transition: "transform 0.3s ease",
                transform: isCustomer ? "translateX(0)" : "translateX(100%)",
              }}
            ></div>
          </div>

          {/* Customer Form */}
          {isCustomer && (
            <div style={{ flexGrow: 1, overflowY: "auto", maxHeight: "380px" }}>
              <form onSubmit={handleCustomerSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      fontFamily: "Poppins, sans-serif",
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      fontFamily: "Poppins, sans-serif",
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: isLoading
                      ? "#ccc"
                      : "linear-gradient(to right, var(--primary-color), var(--primary-dark))",
                    color: "var(--light-text)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>

                {/* Divider */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "20px 0",
                  }}
                >
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
                  <span style={{ padding: "0 15px", color: "#666", fontSize: "0.9rem" }}>or</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
                </div>

                {/* Social Login Buttons */}
                <div style={{ marginBottom: "20px" }}>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: isLoading ? "#f5f5f5" : "white",
                      color: "#333",
                      border: "1px solid #dadce0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "500",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                      fontFamily: "Poppins, sans-serif",
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isLoading ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
                        e.currentTarget.style.borderColor = "#bbb"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.boxShadow = "none"
                        e.currentTarget.style.borderColor = "#dadce0"
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "12px" }}>
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {isLoading ? "Please wait..." : "Continue with Google"}
                  </button>
                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: isLoading ? "#f5f5f5" : "white",
                      color: "#333",
                      border: "1px solid #dadce0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "500",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                      fontFamily: "Poppins, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isLoading ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
                        e.currentTarget.style.borderColor = "#bbb"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.boxShadow = "none"
                        e.currentTarget.style.borderColor = "#dadce0"
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "12px" }}>
                      <path
                        fill="#1877F2"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                    {isLoading ? "Please wait..." : "Continue with Facebook"}
                  </button>
                </div>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <span style={{ color: "#666" }}>Don't have an account? </span>
                  <a
                    href="/signup"
                    style={{
                      color: "var(--primary-color)",
                      textDecoration: "none",
                      fontWeight: "500",
                    }}
                  >
                    Create Account
                  </a>
                </div>
              </form>
            </div>
          )}

          {/* Admin Form */}
          {!isCustomer && (
            <form onSubmit={handleAdminSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Admin Email</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  placeholder="Enter admin email"
                  required
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    fontFamily: "Poppins, sans-serif",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Password</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    fontFamily: "Poppins, sans-serif",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: isLoading
                    ? "#ccc"
                    : "linear-gradient(to right, var(--primary-color), var(--primary-dark))",
                  color: "var(--light-text)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {isLoading ? "Signing In..." : "Admin Sign In"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
