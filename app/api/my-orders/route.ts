import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    console.log("Fetching orders for user:", user.email)

    // Check if user is admin
    const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
    const isAdmin = allowedAdmins.includes(user.email || "")

    let orders = []

    if (isAdmin) {
      // Admin: Get all orders
      console.log("Admin user - fetching all orders")

      // Try to get from catering_services table first
      const { data: cateringServices, error: cateringError } = await supabase
        .from("catering_services")
        .select("*")
        .order("created_at", { ascending: false })

      if (cateringError) {
        console.error("Error fetching catering services:", cateringError)
      } else {
        orders = cateringServices || []
        console.log("Found catering services:", orders.length)
      }

      // Also try to get from orders table if it exists
      const { data: regularOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (!ordersError && regularOrders) {
        orders = [...orders, ...regularOrders]
        console.log("Added regular orders, total:", orders.length)
      }
    } else {
      // Regular user: Get their orders only
      console.log("Regular user - fetching user orders")

      // First, find the customer record
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("email", user.email)
        .single()

      if (customerError) {
        console.log("No customer record found, checking for orders by email")

        // Try to find orders directly by email in catering_services
        const { data: servicesByEmail, error: servicesError } = await supabase
          .from("catering_services")
          .select("*")
          .ilike("customer_name", `%${user.email}%`)
          .order("created_at", { ascending: false })

        if (!servicesError && servicesByEmail) {
          orders = servicesByEmail
        }
      } else {
        // Get orders for this customer
        const { data: customerOrders, error: ordersError } = await supabase
          .from("catering_services")
          .select("*")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false })

        if (!ordersError && customerOrders) {
          orders = customerOrders
        }
      }
    }

    console.log("Final orders count:", orders.length)

    return NextResponse.json({
      orders: orders,
      isAdmin: isAdmin,
      userEmail: user.email,
    })
  } catch (error) {
    console.error("Error in my-orders API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
