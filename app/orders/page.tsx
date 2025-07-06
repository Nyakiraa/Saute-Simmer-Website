"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { supabase } from "@/lib/supabase-auth"

interface Order {
  id: number
  customer_id: number
  order_date: string
  total_amount: number
  status: string
  delivery_date: string
  delivery_address: string
  special_instructions: string
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
    payment_date: string | null
  }
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  useEffect(() => {
    checkUserAndLoadOrders()

    // Check for success message
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
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        window.location.href = "/login?redirect=/orders"
        return
      }

      setUser(session.user)

      // Check if user is admin
      const adminEmails = ["admin@sauteandSimmer.com", "admin@example.com"]
      const userIsAdmin = adminEmails.includes(session.user.email || "")
      setIsAdmin(userIsAdmin)

      await loadOrders(session.access_token, userIsAdmin)
    } catch (error) {
      console.error("Auth check failed:", error)
      window.location.href = "/login"
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrders = async (token: string, userIsAdmin: boolean) => {
    try {
      const response = await fetch("/api/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        console.error("Failed to load orders")
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#ff9800"
      case "confirmed":
        return "#2196f3"
      case "preparing":
        return "#9c27b0"
      case "ready":
        return "#4caf50"
      case "delivered":
        return "#8bc34a"
      case "cancelled":
        return "#f44336"
      default:
        return "#757575"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#ff9800"
      case "paid":
        return "#4caf50"
      case "failed":
        return "#f44336"
      case "refunded":
        return "#9c27b0"
      default:
        return "#757575"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
      <section style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 5%" }}>
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              color: "var(--primary-color)",
              marginBottom: "10px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {isAdmin ? "All Orders" : "My Orders"}
          </h1>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>
            {isAdmin ? "Manage all customer orders" : "Track your catering orders"}
          </p>
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
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: "#28a745",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              ✓
            </div>
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2rem" }}>Order Placed Successfully!</h3>
              <p style={{ margin: 0, fontSize: "1rem" }}>
                Your order #{successOrderId} has been received and is being processed. You will receive a confirmation
                email shortly.
              </p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "var(--light-text)",
              borderRadius: "15px",
              boxShadow: "0 5px 15px var(--shadow-color)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "20px", opacity: 0.3 }}>📋</div>
            <h2 style={{ fontSize: "1.8rem", color: "var(--primary-color)", marginBottom: "15px" }}>
              {isAdmin ? "No orders found" : "No orders yet"}
            </h2>
            <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "30px" }}>
              {isAdmin
                ? "No customer orders have been placed yet."
                : "You haven't placed any orders yet. Start by exploring our meal sets!"}
            </p>
            {!isAdmin && (
              <button
                onClick={() => (window.location.href = "/meals")}
                className="btn btn-primary"
                style={{ padding: "12px 30px", fontSize: "1.1rem" }}
              >
                Browse Meal Sets
              </button>
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
                  boxShadow: "0 5px 15px var(--shadow-color)",
                  border: "1px solid #eee",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.3rem",
                        color: "var(--primary-color)",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Order #{order.id}
                    </h3>
                    <p style={{ color: "#666", fontSize: "0.95rem", margin: "0" }}>
                      Placed on {formatDateTime(order.order_date)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "white",
                        backgroundColor: getStatusColor(order.status),
                        marginBottom: "8px",
                      }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--primary-color)" }}>
                      ₱{order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}
                >
                  {/* Event Details */}
                  {order.catering_service && (
                    <div>
                      <h4 style={{ fontSize: "1rem", color: "var(--primary-color)", marginBottom: "8px" }}>
                        Event Details
                      </h4>
                      <div style={{ fontSize: "0.9rem", color: "#666", lineHeight: "1.6" }}>
                        <div>
                          <strong>Type:</strong> {order.catering_service.event_type}
                        </div>
                        <div>
                          <strong>Date:</strong> {formatDate(order.delivery_date)}
                        </div>
                        <div>
                          <strong>Guests:</strong> {order.catering_service.guest_count} persons
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Details */}
                  <div>
                    <h4 style={{ fontSize: "1rem", color: "var(--primary-color)", marginBottom: "8px" }}>
                      Delivery Details
                    </h4>
                    <div style={{ fontSize: "0.9rem", color: "#666", lineHeight: "1.6" }}>
                      <div>
                        <strong>Address:</strong> {order.delivery_address}
                      </div>
                      {order.location && (
                        <div>
                          <strong>Location:</strong> {order.location.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  {order.payment && (
                    <div>
                      <h4 style={{ fontSize: "1rem", color: "var(--primary-color)", marginBottom: "8px" }}>
                        Payment Details
                      </h4>
                      <div style={{ fontSize: "0.9rem", color: "#666", lineHeight: "1.6" }}>
                        <div>
                          <strong>Status:</strong>{" "}
                          <span
                            style={{
                              color: getPaymentStatusColor(order.payment.payment_status),
                              fontWeight: "600",
                            }}
                          >
                            {order.payment.payment_status.charAt(0).toUpperCase() +
                              order.payment.payment_status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <strong>Method:</strong> {order.payment.payment_method}
                        </div>
                        <div>
                          <strong>Transaction ID:</strong> {order.payment.transaction_id}
                        </div>
                        {order.payment.payment_date && (
                          <div>
                            <strong>Paid on:</strong> {formatDateTime(order.payment.payment_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
                    <h4 style={{ fontSize: "1rem", color: "var(--primary-color)", marginBottom: "8px" }}>
                      Special Instructions
                    </h4>
                    <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: "1.6", margin: "0" }}>
                      {order.special_instructions}
                    </p>
                  </div>
                )}

                {/* Admin Actions */}
                {isAdmin && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                        onClick={() => {
                          // Update order status logic here
                          console.log("Update order status for order:", order.id)
                        }}
                      >
                        Update Status
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                        onClick={() => {
                          // View full order details logic here
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
