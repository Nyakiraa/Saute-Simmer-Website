"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { supabase } from "@/lib/supabase-auth"
import type { User } from "@supabase/supabase-js"

interface CateringService {
  id: number
  customer_id: number
  customer_name: string
  event_type: string
  event_date: string
  guest_count: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  location: string
  special_requests?: string
  created_at?: string
}

const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [cateringServices, setCateringServices] = useState<CateringService[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  useEffect(() => {
    checkUserAndLoadOrders()

    // Check for success parameters
    const success = searchParams?.get("success")
    const orderId = searchParams?.get("orderId")

    if (success === "true") {
      setOrderSuccess(true)
      setSuccessOrderId(orderId)
    }
  }, [searchParams])

  const checkUserAndLoadOrders = async () => {
    try {
      setError(null)
      console.log("Checking user authentication...")

      // Check if user is logged in
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setError("Authentication error")
        setTimeout(() => {
          window.location.href = "/login?redirect=/orders"
        }, 2000)
        return
      }

      if (!session) {
        console.log("No session found, redirecting to login")
        setTimeout(() => {
          window.location.href = "/login?redirect=/orders"
        }, 1000)
        return
      }

      console.log("User authenticated:", session.user.email)
      setUser(session.user)
      await loadUserOrders(session.access_token)
    } catch (error) {
      console.error("Auth check failed:", error)
      setError("Failed to authenticate user")
      setTimeout(() => {
        window.location.href = "/login?redirect=/orders"
      }, 2000)
    }
  }

  const loadUserOrders = async (accessToken: string) => {
    try {
      console.log("Loading user orders...")
      setError(null)

      const response = await fetch("/api/my-orders", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log("Orders API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Orders data received:", data)

        setCateringServices(data.orders || [])
        setIsAdmin(data.isAdmin || false)

        if (data.orders?.length === 0) {
          console.log("No orders found for user")
        }
      } else if (response.status === 401) {
        console.log("Session expired, redirecting to login")
        setTimeout(() => {
          window.location.href = "/login?redirect=/orders"
        }, 1000)
      } else {
        const errorData = await response.json()
        console.error("Failed to load orders:", errorData)
        setError(errorData.error || "Failed to load orders")
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      setError("Failed to fetch orders. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const retryLoadOrders = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        await loadUserOrders(session.access_token)
      }
    } catch (error) {
      console.error("Retry failed:", error)
      setError("Retry failed")
      setIsLoading(false)
    }
  }

  if (orderSuccess) {
    return (
      <>
        <Header />
        <section
          style={{
            textAlign: "center",
            padding: "50px 20px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: "5rem",
              color: "var(--success-color)",
              marginBottom: "20px",
            }}
          >
            <i className="fas fa-check-circle"></i>
          </div>
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "15px",
              color: "var(--success-color)",
            }}
          >
            Order Placed Successfully!
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: "30px",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Thank you for your order. Your catering request has been submitted and is pending approval from our admin
            team. You will receive a confirmation email shortly.
          </p>
          {successOrderId && (
            <div
              style={{
                backgroundColor: "#f9f9f9",
                maxWidth: "500px",
                margin: "0 auto 30px",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", marginBottom: "10px" }}>
                <div style={{ width: "150px", fontWeight: "500" }}>Order ID:</div>
                <div style={{ flex: 1 }}>{successOrderId}</div>
              </div>
              <div style={{ display: "flex", marginBottom: "10px" }}>
                <div style={{ width: "150px", fontWeight: "500" }}>Order Date:</div>
                <div style={{ flex: 1 }}>
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          )}
          <div style={{ marginTop: "30px" }}>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline"
              style={{ marginRight: "10px" }}
            >
              View All Orders
            </button>
            <button onClick={() => (window.location.href = "/")} className="btn btn-primary">
              Back to Home
            </button>
          </div>
        </section>
        <Footer />
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "20px" }}>Loading orders...</div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "20px", color: "var(--danger-color)" }}>{error}</div>
          <button onClick={retryLoadOrders} className="btn btn-primary">
            Try Again
          </button>
          <div style={{ marginTop: "20px" }}>
            <a
              href="/api/debug-orders"
              target="_blank"
              style={{ color: "var(--primary-color)", textDecoration: "underline" }}
              rel="noreferrer"
            >
              View Debug Info
            </a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      {/* Order History Section */}
      <section style={{ maxWidth: "1400px", margin: "40px auto", padding: "0 5%" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            marginBottom: "10px",
            color: "var(--primary-color)",
            textAlign: "center",
          }}
        >
          {isAdmin ? "All Catering Services & Orders" : "My Orders"}
        </h2>
        {isAdmin && (
          <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
            Admin View - Showing all customer orders
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
          <button onClick={() => (window.location.href = "/meals")} className="btn btn-primary">
            Place New Order
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "30px",
          }}
        >
          {cateringServices.length > 0 ? (
            cateringServices.map((service) => (
              <div
                key={service.id}
                style={{
                  backgroundColor: "var(--light-text)",
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 10px 20px var(--shadow-color)",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={() => alert(`Service details for ${service.customer_name} will be shown here.`)}
              >
                <div
                  style={{
                    padding: "20px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: "600", color: "var(--primary-color)" }}>#{service.id}</div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    {new Date(service.event_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", marginBottom: "8px" }}>
                      <div style={{ width: "120px", fontWeight: "500", fontSize: "0.9rem" }}>Customer:</div>
                      <div style={{ flex: 1, fontSize: "0.9rem" }}>{service.customer_name}</div>
                    </div>
                    <div style={{ display: "flex", marginBottom: "8px" }}>
                      <div style={{ width: "120px", fontWeight: "500", fontSize: "0.9rem" }}>Event Type:</div>
                      <div style={{ flex: 1, fontSize: "0.9rem" }}>{service.event_type}</div>
                    </div>
                    <div style={{ display: "flex", marginBottom: "8px" }}>
                      <div style={{ width: "120px", fontWeight: "500", fontSize: "0.9rem" }}>Event Date:</div>
                      <div style={{ flex: 1, fontSize: "0.9rem" }}>
                        {new Date(service.event_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div style={{ display: "flex", marginBottom: "8px" }}>
                      <div style={{ width: "120px", fontWeight: "500", fontSize: "0.9rem" }}>Guests:</div>
                      <div style={{ flex: 1, fontSize: "0.9rem" }}>{service.guest_count} persons</div>
                    </div>
                    <div style={{ display: "flex", marginBottom: "8px" }}>
                      <div style={{ width: "120px", fontWeight: "500", fontSize: "0.9rem" }}>Location:</div>
                      <div style={{ flex: 1, fontSize: "0.9rem" }}>{service.location}</div>
                    </div>
                    {service.special_requests && (
                      <div style={{ display: "flex", marginBottom: "8px" }}>
                        <div style={{ width: "120px", fontWeight: "500", fontSize: "0.9rem" }}>Special Requests:</div>
                        <div style={{ flex: 1, fontSize: "0.9rem" }}>{service.special_requests}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: "15px 20px",
                    backgroundColor: "#f9f9f9",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      padding: "5px 15px",
                      borderRadius: "50px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      backgroundColor:
                        service.status === "confirmed"
                          ? "var(--success-color)"
                          : service.status === "pending"
                            ? "var(--warning-color)"
                            : service.status === "completed"
                              ? "#2196f3"
                              : "var(--danger-color)",
                      color: "var(--light-text)",
                    }}
                  >
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "50px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "5rem",
                  color: "#ddd",
                  marginBottom: "20px",
                }}
              >
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "15px",
                  color: "#666",
                }}
              >
                {isAdmin ? "No Orders in System" : "No Orders Yet"}
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  marginBottom: "30px",
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  color: "#888",
                }}
              >
                {isAdmin
                  ? "No customers have placed any orders yet."
                  : "You haven't placed any orders yet. Browse our meal sets or create a custom meal to get started."}
              </p>
              <div>
                <button
                  onClick={() => (window.location.href = "/meals")}
                  className="btn btn-primary"
                  style={{ marginRight: "10px" }}
                >
                  Browse Meal Sets
                </button>
                <button onClick={() => (window.location.href = "/custom-meals")} className="btn btn-outline">
                  Create Custom Meal
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
