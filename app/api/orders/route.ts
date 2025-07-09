import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        ),
        meal_sets (
          id,
          name,
          type,
          price
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Transform the data to flatten the relationships
    const transformedOrders =
      orders?.map((order) => ({
        ...order,
        customer_name: order.customers?.name || "Unknown Customer",
        customer_email: order.customers?.email || "",
        customer_phone: order.customers?.phone || "",
        meal_set_name: order.meal_sets?.name || null,
        meal_set_type: order.meal_sets?.type || null,
        meal_set_price: order.meal_sets?.price || null,
      })) || []

    return NextResponse.json(transformedOrders)
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
    const { customer_id, meal_set_id, total_amount, delivery_date, delivery_time, location, guest_count } = body

    if (!customer_id || !meal_set_id || !total_amount) {
      return NextResponse.json(
        { error: "Missing required fields: customer_id, meal_set_id, total_amount" },
        { status: 400 },
      )
    }

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id,
        meal_set_id,
        total_amount,
        delivery_date,
        delivery_time,
        location,
        guest_count,
        special_requests: body.special_requests || null,
        status: "pending",
      })
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        ),
        meal_sets (
          id,
          name,
          type,
          price
        )
      `)
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create corresponding payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      customer_id: customer_id,
      amount: total_amount,
      payment_method: body.payment_method || "pending",
      status: "pending",
      payment_date: new Date().toISOString().split("T")[0],
      notes: `Payment for Order #${order.id}`,
    })

    if (paymentError) {
      console.error("Payment creation error:", paymentError)
      // Don't fail the order creation if payment record fails
    }

    // Transform the response
    const transformedOrder = {
      ...order,
      customer_name: order.customers?.name || "Unknown Customer",
      customer_email: order.customers?.email || "",
      customer_phone: order.customers?.phone || "",
      meal_set_name: order.meal_sets?.name || null,
      meal_set_type: order.meal_sets?.type || null,
      meal_set_price: order.meal_sets?.price || null,
    }

    return NextResponse.json(transformedOrder, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
