"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/Header"

interface MealSet {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  is_available: boolean
}

export default function MealsPage() {
  const [mealSets, setMealSets] = useState<MealSet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeal, setSelectedMeal] = useState<MealSet | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [orderDate, setOrderDate] = useState("")
  const [orderTime, setOrderTime] = useState("")
  const [isOrdering, setIsOrdering] = useState(false)

  useEffect(() => {
    fetchMealSets()
  }, [])

  const fetchMealSets = async () => {
    try {
      const { data, error } = await supabase.from("meal_sets").select("*").eq("is_available", true).order("name")

      if (error) throw error
      setMealSets(data || [])
    } catch (error) {
      console.error("Error fetching meal sets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderMeal = async () => {
    if (!selectedMeal) return

    setIsOrdering(true)
    try {
      // Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert("Please log in to place an order")
        window.location.href = "/login"
        return
      }

      // Get customer info
      const { data: customer } = await supabase.from("customers").select("id").eq("email", session.user.email).single()

      if (!customer) {
        alert("Customer profile not found. Please complete your profile.")
        return
      }

      const orderData = {
        customer_id: customer.id,
        meal_set_id: selectedMeal.id,
        quantity: quantity,
        total_amount: selectedMeal.price * quantity,
        order_date: orderDate,
        order_time: orderTime,
        status: "pending",
      }

      const response = await fetch("/api/meal-set-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        alert("Order placed successfully!")
        setSelectedMeal(null)
        setQuantity(1)
        setOrderDate("")
        setOrderTime("")
      } else {
        const error = await response.json()
        alert(`Failed to place order: ${error.error}`)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsOrdering(false)
    }
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "Poppins, sans-serif" }}>
        <Header />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #d32f2f",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            ></div>
            <p>Loading meal sets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Header />

      <div style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1
            style={{
              textAlign: "center",
              color: "#d32f2f",
              marginBottom: "40px",
              fontSize: "2.5rem",
              fontWeight: "600",
            }}
          >
            Our Meal Sets
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px",
            }}
          >
            {mealSets.map((meal) => (
              <div
                key={meal.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.15)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)"
                }}
                onClick={() => setSelectedMeal(meal)}
              >
                <div
                  style={{
                    height: "200px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                  }}
                >
                  {meal.image_url ? (
                    <img
                      src={meal.image_url || "/placeholder.svg"}
                      alt={meal.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span>No Image Available</span>
                  )}
                </div>

                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      color: "#333",
                      marginBottom: "10px",
                      fontSize: "1.3rem",
                      fontWeight: "600",
                    }}
                  >
                    {meal.name}
                  </h3>

                  <p
                    style={{
                      color: "#666",
                      marginBottom: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    {meal.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#d32f2f",
                      }}
                    >
                      ₱{meal.price.toFixed(2)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMeal(meal)
                      }}
                      style={{
                        background: "linear-gradient(to right, #d32f2f, #b71c1c)",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "25px",
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "transform 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {selectedMeal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "15px",
              padding: "30px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
            >
              <h2 style={{ color: "#d32f2f", margin: 0 }}>Order {selectedMeal.name}</h2>
              <button
                onClick={() => setSelectedMeal(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ color: "#666", marginBottom: "10px" }}>{selectedMeal.description}</p>
              <p style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#d32f2f" }}>
                ₱{selectedMeal.price.toFixed(2)} per serving
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Preferred Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Preferred Time</label>
              <input
                type="time"
                value={orderTime}
                onChange={(e) => setOrderTime(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div
              style={{
                padding: "15px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span>Subtotal:</span>
                <span>₱{(selectedMeal.price * quantity).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.1rem" }}>
                <span>Total:</span>
                <span style={{ color: "#d32f2f" }}>₱{(selectedMeal.price * quantity).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setSelectedMeal(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleOrderMeal}
                disabled={isOrdering || !orderDate || !orderTime}
                style={{
                  flex: 2,
                  padding: "12px",
                  background: isOrdering ? "#ccc" : "linear-gradient(to right, #d32f2f, #b71c1c)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isOrdering ? "not-allowed" : "pointer",
                  fontWeight: "500",
                }}
              >
                {isOrdering ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
