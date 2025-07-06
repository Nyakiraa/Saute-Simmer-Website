"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { supabase } from "@/lib/supabase-auth"

interface Order {
  id: number
  customer_id: number
  customer_name: string
  total_amount: number
  status: string
  order_date: string
  delivery_date?: string
  delivery_address?: string
  special_instructions?: string
  created_at: string
  catering_service?: {
    id: number
    event_type: string
    guest_count: number
    location: string
    special_requests: string
  }
  location?: {
    id: number
    name: string
    address: string
    city: string
    state: string
    country: string
  }
  payment?: {
    id: number
    amount: number
    payment_method: string
    payment_status: string
    transaction_id: string
    payment_date?: string
  }
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  useEffect(() => {
    checkUserAndLoadOrders()

    // Check for success parameters
    const success = searchParams?.get("success")
    const orderId = searchParams?.get("orderId")

    if (success === "true" && orderId) {
      setShowSuccess(true)
      setSuccessOrderId(orderId)

      // Clear success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setSuccessOrderId(null)
        // Remove success params from URL
        const url = new URL(window.location.href)
        url.searchParams.delete("success")
        url.searchParams.delete("orderId")
        window.history.replaceState({}, "", url.toString())
      }, 5000)
    }
  }, [searchParams])

  const checkUserAndLoadOrders = async () => {
    try {
      console.log("Checking user authentication...")

      // Check if user is logged in
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession()

      if (authError) {
        console.error("Session error:", authError)
        setError("Authentication error")
        window.location.href = "/login?redirect=/orders"
        return
      }

      if (!session) {
        console.log("No session found, redirecting to login")
        window.location.href = "/login?redirect=/orders"
        return
      }

      console.log("User authenticated:", session.user.email)
      setUser(session.user)

      // Check if user is admin
      const adminEmails = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
      const userIsAdmin = adminEmails.includes(session.user.email || "")
      setIsAdmin(userIsAdmin)
      console.log("User is admin:", userIsAdmin)

      // Load orders
      await loadOrders(session.access_token)
    } catch (error) {
      console.error("Auth check failed:", error)
      setError("Authentication failed")
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    }
  }

  const loadOrders = async (token: string) => {
    try {
      console.log("Loading orders...")

      const response = await fetch("/api/my-orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Orders API error:", errorData)
        setError(errorData.error || "Failed to load orders")
        return
      }

      const data = await response.json()
      console.log("Orders loaded successfully:", data.orders?.length || 0)
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Error loading orders:", error)
      setError("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#f39c12"
      case "confirmed":
        return "#3498db"
      case "preparing":
        return "#9b59b6"
      case "ready":
        return "#2ecc71"
      case "delivered":
        return "#27ae60"
      case "cancelled":
        return "#e74c3c"
      default:
        return "#95a5a6"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#f39c12"
      case "paid":
        return "#2ecc71"
      case "failed":
        return "#e74c3c"
      case "refunded":
        return "#9b59b6"
      default:
        return "#95a5a6"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "20px" }}>Loading your orders...</div>
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
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <section style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 5%" }}>
        {/* Success Message */}
        {showSuccess && (
          <div
            style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "15px",
              padding: "20px",
              marginBottom: "30px",
              color: "#155724",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#155724" }}>
              <i className="fas fa-check-circle" style={{ marginRight: "10px" }}></i>
              Order Placed Successfully!
            </h3>
            <p style={{ margin: "0", fontSize: "1.1rem" }}>
              Your order #{successOrderId} has been received and is being processed.
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.5rem", color: "var(--primary-color)", margin: 0 }}>
            {isAdmin ? "All Orders" : "My Orders"}
          </h1>
          {isAdmin && (
            <div
              style={{
                backgroundColor: "var(--secondary-color)",
                padding: "10px 20px",
                borderRadius: "25px",
                color: "var(--primary-color)",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-crown" style={{ marginRight: "8px" }}></i>
              Admin View
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "var(--light-text)",
              borderRadius: "15px",
              boxShadow: "0 10px 20px var(--shadow-color)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "20px", color: "#ddd" }}>
              <i className="fas fa-clipboard-list"></i>
            </div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "15px", color: "var(--primary-color)" }}>
              {isAdmin ? "No orders found" : "No orders yet"}
            </h2>
            <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "30px" }}>
              {isAdmin
                ? "There are currently no orders in the system."
                : "You haven't placed any orders yet. Start by exploring our meal options!"}
            </p>
            {!isAdmin && (
              <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => (window.location.href = "/meals")}
                  className="btn btn-primary"
                  style={{ padding: "12px 30px" }}
                >
                  Browse Meal Sets
                </button>
                <button
                  onClick={() => (window.location.href = "/custom-meals")}
                  className="btn btn-secondary"
                  style={{ padding: "12px 30px" }}
                >
                  Create Custom Meal
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "25px" }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: "var(--light-text)",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 10px 20px var(--shadow-color)",
                  border: "1px solid #f0f0f0",
                }}
              >
                {/* Order Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.4rem", color: "var(--primary-color)", margin: "0 0 5px 0" }}>
                      Order #{order.id}
                    </h3>
                    <p style={{ margin: "0", color: "#666", fontSize: "0.95rem" }}>
                      Placed on {formatDateTime(order.created_at)}
                    </p>
                    {isAdmin && (
                      <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                        Customer: {order.customer_name}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        backgroundColor: getStatusColor(order.status),
                        color: "white",
                        padding: "6px 15px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status}
                    </span>
                    {order.payment && (
                      <span
                        style={{
                          backgroundColor: getPaymentStatusColor(order.payment.payment_status),
                          color: "white",
                          padding: "6px 15px",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {order.payment.payment_status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Event Information */}
                  {order.catering_service && (
                    <div>
                      <h4 style={{ fontSize: "1.1rem", color: "var(--primary-color)", marginBottom: "10px" }}>
                        Event Details
                      </h4>
                      <div style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Type:</strong> {order.catering_service.event_type}
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Guests:</strong> {order.catering_service.guest_count} persons
                        </div>
                        {order.delivery_date && (
                          <div style={{ marginBottom: "5px" }}>
                            <strong>Event Date:</strong> {formatDate(order.delivery_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery Information */}
                  <div>
                    <h4 style={{ fontSize: "1.1rem", color: "var(--primary-color)", marginBottom: "10px" }}>
                      Delivery Information
                    </h4>
                    <div style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                      {order.delivery_address && (
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Address:</strong> {order.delivery_address}
                        </div>
                      )}
                      {order.location && (
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Location:</strong> {order.location.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  {order.payment && (
                    <div>
                      <h4 style={{ fontSize: "1.1rem", color: "var(--primary-color)", marginBottom: "10px" }}>
                        Payment Details
                      </h4>
                      <div style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Amount:</strong> ₱{order.payment.amount.toFixed(2)}
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Method:</strong> {order.payment.payment_method}
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Transaction ID:</strong> {order.payment.transaction_id}
                        </div>
                        {order.payment.payment_date && (
                          <div style={{ marginBottom: "5px" }}>
                            <strong>Paid on:</strong> {formatDateTime(order.payment.payment_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                {(order.special_instructions || order.catering_service?.special_requests) && (
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "15px",
                      borderRadius: "10px",
                      marginTop: "15px",
                    }}
                  >
                    <h4 style={{ fontSize: "1rem", color: "var(--primary-color)", marginBottom: "8px" }}>
                      Special Requests
                    </h4>
                    <p style={{ margin: "0", fontSize: "0.9rem", lineHeight: "1.5", color: "#555" }}>
                      {order.special_instructions || order.catering_service?.special_requests}
                    </p>
                  </div>
                )}

                {/* Order Total */}
                <div
                  style={{
                    borderTop: "2px solid #eee",
                    paddingTop: "15px",
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--primary-color)" }}>
                    Total Amount: ₱{order.total_amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>Order ID: {order.id}</div>
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                        onClick={() => {
                          console.log("Update order status for order:", order.id)
                        }}
                      >
                        Update Status
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                        onClick={() => {
                          console.log("View order details for order:", order.id)
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}
