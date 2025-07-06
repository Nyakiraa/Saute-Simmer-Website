import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify the JWT token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("Authenticated user:", user.email)

    // Check if user is admin
    const adminEmails = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
    const isAdmin = adminEmails.includes(user.email || "")

    console.log("User is admin:", isAdmin)

    let ordersQuery

    if (isAdmin) {
      // Admin can see all orders
      ordersQuery = supabase
        .from("orders")
        .select(`
          *,
          customers!inner(
            id,
            name,
            email
          )
        `)
        .order("created_at", { ascending: false })
    } else {
      // Regular users can only see their own orders
      // First, find the customer record for this user
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("email", user.email)
        .single()

      if (customerError || !customer) {
        console.log("No customer record found for user:", user.email)
        return NextResponse.json({
          orders: [],
          isAdmin: false,
          message: "No customer record found",
        })
      }

      console.log("Found customer ID:", customer.id)

      ordersQuery = supabase
        .from("orders")
        .select(`
          *,
          customers!inner(
            id,
            name,
            email
          )
        `)
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error("Orders query error:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    console.log("Found orders:", orders?.length || 0)

    // Transform the data to match the expected format
    const transformedOrders =
      orders?.map((order) => ({
        id: order.id,
        customer_id: order.customer_id,
        customer_name: order.customers?.name || "Unknown Customer",
        total_amount: order.total_amount || 0,
        status: order.status || "pending",
        order_date: order.order_date || order.created_at,
        delivery_date: order.delivery_date,
        delivery_address: order.delivery_address,
        special_instructions: order.special_instructions,
        created_at: order.created_at,
        // Add placeholder data for missing relationships
        catering_service: null,
        location: null,
        payment: null,
      })) || []

    return NextResponse.json({
      orders: transformedOrders,
      isAdmin,
      total: transformedOrders.length,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
