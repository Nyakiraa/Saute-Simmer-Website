"use client"

import { useState, useEffect } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import Link from "next/link"

interface MealSet {
  id: number
  name: string
  type: "premium" | "standard" | "basic"
  price: number
  description: string
  items: any[]
  comment?: string
}

export default function MealsPage() {
  const [mealSets, setMealSets] = useState<MealSet[]>([])
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedMeal, setSelectedMeal] = useState<MealSet | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMealSets()
  }, [])

  const loadMealSets = async () => {
    try {
      const response = await fetch("/api/meal-sets")
      if (response.ok) {
        const data = await response.json()
        setMealSets(data)
      }
    } catch (error) {
      console.error("Error loading meal sets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMeals =
    selectedFilter === "all"
      ? mealSets
      : mealSets.filter((meal) => {
          if (selectedFilter === "premium") return meal.type === "premium"
          if (selectedFilter === "standard") return meal.type === "standard"
          if (selectedFilter === "basic") return meal.type === "basic"
          return true
        })

  const openModal = (meal: MealSet) => {
    setSelectedMeal(meal)
    setIsModalOpen(true)
    setQuantity(1)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMeal(null)
  }

  const handleSelectSet = (mealId: number) => {
    window.location.href = `/orders?set=${mealId}&quantity=${quantity}`
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

  return (
    <>
      <Header />

      {/* Page Header */}
      <section
        style={{
          background: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/mealsets.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "var(--light-text)",
          padding: "80px 5%",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Our Meal Sets</h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "0", opacity: "0.9" }}>
            Choose from our carefully curated meal sets for your next event.
          </p>
        </div>
      </section>

      {/* Meal Sets Section */}
      <section style={{ padding: "60px 5%" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Type Filter */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px", flexWrap: "wrap" }}>
            {[
              { value: "all", label: "All Sets" },
              { value: "premium", label: "Premium" },
              { value: "standard", label: "Standard" },
              { value: "basic", label: "Basic" },
            ].map((filter) => (
              <div
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                style={{
                  padding: "10px 25px",
                  margin: "5px 10px",
                  backgroundColor: selectedFilter === filter.value ? "var(--primary-color)" : "var(--light-text)",
                  color: selectedFilter === filter.value ? "var(--light-text)" : "var(--text-color)",
                  border: "2px solid var(--primary-color)",
                  borderRadius: "50px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {filter.label}
              </div>
            ))}
          </div>

          {/* Meal Sets Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "30px",
            }}
          >
            {filteredMeals.map((meal) => (
              <div
                key={meal.id}
                style={{
                  backgroundColor: "var(--light-text)",
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 10px 20px var(--shadow-color)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                {/* Meal Set Header */}
                <div
                  style={{
                    background: "linear-gradient(to right, var(--primary-color), var(--primary-dark))",
                    color: "var(--light-text)",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <h2 style={{ fontSize: "1.8rem", marginBottom: "5px" }}>{meal.name}</h2>
                  <div style={{ fontSize: "2rem", fontWeight: "700" }}>₱{meal.price}</div>
                  <div style={{ fontSize: "0.9rem", opacity: "0.8", textTransform: "capitalize" }}>{meal.type}</div>
                </div>

                {/* Meal Set Content */}
                <div style={{ padding: "25px", textAlign: "center" }}>
                  <p style={{ marginBottom: "20px", color: "#666", lineHeight: "1.6" }}>{meal.description}</p>

                  {meal.comment && (
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--accent-color)",
                        fontStyle: "italic",
                        marginBottom: "15px",
                        padding: "10px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                      }}
                    >
                      {meal.comment}
                    </div>
                  )}
                </div>

                {/* Meal Set Footer */}
                <div
                  style={{
                    padding: "0 25px 25px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() => openModal(meal)}
                    className="btn btn-outline"
                    style={{ fontSize: "0.9rem", padding: "8px 16px" }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleSelectSet(meal.id)}
                    className="btn btn-primary"
                    style={{ fontSize: "0.9rem", padding: "8px 16px" }}
                  >
                    <i className="fas fa-check" style={{ marginRight: "5px" }}></i>
                    Select This Set
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Meal CTA */}
          <div
            style={{
              backgroundColor: "var(--light-text)",
              borderRadius: "15px",
              padding: "40px",
              textAlign: "center",
              marginTop: "60px",
              boxShadow: "0 10px 20px var(--shadow-color)",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                marginBottom: "15px",
                color: "var(--primary-color)",
              }}
            >
              Create Your Own Custom Meal
            </h2>
            <p
              style={{
                maxWidth: "600px",
                margin: "0 auto 30px",
                color: "#666",
                lineHeight: "1.6",
              }}
            >
              Can't find exactly what you're looking for? Design your own custom meal by selecting individual items from
              our extensive menu.
            </p>
            <Link href="/custom-meals" className="btn btn-primary">
              Create Custom Meal
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedMeal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1000,
            overflowY: "auto",
            padding: "50px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--light-text)",
              maxWidth: "800px",
              margin: "0 20px",
              borderRadius: "15px",
              overflow: "hidden",
              animation: "modalFadeIn 0.3s ease",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(to right, var(--primary-color), var(--primary-dark))",
                color: "var(--light-text)",
                padding: "20px 30px",
                position: "relative",
                textAlign: "center",
              }}
            >
              <h2 style={{ fontSize: "2rem", marginBottom: "5px" }}>{selectedMeal.name}</h2>
              <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>₱{selectedMeal.price}</div>
              <button
                onClick={closeModal}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  fontSize: "1.5rem",
                  color: "var(--light-text)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "30px", textAlign: "center" }}>
              <p style={{ fontSize: "1.1rem", marginBottom: "20px", color: "#666", lineHeight: "1.6" }}>
                {selectedMeal.description}
              </p>

              {selectedMeal.comment && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "var(--secondary-color)",
                    borderRadius: "10px",
                    fontWeight: "600",
                    color: "var(--primary-color)",
                    textAlign: "center",
                    border: "2px dashed var(--primary-color)",
                  }}
                >
                  <i className="fas fa-info-circle" style={{ marginRight: "10px" }}></i>
                  {selectedMeal.comment}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "20px 30px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontWeight: "500" }}>Quantity:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  min="1"
                  max="500"
                  style={{
                    width: "60px",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontFamily: "Poppins, sans-serif",
                  }}
                />
              </div>

              <button
                onClick={() => handleSelectSet(selectedMeal.id)}
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <i className="fas fa-check"></i>
                Select This Set
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
