"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header>
      <div className="header-container">
        <div className="nav-container">
          <Link href="/">
            <Image src="/images/redlogo.png" alt="Saute and Simmer Logo" width={120} height={50} className="logo" />
          </Link>

          <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <li>
              <Link href="/" className={isActive("/") ? "active" : ""} onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/meals" className={isActive("/meals") ? "active" : ""} onClick={() => setIsMenuOpen(false)}>
                Meal Sets
              </Link>
            </li>
            <li>
              <Link
                href="/custom-meals"
                className={isActive("/custom-meals") ? "active" : ""}
                onClick={() => setIsMenuOpen(false)}
              >
                Custom Meals
              </Link>
            </li>
            <li>
              <Link href="/orders" className={isActive("/orders") ? "active" : ""} onClick={() => setIsMenuOpen(false)}>
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        <div className="profile-dropdown">
          <div className="profile-icon">
            <i className="fas fa-user"></i>
          </div>
          <div className="dropdown-content">
            <Link href="/login">Log Out</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
