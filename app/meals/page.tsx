"use client"
import { useState, useEffect } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

interface MealSet {
  id: number
  name: string
  type: string
  price: number
  description: string
  items: any[]
  comment: string
}

interface Item {
  id: number
  name: string
  category: string
  price: number
  description: string
  status: string
}

export default function MealsPage() {
  const [mealSets, setMealSets] = useState<MealSet[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMealSetsAndItems()
  }, [])

  const loadMealSetsAndItems = async () => {
    try {
      // Fetch meal sets
      const mealSetsResponse = await fetch("/api/meal-sets")
      if (mealSetsResponse.ok) {
        const mealSetsData = await mealSetsResponse.json()
        setMealSets(mealSetsData)
      }

      // Fetch items
      const itemsResponse = await fetch("/api/items")
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load meal sets and items")
    } finally {
      setIsLoading(false)
    }
  }

  const groupItemsByCategory = (items: Item[]) => {
    return items.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push(item)
        return acc
      },
      {} as Record<string, Item[]>,
    )
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "20px" }}>Loading meal sets...</div>
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
          <button onClick={loadMealSetsAndItems} className="btn btn-primary">
            Try Again
          </button>
        </div>
        <Footer />
      </>
    )
  }

  const groupedItems = groupItemsByCategory(items)

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--primary-color) 0%, #8B0000 100%)",
          color: "var(--light-text)",
          padding: "80px 5%",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px", fontWeight: "700" }}>Our Meal Sets</h1>
          <p style={{ fontSize: "1.3rem", marginBottom: "40px", opacity: "0.9" }}>
            Carefully crafted meal combinations perfect for any occasion
          </p>
        </div>
      </section>

      {/* Meal Sets Section */}
      <section style={{ maxWidth: "1400px", margin: "60px auto", padding: "0 5%" }}>
        <h2
          style={{
            fontSize: "2.5rem",
            textAlign: "center",
            marginBottom: "50px",
            color: "var(--primary-color)",
          }}
        >
          Choose Your Perfect Meal Set
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "30px",
            marginBottom: "80px",
          }}
        >
          {mealSets.map((mealSet) => (
            <div
              key={mealSet.id}
              style={{
                backgroundColor: "var(--light-text)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 15px 35px var(--shadow-color)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)"
                e.currentTarget.style.boxShadow = "0 25px 50px var(--shadow-color)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 15px 35px var(--shadow-color)"
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${
                    mealSet.type === "premium" ? "#FFD700" : mealSet.type === "standard" ? "#4CAF50" : "#2196F3"
                  } 0%, ${
                    mealSet.type === "premium" ? "#FFA500" : mealSet.type === "standard" ? "#45a049" : "#1976D2"
                  } 100%)`,
                  color: "white",
                  padding: "30px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "1.8rem", marginBottom: "10px", fontWeight: "600" }}>{mealSet.name}</h3>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    marginBottom: "10px",
                  }}
                >
                  ₱{mealSet.price.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    opacity: "0.9",
                  }}
                >
                  {mealSet.type} Package
                </div>
              </div>

              <div style={{ padding: "30px" }}>
                <p
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.6",
                    color: "#666",
                    marginBottom: "20px",
                  }}
                >
                  {mealSet.description}
                </p>

                {mealSet.comment && (
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "15px",
                      borderRadius: "10px",
                      marginBottom: "20px",
                      borderLeft: "4px solid var(--primary-color)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        margin: "0",
                        fontStyle: "italic",
                      }}
                    >
                      {mealSet.comment}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    window.location.href = `/order-details?mealSetId=${mealSet.id}&mealSetName=${encodeURIComponent(mealSet.name)}&price=${mealSet.price}`
                  }}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  Order This Set
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Individual Items Section */}
      <section
        style={{
          backgroundColor: "#f8f9fa",
          padding: "80px 5%",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "2.5rem",
              textAlign: "center",
              marginBottom: "20px",
              color: "var(--primary-color)",
            }}
          >
            Individual Items
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              textAlign: "center",
              color: "#666",
              marginBottom: "50px",
            }}
          >
            Build your own custom meal with our individual items
          </p>

          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} style={{ marginBottom: "50px" }}>
              <h3
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "30px",
                  color: "var(--primary-color)",
                  textTransform: "capitalize",
                  borderBottom: "2px solid var(--primary-color)",
                  paddingBottom: "10px",
                }}
              >
                {category}
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "15px",
                      padding: "20px",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1.2rem",
                          margin: "0",
                          color: "var(--primary-color)",
                          fontWeight: "600",
                        }}
                      >
                        {item.name}
                      </h4>
                      <span
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: "700",
                          color: "var(--primary-color)",
                        }}
                      >
                        ₱{item.price.toFixed(2)}
                      </span>
                    </div>

                    {item.description && (
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          margin: "0",
                          lineHeight: "1.4",
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={() => {
                const itemsParam = encodeURIComponent(JSON.stringify(items))
                window.location.href = `/order-details?custom=true&items=${itemsParam}`
              }}
              className="btn btn-primary"
              style={{
                padding: "15px 40px",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Create Custom Order
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
