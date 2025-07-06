import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== My Orders API Called ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header")
      return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const supabase = createServerClient()

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("User authenticated:", user.email)

    // Check if user is admin
    const adminEmails = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
    const isAdmin = adminEmails.includes(user.email || "")
    console.log("User is admin:", isAdmin)

    // Get customer record
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .single()

    if (customerError || !customer) {
      console.error("Customer lookup error:", customerError)
      return NextResponse.json({ error: "Customer record not found" }, { status: 404 })
    }

    console.log("Customer found:", customer.name)

    // Build query for orders with related data
    let query = supabase.from("orders").select(`
        *,
        payments (
          id,
          amount,
          payment_method,
          payment_status,
          transaction_id,
          payment_date
        ),
        locations (
          id,
          name,
          address,
          city,
          state,
          country
        )
      `)

    // If not admin, filter by customer_id
    if (!isAdmin) {
      query = query.eq("customer_id", customer.id)
    }

    // Order by creation date (newest first)
    query = query.order("created_at", { ascending: false })

    const { data: orders, error: ordersError } = await query

    if (ordersError) {
      console.error("Orders query error:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Get catering services for each order
    const orderIds = orders?.map((order) => order.id) || []
    let cateringServices = []

    if (orderIds.length > 0) {
      const { data: services, error: servicesError } = await supabase
        .from("catering_services")
        .select("*")
        .in("order_id", orderIds)

      if (!servicesError) {
        cateringServices = services || []
      }
    }

    // Combine orders with their catering services
    const ordersWithServices =
      orders?.map((order) => {
        const service = cateringServices.find((s) => s.order_id === order.id)
        return {
          ...order,
          catering_service: service || null,
          payment: Array.isArray(order.payments) ? order.payments[0] : order.payments,
          location: Array.isArray(order.locations) ? order.locations[0] : order.locations,
        }
      }) || []

    console.log("Orders fetched successfully:", ordersWithServices.length)

    return NextResponse.json({
      success: true,
      orders: ordersWithServices,
      isAdmin: isAdmin,
      customer: customer,
    })
  } catch (error) {
    console.error("=== My Orders API Error ===")
    console.error("Error details:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
