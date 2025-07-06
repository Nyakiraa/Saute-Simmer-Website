import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get the current user from the session
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))

    if (userError || !user) {
      console.error("User authentication failed:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching orders for user:", user.email)

    // Try to get orders by customer email first
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        *,
        payments (
          id,
          amount,
          payment_method,
          transaction_id,
          payment_date,
          status
        )
      `)
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders", details: ordersError }, { status: 500 })
    }

    console.log(`Found ${orders?.length || 0} orders for user`)

    return NextResponse.json({
      orders: orders || [],
      user: {
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
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
