import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    console.log("Creating new order:", body)

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find or create customer record
    let customer
    const { data: existingCustomer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .single()

    if (customerError || !existingCustomer) {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          name: body.contact_person || user.user_metadata?.full_name || user.email,
          email: user.email,
          phone: body.contact_number || "",
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating customer:", createError)
        return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 })
      }
      customer = newCustomer
    } else {
      customer = existingCustomer
    }

    // Create order record
    const orderData = {
      customer_id: customer.id,
      customer_name: body.contact_person || customer.name,
      customer_email: user.email,
      order_type: body.order_type || "meal_set",
      meal_set_name: body.meal_set_name,
      quantity: body.quantity || 1,
      total_amount: body.total_amount || 0,
      event_type: body.event_type,
      event_date: body.event_date,
      delivery_address: body.delivery_address,
      contact_person: body.contact_person,
      contact_number: body.contact_number,
      payment_method: body.payment_method,
      special_requests: body.special_requests,
      status: "pending",
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create payment record if payment method is provided
    if (body.payment_method && body.total_amount > 0) {
      const paymentData = {
        order_id: order.id,
        amount: body.total_amount,
        payment_method: body.payment_method,
        transaction_id: `TXN-${order.id}-${Date.now()}`,
        payment_date: new Date().toISOString(),
      }

      const { error: paymentError } = await supabase.from("payments").insert(paymentData)

      if (paymentError) {
        console.error("Error creating payment record:", paymentError)
        // Don't fail the order creation if payment record fails
      }
    }

    console.log("Order created successfully:", order.id)

    return NextResponse.json({
      success: true,
      order: order,
      message: "Order placed successfully",
    })
  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get all orders (admin only)
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          name,
          email,
          phone
        ),
        payments (
          amount,
          payment_method,
          transaction_id,
          payment_date
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error("Error in orders GET API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
