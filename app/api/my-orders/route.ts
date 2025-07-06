import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get the current user from the session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))

    if (userError || !user) {
      console.error("User authentication failed:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching orders for user:", user.email)

    // Check if user is admin
    const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
    const isAdmin = allowedAdmins.includes(user.email || "")

    let ordersQuery
    if (isAdmin) {
      // Admin sees all orders
      ordersQuery = supabase
        .from("orders")
        .select(`
          *,
          customers (
            name,
            email
          )
        `)
        .order("created_at", { ascending: false })
    } else {
      // Regular users see only their orders
      ordersQuery = supabase
        .from("orders")
        .select(`
          *,
          customers (
            name,
            email
          )
        `)
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false })
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders", details: ordersError }, { status: 500 })
    }

    console.log("Orders fetched successfully:", orders?.length || 0)

    // Also fetch catering services for backward compatibility
    let cateringQuery
    if (isAdmin) {
      cateringQuery = supabase.from("catering_services").select("*").order("created_at", { ascending: false })
    } else {
      cateringQuery = supabase
        .from("catering_services")
        .select("*")
        .eq("customer_name", user.user_metadata?.full_name || user.email)
        .order("created_at", { ascending: false })
    }

    const { data: cateringServices, error: cateringError } = await cateringQuery

    if (cateringError) {
      console.error("Error fetching catering services:", cateringError)
    }

    // Combine orders and catering services
    const allOrders = [
      ...(orders || []),
      ...(cateringServices || []).map((service) => ({
        ...service,
        type: "catering_service",
      })),
    ]

    return NextResponse.json({
      orders: allOrders,
      isAdmin,
      user: {
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
      },
    })
  } catch (error) {
    console.error("Error in my-orders API:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
