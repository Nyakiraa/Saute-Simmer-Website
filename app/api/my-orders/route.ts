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
    console.log("Verifying user token...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!user) {
      console.log("No user found from token")
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    console.log("User authenticated:", user.email)

    // Check if user is admin
    const adminEmails = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
    const isAdmin = adminEmails.includes(user.email || "")
    console.log("User is admin:", isAdmin)

    // Get customer record
    let customer = null
    if (!isAdmin) {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("email", user.email)
        .single()

      if (customerError) {
        console.error("Customer lookup error:", customerError)
        return NextResponse.json({ error: "Customer record not found" }, { status: 404 })
      }
      customer = customerData
    }

    // Start with a simple orders query
    console.log("Fetching orders...")
    let ordersQuery = supabase.from("orders").select("*")

    // If not admin, filter by customer
    if (!isAdmin && customer) {
      ordersQuery = ordersQuery.eq("customer_id", customer.id)
    }

    // Order by creation date (newest first)
    ordersQuery = ordersQuery.order("created_at", { ascending: false })

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error("Orders query error:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders", details: ordersError.message }, { status: 500 })
    }

    console.log("Orders fetched successfully:", orders?.length || 0)

    // Now fetch related data for each order
    const enrichedOrders = []

    for (const order of orders || []) {
      try {
        // Get catering service
        const { data: cateringService } = await supabase
          .from("catering_services")
          .select("*")
          .eq("order_id", order.id)
          .single()

        // Get location
        const { data: location } = await supabase
          .from("locations")
          .select("*")
          .eq("id", cateringService?.location_id)
          .single()

        // Get payment
        const { data: payment } = await supabase.from("payments").select("*").eq("order_id", order.id).single()

        enrichedOrders.push({
          ...order,
          catering_service: cateringService || null,
          location: location || null,
          payment: payment || null,
        })
      } catch (error) {
        console.error("Error enriching order:", order.id, error)
        // Still include the order even if related data fails
        enrichedOrders.push({
          ...order,
          catering_service: null,
          location: null,
          payment: null,
        })
      }
    }

    return NextResponse.json({
      success: true,
      orders: enrichedOrders,
      isAdmin,
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
