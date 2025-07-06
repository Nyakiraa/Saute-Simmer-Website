"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { supabase } from "@/lib/supabase-auth"

interface Order {
  id: number
  customer_name: string
  customer_email: string
  order_type: string
  meal_set_name?: string
  quantity: number
  total_amount: number
  event_type: string
  event_date: string
  delivery_address: string
  contact_person: string
  contact_number: string
  payment_method: string
  special_requests?: string
  status: string
  created_at: string
  payments?: Array<{
    amount: number
    payment_method: string
    transaction_id: string
    payment_date: string
  }>
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthAndLoadOrders = async () => {
      try {
        // Check if user is logged in
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.log("No session found, redirecting to login")
          window.location.href = "/login?redirect=/orders"
          return
        }

        setUser(session.user)

        // Check for success parameters
        const success = searchParams?.get("success")
        const orderId = searchParams?.get("orderId")

        if (success === "true" && orderId) {
          setShowSuccess(true)
          setSuccessOrderId(orderId)
        }

        // Load user's orders
        await loadOrders(session.access_token)
      } catch (error) {
        console.error("Auth check failed:", error)
        setError("Authentication failed")
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      }
    }

    checkAuthAndLoadOrders()
  }, [searchParams])

  const loadOrders = async (accessToken: string) => {
    try {
      console.log("Loading orders...")
      const response = await fetch("/api/my-orders", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Orders loaded:", data)
        setOrders(data.orders || [])
      } else {
        const errorData = await response.json()
        console.error("Failed to load orders:", errorData)
        setError(errorData.error || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      setError("Failed to load orders: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await loadOrders(session.access_token)
      }
    } catch (error) {
      console.error("Retry failed:", error)
      setError("Failed to reload orders")
      setIsLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#f39c12"
      case "confirmed":
        return "#3498db"
      case "preparing":
        return "#9b59b6"
      case "delivered":
        return "#27ae60"
      case "cancelled":
        return "#e74c3c"
      default:
        return "#95a5a6"
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

  return (
    <>
      <Header />
      <section style={{ maxWidth: "1400px", margin: "40px auto", padding: "0 5%" }}>
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px", color: "var(--primary-color)" }}>My Orders</h1>
          <p style={{ fontSize: "1.1rem", color: "#666" }}>Track and manage your catering orders</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div
            style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "30px",
              color: "#155724",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <i className="fas fa-check-circle" style={{ fontSize: "1.5rem", marginRight: "10px" }}></i>
              <h3 style={{ margin: 0, fontSize: "1.3rem" }}>Order Placed Successfully!</h3>
            </div>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              Your order {successOrderId && `#${successOrderId}`} has been submitted and is pending approval from our
              admin team. You will receive a confirmation email shortly.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "transparent",
                border: "1px solid #155724",
                borderRadius: "5px",
                color: "#155724",
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "30px",
              color: "#721c24",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Failed to load orders: {error}</div>
            <button onClick={handleTryAgain} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Orders List */}
        {!error && orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "var(--light-text)",
              borderRadius: "15px",
              boxShadow: "0 5px 15px var(--shadow-color)",
            }}
          >
            <div style={{ fontSize: "3rem", color: "#ddd", marginBottom: "20px" }}>
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#666" }}>No Orders Yet</h3>
            <p style={{ fontSize: "1rem", color: "#999", marginBottom: "30px" }}>
              You haven't placed any orders yet. Start by browsing our meal sets or creating a custom meal.
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

        {!error && orders.length > 0 && (
          <div style={{ display: "grid", gap: "20px" }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: "var(--light-text)",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 5px 15px var(--shadow-color)",
                  border: "1px solid #eee",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.3rem", marginBottom: "5px", color: "var(--primary-color)" }}>
                      Order #{order.id}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
                      Placed on {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      backgroundColor: getStatusColor(order.status),
                      color: "white",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {order.status}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <h4 style={{ fontSize: "1rem", marginBottom: "10px", color: "var(--primary-color)" }}>
                      Order Details
                    </h4>
                    <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Type:</strong> {order.order_type === "meal_set" ? "Meal Set" : "Custom Meal"}
                      </div>
                      {order.meal_set_name && (
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Meal Set:</strong> {order.meal_set_name}
                        </div>
                      )}
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Quantity:</strong> {order.quantity} persons
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Event:</strong> {order.event_type}
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Event Date:</strong> {formatDate(order.event_date)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "1rem", marginBottom: "10px", color: "var(--primary-color)" }}>
                      Contact & Payment
                    </h4>
                    <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Contact:</strong> {order.contact_person}
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Phone:</strong> {order.contact_number}
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Payment:</strong> {order.payment_method}
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Total:</strong>{" "}
                        <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--primary-color)" }}>
                          ₱{order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <h4 style={{ fontSize: "1rem", marginBottom: "8px", color: "var(--primary-color)" }}>
                    Delivery Address
                  </h4>
                  <p style={{ fontSize: "0.9rem", color: "#666", margin: 0, lineHeight: "1.5" }}>
                    {order.delivery_address}
                  </p>
                </div>

                {order.special_requests && (
                  <div style={{ marginBottom: "15px" }}>
                    <h4 style={{ fontSize: "1rem", marginBottom: "8px", color: "var(--primary-color)" }}>
                      Special Requests
                    </h4>
                    <p style={{ fontSize: "0.9rem", color: "#666", margin: 0, lineHeight: "1.5" }}>
                      {order.special_requests}
                    </p>
                  </div>
                )}

                {order.payments && order.payments.length > 0 && (
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #eee" }}>
                    <h4 style={{ fontSize: "1rem", marginBottom: "8px", color: "var(--primary-color)" }}>
                      Payment Information
                    </h4>
                    {order.payments.map((payment, index) => (
                      <div key={index} style={{ fontSize: "0.9rem", color: "#666" }}>
                        <div>Transaction ID: {payment.transaction_id}</div>
                        <div>Payment Date: {formatDateTime(payment.payment_date)}</div>
                      </div>
                    ))}
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
