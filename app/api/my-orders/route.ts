import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const supabase = createServerClient()

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    const adminEmails = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
    const isAdmin = adminEmails.includes(user.email || "")

    let orders

    if (isAdmin) {
      // Admin can see all orders
      const { data, error } = await supabase
        .from("catering_services")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching all orders:", error)
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
      }

      orders = data
    } else {
      // Regular users see only their orders
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("email", user.email)
        .single()

      if (customerError || !customer) {
        return NextResponse.json({ orders: [] })
      }

      const { data, error } = await supabase
        .from("catering_services")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching user orders:", error)
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
      }

      orders = data
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
