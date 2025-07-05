"use client"

import { useState, useEffect } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Link from "next/link"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    {
      title: "Authentic Filipino Catering",
      description:
        "Experience the rich flavors of Filipino cuisine with our premium catering services. Perfect for corporate events, celebrations, and gatherings.",
    },
    {
      title: "Create Your Perfect Menu",
      description:
        "Customize your catering experience with our flexible meal options. Mix and match dishes to create the perfect menu for your event.",
    },
    {
      title: "Hassle-Free Catering",
      description:
        "We handle everything from preparation to delivery. Focus on your event while we take care of the food.",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <>
      <Header />

      {/* Hero Section with Slideshow */}
      <section style={{ position: "relative", height: "500px", overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: index === currentSlide ? 1 : 0,
                transition: "opacity 1s ease",
                backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/images/home.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  color: "var(--light-text)",
                  maxWidth: "800px",
                  padding: "0 20px",
                  transform: index === currentSlide ? "translateY(0)" : "translateY(30px)",
                  opacity: index === currentSlide ? 1 : 0,
                  transition: "all 1s ease 0.5s",
                }}
              >
                <h1
                  style={{
                    fontSize: "3rem",
                    marginBottom: "20px",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "'Cinzel Decorative', serif",
                    fontWeight: "700",
                  }}
                >
                  {slide.title}
                </h1>
                <p
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "30px",
                    textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {slide.description}
                </p>
              </div>
            </div>
          ))}

          <div
            style={{
              position: "absolute",
              width: "100%",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              justifyContent: "space-between",
              padding: "0 30px",
              zIndex: 10,
            }}
          >
            <div
              onClick={prevSlide}
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <i className="fas fa-chevron-left" style={{ color: "var(--light-text)", fontSize: "1.5rem" }}></i>
            </div>
            <div
              onClick={nextSlide}
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <i className="fas fa-chevron-right" style={{ color: "var(--light-text)", fontSize: "1.5rem" }}></i>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "80px 5%" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                color: "var(--primary-color)",
                marginBottom: "15px",
                position: "relative",
                display: "inline-block",
                fontFamily: "'Cinzel Decorative', serif",
                fontWeight: "700",
              }}
            >
              Our Services
              <span
                style={{
                  content: "",
                  position: "absolute",
                  width: "50%",
                  height: "3px",
                  backgroundColor: "var(--primary-color)",
                  bottom: "-10px",
                  left: "25%",
                }}
              ></span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--light-text)",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 10px 20px var(--shadow-color)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div
                style={{
                  height: "200px",
                  backgroundImage: "url(/images/slide1.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <div style={{ padding: "25px" }}>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "var(--primary-color)" }}>
                  Fixed Meal Sets
                </h3>
                <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
                  Choose from our carefully curated meal sets designed to satisfy different tastes and budgets. Each set
                  includes a balanced selection of Filipino dishes.
                </p>
                <Link href="/meals" className="btn btn-outline">
                  Browse Meal Sets
                </Link>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--light-text)",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 10px 20px var(--shadow-color)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div
                style={{
                  height: "200px",
                  backgroundImage: "url(/images/slide2.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <div style={{ padding: "25px" }}>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "var(--primary-color)" }}>
                  Custom Meals
                </h3>
                <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
                  Create your own perfect menu by selecting individual items from our extensive catalog. Mix and match
                  to create the perfect combination for your event.
                </p>
                <Link href="/custom-meals" className="btn btn-outline">
                  Create Custom Meal
                </Link>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--light-text)",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 10px 20px var(--shadow-color)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div
                style={{
                  height: "200px",
                  backgroundImage: "url(/images/slide3.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <div style={{ padding: "25px" }}>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "var(--primary-color)" }}>
                  Order Tracking
                </h3>
                <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
                  Keep track of your orders from confirmation to delivery. Get real-time updates on your order status
                  and delivery information.
                </p>
                <Link href="/orders" className="btn btn-outline">
                  Track Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Sets Section */}
      <section style={{ padding: "80px 5%", backgroundColor: "var(--secondary-color)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                color: "var(--primary-color)",
                marginBottom: "15px",
                fontFamily: "'Cinzel Decorative', serif",
                fontWeight: "700",
              }}
            >
              Popular Meal Sets
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px",
            }}
          >
            {/* Premium Meal Set Card */}
            <div
              style={{
                backgroundColor: "var(--light-text)",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 5px 15px var(--shadow-color)",
                display: "flex",
                flexDirection: "column",
                padding: "25px",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
              >
                <h3 style={{ fontSize: "1.5rem", color: "var(--primary-color)", fontWeight: "600", margin: 0 }}>
                  Premium Meal Set
                </h3>
                <div
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--light-text)",
                    padding: "5px 15px",
                    borderRadius: "50px",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  ₱635
                </div>
              </div>

              <div style={{ fontWeight: "600", color: "var(--accent-color)", marginBottom: "15px" }}>Includes:</div>

              <ul style={{ listStyle: "none", marginBottom: "20px", flexGrow: 1 }}>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  AM Snack with Juice/Soda
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Complete Lunch with 2 Main Courses
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  PM Snack with Juice/Soda
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Side Dish
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Dessert
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Free-flowing Coffee
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Complimentary Pica-pica
                </li>
              </ul>

              <Link
                href="/meals"
                className="btn btn-primary"
                style={{
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: "50px",
                  marginTop: "auto",
                  width: "100%",
                }}
              >
                View Details
              </Link>
            </div>

            {/* Standard Meal Set Card */}
            <div
              style={{
                backgroundColor: "var(--light-text)",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 5px 15px var(--shadow-color)",
                display: "flex",
                flexDirection: "column",
                padding: "25px",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
              >
                <h3 style={{ fontSize: "1.5rem", color: "var(--primary-color)", fontWeight: "600", margin: 0 }}>
                  Standard Meal Set
                </h3>
                <div
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--light-text)",
                    padding: "5px 15px",
                    borderRadius: "50px",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  ₱450
                </div>
              </div>

              <div style={{ fontWeight: "600", color: "var(--accent-color)", marginBottom: "15px" }}>Includes:</div>

              <ul style={{ listStyle: "none", marginBottom: "20px", flexGrow: 1 }}>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  AM Snack with Juice/Soda
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Lunch with Main Course
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  PM Snack with Juice/Soda
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Side Dish
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Dessert
                </li>
              </ul>

              <Link
                href="/meals"
                className="btn btn-primary"
                style={{
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: "50px",
                  marginTop: "auto",
                  width: "100%",
                }}
              >
                View Details
              </Link>
            </div>

            {/* Basic Meal Set Card */}
            <div
              style={{
                backgroundColor: "var(--light-text)",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 5px 15px var(--shadow-color)",
                display: "flex",
                flexDirection: "column",
                padding: "25px",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
              >
                <h3 style={{ fontSize: "1.5rem", color: "var(--primary-color)", fontWeight: "600", margin: 0 }}>
                  Basic Meal Set
                </h3>
                <div
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--light-text)",
                    padding: "5px 15px",
                    borderRadius: "50px",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  ₱379
                </div>
              </div>

              <div style={{ fontWeight: "600", color: "var(--accent-color)", marginBottom: "15px" }}>Includes:</div>

              <ul style={{ listStyle: "none", marginBottom: "20px", flexGrow: 1 }}>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  AM Snack with Juice/Soda
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Simple Lunch with Rice
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  PM Snack with Juice/Soda
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Side Dish
                </li>
                <li style={{ marginBottom: "8px", position: "relative", paddingLeft: "25px", fontSize: "0.95rem" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--primary-color)" }}>✓</span>
                  Dessert
                </li>
              </ul>

              <Link
                href="/meals"
                className="btn btn-primary"
                style={{
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: "50px",
                  marginTop: "auto",
                  width: "100%",
                }}
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "80px 5%", backgroundColor: "var(--secondary-color)", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "20px", color: "#333" }}>Ready to Order?</h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "30px", opacity: "0.9", color: "#333" }}>
            Choose from our fixed meal sets or create your own custom meal for your next event.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <Link href="/meals" className="btn btn-outline-light">
              Browse Meal Sets
            </Link>
            <Link href="/custom-meals" className="btn btn-outline-light">
              Create Custom Meal
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
