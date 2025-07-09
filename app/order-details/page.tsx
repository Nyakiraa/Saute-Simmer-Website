"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase-auth"

interface Item {
  id: string
  name: string
  category: string
  price: number
  description?: string
}

function OrderDetailsContent() {
  const searchParams = useSearchParams()
  const [selectedItems, setSelectedItems] = useState<Item[]>([])
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cash",
    specialRequests: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get user info
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setCustomerInfo((prev) => ({
          ...prev,
          name: session.user.user_metadata?.full_name || "",
          email: session.user.email || "",
        }))
      }
    }
    getUser()

    // Parse items from URL
    const itemsParam = searchParams.get("items")
    const customParam = searchParams.get("custom")

    if (itemsParam) {
      try {
        const items = JSON.parse(decodeURIComponent(itemsParam))
        setSelectedItems(items)
        // Initialize quantities
        const initialQuantities: { [key: string]: number } = {}
        items.forEach((item: Item) => {
          initialQuantities[item.id] = 1
        })
        setQuantities(initialQuantities)
      } catch (error) {
        console.error("Error parsing items:", error)
      }
    }
  }, [searchParams])

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + item.price * (quantities[item.id] || 1)
    }, 0)
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return
    setQuantities((prev) => ({
      ...prev,
      [itemId]: quantity,
    }))
  }

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        contact_number: customerInfo.phone,
        delivery_address: customerInfo.address,
        payment_method: customerInfo.paymentMethod,
        special_requests: customerInfo.specialRequests,
        items: selectedItems.map((item) => ({
          ...item,
          quantity: quantities[item.id] || 1,
        })),
        total_amount: calculateTotal(),
        order_type: "custom",
        quantity: selectedItems.reduce((sum, item) => sum + (quantities[item.id] || 1), 0),
        contact_person: customerInfo.name,
        event_type: null,
        event_date: null,
        guest_count: selectedItems.reduce((sum, item) => sum + (quantities[item.id] || 1), 0),
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Order placed successfully! Order ID: #${result.order.id}`)
        window.location.href = "/orders"
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert(`Failed to submit order: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  if (selectedItems.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>No items selected</h2>
        <p>Please go back and select items for your order.</p>
        <a href="/custom-meals" style={{ color: "#dc2626", textDecoration: "underline" }}>
          Back to Custom Meals
        </a>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "2rem 0" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "2rem", textAlign: "center" }}>
          Order Details
        </h1>

        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr" }}>
          {/* Order Summary */}
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              height: "fit-content",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Order Summary</h2>
            <div style={{ marginBottom: "1rem" }}>
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>{item.name}</h3>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) - 1)}
                      style={{
                        width: "24px",
                        height: "24px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "white",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: "20px", textAlign: "center" }}>{quantities[item.id] || 1}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
                      style={{
                        width: "24px",
                        height: "24px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "white",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 0",
                borderTop: "2px solid #e2e8f0",
                fontSize: "1.125rem",
                fontWeight: "600",
              }}
            >
              <span>Total:</span>
              <span style={{ color: "#dc2626" }}>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          {/* Customer Information */}
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Customer Information</h2>
            <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Delivery Address
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                  placeholder="Enter your delivery address"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Payment Method *
                </label>
                <select
                  value={customerInfo.paymentMethod}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, paymentMethod: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="cash">Cash on Delivery</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                  <option value="credit">Credit Card</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
                  Special Requests
                </label>
                <textarea
                  value={customerInfo.specialRequests}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, specialRequests: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                  placeholder="Any special requests or dietary requirements"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: isSubmitting ? "#9ca3af" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  marginTop: "1rem",
                }}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderDetailsContent />
    </Suspense>
  )
}
