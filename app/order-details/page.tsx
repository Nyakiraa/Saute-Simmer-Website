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

export default function OrderDetailsPage() {
  const searchParams = useSearchParams()
  const [mealSet, setMealSet] = useState<MealSet | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
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
    checkUserAndLoadData()
  }, [])

  const checkUserAndLoadData = async () => {
    try {
      // Check if user is logged in
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        window.location.href = "/login?redirect=/order-details"
        return
      }

      setUser(session.user)

      // Pre-fill user data
      setFormData((prev) => ({
        ...prev,
        email: session.user.email || "",
        contactPerson: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
      }))

      // Load meal set data if it's a meal set order
      const setId = searchParams?.get("set")
      const quantityParam = searchParams?.get("quantity")

      if (setId) {
        await loadMealSet(Number.parseInt(setId))
      }

      if (quantityParam) {
        setQuantity(Number.parseInt(quantityParam))
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
      console.error("Auth check failed:", error)
      window.location.href = "/login"
    } finally {
      setIsLoading(false)
    }
  }

  const loadMealSet = async (setId: number) => {
    try {
      const response = await fetch(`/api/meal-sets/${setId}`)
      if (response.ok) {
        const data = await response.json()
        setMealSet(data)
      }
    } catch (error) {
      console.error("Error loading meal set:", error)
    }
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
        window.location.href = "/login"
        return
      }

      const orderData = {
        mealSetId: mealSet?.id,
        quantity: quantity,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        deliveryAddress: formData.deliveryAddress,
        specialRequests: formData.specialRequests,
      }

      const response = await fetch("/api/meal-set-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to success page
        window.location.href = `/orders?success=true&orderId=${result.order.id}`
      } else {
        const error = await response.json()
        alert(error.message || "Failed to place order. Please try again.")
      }
    } catch (error) {
      console.error("Order submission failed:", error)
      alert("Failed to place order. Please try again.")
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

  if (!mealSet) {
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "20px", color: "var(--danger-color)" }}>Meal set not found</div>
          <button onClick={() => (window.location.href = "/meals")} className="btn btn-primary">
            Back to Meal Sets
          </button>
        </div>
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
              <div style={{ width: "150px", fontWeight: "500" }}>Meal Set:</div>
              <div style={{ flex: 1 }}>{mealSet.name}</div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Type:</div>
              <div style={{ flex: 1, textTransform: "capitalize" }}>{mealSet.type}</div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Price per person:</div>
              <div style={{ flex: 1 }}>₱{mealSet.price.toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ width: "150px", fontWeight: "500" }}>Quantity:</div>
              <div style={{ flex: 1 }}>{quantity} persons</div>
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
              Description
            </h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>{mealSet.description}</p>
            {mealSet.comment && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  backgroundColor: "var(--secondary-color)",
                  borderRadius: "10px",
                  fontWeight: "600",
                  color: "var(--primary-color)",
                  border: "2px dashed var(--primary-color)",
                }}
              >
                <i className="fas fa-info-circle" style={{ marginRight: "10px" }}></i>
                {mealSet.comment}
              </div>
            )}
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
              <div style={{ fontWeight: "600" }}>₱{mealSet.price.toFixed(2)}</div>
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
                borderTop: "1px solid #eee",
                paddingTop: "10px",
                marginTop: "10px",
              }}
            >
              <div>Total:</div>
              <div>₱{(mealSet.price * quantity).toFixed(2)}</div>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Type of Event *</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  backgroundColor: "var(--light-text)",
                  cursor: "pointer",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                <option value="">Select event type</option>
                <option value="Corporate Meeting">Corporate Meeting</option>
                <option value="Conference">Conference</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Wedding">Wedding</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Graduation">Graduation</option>
                <option value="Other">Other</option>
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
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Delivery Address *</label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                placeholder="Enter complete delivery address"
                required
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  resize: "vertical",
                  minHeight: "100px",
                  opacity: isSubmitting ? 0.6 : 1,
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
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  opacity: isSubmitting ? 0.6 : 1,
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
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  opacity: isSubmitting ? 0.6 : 1,
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
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Any special requests or dietary requirements"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "Poppins, sans-serif",
                  resize: "vertical",
                  minHeight: "100px",
                  opacity: isSubmitting ? 0.6 : 1,
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
                  opacity: isSubmitting ? 0.6 : 1,
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
