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
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .single()

    if (customerError && !isAdmin) {
      console.error("Customer lookup error:", customerError)
      return NextResponse.json({ error: "Customer record not found" }, { status: 404 })
    }

    let ordersQuery = supabase.from("orders").select(`
      *,
      catering_services!inner(
        id,
        event_type,
        guest_count,
        location,
        special_requests
      ),
      locations(
        id,
        name,
        address,
        city,
        state,
        country
      ),
      payments(
        id,
        amount,
        payment_method,
        payment_status,
        transaction_id,
        payment_date
      )
    `)

    // If not admin, filter by customer
    if (!isAdmin && customer) {
      ordersQuery = ordersQuery.eq("customer_id", customer.id)
    }

    // Order by creation date (newest first)
    ordersQuery = ordersQuery.order("created_at", { ascending: false })

    console.log("Executing orders query...")
    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error("Orders query error:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    console.log("Orders fetched successfully:", orders?.length || 0)

    // Transform the data to match the expected format
    const transformedOrders = orders?.map((order) => ({
      ...order,
      catering_service: order.catering_services?.[0] || null,
      location: order.locations?.[0] || null,
      payment: order.payments?.[0] || null,
    }))

    return NextResponse.json({
      success: true,
      orders: transformedOrders || [],
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
