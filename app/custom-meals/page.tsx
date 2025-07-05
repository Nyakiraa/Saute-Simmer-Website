"use client"

import { useState, useEffect } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

interface MenuItem {
  id: number
  name: string
  price: number
  category: "snack" | "main" | "side" | "beverage"
  description: string
  status: "available" | "unavailable"
}

export default function CustomMealsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: MenuItem[] }>({
    snack: [],
    main: [],
    side: [],
    beverage: [],
  })
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      const response = await fetch("/api/items")
      if (response.ok) {
        const data = await response.json()
        // Only show available items
        setMenuItems(data.filter((item: MenuItem) => item.status === "available"))
      }
    } catch (error) {
      console.error("Error loading menu items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    { key: "snack", name: "Snacks", icon: "fas fa-cookie" },
    { key: "main", name: "Main Courses", icon: "fas fa-utensils" },
    { key: "side", name: "Side Dishes", icon: "fas fa-ice-cream" },
    { key: "beverage", name: "Beverages", icon: "fas fa-glass-whiskey" },
  ]

  const toggleItem = (item: MenuItem) => {
    setSelectedItems((prev) => {
      const category = prev[item.category]
      const isSelected = category.some((selected) => selected.id === item.id)

      if (isSelected) {
        return {
          ...prev,
          [item.category]: category.filter((selected) => selected.id !== item.id),
        }
      } else {
        return {
          ...prev,
          [item.category]: [...category, item],
        }
      }
    })
  }

  const isItemSelected = (item: MenuItem) => {
    return selectedItems[item.category].some((selected) => selected.id === item.id)
  }

  const getTotalPrice = () => {
    let total = 0
    Object.values(selectedItems).forEach((categoryItems) => {
      categoryItems.forEach((item) => {
        total += item.price
      })
    })
    return total
  }

  const getTotalItems = () => {
    return Object.values(selectedItems).reduce((total, categoryItems) => total + categoryItems.length, 0)
  }

  const handleProceedToOrder = () => {
    if (getTotalItems() === 0) {
      alert("Please select at least one item to proceed.")
      return
    }

    // Convert selected items to URL parameters
    const itemsData = encodeURIComponent(JSON.stringify(selectedItems))
    window.location.href = `/orders?custom=true&items=${itemsData}&quantity=${quantity}`
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "20px" }}>Loading menu items...</div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      {/* Page Header */}
      <section
        style={{
          background: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/mixmatch.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "var(--light-text)",
          padding: "80px 5%",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px", fontFamily: "'Cinzel Decorative', serif",
                    fontWeight: "700" }}>Create Custom Meal</h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "0", opacity: "0.9" }}>
            Mix and match from our extensive menu to create the perfect meal for your event.
          </p>
        </div>
      </section>

      {/* Custom Meal Builder */}
      <section style={{ padding: "60px 5%" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "40px" }}>
            {/* Menu Categories */}
            <div>
              {categories.map((category) => {
                const categoryItems = menuItems.filter((item) => item.category === category.key)

                if (categoryItems.length === 0) return null

                return (
                  <div key={category.key} style={{ marginBottom: "40px" }}>
                    <h2
                      style={{
                        fontSize: "1.8rem",
                        color: "var(--primary-color)",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <i className={category.icon} style={{ marginRight: "15px" }}></i>
                      {category.name}
                    </h2>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "15px",
                      }}
                    >
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(item)}
                          style={{
                            backgroundColor: isItemSelected(item) ? "var(--secondary-color)" : "var(--light-text)",
                            border: isItemSelected(item) ? "2px solid var(--primary-color)" : "2px solid transparent",
                            borderRadius: "10px",
                            padding: "15px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 10px var(--shadow-color)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "600",
                                marginBottom: "5px",
                                color: isItemSelected(item) ? "var(--primary-color)" : "var(--text-color)",
                              }}
                            >
                              {item.name}
                            </h3>
                            <p
                              style={{
                                fontSize: "0.9rem",
                                color: "#666",
                                marginBottom: "5px",
                              }}
                            >
                              {item.description}
                            </p>
                            <p
                              style={{
                                fontSize: "1rem",
                                fontWeight: "500",
                                color: "var(--primary-color)",
                                margin: 0,
                              }}
                            >
                              ₱{item.price}
                            </p>
                          </div>

                          {isItemSelected(item) && (
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor: "var(--primary-color)",
                                color: "var(--light-text)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <i className="fas fa-check" style={{ fontSize: "12px" }}></i>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div style={{ position: "sticky", top: "100px", height: "fit-content" }}>
              <div
                style={{
                  backgroundColor: "var(--light-text)",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 10px 20px var(--shadow-color)",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.5rem",
                    color: "var(--primary-color)",
                    marginBottom: "20px",
                  }}
                >
                  Order Summary
                </h3>

                {/* Quantity Selector */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    Quantity (persons):
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "#f1f1f1",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      min="1"
                      max="500"
                      style={{
                        width: "60px",
                        textAlign: "center",
                        padding: "5px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(500, quantity + 1))}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "#f1f1f1",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Selected Items */}
                {categories.map((category) => {
                  const categoryItems = selectedItems[category.key]
                  if (categoryItems.length === 0) return null

                  return (
                    <div key={category.key} style={{ marginBottom: "20px" }}>
                      <h4
                        style={{
                          fontSize: "1rem",
                          color: "var(--primary-color)",
                          marginBottom: "10px",
                        }}
                      >
                        {category.name}
                      </h4>
                      {categoryItems.map((item) => (
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
                          <span>₱{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}

                {getTotalItems() === 0 && (
                  <p style={{ color: "#666", fontStyle: "italic", textAlign: "center", margin: "20px 0" }}>
                    No items selected yet
                  </p>
                )}

                {/* Totals */}
                <div
                  style={{
                    borderTop: "2px solid #eee",
                    paddingTop: "15px",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>Subtotal (per person):</span>
                    <span>₱{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>Quantity:</span>
                    <span>{quantity} persons</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "var(--primary-color)",
                      borderTop: "1px solid #eee",
                      paddingTop: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <span>Total:</span>
                    <span>₱{(getTotalPrice() * quantity).toFixed(2)}</span>
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToOrder}
                  disabled={getTotalItems() === 0}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "12px",
                    opacity: getTotalItems() === 0 ? 0.5 : 1,
                    cursor: getTotalItems() === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Proceed to Order ({getTotalItems()} items)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
