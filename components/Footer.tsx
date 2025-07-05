import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#333", color: "var(--light-text)", padding: "60px 5% 30px" }}>
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "40px",
        }}
      >
        <div>
          <Image
            src="/images/logo.png"
            alt="Saute and Simmer Logo"
            width={90}
            height={40}
            style={{ marginBottom: "20px" }}
          />
          <p style={{ marginBottom: "20px", lineHeight: "1.6", opacity: "0.8" }}>
            Saute and Simmer is a premium Filipino catering service dedicated to bringing authentic flavors to your
            events. We offer a variety of meal sets and custom options to suit your needs.
          </p>
          <div style={{ display: "flex", gap: "15px" }}>
            <a
              href="https://www.facebook.com/sauteandsimmercatering"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <i className="fab fa-facebook-f" style={{ color: "var(--light-text)", fontSize: "1.2rem" }}></i>
            </a>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: "1.3rem",
              marginBottom: "20px",
              position: "relative",
              paddingBottom: "10px",
              borderBottom: "2px solid var(--primary-color)",
              width: "fit-content",
            }}
          >
            Quick Links
          </h3>
          <ul style={{ listStyle: "none" }}>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/" style={{ color: "var(--light-text)", opacity: "0.8", textDecoration: "none" }}>
                Home
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/meals" style={{ color: "var(--light-text)", opacity: "0.8", textDecoration: "none" }}>
                Meal Sets
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/custom-meals" style={{ color: "var(--light-text)", opacity: "0.8", textDecoration: "none" }}>
                Custom Meals
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/orders" style={{ color: "var(--light-text)", opacity: "0.8", textDecoration: "none" }}>
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3
            style={{
              fontSize: "1.3rem",
              marginBottom: "20px",
              position: "relative",
              paddingBottom: "10px",
              borderBottom: "2px solid var(--primary-color)",
              width: "fit-content",
            }}
          >
            Services
          </h3>
          <ul style={{ listStyle: "none" }}>
            <li style={{ marginBottom: "10px", color: "var(--light-text)", opacity: "0.8" }}>Corporate Catering</li>
            <li style={{ marginBottom: "10px", color: "var(--light-text)", opacity: "0.8" }}>Wedding Catering</li>
            <li style={{ marginBottom: "10px", color: "var(--light-text)", opacity: "0.8" }}>Birthday Parties</li>
            <li style={{ marginBottom: "10px", color: "var(--light-text)", opacity: "0.8" }}>Family Gatherings</li>
            <li style={{ marginBottom: "10px", color: "var(--light-text)", opacity: "0.8" }}>Special Events</li>
          </ul>
        </div>

        <div>
          <h3
            style={{
              fontSize: "1.3rem",
              marginBottom: "20px",
              position: "relative",
              paddingBottom: "10px",
              borderBottom: "2px solid var(--primary-color)",
              width: "fit-content",
            }}
          >
            Contact Us
          </h3>
          <ul style={{ listStyle: "none" }}>
            <li style={{ marginBottom: "15px", display: "flex", alignItems: "flex-start" }}>
              <i className="fas fa-map-marker-alt" style={{ marginRight: "10px", color: "var(--primary-light)" }}></i>
              <span>Buenavista, San Fernando, Camarines Sur, Bicol 4415 San Fernando, Philippines</span>
            </li>
            <li style={{ marginBottom: "15px", display: "flex", alignItems: "flex-start" }}>
              <i className="fas fa-phone-alt" style={{ marginRight: "10px", color: "var(--primary-light)" }}></i>
              <span>+63 917 500 6429</span>
            </li>
            <li style={{ marginBottom: "15px", display: "flex", alignItems: "flex-start" }}>
              <i className="fas fa-envelope" style={{ marginRight: "10px", color: "var(--primary-light)" }}></i>
              <span>ssquaredcateringservices@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
          opacity: "0.7",
          fontSize: "0.9rem",
        }}
      >
        <p>&copy; 2025 Abad | Bathan | Nepomuceno | Saute and Simmer. All rights reserved.</p>
      </div>
    </footer>
  )
}
