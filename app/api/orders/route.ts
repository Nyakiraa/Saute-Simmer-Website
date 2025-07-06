import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

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
    if (!body.quantity || !body.eventType || !body.eventDate || !body.deliveryAddress || !body.paymentMethod) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["quantity", "eventType", "eventDate", "deliveryAddress", "paymentMethod"],
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
    } else {
      // Create new customer
      const { data: newCustomer, error: customerCreateError } = await supabase
        .from("customers")
        .insert([
          {
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Unknown",
            email: user.email,
            phone: body.contactNumber || null,
            address: body.deliveryAddress,
          },
        ])
        .select()
        .single()

      if (customerCreateError) {
        console.error("Error creating customer:", customerCreateError)
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
      }
      customer = newCustomer
    }

    // Create the order
    const orderData = {
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      order_type: "custom",
      quantity: body.quantity,
      total_amount: 0, // Will be calculated based on items
      event_type: body.eventType,
      event_date: body.eventDate,
      delivery_address: body.deliveryAddress,
      contact_person: body.contactPerson || customer.name,
      contact_number: body.contactNumber,
      payment_method: body.paymentMethod, // This should save the actual payment method
      special_requests: body.specialRequests,
      status: "pending",
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
      customer_id: customer.id,
      customer_name: customer.name,
      order_id: order.id,
      amount: order.total_amount,
      payment_method: body.paymentMethod, // Save the actual payment method here too
      status: "pending",
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
