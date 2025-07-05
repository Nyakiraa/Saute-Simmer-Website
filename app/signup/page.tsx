"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { signUp, signInWithGoogle, signInWithFacebook } from "@/lib/supabase-auth"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.email || !formData.password || !formData.fullName) {
      alert("Please fill out all required fields.")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long.")
      setIsLoading(false)
      return
    }

    try {
      const { user } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
      })

      if (user) {
        alert("Account created successfully! Please check your email to verify your account.")
        window.location.href = "/login"
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      alert(error.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch (error: any) {
      console.error("Google signup error:", error)
      alert(error.message || "Google signup failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleFacebookSignup = async () => {
    setIsLoading(true)
    try {
      await signInWithFacebook()
    } catch (error: any) {
      console.error("Facebook signup error:", error)
      alert(error.message || "Facebook signup failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "var(--text-color)",
        padding: "20px",
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

          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", fontWeight: "300" }}>Join Our Community</h2>
            <div style={{ marginTop: "30px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <span style={{ marginRight: "10px", fontSize: "1.2rem" }}>🍽️</span>
                <span>Access Premium Meal Sets</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <span style={{ marginRight: "10px", fontSize: "1.2rem" }}>📱</span>
                <span>Track Your Orders</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <span style={{ marginRight: "10px", fontSize: "1.2rem" }}>🎉</span>
                <span>Get Special Offers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div
          style={{
            flex: 1,
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            maxHeight: "700px",
            overflowY: "auto",
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
            Create Account
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Email Address *</label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password (min. 6 characters)"
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
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
                background: isLoading ? "#ccc" : "linear-gradient(to right, var(--primary-color), var(--primary-dark))",
                color: "var(--light-text)",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                fontFamily: "Poppins, sans-serif",
                marginBottom: "20px",
              }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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

            {/* Social Signup Buttons */}
            <div style={{ marginBottom: "20px" }}>
              <button
                type="button"
                onClick={handleGoogleSignup}
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
                {isLoading ? "Please wait..." : "Sign up with Google"}
              </button>
              <button
                type="button"
                onClick={handleFacebookSignup}
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
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "12px" }}>
                  <path
                    fill="#1877F2"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                {isLoading ? "Please wait..." : "Sign up with Facebook"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <span style={{ color: "#666" }}>Already have an account? </span>
              <a
                href="/login"
                style={{
                  color: "var(--primary-color)",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Sign In
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
