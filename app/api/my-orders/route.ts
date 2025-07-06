import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const token = authHeader.replace("Bearer ", "")

    // Get the current user from the session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error("User authentication failed:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching orders for user:", user.email)

    // Check if user is admin
    const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
    const isAdmin = allowedAdmins.includes(user.email || "")

    console.log("User is admin:", isAdmin)

    // Try to fetch from catering_services table first (this is what we know exists)
    let cateringServices = []
    try {
      if (isAdmin) {
        // Admin sees all catering services
        const { data, error } = await supabase
          .from("catering_services")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching catering services:", error)
        } else {
          cateringServices = data || []
          console.log("Found catering services:", cateringServices.length)
        }
      } else {
        // Regular users - try to find their catering services
        // First try by customer_id if we can find their customer record
        const { data: customer } = await supabase.from("customers").select("id").eq("email", user.email).single()

        if (customer) {
          const { data, error } = await supabase
            .from("catering_services")
            .select("*")
            .eq("customer_id", customer.id)
            .order("created_at", { ascending: false })

          if (!error && data) {
            cateringServices = data
          }
        }

        // If no results, try to find by customer_name containing email
        if (cateringServices.length === 0) {
          const { data, error } = await supabase
            .from("catering_services")
            .select("*")
            .ilike("customer_name", `%${user.email}%`)
            .order("created_at", { ascending: false })

          if (!error && data) {
            cateringServices = data
          }
        }
      }
    } catch (error) {
      console.error("Error fetching catering services:", error)
    }

    // Try to fetch from orders table if it exists
    let orders = []
    try {
      if (isAdmin) {
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

        if (!error && data) {
          orders = data
          console.log("Found orders:", orders.length)
        }
      } else {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false })

        if (!error && data) {
          orders = data
        }
      }
    } catch (error) {
      console.error("Orders table might not exist:", error)
    }

    // Combine all results
    const allOrders = [
      ...orders.map((order) => ({ ...order, type: "order" })),
      ...cateringServices.map((service) => ({ ...service, type: "catering_service" })),
    ]

    console.log("Total orders found:", allOrders.length)

    return NextResponse.json({
      orders: allOrders,
      isAdmin,
      user: {
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
      },
      debug: {
        ordersCount: orders.length,
        cateringServicesCount: cateringServices.length,
        totalCount: allOrders.length,
      },
    })
  } catch (error) {
    console.error("Error in my-orders API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
