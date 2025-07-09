import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    // Validate required fields
    const { customer_name, total_amount } = body

    if (!customer_name || !total_amount) {
      return NextResponse.json({ error: "Missing required fields: customer_name, total_amount" }, { status: 400 })
    }

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: body.customer_id || null,
        customer_name,
        items: body.items || [],
        total_amount,
        status: body.status || "pending",
        order_date: body.order_date || new Date().toISOString().split("T")[0],
        delivery_date: body.delivery_date || null,
        delivery_address: body.delivery_address || null,
        special_instructions: body.special_instructions || null,
        payment_method: body.payment_method || null,
        customer_email: body.customer_email || null,
        order_type: body.order_type || "meal_set",
        meal_set_id: body.meal_set_id || null,
        meal_set_name: body.meal_set_name || null,
        event_type: body.event_type || null,
        event_date: body.event_date || null,
        contact_person: body.contact_person || null,
        contact_number: body.contact_number || null,
        special_requests: body.special_requests || null,
        quantity: body.quantity || 1,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
