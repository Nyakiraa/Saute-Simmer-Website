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
  event_type: string
  event_date: string
  guest_count: number
  status: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled"
  location: string
  special_requests: string
  created_at: string
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
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
      await loadOrders(session.access_token)
    } catch (error) {
      console.error("Auth check failed:", error)
      window.location.href = "/login"
    }
  }

  const loadOrders = async (token: string) => {
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
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "fas fa-clock"
      case "confirmed":
        return "fas fa-check-circle"
      case "preparing":
        return "fas fa-utensils"
      case "delivered":
        return "fas fa-truck"
      case "cancelled":
        return "fas fa-times-circle"
      default:
        return "fas fa-question-circle"
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

      {/* Success Message */}
      {showSuccess && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "15px 20px",
            margin: "20px 5%",
            borderRadius: "8px",
            border: "1px solid #c3e6cb",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <i className="fas fa-check-circle" style={{ fontSize: "1.2rem" }}></i>
          <div>
            <strong>Order Placed Successfully!</strong>
            <br />
            Your order #{successOrderId} has been submitted and is being processed.
          </div>
        </div>
      )}

      {/* Page Header */}
      <section
        style={{
          background: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/orders-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "var(--light-text)",
          padding: "80px 5%",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>My Orders</h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "0", opacity: "0.9" }}>
            Track your catering orders and view order history.
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section style={{ padding: "60px 5%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fas fa-shopping-cart" style={{ fontSize: "4rem", color: "#ddd", marginBottom: "20px" }}></i>
              <h2 style={{ fontSize: "2rem", marginBottom: "15px", color: "#666" }}>No Orders Yet</h2>
              <p style={{ fontSize: "1.1rem", color: "#888", marginBottom: "30px" }}>
                You haven't placed any orders yet. Start by exploring our meal sets or creating custom meals.
              </p>
              <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => (window.location.href = "/meals")}
                  className="btn btn-primary"
                  style={{ padding: "12px 25px" }}
                >
                  Browse Meal Sets
                </button>
                <button
                  onClick={() => (window.location.href = "/custom-meals")}
                  className="btn btn-secondary"
                  style={{ padding: "12px 25px" }}
                >
                  Create Custom Meal
                </button>
              </div>
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
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "20px",
                      alignItems: "start",
                    }}
                  >
                    {/* Order Details */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                        <h3
                          style={{
                            fontSize: "1.3rem",
                            color: "var(--primary-color)",
                            margin: "0 15px 0 0",
                          }}
                        >
                          Order #{order.id}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: getStatusColor(order.status),
                            color: "white",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                          }}
                        >
                          <i className={getStatusIcon(order.status)}></i>
                          <span style={{ textTransform: "capitalize" }}>{order.status}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "15px",
                          marginBottom: "15px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "500", color: "#666", fontSize: "0.9rem" }}>Event Type</div>
                          <div style={{ fontSize: "1rem", marginTop: "2px" }}>{order.event_type}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: "500", color: "#666", fontSize: "0.9rem" }}>Event Date</div>
                          <div style={{ fontSize: "1rem", marginTop: "2px" }}>{formatDate(order.event_date)}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: "500", color: "#666", fontSize: "0.9rem" }}>Guest Count</div>
                          <div style={{ fontSize: "1rem", marginTop: "2px" }}>{order.guest_count} persons</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: "500", color: "#666", fontSize: "0.9rem" }}>Order Date</div>
                          <div style={{ fontSize: "1rem", marginTop: "2px" }}>{formatDateTime(order.created_at)}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "15px" }}>
                        <div style={{ fontWeight: "500", color: "#666", fontSize: "0.9rem", marginBottom: "5px" }}>
                          Delivery Location
                        </div>
                        <div style={{ fontSize: "1rem" }}>{order.location}</div>
                      </div>

                      {order.special_requests && (
                        <div>
                          <div style={{ fontWeight: "500", color: "#666", fontSize: "0.9rem", marginBottom: "5px" }}>
                            Special Requests
                          </div>
                          <div
                            style={{
                              fontSize: "0.95rem",
                              backgroundColor: "#f8f9fa",
                              padding: "10px",
                              borderRadius: "8px",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {order.special_requests}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Actions */}
                    <div style={{ textAlign: "right" }}>
                      {order.status === "pending" && (
                        <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "10px" }}>
                          <i className="fas fa-info-circle" style={{ marginRight: "5px" }}></i>
                          Awaiting confirmation
                        </div>
                      )}
                      {order.status === "confirmed" && (
                        <div style={{ fontSize: "0.9rem", color: "#3498db", marginBottom: "10px" }}>
                          <i className="fas fa-check" style={{ marginRight: "5px" }}></i>
                          Order confirmed
                        </div>
                      )}
                      {order.status === "preparing" && (
                        <div style={{ fontSize: "0.9rem", color: "#9b59b6", marginBottom: "10px" }}>
                          <i className="fas fa-utensils" style={{ marginRight: "5px" }}></i>
                          Being prepared
                        </div>
                      )}
                      {order.status === "delivered" && (
                        <div style={{ fontSize: "0.9rem", color: "#27ae60", marginBottom: "10px" }}>
                          <i className="fas fa-check-double" style={{ marginRight: "5px" }}></i>
                          Delivered successfully
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
