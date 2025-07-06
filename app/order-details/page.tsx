"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { supabase } from "@/lib/supabase-auth"

interface MealSet {
  id: number
  name: string
  type: "premium" | "standard" | "basic"
  price: number
  description: string
  comment?: string
}

interface MenuItem {
  id: number
  name: string
  price: number
  category: "snack" | "main" | "side" | "beverage"
  description: string
}

export default function OrderDetailsPage() {
  const searchParams = useSearchParams()
  const [selectedMealSet, setSelectedMealSet] = useState<MealSet | null>(null)
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: MenuItem[] }>({
    snack: [],
    main: [],
    side: [],
    beverage: [],
  })
  const [quantity, setQuantity] = useState(1)
  const [isCustomOrder, setIsCustomOrder] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    const initializeOrder = async () => {
      // Check authentication
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error || !session) {
          alert("Please login first to place an order.")
          window.location.href = "/login"
          return
        }

        // Pre-fill email from user session
        setFormData((prev) => ({
          ...prev,
          email: session.user.email || "",
          contactPerson: session.user.user_metadata?.full_name || session.user.email || "",
        }))

        const setId = searchParams?.get("set")
        const customParam = searchParams?.get("custom")
        const itemsParam = searchParams?.get("items")
        const quantityParam = searchParams?.get("quantity")

        if (quantityParam) {
          setQuantity(Number.parseInt(quantityParam) || 1)
        }

        if (customParam === "true" && itemsParam) {
          setIsCustomOrder(true)
          try {
            const items = JSON.parse(decodeURIComponent(itemsParam))
            setSelectedItems(items)
          } catch (error) {
            console.error("Error parsing items:", error)
          }
        } else if (setId) {
          // Load meal set details
          await loadMealSet(Number.parseInt(setId))
        }

        // Set minimum dates
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const minDate = tomorrow.toISOString().split("T")[0]

        setTimeout(() => {
          const eventDateInput = document.getElementById("event-date") as HTMLInputElement
          const deliveryDateInput = document.getElementById("delivery-date") as HTMLInputElement
          if (eventDateInput) eventDateInput.min = minDate
          if (deliveryDateInput) deliveryDateInput.min = minDate
        }, 100)
      } catch (error) {
        console.error("Initialization error:", error)
        window.location.href = "/login"
      } finally {
        setIsLoading(false)
      }
    }

    initializeOrder()
  }, [searchParams])

  const loadMealSet = async (setId: number) => {
    try {
      const response = await fetch(`/api/meal-sets/${setId}`)
      if (response.ok) {
        const mealSet = await response.json()
        setSelectedMealSet(mealSet)
      }
    } catch (error) {
      console.error("Error loading meal set:", error)
    }
  }

  const getTotalPrice = () => {
    if (selectedMealSet) {
      return selectedMealSet.price
    }
    let total = 0
    Object.values(selectedItems).forEach((categoryItems) => {
      categoryItems.forEach((item) => {
        total += item.price
      })
    })
    return total
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert("Please login to place an order.")
        return
      }

      const totalAmount = getTotalPrice() * quantity

      // Prepare order data
      const orderData = {
        order_type: isCustomOrder ? "custom" : "meal_set",
        meal_set_name: selectedMealSet?.name,
        meal_set_id: selectedMealSet?.id,
        quantity: quantity,
        total_amount: totalAmount,
        event_type: formData.eventType,
        event_date: formData.eventDate,
        delivery_address: formData.deliveryAddress,
        contact_person: formData.contactPerson,
        contact_number: formData.contactNumber,
        payment_method: formData.paymentMethod,
        special_requests: formData.specialRequests,
        selected_items: isCustomOrder ? selectedItems : null,
      }

      console.log("Submitting order:", orderData)

      // Choose the appropriate API endpoint
      const apiEndpoint = isCustomOrder ? "/api/orders" : "/api/meal-set-orders"

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log("Order placed successfully:", result.order)
        setOrderSuccess(true)
        window.scrollTo(0, 0)
      } else {
        throw new Error(result.error || "Failed to place order")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      alert(`Failed to submit order: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "20px" }}>Loading order details...</div>
        </div>
        <Footer />
      </>
    )
  }

  if (orderSuccess) {
    return (
      <>
        <Header />
        <section style={{ textAlign: "center", padding: "50px 20px", maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ fontSize: "5rem", color: "var(--success-color)", marginBottom: "20px" }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <h2 style={{ fontSize: "2rem", marginBottom: "15px", color: "var(--success-color)" }}>
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
            Thank you for your order! Your catering request has been submitted and is pending approval from our admin
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
              <div style={{ width: "150px", fontWeight: "500" }}>Order Type:</div>
              <div style={{ flex: 1 }}>{isCustomOrder ? "Custom Meal" : "Meal Set"}</div>
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
              <div style={{ flex: 1, textTransform: "capitalize" }}>{formData.paymentMethod}</div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Total Amount:</div>
              <div style={{ flex: 1, fontWeight: "600", color: "var(--primary-color)" }}>
                ₱{(getTotalPrice() * quantity).toFixed(2)}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "30px" }}>
            <button
              onClick={() => (window.location.href = "/orders")}
              className="btn btn-outline"
              style={{ marginRight: "10px" }}
            >
              View My Orders
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
          <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "var(--primary-color)" }}>Order Details</h2>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Order Type:</div>
              <div style={{ flex: 1 }}>{isCustomOrder ? "Custom Meal" : "Meal Set"}</div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Quantity:</div>
              <div style={{ flex: 1 }}>{quantity} persons</div>
            </div>
          </div>

          {selectedMealSet && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--primary-color)", marginBottom: "10px" }}>
                Selected Meal Set
              </h3>
              <div style={{ padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 5px 0", fontWeight: "600" }}>{selectedMealSet.name}</h4>
                <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "0.9rem" }}>{selectedMealSet.description}</p>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--primary-color)" }}>
                  ₱{selectedMealSet.price.toFixed(2)}
                </div>
                {selectedMealSet.comment && (
                  <p
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      color: "var(--accent-color)",
                    }}
                  >
                    {selectedMealSet.comment}
                  </p>
                )}
              </div>
            </div>
          )}

          {isCustomOrder && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--primary-color)", marginBottom: "10px" }}>
                Selected Items
              </h3>
              {Object.entries(selectedItems).map(([category, items]) => {
                if (items.length === 0) return null
                return (
                  <div key={category} style={{ marginBottom: "15px" }}>
                    <h4
                      style={{
                        fontSize: "1rem",
                        color: "var(--primary-color)",
                        marginBottom: "8px",
                        textTransform: "capitalize",
                      }}
                    >
                      {category === "main" ? "Main Courses" : category === "side" ? "Side Dishes" : category}s
                    </h4>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                          fontSize: "0.9rem",
                        }}
                      >
                        <span>{item.name}</span>
                        <span>₱{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "2px solid #ddd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ fontWeight: "500" }}>Subtotal (per person):</div>
              <div style={{ fontWeight: "600" }}>₱{getTotalPrice().toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ fontWeight: "500" }}>Quantity:</div>
              <div style={{ fontWeight: "600" }}>{quantity} persons</div>
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
              <div>₱{(getTotalPrice() * quantity).toFixed(2)}</div>
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
          <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "var(--primary-color)" }}>Event Information</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Type of Event *</label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Event Date *</label>
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
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Start Time *</label>
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
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>End Time *</label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Delivery Address *</label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Contact Person *</label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Email Address *</label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Contact Number *</label>
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
                <option value="cash">Cash on Delivery</option>
                <option value="bank">Bank Transfer</option>
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </>
  )
}
