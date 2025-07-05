"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/supabase-auth"

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()

        if (!user) {
          // No user logged in, redirect to login
          window.location.href = "/login?redirect=/admin"
          return
        }

        // Check if user email is in allowed admins list
        if (allowedAdmins.includes(user.email || "")) {
          setIsAuthorized(true)
        } else {
          // User is logged in but not an admin
          alert("Access denied. Admin privileges required.")
          window.location.href = "/"
          return
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        window.location.href = "/login?redirect=/admin"
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "#f5f5f5",
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
          <h2 style={{ color: "#d32f2f", marginBottom: "10px" }}>Verifying Access...</h2>
          <p style={{ color: "#666" }}>Please wait while we check your permissions.</p>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "40px" }}>
          <div style={{ fontSize: "4rem", color: "#d32f2f", marginBottom: "20px" }}>🚫</div>
          <h2 style={{ color: "#d32f2f", marginBottom: "15px" }}>Access Denied</h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            You don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
