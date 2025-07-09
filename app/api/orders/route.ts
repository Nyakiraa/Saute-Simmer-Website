import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

    // Create or get customer
    let customerId = body.customer_id
    if (!customerId && body.customer_email) {
      // Try to find existing customer by email
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
            name: body.customer_name || body.contact_person,
            email: body.customer_email,
            phone: body.contact_number || body.phone || "",
            address: body.delivery_address || "",
          })
          .select("id")
          .single()

        if (customerError) {
          console.error("Error creating customer:", customerError)
        } else {
          customerId = newCustomer?.id
        }
      }
    }

    // Create location record for delivery address
    let locationId = null
    if (body.delivery_address) {
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .insert({
          name: `${body.customer_name || body.contact_person}'s Location`,
          address: body.delivery_address,
          phone: body.contact_number || body.phone || "Not provided",
          status: "active",
          country: "Philippines",
        })
        .select("id")
        .single()

      if (locationError) {
        console.error("Error creating location:", locationError)
      } else {
        locationId = location?.id
        console.log("Created location with phone:", body.contact_number || body.phone)
      }
    }

    // Create the order
    const orderData = {
      customer_id: customerId,
      customer_name: body.customer_name || body.contact_person,
      customer_email: body.customer_email,
      items: body.items || [],
      total_amount: body.total_amount,
      status: "pending",
      order_date: body.order_date || new Date().toISOString().split("T")[0],
      order_type: body.order_type || "meal_set",
      meal_set_id: body.meal_set_id,
      meal_set_name: body.meal_set_name,
      quantity: body.quantity || 1,
      event_type: body.event_type,
      event_date: body.event_date,
      delivery_date: body.delivery_date || body.event_date,
      delivery_address: body.delivery_address,
      contact_person: body.contact_person,
      contact_number: body.contact_number || body.phone,
      payment_method: body.payment_method,
      special_requests: body.special_requests,
      special_instructions: body.special_instructions,
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order", details: orderError }, { status: 500 })
    }

    // Create catering service record if this is an event order
    if (body.event_type && body.event_date && order) {
      const cateringData = {
        customer_id: customerId,
        customer_name: body.customer_name || body.contact_person,
        event_type: body.event_type,
        event_date: body.event_date,
        guest_count: body.quantity || 1,
        status: "pending",
        location: body.delivery_address,
        special_requests: body.special_requests,
        order_id: order.id,
        location_id: locationId,
        payment_method: body.payment_method,
      }

      const { error: cateringError } = await supabase.from("catering_services").insert(cateringData)

      if (cateringError) {
        console.error("Error creating catering service:", cateringError)
      }
    }

    // Create payment record
    if (body.payment_method && order) {
      const paymentData = {
        customer_id: customerId,
        customer_name: body.customer_name || body.contact_person,
        amount: body.total_amount,
        payment_method: body.payment_method,
        status: "pending",
        order_id: order.id,
        payment_date: new Date().toISOString(),
      }

      const { error: paymentError } = await supabase.from("payments").insert(paymentData)

      if (paymentError) {
        console.error("Error creating payment record:", paymentError)
      }
    }

    console.log("Order created successfully:", order)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
