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

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))

    if (userError || !user) {
      console.error("User authentication failed:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Creating custom order with data:", body)

    // Validate required fields
    if (!body.quantity || !body.event_type || !body.event_date || !body.delivery_address || !body.payment_method) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["quantity", "event_type", "event_date", "delivery_address", "payment_method"],
          received: Object.keys(body),
        },
        { status: 400 },
      )
    }

    // First, ensure customer exists
    let customer
    const { data: existingCustomer, error: customerFetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .single()

    if (customerFetchError && customerFetchError.code !== "PGRST116") {
      console.error("Error fetching customer:", customerFetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingCustomer) {
      customer = existingCustomer
      console.log("Found existing customer:", customer.id)
    } else {
      // Create new customer
      const customerData = {
        name:
          body.contact_person ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Unknown",
        email: user.email,
        phone: body.contact_number || null,
        address: body.delivery_address,
      }

      console.log("Creating new customer:", customerData)

      const { data: newCustomer, error: customerCreateError } = await supabase
        .from("customers")
        .insert([customerData])
        .select()
        .single()

      if (customerCreateError) {
        console.error("Error creating customer:", customerCreateError)
        return NextResponse.json({ error: "Failed to create customer", details: customerCreateError }, { status: 500 })
      }
      customer = newCustomer
      console.log("Created new customer:", customer.id)
    }

    // Calculate total amount for custom order (this would be based on selected items)
    let totalAmount = 0
    if (body.selected_items) {
      // Calculate based on selected items
      Object.values(body.selected_items).forEach((categoryItems: any) => {
        if (Array.isArray(categoryItems)) {
          categoryItems.forEach((item: any) => {
            totalAmount += item.price || 0
          })
        }
      })
    }
    totalAmount = totalAmount * body.quantity

    // Create the order
    const orderData = {
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      order_type: "custom",
      quantity: body.quantity,
      total_amount: totalAmount,
      event_type: body.event_type,
      event_date: body.event_date,
      delivery_address: body.delivery_address,
      contact_person: body.contact_person || customer.name,
      contact_number: body.contact_number,
      payment_method: body.payment_method,
      special_requests: body.special_requests,
      status: "pending",
      order_date: new Date().toISOString().split("T")[0],
      items: body.selected_items ? JSON.stringify(body.selected_items) : "[]",
    }

    console.log("Inserting order with data:", orderData)

    const { data: order, error: orderError } = await supabase.from("orders").insert([orderData]).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order", details: orderError }, { status: 500 })
    }

    console.log("Order created successfully:", order)

    // Create payment record
    const paymentData = {
      order_id: order.id,
      customer_id: customer.id,
      customer_name: customer.name,
      amount: totalAmount,
      payment_method: body.payment_method,
      transaction_id: `TXN-${order.id}-${Date.now()}`,
      payment_date: new Date().toISOString(),
    }

    console.log("Creating payment record:", paymentData)

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single()

    if (paymentError) {
      console.error("Error creating payment:", paymentError)
      // Don't fail the order creation if payment record fails
    }

    return NextResponse.json(
      {
        success: true,
        order,
        payment,
        message: "Custom order created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating custom order:", error)
    return NextResponse.json({ error: "Failed to create order", details: error }, { status: 500 })
  }
}
