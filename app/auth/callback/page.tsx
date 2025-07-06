"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase, checkCustomerExists, createCustomerFromOAuth } from "@/lib/supabase-auth"

export default function AuthCallback() {
  const [isLoading, setIsLoading] = useState(true)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  })

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          window.location.href = "/login?error=auth_failed"
          return
        }

        if (data.session) {
          const user = data.session.user
          setUser(user)

          // Check if customer exists in our custom table
          const customerExists = await checkCustomerExists(user.email || "")

          if (!customerExists) {
            // New OAuth user needs to complete profile
            setNeedsProfile(true)
            setIsLoading(false)
            return
          }

          // Customer exists, proceed with redirect
          redirectUser(user)
        } else {
          window.location.href = "/login"
        }
      } catch (error) {
        console.error("Auth callback failed:", error)
        window.location.href = "/login?error=callback_failed"
      }
    }

    handleAuthCallback()
  }, [])

  const redirectUser = (user: any) => {
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get("redirect")

    // Check if user is admin
    const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]

    if (allowedAdmins.includes(user.email || "")) {
      window.location.href = redirect || "/admin"
    } else {
      const safeRedirect = redirect && !redirect.includes("/admin") ? redirect : "/"
      window.location.href = safeRedirect
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createCustomerFromOAuth(user, formData)
      redirectUser(user)
    } catch (error) {
      console.error("Profile completion failed:", error)
      alert("Failed to complete profile. Please try again.")
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (needsProfile) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "15px",
            padding: "40px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{ color: "#d32f2f", marginBottom: "10px" }}>Complete Your Profile</h2>
            <p style={{ color: "#666" }}>
              Welcome! Please provide your contact information to complete your registration.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Full Name</label>
              <input
                type="text"
                value={user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || ""}
                disabled
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "#f9f9f9",
                  color: "#666",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "#f9f9f9",
                  color: "#666",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                }}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                required
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px",
                background: isLoading ? "#ccc" : "linear-gradient(to right, #d32f2f, #b71c1c)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {isLoading ? "Completing Profile..." : "Complete Registration"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #d32f2f",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }}
        ></div>
        <h2 style={{ color: "#d32f2f", marginBottom: "10px" }}>Completing Sign In...</h2>
        <p style={{ color: "#666" }}>Please wait while we redirect you.</p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
