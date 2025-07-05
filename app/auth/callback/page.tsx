"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase-auth"

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          // Redirect to login with error
          window.location.href = "/login?error=auth_failed"
          return
        }

        if (data.session) {
          // Get redirect parameter from URL if it exists
          const urlParams = new URLSearchParams(window.location.search)
          const redirect = urlParams.get("redirect")

          // Check if user is admin based on email
          const userEmail = data.session.user.email
          const allowedAdmins = [
            "ecbathan@gbox.adnu.edu.ph",
            "rabad@gbox.adnu.edu.ph",
            "charnepomuceno@gbox.adnu.edu.ph",
          ]

          if (allowedAdmins.includes(userEmail || "")) {
            // Redirect to admin dashboard or specified redirect
            window.location.href = redirect || "/admin"
          } else {
            // Redirect to customer homepage or specified redirect (but not admin)
            const safeRedirect = redirect && !redirect.includes("/admin") ? redirect : "/"
            window.location.href = safeRedirect
          }
        } else {
          // No session, redirect to login
          window.location.href = "/login"
        }
      } catch (error) {
        console.error("Auth callback failed:", error)
        window.location.href = "/login?error=callback_failed"
      }
    }

    handleAuthCallback()
  }, [])

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
