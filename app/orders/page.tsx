"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { supabase } from "@/lib/supabase-auth"
import type { User } from "@supabase/supabase-js"

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
}

const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [cateringServices, setCateringServices] = useState<CateringService[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCustomOrder, setIsCustomOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    eventType: "",
    eventDate: "",
    eventStartTime: "",
    eventEndTime: "",
    deliveryDate: "",
    deliveryTime: "",
    deliveryAddress: "",
    contactPerson: "",
    email: "",
    contactNumber: "",
    paymentMethod: "",
    specialRequests: "",
  })

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

    const custom = searchParams?.get("custom")
    const items = searchParams?.get("items")
    if (custom === "true" && items) {
      setIsCustomOrder(true)
      // Set minimum dates
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const minDate = tomorrow.toISOString().split("T")[0]
      const eventDateInput = document.getElementById("event-date") as HTMLInputElement
      const deliveryDateInput = document.getElementById("delivery-date") as HTMLInputElement
      if (eventDateInput) eventDateInput.min = minDate
      if (deliveryDateInput) deliveryDateInput.min = minDate
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
      const userIsAdmin = allowedAdmins.includes(session.user.email || "")
      setIsAdmin(userIsAdmin)
      console.log("User is admin:", userIsAdmin)

      // Load orders
      await loadUserOrders(session.access_token)
    } catch (error) {
      console.error("Auth check failed:", error)
      setError("Authentication failed")
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    }
  }

  const loadUserOrders = async (accessToken: string) => {
    try {
      console.log("Loading orders...")

      const response = await fetch("/api/my-orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
      setCateringServices(data.orders || []) // For backward compatibility
      setIsAdmin(data.isAdmin)
    } catch (error) {
      console.error("Error loading orders:", error)
      setError("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate order submission
    setTimeout(() => {
      setOrderSuccess(true)
      window.scrollTo(0, 0)
    }, 1000)
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
              <div style={{ width: "150px", fontWeight: "500" }}>Order Number:</div>
              <div style={{ flex: 1 }}>
                SS-{new Date().getFullYear()}-{String(orders.length + 1).padStart(3, "0")}
              </div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Order Date:</div>
              <div style={{ flex: 1 }}>
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Event Type:</div>
              <div style={{ flex: 1 }}>{formData.eventType}</div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Event Date:</div>
              <div style={{ flex: 1 }}>
                {formData.eventDate
                  ? new Date(formData.eventDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Payment Method:</div>
              <div style={{ flex: 1 }}>{formData.paymentMethod}</div>
            </div>
          </div>
          <div style={{ marginTop: "30px" }}>
            <button
              onClick={() => (window.location.href = "/orders")}
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

  if (isCustomOrder) {
    return (
      <>
        <Header />
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "30px",
            maxWidth: "1400px",
            margin: "40px auto",
            padding: "0 5%",
          }}
        >
          {/* Order Details */}
          <div
            style={{
              backgroundColor: "var(--light-text)",
              borderRadius: "15px",
              padding: "30px",
              boxShadow: "0 10px 20px var(--shadow-color)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "20px",
                color: "var(--primary-color)",
              }}
            >
              Order Details
            </h2>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", marginBottom: "10px" }}>
                <div style={{ width: "150px", fontWeight: "500" }}>Order Type:</div>
                <div style={{ flex: 1 }}>Custom Meal</div>
              </div>
              <div style={{ display: "flex", marginBottom: "10px" }}>
                <div style={{ width: "150px", fontWeight: "500" }}>Quantity:</div>
                <div style={{ flex: 1 }}>{searchParams?.get("quantity") || 1} persons</div>
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  color: "var(--primary-color)",
                  marginBottom: "10px",
                }}
              >
                Selected Items
              </h3>
              <div>
                <p style={{ fontStyle: "italic", color: "#666" }}>
                  Items will be displayed here based on your selection
                </p>
              </div>
            </div>
            <div
              style={{
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "2px solid #ddd",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ fontWeight: "500" }}>Subtotal (per person):</div>
                <div style={{ fontWeight: "600" }}>₱0.00</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ fontWeight: "500" }}>Subtotal:</div>
                <div style={{ fontWeight: "600" }}>₱0.00</div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.2rem",
                  color: "var(--primary-color)",
                  fontWeight: "600",
                }}
              >
                <div>Total:</div>
                <div>₱0.00</div>
              </div>
            </div>
          </div>

          {/* Customer Form */}
          <div
            style={{
              backgroundColor: "var(--light-text)",
              borderRadius: "15px",
              padding: "30px",
              boxShadow: "0 10px 20px var(--shadow-color)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "20px",
                color: "var(--primary-color)",
              }}
            >
              Delivery Information
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Type of Event</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    backgroundColor: "var(--light-text)",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select event type</option>
                  <option value="corporate">Corporate Meeting</option>
                  <option value="conference">Conference</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="wedding">Wedding</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="graduation">Graduation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Event Date</label>
                <input
                  type="date"
                  id="event-date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Start Time</label>
                  <input
                    type="time"
                    name="eventStartTime"
                    value={formData.eventStartTime}
                    onChange={handleInputChange}
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
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>End Time</label>
                  <input
                    type="time"
                    name="eventEndTime"
                    value={formData.eventEndTime}
                    onChange={handleInputChange}
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
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Delivery Date</label>
                <input
                  type="date"
                  id="delivery-date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Delivery Time</label>
                <select
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    backgroundColor: "var(--light-text)",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select a time</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Delivery Address</label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  placeholder="Enter complete delivery address"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    resize: "vertical",
                    minHeight: "100px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Name of contact person"
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Phone number"
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Payment Method *</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    backgroundColor: "var(--light-text)",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select payment method</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="GCash">GCash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayMaya">PayMaya</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Special Requests</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requests or dietary requirements"
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    resize: "vertical",
                    minHeight: "100px",
                  }}
                />
              </div>

              <div style={{ marginTop: "30px", textAlign: "center" }}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
                  Place Order
                </button>
              </div>
            </form>
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
                  </div>
                </div>

                {/* Order Details */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                    marginBottom: "20px",
                  }}
                >
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
                      {order.delivery_date && (
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Delivery Date:</strong> {formatDate(order.delivery_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "15px",
                      borderRadius: "10px",
                      marginTop: "15px",
                    }}
                  >
                    <h4 style={{ fontSize: "1rem", color: "var(--primary-color)", marginBottom: "8px" }}>
                      Special Instructions
                    </h4>
                    <p style={{ margin: "0", fontSize: "0.9rem", lineHeight: "1.5", color: "#555" }}>
                      {order.special_instructions}
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
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}
