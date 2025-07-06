"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
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
    id: number
    amount: number
    payment_method: string
    transaction_id?: string
    payment_date?: string
    status: string
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
    checkAuthAndLoadOrders()

    // Check for success parameters
    const success = searchParams?.get("success")
    const orderId = searchParams?.get("orderId")

    if (success === "true") {
      setShowSuccess(true)
      setSuccessOrderId(orderId)
    }
  }, [searchParams])

  const checkAuthAndLoadOrders = async () => {
    try {
      console.log("Checking authentication...")

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setError("Authentication failed")
        return
      }

      if (!session) {
        console.log("No session found, redirecting to login")
        window.location.href = "/login?redirect=/orders"
        return
      }

      console.log("User authenticated:", session.user.email)
      setUser(session.user)

      await loadOrders(session.access_token)
    } catch (error) {
      console.error("Auth check failed:", error)
      setError("Failed to authenticate")
    }
  }

  const loadOrders = async (accessToken: string) => {
    try {
      console.log("Loading orders...")
      setError(null)

      const response = await fetch("/api/my-orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log("Orders API response status:", response.status)

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
      setError("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    checkAuthAndLoadOrders()
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
        return "#27ae60"
      case "delivered":
        return "#2ecc71"
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
          <div style={{ fontSize: "1rem", color: "#666" }}>Please wait while we fetch your order history.</div>
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
          <div style={{ fontSize: "2rem", marginBottom: "20px", color: "var(--danger-color)" }}>
            Failed to load orders: {error}
          </div>
          <button onClick={handleRetry} className="btn btn-primary">
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
      <section style={{ maxWidth: "1400px", margin: "40px auto", padding: "0 5%" }}>
        {showSuccess && (
          <div
            style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "30px",
              color: "#155724",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.5rem" }}>
              <i className="fas fa-check-circle" style={{ marginRight: "10px" }}></i>
              Order Placed Successfully!
            </h3>
            <p style={{ margin: "0", fontSize: "1.1rem" }}>
              Your order {successOrderId ? `#${successOrderId}` : ""} has been submitted and is pending approval.
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.5rem", color: "var(--primary-color)", margin: 0 }}>My Orders</h1>
          <div style={{ fontSize: "1rem", color: "#666" }}>{user?.email && `Logged in as: ${user.email}`}</div>
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
            <div style={{ fontSize: "4rem", color: "#ddd", marginBottom: "20px" }}>
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "15px", color: "#666" }}>No Orders Yet</h2>
            <p style={{ fontSize: "1.1rem", marginBottom: "30px", color: "#888" }}>
              You haven't placed any orders yet. Start by exploring our meal sets or creating a custom meal.
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
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: "var(--light-text)",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 10px 20px var(--shadow-color)",
                  border: "1px solid #eee",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                      <h3 style={{ fontSize: "1.3rem", margin: "0", color: "var(--primary-color)" }}>
                        Order #{order.id}
                      </h3>
                      <span
                        style={{
                          marginLeft: "15px",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          backgroundColor: getStatusColor(order.status),
                          color: "white",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "5px" }}>
                      Placed on {formatDateTime(order.created_at)}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>Event Date: {formatDate(order.event_date)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--primary-color)" }}>
                      ₱{order.total_amount.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {order.quantity} person{order.quantity > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <h4 style={{ fontSize: "1rem", margin: "0 0 10px 0", color: "var(--primary-color)" }}>
                      Order Details
                    </h4>
                    <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                      <strong>Type:</strong> {order.order_type === "meal_set" ? "Meal Set" : "Custom Meal"}
                    </div>
                    {order.meal_set_name && (
                      <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                        <strong>Meal Set:</strong> {order.meal_set_name}
                      </div>
                    )}
                    <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                      <strong>Event Type:</strong> {order.event_type}
                    </div>
                    <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                      <strong>Payment Method:</strong>{" "}
                      <span style={{ textTransform: "capitalize" }}>{order.payment_method}</span>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1rem", margin: "0 0 10px 0", color: "var(--primary-color)" }}>
                      Contact Information
                    </h4>
                    <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                      <strong>Contact Person:</strong> {order.contact_person}
                    </div>
                    <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                      <strong>Phone:</strong> {order.contact_number}
                    </div>
                    <div style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                      <strong>Email:</strong> {order.customer_email}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <h4 style={{ fontSize: "1rem", margin: "0 0 10px 0", color: "var(--primary-color)" }}>
                    Delivery Address
                  </h4>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>{order.delivery_address}</div>
                </div>

                {order.special_requests && (
                  <div style={{ marginBottom: "15px" }}>
                    <h4 style={{ fontSize: "1rem", margin: "0 0 10px 0", color: "var(--primary-color)" }}>
                      Special Requests
                    </h4>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>{order.special_requests}</div>
                  </div>
                )}

                {order.payments && order.payments.length > 0 && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
                    <h4 style={{ fontSize: "1rem", margin: "0 0 10px 0", color: "var(--primary-color)" }}>
                      Payment Information
                    </h4>
                    {order.payments.map((payment) => (
                      <div key={payment.id} style={{ fontSize: "0.9rem", marginBottom: "5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>
                            <strong>Amount:</strong> ₱{payment.amount.toFixed(2)}
                          </span>
                          <span>
                            <strong>Status:</strong>{" "}
                            <span style={{ textTransform: "capitalize", color: getStatusColor(payment.status) }}>
                              {payment.status}
                            </span>
                          </span>
                        </div>
                        {payment.transaction_id && (
                          <div style={{ fontSize: "0.8rem", color: "#666" }}>
                            Transaction ID: {payment.transaction_id}
                          </div>
                        )}
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
