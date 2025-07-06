"use client"

import type React from "react"

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
}

// Add after the existing interfaces
const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [cateringServices, setCateringServices] = useState<CateringService[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCustomOrder, setIsCustomOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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

    // Check for success message
    const success = searchParams?.get("success")
    const orderId = searchParams?.get("orderId")

    if (success === "true" && orderId) {
      setOrderSuccess(true)
      // Clean up URL
      window.history.replaceState({}, document.title, "/orders")
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
      // Check if user is logged in
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        // Redirect to login if not authenticated
        window.location.href = "/login?redirect=/orders"
        return
      }

      setUser(session.user)
      await loadUserOrders(session.access_token)
    } catch (error) {
      console.error("Auth check failed:", error)
      window.location.href = "/login?redirect=/orders"
    }
  }

  const loadUserOrders = async (accessToken: string) => {
    try {
      const response = await fetch("/api/my-orders", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCateringServices(data.orders)
        setIsAdmin(data.isAdmin)
      } else if (response.status === 401) {
        // Session expired, redirect to login
        window.location.href = "/login?redirect=/orders"
      } else {
        throw new Error("Failed to load orders")
      }
    } catch (error) {
      console.error("Error loading orders:", error)
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
                SS-{new Date().getFullYear()}-{String(cateringServices.length + 1).padStart(3, "0")}
              </div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Order Date:</div>
              <div style={{ flex: 1 }}>
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Status:</div>
              <div style={{ flex: 1, color: "var(--warning-color)", fontWeight: "500" }}>Pending Approval</div>
            </div>
          </div>

          <div style={{ marginTop: "30px" }}>
            <button
              onClick={() => {
                setOrderSuccess(false)
                window.location.reload()
              }}
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
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Payment Method</label>
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
                  <option value="cash">Cash on Delivery</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                  <option value="credit">Credit Card</option>
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
          <div style={{ fontSize: "2rem", marginBottom: "20px" }}>Loading orders...</div>
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
