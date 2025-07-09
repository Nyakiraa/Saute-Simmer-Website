import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error in GET /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received order data:", body)

    // Validate required fields
    if (!body.customer_name || !body.total_amount) {
      return NextResponse.json({ error: "Missing required fields: customer_name, total_amount" }, { status: 400 })
    }

    // Create or find customer
    let customerId = null
    if (body.customer_email) {
      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", body.customer_email)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: body.customer_name,
            email: body.customer_email,
            phone: body.contact_number,
            address: body.delivery_address,
          })
          .select("id")
          .single()

        if (customerError) {
          console.error("Error creating customer:", customerError)
        } else {
          customerId = newCustomer.id
        }
      }
    }

    // Create location record for delivery address
    let locationId = null
    if (body.delivery_address) {
      const { data: newLocation, error: locationError } = await supabase
        .from("locations")
        .insert({
          name: `${body.customer_name}'s Location`,
          address: body.delivery_address,
          status: "active",
          country: "Philippines",
        })
        .select("id")
        .single()

      if (!locationError) {
        locationId = newLocation.id
        console.log("Created location:", locationId)
      } else {
        console.error("Error creating location:", locationError)
      }
    }

    // Create order
    const orderData = {
      customer_id: customerId,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      contact_number: body.contact_number,
      delivery_address: body.delivery_address,
      location_id: locationId, // Connect to location
      payment_method: body.payment_method,
      special_instructions: body.special_requests,
      items: body.items || [],
      total_amount: Number(body.total_amount),
      order_type: body.order_type || "custom",
      meal_set_id: body.meal_set_id || null,
      meal_set_name: body.meal_set_name || null,
      quantity: Number(body.quantity) || 1,
      status: "pending",
      order_date: new Date().toISOString(),
      event_type: body.event_type || null,
      event_date: body.event_date || null,
      contact_person: body.contact_person || body.customer_name,
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    console.log("Order created successfully:", order.id)

    // Create catering service record if this is a catering order or has event details
    if (body.order_type === "catering" || body.event_type || body.event_date) {
      const cateringData = {
        customer_id: customerId,
        customer_name: body.customer_name,
        event_type: body.event_type || "catering",
        event_date: body.event_date || new Date().toISOString().split("T")[0],
        guest_count: Number(body.guest_count) || Number(body.quantity) || 1,
        status: "pending",
        location: body.delivery_address || "To be determined",
        special_requests: body.special_requests || "",
        order_id: order.id, // Connect to order
        location_id: locationId, // Connect to location
        payment_method: body.payment_method,
      }

      const { data: cateringService, error: cateringError } = await supabase
        .from("catering_services")
        .insert(cateringData)
        .select()
        .single()

      if (cateringError) {
        console.error("Error creating catering service:", cateringError)
      } else {
        console.log("Created catering service:", cateringService.id)
      }
    }

    // Create payment record
    const paymentData = {
      customer_id: customerId,
      customer_name: body.customer_name,
      order_id: order.id,
      amount: Number(body.total_amount),
      payment_method: body.payment_method,
      status: "pending",
      payment_date: new Date().toISOString(),
      transaction_id: `TXN-${order.id}-${Date.now()}`,
    }

    const { data: payment, error: paymentError } = await supabase.from("payments").insert(paymentData).select().single()

    if (paymentError) {
      console.error("Error creating payment record:", paymentError)
    } else {
      console.log("Created payment record:", payment.id)
    }

    console.log("Order processing completed successfully")
    return NextResponse.json({
      success: true,
      order,
      location_id: locationId,
      catering_created: !!(body.order_type === "catering" || body.event_type || body.event_date),
    })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
